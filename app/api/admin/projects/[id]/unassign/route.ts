import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, ProjectStatus } from "@/lib/generated/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const projectId = params.id

    // Vérifier que le projet existe et est assigné
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: true,
        category: true,
        service: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    if (project.status !== ProjectStatus.ASSIGNED) {
      return NextResponse.json({ error: "Le projet n'est pas assigné" }, { status: 400 })
    }

    // Trouver l'invitation active pour ce projet
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId: projectId,
        status: "pending"
      },
      include: {
        user: true // user correspond à l'artisan
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: "Aucune attribution trouvée" }, { status: 404 })
    }

    // Marquer l'invitation comme refusée (pas de statut CANCELLED dans le schéma)
    await prisma.projectInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "declined"
      }
    })

    // Remettre le projet au statut PUBLISHED
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.PUBLISHED
      },
      include: {
        user: true,
        category: true,
        service: true
      }
    })

    // Créer une notification pour l'artisan
    await prisma.notification.create({
      data: {
        userId: invitation.userId, // userId correspond à l'artisan
        title: "Attribution de projet annulée",
        message: `L'attribution du projet "${project.title}" a été annulée par l'équipe Reenove.`,
        type: "PROJECT_UNASSIGNED",
        link: `/artisan/projets`
      }
    })

    // Créer une notification pour le client
    await prisma.notification.create({
      data: {
        userId: project.userId,
        title: "Attribution d'artisan annulée",
        message: `L'attribution de l'artisan pour votre projet "${project.title}" a été modifiée.`,
        type: "ARTISAN_UNASSIGNED",
        link: `/client/projets/${projectId}`
      }
    })

    return NextResponse.json({
      success: true,
      message: "Attribution annulée avec succès",
      project: updatedProject,
      previousArtisan: {
        id: invitation.user.id,
        name: invitation.user.name,
        email: invitation.user.email
      }
    })

  } catch (error) {
    console.error("Erreur lors de l'annulation de l'attribution:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation de l'attribution" },
      { status: 500 }
    )
  }
} 