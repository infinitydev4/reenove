import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExpressBookingStatus } from "@/lib/generated/prisma";
import { z } from "zod";

// Vérifier les permissions d'administrateur
async function isAdmin(session: any) {
  if (!session?.user) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === "ADMIN";
}

// Schéma de validation pour la mise à jour
const updateBookingSchema = z.object({
  status: z.nativeEnum(ExpressBookingStatus).optional(),
  assignedArtisanId: z.string().optional(),
  notes: z.string().optional(),
});

// GET détails d'une réservation spécifique
export async function GET(
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

    const bookingId = params.id;

    // Récupérer la réservation avec tous les détails
    const booking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            expressDescription: true,
            icon: true,
            estimatedDuration: true,
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        assignedArtisan: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            artisanProfile: {
              select: {
                companyName: true,
                averageRating: true,
                yearsOfExperience: true,
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error("Erreur lors de la récupération de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la réservation" },
      { status: 500 }
    );
  }
}

// PUT mettre à jour une réservation
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

    const bookingId = params.id;
    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);

    // Vérifier que la réservation existe
    const existingBooking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Gestion du changement de statut
    if (validatedData.status) {
      updateData.status = validatedData.status;
      
      // Ajouter des timestamps selon le statut
      if (validatedData.status === ExpressBookingStatus.CONFIRMED) {
        updateData.confirmedAt = new Date();
      } else if (validatedData.status === ExpressBookingStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    // Gestion de l'assignation d'artisan
    if (validatedData.assignedArtisanId !== undefined) {
      if (validatedData.assignedArtisanId) {
        // Vérifier que l'artisan existe et est actif
        const artisan = await prisma.user.findUnique({
          where: { 
            id: validatedData.assignedArtisanId,
            role: "ARTISAN",
          },
          include: {
            artisanProfile: {
              select: {
                availableForWork: true,
              }
            }
          }
        });

        if (!artisan || !artisan.artisanProfile?.availableForWork) {
          return NextResponse.json(
            { error: "Artisan non trouvé ou non disponible" },
            { status: 400 }
          );
        }

        updateData.assignedArtisanId = validatedData.assignedArtisanId;
        updateData.assignedAt = new Date();
        
        // Confirmer automatiquement si pas encore confirmé
        if (existingBooking.status === ExpressBookingStatus.PENDING) {
          updateData.status = ExpressBookingStatus.CONFIRMED;
          updateData.confirmedAt = new Date();
        }
      } else {
        // Retirer l'assignation
        updateData.assignedArtisanId = null;
        updateData.assignedAt = null;
      }
    }

    // Mise à jour des notes
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes;
    }

    // Mettre à jour la réservation
    const updatedBooking = await prisma.expressBooking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        service: {
          select: {
            name: true,
            category: { select: { name: true } }
          }
        },
        assignedArtisan: {
          select: {
            name: true,
            phone: true,
          }
        }
      }
    });

    console.log(`✅ Réservation Express mise à jour par admin: ${bookingId}`);

    return NextResponse.json({
      booking: {
        id: updatedBooking.id,
        serviceName: updatedBooking.service.name,
        categoryName: updatedBooking.service.category.name,
        status: updatedBooking.status,
        assignedArtisan: updatedBooking.assignedArtisan,
        updatedAt: updatedBooking.updatedAt,
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Données invalides", 
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la réservation" },
      { status: 500 }
    );
  }
}

// DELETE supprimer une réservation (admin uniquement)
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

    const bookingId = params.id;

    // Vérifier que la réservation existe
    const booking = await prisma.expressBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        clientName: true,
        service: { select: { name: true } }
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Supprimer la réservation
    await prisma.expressBooking.delete({
      where: { id: bookingId }
    });

    console.log(`✅ Réservation Express supprimée par admin: ${bookingId}`);

    return NextResponse.json({
      message: "Réservation supprimée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de la réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la réservation" },
      { status: 500 }
    );
  }
} 