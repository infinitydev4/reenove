import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/artisan/subscription-plans - Récupérer les plans actifs pour les artisans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur est un artisan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ARTISAN') {
      return NextResponse.json(
        { error: "Accès refusé - Rôle artisan requis" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    // Récupérer les plans d'abonnement
    const plans = await prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [
        { isPopular: 'desc' },
        { price: 'asc' }
      ]
    })

    console.log(`✅ ${plans.length} plans récupérés pour l'artisan ${session.user.email}`)

    return NextResponse.json({ plans })
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des plans:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
} 