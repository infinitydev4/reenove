import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// Vérifier les permissions d'administrateur
async function isAdmin(session: any) {
  if (!session?.user) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === "ADMIN";
}

// GET tous les services
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search");
    const expressOnly = url.searchParams.get("expressOnly");
    const isActive = url.searchParams.get("isActive");
    
    // Pagination: calculer le nombre d'éléments à sauter
    const skip = (page - 1) * limit;
    
    // Construire la requête avec filtres
    const whereClause: any = {};
    
    // Filtre de catégorie
    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }
    
    // Filtre de recherche
    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { expressDescription: { contains: search.trim(), mode: "insensitive" } },
      ];
    }
    
    // Filtre Express
    if (expressOnly !== null) {
      whereClause.isExpressAvailable = expressOnly === "true";
    }
    
    // Filtre statut actif
    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }
    
    // Requête pour obtenir les services avec pagination
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        include: {
          category: true,
        },
        orderBy: {
          name: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.service.count({
        where: whereClause,
      })
    ]);
    
    return NextResponse.json({
      services,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des services:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des services" },
      { status: 500 }
    );
  }
}

// POST nouveau service
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      categoryId, 
      icon,
      isExpressAvailable,
      expressPrice,
      expressDescription,
      estimatedDuration,
      isPopular
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Le nom du service et l'ID de la catégorie sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }
    
    // Vérifier si un service avec le même nom existe déjà dans la catégorie
    const existingService = await prisma.service.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        categoryId
      }
    });
    
    if (existingService) {
      return NextResponse.json(
        { error: "Un service avec ce nom existe déjà dans cette catégorie" },
        { status: 409 }
      );
    }

    // Générer le slug à partir du nom
    const slug = slugify(name);

    // Créer le service
    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description: description || "",
        categoryId,
        icon: icon || null,
        isActive: true,
        order: 0,
        // Champs Express
        isExpressAvailable: isExpressAvailable || false,
        expressPrice: expressPrice || null,
        expressDescription: expressDescription || null,
        estimatedDuration: estimatedDuration || null,
        isPopular: isPopular || false,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du service" },
      { status: 500 }
    );
  }
}

// Note: Les fonctions PUT et DELETE ont été déplacées vers /api/admin/services/[id]/route.ts
// pour une meilleure organisation des routes RESTful 