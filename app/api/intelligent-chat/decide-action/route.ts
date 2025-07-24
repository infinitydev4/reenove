import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { projectState, lastInteraction } = await req.json()

    const prompt = `En tant qu'assistant intelligent, analyse l'état actuel du projet et décide de la meilleure action à prendre.

État du projet :
${projectState}

Dernière interaction :
${JSON.stringify(lastInteraction)}

Actions possibles :
1. ask_next : Poser la prochaine question logique
2. clarify : Clarifier ou approfondir le point actuel
3. suggest : Proposer des idées ou exemples
4. validate : Valider et reformuler pour confirmation
5. free_talk : Engager une conversation libre pour aider

CHAMPS DISPONIBLES (utilise EXACTEMENT ces IDs) :
- project_category (Catégorie du projet)
- service_type (Type de service) 
- project_description (Description du projet)
- project_location (Localisation du projet)
- project_urgency (Urgence du projet)
- budget_range (Budget approximatif)
- specific_materials (Matériaux spécifiques)
- accessibility_needs (Besoins d'accessibilité)
- timeline_constraints (Contraintes de planning)
- additional_services (Services additionnels)
- specific_preferences (Préférences particulières)
- photos_uploaded (Photos du projet)

Décide quelle action est la plus appropriée et quel champ cibler (ou null si conversation libre).

IMPORTANT : Utilise UNIQUEMENT les IDs de champs listés ci-dessus dans target_field. Ne les invente pas !

Réponds en JSON avec cette structure exacte :
{
  "action": "une des actions listées ci-dessus",
  "target_field": "le nom du champ ou null",
  "reasoning": "ton explication"
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en gestion de conversation intelligente pour la collecte d'informations de projets de rénovation." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 200,
    })

    const content = response.choices[0]?.message?.content || '{}'
    
    try {
      // Nettoyer le contenu pour extraire le JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0])
        
        // Valider que les champs requis sont présents
        if (decision.action && ['ask_next', 'clarify', 'suggest', 'validate', 'free_talk'].includes(decision.action)) {
          return NextResponse.json({ decision })
        }
      }
    } catch (parseError) {
      console.error('Erreur parsing JSON décision:', parseError)
    }
    
    // Fallback par défaut
    return NextResponse.json({
      decision: {
        action: 'ask_next',
        target_field: 'project_category',
        reasoning: 'Fallback - commencer par la catégorie'
      }
    })
    
  } catch (error: any) {
    console.error("Erreur décision action:", error)
    return NextResponse.json({
      decision: {
        action: 'ask_next',
        target_field: 'project_category',
        reasoning: 'Erreur - fallback par défaut'
      }
    })
  }
} 