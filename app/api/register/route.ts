import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { Role } from "@/lib/generated/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      company = "", 
      phone = "", 
      role = "USER" 
    } = body

    // Vérification des données requises
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Informations d'inscription incomplètes" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 409 }
      )
    }

    // Conversion du rôle (string) en type Role de Prisma
    let userRole: Role
    switch (role.toLowerCase()) {
      case "artisan":
        userRole = Role.ARTISAN
        break
      case "agent":
        userRole = Role.AGENT
        break
      default:
        userRole = Role.USER
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Création du nom complet
    const name = `${firstName} ${lastName}`

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        // Vous pourriez stocker d'autres infos dans des champs personnalisés
        // si vous les ajoutez au modèle User
      },
    })

    // Ne pas retourner le mot de passe hashé
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { 
        message: "Utilisateur créé avec succès", 
        user: userWithoutPassword 
      }, 
      { status: 201 }
    )

  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du compte. Veuillez réessayer." },
      { status: 500 }
    )
  }
} 