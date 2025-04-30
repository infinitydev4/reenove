import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

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

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    const documentId = params.id

    // Récupérer le document à supprimer
    const document = await prisma.artisanDocument.findFirst({
      where: {
        userId,
        type: documentId, // Utilisation du type comme ID
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 })
    }

    // Si S3 est configuré et que le document a une URL S3, supprimer le fichier
    if (isS3Configured && s3Client && document.fileUrl && document.fileUrl.includes('amazonaws.com')) {
      try {
        // Extraire la clé S3 de l'URL
        const url = document.fileUrl
        const urlParts = url.split("/")
        const key = `documents/${userId}/${urlParts[urlParts.length - 1]}`
        
        // Supprimer le fichier de S3
        await s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME || "",
          Key: key
        }))
      } catch (error) {
        console.error("Erreur lors de la suppression du fichier S3:", error)
        // Continuer même en cas d'erreur de suppression du fichier
      }
    } else if (document.fileUrl && document.fileUrl.includes('/api/mock-storage/')) {
      // Si c'est un fichier mock, pas besoin de faire quoi que ce soit de spécial
      console.log("Suppression d'un fichier mock simulé, pas d'action réelle requise")
    }

    // Supprimer l'enregistrement de la base de données
    await prisma.artisanDocument.delete({
      where: {
        id: document.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du document" },
      { status: 500 }
    )
  }
} 