import { NextRequest, NextResponse } from "next/server"
import { sendArtisanWelcomeEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    // Données de test pour l'utilisateur
    const testUser = {
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      firstName: "Jean"
    }

    // Données de test pour l'abonnement
    const testSubscription = {
      id: "test-subscription-123",
      planName: "Plan Premium",
      price: 49.99,
      status: "ACTIVE",
      stripeSubscriptionId: "sub_test123",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      trialStart: new Date(),
      trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours d'essai
      features: [
        "Accès à tous les projets disponibles",
        "Support client prioritaire",
        "Outils de gestion avancés",
        "Formation en ligne incluse",
        "Badge artisan certifié"
      ],
      maxProjects: 50,
      maxRadius: 25,
      commissionRate: 8,
    }

    // Données de test pour la facture
    const testInvoice = {
      id: "pi_test123456789",
      amount: 49.99,
      currency: "EUR",
      status: "Payé",
      paidAt: new Date(),
      invoiceNumber: "INV-TEST123",
      paymentMethod: "Carte bancaire"
    }

    // Envoyer l'email de test
    const result = await sendArtisanWelcomeEmail(testUser, testSubscription, testInvoice)

    if (result.success) {
      return NextResponse.json({
        message: "Email de test envoyé avec succès !",
        data: result.data
      })
    } else {
      return NextResponse.json({
        error: "Erreur lors de l'envoi de l'email de test",
        details: result.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error("Erreur API test email:", error)
    return NextResponse.json({
      error: "Erreur lors de l'envoi de l'email de test"
    }, { status: 500 })
  }
} 