import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les artisans favoris de l'utilisateur connecté
    const favorites = await prisma.userFavorite.findMany({
      where: {
        clientId: session.user.id
      },
      include: {
        artisan: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formater les données pour le frontend
    const formattedFavorites = favorites.map(favorite => {
      const artisan = favorite.artisan
      const specialties = artisan.artisanSpecialties?.map(spec => spec.service.name) || []
      
      return {
        id: artisan.id,
        name: artisan.name || 'Artisan',
        avatar: artisan.image || '/placeholder.svg',
        specialities: specialties,
        rating: artisan.artisanProfile?.averageRating || 4.5,
        reviews: artisan.artisanProfile?.projectsCompleted || 0,
        location: `${artisan.city || 'Non spécifié'}`,
        description: artisan.bio || `Artisan spécialisé en ${specialties[0] || 'rénovation'}`,
        distance: null, // À calculer selon la localisation
        disponible: artisan.artisanProfile?.availableForWork || false,
        favorisDepuis: `Il y a ${Math.floor((Date.now() - favorite.createdAt.getTime()) / (1000 * 60 * 60 * 24))} jour${Math.floor((Date.now() - favorite.createdAt.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}`,
        favoriteId: favorite.id,
        addedAt: favorite.createdAt
      }
    })

    return NextResponse.json({ 
      favorites: formattedFavorites,
      total: formattedFavorites.length 
    })
    
  } catch (error) {
    console.error("Erreur lors de la récupération des favoris:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { artisanId } = body

    if (!artisanId) {
      return NextResponse.json({ error: "ID artisan requis" }, { status: 400 })
    }

    // Vérifier que l'artisan existe et a le rôle ARTISAN
    const artisan = await prisma.user.findFirst({
      where: {
        id: artisanId,
        role: 'ARTISAN'
      }
    })

    if (!artisan) {
      return NextResponse.json({ error: "Artisan non trouvé" }, { status: 404 })
    }

    // Vérifier si déjà en favori
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        clientId_artisanId: {
          clientId: session.user.id,
          artisanId: artisanId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json({ error: "Artisan déjà en favoris" }, { status: 409 })
    }

    // Ajouter en favoris
    const favorite = await prisma.userFavorite.create({
      data: {
        clientId: session.user.id,
        artisanId: artisanId
      }
    })

    return NextResponse.json({ 
      message: "Artisan ajouté aux favoris",
      favorite: {
        id: favorite.id,
        artisanId: favorite.artisanId,
        addedAt: favorite.createdAt
      }
    })
    
  } catch (error) {
    console.error("Erreur lors de l'ajout en favoris:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const artisanId = searchParams.get('artisanId')
    const favoriteId = searchParams.get('favoriteId')

    if (!artisanId && !favoriteId) {
      return NextResponse.json({ error: "ID artisan ou ID favori requis" }, { status: 400 })
    }

    let whereClause: any = {
      clientId: session.user.id
    }

    if (favoriteId) {
      whereClause.id = favoriteId
    } else if (artisanId) {
      whereClause.artisanId = artisanId
    }

    // Supprimer le favori
    const deletedFavorite = await prisma.userFavorite.deleteMany({
      where: whereClause
    })

    if (deletedFavorite.count === 0) {
      return NextResponse.json({ error: "Favori non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ 
      message: "Artisan retiré des favoris",
      deleted: deletedFavorite.count
    })
    
  } catch (error) {
    console.error("Erreur lors de la suppression du favori:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    )
  }
} 