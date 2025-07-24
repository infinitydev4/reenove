import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@/lib/generated/prisma"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que l'utilisateur est un client
    if (session.user.role !== Role.USER) {
      return NextResponse.json({ error: "Accès réservé aux clients" }, { status: 403 })
    }

    // Pour l'instant, retourner 0 car nous n'avons pas encore de système de messages
    // Cette API sera étendue quand le système de messages sera implémenté
    const unreadCount = 0
    
    // Simulation future : 
    // const unreadCount = await prisma.message.count({
    //   where: {
    //     recipientId: session.user.id,
    //     isRead: false
    //   }
    // })

    return NextResponse.json({
      unreadCount
    })
    
  } catch (error) {
    console.error("Erreur lors de la récupération des messages non lus:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des messages non lus" },
      { status: 500 }
    )
  }
} 