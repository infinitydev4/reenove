import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json(
        { error: "Accès non autorisé. Droits administrateur requis." },
        { status: 403 }
      )
    }

    const bookingId = params.id

    // Rechercher la réservation avec l'artisan assigné
    const booking = await prisma.expressBooking.findUnique({
      where: {
        id: bookingId,
        assignedArtisanId: { not: null }  // Uniquement si un artisan est assigné
      },
      include: {
        assignedArtisan: {
          include: {
            artisanProfile: true,
            artisanSpecialties: {
              include: {
                service: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!booking || !booking.assignedArtisan) {
      return NextResponse.json(
        { error: "Aucun artisan assigné trouvé pour cette réservation" },
        { status: 404 }
      )
    }

    // Formater les données de l'artisan
    const artisan = booking.assignedArtisan
    const formattedArtisan = {
      id: artisan.id,
      name: artisan.name,
      email: artisan.email,
      phone: artisan.phone,
      address: artisan.address,
      city: artisan.city,
      postalCode: artisan.postalCode,
      image: artisan.image,
      profile: {
        companyName: artisan.artisanProfile?.companyName,
        siret: artisan.artisanProfile?.siret,
        yearsOfExperience: artisan.artisanProfile?.yearsOfExperience,
        level: artisan.artisanProfile?.level,
        projectsCompleted: artisan.artisanProfile?.projectsCompleted || 0,
        averageRating: artisan.artisanProfile?.averageRating,
        verificationStatus: artisan.artisanProfile?.verificationStatus,
        availableForWork: artisan.artisanProfile?.availableForWork
      },
      specialties: artisan.artisanSpecialties.map(specialty => ({
        id: specialty.id,
        service: specialty.service.name,
        category: specialty.service.category.name,
        isPrimary: specialty.isPrimary
      })),
      assignment: {
        assignedAt: booking.assignedAt,
        bookingId: booking.id,
        serviceName: booking.service.name
      }
    }

    return NextResponse.json({
      artisan: formattedArtisan
    })

  } catch (error) {
    console.error("Erreur lors de la récupération de l'artisan assigné:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'artisan assigné" },
      { status: 500 }
    )
  }
} 