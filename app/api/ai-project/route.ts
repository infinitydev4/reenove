import { NextRequest, NextResponse } from "next/server";
import { IntelligentFormRunner } from "@/lib/intelligent-chat/intelligent-form-runner";

export const runtime = "edge";

// Store simple pour maintenir les sessions (en production, utiliser Redis ou une DB)
const sessions = new Map<string, IntelligentFormRunner>();

function getSessionId(req: NextRequest): string {
  // Générer un ID de session simple (en production, utiliser une méthode plus robuste)
  const sessionId = req.headers.get('x-session-id') || `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  return sessionId;
}

export async function POST(req: NextRequest) {
  try {
    const { userInput, resetFlow, photos } = await req.json();
    const sessionId = getSessionId(req);

    console.log("🎯 API Intelligent Chat - Input:", userInput);
    console.log("🎯 Reset flow:", resetFlow);
    console.log("📸 Photos reçues:", photos?.length || 0);
    console.log("🔑 Session ID:", sessionId);

    // Récupérer ou créer l'instance pour cette session
    let formRunner = sessions.get(sessionId);
    
    if (!formRunner || resetFlow) {
      console.log("✨ Création nouvelle instance FormRunner");
      formRunner = new IntelligentFormRunner();
      sessions.set(sessionId, formRunner);
    }

    // Si reset demandé, réinitialiser
    if (resetFlow) {
      formRunner.reset();
      console.log("✅ Système réinitialisé");
    }

    // Traiter l'entrée avec le système intelligent
    const result = await formRunner.processInput(userInput || "", photos);

    console.log("✅ Résultat traitement:", {
      output: result.output.substring(0, 100) + "...",
      isComplete: result.isComplete,
      currentQuestion: result.currentQuestion?.id || "none"
    });

    // Adapter la réponse au format attendu par l'ancien système
    const response = {
      response: result.output,
      isComplete: result.isComplete,
      currentQuestion: result.currentQuestion,
      conversationState: result.conversationState,
      projectState: formRunner.getProjectState(),
      estimatedPrice: result.estimatedPrice,
      finalAnswers: result.finalAnswers,
      options: result.options // Ajouter les options pour l'affichage des boutons
    };

    // Nettoyer les sessions anciennes (simple cleanup)
    if (sessions.size > 100) {
      const oldestKey = sessions.keys().next().value;
      if (oldestKey) {
        sessions.delete(oldestKey);
      }
    }

    // Retourner l'ID de session dans les headers pour le client
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('x-session-id', sessionId);
    
    return nextResponse;

  } catch (error: any) {
    console.error("❌ Erreur API Intelligent Chat:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors du traitement de votre demande",
        response: "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?",
        isComplete: false
      },
      { status: 500 }
    );
  }
} 