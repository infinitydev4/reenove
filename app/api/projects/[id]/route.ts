import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET /api/projects/[id] - Récupérer un projet spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à ce projet" },
        { status: 401 }
      )
    }

    const projectId = params.id
    const userId = session.user.id

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        category: true,
        service: true,
        images: true,
        quotes: {
          orderBy: { createdAt: "desc" },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        requirements: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    // Vérifier si l'utilisateur est propriétaire du projet ou un artisan concerné
    if (project.userId !== userId && session.user.role !== "ADMIN") {
      // Si c'est un artisan, vérifier s'il a été invité ou a déjà fait un devis
      const isArtisanInvolved = session.user.role === "ARTISAN" && await prisma.projectInvitation.findFirst({
        where: {
          projectId,
          userId,
        }
      })

      const isArtisanQuoted = session.user.role === "ARTISAN" && await prisma.quote.findFirst({
        where: {
          projectId,
          providerId: userId,
        }
      })

      // Si c'est un projet public, les artisans peuvent le voir
      const isPublicAndArtisan = project.visibility === "PUBLIC" && session.user.role === "ARTISAN"

      if (!isArtisanInvolved && !isArtisanQuoted && !isPublicAndArtisan) {
        return NextResponse.json(
          { error: "Vous n'êtes pas autorisé à accéder à ce projet" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération du projet" },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/[id] - Mettre à jour un projet spécifique
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier ce projet" },
        { status: 401 }
      )
    }

    const projectId = params.id
    const userId = session.user.id
    const body = await request.json()

    // Vérifier si le projet existe et appartient à l'utilisateur
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    if (existingProject.userId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce projet" },
        { status: 403 }
      )
    }

    // Mettre à jour le projet
    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description: body.description !== undefined ? body.description : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
        serviceId: body.serviceId !== undefined ? body.serviceId : undefined,
        status: body.status !== undefined ? body.status : undefined,
        
        // Optionnels - Détails de localisation
        location: body.location !== undefined ? body.location : undefined,
        postalCode: body.postalCode !== undefined ? body.postalCode : undefined,
        city: body.city !== undefined ? body.city : undefined,
        region: body.region !== undefined ? body.region : undefined,
        accessibility: body.accessibility !== undefined ? body.accessibility : undefined,
        
        // Optionnels - Détails de planning
        startDate: body.startDate !== undefined ? new Date(body.startDate) : undefined,
        endDate: body.endDate !== undefined ? new Date(body.endDate) : undefined,
        urgencyLevel: body.urgencyLevel !== undefined ? body.urgencyLevel : undefined,
        flexibleDates: body.flexibleDates !== undefined ? body.flexibleDates : undefined,
        preferredTime: body.preferredTime !== undefined ? body.preferredTime : undefined,
        
        // Optionnels - Autres détails
        propertyType: body.propertyType !== undefined ? body.propertyType : undefined,
        budget: body.budget !== undefined ? parseFloat(body.budget) : undefined,
        budgetMax: body.budgetMax !== undefined ? parseFloat(body.budgetMax) : undefined,
        budgetType: body.budgetType !== undefined ? body.budgetType : undefined,
        
        // Visibilité et statut
        visibility: body.visibility !== undefined ? body.visibility : undefined,
      },
    })

    // Si le projet a été mis à jour avec succès et qu'il y a des images à ajouter/modifier
    if (project && body.images && Array.isArray(body.images)) {
      // Si demande explicite de remplacer toutes les images
      if (body.replaceImages === true) {
        // Supprimer toutes les images existantes
        await prisma.projectImage.deleteMany({
          where: { projectId: project.id }
        })
        
        // Ajouter les nouvelles images
        if (body.images.length > 0) {
          await prisma.projectImage.createMany({
            data: body.images.map((image: any, index: number) => ({
              url: image.url,
              caption: image.caption || "",
              order: index,
              projectId: project.id
            }))
          })
        }
      }
      // Sinon, ajouter les nouvelles images à la suite
      else if (body.images.length > 0) {
        // Récupérer l'ordre max actuel
        const maxOrderImage = await prisma.projectImage.findFirst({
          where: { projectId: project.id },
          orderBy: { order: "desc" }
        })
        
        const startOrder = maxOrderImage ? maxOrderImage.order + 1 : 0
        
        await prisma.projectImage.createMany({
          data: body.images.map((image: any, index: number) => ({
            url: image.url,
            caption: image.caption || "",
            order: startOrder + index,
            projectId: project.id
          }))
        })
      }
    }

    // Si des exigences (requirements) sont fournies
    if (project && body.requirements && Array.isArray(body.requirements)) {
      if (body.replaceRequirements === true) {
        // Supprimer toutes les exigences existantes
        await prisma.projectRequirement.deleteMany({
          where: { projectId: project.id }
        })
        
        // Ajouter les nouvelles exigences
        if (body.requirements.length > 0) {
          await prisma.projectRequirement.createMany({
            data: body.requirements.map((req: any) => ({
              name: req.name,
              type: req.type || "material",
              description: req.description || "",
              isRequired: req.isRequired !== undefined ? req.isRequired : true,
              projectId: project.id
            }))
          })
        }
      }
    }

    // Mettre à jour le statut si demandé explicitement (par ex: publier le projet)
    if (body.publishProject === true && existingProject.status === "DRAFT") {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: "PUBLISHED" }
      })
    }

    // Récupérer le projet mis à jour avec toutes ses relations
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        category: true,
        service: true,
        images: true,
        requirements: true,
      },
    })

    return NextResponse.json({
      message: "Projet mis à jour avec succès",
      project: updatedProject
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du projet:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour du projet" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Supprimer un projet spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour supprimer ce projet" },
        { status: 401 }
      )
    }

    const projectId = params.id
    const userId = session.user.id

    // Vérifier si le projet existe et appartient à l'utilisateur
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    if (existingProject.userId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce projet" },
        { status: 403 }
      )
    }

    // Supprimer le projet (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
    await prisma.project.delete({
      where: { id: projectId },
    })

    return NextResponse.json({
      message: "Projet supprimé avec succès"
    })
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression du projet" },
      { status: 500 }
    )
  }
} 