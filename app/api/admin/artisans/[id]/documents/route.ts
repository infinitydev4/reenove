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

    const artisanId = params.id
    
    // Vérifier que l'artisan existe
    const artisan = await prisma.user.findUnique({
      where: { 
        id: artisanId,
        role: Role.ARTISAN
      }
    })
    
    if (!artisan) {
      return NextResponse.json(
        { error: "Artisan non trouvé" },
        { status: 404 }
      )
    }
    
    // Récupérer les documents de l'artisan
    const documents = await prisma.artisanDocument.findMany({
      where: {
        userId: artisanId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Formater les documents pour l'API
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      uploadDate: doc.createdAt,
      verified: doc.verified,
      expiryDate: null // À implémenter si les documents ont des dates d'expiration
    }))

    return NextResponse.json(formattedDocuments)
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des documents" },
      { status: 500 }
    )
  }
} 