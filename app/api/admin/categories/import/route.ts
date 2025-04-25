import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { slugify } from '@/lib/utils'

// Type pour les catégories et services
type Category = {
  id: string
  name: string
  icon: string | null
  description: string | null
  slug?: string
}

type Service = {
  id: string
  name: string
  description: string | null
  slug?: string
}

type ServicesMap = {
  [categoryId: string]: Service[]
}

export async function POST(req: Request) {
  try {
    // Vérifier l'authentification et les permissions d'admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    // Vérifier si l'utilisateur est administrateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }
    
    // Récupérer les données du corps de la requête
    const body = await req.json()
    const { categories, services } = body
    
    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Format de catégories invalide' }, { status: 400 })
    }
    
    if (!services || typeof services !== 'object') {
      return NextResponse.json({ error: 'Format de services invalide' }, { status: 400 })
    }
    
    // Préparer les données avec les slugs
    const preparedCategories = categories.map(category => ({
      ...category,
      slug: category.slug || slugify(category.name)
    }))
    
    const preparedServices: Record<string, Service[]> = {}
    for (const categoryId in services) {
      preparedServices[categoryId] = services[categoryId].map((service: any) => ({
        ...service,
        slug: service.slug || slugify(service.name)
      }))
    }
    
    // Commencer une transaction pour garantir la cohérence des données
    const result = await prisma.$transaction(async (tx) => {
      const createdCategories: Category[] = []
      const createdServices: Service[] = []
      
      // Créer les catégories
      for (const category of preparedCategories) {
        const existingCategory = await tx.category.findUnique({
          where: { id: category.id }
        })
        
        if (!existingCategory) {
          const newCategory = await tx.category.create({
            data: {
              id: category.id,
              name: category.name,
              icon: category.icon,
              description: category.description,
              slug: category.slug || slugify(category.name)
            }
          })
          createdCategories.push(newCategory)
        }
      }
      
      // Créer les services pour chaque catégorie
      for (const categoryId in preparedServices) {
        const categoryServices = preparedServices[categoryId]
        
        if (Array.isArray(categoryServices)) {
          for (const service of categoryServices) {
            const existingService = await tx.service.findUnique({
              where: { id: service.id }
            })
            
            if (!existingService) {
              const newService = await tx.service.create({
                data: {
                  id: service.id,
                  name: service.name,
                  description: service.description,
                  categoryId: categoryId,
                  slug: service.slug || slugify(service.name)
                }
              })
              createdServices.push(newService)
            }
          }
        }
      }
      
      return {
        categoriesCount: createdCategories.length,
        servicesCount: createdServices.length
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Importation réussie: ${result.categoriesCount} catégories et ${result.servicesCount} services créés`,
      data: result
    })
    
  } catch (error: any) {
    console.error('Erreur lors de l\'importation des catégories et services:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'importation: ' + error.message },
      { status: 500 }
    )
  }
} 