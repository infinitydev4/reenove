import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/lib/generated/prisma";

export async function GET() {
  try {
    const artisans = await prisma.user.findMany({
      where: {
        role: Role.ARTISAN
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        quotes: {
          select: {
            id: true,
            status: true,
            amount: true,
          }
        },
      }
    });

    // Transformer les données pour le format attendu par le frontend
    const formattedArtisans = artisans.map(artisan => {
      const projectsCompleted = artisan.quotes.filter(q => q.status === "completed").length;
      const currentProjects = artisan.quotes.filter(q => q.status === "accepted").length;
      const totalEarnings = artisan.quotes.filter(q => q.status === "completed")
        .reduce((sum, quote) => sum + Number(quote.amount), 0);

      // Déterminer la disponibilité
      let availability = "disponible";
      if (currentProjects >= 3) {
        availability = "occupé";
      } else if (artisan.role !== Role.ARTISAN) {
        availability = "indisponible";
      }

      // Spécialité fictive pour le moment (à remplacer par un champ réel plus tard)
      const speciality = "Plomberie"; // À remplacer par un champ réel
      
      return {
        id: artisan.id,
        name: artisan.name || "Artisan",
        email: artisan.email || "",
        phone: artisan.phone || "Non renseigné",
        address: artisan.address || "Non renseignée",
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
        verified: true
      };
    });

    return NextResponse.json(formattedArtisans);
  } catch (error) {
    console.error("Erreur lors de la récupération des artisans :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des artisans" },
      { status: 500 }
    );
  }
} 