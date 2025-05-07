import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { getOnboardingProgress, updateOnboardingProgress } from "@/lib/onboarding"

export const dynamic = 'force-dynamic';

// GET - Récupérer la progression d'onboarding
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Vérifier le rôle (si nécessaire)
    if (session.user.role !== "ARTISAN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Récupérer la progression via la fonction partagée
    const progress = await getOnboardingProgress(userId)

    // Ajouter des en-têtes pour éviter la mise en cache
    return NextResponse.json(progress, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 }
    )
  }
}

// POST - Mettre à jour la progression d'onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Vérifier le rôle (si nécessaire)
    if (session.user.role !== "ARTISAN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const { step } = body

    if (!step || !['profile', 'specialties', 'documents', 'confirmation'].includes(step)) {
      return NextResponse.json(
        { error: "Étape invalide ou manquante" },
        { status: 400 }
      )
    }

    // Mettre à jour la progression via la fonction partagée
    await updateOnboardingProgress(userId, step)

    console.log(`Étape ${step} complétée pour l'utilisateur ${userId}`)

    // Ajouter des en-têtes pour éviter la mise en cache
    return NextResponse.json(
      { success: true, step }, 
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      }
    )
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la progression:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la progression" },
      { status: 500 }
    )
  }
} 