import { NextRequest, NextResponse } from "next/server";
import { pusherServer, CHANNELS, EVENTS } from "@/lib/pusher";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification et les droits
    const session = await getServerSession(authOptions);
    
    if (!session?.user || 
        (session.user.role !== Role.ADMIN && 
         session.user.role !== Role.AGENT && 
         session.user.role !== Role.ARTISAN)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Récupérer les données de la notification
    const { title, message, type, link } = await req.json();

    // Valider les données
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Données de notification invalides" },
        { status: 400 }
      );
    }

    // Créer l'objet notification
    const notification = {
      id: uuidv4(),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
      link: link || undefined
    };

    // Envoyer la notification via Pusher
    await pusherServer.trigger(
      CHANNELS.NOTIFICATIONS,
      EVENTS.NEW_NOTIFICATION,
      notification
    );

    return NextResponse.json(
      { success: true, notification },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de la notification:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la notification" },
      { status: 500 }
    );
  }
} 