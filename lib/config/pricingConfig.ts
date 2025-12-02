/**
 * Configuration des tarifs BTP 2025
 * Basé sur les tarifs indicatifs du marché français
 * 
 * Ce fichier centralise tous les prix pour l'estimation des devis
 */

export interface PriceRange {
  min: number;
  max: number;
  unit: 'm²' | 'ml' | 'u' | 'm³';
  basePrice: number;
  description: string;
}

export interface ServicePricing {
  baseRanges: PriceRange[];
  factors: string[];
  surfaceMultiplier?: boolean; // Indique si on doit multiplier par la surface
  minJobPrice?: number; // Prix minimum pour ce type de travaux
}

/**
 * Configuration complète des prix par catégorie et type de service
 * Structure : PRICING_CONFIG[catégorie][service_type] = ServicePricing
 */
export const PRICING_CONFIG: Record<string, Record<string, ServicePricing>> = {
  'Plomberie': {
    'réparer un robinet': {
      baseRanges: [
        { min: 137, max: 200, unit: 'u', basePrice: 168, description: 'Mitigeur douche/bain - pose' },
        { min: 100, max: 150, unit: 'u', basePrice: 125, description: 'Réparation robinet simple' }
      ],
      factors: ['Type de robinet', 'Accessibilité', 'Urgence du dépannage'],
      minJobPrice: 100
    },
    'réparer une fuite': {
      baseRanges: [
        { min: 150, max: 400, unit: 'u', basePrice: 275, description: 'Réparation fuite + raccords' }
      ],
      factors: ['Localisation de la fuite', 'Dégâts causés', 'Accessibilité'],
      minJobPrice: 150
    },
    'refaire les canalisations': {
      baseRanges: [
        { min: 37, max: 50, unit: 'm²', basePrice: 37, description: 'Réseau eau froide/chaude multicouche Ø16-20' },
        { min: 32, max: 45, unit: 'm²', basePrice: 32, description: 'Réseau évacuation PVC Ø40-100' }
      ],
      factors: ['Surface du logement', 'Accessibilité des canalisations', 'Type de matériau'],
      surfaceMultiplier: true,
      minJobPrice: 500
    },
    'installer un chauffe-eau': {
      baseRanges: [
        { min: 504, max: 800, unit: 'u', basePrice: 504, description: 'Ballon ECS 200L - pose' }
      ],
      factors: ['Type de chauffe-eau', 'Capacité du ballon', 'Installation existante'],
      minJobPrice: 500
    },
    'installer une douche': {
      baseRanges: [
        { min: 998, max: 1500, unit: 'u', basePrice: 998, description: 'Receveur + paroi douche standard' },
        { min: 1995, max: 2800, unit: 'u', basePrice: 1995, description: 'Douche à l\'italienne - receveur à carreler' }
      ],
      factors: ['Type de douche', 'Travaux d\'étanchéité', 'Équipements sanitaires'],
      minJobPrice: 900
    },
    'default': {
      baseRanges: [
        { min: 200, max: 600, unit: 'u', basePrice: 400, description: 'Intervention plomberie standard' }
      ],
      factors: ['Complexité du projet', 'Matériaux nécessaires', 'Temps d\'intervention'],
      minJobPrice: 150
    }
  },

  'Électricité': {
    'changer le tableau électrique': {
      baseRanges: [
        { min: 630, max: 900, unit: 'u', basePrice: 630, description: 'Tableau électrique 2 rangées - disjoncteurs + ID 30mA' }
      ],
      factors: ['Taille du logement', 'Nombre de circuits', 'Mise aux normes NF C 15-100'],
      minJobPrice: 600
    },
    'installer des prises': {
      baseRanges: [
        { min: 74, max: 100, unit: 'u', basePrice: 74, description: 'Prise 16A - appareillage standard' }
      ],
      factors: ['Nombre de prises', 'Saignées nécessaires', 'Type d\'appareillage'],
      minJobPrice: 150
    },
    'ajouter des luminaires': {
      baseRanges: [
        { min: 116, max: 150, unit: 'u', basePrice: 116, description: 'Point lumineux plafond - DCL/borne' },
        { min: 63, max: 90, unit: 'u', basePrice: 63, description: 'Spot LED encastré Ø68' }
      ],
      factors: ['Type de luminaire', 'Nombre de points lumineux', 'Travaux de câblage'],
      minJobPrice: 150
    },
    'mise aux normes électrique': {
      baseRanges: [
        { min: 74, max: 100, unit: 'm²', basePrice: 74, description: 'Installation complète rénovation T2/T3' },
        { min: 25, max: 40, unit: 'm²', basePrice: 25, description: 'Mise en sécurité partielle - circuits essentiels' }
      ],
      factors: ['Surface du logement', 'État de l\'installation existante', 'Niveau de mise aux normes'],
      surfaceMultiplier: true,
      minJobPrice: 800
    },
    'default': {
      baseRanges: [
        { min: 200, max: 500, unit: 'u', basePrice: 350, description: 'Intervention électrique standard' }
      ],
      factors: ['Complexité du projet', 'Normes à respecter', 'Matériel nécessaire'],
      minJobPrice: 150
    }
  },

  'Peinture': {
    'repeindre les murs': {
      baseRanges: [
        { min: 15, max: 20, unit: 'm²', basePrice: 15, description: 'Impression + 2 couches murs - acrylique' }
      ],
      factors: ['Surface à peindre', 'État des murs', 'Type de peinture choisie'],
      surfaceMultiplier: true,
      minJobPrice: 300
    },
    'peindre le plafond': {
      baseRanges: [
        { min: 13, max: 18, unit: 'm²', basePrice: 13, description: 'Impression + 2 couches plafonds - blanc' }
      ],
      factors: ['Surface du plafond', 'Hauteur sous plafond', 'État du support'],
      surfaceMultiplier: true,
      minJobPrice: 250
    },
    'peindre les boiseries': {
      baseRanges: [
        { min: 25, max: 35, unit: 'm²', basePrice: 25, description: 'Laque boiseries - portes/plinthes' }
      ],
      factors: ['Surface des boiseries', 'Préparation nécessaire', 'Type de finition'],
      surfaceMultiplier: true,
      minJobPrice: 200
    },
    'rénovation peinture complète': {
      baseRanges: [
        { min: 20, max: 30, unit: 'm²', basePrice: 25, description: 'Rénovation peinture complète' }
      ],
      factors: ['Surface totale', 'Nombre de pièces', 'Préparation des surfaces'],
      surfaceMultiplier: true,
      minJobPrice: 600
    },
    'default': {
      baseRanges: [
        { min: 15, max: 25, unit: 'm²', basePrice: 20, description: 'Peinture standard' }
      ],
      factors: ['Surface à peindre', 'Préparation nécessaire', 'Type de peinture'],
      surfaceMultiplier: true,
      minJobPrice: 300
    }
  },

  'Menuiserie': {
    'installer un placard': {
      baseRanges: [
        { min: 252, max: 400, unit: 'ml', basePrice: 252, description: 'Placard coulissant - façades + rails' }
      ],
      factors: ['Longueur du placard', 'Type de finition', 'Sur-mesure ou standard'],
      minJobPrice: 400
    },
    'poser du parquet': {
      baseRanges: [
        { min: 25, max: 40, unit: 'm²', basePrice: 25, description: 'Parquet stratifié flottant - sous-couche' },
        { min: 63, max: 85, unit: 'm²', basePrice: 63, description: 'Parquet massif 14-20mm - collé + vernis' }
      ],
      factors: ['Surface à couvrir', 'Type de parquet', 'Préparation du sol'],
      surfaceMultiplier: true,
      minJobPrice: 500
    },
    'créer des étagères': {
      baseRanges: [
        { min: 150, max: 400, unit: 'ml', basePrice: 250, description: 'Étagères sur mesure' }
      ],
      factors: ['Longueur totale', 'Type de bois', 'Fixations nécessaires'],
      minJobPrice: 300
    },
    'réparer un escalier': {
      baseRanges: [
        { min: 300, max: 800, unit: 'u', basePrice: 500, description: 'Réparation escalier bois' }
      ],
      factors: ['État de l\'escalier', 'Étendue des réparations', 'Finitions souhaitées'],
      minJobPrice: 300
    },
    'default': {
      baseRanges: [
        { min: 200, max: 600, unit: 'u', basePrice: 400, description: 'Travaux menuiserie standard' }
      ],
      factors: ['Complexité du projet', 'Matériaux choisis', 'Travaux sur-mesure'],
      minJobPrice: 250
    }
  },

  'Maçonnerie': {
    'construire un mur': {
      baseRanges: [
        { min: 68, max: 90, unit: 'm²', basePrice: 68, description: 'Mur parpaings 20cm - joints pleins' },
        { min: 84, max: 110, unit: 'm²', basePrice: 84, description: 'Mur brique BGV 20cm - collé' }
      ],
      factors: ['Surface du mur', 'Type de matériau', 'Fondations nécessaires'],
      surfaceMultiplier: true,
      minJobPrice: 500
    },
    'monter une cloison': {
      baseRanges: [
        { min: 47, max: 65, unit: 'm²', basePrice: 47, description: 'Cloison BA13 simple peau - ossature 48' },
        { min: 74, max: 95, unit: 'm²', basePrice: 74, description: 'Cloison acoustique - 70mm + laine + double BA13' }
      ],
      factors: ['Surface de la cloison', 'Type de cloison', 'Isolation phonique'],
      surfaceMultiplier: true,
      minJobPrice: 400
    },
    'couler une dalle béton': {
      baseRanges: [
        { min: 79, max: 110, unit: 'm²', basePrice: 89, description: 'Dalle béton armé C25/30 - épaisseur 10-15cm' }
      ],
      factors: ['Surface de la dalle', 'Épaisseur nécessaire', 'Armature et ferraillage'],
      surfaceMultiplier: true,
      minJobPrice: 600
    },
    'rénover la façade': {
      baseRanges: [
        { min: 37, max: 60, unit: 'm²', basePrice: 37, description: 'Enduit façade monocouche - gratté fin' },
        { min: 19, max: 30, unit: 'm²', basePrice: 19, description: 'Peinture façade - 2 couches' }
      ],
      factors: ['Surface de la façade', 'État actuel', 'Type de finition'],
      surfaceMultiplier: true,
      minJobPrice: 800
    },
    'default': {
      baseRanges: [
        { min: 300, max: 800, unit: 'u', basePrice: 500, description: 'Travaux maçonnerie standard' }
      ],
      factors: ['Complexité du projet', 'Matériaux utilisés', 'Ampleur des travaux'],
      minJobPrice: 400
    }
  },

  'Salle de bain': {
    'rénovation complète salle de bain': {
      baseRanges: [
        { min: 800, max: 1500, unit: 'm²', basePrice: 1000, description: 'Rénovation complète salle de bain' }
      ],
      factors: ['Surface de la salle de bain', 'Équipements choisis', 'État actuel'],
      surfaceMultiplier: true,
      minJobPrice: 3000
    },
    'installer une douche': {
      baseRanges: [
        { min: 998, max: 1500, unit: 'u', basePrice: 998, description: 'Receveur + paroi douche standard' },
        { min: 1995, max: 2800, unit: 'u', basePrice: 1995, description: 'Douche à l\'italienne - receveur à carreler + étanchéité' }
      ],
      factors: ['Type de douche', 'Travaux d\'étanchéité', 'Équipements sanitaires'],
      minJobPrice: 900
    },
    'changer la baignoire': {
      baseRanges: [
        { min: 800, max: 1500, unit: 'u', basePrice: 1000, description: 'Remplacement baignoire complète' }
      ],
      factors: ['Type de baignoire', 'Travaux de plomberie', 'Évacuation et raccordements'],
      minJobPrice: 800
    },
    'refaire le carrelage': {
      baseRanges: [
        { min: 40, max: 65, unit: 'm²', basePrice: 40, description: 'Carrelage sol ≤45×45 - colle C2 + joints' },
        { min: 37, max: 55, unit: 'm²', basePrice: 37, description: 'Faïence murale ≤30×60 - hauteur 2,10m' }
      ],
      factors: ['Surface à carreler', 'Type et format de carrelage', 'Préparation du support'],
      surfaceMultiplier: true,
      minJobPrice: 500
    },
    'default': {
      baseRanges: [
        { min: 500, max: 1500, unit: 'u', basePrice: 1000, description: 'Travaux salle de bain standard' }
      ],
      factors: ['Ampleur des travaux', 'Équipements sanitaires', 'État actuel'],
      minJobPrice: 600
    }
  },

  'Portes et fenêtres': {
    'installer une porte': {
      baseRanges: [
        { min: 179, max: 350, unit: 'u', basePrice: 179, description: 'Bloc-porte alvéolaire - huisserie 72' },
        { min: 294, max: 450, unit: 'u', basePrice: 294, description: 'Bloc-porte âme pleine' },
        { min: 473, max: 700, unit: 'u', basePrice: 473, description: 'Porte d\'entrée - pose + habillages' }
      ],
      factors: ['Type de porte', 'Pose en rénovation ou neuf', 'Finitions et habillages'],
      minJobPrice: 250
    },
    'changer les fenêtres': {
      baseRanges: [
        { min: 546, max: 750, unit: 'u', basePrice: 546, description: 'Fenêtre PVC DV 100×135 - pose rénovation' },
        { min: 819, max: 1100, unit: 'u', basePrice: 819, description: 'Fenêtre ALU DV 100×135 - rupture thermique' }
      ],
      factors: ['Nombre de fenêtres', 'Matériau (PVC/ALU/Bois)', 'Dimensions et configuration'],
      minJobPrice: 500
    },
    'poser des volets': {
      baseRanges: [
        { min: 546, max: 800, unit: 'u', basePrice: 546, description: 'Volet roulant motorisé - intégré' }
      ],
      factors: ['Nombre de volets', 'Type (roulant/battant)', 'Motorisation'],
      minJobPrice: 500
    },
    'installer porte-fenêtre': {
      baseRanges: [
        { min: 861, max: 1200, unit: 'u', basePrice: 861, description: 'Porte-fenêtre PVC 215×120' }
      ],
      factors: ['Type de porte-fenêtre', 'Dimensions', 'Installation et finitions'],
      minJobPrice: 800
    },
    'default': {
      baseRanges: [
        { min: 400, max: 900, unit: 'u', basePrice: 650, description: 'Menuiserie extérieure standard' }
      ],
      factors: ['Type de menuiserie', 'Matériau choisi', 'Pose et finitions'],
      minJobPrice: 400
    }
  },

  'Jardinage': {
    'créer une pelouse': {
      baseRanges: [
        { min: 15, max: 25, unit: 'm²', basePrice: 15, description: 'Gazon en plaques - préparation + pose' }
      ],
      factors: ['Surface du terrain', 'Préparation du sol', 'Type de gazon'],
      surfaceMultiplier: true,
      minJobPrice: 300
    },
    'aménagement paysager': {
      baseRanges: [
        { min: 50, max: 150, unit: 'm²', basePrice: 80, description: 'Aménagement paysager complet' }
      ],
      factors: ['Surface à aménager', 'Complexité de l\'aménagement', 'Plantations et matériaux'],
      surfaceMultiplier: true,
      minJobPrice: 800
    },
    'plantation d\'arbres': {
      baseRanges: [
        { min: 100, max: 400, unit: 'u', basePrice: 200, description: 'Plantation arbre + tuteurage' }
      ],
      factors: ['Nombre d\'arbres', 'Taille des sujets', 'Préparation du terrain'],
      minJobPrice: 200
    },
    'construire terrasse bois': {
      baseRanges: [
        { min: 126, max: 180, unit: 'm²', basePrice: 126, description: 'Terrasse bois - lame pin/composite' }
      ],
      factors: ['Surface de la terrasse', 'Type de bois', 'Structure porteuse'],
      surfaceMultiplier: true,
      minJobPrice: 1000
    },
    'default': {
      baseRanges: [
        { min: 300, max: 800, unit: 'u', basePrice: 500, description: 'Travaux jardinage standard' }
      ],
      factors: ['Surface concernée', 'Type de travaux', 'Accès au terrain'],
      minJobPrice: 300
    }
  },

  'Rénovation générale': {
    'rénovation complète': {
      baseRanges: [
        { min: 400, max: 1200, unit: 'm²', basePrice: 800, description: 'Rénovation complète appartement - 400-1200€/m²' }
      ],
      factors: ['Surface totale', 'État actuel du bien', 'Niveau de finition souhaité'],
      surfaceMultiplier: true,
      minJobPrice: 5000
    },
    'agrandissement': {
      baseRanges: [
        { min: 1200, max: 2500, unit: 'm²', basePrice: 1800, description: 'Extension/agrandissement maison' }
      ],
      factors: ['Surface à créer', 'Type d\'extension', 'Fondations et structure'],
      surfaceMultiplier: true,
      minJobPrice: 8000
    },
    'isolation thermique': {
      baseRanges: [
        { min: 116, max: 150, unit: 'm²', basePrice: 116, description: 'ITE PSE 120mm - sous enduit mince' },
        { min: 17, max: 30, unit: 'm²', basePrice: 17, description: 'Combles perdus - soufflage 300mm' }
      ],
      factors: ['Surface à isoler', 'Type d\'isolation', 'Épaisseur et performances'],
      surfaceMultiplier: true,
      minJobPrice: 1500
    },
    'aménagement combles': {
      baseRanges: [
        { min: 800, max: 1500, unit: 'm²', basePrice: 1000, description: 'Aménagement combles complet' }
      ],
      factors: ['Surface des combles', 'Isolation et charpente', 'Finitions'],
      surfaceMultiplier: true,
      minJobPrice: 5000
    },
    'default': {
      baseRanges: [
        { min: 500, max: 1200, unit: 'm²', basePrice: 800, description: 'Rénovation générale' }
      ],
      factors: ['Surface concernée', 'Étendue des travaux', 'Finitions'],
      surfaceMultiplier: true,
      minJobPrice: 3000
    }
  }
};

