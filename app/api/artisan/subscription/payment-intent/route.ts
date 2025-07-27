import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { z } from "zod"

const createPaymentIntentSchema = z.object({
  subscriptionPlanId: z.string().min(1, "ID du plan requis"),
})

// POST - Créer une intention de paiement pour un abonnement (sans créer l'abonnement en base)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscriptionPlanId } = createPaymentIntentSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que c'est bien un artisan
    if (user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: "Seuls les artisans peuvent s'abonner" },
        { status: 403 }
      )
    }

    // Vérifier qu'il n'a pas déjà un abonnement actif
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: "Vous avez déjà un abonnement actif" },
        { status: 400 }
      )
    }

    // Récupérer le plan d'abonnement
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
    })

    if (!subscriptionPlan || !subscriptionPlan.isActive) {
      return NextResponse.json(
        { error: "Plan d'abonnement non trouvé ou inactif" },
        { status: 404 }
      )
    }

    // Créer ou récupérer le client Stripe
    let stripeCustomerId = null
    const existingCustomers = await stripe.customers.list({
      email: user.email || undefined,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      stripeCustomerId = existingCustomers.data[0].id
    } else {
      const stripeCustomer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
          subscriptionPlanId: subscriptionPlanId,
        },
      })
      stripeCustomerId = stripeCustomer.id
    }

    // Créer une intention de paiement pour le premier mois
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(subscriptionPlan.price * 100), // Convertir en centimes
      currency: 'eur',
      customer: stripeCustomerId,
      metadata: {
        userId: user.id,
        subscriptionPlanId: subscriptionPlanId,
        type: 'subscription_first_payment',
      },
      description: `Premier paiement - Abonnement ${subscriptionPlan.name}`,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log(`💳 Intention de paiement créée pour ${user.email}:`, {
      paymentIntentId: paymentIntent.id,
      amount: subscriptionPlan.price,
      plan: subscriptionPlan.name
    })

    return NextResponse.json({
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: subscriptionPlan.price,
      },
      plan: subscriptionPlan,
    })

  } catch (error) {
    console.error("Erreur lors de la création de l'intention de paiement:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'intention de paiement" },
      { status: 500 }
    )
  }
} 