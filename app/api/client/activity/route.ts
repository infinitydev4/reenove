import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

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
      return NextResponse.json({ error: "Accès réservés aux clients" }, { status: 403 })
    }

    // Récupérer les projets récents de l'utilisateur pour simuler l'activité
    const recentProjects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    })

    // Formater l'activité récente basée sur les projets
    const activities = recentProjects.map(project => {
      const daysSinceCreation = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      const daysSinceUpdate = Math.floor((Date.now() - new Date(project.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
      
      let timeLabel = ""
      if (daysSinceUpdate === 0) timeLabel = "Aujourd'hui"
      else if (daysSinceUpdate === 1) timeLabel = "Hier"
      else if (daysSinceUpdate < 7) timeLabel = `Il y a ${daysSinceUpdate} jours`
      else timeLabel = `Il y a ${Math.floor(daysSinceUpdate / 7)} semaines`
      
      // Simuler différents types d'activité selon le statut du projet
      let activityType = "project_created"
      let activityText = `Projet créé : ${project.title}`
      let icon = "FileClock"
      
      if (project.status === 'PUBLISHED') {
        activityType = "project_published"
        activityText = `Projet publié : ${project.title}`
        icon = "CheckCircle"
      } else if (project.status === 'IN_PROGRESS') {
        activityType = "project_in_progress" 
        activityText = `Projet en cours : ${project.title}`
        icon = "Clock"
      }
      
      return {
        id: `activity_${project.id}`,
        type: activityType,
        text: activityText,
        time: timeLabel,
        icon,
        projectId: project.id,
        createdAt: project.updatedAt.toISOString()
      }
    })

    return NextResponse.json({
      activities: activities.slice(0, 3) // Limiter à 3 activités récentes
    })
    
  } catch (error) {
    console.error("Erreur lors de la récupération de l'activité récente:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'activité récente" },
      { status: 500 }
    )
  }
} 