import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH - Réordonner un témoignage
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const { id } = params
    const { direction } = await req.json()

    // Récupérer le témoignage actuel
    const currentTestimonial = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!currentTestimonial) {
      return NextResponse.json(
        { error: "Témoignage non trouvé" },
        { status: 404 }
      )
    }

    // Trouver le témoignage à échanger
    const targetOrder = direction === "up" 
      ? currentTestimonial.order - 1 
      : currentTestimonial.order + 1

    const targetTestimonial = await prisma.testimonial.findFirst({
      where: { order: targetOrder }
    })

    if (!targetTestimonial) {
      return NextResponse.json(
        { error: "Impossible de déplacer dans cette direction" },
        { status: 400 }
      )
    }

    // Échanger les ordres
    await prisma.$transaction([
      prisma.testimonial.update({
        where: { id: currentTestimonial.id },
        data: { order: targetOrder }
      }),
      prisma.testimonial.update({
        where: { id: targetTestimonial.id },
        data: { order: currentTestimonial.order }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors du réordonnancement:", error)
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    )
  }
}

