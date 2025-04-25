import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";

// Vérifier si l'utilisateur est administrateur
async function isAdmin(session: any) {
  if (!session?.user) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === "ADMIN";
}

// GET toutes les catégories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accéder à cette ressource" },
        { status: 401 }
      );
    }
    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// POST nouvelle catégorie
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
    const { name, icon, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le nom de la catégorie est requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" }
      }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: "Une catégorie avec ce nom existe déjà" },
        { status: 409 }
      );
    }

    // Générer le slug à partir du nom
    const slug = slugify(name);

    // Créer la catégorie
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        description: description || null,
        isActive: true,
        order: 0
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}

// PUT mettre à jour une catégorie
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
    const { id, name, icon, description, isActive, order } = body;

    if (!id) {
      return NextResponse.json(
        { error: "L'ID de la catégorie est requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: {
      name?: string;
      slug?: string;
      icon?: string | null;
      description?: string | null;
      isActive?: boolean;
      order?: number;
    } = {};

    if (name && name !== category.name) {
      // Vérifier si le nouveau nom existe déjà pour une autre catégorie
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: id }
        }
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { error: "Une autre catégorie avec ce nom existe déjà" },
          { status: 409 }
        );
      }
      
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    
    if (icon !== undefined) {
      updateData.icon = icon;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    if (order !== undefined) {
      updateData.order = order;
    }

    // Mettre à jour la catégorie
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la catégorie" },
      { status: 500 }
    );
  }
}

// DELETE supprimer une catégorie
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
        { error: "L'ID de la catégorie est requis" },
        { status: 400 }
      );
    }
    
    // Vérifier si la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: { services: true }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: "Catégorie non trouvée" },
        { status: 404 }
      );
    }
    
    // Vérifier si la catégorie a des services associés
    if (category.services.length > 0) {
      return NextResponse.json(
        { 
          error: "Cette catégorie contient des services. Veuillez d'abord supprimer ces services.",
          servicesCount: category.services.length,
          services: category.services.map(s => ({ id: s.id, name: s.name }))
        },
        { status: 409 }
      );
    }
    
    // Vérifier si la catégorie est utilisée dans des projets
    const projectCount = await prisma.project.count({
      where: { categoryId: id }
    });
    
    if (projectCount > 0) {
      return NextResponse.json(
        { 
          error: "Cette catégorie est utilisée dans des projets existants. Vous ne pouvez pas la supprimer.",
          projectCount
        },
        { status: 409 }
      );
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Catégorie supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la catégorie" },
      { status: 500 }
    );
  }
} 