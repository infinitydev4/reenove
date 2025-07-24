import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { UrgencyLevel, ProjectStatus, ProjectVisibility, AccessibilityLevel, PropertyType, PreferredTime } from "@/lib/generated/prisma"

// Convertir urgencyLevel en valeur enum correcte
function convertUrgencyLevel(urgency?: string): UrgencyLevel | undefined {
  if (!urgency) return undefined;
  
  // Si déjà en majuscules et valide, retourner tel quel
  if (urgency === "NORMAL" || urgency === "SOON" || urgency === "URGENT") {
    return urgency as UrgencyLevel;
  }
  
  // Sinon, convertir selon la valeur
  switch (urgency.toLowerCase()) {
    case 'low':
    case 'normal':
      return UrgencyLevel.NORMAL; // Dans les 30 jours
    case 'high':
    case 'soon':
      return UrgencyLevel.SOON;   // Dans les 15 jours
    case 'urgent':
      return UrgencyLevel.URGENT; // Dans les 7 jours
    default:
      return UrgencyLevel.NORMAL; // Valeur par défaut
  }
}

// Fonctions pour valider d'autres valeurs enum
function validateProjectStatus(status?: string): ProjectStatus | undefined {
  if (!status) return undefined;
  return Object.values(ProjectStatus).includes(status as ProjectStatus) 
    ? status as ProjectStatus 
    : ProjectStatus.DRAFT;
}

function validateVisibility(visibility?: string): ProjectVisibility | undefined {
  if (!visibility) return undefined;
  return Object.values(ProjectVisibility).includes(visibility as ProjectVisibility)
    ? visibility as ProjectVisibility
    : ProjectVisibility.PUBLIC;
}

function validateAccessibility(accessibility?: string): AccessibilityLevel | undefined {
  if (!accessibility) return undefined;
  return Object.values(AccessibilityLevel).includes(accessibility as AccessibilityLevel)
    ? accessibility as AccessibilityLevel
    : undefined;
}

function validatePropertyType(propertyType?: string): PropertyType | undefined {
  if (!propertyType) return undefined;
  return Object.values(PropertyType).includes(propertyType as PropertyType)
    ? propertyType as PropertyType
    : undefined;
}

function validatePreferredTime(preferredTime?: string): PreferredTime | undefined {
  if (!preferredTime) return undefined;
  return Object.values(PreferredTime).includes(preferredTime as PreferredTime)
    ? preferredTime as PreferredTime
    : undefined;
}

// GET /api/projects - Récupérer tous les projets de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à vos projets" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = searchParams.has("limit") ? parseInt(searchParams.get("limit") as string) : 50
    const page = searchParams.has("page") ? parseInt(searchParams.get("page") as string) : 1
    const skip = (page - 1) * limit

    // Construire la requête avec les filtres
    const whereClause: any = { userId }
    if (status) {
      whereClause.status = status
    }

    // Exécuter la requête
    const projects = await prisma.project.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        category: {
          select: { name: true, icon: true }
        },
        service: {
          select: { name: true }
        },
        _count: {
          select: {
            quotes: true,
            images: true
          }
        }
      }
    })

    const total = await prisma.project.count({
      where: whereClause
    })

    return NextResponse.json({
      projects,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la récupération des projets" },
      { status: 500 }
    )
  }
}

// POST /api/projects - Créer un nouveau projet
export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer un projet" },
        { status: 401 }
      )
    }
    
    // Récupérer les données du projet
    const data = await req.json()
    
    // Valider les données requises
    if (!data.title || !data.categoryId || !data.serviceId) {
      return NextResponse.json(
        { error: "Les champs titre, catégorie et service sont obligatoires" },
        { status: 400 }
      )
    }
    
    // Vérifier que la catégorie et le service existent
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      )
    }
    
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId }
    })
    
    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      )
    }
    
    // Préparer les données du projet
    const projectData = {
      title: data.title,
      description: data.description || "",
      categoryId: data.categoryId,
      serviceId: data.serviceId,
      userId: session.user.id,
      status: data.status || "PUBLISHED",
      location: data.location,
      postalCode: data.postalCode,
      city: data.city,
      // Si nous avons un budget min et max, on crée une fourchette
      budget: data.budget || null,
      budgetType: data.budgetMin && data.budgetMax ? "Range" : (data.budget ? "Fixed" : null),
      budgetMax: data.budgetMax || null,
    }
    
    // Créer le projet
    const project = await prisma.project.create({
      data: projectData
    })
    
    // Créer les images du projet si elles existent
    if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
      console.log(`📸 Sauvegarde de ${data.photos.length} photos pour le projet ${project.id}`)
      
      const imagePromises = data.photos.map((photoUrl: string, index: number) => {
        if (photoUrl && photoUrl.trim()) {
          console.log(`📸 Sauvegarde photo ${index + 1}:`, photoUrl.substring(0, 100) + '...')
          return prisma.projectImage.create({
            data: {
              projectId: project.id,
              url: photoUrl,
              order: index
            }
          })
        }
        return null
      }).filter(Boolean)
      
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises)
        console.log(`✅ ${imagePromises.length} photos sauvegardées avec succès`)
      }
    } else {
      console.log('📸 Aucune photo à sauvegarder pour ce projet')
    }
    
    // Créer une étape initiale pour le projet
    await prisma.projectStep.create({
      data: {
        projectId: project.id,
        stepNumber: 1,
        title: "Création du projet",
        completed: true,
        content: {
          description: "Projet créé via l'assistant IA",
          estimatedPrice: {
            min: data.budgetMin,
            max: data.budgetMax
          }
        }
      }
    })
    
    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error("Erreur lors de la création du projet:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    )
  }
} 