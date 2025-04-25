import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/projects/images - Ajouter une ou plusieurs images à un projet
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour ajouter des images" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, images } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "ID du projet requis" },
        { status: 400 }
      )
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Au moins une image est requise" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      )
    }

    if (project.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce projet" },
        { status: 403 }
      )
    }

    // Récupérer l'ordre max actuel
    const maxOrderImage = await prisma.projectImage.findFirst({
      where: { projectId },
      orderBy: { order: "desc" }
    })
    
    const startOrder = maxOrderImage ? maxOrderImage.order + 1 : 0
    
    // Créer les entrées d'images dans la base de données
    const createdImages = await prisma.projectImage.createMany({
      data: images.map((image: any, index: number) => ({
        url: image.url,
        caption: image.caption || "",
        order: startOrder + index,
        projectId
      }))
    })

    // Récupérer toutes les images du projet
    const allProjectImages = await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: { order: "asc" }
    })

    return NextResponse.json({
      message: `${createdImages.count} image(s) ajoutée(s) avec succès`,
      images: allProjectImages
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout des images:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'ajout des images" },
      { status: 500 }
    )
  }
}

// PATCH /api/projects/images - Mettre à jour l'ordre ou les légendes des images
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour modifier les images" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectId, images } = body

    if (!projectId) {
      return NextResponse.json(
        { error: "ID du projet requis" },
        { status: 400 }
      )
    }

    if (!images || !Array.isArray(images)) {
      return NextResponse.json(
        { error: "Tableau d'images requis" },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Projet non trouvé" },
        { status: 404 }
      )
    }

    if (project.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce projet" },
        { status: 403 }
      )
    }

    // Mettre à jour chaque image
    const updatePromises = images.map(async (image: any) => {
      if (!image.id) return null
      
      return prisma.projectImage.update({
        where: { id: image.id },
        data: {
          caption: image.caption !== undefined ? image.caption : undefined,
          order: image.order !== undefined ? image.order : undefined
        }
      })
    })

    await Promise.all(updatePromises.filter(Boolean))

    // Récupérer toutes les images mises à jour
    const updatedImages = await prisma.projectImage.findMany({
      where: { projectId },
      orderBy: { order: "asc" }
    })

    return NextResponse.json({
      message: "Images mises à jour avec succès",
      images: updatedImages
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour des images:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la mise à jour des images" },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/images - Supprimer une ou plusieurs images
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour supprimer des images" },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const imageId = url.searchParams.get("imageId")
    const projectId = url.searchParams.get("projectId")
    
    // Si un imageId est fourni, supprimer cette image spécifique
    if (imageId) {
      const image = await prisma.projectImage.findUnique({
        where: { id: imageId },
        include: { project: true }
      })

      if (!image) {
        return NextResponse.json(
          { error: "Image non trouvée" },
          { status: 404 }
        )
      }

      // Vérifier que l'utilisateur est propriétaire du projet
      if (image.project.userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Vous n'êtes pas autorisé à supprimer cette image" },
          { status: 403 }
        )
      }

      await prisma.projectImage.delete({
        where: { id: imageId }
      })

      return NextResponse.json({
        message: "Image supprimée avec succès"
      })
    }
    // Si un projectId est fourni, supprimer toutes les images du projet
    else if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project) {
        return NextResponse.json(
          { error: "Projet non trouvé" },
          { status: 404 }
        )
      }

      // Vérifier que l'utilisateur est propriétaire du projet
      if (project.userId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Vous n'êtes pas autorisé à supprimer ces images" },
          { status: 403 }
        )
      }

      const { count } = await prisma.projectImage.deleteMany({
        where: { projectId }
      })

      return NextResponse.json({
        message: `${count} image(s) supprimée(s) avec succès`
      })
    } 
    else {
      return NextResponse.json(
        { error: "imageId ou projectId requis" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des images:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la suppression des images" },
      { status: 500 }
    )
  }
} 