import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createSubscriptionPlanInStripe } from "@/lib/stripe"
import { z } from "zod"

async function isAdmin(session: any) {
  if (!session?.user?.email) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  })

  return user?.role === 'ADMIN'
}

const createPlanSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  type: z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']),
  price: z.number().min(0, "Le prix doit être positif"),
  features: z.array(z.string()).optional(),
  maxProjects: z.number().int().min(1).nullable().optional(),
  maxRadius: z.number().int().min(1).nullable().optional(),
  commissionRate: z.number().min(0).max(100).nullable().optional(),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
})

// Récupérer tous les plans d'abonnement
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const plans = await prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { price: 'asc' },
      ],
    })

    return NextResponse.json({
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        type: plan.type,
        price: plan.price,
        stripeProductId: plan.stripeProductId,
        stripePriceId: plan.stripePriceId,
        features: plan.features,
        maxProjects: plan.maxProjects,
        maxRadius: plan.maxRadius,
        commissionRate: plan.commissionRate,
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        subscribersCount: plan._count.subscriptions,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      })),
    })

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des plans:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Créer un nouveau plan d'abonnement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!(await isAdmin(session))) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createPlanSchema.parse(body)

    // Créer le produit et prix dans Stripe
    const { product, price } = await createSubscriptionPlanInStripe(
      validatedData.name,
      validatedData.description || `Plan ${validatedData.name}`,
      validatedData.price
    )

    // Créer le plan en base de données
    const subscriptionPlan = await prisma.subscriptionPlan.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        price: validatedData.price,
        stripeProductId: product.id,
        stripePriceId: price.id,
        features: validatedData.features || [],
        maxProjects: validatedData.maxProjects,
        maxRadius: validatedData.maxRadius,
        commissionRate: validatedData.commissionRate,
        isActive: validatedData.isActive,
        isPopular: validatedData.isPopular,
      },
    })

    console.log(`✅ Plan d'abonnement créé:`, subscriptionPlan.name)

    return NextResponse.json({
      plan: {
        id: subscriptionPlan.id,
        name: subscriptionPlan.name,
        description: subscriptionPlan.description,
        type: subscriptionPlan.type,
        price: subscriptionPlan.price,
        stripeProductId: subscriptionPlan.stripeProductId,
        stripePriceId: subscriptionPlan.stripePriceId,
        features: subscriptionPlan.features,
        maxProjects: subscriptionPlan.maxProjects,
        maxRadius: subscriptionPlan.maxRadius,
        commissionRate: subscriptionPlan.commissionRate,
        isActive: subscriptionPlan.isActive,
        isPopular: subscriptionPlan.isPopular,
        createdAt: subscriptionPlan.createdAt,
        updatedAt: subscriptionPlan.updatedAt,
      },
    }, { status: 201 })

  } catch (error) {
    console.error("❌ Erreur lors de la création du plan:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du plan" },
      { status: 500 }
    )
  }
} 