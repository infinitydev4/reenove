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

    // Récupérer les projets où l'artisan a été invité (représentent les conversations)
    const projectsWithClients = await prisma.project.findMany({
      where: {
        invitations: {
          some: {
            userId: artisanId
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        invitations: {
          where: {
            userId: artisanId
          },
          select: {
            message: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    // Formater les conversations
    const conversations = projectsWithClients.map(project => {
      const invitation = project.invitations[0]
      
      return {
        id: `conv-${project.id}`,
        contact: {
          name: project.user?.name || "Client anonyme",
          avatar: project.user?.image || "/placeholder.svg",
          status: "offline" // Par défaut offline, à améliorer plus tard
        },
        lastMessage: {
          content: invitation?.message || "Nouvelle invitation de projet",
          timestamp: invitation?.createdAt ? 
            new Date(invitation.createdAt).toLocaleDateString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            }) : "Récent",
          isRead: true
        },
        unreadCount: 0, // À implémenter plus tard avec un vrai système de messages
        projectTitle: project.title
      }
    })

    return NextResponse.json({
      success: true,
      conversations
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages" },
      { status: 500 }
    )
  }
} 