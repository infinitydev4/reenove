import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { updateOnboardingProgress } from "@/lib/onboarding"

// GET - Récupérer le profil de l'artisan
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Récupérer l'utilisateur avec ses informations de base
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer le profil artisan si existant
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId },
    })

    // Diviser le nom complet en prénom et nom si possible
    let firstName = "", lastName = "";
    if (user.name) {
      const nameParts = user.name.split(" ");
      if (nameParts.length > 0) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(" ");
      }
    }

    // Fusionner les données utilisateur et profil artisan
    const profileData = {
      name: user.name,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      // Données du profil artisan si existantes
      ...(artisanProfile || {}),
    }

    // Ajouter des en-têtes pour éviter la mise en cache
    return NextResponse.json(profileData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour le profil de l'artisan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    console.log("Données reçues pour mise à jour du profil:", data)

    try {
      // Créer le nom complet à partir du prénom et du nom
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();

      // Mise à jour des données utilisateur
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        },
      })

      // Création ou mise à jour du profil artisan
      const artisanProfile = await prisma.artisanProfile.upsert({
        where: { userId },
        create: {
          userId,
          companyName: data.companyName,
          siret: data.siret,
          yearsOfExperience: data.yearsOfExperience,
          preferredRadius: data.preferredRadius,
        },
        update: {
          companyName: data.companyName,
          siret: data.siret,
          yearsOfExperience: data.yearsOfExperience,
          preferredRadius: data.preferredRadius,
        },
      })

      // Mettre à jour la progression de l'onboarding
      try {
        // Si les données contiennent une adresse et un code postal, cela concerne l'étape de localisation
        if (data.address && data.postalCode) {
          await updateOnboardingProgress(userId, 'location')
          console.log(`Étape location complétée pour l'utilisateur ${userId}`)
        } else {
          await updateOnboardingProgress(userId, 'profile')
          console.log(`Étape profile complétée pour l'utilisateur ${userId}`)
        }
      } catch (progressError) {
        console.error("Erreur lors de la mise à jour de la progression:", progressError)
        // Ne pas bloquer la réponse en cas d'erreur de progression
      }

      return NextResponse.json({
        message: "Profil mis à jour avec succès",
        profile: {
          ...data,
          id: artisanProfile.id,
        },
      })
    } catch (dbError) {
      console.error("Erreur lors des opérations en base de données:", dbError)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du profil en base de données" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
} 