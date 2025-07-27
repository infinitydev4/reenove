import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { ExpressBookingStatus } from "@/lib/generated/prisma"

// Schéma pour mettre à jour le statut d'une réservation
const updateBookingSchema = z.object({
  status: z.nativeEnum(ExpressBookingStatus).optional(),
  notes: z.string().optional(),
  specialRequirements: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    const bookingId = params.id

    // Récupérer la réservation avec tous les détails
    const booking = await prisma.expressBooking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id, // S'assurer que la réservation appartient à l'utilisateur
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            expressDescription: true,
            icon: true,
            estimatedDuration: true,
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
              }
            }
          }
        },
        assignedArtisan: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            artisanProfile: {
              select: {
                companyName: true,
                averageRating: true,
              }
            }
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    // Formatter la réponse avec tous les détails
    const formattedBooking = {
      id: booking.id,
      service: {
        id: booking.service.id,
        name: booking.service.name,
        description: booking.service.description,
        expressDescription: booking.service.expressDescription,
        icon: booking.service.icon,
        estimatedDuration: booking.service.estimatedDuration,
        category: booking.service.category,
      },
      bookingDate: booking.bookingDate,
      timeSlot: booking.timeSlot,
      price: booking.price,
      status: booking.status,
      clientInfo: {
        name: booking.clientName,
        phone: booking.clientPhone,
        email: booking.clientEmail,
      },
      location: {
        address: booking.address,
        city: booking.city,
        postalCode: booking.postalCode,
        floor: booking.floor,
        hasElevator: booking.hasElevator,
      },
      notes: booking.notes,
      specialRequirements: booking.specialRequirements,
      assignedArtisan: booking.assignedArtisan ? {
        id: booking.assignedArtisan.id,
        name: booking.assignedArtisan.name,
        phone: booking.assignedArtisan.phone,
        email: booking.assignedArtisan.email,
        companyName: booking.assignedArtisan.artisanProfile?.companyName,
        rating: booking.assignedArtisan.artisanProfile?.averageRating,
      } : null,
      timestamps: {
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        confirmedAt: booking.confirmedAt,
        completedAt: booking.completedAt,
        assignedAt: booking.assignedAt,
      }
    }

    return NextResponse.json({ booking: formattedBooking })

  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    const bookingId = params.id
    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const existingBooking = await prisma.expressBooking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
    })

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si le statut peut être modifié par l'utilisateur
    if (validatedData.status && validatedData.status !== ExpressBookingStatus.CANCELLED) {
      // Les utilisateurs ne peuvent que annuler leurs réservations
      if (session.user.role !== "ADMIN" && session.user.role !== "ARTISAN") {
        return NextResponse.json(
          { error: "Vous ne pouvez que annuler votre réservation" },
          { status: 403 }
        )
      }
    }

    // Mettre à jour la réservation
    const updatedBooking = await prisma.expressBooking.update({
      where: { id: bookingId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      include: {
        service: {
          select: {
            name: true,
            category: { select: { name: true } }
          }
        }
      }
    })

    console.log(`✅ Réservation Express mise à jour: ${bookingId}`)

    return NextResponse.json({
      booking: {
        id: updatedBooking.id,
        serviceName: updatedBooking.service.name,
        categoryName: updatedBooking.service.category.name,
        status: updatedBooking.status,
        updatedAt: updatedBooking.updatedAt,
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Données invalides", 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      )
    }

    console.error("Erreur lors de la mise à jour de la réservation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    const bookingId = params.id

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const booking = await prisma.expressBooking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        bookingDate: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si la réservation peut être supprimée
    if (booking.status === ExpressBookingStatus.IN_PROGRESS || booking.status === ExpressBookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Impossible de supprimer une réservation en cours ou terminée" },
        { status: 400 }
      )
    }

    // Vérifier si c'est trop tard pour annuler (ex: moins de 24h avant)
    const now = new Date()
    const bookingDate = new Date(booking.bookingDate)
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursDifference < 24 && booking.status === ExpressBookingStatus.CONFIRMED) {
      return NextResponse.json(
        { error: "Impossible d'annuler une réservation confirmée moins de 24h avant" },
        { status: 400 }
      )
    }

    // Supprimer la réservation
    await prisma.expressBooking.delete({
      where: { id: bookingId }
    })

    console.log(`✅ Réservation Express supprimée: ${bookingId}`)

    return NextResponse.json({
      message: "Réservation supprimée avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la réservation" },
      { status: 500 }
    )
  }
} 