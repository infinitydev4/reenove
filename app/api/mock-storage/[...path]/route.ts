import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Cet endpoint est un mock pour l'accès aux fichiers stockés
// Il ne stocke pas réellement les fichiers, mais simule un accès
// Utiliser uniquement pour le développement en l'absence de AWS S3

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Construire le chemin
    const filePath = params.path.join('/')
    
    // Retourner une réponse avec une image générique ou un message
    return new NextResponse(
      `Ceci est un fichier fictif pour : ${filePath}. AWS S3 n'est pas configuré.`,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    )
  } catch (error) {
    console.error("Erreur lors de l'accès au fichier simulé:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'accès au fichier" },
      { status: 500 }
    )
  }
} 