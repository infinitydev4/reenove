import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { CategoryData, ServiceData } from '@/lib/data/categories'

type ServicesMap = {
  [categoryId: string]: ServiceData[]
}

// Fonction pour diviser un tableau en lots
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
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
    
    // Diviser les catégories en plus petits lots (5 par lot)
    const categoryChunks = chunkArray(preparedCategories, 5);

    // Résultats cumulatifs
    let totalCreatedCategories = 0;
    let totalCreatedServices = 0;
    let totalSkippedCategories: string[] = [];
    let totalSkippedServices: string[] = [];

    // Traiter les catégories par lots
    for (const categoryChunk of categoryChunks) {
      // Traiter ce lot de catégories
      const result = await processCategories(categoryChunk, services);
      
      // Accumuler les résultats
      totalCreatedCategories += result.createdCategories;
      totalCreatedServices += result.createdServices;
      totalSkippedCategories = [...totalSkippedCategories, ...result.skippedCategories];
      totalSkippedServices = [...totalSkippedServices, ...result.skippedServices];
    }
    
    return NextResponse.json({
      success: true,
      message: `Importation réussie: ${totalCreatedCategories} catégories et ${totalCreatedServices} services créés. ${totalSkippedCategories.length} catégories et ${totalSkippedServices.length} services ignorés (déjà existants ou erreurs).`,
      data: {
        categoriesCount: totalCreatedCategories,
        servicesCount: totalCreatedServices,
        skippedCategoriesCount: totalSkippedCategories.length,
        skippedServicesCount: totalSkippedServices.length
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors de l\'importation des catégories et services:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'importation: ' + error.message },
      { status: 500 }
    )
  }
}

// Fonction pour traiter un lot de catégories
async function processCategories(categoryChunk: CategoryData[], allServices: Record<string, ServiceData[]>) {
  // Résultats de ce lot
  let createdCategories = 0;
  let createdServices = 0;
  let skippedCategories: string[] = [];
  let skippedServices: string[] = [];

  // Traiter chaque catégorie une par une (sans transaction)
  for (const category of categoryChunk) {
    try {
      // Vérifier si la catégorie existe déjà
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { id: category.id },
            { slug: slugify(category.name) }
          ]
        }
      });

      if (!existingCategory) {
        // Créer la catégorie
        await prisma.category.create({
          data: {
            id: category.id,
            name: category.name,
            icon: category.icon,
            description: category.description,
            slug: slugify(category.name),
            isActive: true,
            order: 0
          }
        });
        createdCategories++;

        // Traiter les services pour cette catégorie
        const categoryServices = allServices[category.id];
        if (Array.isArray(categoryServices)) {
          // Traiter les services par petits lots (5 par lot)
          const serviceChunks = chunkArray(categoryServices, 5);
          for (const serviceChunk of serviceChunks) {
            // Traiter chaque service du lot
            for (const service of serviceChunk) {
              try {
                // Vérifier si le service existe déjà
                const slug = `${category.id}-${slugify(service.name)}`;
                const existingService = await prisma.service.findFirst({
                  where: {
                    OR: [
                      { id: service.id },
                      { slug }
                    ]
                  }
                });

                if (!existingService) {
                  // Créer le service
                  await prisma.service.create({
                    data: {
                      id: service.id,
                      name: service.name,
                      description: service.description,
                      categoryId: category.id,
                      slug,
                      isActive: true,
                      order: 0
                    }
                  });
                  createdServices++;
                } else {
                  skippedServices.push(service.name);
                }
              } catch (err) {
                console.warn(`Impossible de créer le service ${service.name} (${service.id}):`, err);
                skippedServices.push(service.name);
              }
            }
          }
        }
      } else {
        skippedCategories.push(category.name);
      }
    } catch (err) {
      console.warn(`Impossible de créer la catégorie ${category.name} (${category.id}):`, err);
      skippedCategories.push(category.name);
    }
  }

  return {
    createdCategories,
    createdServices,
    skippedCategories,
    skippedServices
  };
} 