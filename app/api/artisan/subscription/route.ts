import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { 
  getOrCreateStripeCustomer,
  createArtisanSubscription,
  getStripeSubscriptionDetails,
  createCustomerPortalSession
} from "@/lib/stripe"
import { z } from "zod"

const createSubscriptionSchema = z.object({
  subscriptionPlanId: z.string().min(1, "Plan d'abonnement requis"),
  return_url: z.string().url().optional(),
})

// Récupérer l'abonnement de l'artisan connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: {
          include: {
            subscriptionPlan: true,
            payments: {
              where: { type: 'SUBSCRIPTION' },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
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
        { error: "Seuls les artisans peuvent avoir un abonnement" },
        { status: 403 }
      )
    }

    // Si pas d'abonnement, récupérer les plans disponibles
    if (!user.subscription) {
      const availablePlans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: [
          { isPopular: 'desc' },
          { price: 'asc' },
        ],
      })

      return NextResponse.json({
        subscription: null,
        availablePlans: availablePlans.map(plan => ({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          type: plan.type,
          price: plan.price,
          features: plan.features,
          maxProjects: plan.maxProjects,
          maxRadius: plan.maxRadius,
          commissionRate: plan.commissionRate,
          isPopular: plan.isPopular,
        })),
      })
    }

    // Récupérer les détails Stripe si disponibles
    let stripeDetails = null
    if (user.subscription.stripeSubscriptionId) {
      try {
        stripeDetails = await getStripeSubscriptionDetails(user.subscription.stripeSubscriptionId)
      } catch (error) {
        console.error("❌ Erreur Stripe:", error)
      }
    }

    return NextResponse.json({
      subscription: {
        id: user.subscription.id,
        status: user.subscription.status,
        currentPeriodStart: user.subscription.currentPeriodStart,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        cancelledAt: user.subscription.cancelledAt,
        trialStart: user.subscription.trialStart,
        trialEnd: user.subscription.trialEnd,
        plan: {
          id: user.subscription.subscriptionPlan.id,
          name: user.subscription.subscriptionPlan.name,
          description: user.subscription.subscriptionPlan.description,
          type: user.subscription.subscriptionPlan.type,
          price: user.subscription.subscriptionPlan.price,
          features: user.subscription.subscriptionPlan.features,
          maxProjects: user.subscription.subscriptionPlan.maxProjects,
          maxRadius: user.subscription.subscriptionPlan.maxRadius,
          commissionRate: user.subscription.subscriptionPlan.commissionRate,
        },
        payments: user.subscription.payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          description: payment.description,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
      },
      stripeDetails: stripeDetails ? {
        status: stripeDetails.status,
        currentPeriodStart: stripeDetails.current_period_start 
          ? new Date(stripeDetails.current_period_start * 1000) 
          : new Date(),
        currentPeriodEnd: stripeDetails.current_period_end 
          ? new Date(stripeDetails.current_period_end * 1000) 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: stripeDetails.cancel_at_period_end,
      } : null,
    })

  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'abonnement:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Créer un nouvel abonnement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscriptionPlanId, return_url } = createSubscriptionSchema.parse(body)

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

    // Debug: Afficher l'état de l'abonnement
    console.log(`📋 État abonnement pour ${user.email}:`, {
      hasSubscription: !!user.subscription,
      status: user.subscription?.status,
      subscriptionId: user.subscription?.id
    })

    // Vérifier que c'est bien un artisan
    if (user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: "Seuls les artisans peuvent s'abonner" },
        { status: 403 }
      )
    }

    // Vérifier qu'il n'a pas déjà un abonnement actif
    // Pendant l'onboarding, on permet de changer de plan même avec un abonnement INCOMPLETE
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      console.log(`❌ Abonnement ACTIVE détecté pour ${user.email}, refus de création`)
      return NextResponse.json(
        { error: "Vous avez déjà un abonnement actif" },
        { status: 400 }
      )
    }

    // Si un abonnement INCOMPLETE existe, le supprimer pour permettre le nouveau choix
    if (user.subscription && user.subscription.status === 'INCOMPLETE') {
      await prisma.artisanSubscription.delete({
        where: { userId: user.id }
      })
      console.log(`🔄 Abonnement INCOMPLETE supprimé pour permettre nouvelle sélection:`, user.email)
      
      // Rafraîchir les données utilisateur après suppression
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          subscription: true,
        },
      })
      
      // Vérifier à nouveau s'il y a un abonnement actif après suppression
      if (updatedUser?.subscription && updatedUser.subscription.status === 'ACTIVE') {
        return NextResponse.json(
          { error: "Vous avez déjà un abonnement actif" },
          { status: 400 }
        )
      }
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

    if (!subscriptionPlan.stripePriceId) {
      return NextResponse.json(
        { error: "Plan d'abonnement non configuré avec Stripe" },
        { status: 400 }
      )
    }

    // Créer ou récupérer le client Stripe
    const stripeCustomer = await getOrCreateStripeCustomer(
      user.id,
      user.email!,
      user.name || undefined
    )

    // Créer l'abonnement Stripe
    const stripeSubscription = await createArtisanSubscription(
      stripeCustomer.id,
      subscriptionPlan.stripePriceId,
      {
        userId: user.id,
        subscriptionPlanId: subscriptionPlanId,
        type: 'subscription',
      },
      14 // Période d'essai de 14 jours
    )

    // Créer l'abonnement en base de données
    const artisanSubscription = await prisma.artisanSubscription.create({
      data: {
        userId: user.id,
        subscriptionPlanId: subscriptionPlanId,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeCustomer.id,
        status: 'INCOMPLETE', // Sera mis à jour par le webhook
        currentPeriodStart: stripeSubscription.current_period_start 
          ? new Date(stripeSubscription.current_period_start * 1000)
          : new Date(),
        currentPeriodEnd: stripeSubscription.current_period_end 
          ? new Date(stripeSubscription.current_period_end * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
      },
    })

    console.log(`✅ Abonnement créé pour l'artisan ${user.id}:`, artisanSubscription.id)

    // Récupérer le client_secret du PaymentIntent pour finaliser le paiement
    const latestInvoice = stripeSubscription.latest_invoice as any
    const paymentIntent = latestInvoice?.payment_intent

    return NextResponse.json({
      subscription: {
        id: artisanSubscription.id,
        status: artisanSubscription.status,
        trialEnd: artisanSubscription.trialEnd,
      },
      paymentIntent: paymentIntent ? {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
      } : null,
    }, { status: 201 })

  } catch (error) {
    console.error("❌ Erreur lors de la création de l'abonnement:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de l'abonnement" },
      { status: 500 }
    )
  }
}

