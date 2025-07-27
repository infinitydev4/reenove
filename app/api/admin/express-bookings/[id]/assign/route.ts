import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, ExpressBookingStatus } from "@/lib/generated/prisma"
import { sendEmail } from "@/lib/email"
import { getExpressAssignmentEmailTemplate } from "@/lib/email-templates/express-assignment"

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
    const { artisanId } = await request.json()

    if (!artisanId) {
      return NextResponse.json(
        { error: "L'ID de l'artisan est requis" },
        { status: 400 }
      )
    }

    // Vérifier que la réservation existe
    const booking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: {
          include: {
            category: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation express non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier que la réservation n'est pas déjà assignée
    if (booking.assignedArtisanId) {
      return NextResponse.json(
        { error: "Cette réservation est déjà attribuée à un artisan" },
        { status: 400 }
      )
    }

    // Vérifier que l'artisan existe et est disponible
    const artisan = await prisma.user.findUnique({
      where: {
        id: artisanId,
        role: Role.ARTISAN
      },
      include: {
        artisanProfile: true
      }
    })

    if (!artisan) {
      return NextResponse.json(
        { error: "Artisan non trouvé" },
        { status: 404 }
      )
    }

    if (!artisan.artisanProfile?.availableForWork) {
      return NextResponse.json(
        { error: "Cet artisan n'est pas disponible pour de nouvelles réservations" },
        { status: 400 }
      )
    }

    // Attribuer la réservation à l'artisan
    const updatedBooking = await prisma.expressBooking.update({
      where: { id: bookingId },
      data: {
        assignedArtisanId: artisanId,
        assignedAt: new Date(),
        status: booking.status === ExpressBookingStatus.PENDING ? ExpressBookingStatus.CONFIRMED : booking.status,
        confirmedAt: booking.status === ExpressBookingStatus.PENDING ? new Date() : booking.confirmedAt,
        updatedAt: new Date()
      },
      include: {
        assignedArtisan: true,
        service: {
          include: {
            category: true
          }
        }
      }
    })

    // Créer une notification pour l'artisan
    await prisma.notification.create({
      data: {
        userId: artisanId,
        title: "Nouvelle réservation express attribuée",
        message: `Vous avez été sélectionné pour la réservation "${booking.service.name}" le ${booking.bookingDate.toLocaleDateString('fr-FR')}.`,
        type: "EXPRESS_ASSIGNED",
        link: `/artisan/rendez-vous`
      }
    })

    // Créer une notification pour le client
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: "Artisan attribué à votre réservation",
        message: `L'artisan ${artisan.name} a été attribué à votre réservation "${booking.service.name}".`,
        type: "EXPRESS_ARTISAN_ASSIGNED",
        link: `/client/reservations/${bookingId}`
      }
    })

    // Envoyer un email à l'artisan
    try {
      const emailTemplate = getExpressAssignmentEmailTemplate({
        artisanName: artisan.name || '',
        serviceName: booking.service.name,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        clientName: booking.clientName,
        address: `${booking.address}, ${booking.city} ${booking.postalCode}`,
        price: booking.price,
        specialRequirements: booking.specialRequirements || '',
        notes: booking.notes || '',
        bookingId: booking.id
      })

      await sendEmail({
        to: artisan.email,
        subject: `🚀 Nouvelle réservation express attribuée - ${booking.service.name}`,
        html: emailTemplate.html,
        text: emailTemplate.text
      })

      console.log(`Email d'attribution envoyé à l'artisan ${artisan.email}`)
    } catch (emailError) {
      console.error("Erreur lors de l'envoi de l'email à l'artisan:", emailError)
      // Ne pas faire échouer la requête si l'email échoue
    }

    console.log(`✅ Réservation express ${bookingId} attribuée à l'artisan ${artisanId} par ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: "Réservation attribuée avec succès",
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        assignedArtisan: {
          id: updatedBooking.assignedArtisan?.id,
          name: updatedBooking.assignedArtisan?.name,
          email: updatedBooking.assignedArtisan?.email
        },
        assignedAt: updatedBooking.assignedAt
      }
    })

  } catch (error) {
    console.error("Erreur lors de l'attribution de la réservation express:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'attribution de la réservation" },
      { status: 500 }
    )
  }
} 