import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Désactiver le cache pour cette API en production
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Récupérer tous les services Express actifs avec leurs catégories
    const expressServices = await prisma.service.findMany({
      where: {
        isActive: true,
        isExpressAvailable: true,
        expressPrice: {
          not: null, // S'assurer qu'un prix Express est défini
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            slug: true,
          },
        },
      },
      orderBy: [
        {
          isPopular: "desc", // Services populaires en premier
        },
        {
          category: {
            order: "asc",
          },
        },
        {
          order: "asc",
        },
      ],
    })

    // Formatter la réponse pour le frontend
    const formattedServices = expressServices.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description,
      expressDescription: service.expressDescription,
      slug: service.slug,
      icon: service.icon,
      price: service.expressPrice,
      estimatedDuration: service.estimatedDuration,
      isPopular: service.isPopular,
      category: {
        id: service.category.id,
        name: service.category.name,
        icon: service.category.icon,
        slug: service.category.slug,
      },
    }))

    // Grouper par catégorie pour l'affichage
    const servicesByCategory = formattedServices.reduce((acc, service) => {
      const categoryId = service.category.id
      if (!acc[categoryId]) {
        acc[categoryId] = {
          category: service.category,
          services: [],
        }
      }
      acc[categoryId].services.push(service)
      return acc
    }, {} as Record<string, { category: any; services: any[] }>)

    const finalServicesByCategory = Object.values(servicesByCategory)

    const response = NextResponse.json({
      services: formattedServices,
      servicesByCategory: finalServicesByCategory,
      totalServices: formattedServices.length,
    })

    // Ajouter des headers anti-cache pour éviter le cache en production
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
    
  } catch (error) {
    console.error("Erreur lors de la récupération des services Express:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des services Express" },
      { status: 500 }
    )
  }
} 