// Générer un lien vers le portail client Stripe
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action !== 'portal') {
      return NextResponse.json(
        { error: "Action non supportée" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true,
      },
    })

    if (!user?.subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé ou client Stripe manquant" },
        { status: 404 }
      )
    }

    // Créer une session portail client
    const portalSession = await createCustomerPortalSession(
      user.subscription.stripeCustomerId,
      `${process.env.NEXTAUTH_URL}/artisan/parametres?tab=abonnement`
    )

    return NextResponse.json({
      url: portalSession.url,
    })

  } catch (error) {
    console.error("❌ Erreur lors de la création du portail client:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du portail client" },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un abonnement INCOMPLETE (non payé)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

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

    // Vérifier qu'il y a un abonnement
    if (!user.subscription) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé" },
        { status: 404 }
      )
    }

    // Ne supprimer que les abonnements INCOMPLETE (non payés)
    if (user.subscription.status !== 'INCOMPLETE') {
      return NextResponse.json(
        { error: "Seuls les abonnements incomplets peuvent être supprimés" },
        { status: 400 }
      )
    }

    // Supprimer l'abonnement de la base de données
    await prisma.artisanSubscription.delete({
      where: { userId: user.id }
    })

    console.log(`🗑️ Abonnement INCOMPLETE supprimé pour ${user.email}`)

    return NextResponse.json({
      message: "Abonnement incomplet supprimé avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonnement:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'abonnement" },
      { status: 500 }
    )
  }
} 