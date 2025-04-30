import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Récupérer tous les services actifs avec leurs catégories
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [
        {
          category: {
            order: "asc",
          },
        },
        {
          order: "asc",
        },
      ],
    })

    // Pour l'API publique, renvoyons simplement les services
    // Nous gérerons la déduplication des catégories côté client
    return NextResponse.json(services)
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des services" },
      { status: 500 }
    )
  }
} 