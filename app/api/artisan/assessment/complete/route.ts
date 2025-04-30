import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    
    // Essayer de récupérer les données du body (score optionnel)
    let score: number | undefined
    try {
      const body = await request.json()
      score = body.score
    } catch (e) {
      // Ignorer les erreurs de parsing - le score est optionnel
    }
    
    // Vérifier si l'utilisateur est bien un artisan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artisanProfile: true }
    })

    if (!user || user.role !== "ARTISAN") {
      return NextResponse.json({ error: "Utilisateur non autorisé" }, { status: 403 })
    }

    if (!user.artisanProfile) {
      // Si le profil artisan n'existe pas, le créer
      await prisma.artisanProfile.create({
        data: {
          userId,
          assessmentCompleted: true,
          assessmentScore: score,
          onboardingCompleted: true,
          level: "BEGINNER" // Niveau par défaut
        }
      })
    } else {
      // Mettre à jour le profil artisan existant
      await prisma.artisanProfile.update({
        where: { userId },
        data: {
          assessmentCompleted: true,
          assessmentScore: score,
          onboardingCompleted: true
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évaluation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'évaluation" },
      { status: 500 }
    )
  }
} 