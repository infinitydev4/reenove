import { staticCategories, staticServices } from '@/lib/data/categories'

// Interface pour définir l'état du projet
export interface ProjectState {
  [key: string]: any
  // Informations de base
  project_category?: string
  service_type?: string
  project_description?: string
  project_location?: string
  
  // Informations techniques (selon la catégorie)
  surface_area?: string
  room_type?: string
  current_state?: string
  materials_preferences?: string
  
  // Photos et analyse
  photos_uploaded?: string[]
  visual_analysis?: string
  
  // Contraintes et besoins
  project_urgency?: string
  access_constraints?: string
  timeline_constraints?: string
  specific_requirements?: string
  
  // Estimation générée par l'IA (pas demandée à l'utilisateur)
  estimated_price?: {
    min: number
    max: number
    factors: string[]
  }
}

// Interface pour les métadonnées des champs
export interface FieldMetadata {
  id: string
  displayName: string
  type: 'text' | 'selection' | 'multi_select' | 'location' | 'photos' | 'number'
  helpPrompt: string
  examples?: string[]
  options?: string[]
  isRequired: boolean
  isConditional?: boolean
  dependsOn?: string
  category?: string[]  // Pour quelles catégories ce champ est pertinent
  validation?: {
    maxLength?: number
    minValue?: number
    maxValue?: number
  }
}

// Champs toujours requis pour tous les projets
export const ALWAYS_REQUIRED_FIELDS = [
  'project_category',
  'service_type', 
  'project_description',
  'photos_uploaded',  // Photos AVANT l'adresse pour analyse GPT Vision
  'project_location'
]

// Champs requis selon la catégorie
export const CATEGORY_REQUIRED_FIELDS: Record<string, string[]> = {
  'Plomberie': ['room_type', 'current_state'],
  'Électricité': ['room_type', 'current_state'],
  'Peinture': ['surface_area', 'room_type', 'current_state', 'materials_preferences', 'specific_requirements'],
  'Menuiserie': ['materials_preferences', 'current_state'],
  'Maçonnerie': ['surface_area', 'current_state'],
  'Salle de bain': ['surface_area', 'current_state'],
  'Portes et fenêtres': ['room_type', 'materials_preferences'],
  'Jardinage': ['surface_area'],
  'Rénovation générale': ['surface_area', 'room_type', 'current_state'],
  'Autre': []
}

// Champs optionnels mais recommandés
export const OPTIONAL_FIELDS = [
  'access_constraints',
  'timeline_constraints', 
  'specific_requirements'
]

// Configuration complète des champs
export const FIELD_METADATA: Record<string, FieldMetadata> = {
  // === CHAMPS DE BASE ===
  project_category: {
    id: 'project_category',
    displayName: 'Catégorie du projet',
    type: 'selection',
    helpPrompt: 'Dans quel domaine se situe votre projet de rénovation ?',
    options: staticCategories.map(cat => cat.name),
    examples: ['Plomberie', 'Électricité', 'Peinture', 'Menuiserie'],
    isRequired: true
  },

  service_type: {
    id: 'service_type',
    displayName: 'Type de service',
    type: 'text',
    helpPrompt: 'Quel type de travaux souhaitez-vous réaliser précisément ?',
    examples: ['Remplacement de robinet', 'Installation prise électrique', 'Peinture salon'],
    isRequired: true
  },

  project_description: {
    id: 'project_description',
    displayName: 'Description détaillée',
    type: 'text',
    helpPrompt: 'Décrivez-moi en détail votre projet et vos attentes',
    examples: ['Je veux changer mon robinet de cuisine car il fuit', 'Repeindre le salon en blanc cassé'],
    isRequired: true,
    validation: { maxLength: 500 }
  },

  project_location: {
    id: 'project_location',
    displayName: 'Localisation',
    type: 'location',
    helpPrompt: 'Dans quelle ville se situe votre projet ?',
    examples: ['Paris', 'Marseille', 'Lyon'],
    isRequired: true
  },

  // === CHAMPS TECHNIQUES SELON CATÉGORIE ===
  surface_area: {
    id: 'surface_area',
    displayName: 'Surface à traiter',
    type: 'number',
    helpPrompt: 'Quelle est la surface en m² concernée par les travaux ?',
    examples: ['20 m²', '50 m²', '100 m²'],
    isRequired: false,
    isConditional: true,
    category: ['Peinture', 'Maçonnerie', 'Salle de bain', 'Jardinage', 'Rénovation générale'],
    validation: { minValue: 1, maxValue: 1000 }
  },

  room_type: {
    id: 'room_type',
    displayName: 'Type de pièce',
    type: 'selection',
    helpPrompt: 'Dans quel type de pièce se situent les travaux ?',
    options: ['Cuisine', 'Salle de bain', 'Salon', 'Chambre', 'Bureau', 'Garage', 'Extérieur', 'Autre'],
    examples: ['Cuisine', 'Salle de bain', 'Salon'],
    isRequired: false,
    isConditional: true,
    category: ['Plomberie', 'Électricité', 'Peinture', 'Portes et fenêtres', 'Rénovation générale']
  },

  current_state: {
    id: 'current_state',
    displayName: 'État actuel',
    type: 'selection',
    helpPrompt: 'Dans quel état se trouve actuellement ce qui doit être rénové ?',
    options: ['Neuf (moins de 5 ans)', 'Bon état', 'État moyen', 'Mauvais état', 'À remplacer complètement'],
    examples: ['Bon état', 'À remplacer', 'État moyen'],
    isRequired: false,
    isConditional: true,
    category: ['Plomberie', 'Électricité', 'Peinture', 'Menuiserie', 'Maçonnerie', 'Salle de bain', 'Rénovation générale']
  },

  materials_preferences: {
    id: 'materials_preferences',
    displayName: 'Préférences matériaux',
    type: 'text',
    helpPrompt: 'Avez-vous des préférences particulières pour les matériaux ou finitions ?',
    examples: ['Bois massif', 'PVC blanc', 'Peinture mat', 'Finition satinée', 'Peinture lessivable', 'Sans préférence'],
    isRequired: false,
    isConditional: true,
    category: ['Menuiserie', 'Portes et fenêtres', 'Peinture'],
    validation: { maxLength: 200 }
  },

  // === PHOTOS ET ANALYSE ===
  photos_uploaded: {
    id: 'photos_uploaded',
    displayName: 'Photos du projet',
    type: 'photos',
    helpPrompt: 'Pour une analyse précise, j\'ai besoin de photos de votre projet. Cela m\'aidera à estimer les matériaux et la complexité des travaux.',
    examples: ['Photo de l\'état actuel', 'Vue d\'ensemble de la pièce', 'Détails techniques'],
    isRequired: true
  },

  // === CONTRAINTES ET PLANNING ===
  project_urgency: {
    id: 'project_urgency',
    displayName: 'Urgence du projet',
    type: 'selection',
    helpPrompt: 'Dans quels délais souhaitez-vous réaliser ces travaux ?',
    options: ['Très urgent (moins de 2 semaines)', 'Urgent (moins d\'1 mois)', 'Normal (1-3 mois)', 'Pas pressé (plus de 3 mois)'],
    examples: ['Urgent', 'Normal', 'Pas pressé'],
    isRequired: false
  },

  access_constraints: {
    id: 'access_constraints',
    displayName: 'Contraintes d\'accès',
    type: 'text',
    helpPrompt: 'Y a-t-il des contraintes particulières pour accéder au lieu des travaux ?',
    examples: ['3ème étage sans ascenseur', 'Parking difficile', 'Pas de contraintes particulières'],
    isRequired: false,
    validation: { maxLength: 200 }
  },

  timeline_constraints: {
    id: 'timeline_constraints',
    displayName: 'Contraintes de planning',
    type: 'text',
    helpPrompt: 'Avez-vous des préférences d\'horaires ou de jours pour les travaux ?',
    examples: ['Uniquement en semaine', 'Weekend possible', 'Éviter les vacances scolaires'],
    isRequired: false,
    validation: { maxLength: 200 }
  },

    specific_requirements: {
    id: 'specific_requirements',
    displayName: 'Exigences spécifiques',
    type: 'text', 
    helpPrompt: 'Avez-vous d\'autres exigences particulières pour ce projet ?',
    examples: ['Matériaux écologiques', 'Garantie longue durée', 'Nettoyage inclus', 'Peinture lessivable', 'Sous-couche spéciale', 'Réparation fissures'],
    isRequired: false,
    validation: { maxLength: 300 }
  }
}

