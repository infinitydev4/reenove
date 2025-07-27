import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== Role.ARTISAN) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const artisanId = session.user.id
    const projectId = params.id

    console.log(`🔍 Récupération du projet ${projectId} pour l'artisan: ${artisanId}`)

    // D'abord, essayer de récupérer comme projet classique
    const classicProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        invitations: {
          some: {
            userId: artisanId
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        category: {
          select: {
            name: true,
            icon: true
          }
        },
        service: {
          select: {
            name: true
          }
        },
        images: true,
        invitations: {
          where: {
            userId: artisanId
          },
          select: {
            status: true,
            message: true,
            createdAt: true
          }
        },
        quotes: {
          where: {
            providerId: artisanId
          },
          select: {
            id: true,
            amount: true,
            status: true,
            description: true,
            createdAt: true
          }
        }
      }
    })

    if (classicProject) {
      console.log(`📋 Projet classique trouvé: ${classicProject.title}`)
      
      const invitation = classicProject.invitations[0]
      const quote = classicProject.quotes[0]
      
      // Déterminer le statut du projet pour l'artisan
      let artisanStatus = "À démarrer"
      if (classicProject.status === "COMPLETED") {
        artisanStatus = "Terminé"
      } else if (classicProject.status === "IN_PROGRESS") {
        artisanStatus = "En cours"
      } else if (quote) {
        if (quote.status === "accepted") {
          artisanStatus = "Finition"
        } else if (quote.status === "pending") {
          artisanStatus = "En cours"
        }
      } else if (invitation?.status === "pending") {
        artisanStatus = "Nouveau"
      }

      const formattedProject = {
        id: classicProject.id,
        type: "classic",
        title: classicProject.title,
        description: classicProject.description,
        client: {
          name: classicProject.user?.name || "Client non renseigné",
          email: classicProject.user?.email || "",
          phone: classicProject.user?.phone || ""
        },
        location: {
          address: classicProject.location || "",
          city: classicProject.city || "",
          postalCode: classicProject.postalCode || ""
        },
        category: classicProject.category?.name || "Non catégorisé",
        service: classicProject.service?.name || "",
        status: artisanStatus,
        budget: classicProject.budget ? `${classicProject.budget.toLocaleString()} €` : "Non défini",
        startDate: classicProject.startDate ? new Date(classicProject.startDate).toLocaleDateString() : "Non défini",
        endDate: classicProject.endDate ? new Date(classicProject.endDate).toLocaleDateString() : "Non défini",
        createdAt: classicProject.createdAt.toLocaleDateString(),
        images: classicProject.images.map(img => img.url),
        invitation: invitation ? {
          status: invitation.status,
          message: invitation.message,
          date: invitation.createdAt.toLocaleDateString()
        } : null,
        quote: quote ? {
          id: quote.id,
          amount: `${quote.amount.toLocaleString()} €`,
          status: quote.status,
          description: quote.description,
          date: quote.createdAt.toLocaleDateString()
        } : null
      }

      return NextResponse.json({
        success: true,
        project: formattedProject
      })
    }

    // Si pas de projet classique, essayer comme ExpressBooking
    const expressBooking = await prisma.expressBooking.findFirst({
      where: {
        id: projectId,
        assignedArtisanId: artisanId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        service: {
          select: {
            name: true,
            icon: true,
            category: {
              select: {
                name: true,
                icon: true
              }
            }
          }
        }
      }
    })

    if (expressBooking) {
      console.log(`📋 ExpressBooking trouvé: ${expressBooking.service?.name}`)

      // Déterminer le statut selon le statut de la réservation
      let artisanStatus = "À démarrer"
      if (expressBooking.status === "COMPLETED") {
        artisanStatus = "Terminé"
      } else if (expressBooking.status === "IN_PROGRESS") {
        artisanStatus = "En cours"
      } else if (expressBooking.status === "CONFIRMED") {
        artisanStatus = "Confirmé"
      } else if (expressBooking.status === "PENDING") {
        artisanStatus = "En attente"
      }

      const formattedProject = {
        id: expressBooking.id,
        type: "express",
        title: `${expressBooking.service?.name || "Service Express"} - Reenove Express`,
        description: `Service Express : ${expressBooking.service?.name || "Service non défini"}`,
        client: {
          name: expressBooking.user?.name || "Client non renseigné",
          email: expressBooking.user?.email || "",
          phone: expressBooking.clientPhone || ""
        },
        location: {
          address: expressBooking.address || "",
          city: expressBooking.city || "",
          postalCode: expressBooking.postalCode || ""
        },
        category: expressBooking.service?.category?.name || "Express",
        service: expressBooking.service?.name || "",
        status: artisanStatus,
        budget: `${expressBooking.price.toLocaleString()} €`,
        startDate: expressBooking.bookingDate ? new Date(expressBooking.bookingDate).toLocaleDateString() : "Non défini",
        endDate: expressBooking.bookingDate ? new Date(expressBooking.bookingDate).toLocaleDateString() : "Non défini",
        createdAt: expressBooking.createdAt.toLocaleDateString(),
        images: [],
        notes: expressBooking.notes || "",
        specialRequirements: expressBooking.specialRequirements || "",
        floor: expressBooking.floor,
        hasElevator: expressBooking.hasElevator,
        assignedAt: expressBooking.assignedAt ? new Date(expressBooking.assignedAt).toLocaleDateString() : null
      }

      return NextResponse.json({
        success: true,
        project: formattedProject
      })
    }

    // Aucun projet trouvé
    console.log(`❌ Aucun projet trouvé avec l'ID: ${projectId}`)
    return NextResponse.json(
      { error: "Projet non trouvé" },
      { status: 404 }
    )

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du projet" },
      { status: 500 }
    )
  }
} 