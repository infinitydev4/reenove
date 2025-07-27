import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { z } from "zod"
import { sendArtisanWelcomeEmail } from "@/lib/email"

const completeSubscriptionSchema = z.object({
  paymentIntentId: z.string().min(1, "ID de l'intention de paiement requis"),
})

// POST - Finaliser l'abonnement après paiement réussi
export async function POST(request: NextRequest) {
  try {
    console.log(`🚀 API complete appelée`)
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { paymentIntentId } = completeSubscriptionSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: {
          include: {
            subscriptionPlan: true,
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

    // Vérifier l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: "Le paiement n'a pas été confirmé" },
        { status: 400 }
      )
    }

    // Vérifier que le paiement correspond à cet utilisateur
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json(
        { error: "Paiement non valide pour cet utilisateur" },
        { status: 403 }
      )
    }

    const subscriptionPlanId = paymentIntent.metadata.subscriptionPlanId
    if (!subscriptionPlanId) {
      return NextResponse.json(
        { error: "Plan d'abonnement non trouvé dans le paiement" },
        { status: 400 }
      )
    }

    // Récupérer le plan d'abonnement
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
    })

    if (!subscriptionPlan) {
      return NextResponse.json(
        { error: "Plan d'abonnement non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si l'abonnement existe déjà (créé par le webhook)
    if (user.subscription && user.subscription.status === 'ACTIVE') {
      console.log(`✅ Abonnement déjà créé par webhook pour ${user.email}:`, {
        subscriptionId: user.subscription.id,
        status: user.subscription.status
      })
      
      return NextResponse.json({
        subscription: user.subscription,
        plan: user.subscription.subscriptionPlan || subscriptionPlan,
        message: "Abonnement déjà activé avec succès"
      })
    }

    // Supprimer l'ancien abonnement INCOMPLETE s'il existe
    if (user.subscription && user.subscription.status === 'INCOMPLETE') {
      await prisma.artisanSubscription.delete({
        where: { userId: user.id }
      })
    }

    // Créer l'abonnement Stripe récurrent
    const stripeCustomer = await stripe.customers.retrieve(paymentIntent.customer as string)
    
    const stripeSubscription = await stripe.subscriptions.create({
      customer: paymentIntent.customer as string,
      items: [
        {
          price: subscriptionPlan.stripePriceId!,
        },
      ],
      trial_period_days: 14, // 14 jours d'essai gratuits
      metadata: {
        userId: user.id,
        subscriptionPlanId: subscriptionPlanId,
      },
    })

    // Créer l'abonnement en base de données avec protection contre les race conditions
    let artisanSubscription
    try {
      artisanSubscription = await prisma.artisanSubscription.create({
        data: {
          userId: user.id,
          subscriptionPlanId: subscriptionPlanId,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: paymentIntent.customer as string,
          status: 'ACTIVE',
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
    } catch (error: any) {
      // Si l'abonnement existe déjà (race condition avec webhook), le récupérer
      if (error.code === 'P2002') {
        console.log(`⚠️ Race condition détectée - récupération de l'abonnement existant pour ${user.email}`)
        
        const existingSubscription = await prisma.artisanSubscription.findUnique({
          where: { userId: user.id },
          include: { subscriptionPlan: true }
        })
        
        if (existingSubscription) {
          return NextResponse.json({
            subscription: existingSubscription,
            plan: existingSubscription.subscriptionPlan,
            message: "Abonnement déjà créé avec succès"
          })
        }
      }
      throw error // Re-throw si ce n'est pas une erreur de contrainte unique
    }

    console.log(`✅ Abonnement créé avec succès pour ${user.email}:`, {
      subscriptionId: artisanSubscription.id,
      stripeSubscriptionId: stripeSubscription.id,
      plan: subscriptionPlan.name,
      status: 'ACTIVE'
    })

    // Envoyer l'email de bienvenue artisan
    try {
      // Préparer les données pour l'email
      const subscriptionData = {
        id: artisanSubscription.id,
        planName: subscriptionPlan.name,
        price: subscriptionPlan.price,
        status: artisanSubscription.status,
        stripeSubscriptionId: artisanSubscription.stripeSubscriptionId,
        currentPeriodStart: artisanSubscription.currentPeriodStart,
        currentPeriodEnd: artisanSubscription.currentPeriodEnd,
        trialStart: artisanSubscription.trialStart,
        trialEnd: artisanSubscription.trialEnd,
        features: subscriptionPlan.features,
        maxProjects: subscriptionPlan.maxProjects,
        maxRadius: subscriptionPlan.maxRadius,
        commissionRate: subscriptionPlan.commissionRate,
      }

      const invoiceData = {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convertir de centimes en euros
        currency: paymentIntent.currency.toUpperCase(),
        status: 'Payé',
        paidAt: new Date(),
        invoiceNumber: `INV-${paymentIntent.id.substring(3, 10).toUpperCase()}`,
        paymentMethod: 'Carte bancaire',
      }

      await sendArtisanWelcomeEmail(user, subscriptionData, invoiceData)
      console.log(`📧 Email de bienvenue envoyé à ${user.email}`)
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', emailError)
      // Ne pas faire échouer la requête si l'email ne peut pas être envoyé
    }

    return NextResponse.json({
      subscription: artisanSubscription,
      plan: subscriptionPlan,
      message: "Abonnement créé avec succès"
    })

  } catch (error) {
    console.error("Erreur lors de la finalisation de l'abonnement:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la finalisation de l'abonnement" },
      { status: 500 }
    )
  }
} 