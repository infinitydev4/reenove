import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, ProjectStatus } from "@/lib/generated/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que l'utilisateur est un client
    if (session.user.role !== Role.USER) {
      return NextResponse.json({ error: "Accès réservé aux clients" }, { status: 403 })
    }

    console.log(`Récupération des projets pour l'utilisateur ${session.user.id}`)

    // Récupérer les projets de l'utilisateur avec les catégories et services
    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true
          }
        },
        service: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          select: {
            url: true
          }
        },
        quotes: {
          select: {
            id: true,
            amount: true,
            status: true,
            provider: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transformer les données pour le frontend
    const formattedProjects = projects.map(project => {
      // Garder les URLs d'images telles quelles (y compris celles avec session:)
      const photoUrls = project.images.map(image => image.url);
      
      if (photoUrls.length > 0) {
        console.log(`📷 Projet ${project.title} - ${photoUrls.length} image(s) trouvée(s)`)
      }

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        categoryId: project.categoryId,
        categoryName: project.category?.name,
        serviceId: project.serviceId,
        serviceName: project.service?.name,
        budget: project.budget || undefined,
        budgetType: project.budgetType || undefined,
        budgetMax: project.budgetMax || undefined,
        location: project.location || undefined,
        city: project.city || undefined,
        postalCode: project.postalCode || undefined,
        startDate: project.startDate ? project.startDate.toISOString() : undefined,
        endDate: project.endDate ? project.endDate.toISOString() : undefined,
        urgencyLevel: project.urgencyLevel || undefined,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        completedAt: project.completedAt ? project.completedAt.toISOString() : undefined,
        photos: photoUrls,
        quotes: project.quotes.map(quote => ({
          id: quote.id,
          amount: quote.amount,
          status: quote.status,
          providerName: quote.provider.name
        }))
      }
    })

    return NextResponse.json(formattedProjects)
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  }
} 