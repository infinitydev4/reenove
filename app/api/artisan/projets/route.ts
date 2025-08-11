import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== Role.ARTISAN) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const artisanId = session.user.id
    console.log(`🔍 Récupération des projets pour l'artisan: ${artisanId}`)
    
    // Récupérer les détails de l'artisan connecté
    const currentArtisan = await prisma.user.findUnique({
      where: { id: artisanId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    
    console.log(`👤 Artisan connecté:`, currentArtisan)

    // 1. Récupérer les projets classiques où l'artisan a été invité
    const classicProjects = await prisma.project.findMany({
      where: {
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
            email: true
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
            createdAt: true
          }
        },
        images: {
          select: {
            url: true
          },
          take: 3
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    console.log(`📊 Projets classiques trouvés: ${classicProjects.length}`)

    // 2. Récupérer les ExpressBooking assignés à cet artisan
    const expressBookings = await prisma.expressBooking.findMany({
      where: {
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
      },
      orderBy: {
        updatedAt: "desc"
      }
    })

    console.log(`📊 ExpressBooking assignés trouvées: ${expressBookings.length}`)

    if (expressBookings.length > 0) {
      console.log('📋 Détails des ExpressBooking:', expressBookings.map(booking => ({
        id: booking.id,
        service: booking.service?.name,
        status: booking.status,
        bookingDate: booking.bookingDate,
        client: booking.user?.name,
        price: booking.price,
        address: booking.address,
        assignedArtisanId: booking.assignedArtisanId // Vérifier l'ID assigné
      })))
      
      console.log(`🔍 Vérification des assignments:`)
      expressBookings.forEach(booking => {
        console.log(`  - ExpressBooking ${booking.id}: assignedArtisanId="${booking.assignedArtisanId}", artisan connecté="${artisanId}", Match: ${booking.assignedArtisanId === artisanId}`)
      })
    }

    // Combiner et formater les projets classiques
    const formattedClassicProjects = classicProjects.map(project => {
      const invitation = project.invitations[0]
      const quote = project.quotes[0]
      
      // Déterminer le statut du projet pour l'artisan
      let artisanStatus = "À démarrer"
      if (project.status === "COMPLETED") {
        artisanStatus = "Terminé"
      } else if (project.status === "IN_PROGRESS") {
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

      // Calculer la progression
      let progress = 0
      if (project.status === "COMPLETED") {
        progress = 100
      } else if (project.status === "IN_PROGRESS") {
        progress = 65
      } else if (quote && quote.status === "accepted") {
        progress = 85
      } else if (invitation?.status === "pending") {
        progress = 10
      }

      return {
        id: project.id,
        title: project.title,
        client: project.user?.name || "Client non renseigné",
        location: `${project.city || ''} ${project.postalCode || ''}`.trim() || "Adresse non renseignée",
        description: project.description,
        status: artisanStatus,
        statusColor: progress === 100 ? "green" : progress > 50 ? "blue" : "orange",
        progress,
        startDate: project.startDate ? new Date(project.startDate).toLocaleDateString() : "Non défini",
        endDate: project.endDate ? new Date(project.endDate).toLocaleDateString() : "Non défini",
        amount: quote ? `${quote.amount.toLocaleString()} €` : project.budget ? `${project.budget.toLocaleString()} €` : "Non défini",
        projectType: project.category?.name || "Non catégorisé",
        messages: 0,
        lastMessage: "",
        invitationStatus: invitation?.status || "unknown",
        type: "classic" // Identifier le type de projet
      }
    })

    // Formater les ExpressBooking comme des projets
    const formattedExpressProjects = expressBookings.map(booking => {
      try {
        // Déterminer le statut selon le statut de la réservation
        let artisanStatus = "À démarrer"
        let progress = 0
        
        if (booking.status === "COMPLETED") {
          artisanStatus = "Terminé"
          progress = 100
        } else if (booking.status === "IN_PROGRESS") {
          artisanStatus = "En cours"
          progress = 65
        } else if (booking.status === "CONFIRMED") {
          artisanStatus = "Confirmé"
          progress = 25
        } else if (booking.status === "PENDING") {
          artisanStatus = "En attente"
          progress = 10
        }

        // Formater la date de rendez-vous
        const bookingDate = booking.bookingDate ? new Date(booking.bookingDate) : null
        const formattedDate = bookingDate ? bookingDate.toLocaleDateString() : "Non défini"
        
        // Déterminer le montant - utiliser le champ price
        let amount = "Montant non défini"
        if (booking.price && typeof booking.price === 'number') {
          amount = `${booking.price.toLocaleString()} €`
        }
        
        return {
          id: booking.id,
          title: `${booking.service?.name || "Service Express"} - Reenove Express`,
          client: booking.user?.name || "Client non renseigné",
          location: booking.address || "Adresse non renseignée",
          description: `Service Express : ${booking.service?.name || "Service non défini"}`,
          status: artisanStatus,
          statusColor: progress === 100 ? "green" : progress > 50 ? "blue" : "orange",
          progress,
          startDate: formattedDate,
          endDate: formattedDate,
          amount,
          projectType: booking.service?.category?.name || "Express",
          messages: 0,
          lastMessage: "",
          invitationStatus: "assigned",
          type: "express" // Identifier le type de projet
        }
      } catch (error) {
        console.error(`❌ Erreur lors du formatage de l'ExpressBooking ${booking.id}:`, error)
        // Retourner un objet par défaut en cas d'erreur
        return {
          id: booking.id,
          title: "Service Express - Erreur de formatage",
          client: booking.user?.name || "Client non renseigné",
          location: "Non défini",
          description: "Erreur lors du formatage des données",
          status: "Erreur",
          statusColor: "red",
          progress: 0,
          startDate: "Non défini",
          endDate: "Non défini",
          amount: "Non défini",
          projectType: "Express",
          messages: 0,
          lastMessage: "",
          invitationStatus: "assigned",
          type: "express"
        }
      }
    })

    // Combiner tous les projets
    const allProjects = [...formattedClassicProjects, ...formattedExpressProjects]
    
    console.log(`✅ Total projets formatés: ${allProjects.length} (${formattedClassicProjects.length} classiques + ${formattedExpressProjects.length} express)`)
    
    if (allProjects.length > 0) {
      console.log(`📋 Projets qui vont être envoyés à l'interface:`)
      allProjects.forEach((project, index) => {
        console.log(`  ${index + 1}. "${project.title}" - Client: ${project.client} - Status: ${project.status} - Prix: ${project.amount}`)
      })
    }

    if (allProjects.length === 0) {
      console.log('⚠️ Aucun projet trouvé pour cet artisan')
      
      // Debug pour vérifier les invitations et assignations
      const invitations = await prisma.projectInvitation.findMany({
        where: { userId: artisanId },
        include: {
          project: { select: { id: true, title: true, status: true } }
        }
      })
      
      const assignedBookings = await prisma.expressBooking.findMany({
        where: { assignedArtisanId: artisanId },
        select: { id: true, status: true, service: { select: { name: true } } }
      })
      
      console.log(`🔍 Debug - Invitations: ${invitations.length}, ExpressBooking assignés: ${assignedBookings.length}`)
    }

    return NextResponse.json({
      success: true,
      projects: allProjects
    })

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des projets artisan:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    )
  }
} 