// Fonction pour obtenir les champs requis selon la catégorie
export function getRequiredFieldsForCategory(category: string): string[] {
  const baseRequired = [...ALWAYS_REQUIRED_FIELDS]
  const categoryRequired = CATEGORY_REQUIRED_FIELDS[category] || []
  return [...baseRequired, ...categoryRequired]
}

// Fonction pour obtenir les champs conditionnels selon l'état du projet
export function getConditionalFields(projectState: ProjectState): string[] {
  const category = projectState.project_category
  if (!category) return []
  
  const conditionalFields: string[] = []
  
  // Ajouter les champs selon la catégorie
  Object.entries(FIELD_METADATA).forEach(([fieldId, metadata]) => {
    if (metadata.isConditional && metadata.category?.includes(category)) {
      conditionalFields.push(fieldId)
    }
  })
  
  return conditionalFields
}

// Fonction pour vérifier si un champ est pertinent pour la catégorie
export function isFieldRelevantForCategory(fieldId: string, category: string): boolean {
  const field = FIELD_METADATA[fieldId]
  if (!field) return false
  
  // Si pas de catégorie spécifiée, le champ est universel
  if (!field.category) return true
  
  // Sinon, vérifier si la catégorie est dans la liste
  return field.category.includes(category)
}

// Fonction pour obtenir les services disponibles pour une catégorie
export function getServicesForCategory(categoryName: string): any[] {
  // Trouver la catégorie correspondante
  const category = staticCategories.find(cat => cat.name === categoryName)
  if (!category) return []
  
  // Retourner les services pour cette catégorie
  return staticServices[category.id] || []
}

// Fonction pour obtenir les questions expertes selon le contexte
export function getExpertQuestions(projectState: ProjectState): string[] {
  const category = projectState.project_category
  const serviceType = projectState.service_type?.toLowerCase() || ''
  
  const expertQuestions: string[] = []
  
  // Questions expertes selon la catégorie
  if (category === 'Plomberie') {
    if (serviceType.includes('robinet')) {
      expertQuestions.push('Le robinet actuel est-il encastré ou en applique ?')
      expertQuestions.push('Quel type de fixation préférez-vous ?')
    }
    if (serviceType.includes('fuite')) {
      expertQuestions.push('La fuite est-elle visible ou cachée ?')
      expertQuestions.push('Depuis quand avez-vous remarqué cette fuite ?')
    }
  }
  
  if (category === 'Peinture') {
    expertQuestions.push('Quel type de peinture souhaitez-vous ? (acrylique, glycéro, naturelle)')
    expertQuestions.push('Les murs nécessitent-ils une préparation particulière ?')
  }
  
  if (category === 'Électricité') {
    expertQuestions.push('Votre installation électrique est-elle aux normes ?')
    expertQuestions.push('Avez-vous un tableau électrique récent ?')
  }
  
  return expertQuestions
} 