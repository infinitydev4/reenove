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
    
    // D'abord, essayer de récupérer un projet classique
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
    
    if (project) {
      // Formatter la réponse pour un projet classique
      const formattedProject = {
        id: project.id,
        type: 'PROJECT',
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
      
      return NextResponse.json(formattedProject)
    }

    // Si pas de projet classique, essayer de récupérer une réservation Express
    const expressBooking = await prisma.expressBooking.findUnique({
      where: {
        id: projectId,
        userId: user.id, // S'assurer que la réservation appartient à l'utilisateur
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            icon: true,
            expressDescription: true,
            estimatedDuration: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                icon: true
              }
            }
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
            createdAt: true,
            description: true
          }
        }
      }
    })

    if (expressBooking) {
      // Mapper les statuts Express vers les statuts de projet
      const mapExpressStatus = (status: string) => {
        switch (status) {
          case 'PENDING': return 'PENDING'
          case 'CONFIRMED': return 'ASSIGNED'
          case 'IN_PROGRESS': return 'IN_PROGRESS'
          case 'COMPLETED': return 'COMPLETED'
          case 'CANCELLED': return 'CANCELLED'
          default: return 'PENDING'
        }
      }

      const successfulPayment = expressBooking.payments.find(p => p.status === 'SUCCEEDED')

      // Formatter la réponse pour une réservation Express
      const formattedExpressBooking = {
        id: expressBooking.id,
        type: 'EXPRESS',
        title: `${expressBooking.service.name} - Reenove Express`,
        description: expressBooking.service.expressDescription || `Service Express de ${expressBooking.service.name}`,
        status: mapExpressStatus(expressBooking.status),
        categoryId: expressBooking.service.categoryId,
        categoryName: expressBooking.service.category?.name,
        serviceId: expressBooking.serviceId,
        serviceName: expressBooking.service.name,
        budget: expressBooking.price,
        budgetType: 'fixed',
        budgetMax: undefined,
        location: expressBooking.address,
        city: expressBooking.city,
        postalCode: expressBooking.postalCode,
        startDate: expressBooking.bookingDate,
        endDate: undefined,
        urgencyLevel: 'HIGH',
        createdAt: expressBooking.createdAt,
        updatedAt: expressBooking.updatedAt,
        photos: expressBooking.service.icon ? [expressBooking.service.icon] : (expressBooking.service.category?.icon ? [expressBooking.service.category.icon] : []),
        quotes: successfulPayment ? [{
          id: successfulPayment.id,
          amount: successfulPayment.amount,
          status: 'accepted',
          providerName: 'Reenove Express'
        }] : [],
        // Informations spécifiques Express
        expressBookingDate: expressBooking.bookingDate,
        expressTimeSlot: expressBooking.timeSlot,
        expressClientName: expressBooking.clientName,
        expressClientPhone: expressBooking.clientPhone,
        expressClientEmail: expressBooking.clientEmail,
        expressPrice: expressBooking.price,
        expressNotes: expressBooking.notes,
        expressSpecialRequirements: expressBooking.specialRequirements,
        expressFloor: expressBooking.floor,
        expressHasElevator: expressBooking.hasElevator,
        serviceIcon: expressBooking.service.icon,
        categoryIcon: expressBooking.service.category?.icon
      }

      return NextResponse.json(formattedExpressBooking)
    }

    // Ni projet ni réservation Express trouvé
    return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
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
    
    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: user.id, // S'assurer que le projet appartient à l'utilisateur connecté
      },
      select: {
        id: true,
        status: true,
      },
    })
    
    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }
    
    // Vérifier si le projet est dans un état qui permet la suppression
    const deletableStatuses = [
      "DRAFT", 
      "PUBLISHED", 
      "PENDING", 
      "CANCELLED"
    ];
    
    if (!deletableStatuses.includes(project.status)) {
      return NextResponse.json({ 
        error: "Impossible de supprimer un projet qui est déjà en cours ou terminé" 
      }, { status: 400 })
    }
    
    // Supprimer d'abord les relations (images, etc.)
    await prisma.projectImage.deleteMany({
      where: {
        projectId: project.id,
      },
    })
    
    // Supprimer le projet
    await prisma.project.delete({
      where: {
        id: project.id,
      },
    })
    
    console.log(`Projet ${projectId} supprimé avec succès par l'utilisateur ${user.id}`)
    
    return NextResponse.json({ 
      success: true,
      message: "Projet supprimé avec succès" 
    })
    
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
} 