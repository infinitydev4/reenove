import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les droits admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Récupérer tous les utilisateurs avec leurs projets
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Formater les données pour le frontend
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      _count: user._count,
    }))

    return NextResponse.json({
      users: formattedUsers,
      total: users.length,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    )
  }
} 