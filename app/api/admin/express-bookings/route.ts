import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ExpressBookingStatus } from "@/lib/generated/prisma";

// Vérifier les permissions d'administrateur
async function isAdmin(session: any) {
  if (!session?.user) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === "ADMIN";
}

// GET toutes les réservations Express pour les admins
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les paramètres de requête
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    
    // Calculer la pagination
    const skip = (page - 1) * limit;
    
    // Construire les filtres
    const whereClause: any = {};
    
    // Filtre par statut
    if (status && status !== "all") {
      whereClause.status = status as ExpressBookingStatus;
    }
    
    // Filtre de recherche (nom client, email, service)
    if (search) {
      whereClause.OR = [
        { clientName: { contains: search, mode: "insensitive" } },
        { clientEmail: { contains: search, mode: "insensitive" } },
        { clientPhone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { service: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Configuration du tri
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Requête pour obtenir les réservations avec pagination
    const [bookings, total] = await Promise.all([
      prisma.expressBooking.findMany({
        where: whereClause,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              icon: true,
              category: {
                select: {
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
            }
          },
          assignedArtisan: {
            select: {
              id: true,
              name: true,
              phone: true,
              artisanProfile: {
                select: {
                  companyName: true,
                  averageRating: true,
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.expressBooking.count({
        where: whereClause,
      })
    ]);

    // Statistiques pour le dashboard
    const stats = await prisma.expressBooking.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Convertir les stats en objet plus lisible
    const bookingStats = {
      total: total,
      pending: stats.find(s => s.status === ExpressBookingStatus.PENDING)?._count.status || 0,
      confirmed: stats.find(s => s.status === ExpressBookingStatus.CONFIRMED)?._count.status || 0,
      in_progress: stats.find(s => s.status === ExpressBookingStatus.IN_PROGRESS)?._count.status || 0,
      completed: stats.find(s => s.status === ExpressBookingStatus.COMPLETED)?._count.status || 0,
      cancelled: stats.find(s => s.status === ExpressBookingStatus.CANCELLED)?._count.status || 0,
      no_show: stats.find(s => s.status === ExpressBookingStatus.NO_SHOW)?._count.status || 0,
    };

    // Formatter la réponse
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      serviceName: booking.service.name,
      serviceIcon: booking.service.icon,
      categoryName: booking.service.category.name,
      categoryIcon: booking.service.category.icon,
      
      // Informations client
      clientName: booking.clientName,
      clientPhone: booking.clientPhone,
      clientEmail: booking.clientEmail,
      userId: booking.user.id,
      userName: booking.user.name,
      userEmail: booking.user.email,
      
      // Détails réservation
      bookingDate: booking.bookingDate,
      timeSlot: booking.timeSlot,
      price: booking.price,
      status: booking.status,
      
      // Localisation
      address: booking.address,
      city: booking.city,
      postalCode: booking.postalCode,
      floor: booking.floor,
      hasElevator: booking.hasElevator,
      
      // Notes
      notes: booking.notes,
      specialRequirements: booking.specialRequirements,
      
      // Artisan assigné
      assignedArtisan: booking.assignedArtisan ? {
        id: booking.assignedArtisan.id,
        name: booking.assignedArtisan.name,
        phone: booking.assignedArtisan.phone,
        companyName: booking.assignedArtisan.artisanProfile?.companyName,
        rating: booking.assignedArtisan.artisanProfile?.averageRating,
      } : null,
      
      // Timestamps
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      confirmedAt: booking.confirmedAt,
      completedAt: booking.completedAt,
      assignedAt: booking.assignedAt,
    }));

    return NextResponse.json({
      bookings: formattedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: bookingStats,
    });
    
  } catch (error) {
    console.error("Erreur lors de la récupération des réservations Express:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations Express" },
      { status: 500 }
    );
  }
} 