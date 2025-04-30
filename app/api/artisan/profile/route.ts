import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

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

    // Fusionner les données utilisateur et profil artisan
    const profileData = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      // Données du profil artisan si existantes
      ...(artisanProfile || {}),
    }

    return NextResponse.json(profileData)
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

    // Mise à jour des données utilisateur
    await prisma.user.update({
      where: { id: userId },
      data: {
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

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      profile: {
        ...data,
        id: artisanProfile.id,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
} 