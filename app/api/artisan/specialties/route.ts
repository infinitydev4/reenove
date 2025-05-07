import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { updateOnboardingProgress } from "@/lib/onboarding"

// GET - Récupérer les spécialités de l'artisan
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id

    // Récupérer les spécialités avec les informations de service et catégorie
    const specialties = await prisma.artisanSpecialty.findMany({
      where: { userId },
      include: {
        service: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        isPrimary: 'desc'
      }
    })

    // Formater les données pour le frontend
    const formattedSpecialties = specialties.map(specialty => ({
      id: specialty.id,
      serviceId: specialty.serviceId,
      isPrimary: specialty.isPrimary,
      name: specialty.service?.name || "Service inconnu",
      service: {
        id: specialty.service?.id || "",
        name: specialty.service?.name || "Service inconnu",
        description: specialty.service?.description,
        categoryId: specialty.service?.categoryId || "",
        category: specialty.service?.category ? {
          id: specialty.service.category.id,
          name: specialty.service.category.name
        } : null
      }
    }))
    
    console.log("Spécialités renvoyées:", formattedSpecialties)

    return NextResponse.json(formattedSpecialties)
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des spécialités" },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour les spécialités de l'artisan
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    const userId = session.user.id
    const data = await request.json()
    
    // Validation des données
    if (!data.specialties || !Array.isArray(data.specialties)) {
      return NextResponse.json({ error: "Format de données invalide" }, { status: 400 })
    }
    
    // Vérification qu'une seule spécialité est marquée comme principale
    const primarySpecialties = data.specialties.filter((spec: any) => spec.isPrimary)
    if (primarySpecialties.length === 0 && data.specialties.length > 0) {
      // Si aucune spécialité principale n'est définie, marquer la première comme principale
      data.specialties[0].isPrimary = true
    } else if (primarySpecialties.length > 1) {
      // Si plusieurs spécialités sont marquées comme principales, ne garder que la première
      const firstPrimary = primarySpecialties[0]
      data.specialties.forEach((spec: any) => {
        spec.isPrimary = spec.serviceId === firstPrimary.serviceId
      })
    }
    
    // Vérifier si l'artisan a un profil
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId }
    })
    
    if (!artisanProfile) {
      // Créer un profil si nécessaire
      await prisma.artisanProfile.create({
        data: {
          userId: userId,
          onboardingCompleted: false
        }
      })
    }
    
    // Supprimer les spécialités existantes
    await prisma.artisanSpecialty.deleteMany({
      where: { userId }
    })
    
    // Créer les nouvelles spécialités
    const specialties = await Promise.all(
      data.specialties.map(async (specialty: { serviceId: string, isPrimary: boolean }) => {
        return prisma.artisanSpecialty.create({
          data: {
            userId,
            serviceId: specialty.serviceId,
            isPrimary: specialty.isPrimary || false
          },
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        })
      })
    )
    
    // Mettre à jour la progression de l'onboarding seulement si des spécialités ont été ajoutées
    if (specialties.length > 0) {
      try {
        await updateOnboardingProgress(userId, 'specialties')
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la progression:", error)
        // Ne pas bloquer le processus si la mise à jour de la progression échoue
      }
    }
    
    return NextResponse.json({ 
      message: "Spécialités enregistrées avec succès",
      specialties: specialties
    })
    
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des spécialités:", error)
    return NextResponse.json({ error: "Erreur lors de l'enregistrement des spécialités" }, { status: 500 })
  }
} 