// Configuration des champs pour les différents services de rénovation

export interface FieldConfig {
  id: string;
  displayName: string;
  type: 'text' | 'select' | 'multiselect' | 'number' | 'photos' | 'location' | 'boolean';
  required: boolean;
  question: string;
  helpPrompt?: string;
  examples?: string[];
  options?: Array<{ id: string; label: string; value: string }>;
  dependsOn?: string;
  showIf?: (values: Record<string, any>) => boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
  metadata?: Record<string, any>;
}

export interface ServiceFieldsConfig {
  serviceId: string;
  displayName: string;
  fields: FieldConfig[];
  orderPriority: number;
}

// === MIGRATION DES CONSTANTES DE field-config.ts ===

// Champs toujours requis pour tous les projets (ORDRE OPTIMISÉ UX)
export const ALWAYS_REQUIRED_FIELDS = [
  'project_category',
  'service_type', 
  'project_description',
  // Les champs spécifiques à la catégorie (room_type, current_state) sont insérés ici via getRequiredFieldsForCategory
  'photos_uploaded',  // Photos pour analyse GPT Vision
  'project_location'  // Localisation en dernier (plus administratif)
]

// Champs requis selon la catégorie
export const CATEGORY_REQUIRED_FIELDS: Record<string, string[]> = {
  'Plomberie': ['room_type', 'current_state'],
  'Électricité': ['room_type', 'current_state'],
  'Peinture': ['surface_area', 'room_type', 'current_state', 'materials_preferences'],
  'Menuiserie': ['materials_preferences', 'current_state'],
  'Maçonnerie': ['surface_area', 'current_state'],
  'Salle de bain': ['surface_area', 'current_state'],
  'Portes et fenêtres': ['room_type', 'materials_preferences'],
  'Jardinage': ['surface_area'],
  'Rénovation générale': ['surface_area', 'room_type', 'current_state'],
  'Autre': []
}

// === CONFIGURATION DES CHAMPS ===

// Configuration des champs par défaut pour tous les services
export const DEFAULT_FIELDS: FieldConfig[] = [
  {
    id: 'project_category',
    displayName: 'Catégorie du projet',
    type: 'select',
    required: true,
    question: 'Dans quel domaine se situe votre projet de rénovation ?',
    helpPrompt: 'Identifiez le domaine principal de votre projet',
    options: [
      { id: 'plumbing', label: 'Plomberie', value: 'Plomberie' },
      { id: 'electricity', label: 'Électricité', value: 'Électricité' },
      { id: 'carpentry', label: 'Menuiserie', value: 'Menuiserie' },
      { id: 'painting', label: 'Peinture', value: 'Peinture' },
      { id: 'masonry', label: 'Maçonnerie', value: 'Maçonnerie' },
      { id: 'bathroom', label: 'Salle de bain', value: 'Salle de bain' },
      { id: 'doors_windows', label: 'Portes et fenêtres', value: 'Portes et fenêtres' },
      { id: 'gardening', label: 'Jardinage', value: 'Jardinage' },
      { id: 'general', label: 'Rénovation générale', value: 'Rénovation générale' },
      { id: 'other', label: 'Autre', value: 'Autre' }
    ]
  },
  {
    id: 'service_type',
    displayName: 'Type de service',
    type: 'text',
    required: true,
    question: 'Quel type de travaux souhaitez-vous réaliser exactement ?',
    helpPrompt: 'Précisez le type exact de travaux',
    examples: ['Remplacement de robinet', 'Installation prise électrique', 'Peinture salon']
  },
  {
    id: 'project_description',
    displayName: 'Description du projet',
    type: 'text',
    required: true,
    question: 'Pouvez-vous décrire votre projet en détail ?',
    helpPrompt: 'Décrivez précisément ce que vous souhaitez réaliser',
    examples: ['Je veux changer mon robinet de cuisine car il fuit', 'Repeindre le salon en blanc cassé']
  },
  {
    id: 'photos_uploaded',
    displayName: 'Photos du projet',
    type: 'photos',
    required: true,
    question: 'Pouvez-vous ajouter des photos de l\'état actuel ?',
    helpPrompt: 'Les photos m\'aident à évaluer précisément la situation',
    examples: ['Photo de l\'état actuel', 'Vue d\'ensemble', 'Détails du problème']
  },
  {
    id: 'project_location',
    displayName: 'Localisation du projet',
    type: 'location',
    required: true,
    question: 'Dans quelle ville se situent les travaux ?',
    helpPrompt: 'La localisation influence les prix et la disponibilité',
    examples: ['Paris', 'Marseille', 'Lyon']
  }
];

