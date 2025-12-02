import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Récupérer tous les témoignages
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const testimonials = await prisma.testimonial.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ]
    })

    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("Erreur lors de la récupération des témoignages:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

// POST - Créer un nouveau témoignage
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      firstName,
      lastName,
      companyName,
      role,
      rating,
      comment,
      avatarUrl,
      isActive,
      order
    } = body

    // Validation
    if (!firstName || !lastName || !comment || !rating) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "La note doit être entre 1 et 5" },
        { status: 400 }
      )
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        firstName,
        lastName,
        companyName: companyName || null,
        role: role || null,
        rating: parseInt(rating),
        comment,
        avatarUrl: avatarUrl || null,
        isActive: isActive ?? true,
        order: order ?? 0
      }
    })

    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du témoignage:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

