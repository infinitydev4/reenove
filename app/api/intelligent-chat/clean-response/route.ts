import { OpenAI } from "openai"
import { NextRequest, NextResponse } from "next/server"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export const runtime = "edge"

export async function POST(req: NextRequest) {
  let rawValue = ""
  
  try {
    const { field, rawValue: extractedRawValue, lastSuggestions, projectContext } = await req.json()
    rawValue = extractedRawValue

    if (!rawValue || typeof rawValue !== 'string') {
      return NextResponse.json({ cleanedValue: rawValue })
    }

    const prompt = `Tu es un expert en extraction et reformulation de données de projets de rénovation.

CONTEXTE COMPLET :
- Champ à remplir : "${field}"
- Réponse utilisateur brute : "${rawValue}"
- Suggestions/clarifications données : "${lastSuggestions}"
- Projet global : ${projectContext}

MISSION INTELLIGENTE :
Analyse cette situation et détermine le VRAI contenu à stocker pour le champ "${field}".

REFORMULATION CONTEXTUELLE OBLIGATOIRE :
Quand tu extrais des suggestions ou clarifications, tu DOIS les reformuler spécifiquement pour le contexte du champ :

- **Pour "project_description"** : Reformuler en description directe du projet
- **Pour "project_location"** : Format standard "Ville, Pays" ou "Pays" (supprimer prépositions "à", "en", "dans")
- **Pour "budget_range"** : Garder exactement le format de fourchette choisi
- **Pour "project_urgency"** : Garder exactement l'option choisie
- **Pour "project_category"** : GARDER EXACTEMENT la catégorie choisie, NE PAS reformuler
- **Pour "service_type"** : GARDER EXACTEMENT le service choisi, NE PAS reformuler
- **Pour toute validation** : Extraire le CONTENU et le reformuler pour le contexte

EXEMPLES DE REFORMULATION CORRECTE :
❌ MAUVAIS : "Par exemple, ça pourrait être la rénovation de ma salle de bain..."
✅ CORRECT : "Rénovation complète de salle de bain avec douche italienne et carrelage moderne"

❌ MAUVAIS : "À Paris en France"
✅ CORRECT : "Paris, France"

❌ MAUVAIS : "En France"
✅ CORRECT : "France"

❌ MAUVAIS : "Ces suggestions sont parfaites !"
✅ CORRECT : [extraire le contenu des suggestions]

RÈGLES ABSOLUES :
1. JAMAIS de formules pédagogiques ("Par exemple", "Il s'agit de", "Quand on parle de")
2. JAMAIS de phrases d'encouragement ("Pas de souci", "Je suis là pour t'aider")
3. TOUJOURS reformuler en contenu direct pour le champ spécifique
4. EXTRAIRE le vrai contenu des suggestions et le reformuler proprement
5. Pour les localisations : supprimer prépositions et formater "Ville, Pays"
6. Corriger capitalisation (Paris, France - pas paris, france)
7. Si juste un pays → "Pays", si ville + pays → "Ville, Pays"

IMPORTANT : Réponds UNIQUEMENT avec la valeur finale reformulée et adaptée au contexte du champ "${field}". Aucune explication, aucun texte pédagogique.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en nettoyage et reformulation intelligente de données utilisateur." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 300,
    })

    const cleanedValue = response.choices[0]?.message?.content?.trim() || rawValue
    
    // Validation de qualité : s'assurer que la réponse est substantielle
    if (cleanedValue && cleanedValue.length > 3 && cleanedValue !== rawValue) {
      return NextResponse.json({ cleanedValue })
    } else {
      return NextResponse.json({ cleanedValue: rawValue })
    }
    
  } catch (error: any) {
    console.error("Erreur nettoyage réponse:", error)
    return NextResponse.json({ cleanedValue: rawValue })
  }
} 