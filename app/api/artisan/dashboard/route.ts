import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== Role.ARTISAN) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const artisanId = session.user.id

    // Récupérer les projets où l'artisan a été invité et accepté
    const activeProjects = await prisma.project.findMany({
      where: {
        invitations: {
          some: {
            userId: artisanId,
            status: "pending" // Invitations acceptées
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    })

    // Récupérer les devis de l'artisan (providerId = artisan qui fait le devis)
    const pendingQuotes = await prisma.quote.findMany({
      where: {
        providerId: artisanId
      },
      include: {
        project: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    })

    // Récupérer les notifications récentes non lues
    const recentNotifications = await prisma.notification.findMany({
      where: {
        userId: artisanId,
        isRead: false
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    })

    // Calculer les statistiques
    const totalProjects = await prisma.project.count({
      where: {
        invitations: {
          some: {
            userId: artisanId,
            status: "pending"
          }
        }
      }
    })

    const completedProjects = await prisma.project.count({
      where: {
        invitations: {
          some: {
            userId: artisanId,
            status: "pending"
          }
        },
        status: "COMPLETED"
      }
    })

    const inProgressProjects = await prisma.project.count({
      where: {
        invitations: {
          some: {
            userId: artisanId,
            status: "pending"
          }
        },
        status: "IN_PROGRESS"
      }
    })

    const pendingQuotesCount = await prisma.quote.count({
      where: {
        providerId: artisanId,
        status: "pending"
      }
    })

    const stats = {
      totalProjects,
      activeProjects: inProgressProjects,
      completedProjects,
      pendingQuotesCount
    }

    // Formater les données pour le frontend
    return NextResponse.json({
      success: true,
      data: {
        activeProjects: activeProjects.map(project => ({
          id: project.id,
          client: project.user?.name || "Client non renseigné",
          title: project.title,
          category: project.category?.name || "Non catégorisé",
          location: `${project.city || ''} ${project.postalCode || ''}`.trim() || "Adresse non renseignée",
          budget: project.budget ? `${project.budget.toLocaleString()} €` : "Budget non défini",
          status: project.status,
          createdAt: project.createdAt,
          quote: null
        })),
        pendingQuotes: pendingQuotes.map(quote => ({
          id: quote.id,
          client: quote.project?.user?.name || "Client non renseigné",
          project: quote.project?.title || "Projet non renseigné",
          category: quote.project?.category?.name || "Non catégorisé",
          amount: `${quote.amount.toLocaleString()} €`,
          date: quote.createdAt,
          status: quote.status
        })),
        recentNotifications: recentNotifications.map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          date: notification.createdAt,
          read: notification.isRead,
          type: notification.type
        })),
        stats
      }
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des données du dashboard:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des données" },
      { status: 500 }
    )
  }
} 