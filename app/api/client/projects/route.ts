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

    // Récupérer les réservations Express de l'utilisateur
    const expressBookings = await prisma.expressBooking.findMany({
      where: {
        userId: session.user.id
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
            paidAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transformer les projets classiques pour le frontend
    const formattedProjects = projects.map(project => {
      // Garder les URLs d'images telles quelles (y compris celles avec session:)
      const photoUrls = project.images.map(image => image.url);
      
      if (photoUrls.length > 0) {
        console.log(`📷 Projet ${project.title} - ${photoUrls.length} image(s) trouvée(s)`)
      }

      return {
        id: project.id,
        type: 'PROJECT',
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

    // Transformer les réservations Express pour le frontend
    const formattedExpressBookings = expressBookings.map(booking => {
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

      const successfulPayment = booking.payments.find(p => p.status === 'SUCCEEDED')

      return {
        id: booking.id,
        type: 'EXPRESS',
        title: `${booking.service.name} - Reenove Express`,
        description: booking.service.expressDescription || `Service Express de ${booking.service.name}`,
        status: mapExpressStatus(booking.status),
        categoryId: booking.service.categoryId,
        categoryName: booking.service.category?.name,
        serviceId: booking.serviceId,
        serviceName: booking.service.name,
        budget: booking.price,
        budgetType: 'fixed',
        budgetMax: undefined,
        location: booking.address,
        city: booking.city,
        postalCode: booking.postalCode,
        startDate: booking.bookingDate.toISOString(),
        endDate: undefined,
        urgencyLevel: 'HIGH',
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        completedAt: booking.completedAt ? booking.completedAt.toISOString() : undefined,
        photos: booking.service.icon ? [booking.service.icon] : (booking.service.category?.icon ? [booking.service.category.icon] : []),
        quotes: successfulPayment ? [{
          id: successfulPayment.id,
          amount: successfulPayment.amount,
          status: 'accepted',
          providerName: 'Reenove Express'
        }] : [],
        // Informations spécifiques Express
        expressBookingDate: booking.bookingDate.toISOString(),
        expressTimeSlot: booking.timeSlot,
        expressClientName: booking.clientName,
        expressClientPhone: booking.clientPhone,
        expressClientEmail: booking.clientEmail,
        serviceIcon: booking.service.icon,
        categoryIcon: booking.service.category?.icon
      }
    })

    // Combiner et trier tous les "projets" par date de mise à jour
    const allProjects = [...formattedProjects, ...formattedExpressBookings]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json(allProjects)
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  }
} 