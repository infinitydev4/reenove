import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, ProjectStatus } from "@/lib/generated/prisma"
import { sendEmail } from "@/lib/email"
import { artisanAssignmentEmailTemplate } from "@/lib/email-templates/artisan-assignment"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { artisanId } = await request.json()
    const projectId = params.id

    if (!artisanId) {
      return NextResponse.json({ error: "ID artisan requis" }, { status: 400 })
    }

    // Vérifier que le projet existe
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

    // Vérifier que l'artisan existe et est actif
    const artisan = await prisma.user.findUnique({
      where: { 
        id: artisanId,
        role: Role.ARTISAN
      },
      include: {
        artisanProfile: true,
        artisanSpecialties: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    if (!artisan) {
      return NextResponse.json({ error: "Artisan non trouvé" }, { status: 404 })
    }

    if (!artisan.artisanProfile?.availableForWork) {
      return NextResponse.json({ error: "L'artisan n'est pas disponible" }, { status: 400 })
    }

    // Créer une invitation de projet pour formaliser l'attribution
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId: projectId,
        userId: artisanId, // userId correspond à l'artisan dans le schéma
        status: "pending", // Statut selon le schéma Prisma
        message: `Votre participation a été demandée par l'équipe Reenove pour le projet "${project.title}".`
      }
    })

    // Mettre à jour le statut du projet
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.ASSIGNED
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
        userId: artisanId,
        title: "Nouveau projet attribué",
        message: `Vous avez été sélectionné pour le projet "${project.title}" par l'équipe Reenove.`,
        type: "PROJECT_ASSIGNED",
        link: `/artisan/projets`
      }
    })

    // Créer une notification pour le client
    await prisma.notification.create({
      data: {
        userId: project.userId,
        title: "Artisan attribué à votre projet",
        message: `L'artisan ${artisan.name} a été attribué à votre projet "${project.title}".`,
        type: "ARTISAN_ASSIGNED",
        link: `/client/projets/${projectId}`
      }
    })

    // Envoyer un email de notification à l'artisan
    try {
      const loginUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/artisan/projets`
      const budgetText = project.budget ? `${project.budget.toLocaleString('fr-FR')} €${project.budgetMax && project.budgetMax !== project.budget ? ` - ${project.budgetMax.toLocaleString('fr-FR')} €` : ''}` : undefined
      
      await sendEmail({
        to: artisan.email!,
        subject: artisanAssignmentEmailTemplate.subject(project.title),
        html: artisanAssignmentEmailTemplate.html({
          artisanName: artisan.name || 'Artisan',
          projectTitle: project.title,
          projectDescription: project.description,
          clientName: project.user.name || 'Client',
          projectLocation: `${project.location}${project.city ? `, ${project.city}` : ''}`,
          projectBudget: budgetText,
          category: project.category?.name || 'Non spécifiée',
          loginUrl
        }),
        text: artisanAssignmentEmailTemplate.text({
          artisanName: artisan.name || 'Artisan',
          projectTitle: project.title,
          projectDescription: project.description,
          clientName: project.user.name || 'Client',
          projectLocation: `${project.location}${project.city ? `, ${project.city}` : ''}`,
          projectBudget: budgetText,
          category: project.category?.name || 'Non spécifiée',
          loginUrl
        })
      })
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError)
      // Ne pas faire échouer l'attribution si l'email échoue
    }

    return NextResponse.json({
      success: true,
      message: "Projet attribué avec succès",
      project: updatedProject,
      artisan: {
        id: artisan.id,
        name: artisan.name,
        email: artisan.email,
        specialties: artisan.artisanSpecialties.map(s => s.service.name)
      },
      invitation
    })

  } catch (error) {
    console.error("Erreur lors de l'attribution du projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'attribution du projet" },
      { status: 500 }
    )
  }
} 