// Champs conditionnels selon la catégorie
export const CONDITIONAL_FIELDS: FieldConfig[] = [
  {
    id: 'room_type',
    displayName: 'Type de pièce',
    type: 'multiselect',
    required: false,
    question: 'Dans quel(s) type(s) de pièce(s) se situent les travaux ?',
    helpPrompt: 'Vous pouvez sélectionner plusieurs pièces si les travaux concernent plusieurs espaces',
    dependsOn: 'project_category',
    showIf: (values) => ['Peinture', 'Électricité', 'Salle de bain'].includes(values.project_category),
    options: [
      { id: 'living_room', label: 'Salon', value: 'Salon' },
      { id: 'bedroom', label: 'Chambre', value: 'Chambre' },
      { id: 'kitchen', label: 'Cuisine', value: 'Cuisine' },
      { id: 'bathroom', label: 'Salle de bain', value: 'Salle de bain' },
      { id: 'toilet', label: 'WC', value: 'WC' },
      { id: 'hallway', label: 'Couloir', value: 'Couloir' },
      { id: 'garage', label: 'Garage', value: 'Garage' },
      { id: 'basement', label: 'Cave/Sous-sol', value: 'Cave/Sous-sol' }
    ]
  },
  {
    id: 'surface_area',
    displayName: 'Surface à traiter',
    type: 'text',
    required: false,
    question: 'Quelle est la surface à traiter (en m²) ?',
    helpPrompt: 'Indiquez la surface approximative',
    dependsOn: 'project_category',
    showIf: (values) => ['Peinture', 'Carrelage', 'Parquet'].includes(values.project_category),
    validation: {
      pattern: /^\d+(\.\d+)?\s*m²?$/i,
      message: 'Format attendu : "25 m²" ou "25"'
    }
  },
  {
    id: 'current_state',
    displayName: 'État actuel',
    type: 'select',
    required: false,
    question: 'Comment décririez-vous l\'état actuel ?',
    dependsOn: 'project_category',
    showIf: (values) => values.project_category && values.project_category !== 'Autre',
    options: [
      { id: 'good', label: 'Bon état', value: 'Bon état' },
      { id: 'average', label: 'État moyen', value: 'État moyen' },
      { id: 'poor', label: 'Mauvais état', value: 'Mauvais état' },
      { id: 'damaged', label: 'Endommagé', value: 'Endommagé' }
    ]
  },
  {
    id: 'materials_preferences',
    displayName: 'Préférences matériaux',
    type: 'text',
    required: false,
    question: 'Avez-vous des préférences concernant les matériaux ?',
    helpPrompt: 'Précisez vos souhaits en termes de matériaux',
    dependsOn: 'project_category',
    showIf: (values) => ['Menuiserie', 'Carrelage', 'Peinture'].includes(values.project_category),
    examples: ['Bois massif', 'Carrelage céramique', 'Peinture écologique']
  },
  {
    id: 'project_urgency',
    displayName: 'Urgence du projet',
    type: 'select',
    required: false,
    question: 'Quel est le niveau d\'urgence de votre projet ?',
    options: [
      { id: 'immediate', label: 'Urgent (dans la semaine)', value: 'Urgent' },
      { id: 'soon', label: 'Rapidement (dans le mois)', value: 'Rapidement' },
      { id: 'planned', label: 'Planifié (dans les 3 mois)', value: 'Planifié' },
      { id: 'flexible', label: 'Flexible', value: 'Flexible' }
    ]
  }
];

// Champs optionnels
export const OPTIONAL_FIELDS: FieldConfig[] = [
  {
    id: 'access_constraints',
    displayName: 'Contraintes d\'accès',
    type: 'text',
    required: false,
    question: 'Y a-t-il des contraintes d\'accès particulières ?',
    helpPrompt: 'Étage élevé, accès difficile, horaires spécifiques...',
    examples: ['5ème étage sans ascenseur', 'Accès par cour intérieure', 'Horaires de copropriété']
  },
  {
    id: 'timeline_constraints',
    displayName: 'Contraintes de planning',
    type: 'text',
    required: false,
    question: 'Avez-vous des contraintes de timing particulières ?',
    helpPrompt: 'Dates à éviter, créneaux préférés...',
    examples: ['Éviter les vacances scolaires', 'Uniquement en semaine', 'Avant fin du mois']
  },
  {
    id: 'specific_requirements',
    displayName: 'Exigences spécifiques',
    type: 'text',
    required: false,
    question: 'Avez-vous des exigences particulières ?',
    helpPrompt: 'Certifications, garanties, techniques spécifiques...',
    examples: ['Certification RGE', 'Garantie décennale', 'Matériaux écologiques']
  }
];

