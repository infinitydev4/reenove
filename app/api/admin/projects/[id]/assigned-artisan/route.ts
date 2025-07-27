import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, ProjectStatus } from "@/lib/generated/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const projectId = params.id

    // Rechercher l'invitation acceptée pour ce projet
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId: projectId,
        status: "pending" // L'artisan a été assigné par l'admin
      },
      include: {
        user: { // user correspond à l'artisan dans le schéma
          include: {
            artisanProfile: true,
            artisanSpecialties: {
              include: {
                service: {
                  include: {
                    category: true
                  }
                }
              }
            }
          }
        },
        project: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: "Aucun artisan assigné à ce projet" }, { status: 404 })
    }

    // Formater les données de l'artisan
    const artisan = invitation.user // user correspond à l'artisan
    const formattedArtisan = {
      id: artisan.id,
      name: artisan.name,
      email: artisan.email,
      phone: artisan.phone,
      address: artisan.address,
      city: artisan.city,
      postalCode: artisan.postalCode,
      image: artisan.image,
      profile: {
        companyName: artisan.artisanProfile?.companyName,
        siret: artisan.artisanProfile?.siret,
        yearsOfExperience: artisan.artisanProfile?.yearsOfExperience,
        level: artisan.artisanProfile?.level,
        projectsCompleted: artisan.artisanProfile?.projectsCompleted || 0,
        averageRating: artisan.artisanProfile?.averageRating,
        verificationStatus: artisan.artisanProfile?.verificationStatus,
        availableForWork: artisan.artisanProfile?.availableForWork
      },
      specialties: artisan.artisanSpecialties.map(specialty => ({
        id: specialty.id,
        service: specialty.service.name,
        category: specialty.service.category.name,
        isPrimary: specialty.isPrimary
      })),
      assignment: {
        assignedAt: invitation.createdAt,
        status: invitation.status,
        message: invitation.message
      }
    }

    return NextResponse.json({
      success: true,
      artisan: formattedArtisan,
      project: invitation.project
    })

  } catch (error) {
    console.error("Erreur lors de la récupération de l'artisan assigné:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'artisan assigné" },
      { status: 500 }
    )
  }
} 