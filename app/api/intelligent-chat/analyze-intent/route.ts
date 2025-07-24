import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { userInput, context, recentContext } = await req.json()

    if (!userInput) {
      return NextResponse.json({ intent: "complete_answer" })
    }

    const prompt = `Analyse cette réponse utilisateur et détermine son intention principale :

Réponse : "${userInput}"
Contexte : ${context}
Mémoire récente : ${recentContext}

INTENTIONS POSSIBLES :
- complete_answer : Réponse complète et directe à la question
- validates_suggestions : L'utilisateur VALIDE des suggestions précédentes
- need_help : Demande d'aide ou d'exemples  
- uncertainty : Hésitation ou doute
- question_back : Pose une question à l'IA
- clarification : Demande de clarification
- suggestion_request : Demande de suggestions

DÉTECTION INTELLIGENTE DE VALIDATION :
Si l'utilisateur fait référence à des suggestions précédentes avec des phrases comme :
- "Les 3 points sont justes" / "Ces points me vont"
- "Le point 2 est bon" / "L'exemple 1 convient"
- "Ces suggestions sont parfaites" / "C'est exactement ça"
- "Oui ces idées" / "Ces exemples me conviennent"
- Références à des numéros (1, 2, 3, "le premier", "les deux")
→ ALORS c'est "validates_suggestions"

Réponds UNIQUEMENT avec l'intention détectée, en un seul mot.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un expert en analyse d'intention conversationnelle." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 50,
    })

    const intent = response.choices[0]?.message?.content?.trim().toLowerCase() || "complete_answer"
    
    // Valider que l'intention est dans la liste autorisée
    const validIntents = [
      'complete_answer', 'validates_suggestions', 'need_help',
      'uncertainty', 'question_back', 'clarification', 'suggestion_request'
    ]
    
    const finalIntent = validIntents.includes(intent) ? intent : 'complete_answer'
    
    return NextResponse.json({ intent: finalIntent })
    
  } catch (error: any) {
    console.error("Erreur analyse intention:", error)
    return NextResponse.json({ intent: "complete_answer" })
  }
} 