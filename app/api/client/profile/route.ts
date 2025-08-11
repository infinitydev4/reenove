import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, address, city, postalCode } = body

    // Validation des données
    if (!name?.trim()) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
    }

    // Mettre à jour les données utilisateur
    const updatedUser = await prisma.user.update({
      where: { 
        id: session.user.id 
      },
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        postalCode: postalCode?.trim() || null,
        updatedAt: new Date()
      }
    })

    // Retourner les données mises à jour (sans le mot de passe)
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json({ 
      message: "Profil mis à jour avec succès",
      user: userWithoutPassword 
    })
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les données utilisateur
    const user = await prisma.user.findUnique({
      where: { 
        id: session.user.id 
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ user })
    
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    )
  }
} 