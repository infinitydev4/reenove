import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { deleteFromS3, extractKeyFromS3Url } from "@/lib/s3"

// Récupérer un document spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    const documentId = params.id
    
    // Récupérer le document
    const document = await prisma.artisanDocument.findUnique({
      where: {
        id: documentId,
      },
    })
    
    // Vérifier que le document existe
    if (!document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 })
    }
    
    // Vérifier que l'utilisateur est propriétaire du document ou est admin
    if (document.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }
    
    // Retourner les informations du document
    return NextResponse.json({
      id: document.id,
      title: document.title,
      type: document.type,
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      uploadDate: document.createdAt.toISOString(),
      verified: document.verified,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du document:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du document" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    const documentId = params.id
    
    // Récupérer le document
    const document = await prisma.artisanDocument.findUnique({
      where: {
        id: documentId,
      },
    })
    
    // Vérifier que le document existe
    if (!document) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 })
    }
    
    // Vérifier que l'utilisateur est propriétaire du document ou est admin
    if (document.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }
    
    // Si le document a une URL S3, supprimer le fichier
    if (document.fileUrl && document.fileUrl.includes('amazonaws.com')) {
      const s3Key = extractKeyFromS3Url(document.fileUrl)
      if (s3Key) {
        await deleteFromS3(s3Key)
      }
    } else if (document.fileUrl && document.fileUrl.includes('/api/mock-storage/')) {
      // Si c'est un fichier mock, pas besoin de faire quoi que ce soit de spécial
      console.log("Suppression d'un fichier mock simulé, pas d'action réelle requise")
    }

    // Supprimer le document
    await prisma.artisanDocument.delete({
      where: {
        id: documentId,
      },
    })
    
    // Retourner une confirmation
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du document" },
      { status: 500 }
    )
  }
} 