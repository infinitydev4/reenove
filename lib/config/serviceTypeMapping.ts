/**
 * Mapping entre les types de services générés dynamiquement par l'IA
 * et les clés de tarification dans pricingConfig.ts
 * 
 * Ce fichier documente les correspondances les plus courantes pour faciliter la maintenance
 */

export const SERVICE_TYPE_EXAMPLES = {
  'Plomberie': [
    'réparer un robinet',
    'changer un robinet',
    'robinet qui fuit',
    'réparer une fuite',
    'fuite d\'eau',
    'refaire les canalisations',
    'canalisations',
    'installer un chauffe-eau',
    'chauffe-eau',
    'ballon d\'eau chaude',
    'installer une douche',
    'douche à l\'italienne'
  ],
  
  'Électricité': [
    'changer le tableau électrique',
    'tableau électrique',
    'mise aux normes',
    'installer des prises',
    'ajouter des prises',
    'prise électrique',
    'ajouter des luminaires',
    'installer des luminaires',
    'spots',
    'lumière',
    'mise aux normes électrique'
  ],
  
  'Peinture': [
    'repeindre les murs',
    'peinture murs',
    'peindre le plafond',
    'peinture plafond',
    'peindre les boiseries',
    'boiseries',
    'rénovation peinture complète',
    'tout repeindre'
  ],
  
  'Menuiserie': [
    'installer un placard',
    'placard sur mesure',
    'poser du parquet',
    'parquet',
    'créer des étagères',
    'étagères',
    'réparer un escalier',
    'escalier'
  ],
  
  'Maçonnerie': [
    'construire un mur',
    'mur',
    'monter une cloison',
    'cloison',
    'couler une dalle béton',
    'dalle béton',
    'dalle',
    'rénover la façade',
    'façade',
    'enduit façade'
  ],
  
  'Salle de bain': [
    'rénovation complète salle de bain',
    'rénover salle de bain',
    'installer une douche',
    'douche',
    'changer la baignoire',
    'baignoire',
    'refaire le carrelage',
    'carrelage salle de bain'
  ],
  
  'Portes et fenêtres': [
    'installer une porte',
    'porte',
    'changer les fenêtres',
    'fenêtres',
    'poser des volets',
    'volets',
    'installer porte-fenêtre',
    'porte-fenêtre'
  ],
  
  'Jardinage': [
    'créer une pelouse',
    'pelouse',
    'gazon',
    'aménagement paysager',
    'jardin',
    'plantation d\'arbres',
    'arbres',
    'construire terrasse bois',
    'terrasse'
  ],
  
  'Rénovation générale': [
    'rénovation complète',
    'tout rénover',
    'agrandissement',
    'extension',
    'isolation thermique',
    'isolation',
    'aménagement combles',
    'combles'
  ]
};

/**
 * Suggestions de questions que l'IA pourrait poser pour chaque catégorie
 * pour aider à mieux cibler le type de service
 */
export const CLARIFICATION_QUESTIONS = {
  'Plomberie': [
    'S\'agit-il d\'une fuite à réparer en urgence ?',
    'Souhaitez-vous remplacer un équipement sanitaire ?',
    'Voulez-vous refaire complètement les canalisations ?'
  ],
  
  'Électricité': [
    'Souhaitez-vous mettre l\'installation aux normes ?',
    'Voulez-vous ajouter de nouveaux points lumineux ou prises ?',
    'S\'agit-il du remplacement du tableau électrique ?'
  ],
  
  'Peinture': [
    'Quelle surface souhaitez-vous peindre (murs, plafond, boiseries) ?',
    'S\'agit-il d\'une rénovation complète ou partielle ?',
    'Combien de pièces sont concernées ?'
  ],
  
  'Menuiserie': [
    'Souhaitez-vous installer du mobilier sur mesure ?',
    'Voulez-vous poser un revêtement de sol ?',
    'S\'agit-il d\'une réparation ou d\'une création ?'
  ],
  
  'Maçonnerie': [
    'Souhaitez-vous créer ou abattre une structure ?',
    'S\'agit-il de gros œuvre ou de finitions ?',
    'Quelle est l\'ampleur des travaux ?'
  ]
};

/**
 * Mots-clés pour améliorer la détection automatique du type de service
 */
export const SERVICE_KEYWORDS = {
  urgence: ['urgent', 'rapidement', 'vite', 'fuite', 'panne'],
  reparation: ['réparer', 'réparation', 'fixer', 'problème', 'cassé'],
  installation: ['installer', 'poser', 'mettre', 'ajouter', 'créer'],
  renovation: ['rénover', 'rénovation', 'refaire', 'moderniser'],
  remplacement: ['changer', 'remplacer', 'nouveau', 'neuf']
};

