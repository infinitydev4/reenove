import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { fieldInfo, projectContext } = await req.json()

    if (!fieldInfo) {
      return NextResponse.json({ question: "Pouvez-vous me donner plus d'informations ?" })
    }

    const prompt = `Tu es un assistant conversationnel expert en projets de rénovation. 

Tu dois collecter l'information suivante : 
- Nom du champ : ${fieldInfo.name}
- Nom affiché : ${fieldInfo.display}
- Type : ${fieldInfo.type}
- Description : ${fieldInfo.helpPrompt}
${fieldInfo.examples ? `- Exemples : ${fieldInfo.examples.join(', ')}` : ''}

Contexte du projet jusqu'ici : 
${projectContext}

MISSION : Pose la question de manière naturelle et conversationnelle pour collecter cette information. 

RÈGLES :
- Maximum 2-3 phrases
- Ton naturel et encourageant
- Pas de formatage markdown
- Si c'est un champ de sélection, mentionne brièvement les options principales
- Adapte la question selon le contexte déjà collecté

Génère UNIQUEMENT la question, sans introduction ni explication.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Tu es un assistant expert en communication naturelle pour la collecte d'informations de projets de rénovation." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const question = response.choices[0]?.message?.content?.trim() || fieldInfo.helpPrompt
    
    return NextResponse.json({ question })
    
  } catch (error: any) {
    console.error("Erreur génération question:", error)
    return NextResponse.json({ 
      question: "Pouvez-vous me donner plus d'informations sur votre projet ?" 
    })
  }
} 