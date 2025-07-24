import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { userInput, suggestions } = await req.json()

    if (!suggestions || !userInput) {
      return NextResponse.json({ extracted: userInput })
    }

    const prompt = `L'utilisateur valide certaines suggestions que je lui ai faites.

Suggestions données : 
"${suggestions}"

Validation de l'utilisateur : "${userInput}"

MISSION : Analyser quelle(s) suggestion(s) l'utilisateur valide et extraire UNIQUEMENT leur contenu.

RÈGLES D'EXTRACTION :
1. Si l'utilisateur dit "les 3 points", "tous les points", "les suggestions" → extraire TOUT le contenu suggéré
2. Si l'utilisateur mentionne un numéro spécifique ("le point 2", "la première") → extraire uniquement ce point
3. Si l'utilisateur valide partiellement ("les deux premiers") → extraire les points correspondants
4. Retourner uniquement les VALEURS/CONTENUS, pas les numéros ni le formatage

EXEMPLES :
- Suggestions: "1. Plomberie 2. Électricité 3. Chauffage" + Validation: "les 3 points" → "Plomberie, Électricité, Chauffage"
- Suggestions: "Par exemple: Carrelage, Peinture, Parquet" + Validation: "parfait" → "Carrelage, Peinture, Parquet"
- Suggestions: "1. Urgent 2. Modéré 3. Pas pressé" + Validation: "le point 2" → "Modéré"

Réponds UNIQUEMENT avec le contenu extrait, proprement formaté.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en extraction de validations d'utilisateur à partir de suggestions." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 200,
    })

    const extracted = response.choices[0]?.message?.content?.trim() || userInput
    
    // Validation : si l'extraction semble avoir échoué (contient encore des mots de validation), 
    // retourner l'input original
    const stillValidation = /parfait|excellent|super|génial|bonne suggestion|ces points/i.test(extracted)
    if (stillValidation || extracted === userInput) {
      // Essayer extraction directe simple
      const directMatch = suggestions.match(/(?:1\.\s*|2\.\s*|3\.\s*|\-\s*|•\s*)([^1-9\n]+)/g)
      if (directMatch) {
        const cleanedSuggestions = directMatch
          .map((match: string) => match.replace(/^(?:1\.\s*|2\.\s*|3\.\s*|\-\s*|•\s*)/, '').trim())
          .filter((item: string) => item.length > 0)
          .join(', ')
        
        if (cleanedSuggestions) {
          return NextResponse.json({ extracted: cleanedSuggestions })
        }
      }
    }
    
    return NextResponse.json({ extracted })
    
  } catch (error: any) {
    console.error("Erreur extraction validation:", error)
    return NextResponse.json({ extracted: "Je n'ai pas réussi à extraire les suggestions valides." })
  }
} 