/**
 * Normalise un type de service pour faciliter la correspondance
 */
export function normalizeServiceType(serviceType: string): string {
  return serviceType
    .toLowerCase()
    .trim()
    .replace(/é/g, 'e')
    .replace(/è/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/à/g, 'a')
    .replace(/ç/g, 'c')
    .replace(/î/g, 'i')
    .replace(/ô/g, 'o')
    .replace(/ù/g, 'u')
    .replace(/\s+/g, ' ');
}

/**
 * Trouve le pricing le plus proche pour une catégorie et un type de service
 */
export function findClosestPricing(
  category: string, 
  serviceType: string
): ServicePricing | null {
  const categoryPricing = PRICING_CONFIG[category];
  if (!categoryPricing) {
    console.warn(`⚠️ Aucune catégorie trouvée pour: ${category}`);
    return null;
  }
  
  const normalized = normalizeServiceType(serviceType);
  
  // 1. Recherche exacte d'abord
  for (const [key, pricing] of Object.entries(categoryPricing)) {
    if (normalizeServiceType(key) === normalized) {
      console.log(`✅ Pricing exact trouvé: ${key}`);
      return pricing;
    }
  }
  
  // 2. Recherche partielle (contient)
  for (const [key, pricing] of Object.entries(categoryPricing)) {
    const normalizedKey = normalizeServiceType(key);
    if (normalized.includes(normalizedKey) || normalizedKey.includes(normalized)) {
      console.log(`✅ Pricing partiel trouvé: ${key}`);
      return pricing;
    }
  }
  
  // 3. Recherche par mots-clés similaires
  const keywords = extractKeywords(normalized);
  for (const [key, pricing] of Object.entries(categoryPricing)) {
    if (key === 'default') continue; // Skip default pour cette phase
    
    const keyKeywords = extractKeywords(normalizeServiceType(key));
    const matchScore = calculateMatchScore(keywords, keyKeywords);
    
    // Si au moins 50% des mots-clés correspondent
    if (matchScore >= 0.5) {
      console.log(`✅ Pricing trouvé par similarité (${Math.round(matchScore * 100)}%): ${key}`);
      return pricing;
    }
  }
  
  // 4. Fallback sur default
  if (categoryPricing['default']) {
    console.log(`⚠️ Utilisation du pricing par défaut pour ${category}`);
    return categoryPricing['default'];
  }
  
  console.warn(`⚠️ Aucun pricing trouvé pour: ${category} / ${serviceType}`);
  return null;
}