// Configuration complète par service
export const serviceFieldsConfiguration: Record<string, ServiceFieldsConfig> = {
  'plumb-repair': {
    serviceId: 'plumb-repair',
    displayName: 'Réparation plomberie',
    orderPriority: 1,
    fields: [
      ...DEFAULT_FIELDS,
      ...CONDITIONAL_FIELDS.filter(f => ['room_type', 'current_state', 'project_urgency'].includes(f.id)),
      ...OPTIONAL_FIELDS
    ]
  },
  'elec-install': {
    serviceId: 'elec-install',
    displayName: 'Installation électrique',
    orderPriority: 2,
    fields: [
      ...DEFAULT_FIELDS,
      ...CONDITIONAL_FIELDS.filter(f => ['room_type', 'current_state', 'project_urgency'].includes(f.id)),
      ...OPTIONAL_FIELDS
    ]
  },
  'paint-interior': {
    serviceId: 'paint-interior',
    displayName: 'Peinture intérieure',
    orderPriority: 3,
    fields: [
      ...DEFAULT_FIELDS,
      ...CONDITIONAL_FIELDS.filter(f => ['room_type', 'surface_area', 'current_state', 'materials_preferences'].includes(f.id)),
      ...OPTIONAL_FIELDS
    ]
  },
  'bath-renovation': {
    serviceId: 'bath-renovation',
    displayName: 'Rénovation salle de bain',
    orderPriority: 4,
    fields: [
      ...DEFAULT_FIELDS,
      ...CONDITIONAL_FIELDS.filter(f => ['surface_area', 'current_state', 'materials_preferences'].includes(f.id)),
      ...OPTIONAL_FIELDS
    ]
  },
  'default': {
    serviceId: 'default',
    displayName: 'Service par défaut',
    orderPriority: 999,
    fields: [
      ...DEFAULT_FIELDS,
      ...CONDITIONAL_FIELDS,
      ...OPTIONAL_FIELDS
    ]
  }
};

// Fonctions utilitaires
export function getServiceFieldsConfig(serviceId: string): FieldConfig[] {
  const config = serviceFieldsConfiguration[serviceId] || serviceFieldsConfiguration['default'];
  return config.fields;
}

export function getNextRequiredField(serviceId: string, currentValues: Record<string, any>): FieldConfig | null {
  const fields = getServiceFieldsConfig(serviceId);
  
  for (const field of fields) {
    // Vérifier si le champ est requis et pas encore rempli
    if (field.required && !currentValues[field.id]) {
      // Vérifier les conditions de dépendance
      if (field.dependsOn && !currentValues[field.dependsOn]) {
        continue; // Skip si la dépendance n'est pas remplie
      }
      
      // Vérifier les conditions showIf
      if (field.showIf && !field.showIf(currentValues)) {
        continue; // Skip si la condition n'est pas remplie
      }
      
      return field;
    }
  }
  
  return null;
}

export function validateFieldValue(field: FieldConfig, value: any): { isValid: boolean; message?: string } {
  if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return { isValid: false, message: `${field.displayName} est requis` };
  }
  
  if (value && field.validation) {
    const { min, max, pattern, message } = field.validation;
    
    if (typeof value === 'string') {
      if (min && value.length < min) {
        return { isValid: false, message: message || `Minimum ${min} caractères requis` };
      }
      if (max && value.length > max) {
        return { isValid: false, message: message || `Maximum ${max} caractères autorisés` };
      }
      if (pattern && !pattern.test(value)) {
        return { isValid: false, message: message || 'Format invalide' };
      }
    }
    
    if (typeof value === 'number') {
      if (min && value < min) {
        return { isValid: false, message: message || `Valeur minimum: ${min}` };
      }
      if (max && value > max) {
        return { isValid: false, message: message || `Valeur maximum: ${max}` };
      }
    }
  }
  
  return { isValid: true };
}

export function getFieldsForCategory(category: string): FieldConfig[] {
  // Mapper les catégories aux services
  const categoryToService: Record<string, string> = {
    'Plomberie': 'plumb-repair',
    'Électricité': 'elec-install',
    'Peinture': 'paint-interior',
    'Salle de bain': 'bath-renovation'
  };
  
  const serviceId = categoryToService[category] || 'default';
  return getServiceFieldsConfig(serviceId);
}

export function getRequiredFieldsForCategory(category: string): string[] {
  const categorySpecific = CATEGORY_REQUIRED_FIELDS[category] || [];
  
  // ORDRE OPTIMISÉ UX : Insérer les champs spécifiques à la catégorie AVANT photos et location
  const optimizedOrder = [
    'project_category',
    'service_type', 
    'project_description',
    ...categorySpecific,  // room_type, current_state, etc. ICI pour logique UX
    'photos_uploaded',
    'project_location'    // Localisation en dernier
  ];
  
  return optimizedOrder;
}

export function getConditionalFields(category: string, currentValues: Record<string, any>): FieldConfig[] {
  const fields = getFieldsForCategory(category);
  
  return fields.filter(field => {
    if (!field.dependsOn) return false;
    if (field.required) return false; // Les champs requis ne sont pas conditionnels
    
    // Vérifier la dépendance
    if (!currentValues[field.dependsOn]) return false;
    
    // Vérifier la condition showIf
    if (field.showIf && !field.showIf(currentValues)) return false;
    
    return true;
  });
}

export function isFieldRelevantForCategory(fieldId: string, category: string): boolean {
  const fields = getFieldsForCategory(category);
  return fields.some(f => f.id === fieldId);
}

// Interface ProjectState (migrée de field-config.ts)
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