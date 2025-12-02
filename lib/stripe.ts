import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

// Types pour les métadonnées Stripe
export type StripeMetadata = {
  userId?: string
  expressBookingId?: string
  subscriptionPlanId?: string
  projectId?: string
  type?: 'express_booking' | 'subscription' | 'project_deposit'
}

// Configuration des webhooks Stripe
export const STRIPE_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
] as const

// Méthodes utilitaires pour Stripe

/**
 * Crée un PaymentIntent pour un paiement Express
 */
export async function createExpressBookingPaymentIntent(
  amount: number,
  currency: string = 'eur',
  metadata: StripeMetadata
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe utilise les centimes
    currency,
    metadata: {
      ...metadata,
      type: 'express_booking',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

/**
 * Crée ou récupère un client Stripe
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<Stripe.Customer> {
  // Rechercher un client existant par email
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0]
  }

  // Créer un nouveau client
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      userId,
    },
  })
}

/**
 * Crée un abonnement Stripe pour un artisan
 */
export async function createArtisanSubscription(
  customerId: string,
  priceId: string,
  metadata: StripeMetadata,
  trialPeriodDays?: number
): Promise<Stripe.Subscription> {
  const subscriptionData: Stripe.SubscriptionCreateParams = {
    customer: customerId,
    items: [{ price: priceId }],
    metadata: {
      ...metadata,
      type: 'subscription',
    },
    payment_behavior: 'default_incomplete',
    payment_settings: {
      save_default_payment_method: 'on_subscription',
    },
    expand: ['latest_invoice.payment_intent'],
  }

  if (trialPeriodDays) {
    subscriptionData.trial_period_days = trialPeriodDays
  }

  return await stripe.subscriptions.create(subscriptionData)
}

/**
 * Met à jour un abonnement Stripe
 */
export async function updateArtisanSubscription(
  subscriptionId: string,
  updates: Partial<Stripe.SubscriptionUpdateParams>
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, updates)
}

/**
 * Annule un abonnement Stripe
 */
export async function cancelArtisanSubscription(
  subscriptionId: string,
  atPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: atPeriodEnd,
  })
}

/**
 * Crée un produit et prix Stripe pour un plan d'abonnement
 */
export async function createSubscriptionPlanInStripe(
  name: string,
  description: string,
  priceInEur: number
): Promise<{ product: Stripe.Product; price: Stripe.Price }> {
  // Créer le produit
  const product = await stripe.products.create({
    name,
    description,
    type: 'service',
  })

  // Créer le prix
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(priceInEur * 100), // Convertir en centimes
    currency: 'eur',
    recurring: {
      interval: 'month',
    },
  })

  return { product, price }
}

/**
 * Récupère les détails d'un paiement Stripe
 */
export async function getStripePaymentDetails(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Récupère les détails d'un abonnement Stripe
 */
export async function getStripeSubscriptionDetails(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  })
}

/**
 * Crée un portail client Stripe pour gérer l'abonnement
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Formate un montant Stripe (centimes) en euros
 */
export function formatStripeAmount(amount: number): number {
  return amount / 100
}

/**
 * Formate un montant en euros pour Stripe (centimes)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100)
} 