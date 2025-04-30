import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { CategoryData, ServiceData } from '@/lib/data/categories'

type ServicesMap = {
  [categoryId: string]: ServiceData[]
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
    const preparedCategories = categories.map((category: CategoryData) => ({
      ...category,
      slug: slugify(category.name)
    }))
    
    const preparedServices: Record<string, any[]> = {}
    for (const categoryId in services) {
      preparedServices[categoryId] = services[categoryId].map((service: ServiceData) => ({
        ...service,
        slug: `${categoryId}-${slugify(service.name)}`
      }))
    }
    
    // Commencer une transaction pour garantir la cohérence des données
    const result = await prisma.$transaction(async (tx) => {
      const createdCategories: CategoryData[] = []
      const createdServices: ServiceData[] = []
      const skippedCategories: string[] = []
      const skippedServices: string[] = []
      
      // Créer les catégories
      for (const category of preparedCategories) {
        // Vérifier si la catégorie existe déjà
        const existingCategory = await tx.category.findFirst({
          where: {
            OR: [
              { id: category.id },
              { slug: category.slug }
            ]
          }
        })
        
        if (!existingCategory) {
          try {
            const newCategory = await tx.category.create({
              data: {
                id: category.id,
                name: category.name,
                icon: category.icon,
                description: category.description,
                slug: slugify(category.name),
                isActive: true,
                order: 0
              }
            })
            createdCategories.push(newCategory as unknown as CategoryData)
          } catch (err) {
            console.warn(`Impossible de créer la catégorie ${category.name} (${category.id}): `, err);
            skippedCategories.push(category.name);
            // Continuer avec la catégorie suivante
            continue;
          }
        } else {
          skippedCategories.push(category.name);
        }
      }
      
      // Créer les services pour chaque catégorie
      for (const categoryId in preparedServices) {
        const categoryServices = preparedServices[categoryId]
        
        if (Array.isArray(categoryServices)) {
          for (const service of categoryServices) {
            // Vérifier si le service existe déjà par ID ou par slug
            const existingService = await tx.service.findFirst({
              where: {
                OR: [
                  { id: service.id },
                  { slug: service.slug }
                ]
              }
            })
            
            if (!existingService) {
              try {
                const newService = await tx.service.create({
                  data: {
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    categoryId: categoryId,
                    slug: service.slug,
                    isActive: true,
                    order: 0
                  }
                })
                createdServices.push(newService as unknown as ServiceData)
              } catch (err) {
                console.warn(`Impossible de créer le service ${service.name} (${service.id}): `, err);
                skippedServices.push(service.name);
                // Continuer avec le prochain service
                continue;
              }
            } else {
              skippedServices.push(service.name);
            }
          }
        }
      }
      
      return {
        categoriesCount: createdCategories.length,
        servicesCount: createdServices.length,
        skippedCategoriesCount: skippedCategories.length,
        skippedServicesCount: skippedServices.length
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Importation réussie: ${result.categoriesCount} catégories et ${result.servicesCount} services créés. ${result.skippedCategoriesCount} catégories et ${result.skippedServicesCount} services ignorés (déjà existants ou erreurs).`,
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