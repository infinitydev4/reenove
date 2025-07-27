import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, ExpressBookingStatus } from "@/lib/generated/prisma"

export async function POST(
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

    // Vérifier que la réservation existe et a un artisan assigné
    const booking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
      include: {
        assignedArtisan: true,
        service: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation express non trouvée" },
        { status: 404 }
      )
    }

    if (!booking.assignedArtisanId || !booking.assignedArtisan) {
      return NextResponse.json(
        { error: "Aucun artisan n'est actuellement assigné à cette réservation" },
        { status: 400 }
      )
    }

    // Vérifier que la réservation peut être désattribuée (pas encore IN_PROGRESS ou COMPLETED)
    if (booking.status === ExpressBookingStatus.IN_PROGRESS) {
      return NextResponse.json(
        { error: "Impossible de désattribuer une réservation en cours" },
        { status: 400 }
      )
    }

    if (booking.status === ExpressBookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Impossible de désattribuer une réservation terminée" },
        { status: 400 }
      )
    }

    // Désattribuer l'artisan
    const updatedBooking = await prisma.expressBooking.update({
      where: { id: bookingId },
      data: {
        assignedArtisanId: null,
        assignedAt: null,
        status: ExpressBookingStatus.PENDING, // Retour au statut PENDING
        updatedAt: new Date()
      },
      include: {
        service: true
      }
    })

    // Créer une notification pour l'artisan (ex-assigné)
    await prisma.notification.create({
      data: {
        userId: booking.assignedArtisanId,
        title: "Attribution de réservation annulée",
        message: `L'attribution de la réservation "${booking.service.name}" du ${booking.bookingDate.toLocaleDateString('fr-FR')} a été annulée par l'équipe Reenove.`,
        type: "EXPRESS_UNASSIGNED",
        link: `/artisan/rendez-vous`
      }
    })

    // Créer une notification pour le client
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: "Attribution d'artisan modifiée",
        message: `L'attribution de l'artisan pour votre réservation "${booking.service.name}" a été modifiée. Nous recherchons un nouvel artisan.`,
        type: "EXPRESS_ARTISAN_UNASSIGNED",
        link: `/client/reservations/${bookingId}`
      }
    })

    console.log(`✅ Réservation express ${bookingId} désattribuée de l'artisan ${booking.assignedArtisanId} par ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: "Artisan désattribué avec succès",
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        assignedArtisan: null,
        assignedAt: null
      },
      previousArtisan: {
        id: booking.assignedArtisan.id,
        name: booking.assignedArtisan.name,
        email: booking.assignedArtisan.email
      }
    })

  } catch (error) {
    console.error("Erreur lors de la désattribution de la réservation express:", error)
    return NextResponse.json(
      { error: "Erreur lors de la désattribution de la réservation" },
      { status: 500 }
    )
  }
} 