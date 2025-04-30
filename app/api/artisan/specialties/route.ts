import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// GET - Récupérer les spécialités de l'artisan
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
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

    return NextResponse.json(specialties)
  } catch (error) {
    console.error("Erreur lors de la récupération des spécialités:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des spécialités" },
      { status: 500 }
    )
  }
}

// POST - Créer ou mettre à jour les spécialités de l'artisan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()
    
    if (!data.specialties || !Array.isArray(data.specialties)) {
      return NextResponse.json(
        { error: "Format de données invalide" },
        { status: 400 }
      )
    }

    // Supprimer toutes les spécialités existantes de l'artisan
    await prisma.artisanSpecialty.deleteMany({
      where: { userId }
    })

    // Créer les nouvelles spécialités
    const specialties = await Promise.all(
      data.specialties.map((specialty: { serviceId: string; isPrimary: boolean }) =>
        prisma.artisanSpecialty.create({
          data: {
            userId,
            serviceId: specialty.serviceId,
            isPrimary: specialty.isPrimary
          }
        })
      )
    )

    return NextResponse.json({
      message: "Spécialités mises à jour avec succès",
      specialties
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des spécialités:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des spécialités" },
      { status: 500 }
    )
  }
} 