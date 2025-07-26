import { NextRequest, NextResponse } from "next/server";
import { IntelligentFormRunner } from "@/lib/intelligent-chat/intelligent-form-runner";

export const runtime = "edge";

// Store simple pour maintenir les sessions (en production, utiliser Redis ou une DB)
const sessions = new Map<string, IntelligentFormRunner>();

function getSessionId(req: NextRequest): string {
  // Récupérer l'ID de session depuis les headers ou générer un nouveau
  const sessionId = req.headers.get('x-session-id');
  if (sessionId) {
    return sessionId;
  }
  
  // Générer un nouvel ID seulement si aucun n'existe
  return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
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
    
    if (!formRunner) {
      console.log("✨ Création nouvelle instance FormRunner");
      formRunner = new IntelligentFormRunner();
      sessions.set(sessionId, formRunner);
    } else {
      console.log("♻️ Réutilisation instance FormRunner existante");
      console.log("🗂️ État projet actuel:", formRunner.getProjectState());
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
      output: result.output,
      isComplete: result.isComplete,
      currentQuestion: result.currentQuestion?.id,
      conversationState: result.conversationState,
      finalAnswers: result.finalAnswers,
      estimatedPrice: result.estimatedPrice,
      photos: result.photos,
      options: result.options,
      sessionId: sessionId // Retourner l'ID de session pour le frontend
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Erreur API Intelligent Chat:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la demande" },
      { status: 500 }
    );
  }
} 