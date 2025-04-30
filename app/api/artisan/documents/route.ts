import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    
    // Récupérer tous les documents de l'artisan
    const documents = await prisma.artisanDocument.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Formater les documents pour le frontend
    const formattedDocuments = documents.map(doc => ({
      id: doc.type,  // Utiliser le type comme identifiant pour le frontend
      title: doc.title,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      verified: doc.verified,
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