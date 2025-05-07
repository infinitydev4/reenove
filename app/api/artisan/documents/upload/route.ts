import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { uploadToS3, deleteFromS3, extractKeyFromS3Url, isS3Available } from "@/lib/s3"
import { updateOnboardingProgress } from "@/lib/onboarding"

// Suppression des logs de debug et variables inutiles
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null
    const title = formData.get('title') as string | null || type || "Document" // Utiliser le type comme titre par défaut si titre non fourni

    if (!file || !type) {
      return NextResponse.json({ error: "Fichier ou type manquant" }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Type de fichier non autorisé. Seuls les formats JPEG, PNG, WEBP et PDF sont acceptés." 
      }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "Le fichier est trop volumineux. Taille maximale: 5 MB." 
      }, { status: 400 })
    }

    // Vérifier si un document de ce type existe déjà pour cet artisan
    const existingDocument = await prisma.artisanDocument.findFirst({
      where: {
        userId,
        type,
      },
    })

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop() || ""
    const uniqueFileName = `${type}-${uuidv4()}.${fileExtension}`
    const s3Key = `documents/${userId}/${uniqueFileName}`

    // Convertir le fichier en ArrayBuffer puis en Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Si un document existe déjà, le supprimer de la base de données et de S3
    if (existingDocument) {
      // Supprimer le fichier S3 existant s'il y en a un
      if (existingDocument.fileUrl && existingDocument.fileUrl.includes('amazonaws.com')) {
        const existingKey = extractKeyFromS3Url(existingDocument.fileUrl)
        if (existingKey) {
          await deleteFromS3(existingKey)
        }
      }

      // Supprimer l'enregistrement dans la base de données
      await prisma.artisanDocument.delete({
        where: {
          id: existingDocument.id,
        },
      })
    }

    // Upload du fichier vers S3 avec le nouveau module
    const fileUrl = await uploadToS3(buffer, s3Key, file.type)
    
    // Fallback si S3 échoue ou n'est pas configuré
    const finalFileUrl = fileUrl || `http://${request.headers.get('host')}/api/mock-storage/${s3Key}`

    if (!fileUrl && isS3Available()) {
      console.error("Échec de l'upload S3 malgré une configuration valide")
      return NextResponse.json({ 
        error: "Erreur lors de l'upload sur AWS S3" 
      }, { status: 500 })
    }

    // Créer un nouvel enregistrement dans la base de données
    const document = await prisma.artisanDocument.create({
      data: {
        userId,
        type,
        title,
        fileUrl: finalFileUrl,
        fileType: file.type,
        verified: false,
      },
    })

    // Si c'est un document requis (KBIS ou INSURANCE), mettre à jour la progression de l'onboarding
    if (type === "KBIS" || type === "INSURANCE") {
      // Vérifier si l'autre document requis existe aussi
      const otherType = type === "KBIS" ? "INSURANCE" : "KBIS"
      const otherDocumentExists = await prisma.artisanDocument.findFirst({
        where: {
          userId,
          type: otherType,
        },
      })

      // Si les deux documents requis existent, mettre à jour la progression
      if (otherDocumentExists) {
        try {
          await updateOnboardingProgress(userId, 'documents')
        } catch (error) {
          console.error("Erreur lors de la mise à jour de la progression:", error)
          // Ne pas bloquer le processus en cas d'erreur
        }
      }
    }

    return NextResponse.json({
      success: true,
      fileUrl: finalFileUrl,
      document,
      id: document.id,
      name: file.name,
      type: document.type,
      url: document.fileUrl
    })
  } catch (error) {
    console.error("Erreur lors du téléversement du document:", error)
    return NextResponse.json(
      { error: "Erreur lors du téléversement du document" },
      { status: 500 }
    )
  }
} 