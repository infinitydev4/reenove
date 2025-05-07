import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role } from "@/lib/generated/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions d'admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    // Vérifier si l'utilisateur est administrateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const documentId = params.id
    
    // Récupérer le document depuis la base de données
    const document = await prisma.artisanDocument.findUnique({
      where: {
        id: documentId,
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: "Document non trouvé" },
        { status: 404 }
      )
    }

    // Retourner les détails du document
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