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
    
    // Construire la requête avec filtre de catégorie si spécifié
    const whereClause = categoryId ? { categoryId } : {};
    
    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(services);
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
    const { name, description, categoryId, icon } = body;

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
        order: 0
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

// PUT mettre à jour un service
export async function PUT(request: NextRequest) {
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
    const { id, name, description, categoryId, icon, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'ID du service est requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si le service existe
    const service = await prisma.service.findUnique({
      where: { id }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
      categoryId?: string;
      icon?: string | null;
      isActive?: boolean;
      order?: number;
    } = {};

    if (name) {
      // Vérifier si le nouveau nom existe déjà pour un autre service dans la même catégorie
      if (name !== service.name) {
        const checkCategoryId = categoryId || service.categoryId;
        
        const existingService = await prisma.service.findFirst({
          where: {
            name: { equals: name, mode: "insensitive" },
            categoryId: checkCategoryId,
            id: { not: id }
          }
        });
        
        if (existingService) {
          return NextResponse.json(
            { error: "Un service avec ce nom existe déjà dans cette catégorie" },
            { status: 409 }
          );
        }
      }
      
      updateData.name = name;
      updateData.slug = slugify(name);
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (categoryId) {
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

      updateData.categoryId = categoryId;
    }

    if (icon !== undefined) {
      updateData.icon = icon;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    if (order !== undefined) {
      updateData.order = order;
    }

    // Mettre à jour le service
    const updatedService = await prisma.service.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du service" },
      { status: 500 }
    );
  }
}

// DELETE supprimer un service
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "L'ID du service est requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si le service existe
    const service = await prisma.service.findUnique({
      where: { id }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier si le service est utilisé dans des projets
    const projectCount = await prisma.project.count({
      where: { serviceId: id }
    });
    
    if (projectCount > 0) {
      return NextResponse.json(
        { 
          error: "Ce service est utilisé dans des projets existants. Vous ne pouvez pas le supprimer.",
          projectCount
        },
        { status: 409 }
      );
    }

    // Supprimer le service
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Service supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du service:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du service" },
      { status: 500 }
    );
  }
} 