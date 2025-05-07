import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const artisanId = params.id

    // Récupérer les informations de l'artisan
    const artisan = await prisma.user.findUnique({
      where: {
        id: artisanId,
        role: Role.ARTISAN
      },
      include: {
        quotes: {
          select: {
            id: true,
            status: true,
            amount: true,
          }
        },
        artisanProfile: true
      }
    })

    if (!artisan) {
      return NextResponse.json(
        { error: "Artisan non trouvé" },
        { status: 404 }
      )
    }

    // Transformer les données pour le format attendu par le frontend
    const projectsCompleted = artisan.quotes.filter(q => q.status === "completed").length
    const currentProjects = artisan.quotes.filter(q => q.status === "accepted").length
    const totalEarnings = artisan.quotes.filter(q => q.status === "completed")
      .reduce((sum, quote) => sum + Number(quote.amount), 0)

    // Déterminer la disponibilité
    let availability = "disponible"
    if (currentProjects >= 3) {
      availability = "occupé"
    } else if (artisan.role !== Role.ARTISAN) {
      availability = "indisponible"
    }

    // Spécialité fictive pour le moment (à remplacer par un champ réel plus tard)
    const speciality = "Plomberie" // À remplacer par un champ réel

    const formattedArtisan = {
      id: artisan.id,
      name: artisan.name || "Artisan",
      email: artisan.email || "",
      phone: artisan.phone || "Non renseigné",
      address: artisan.address || "Non renseignée",
      city: artisan.city || "Paris",
      postalCode: artisan.postalCode || "75001",
      status: artisan.role === Role.ARTISAN ? "actif" : "inactif",
      speciality,
      rating: (Math.random() * (5 - 4) + 4).toFixed(1),
      projectsCompleted,
      currentProjects,
      totalEarnings: `${totalEarnings}€`,
      availability,
      startDate: new Date(artisan.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      avatar: artisan.image || "/placeholder.svg",
      verified: artisan.artisanProfile?.verificationStatus === "VERIFIED",
      verificationStatus: artisan.artisanProfile?.verificationStatus || "PENDING",
      siret: artisan.artisanProfile?.siret || "44123456789012"
    }

    return NextResponse.json(formattedArtisan)
  } catch (error) {
    console.error("Erreur lors de la récupération des détails de l'artisan:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails de l'artisan" },
      { status: 500 }
    )
  }
} 