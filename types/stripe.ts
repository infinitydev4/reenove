export interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export interface StripeCustomer {
  id: string
  email: string
  name?: string
}

export interface PaymentResult {
  paymentIntent: PaymentIntent
  customer_id: string
  payment_id: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  type: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  price: number
  features: string[]
  maxProjects: number | null
  maxRadius: number | null
  commissionRate: number | null
  isPopular: boolean
}

export interface ArtisanSubscription {
  id: string
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' | 'INCOMPLETE'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  cancelledAt: Date | null
  trialStart: Date | null
  trialEnd: Date | null
  plan: SubscriptionPlan
  payments: Payment[]
}

export interface Payment {
  id: string
  amount: number
  currency: string
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
  type: 'EXPRESS_BOOKING' | 'SUBSCRIPTION' | 'PROJECT_DEPOSIT'
  description: string | null
  createdAt: Date
  paidAt: Date | null
}

export interface StripeElements {
  paymentElement?: any
}

export interface PaymentElementOptions {
  mode: 'payment' | 'subscription'
  amount?: number
  currency?: string
  setup_future_usage?: 'off_session' | 'on_session'
} 