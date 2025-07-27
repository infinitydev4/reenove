import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { 
  createExpressBookingPaymentIntent, 
  getOrCreateStripeCustomer,
  getStripePaymentDetails,
  formatStripeAmount
} from "@/lib/stripe"
import { z } from "zod"

const createPaymentSchema = z.object({
  return_url: z.string().url().optional(),
})

// Créer un PaymentIntent pour une réservation Express
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour effectuer un paiement" },
        { status: 401 }
      )
    }

    const bookingId = params.id
    const body = await request.json()
    const { return_url } = createPaymentSchema.parse(body)

    // Récupérer la réservation
    const booking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le propriétaire de la réservation
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à payer cette réservation" },
        { status: 403 }
      )
    }

    // Vérifier que la réservation n'est pas déjà payée
    const existingPayment = await prisma.payment.findFirst({
      where: {
        expressBookingId: bookingId,
        status: 'SUCCEEDED',
      },
    })

    if (existingPayment) {
      return NextResponse.json(
        { error: "Cette réservation a déjà été payée" },
        { status: 400 }
      )
    }

    // Créer ou récupérer le client Stripe
    const stripeCustomer = await getOrCreateStripeCustomer(
      session.user.id!,
      session.user.email,
      session.user.name || undefined
    )

    // Créer le PaymentIntent
    const paymentIntent = await createExpressBookingPaymentIntent(
      booking.price,
      'eur',
      {
        userId: session.user.id!,
        expressBookingId: bookingId,
        type: 'express_booking',
      }
    )

    // Enregistrer le paiement en base
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id!,
        amount: booking.price,
        currency: 'eur',
        status: 'PENDING',
        type: 'EXPRESS_BOOKING',
        stripePaymentId: paymentIntent.id,
        expressBookingId: bookingId,
        description: `Paiement service Express: ${booking.service.name}`,
        metadata: {
          customerName: booking.clientName,
          serviceId: booking.serviceId,
          bookingDate: booking.bookingDate.toISOString(),
        },
      },
    })

    console.log(`✅ PaymentIntent créé pour la réservation ${bookingId}:`, paymentIntent.id)

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      customer_id: stripeCustomer.id,
      payment_id: payment.id,
    })

  } catch (error) {
    console.error("❌ Erreur lors de la création du PaymentIntent:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    )
  }
}

// Vérifier le statut d'un paiement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const bookingId = params.id

    // Récupérer la réservation et ses paiements
    const booking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
      include: {
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        user: true,
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier les permissions (propriétaire ou admin)
    if (booking.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    // Récupérer les détails du dernier paiement depuis Stripe si nécessaire
    const latestPayment = booking.payments[0]
    let stripePaymentDetails = null

    if (latestPayment?.stripePaymentId) {
      try {
        stripePaymentDetails = await getStripePaymentDetails(latestPayment.stripePaymentId)
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des détails Stripe:", error)
      }
    }

    return NextResponse.json({
      booking: {
        id: booking.id,
        serviceName: booking.service.name,
        clientName: booking.clientName,
        price: booking.price,
        status: booking.status,
        bookingDate: booking.bookingDate,
      },
      payments: booking.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        type: payment.type,
        description: payment.description,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
      })),
      stripeDetails: stripePaymentDetails ? {
        id: stripePaymentDetails.id,
        amount: formatStripeAmount(stripePaymentDetails.amount),
        currency: stripePaymentDetails.currency,
        status: stripePaymentDetails.status,
        created: new Date(stripePaymentDetails.created * 1000),
      } : null,
    })

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du paiement:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du statut de paiement" },
      { status: 500 }
    )
  }
} 