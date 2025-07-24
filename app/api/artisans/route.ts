import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const location = searchParams.get('location')
    const specialty = searchParams.get('specialty')
    
    // Construire les filtres de recherche
    const where = {
      role: 'ARTISAN' as const,
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { city: { contains: search, mode: 'insensitive' as const } },
            { artisanSpecialties: { 
              some: { 
                service: { 
                  name: { contains: search, mode: 'insensitive' as const } 
                } 
              } 
            } }
          ]
        } : {},
        location ? {
          city: { contains: location, mode: 'insensitive' as const }
        } : {},
        specialty ? {
          artisanSpecialties: {
            some: {
              service: {
                name: { contains: specialty, mode: 'insensitive' as const }
              }
            }
          }
        } : {}
      ].filter(Boolean)
    }
    
    // Récupérer les artisans
    const artisans = await prisma.user.findMany({
      where,
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
      },
      take: 50, // Limiter à 50 résultats
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Formater les données pour le frontend
    const formattedArtisans = artisans.map(artisan => ({
      id: artisan.id,
      name: artisan.name || 'Artisan',
      firstName: artisan.name?.split(' ')[0] || '',
      lastName: artisan.name?.split(' ').slice(1).join(' ') || '',
      email: artisan.email,
      profession: artisan.artisanSpecialties?.[0]?.service?.name || 'Artisan',
      specialties: artisan.artisanSpecialties?.map((s: any) => s.service.name) || [],
      city: artisan.city || 'Non spécifié',
      rating: artisan.artisanProfile?.averageRating || 4.5,
      reviews: 0,  // Pour l'instant 0, on pourra ajouter un système d'avis plus tard
      image: artisan.image || '/placeholder.svg',
      verified: artisan.artisanProfile?.verificationStatus === 'VERIFIED',
      createdAt: artisan.createdAt.toISOString()
    }))
    
    return NextResponse.json({
      artisans: formattedArtisans,
      total: formattedArtisans.length
    })
    
  } catch (error) {
    console.error("Erreur lors de la récupération des artisans:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des artisans" },
      { status: 500 }
    )
  }
} 