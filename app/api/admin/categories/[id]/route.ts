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

// PUT mettre à jour une catégorie spécifique
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, icon, description, isActive, order } = body;

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

// DELETE supprimer une catégorie spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { id } = params;

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
    
    // Si la catégorie a des services associés, les supprimer en cascade
    if (category.services.length > 0) {
      console.log(`Suppression en cascade de ${category.services.length} service(s) pour la catégorie ${category.name}`);
      
      // Supprimer tous les services de cette catégorie
      await prisma.service.deleteMany({
        where: { categoryId: id }
      });
      
      console.log(`✅ ${category.services.length} service(s) supprimé(s) en cascade`);
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

    const message = category.services.length > 0 
      ? `Catégorie supprimée avec succès ainsi que ${category.services.length} service(s) associé(s)`
      : "Catégorie supprimée avec succès";

    return NextResponse.json(
      { message },
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
