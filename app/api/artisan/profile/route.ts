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
    console.log("🚀 Début de la requête POST /api/artisan/profile")
    
    const session = await getServerSession(authOptions)
    console.log("📋 Session récupérée:", { userId: session?.user?.id, email: session?.user?.email })
    
    if (!session || !session.user) {
      console.error("❌ Session non trouvée ou utilisateur manquant")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    console.log("👤 UserId:", userId)
    
    // Récupérer les données JSON au lieu de FormData
    const data = await request.json()
    console.log("📥 Données brutes reçues:", data)
    
    const { firstName, lastName, companyName, siret, phone, yearsOfExperience } = data
    
    // Construire le nom complet à partir du prénom et nom
    const fullName = [firstName, lastName].filter(Boolean).join(" ")

    console.log("🔍 Données traitées pour mise à jour du profil:", {
      firstName, lastName, fullName, phone, companyName, siret, yearsOfExperience
    })

    try {
      console.log("💾 Début des opérations base de données")
      
      // Mise à jour des données utilisateur
      console.log("🔄 Mise à jour utilisateur avec:", {
        userId,
        name: fullName,
        phone
      })
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name: fullName || undefined,
          phone: phone || undefined,
        },
      })
      console.log("✅ Utilisateur mis à jour:", { id: updatedUser.id, name: updatedUser.name })

      // Création ou mise à jour du profil artisan
      console.log("🔄 Upsert profil artisan avec:", {
        userId,
        companyName,
        siret,
        yearsOfExperience
      })
      
      const artisanProfile = await prisma.artisanProfile.upsert({
        where: { userId },
        create: {
          userId,
          companyName: companyName || undefined,
          siret: siret || undefined,
          yearsOfExperience: yearsOfExperience || 0,
        },
        update: {
          companyName: companyName || undefined,
          siret: siret || undefined,
          yearsOfExperience: yearsOfExperience || 0,
        },
      })
      console.log("✅ Profil artisan créé/mis à jour:", { id: artisanProfile.id, companyName: artisanProfile.companyName })

      // Marquer l'étape profil comme complétée dans l'onboarding
      console.log("🔄 Mise à jour progression onboarding")
      await updateOnboardingProgress(userId, "profile")
      console.log("✅ Progression onboarding mise à jour")

      // Retourner le profil mis à jour
      const profileData = {
        firstName,
        lastName,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        companyName: artisanProfile.companyName,
        siret: artisanProfile.siret,
        yearsOfExperience: artisanProfile.yearsOfExperience,
      }

      console.log("📤 Données de réponse:", profileData)
      console.log("✅ Requête POST /api/artisan/profile terminée avec succès")
      
      return NextResponse.json(profileData)
    } catch (prismaError) {
      console.error("❌ Erreur Prisma lors de la mise à jour du profil:", prismaError)
      console.error("Stack trace Prisma:", (prismaError as Error)?.stack)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour en base de données" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Erreur générale lors de la mise à jour du profil:", error)
    console.error("Stack trace générale:", (error as Error)?.stack)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
} 