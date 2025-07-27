import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { ExpressBookingStatus, TimeSlot } from "@/lib/generated/prisma"

// Schéma de validation pour créer une réservation Express
const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Service ID requis"),
  bookingDate: z.string().datetime("Date invalide"),
  timeSlot: z.nativeEnum(TimeSlot),
  clientName: z.string().min(2, "Nom requis (minimum 2 caractères)"),
  clientPhone: z.string().min(10, "Numéro de téléphone invalide"),
  clientEmail: z.string().email("Email invalide"),
  address: z.string().min(5, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  floor: z.number().int().optional(),
  hasElevator: z.boolean().optional(),
  notes: z.string().optional(),
  specialRequirements: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    // Valider les données d'entrée
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // Vérifier que le service existe et est disponible en Express
    const service = await prisma.service.findUnique({
      where: { 
        id: validatedData.serviceId,
        isActive: true,
        isExpressAvailable: true,
      },
      select: {
        id: true,
        name: true,
        expressPrice: true,
        isExpressAvailable: true,
      }
    })

    if (!service || !service.expressPrice) {
      return NextResponse.json(
        { error: "Service non disponible en Express ou prix non défini" },
        { status: 400 }
      )
    }

    // Vérifier que la date/heure n'est pas dans le passé
    const bookingDate = new Date(validatedData.bookingDate)
    const now = new Date()
    if (bookingDate <= now) {
      return NextResponse.json(
        { error: "La date de réservation doit être dans le futur" },
        { status: 400 }
      )
    }

    // Vérifier la disponibilité (pas plus de 2 réservations par créneau)
    const existingBookings = await prisma.expressBooking.count({
      where: {
        bookingDate: bookingDate,
        timeSlot: validatedData.timeSlot,
        status: {
          in: [ExpressBookingStatus.PENDING, ExpressBookingStatus.CONFIRMED]
        }
      }
    })

    if (existingBookings >= 2) {
      return NextResponse.json(
        { error: "Ce créneau est complet. Veuillez choisir un autre créneau." },
        { status: 409 }
      )
    }

    // Créer la réservation Express
    const expressBooking = await prisma.expressBooking.create({
      data: {
        userId: session.user.id,
        serviceId: validatedData.serviceId,
        bookingDate: bookingDate,
        timeSlot: validatedData.timeSlot,
        price: service.expressPrice,
        clientName: validatedData.clientName,
        clientPhone: validatedData.clientPhone,
        clientEmail: validatedData.clientEmail,
        address: validatedData.address,
        city: validatedData.city,
        postalCode: validatedData.postalCode,
        floor: validatedData.floor,
        hasElevator: validatedData.hasElevator,
        notes: validatedData.notes,
        specialRequirements: validatedData.specialRequirements,
        status: ExpressBookingStatus.PENDING,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })

    // TODO: Envoyer notification/email de confirmation
    console.log(`✅ Nouvelle réservation Express créée: ${expressBooking.id}`)

    return NextResponse.json({
      booking: {
        id: expressBooking.id,
        serviceName: expressBooking.service.name,
        categoryName: expressBooking.service.category.name,
        bookingDate: expressBooking.bookingDate,
        timeSlot: expressBooking.timeSlot,
        price: expressBooking.price,
        status: expressBooking.status,
        createdAt: expressBooking.createdAt,
      }
    }, { status: 201 })

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

    console.error("Erreur lors de la création de la réservation Express:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 })
    }

    // Récupérer les réservations de l'utilisateur
    const bookings = await prisma.expressBooking.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            icon: true,
            category: {
              select: {
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
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    })

    // Formatter la réponse
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      serviceName: booking.service.name,
      categoryName: booking.service.category.name,
      categoryIcon: booking.service.category.icon,
      serviceIcon: booking.service.icon,
      bookingDate: booking.bookingDate,
      timeSlot: booking.timeSlot,
      price: booking.price,
      status: booking.status,
      address: booking.address,
      city: booking.city,
      assignedArtisan: booking.assignedArtisan ? {
        name: booking.assignedArtisan.name,
        phone: booking.assignedArtisan.phone,
      } : null,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
    }))

    return NextResponse.json({
      bookings: formattedBookings,
      total: formattedBookings.length,
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des réservations:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    )
  }
} 