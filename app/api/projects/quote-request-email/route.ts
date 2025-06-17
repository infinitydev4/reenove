import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { sendQuoteRequestEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour envoyer un email" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { projectData } = body

    // Valider les données requises
    if (!projectData || !projectData.title || !projectData.service || !projectData.category) {
      return NextResponse.json(
        { error: "Données du projet manquantes" },
        { status: 400 }
      )
    }

    // Préparer les données de l'utilisateur
    const user = {
      name: session.user.name || "",
      email: session.user.email || "",
      firstName: session.user.name ? session.user.name.split(" ")[0] : "",
      lastName: session.user.name ? session.user.name.split(" ").slice(1).join(" ") : ""
    }

    // Préparer les données du projet
    const project = {
      title: projectData.title,
      description: projectData.description || "",
      service: projectData.service,
      category: projectData.category,
      location: projectData.location || "",
      city: projectData.city || "",
      postalCode: projectData.postalCode || "",
      estimatedPrice: projectData.estimatedPrice || null,
      budget: projectData.budget || null
    }

    // Envoyer l'email
    const result = await sendQuoteRequestEmail(user, project)

    if (result.success) {
      return NextResponse.json(
        { message: "Email de demande de devis envoyé avec succès" },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de demande de devis:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi de l'email" },
      { status: 500 }
    )
  }
} 