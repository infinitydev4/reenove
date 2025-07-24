import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { prompt, projectContext } = await req.json()

    if (!prompt) {
      return NextResponse.json({ response: "Continuons avec votre projet !" })
    }

    const systemPrompt = `Tu es un assistant IA expert en accompagnement de projets de rénovation pour Reenove. Ton rôle est d'aider l'utilisateur à structurer son projet de manière naturelle et conversationnelle.

CONTEXTE PROJET :
${projectContext}

MISSION :
- Guide l'utilisateur pour collecter les informations nécessaires à son devis
- Adapte-toi à son niveau, ses besoins, ses doutes
- Détecte quand l'utilisateur a besoin d'aide, d'exemples ou de suggestions

COMPORTEMENT :
- Reste conversationnel et naturel
- Maximum 2-3 phrases par réponse
- Sois encourageant et positif
- Utilise un langage simple et accessible
- Pas de formatage markdown

STYLE :
- Français naturel et professionnel
- Ton chaleureux mais efficace
- Évite le jargon technique
- Sois précis et utile`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    const aiResponse = response.choices[0]?.message?.content?.trim() || "Continuons avec votre projet !"
    
    return NextResponse.json({ response: aiResponse })
    
  } catch (error: any) {
    console.error("Erreur génération réponse:", error)
    return NextResponse.json({ 
      response: "Je suis là pour vous aider avec votre projet de rénovation !" 
    })
  }
} 