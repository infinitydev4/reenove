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

// POST - Mettre à jour le profil de l'artisan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    
    // Récupérer les données du FormData
    const formData = await request.formData()
    
    const name = formData.get('name')?.toString() || ''
    const phone = formData.get('phone')?.toString() || ''
    const address = formData.get('address')?.toString() || ''
    const city = formData.get('city')?.toString() || ''
    const postalCode = formData.get('postalCode')?.toString() || ''
    const companyName = formData.get('companyName')?.toString() || ''
    const siren = formData.get('siren')?.toString() || ''

    console.log("Données reçues pour mise à jour du profil:", {
      name, phone, address, city, postalCode, companyName, siren
    })

    try {
      // Mise à jour des données utilisateur
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          phone: phone || undefined,
          address: address || undefined,
          city: city || undefined,
          postalCode: postalCode || undefined,
        },
      })

      // Création ou mise à jour du profil artisan
      const artisanProfile = await prisma.artisanProfile.upsert({
        where: { userId },
        create: {
          userId,
          companyName: companyName || undefined,
          siret: siren || undefined,
        },
        update: {
          companyName: companyName || undefined,
          siret: siren || undefined,
        },
      })

      // Marquer l'étape profil comme complétée dans l'onboarding
      await updateOnboardingProgress(userId, "profile")

      // Retourner le profil mis à jour
      const profileData = {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        companyName: artisanProfile.companyName,
        siren: artisanProfile.siret,
      }

      return NextResponse.json(profileData)
    } catch (prismaError) {
      console.error("Erreur Prisma lors de la mise à jour du profil:", prismaError)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour en base de données" },
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