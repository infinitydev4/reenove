import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

// Initialiser le client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, projectData } = await req.json();

    // Vérifier si les messages sont fournis
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages invalides" },
        { status: 400 }
      );
    }

    console.log("Étape actuelle:", projectData?.step);
    console.log("Détails fournis:", projectData?.details?.substring(0, 50));

    // Spécifiquement pour les détails du projet, forcer l'IA à fournir une estimation
    let forceEstimation = false;
    
    if (projectData?.step === "details" && projectData?.details) {
      forceEstimation = true;
      console.log("Forçage de l'estimation de prix activé");
    }

    // Préparation du contexte avec les données du projet
    let systemPrompt = `Tu es un assistant IA expert en gestion de projets de rénovation pour l'application Renoveo. 
    Ton objectif est de guider efficacement les utilisateurs à travers le processus de création de projet en posant des questions stratégiques pour collecter rapidement toutes les informations nécessaires.
    
    CONSIGNES STRICTES:
    1. Sois ultra-précis, direct et professionnel. Limite-toi à 2-3 phrases par réponse.
    2. Pose UNE SEULE question concrète et précise par message.
    3. INSTRUCTION CRITIQUE: À ta PREMIÈRE réponse après réception des détails du projet, tu DOIS SYSTÉMATIQUEMENT COMMENCER par donner une estimation de prix sous forme "entre X€ et Y€".
    4. Le format OBLIGATOIRE de ta réponse à un descriptif de projet est: "Pour [résumé du projet] à [localisation], l'estimation de prix se situe entre X€ et Y€. Cela inclut [détails inclus]."
    5. Après l'estimation, encourage l'utilisateur à s'inscrire pour recevoir des devis d'artisans qualifiés.
    6. N'attends JAMAIS que le client demande une estimation ou un résumé, c'est à TOI de le proposer.
    7. Ta mission est de conduire l'utilisateur jusqu'à l'inscription - sois proactif et directif.
    
    CECI EST CRUCIAL ET NON NÉGOCIABLE: Dès que l'utilisateur décrit son projet, tu DOIS IMMÉDIATEMENT donner une estimation de prix dans ta réponse. Cette estimation est OBLIGATOIRE à chaque première réponse après description d'un projet.`;

    // Si nous sommes à l'étape des détails, renforcer l'instruction sur l'estimation
    if (forceEstimation) {
      systemPrompt = `${systemPrompt}
      
      Tu viens de recevoir les détails d'un projet: "${projectData?.details}".
      
      INSTRUCTION URGENTE: Ta prochaine réponse DOIT OBLIGATOIREMENT contenir une estimation de prix entre X€ et Y€. 
      Analyse les détails fournis et propose une fourchette de prix pour ce projet. 
      Si les informations sont insuffisantes, fais une estimation approximative mais FOURNIS TOUJOURS UN PRIX.
      
      Format obligatoire: "Pour [résumé du projet] à [localisation], l'estimation de prix se situe entre X€ et Y€. Cela inclut [détails inclus]."`
    }

    if (projectData) {
      systemPrompt += `\n\nVoici les informations actuelles du projet :
      - Localisation: ${projectData.location ? `${projectData.location.address}, ${projectData.location.postalCode} ${projectData.location.city}` : "Non spécifiée"}
      - Catégorie: ${projectData.category ? projectData.category.name : "Non spécifiée"}
      - Service: ${projectData.service ? projectData.service.name : "Non spécifié"}
      - Détails: ${projectData.details || "Non spécifiés"}`;
    }

    // Construction du tableau de messages pour l'API OpenAI
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    // Appel à l'API OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extraction de la réponse
    const { choices } = response;
    if (!choices || choices.length === 0) {
      throw new Error("Réponse vide de l'API OpenAI");
    }

    const responseText = choices[0].message.content || "";

    // Analyse du texte pour détecter un titre de projet potentiel et une estimation
    let detectedTitle = null;
    let estimatedPrice = null;
    
    // Si nous sommes à l'étape où l'IA génère un titre
    if (
      projectData?.step === "details" && 
      projectData.details && 
      !projectData.title &&
      responseText && responseText.includes("titre")
    ) {
      // Essayez de détecter un titre entre guillemets ou après "titre :"
      const titleMatch = responseText.match(/titre\s*:?\s*["']([^"']+)["']/i) || 
                         responseText.match(/["']([^"']+)["']\s+serait un bon titre/i);
      
      if (titleMatch && titleMatch[1]) {
        detectedTitle = titleMatch[1];
      }
    }
    
    // Vérifier une estimation de prix dans la réponse - POUR TOUTES LES ÉTAPES
    if (
      (projectData?.step === "questions" || projectData?.step === "details") &&
      responseText && (
        responseText.toLowerCase().includes("€") || 
        responseText.toLowerCase().includes("euros") || 
        responseText.toLowerCase().includes("euro") || 
        responseText.toLowerCase().includes("prix") || 
        responseText.toLowerCase().includes("cout") || 
        responseText.toLowerCase().includes("coût") || 
        responseText.toLowerCase().includes("estimation") ||
        responseText.toLowerCase().includes("estimé") ||
        responseText.toLowerCase().includes("estimatif") ||
        responseText.toLowerCase().includes("entre") && /\d+/.test(responseText)
      )
    ) {
      // Plusieurs patterns possibles pour détecter les prix
      // Pattern 1: "entre X et Y euros" ou "entre X€ et Y€"
      let priceMatch = responseText.match(/entre\s+(\d+[\s\.,]?\d*)\s*(?:et|à|-)\s*(\d+[\s\.,]?\d*)\s*(?:€|euros|euro)/i);
      
      // Pattern 2: "X - Y euros" ou "X-Y€"
      if (!priceMatch) {
        priceMatch = responseText.match(/(\d+[\s\.,]?\d*)\s*(?:-|à)\s*(\d+[\s\.,]?\d*)\s*(?:€|euros|euro)/i);
      }
      
      // Pattern 3: "de X à Y euros"
      if (!priceMatch) {
        priceMatch = responseText.match(/de\s+(\d+[\s\.,]?\d*)\s*(?:à|jusqu'à)\s*(\d+[\s\.,]?\d*)\s*(?:€|euros|euro)/i);
      }
      
      // Pattern 4: Toute mention de prix avec chiffres et symbole euro près l'un de l'autre
      if (!priceMatch) {
        priceMatch = responseText.match(/(\d+[\s\.,]?\d*)(?:\s*€|\s+euros|\s+euro)[\s\S]*?(?:et|à|-|jusqu'à)[\s\S]*?(\d+[\s\.,]?\d*)(?:\s*€|\s+euros|\s+euro)/i);
      }

      // Pattern 5: Recherche simple de deux nombres proches l'un de l'autre dans un contexte de prix
      if (!priceMatch) {
        const simpleMatch = Array.from(responseText.matchAll(/\b(\d+[\s\.,]?\d*)\b/g));
        if (simpleMatch.length >= 2 && 
            simpleMatch[0].index !== undefined && 
            simpleMatch[1].index !== undefined && 
            Math.abs(simpleMatch[1].index - (simpleMatch[0].index + simpleMatch[0][0].length)) < 30) {
          priceMatch = [
            "",
            simpleMatch[0][1],
            simpleMatch[1][1]
          ];
        }
      }
      
      // Si on a trouvé des prix
      if (priceMatch) {
        let minPrice = parseFloat(priceMatch[1].replace(/\s/g, "").replace(",", "."))
        let maxPrice = parseFloat(priceMatch[2].replace(/\s/g, "").replace(",", "."))
        
        // S'assurer que min est inférieur à max
        if (minPrice > maxPrice) {
          [minPrice, maxPrice] = [maxPrice, minPrice]
        }
        
        // Créer une estimation de prix
        estimatedPrice = {
          min: minPrice,
          max: maxPrice
        };
        
        // Log pour débuggage
        console.log("Prix détecté:", minPrice, "-", maxPrice);
      }
    }
    // Forcer la génération d'une estimation pour la première réponse à l'étape des questions
    else if ((projectData?.step === "questions" || projectData?.step === "details") && !projectData.estimatedPrice && /\d+/.test(responseText)) {
      // Chercher toutes les paires de nombres dans la réponse
      const numberPairs = [];
      const numberMatches = Array.from(responseText.matchAll(/\b(\d+[\s\.,]?\d*)\b/g));
      
      console.log("Nombres détectés dans la réponse:", numberMatches.map(m => m[0]));
      
      // Grouper les nombres par paires s'ils sont proches
      for (let i = 0; i < numberMatches.length - 1; i++) {
        if (numberMatches[i].index !== undefined && 
            numberMatches[i+1].index !== undefined && 
            Math.abs(numberMatches[i+1].index - (numberMatches[i].index + numberMatches[i][0].length)) < 50) {
          numberPairs.push({
            min: parseFloat(numberMatches[i][1].replace(/\s/g, "").replace(",", ".")),
            max: parseFloat(numberMatches[i+1][1].replace(/\s/g, "").replace(",", "."))
          });
          i++; // Sauter le second nombre puisqu'il fait partie de la paire
        }
      }
      
      console.log("Paires de nombres détectées:", numberPairs);
      
      // Si nous avons trouvé au moins une paire de nombres
      if (numberPairs.length > 0) {
        // Choisir la paire avec l'écart le plus plausible (min et max pas trop éloignés)
        const validPairs = numberPairs.filter(pair => 
          pair.max > pair.min && 
          pair.max / pair.min < 10 // Écart raisonnable
        );
        
        if (validPairs.length > 0) {
          const bestPair = validPairs[0];
          estimatedPrice = {
            min: bestPair.min,
            max: bestPair.max
          };
          console.log("Prix inféré:", bestPair.min, "-", bestPair.max);
        }
      } 
      // Si nous sommes à l'étape des détails et que nous n'avons pas trouvé de paire mais au moins un nombre
      else if (projectData?.step === "details" && numberMatches.length > 0) {
        // Utiliser le premier nombre comme base et créer une fourchette autour de lui
        const basePrice = parseFloat(numberMatches[0][1].replace(/\s/g, "").replace(",", "."));
        
        // Pour les petits montants (<100€), fourchette de +/- 30%
        // Pour les montants moyens (100-1000€), fourchette de +/- 20%
        // Pour les gros montants (>1000€), fourchette de +/- 15%
        let minFactor = 0.7;
        let maxFactor = 1.3;
        
        if (basePrice >= 100 && basePrice < 1000) {
          minFactor = 0.8;
          maxFactor = 1.2;
        } else if (basePrice >= 1000) {
          minFactor = 0.85;
          maxFactor = 1.15;
        }
        
        estimatedPrice = {
          min: Math.floor(basePrice * minFactor),
          max: Math.ceil(basePrice * maxFactor)
        };
        
        console.log("Prix généré à partir d'un seul chiffre:", estimatedPrice.min, "-", estimatedPrice.max);
      }
      // Si on est à l'étape des détails et qu'on n'a trouvé aucun nombre, créer une estimation par défaut
      else if (projectData?.step === "details" && forceEstimation) {
        // Estimation par défaut basée sur le type de service
        let basePrice = 300; // Prix de base par défaut
        
        // Ajuster selon le type de service si disponible
        if (projectData.service?.name) {
          const serviceName = projectData.service.name.toLowerCase();
          
          if (serviceName.includes("plomberie") || serviceName.includes("électricité")) {
            basePrice = 200;
          } else if (serviceName.includes("chauffage") || serviceName.includes("climatisation")) {
            basePrice = 500;
          } else if (serviceName.includes("rénovation") || serviceName.includes("construction")) {
            basePrice = 1000;
          }
        }
        
        estimatedPrice = {
          min: Math.floor(basePrice * 0.8),
          max: Math.ceil(basePrice * 1.5)
        };
        
        console.log("Prix généré par défaut:", estimatedPrice.min, "-", estimatedPrice.max);
      }
    }

    return NextResponse.json({
      response: responseText,
      detectedTitle,
      estimatedPrice
    });
  } catch (error: any) {
    console.error("Erreur lors de l'appel à l'API OpenAI:", error);
    return NextResponse.json(
      { error: error.message || "Erreur interne du serveur" },
      { status: 500 }
    );
  }
} 