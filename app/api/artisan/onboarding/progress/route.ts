import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Récupérer le profil de l'artisan
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId },
    })

    // Récupérer les spécialités de l'artisan
    const artisanSpecialties = await prisma.artisanSpecialty.findMany({
      where: { userId },
    })

    // Récupérer les documents de l'artisan
    const artisanDocuments = await prisma.artisanDocument.findMany({
      where: { userId },
    })

    // Déterminer l'état d'avancement
    const progress = {
      profile: !!artisanProfile, // Vérifie si le profil existe
      specialties: artisanSpecialties.length > 0, // Vérifie si au moins une spécialité a été ajoutée
      documents: artisanDocuments.length >= 2, // Vérifie si au moins deux documents ont été téléchargés (KBIS et assurance minimum)
      assessment: artisanProfile?.assessmentCompleted || false, // Vérifie si l'évaluation a été complétée
      confirmation: artisanProfile?.onboardingCompleted || false, // Vérifie si l'onboarding a été confirmé
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error("Erreur lors de la récupération de la progression:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la progression" },
      { status: 500 }
    )
  }
} 