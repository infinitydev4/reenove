import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"
import { z } from "zod"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification de l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    
    // Vérifier que l'utilisateur est un client
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        role: true,
      },
    })
    
    if (!user || user.role !== Role.USER) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }
    
    const projectId = params.id
    
    // Récupérer les détails du projet
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: user.id, // S'assurer que le projet appartient à l'utilisateur connecté
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
          orderBy: {
            order: "asc"
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
                name: true,
              },
            },
          },
        },
      },
    })
    
    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }
    
    // Formatter la réponse
    const formattedProject = {
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      categoryId: project.categoryId,
      categoryName: project.category?.name,
      serviceId: project.serviceId,
      serviceName: project.service?.name,
      budget: project.budget,
      budgetType: project.budgetType,
      budgetMax: project.budgetMax,
      location: project.location,
      city: project.city,
      postalCode: project.postalCode,
      startDate: project.startDate,
      endDate: project.endDate,
      urgencyLevel: project.urgencyLevel,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      photos: project.images.map((image) => image.url),
      quotes: project.quotes.map((quote) => ({
        id: quote.id,
        amount: quote.amount,
        status: quote.status,
        providerName: quote.provider?.name || '',
      })),
    }
    
    console.log("Détails du projet récupérés:", { 
      id: formattedProject.id,
      title: formattedProject.title,
      photos: formattedProject.photos
    })
    
    return NextResponse.json(formattedProject)
    
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
} 