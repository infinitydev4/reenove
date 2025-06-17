import { NextRequest, NextResponse } from "next/server"
import { sendWelcomeEmail, sendQuoteRequestEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, email, name } = body

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email et nom requis" },
        { status: 400 }
      )
    }

    const testUser = {
      name: name,
      email: email,
      firstName: name.split(" ")[0] || name,
      lastName: name.split(" ").slice(1).join(" ") || ""
    }

    if (type === "welcome") {
      const result = await sendWelcomeEmail(testUser)
      return NextResponse.json({ 
        success: result.success, 
        message: result.success ? "Email de bienvenue envoyé" : "Erreur lors de l'envoi",
        data: result.data,
        error: result.error
      })
    } else if (type === "quote") {
      const testProject = {
        title: "Rénovation salle de bain",
        description: "Rénovation complète d'une salle de bain de 8m² avec remplacement des équipements sanitaires, carrelage au sol et murs, peinture du plafond.",
        service: "Rénovation salle de bain",
        category: "Plomberie",
        location: "123 Rue de la Paix",
        city: "Paris",
        postalCode: "75001",
        estimatedPrice: {
          min: 8500,
          max: 12000
        }
      }

      const result = await sendQuoteRequestEmail(testUser, testProject)
      return NextResponse.json({ 
        success: result.success, 
        message: result.success ? "Email de devis envoyé" : "Erreur lors de l'envoi",
        data: result.data,
        error: result.error
      })
    } else {
      return NextResponse.json(
        { error: "Type invalide. Utilisez 'welcome' ou 'quote'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Erreur lors du test d'email:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du test" },
      { status: 500 }
    )
  }
} 