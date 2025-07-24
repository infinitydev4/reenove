import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { projectState } = await req.json()

    if (!projectState) {
      return NextResponse.json({ estimatedPrice: null })
    }

    // Vérifier d'abord si l'utilisateur a déjà indiqué un budget
    const budgetRange = projectState.budget_range
    if (budgetRange) {
      // Extraire les chiffres du budget indiqué
      const budgetMatch = budgetRange.match(/(\d+)[\s€]*.*?(\d+)/g)
      if (budgetMatch && budgetMatch.length >= 2) {
        const nums = budgetMatch.flatMap((match: string) => match.match(/\d+/g)).map(Number)
        if (nums.length >= 2) {
          return NextResponse.json({ 
            estimatedPrice: {
              min: Math.min(...nums),
              max: Math.max(...nums)
            }
          })
        }
      }
      
      // Si format différent, essayer d'extraire différemment
      const simpleMatch = budgetRange.match(/(\d+)/)
      if (simpleMatch) {
        const basePrice = parseInt(simpleMatch[1])
        // Si on a trouvé un seul chiffre, créer une fourchette autour
        const factor = basePrice < 1000 ? 0.3 : basePrice < 10000 ? 0.2 : 0.15
        return NextResponse.json({ 
          estimatedPrice: {
            min: Math.floor(basePrice * (1 - factor)),
            max: Math.ceil(basePrice * (1 + factor))
          }
        })
      }
    }

    // Si pas de budget indiqué, utiliser l'IA pour estimer
    const prompt = `Tu es un expert en estimation de coûts de travaux de rénovation.

Analyse ce projet et donne une estimation de prix réaliste :

DONNÉES DU PROJET :
${Object.entries(projectState)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

MISSION : 
Fournis une estimation de prix en euros basée sur les informations disponibles.

RÈGLES D'ESTIMATION :
- Utilise les prix du marché français 2024
- Prends en compte la complexité, l'urgence, la localisation
- Sois réaliste et professionnel
- Donne une fourchette (min-max) avec un écart raisonnable

EXEMPLES DE PRIX MOYENS (indicatifs) :
- Plomberie simple (réparation) : 150-400€
- Électricité basique : 200-600€  
- Peinture d'une pièce : 300-800€
- Carrelage salle de bain : 800-2500€
- Cuisine équipée : 3000-15000€
- Rénovation complète appartement : 400-1200€/m²

Réponds UNIQUEMENT avec deux nombres séparés par un tiret, exemple : "800-2500"`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en estimation de coûts de travaux de rénovation avec 20 ans d'expérience en France." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 100,
    })

    const estimation = response.choices[0]?.message?.content?.trim()
    
    if (estimation) {
      // Extraire les chiffres de l'estimation
      const priceMatch = estimation.match(/(\d+)[\s€-]*(\d+)/)
      if (priceMatch) {
        let min = parseInt(priceMatch[1])
        let max = parseInt(priceMatch[2])
        
        // S'assurer que min < max
        if (min > max) {
          [min, max] = [max, min]
        }
        
        return NextResponse.json({ 
          estimatedPrice: { min, max }
        })
      }
      
      // Si format différent, chercher un seul chiffre
      const singleMatch = estimation.match(/(\d+)/)
      if (singleMatch) {
        const basePrice = parseInt(singleMatch[1])
        return NextResponse.json({ 
          estimatedPrice: {
            min: Math.floor(basePrice * 0.8),
            max: Math.ceil(basePrice * 1.2)
          }
        })
      }
    }
    
    // Fallback : estimation basique selon le type de projet
    let basePrice = 500
    
    const category = projectState.project_category?.toLowerCase() || ''
    const description = projectState.project_description?.toLowerCase() || ''
    
    if (category.includes('plomberie') || description.includes('plomberie')) {
      basePrice = 300
    } else if (category.includes('électricité') || description.includes('électricité')) {
      basePrice = 400
    } else if (category.includes('peinture') || description.includes('peinture')) {
      basePrice = 600
    } else if (category.includes('carrelage') || description.includes('carrelage')) {
      basePrice = 1200
    } else if (category.includes('cuisine') || description.includes('cuisine')) {
      basePrice = 5000
    } else if (category.includes('salle de bain') || description.includes('salle de bain')) {
      basePrice = 3000
    } else if (category.includes('rénovation') || description.includes('rénovation')) {
      basePrice = 2000
    }
    
    return NextResponse.json({ 
      estimatedPrice: {
        min: Math.floor(basePrice * 0.7),
        max: Math.ceil(basePrice * 1.5)
      }
    })
    
  } catch (error: any) {
    console.error("Erreur estimation prix:", error)
    return NextResponse.json({ estimatedPrice: null })
  }
} 