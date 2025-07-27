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

// PUT mettre à jour un service spécifique
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

    const serviceId = params.id;
    const body = await request.json();
    const { 
      name, 
      description, 
      categoryId, 
      icon, 
      isActive, 
      order,
      isExpressAvailable,
      expressPrice,
      expressDescription,
      estimatedDuration,
      isPopular
    } = body;

    // Vérifier si le service existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
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
      isExpressAvailable?: boolean;
      expressPrice?: number | null;
      expressDescription?: string | null;
      estimatedDuration?: number | null;
      isPopular?: boolean;
    } = {};

    if (name) {
      // Vérifier si le nouveau nom existe déjà pour un autre service dans la même catégorie
      if (name !== service.name) {
        const checkCategoryId = categoryId || service.categoryId;
        
        const existingService = await prisma.service.findFirst({
          where: {
            name: { equals: name, mode: "insensitive" },
            categoryId: checkCategoryId,
            id: { not: serviceId }
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

    // Champs Express
    if (isExpressAvailable !== undefined) {
      updateData.isExpressAvailable = isExpressAvailable;
    }
    
    if (expressPrice !== undefined) {
      updateData.expressPrice = expressPrice;
    }
    
    if (expressDescription !== undefined) {
      updateData.expressDescription = expressDescription;
    }
    
    if (estimatedDuration !== undefined) {
      updateData.estimatedDuration = estimatedDuration;
    }
    
    if (isPopular !== undefined) {
      updateData.isPopular = isPopular;
    }

    // Mettre à jour le service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
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

// DELETE supprimer un service spécifique
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

    const serviceId = params.id;
    
    // Vérifier si le service existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }
    
    // Vérifier si le service est utilisé dans des projets
    const projectCount = await prisma.project.count({
      where: { serviceId: serviceId }
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

    // Vérifier si le service est utilisé dans des réservations Express
    const expressBookingCount = await prisma.expressBooking.count({
      where: { serviceId: serviceId }
    });
    
    if (expressBookingCount > 0) {
      return NextResponse.json(
        { 
          error: "Ce service est utilisé dans des réservations Express. Vous ne pouvez pas le supprimer.",
          bookingCount: expressBookingCount
        },
        { status: 409 }
      );
    }

    // Supprimer le service
    await prisma.service.delete({
      where: { id: serviceId },
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