/**
 * Extrait les mots-clés significatifs d'une phrase
 */
function extractKeywords(text: string): string[] {
  // Mots de liaison à ignorer
  const stopWords = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'd', 'du', 'a', 'et', 'ou'];
  
  return text
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .filter(word => word.trim() !== '');
}

/**
 * Calcule le score de correspondance entre deux ensembles de mots-clés
 */
function calculateMatchScore(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  let matches = 0;
  for (const keyword1 of keywords1) {
    for (const keyword2 of keywords2) {
      // Correspondance exacte
      if (keyword1 === keyword2) {
        matches += 1;
      }
      // Correspondance partielle (un mot contient l'autre)
      else if (keyword1.includes(keyword2) || keyword2.includes(keyword1)) {
        matches += 0.5;
      }
      // Variations courantes (réparation/réparer, installation/installer)
      else if (areSimilarWords(keyword1, keyword2)) {
        matches += 0.8;
      }
    }
  }
  
  // Score normalisé par rapport au nombre total de mots-clés
  const maxKeywords = Math.max(keywords1.length, keywords2.length);
  return matches / maxKeywords;
}

/**
 * Vérifie si deux mots sont des variations du même concept
 */
function areSimilarWords(word1: string, word2: string): boolean {
  const variations: Record<string, string[]> = {
    'reparer': ['reparation', 'repare', 'reparer', 'reparateur'],
    'installer': ['installation', 'installe', 'installer', 'installateur'],
    'changer': ['changement', 'change', 'changer', 'remplacement', 'remplacer'],
    'renover': ['renovation', 'renove', 'renover', 'refaire'],
    'robinet': ['robinetterie', 'mitigeur', 'melangeur'],
    'fuite': ['fuir', 'fuit', 'fuite', 'ecoulement'],
    'canalisation': ['tuyau', 'tuyauterie', 'reseau'],
    'tableau': ['coffret', 'armoire'],
    'prise': ['prises', 'branchement'],
    'luminaire': ['eclairage', 'lumiere', 'spot'],
    'peinture': ['peindre', 'repeindre'],
    'mur': ['murs', 'murale', 'murales'],
    'plafond': ['plafonds'],
    'parquet': ['sol', 'plancher'],
    'placard': ['rangement', 'dressing'],
    'fenetre': ['fenetres', 'menuiserie'],
    'porte': ['portes']
  };
  
  // Vérifier si les deux mots appartiennent au même groupe de variations
  for (const [base, variants] of Object.entries(variations)) {
    const group = [base, ...variants];
    if (group.includes(word1) && group.includes(word2)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Extrait la valeur numérique d'une surface (ex: "25 m²" -> 25)
 */
export function extractSurfaceValue(surfaceStr: string | undefined): number | null {
  if (!surfaceStr) return null;
  
  const match = surfaceStr.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    const value = parseFloat(match[1]);
    return isNaN(value) ? null : value;
  }
  
  return null;
}

/**
 * Calcule un multiplicateur de complexité basé sur la description du projet
 */
export function getComplexityMultiplier(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  // Mots-clés indiquant une complexité élevée
  const highComplexityKeywords = [
    'complet', 'complexe', 'important', 'grande', 'grand', 'nombreux', 
    'difficile', 'urgent', 'très', 'plusieurs', 'multiple'
  ];
  
  // Mots-clés indiquant une complexité faible
  const lowComplexityKeywords = [
    'simple', 'petit', 'petite', 'basique', 'standard', 'rapide', 
    'léger', 'legere', 'minime', 'ponctuel'
  ];
  
  let multiplier = 1.0;
  let highCount = 0;
  let lowCount = 0;
  
  // Compter les occurrences de mots-clés
  for (const keyword of highComplexityKeywords) {
    if (lowerDesc.includes(keyword)) highCount++;
  }
  
  for (const keyword of lowComplexityKeywords) {
    if (lowerDesc.includes(keyword)) lowCount++;
  }
  
  // Ajuster le multiplicateur
  if (highCount > lowCount) {
    multiplier += 0.2 * (highCount - lowCount);
  } else if (lowCount > highCount) {
    multiplier -= 0.15 * (lowCount - highCount);
  }
  
  // Limiter entre 0.7 et 1.8
  return Math.max(0.7, Math.min(1.8, multiplier));
}

