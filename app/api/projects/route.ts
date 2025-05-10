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
export async function POST(request: NextRequest) {
  try {
    console.log("Démarrage de l'API POST /api/projects");
    console.log("Instance Prisma:", prisma ? "OK" : "NULL");
    
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour créer un projet" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    
    console.log("API - Création de projet - Données reçues:", JSON.stringify(body))
    console.log("API - Création de projet - Utilisateur:", userId)

    // Validation des données requises
    if (!body.title || !body.description || !body.categoryId || !body.serviceId) {
      return NextResponse.json(
        { error: "Les champs titre, description, catégorie et service sont obligatoires" },
        { status: 400 }
      )
    }

    // Extraire les photos avant de créer le projet car elles seront ajoutées séparément
    const photos = body.photos || []
    
    // Traitement des photos pour s'assurer qu'elles sont des URLs valides
    const processedPhotos = photos.map((photoUrl: string) => {
      // Si c'est une référence sessionStorage, nous utilisons l'URL de placeholder
      // car nous ne pouvons pas accéder au sessionStorage côté serveur
      if (photoUrl.startsWith('session:')) {
        console.log(`URL d'image avec préfixe session détectée: ${photoUrl}, remplacée par placeholder`);
        // Ici, on pourrait implémenter une solution pour stocker les data URLs compressées
        // dans un stockage cloud comme S3, mais pour l'instant nous utilisons un placeholder
        return '/placeholder-project.png';
      }
      return photoUrl;
    });

    // Création du projet
    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        serviceId: body.serviceId,
        userId,
        status: validateProjectStatus(body.status),
        visibility: validateVisibility(body.visibility),
        
        // Optionnels - Détails de localisation
        location: body.location,
        postalCode: body.postalCode,
        city: body.city,
        region: body.region,
        accessibility: validateAccessibility(body.accessibility),
        
        // Optionnels - Détails de planning
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        urgencyLevel: convertUrgencyLevel(body.urgencyLevel),
        flexibleDates: body.flexibleDates,
        preferredTime: validatePreferredTime(body.preferredTime),
        
        // Optionnels - Autres détails
        propertyType: validatePropertyType(body.propertyType),
        budget: body.budget ? parseFloat(body.budget) : undefined,
        budgetMax: body.budgetMax ? parseFloat(body.budgetMax) : undefined,
        budgetType: body.budgetType,
      },
    })

    console.log("API - Projet créé:", project)

    // Si le projet a été créé avec succès et qu'il y a des photos
    if (project && processedPhotos.length > 0) {
      // Créer les entrées pour les images
      await prisma.projectImage.createMany({
        data: processedPhotos.map((photoUrl: string, index: number) => ({
          url: photoUrl,
          caption: "",
          order: index,
          projectId: project.id
        }))
      })
      
      console.log(`API - ${processedPhotos.length} photo(s) ajoutée(s) au projet ${project.id}`)
    }

    // Récupérer les images pour les inclure dans la réponse
    const imagesFromDb = await prisma.projectImage.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" }
    })
    
    const imageUrls = imagesFromDb.map(image => image.url)
    console.log("API - Photos du projet:", imageUrls)

    return NextResponse.json({
      message: "Projet créé avec succès",
      project: {
        ...project,
        images: imagesFromDb
      }
    }, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du projet:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du projet" },
      { status: 500 }
    )
  }
} 