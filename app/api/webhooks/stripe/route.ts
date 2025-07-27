import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe, STRIPE_WEBHOOK_EVENTS } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { sendArtisanWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error("❌ Signature Stripe manquante")
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 }
      )
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET non configuré")
      return NextResponse.json(
        { error: "Configuration webhook manquante" },
        { status: 500 }
      )
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (error) {
      console.error("❌ Erreur de signature webhook Stripe:", error)
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 400 }
      )
    }

    console.log(`🎉 Webhook Stripe reçu: ${event.type}`)

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`⚠️ Événement webhook non géré: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error("❌ Erreur dans le webhook Stripe:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Gestionnaires d'événements

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`✅ Paiement réussi: ${paymentIntent.id}`)

    // Vérifier le type de paiement dans les métadonnées
    const paymentType = paymentIntent.metadata.type

    if (paymentType === 'subscription_first_payment') {
      // Gérer le premier paiement d'abonnement
      await handleSubscriptionFirstPayment(paymentIntent)
      return
    }

    // Gérer les paiements Express (comportement existant)
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id },
      include: {
        expressBooking: true,
      },
    })

    if (!payment) {
      console.error(`❌ Paiement non trouvé pour PaymentIntent: ${paymentIntent.id}`)
      return
    }

    // Mettre à jour le statut du paiement
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
        metadata: {
          ...(payment.metadata as object || {}),
          stripeAmount: paymentIntent.amount,
          stripeCreated: new Date(paymentIntent.created * 1000),
        },
      },
    })

    // Si c'est un paiement de réservation Express, confirmer la réservation
    if (payment.expressBookingId) {
      await prisma.expressBooking.update({
        where: { id: payment.expressBookingId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      })

      console.log(`✅ Réservation Express confirmée: ${payment.expressBookingId}`)
    }

  } catch (error) {
    console.error("❌ Erreur lors du traitement payment_intent.succeeded:", error)
  }
}

// Nouvelle fonction pour gérer le premier paiement d'abonnement
async function handleSubscriptionFirstPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId
    const subscriptionPlanId = paymentIntent.metadata.subscriptionPlanId

    if (!userId || !subscriptionPlanId) {
      console.error("❌ Métadonnées manquantes pour l'abonnement:", paymentIntent.metadata)
      return
    }

    console.log(`💳 Premier paiement d'abonnement réussi pour l'utilisateur ${userId}`)

    // Vérifier si l'abonnement n'existe pas déjà
    const existingSubscription = await prisma.artisanSubscription.findUnique({
      where: { userId: userId }
    })

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      console.log(`⚠️ Abonnement déjà actif pour l'utilisateur ${userId}`)
      return
    }

    // Récupérer le plan d'abonnement
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: subscriptionPlanId },
    })

    if (!subscriptionPlan) {
      console.error(`❌ Plan d'abonnement non trouvé: ${subscriptionPlanId}`)
      return
    }

    // Créer l'abonnement Stripe récurrent
    const stripeSubscription = await stripe.subscriptions.create({
      customer: paymentIntent.customer as string,
      items: [
        {
          price: subscriptionPlan.stripePriceId!,
        },
      ],
      trial_period_days: 14, // 14 jours d'essai gratuits
      metadata: {
        userId: userId,
        subscriptionPlanId: subscriptionPlanId,
      },
    })

    // Supprimer l'ancien abonnement INCOMPLETE s'il existe
    if (existingSubscription) {
      await prisma.artisanSubscription.delete({
        where: { userId: userId }
      })
    }

    // Créer l'abonnement en base de données avec protection contre les race conditions
    let artisanSubscription
    try {
      artisanSubscription = await prisma.artisanSubscription.create({
        data: {
          userId: userId,
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

      console.log(`✅ Abonnement créé automatiquement via webhook:`, {
        subscriptionId: artisanSubscription.id,
        stripeSubscriptionId: stripeSubscription.id,
        userId: userId,
        plan: subscriptionPlan.name
      })

      // Envoyer l'email de bienvenue artisan
      try {
        // Récupérer les informations utilisateur
        const user = await prisma.user.findUnique({
          where: { id: userId }
        })

        if (user) {
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
          console.log(`📧 Email de bienvenue envoyé via webhook à ${user.email}`)
        }
      } catch (emailError) {
        console.error('Erreur lors de l\'envoi de l\'email de bienvenue via webhook:', emailError)
        // Ne pas faire échouer le webhook si l'email ne peut pas être envoyé
      }

    } catch (dbError: any) {
      // Si l'abonnement existe déjà (race condition avec API complete), l'ignorer
      if (dbError.code === 'P2002') {
        console.log(`⚠️ Abonnement déjà créé via API pour l'utilisateur ${userId} - webhook ignoré`)
        return
      }
      throw dbError // Re-throw si ce n'est pas une erreur de contrainte unique
    }

  } catch (error) {
    console.error("❌ Erreur lors du traitement du premier paiement d'abonnement:", error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`❌ Paiement échoué: ${paymentIntent.id}`)

    const payment = await prisma.payment.findUnique({
      where: { stripePaymentId: paymentIntent.id },
    })

    if (!payment) {
      console.error(`❌ Paiement non trouvé pour PaymentIntent: ${paymentIntent.id}`)
      return
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        metadata: {
          ...(payment.metadata as object || {}),
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    })

  } catch (error) {
    console.error("❌ Erreur lors du traitement payment_intent.payment_failed:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`✅ Facture payée: ${invoice.id}`)

    // Récupérer l'abonnement associé
    if (!invoice.subscription) return

    const subscription = await prisma.artisanSubscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    })

    if (!subscription) {
      console.error(`❌ Abonnement non trouvé pour la facture: ${invoice.id}`)
      return
    }

    // Créer un enregistrement de paiement pour la facture
    await prisma.payment.create({
      data: {
        userId: subscription.userId,
        amount: (invoice.amount_paid || 0) / 100, // Convertir centimes en euros
        currency: invoice.currency || 'eur',
        status: 'SUCCEEDED',
        type: 'SUBSCRIPTION',
        stripeInvoiceId: invoice.id,
        artisanSubscriptionId: subscription.id,
        description: `Paiement abonnement - Période ${invoice.period_start ? new Date(invoice.period_start * 1000).toLocaleDateString() : 'Non définie'}`,
        paidAt: new Date(),
        metadata: {
          invoiceNumber: invoice.number,
          periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : new Date(),
          periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    })

    // Mettre à jour le statut de l'abonnement
    await prisma.artisanSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : new Date(),
        currentPeriodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    console.log(`✅ Abonnement mis à jour: ${subscription.id}`)

  } catch (error) {
    console.error("❌ Erreur lors du traitement invoice.payment_succeeded:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`❌ Paiement de facture échoué: ${invoice.id}`)

    if (!invoice.subscription) return

    const subscription = await prisma.artisanSubscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
    })

    if (!subscription) return

    // Mettre à jour le statut de l'abonnement
    await prisma.artisanSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'PAST_DUE',
      },
    })

    console.log(`⚠️ Abonnement en retard de paiement: ${subscription.id}`)

  } catch (error) {
    console.error("❌ Erreur lors du traitement invoice.payment_failed:", error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log(`✅ Abonnement créé: ${subscription.id}`)
    // La création de l'abonnement sera gérée côté application
  } catch (error) {
    console.error("❌ Erreur lors du traitement customer.subscription.created:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log(`🔄 Abonnement mis à jour: ${subscription.id}`)

    const artisanSubscription = await prisma.artisanSubscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    })

    if (!artisanSubscription) return

    // Mapper le statut Stripe vers notre statut
    let status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' | 'INCOMPLETE' = 'ACTIVE'
    
    switch (subscription.status) {
      case 'active':
        status = 'ACTIVE'
        break
      case 'past_due':
        status = 'PAST_DUE'
        break
      case 'canceled':
        status = 'CANCELLED'
        break
      case 'unpaid':
        status = 'UNPAID'
        break
      case 'incomplete':
        status = 'INCOMPLETE'
        break
    }

    await prisma.artisanSubscription.update({
      where: { id: artisanSubscription.id },
      data: {
        status,
        currentPeriodStart: subscription.current_period_start 
          ? new Date(subscription.current_period_start * 1000) 
          : new Date(),
        currentPeriodEnd: subscription.current_period_end 
          ? new Date(subscription.current_period_end * 1000) 
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
      },
    })

    console.log(`✅ Abonnement artisan mis à jour: ${artisanSubscription.id}`)

  } catch (error) {
    console.error("❌ Erreur lors du traitement customer.subscription.updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log(`❌ Abonnement supprimé: ${subscription.id}`)

    await prisma.artisanSubscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    })

  } catch (error) {
    console.error("❌ Erreur lors du traitement customer.subscription.deleted:", error)
  }
} 