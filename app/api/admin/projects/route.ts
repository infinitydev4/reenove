import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les droits admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Récupérer tous les projets avec les relations
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
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
            id: true,
            url: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: {
            quotes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Formater les données pour le frontend
    const formattedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      budget: project.budget,
      budgetMax: project.budgetMax,
      location: project.location,
      city: project.city,
      postalCode: project.postalCode,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      user: project.user,
      category: project.category,
      service: project.service,
      photos: project.images.map(img => img.url),
      _count: project._count,
    }))

    return NextResponse.json({
      projects: formattedProjects,
      total: projects.length,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  }
} 