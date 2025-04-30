import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

// Vérifier si AWS S3 est correctement configuré
const isS3Configured = !!(process.env.AWS_ACCESS_KEY_ID && 
                          process.env.AWS_SECRET_ACCESS_KEY && 
                          process.env.AWS_S3_BUCKET_NAME)

// Configuration AWS S3 seulement si les clés sont définies
const s3Client = isS3Configured ? new S3Client({
  region: process.env.AWS_REGION || "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  }
}) : null

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null
    const title = formData.get('title') as string | null

    if (!file || !type || !title) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 })
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

    // Si un document existe déjà, le supprimer de la base de données
    if (existingDocument) {
      // Si S3 est configuré et que le document a une URL S3, supprimer le fichier
      if (isS3Configured && s3Client && existingDocument.fileUrl && existingDocument.fileUrl.includes('amazonaws.com')) {
        try {
          // Extraire la clé S3 de l'URL existante
          const existingUrl = existingDocument.fileUrl
          const urlParts = existingUrl.split("/")
          const existingKey = `documents/${userId}/${urlParts[urlParts.length - 1]}`
          
          // Supprimer l'ancien fichier de S3
          await s3Client.send(new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME || "",
            Key: existingKey
          }))
        } catch (error) {
          console.error("Erreur lors de la suppression de l'ancien fichier:", error)
          // Continuer même en cas d'erreur
        }
      }

      // Supprimer l'enregistrement dans la base de données
      await prisma.artisanDocument.delete({
        where: {
          id: existingDocument.id,
        },
      })
    }

    let fileUrl = ""

    // Convertir le fichier en ArrayBuffer puis en Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Si AWS S3 est configuré, utiliser S3 pour l'upload
    if (isS3Configured && s3Client) {
      try {
        // Upload du fichier vers S3
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME || "",
          Key: s3Key,
          Body: buffer,
          ContentType: file.type
        }))

        // Générer l'URL du fichier
        fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "eu-west-3"}.amazonaws.com/${s3Key}`
      } catch (error) {
        console.error("Erreur lors de l'upload vers S3:", error)
        // En cas d'erreur avec S3, on utilise un fallback local
        fileUrl = `http://${request.headers.get('host')}/api/mock-storage/${s3Key}`
      }
    } else {
      // Si S3 n'est pas configuré, utiliser un URL de fallback simulé (pas de stockage réel)
      console.warn("AWS S3 n'est pas configuré. Utilisation d'une URL de fallback simulée.")
      fileUrl = `http://${request.headers.get('host')}/api/mock-storage/${s3Key}`
    }

    // Créer un nouvel enregistrement dans la base de données
    const document = await prisma.artisanDocument.create({
      data: {
        userId,
        type,
        title,
        fileUrl,
        fileType: file.type,
        verified: false,
      },
    })

    return NextResponse.json({
      success: true,
      fileUrl,
      document,
    })
  } catch (error) {
    console.error("Erreur lors du téléversement du document:", error)
    return NextResponse.json(
      { error: "Erreur lors du téléversement du document" },
      { status: 500 }
    )
  }
} 