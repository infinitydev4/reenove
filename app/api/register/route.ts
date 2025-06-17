import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { Role } from "@/lib/generated/prisma"
import { sendWelcomeEmail } from "@/lib/email"

// Interface pour les données d'inscription
interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  role?: string;
}

// Types pour gestion des erreurs
interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Fonction de validation des données d'entrée
const validateInputData = (data: UserRegistrationData): string | null => {
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    return "Informations d'inscription incomplètes";
  }
  return null;
};

// Gestion des erreurs de l'API
const handleApiError = (error: unknown): NextResponse<{ error: ApiError }> => {
  console.error("Erreur d'inscription:", error);
  
  const apiError: ApiError = {
    message: error instanceof Error ? error.message : "Une erreur s'est produite lors de l'inscription",
  };
  
  if (error instanceof Error && 'code' in error) {
    apiError.code = (error as { code: string }).code;
  }
  
  return NextResponse.json({ error: apiError }, { status: 500 });
};

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
        phone,
        // Vous pourriez stocker d'autres infos dans des champs personnalisés
        // si vous les ajoutez au modèle User
      },
    })

    // Si c'est un artisan, créer son profil par défaut
    if (userRole === Role.ARTISAN) {
      await prisma.artisanProfile.create({
        data: {
          userId: newUser.id,
          companyName: company || "",
          onboardingCompleted: false,
          assessmentCompleted: false,
        }
      })
    }

    // Ne pas retourner le mot de passe hashé
    const { password: _, ...userWithoutPassword } = newUser

    // Envoyer l'email de bienvenue (en arrière-plan pour ne pas bloquer la réponse)
    try {
      await sendWelcomeEmail({
        name: name,
        email: email,
        firstName: firstName,
        lastName: lastName
      })
    } catch (emailError) {
      // Log l'erreur mais ne pas faire échouer l'inscription
      console.error("Erreur lors de l'envoi de l'email de bienvenue:", emailError)
    }

    return NextResponse.json(
      { 
        message: "Utilisateur créé avec succès", 
        user: userWithoutPassword 
      }, 
      { status: 201 }
    )

  } catch (error) {
    return handleApiError(error)
  }
} 