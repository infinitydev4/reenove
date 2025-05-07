import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { uploadToS3, isS3Available } from "@/lib/s3"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Extraire le fichier de la requête
    const formData = await request.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string | null

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Type de fichier non autorisé. Seuls les formats JPEG, JPG et PNG sont acceptés." 
      }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "Le fichier est trop volumineux. Taille maximale: 5 MB." 
      }, { status: 400 })
    }

    // Préparer le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileExtension = file.name.split('.').pop() || ""
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const s3Key = `projects/${userId}/${uniqueFileName}`

    // Upload sur S3 avec le nouveau module
    const imageUrl = await uploadToS3(buffer, s3Key, file.type)

    // Fallback si S3 échoue ou n'est pas configuré
    const finalImageUrl = imageUrl || `/api/mock-storage/${s3Key}`

    if (!imageUrl && isS3Available()) {
      console.error("Échec de l'upload S3 malgré une configuration valide")
      return NextResponse.json({ 
        error: "Erreur lors de l'upload sur AWS S3" 
      }, { status: 500 })
    }

    // Si projectId est fourni, enregistrer automatiquement l'image dans la base de données
    if (projectId) {
      try {
        // Vérifier que le projet existe et appartient à l'utilisateur
        const project = await prisma.project.findUnique({
          where: {
            id: projectId,
            userId: userId
          }
        })

        if (project) {
          // Récupérer l'ordre max actuel
          const maxOrderImage = await prisma.projectImage.findFirst({
            where: { projectId },
            orderBy: { order: "desc" }
          })
          
          const order = maxOrderImage ? maxOrderImage.order + 1 : 0
          
          // Créer l'entrée pour l'image
          await prisma.projectImage.create({
            data: {
              url: finalImageUrl,
              projectId,
              order,
              caption: ""
            }
          })
          
          console.log(`Image ajoutée au projet ${projectId}`)
        } else {
          console.warn(`Projet ${projectId} non trouvé ou n'appartient pas à l'utilisateur ${userId}`)
        }
      } catch (dbError) {
        console.error("Erreur lors de l'enregistrement de l'image dans la base de données:", dbError)
        // On continue même en cas d'erreur d'enregistrement dans la DB
      }
    }

    // Retourner l'URL de l'image
    return NextResponse.json({ 
      success: true, 
      url: finalImageUrl 
    })
  } catch (error) {
    console.error("Erreur de téléchargement:", error)
    return NextResponse.json({ 
      error: "Échec du téléchargement du fichier" 
    }, { status: 500 })
  }
} 