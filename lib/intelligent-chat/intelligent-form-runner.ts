import { OpenAI } from "openai"
import { 
  ALWAYS_REQUIRED_FIELDS, 
  CATEGORY_REQUIRED_FIELDS,
  OPTIONAL_FIELDS, 
  FIELD_METADATA, 
  getConditionalFields,
  getRequiredFieldsForCategory,
  isFieldRelevantForCategory,
  getServicesForCategory,
  getExpertQuestions,
  type FieldMetadata, 
  type ProjectState 
} from './field-config'
import { staticCategories } from '@/lib/data/categories'

// Configuration OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

// Types pour les messages et l'état de conversation
export type MessageType = "user" | "bot" | "system" | "selection" | "summary" | "photos"

export interface ChatMessage {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  fieldId?: string
  options?: Array<{
    id: string
    label: string
    value: string
  }>
  photos?: string[]
  showEstimationButton?: boolean
  canEdit?: boolean
}

export interface ConversationState {
  currentFocus: string | null
  lastIntent: string | null
  conversationMode: 'guided' | 'free' | 'helping'
  helpCount: number
  lastSuggestions: string
  isComplete: boolean
  expertContext: string // Contexte expert selon la catégorie
}

export interface EstimatedPrice {
  min: number
  max: number
  factors: string[]
}

export interface FormRunnerResult {
  output: string
  isComplete: boolean
  currentQuestion?: FieldMetadata | null
  conversationState: ConversationState
  finalAnswers?: ProjectState
  estimatedPrice?: EstimatedPrice
  photos?: string[]
  options?: Array<{
    id: string
    label: string
    value: string
  }>
}

// Prompts système optimisés pour expertise en rénovation
const EXPERT_SYSTEM_PROMPT = `Tu es un expert en devis de rénovation et travaux, spécialisé dans l'accompagnement personnalisé de clients.

CONTEXTE PROJET ACTUEL :
{project_context}

EXPERTISE PAR DOMAINE :
{expert_context}

TON RÔLE D'EXPERT :
- Analyser les besoins réels selon le type de travaux demandé
- Poser les questions techniques pertinentes pour établir un devis précis
- Adapter ton expertise selon la catégorie (plomberie, électricité, peinture, etc.)
- Détecter les éléments manquants cruciaux pour l'estimation
- Proposer des solutions et alternatives si pertinent

STYLE DE CONVERSATION :
- Professionnel mais accessible
- Questions courtes et précises (2-3 phrases max)
- Vocabulaire technique adapté au niveau du client
- Exemples concrets quand utile

INTELLIGENCE CONTEXTUELLE :
- Ne pose QUE les questions essentielles au type de projet
- Adapte la technicité selon les réponses du client
- Détecte quand le client a besoin d'éclaircissements
- Guide vers les informations qui impactent vraiment le prix

Tu es là pour créer le meilleur devis possible avec un minimum de questions pertinentes.`

const CATEGORY_EXPERTISE: Record<string, string> = {
  'Plomberie': `Expert en installations sanitaires : robinetterie, canalisations, chauffage, fuites. 
    Questions clés : type d'installation, accessibilité, état des canalisations, pression eau.`,
  
  'Électricité': `Expert en installations électriques : prises, éclairage, tableaux, mise aux normes.
    Questions clés : installation existante, normes, puissance nécessaire, sécurité.`,
  
  'Peinture': `Expert en revêtements : peintures, papiers peints, préparation surfaces.
    Questions clés : surface, état des murs, type de peinture, finitions.`,
  
  'Menuiserie': `Expert en travail du bois : meubles, parquets, escaliers, structures.
    Questions clés : essence de bois, finitions, contraintes techniques, sur-mesure.`,
  
  'Maçonnerie': `Expert en construction : murs, fondations, béton, pierre.
    Questions clés : nature du sol, contraintes structurelles, matériaux, surface.`,
  
  'Salle de bain': `Expert en rénovation de salles de bain complètes.
    Questions clés : surface, étanchéité, évacuations, équipements sanitaires.`,
  
  'Portes et fenêtres': `Expert en menuiseries extérieures : isolation, sécurité, esthétique.
    Questions clés : dimensions, matériaux, performances thermiques, pose.`,
  
  'Jardinage': `Expert en aménagement paysager : plantations, terrassement, arrosage.
    Questions clés : surface, exposition, type de sol, maintenance.`,
  
  'Rénovation générale': `Expert en rénovation complète : coordination corps d'état.
    Questions clés : surface, état général, priorités, contraintes globales.`
}

const INTENT_ANALYSIS_PROMPT = `Analyse cette réponse utilisateur et détermine son intention principale :

Réponse : "{user_input}"
Contexte actuel : {context}
Expertise : {expert_context}

INTENTIONS POSSIBLES :
- complete_answer : Réponse directe et complète à la question
- need_help : Demande d'aide ou d'éclaircissements  
- uncertainty : Hésitation ou doute
- question_back : Pose une question technique
- validates_choice : Confirme un choix ou une suggestion
- provides_details : Donne des détails supplémentaires
- provides_photos : Upload ou fourniture de photos

Détecte si l'utilisateur :
- Répond directement (complete_answer)
- Semble perdu ou demande de l'aide (need_help)
- Hésite ou n'est pas sûr (uncertainty)
- Pose une question technique (question_back)
- Confirme quelque chose (validates_choice)
- Donne plus de détails (provides_details)

Réponds UNIQUEMENT avec l'intention détectée, en un seul mot.`

const NEXT_ACTION_PROMPT = `En tant qu'expert en devis de rénovation, analyse l'état du projet et décide de la meilleure action.

État du projet :
{project_state}

Dernière interaction :
{last_interaction}

Expertise contextuelle :
{expert_context}

CHAMPS VALIDES (utilise EXACTEMENT ces noms) :
- project_category (catégorie)
- service_type (type de service)
- project_description (description détaillée)
- photos_uploaded (photos du projet)
- project_location (adresse du projet)
- surface_area (surface en m²)
- room_type (type de pièce)
- current_state (état actuel)
- materials_preferences (préférences matériaux)
- specific_requirements (exigences spécifiques)
- access_constraints (contraintes d'accès)
- timeline_constraints (contraintes de délais)

ACTIONS POSSIBLES :
1. ask_next : Poser la prochaine question technique essentielle
2. clarify : Clarifier un point technique important
3. suggest : Proposer des options ou solutions
4. request_photos : Demander des photos pour analyse
5. validate : Confirmer et générer l'estimation
6. expert_advice : Donner un conseil d'expert

PRIORITÉS D'UN EXPERT :
- Questions essentielles pour l'estimation en premier
- Photos pour les projets complexes ou ambigus
- Clarifications techniques si réponses floues
- Conseils d'expert si besoin détecté

⚠️ IMPORTANT : Pour target_field, utilise EXACTEMENT les noms de champs listés ci-dessus !

Réponds en JSON avec cette structure :
{
  "action": "une des actions listées",
  "target_field": "le nom EXACT du champ (surface_area pas surface) ou null",
  "reasoning": "ton raisonnement d'expert"
}`

// Classe principale du système intelligent expert
export class IntelligentFormRunner {
  private projectState: ProjectState = {}
  private conversationState: ConversationState = {
    currentFocus: null,
    lastIntent: null,
    conversationMode: 'guided',
    helpCount: 0,
    lastSuggestions: '',
    isComplete: false,
    expertContext: ''
  }
  private conversationMemory: ChatMessage[] = []

  constructor() {
    // Le constructeur reste simple
  }

  // Méthode principale de traitement des entrées
  async processInput(input: string, photos?: string[]): Promise<FormRunnerResult> {
    console.log('🎯 === DÉBUT PROCESS INPUT EXPERT ===')
    console.log('📥 Input utilisateur:', input)
    console.log('📸 Photos fournies:', photos?.length || 0)
    console.log('🗂️ État projet actuel:', this.projectState)

    // Sauvegarder les photos dans le project state si elles sont fournies
    if (photos && photos.length > 0) {
      console.log('📸 Sauvegarde des photos dans le project state:', photos)
      this.projectState.photos_uploaded = photos
      console.log('✅ Photos sauvegardées dans le project state')
      
      // Si on est en train de demander des photos, passer directement à la prochaine étape
      if (this.conversationState.currentFocus === 'photos_uploaded') {
        console.log('📸 Photos reçues pour la question actuelle, passage à la suite')
        this.conversationState.currentFocus = null // Reset pour permettre la prochaine question
        
        // Décider de la prochaine action après avoir reçu les photos
        const nextAction = await this.decideExpertAction(input, 'provides_photos')
        console.log('⚡ Action experte après photos:', nextAction)
        
        // Exécuter l'action
        const result = await this.executeExpertAction(nextAction, input)
        console.log('✨ Résultat après traitement photos:', {
          output: result.output,
          currentQuestion: result.currentQuestion?.id || 'aucune',
          isComplete: result.isComplete
        })
        console.log('🎯 === FIN PROCESS INPUT EXPERT (PHOTOS) ===')
        
        return result
      }
    }
    console.log('💭 Contexte conversation:', this.conversationState)
    
    // Sauvegarder les photos si elles sont fournies
    if (photos && photos.length > 0) {
      this.projectState.photos_uploaded = photos
      console.log('📸 Photos sauvegardées dans l\'état projet')
    }
    
    try {
      // Si c'est le début, initialiser
      if (Object.keys(this.projectState).length === 0 && !input) {
        console.log('🏁 Initialisation de la conversation experte')
        return await this.startExpertConversation()
      }

      // Analyser l'intention de l'utilisateur
      console.log('🔍 Analyse de l\'intention experte...')
      const intent = await this.analyzeIntent(input)
      console.log('🎭 Intention détectée:', intent)
      
      // Sauvegarder la réponse si pertinente
      if ((intent === 'complete_answer' || intent === 'validates_choice' || intent === 'provides_details') 
          && this.conversationState.currentFocus) {
        console.log('💾 Sauvegarde réponse experte pour:', this.conversationState.currentFocus)
        await this.saveToProjectState(this.conversationState.currentFocus, input)
        console.log('✅ État projet après sauvegarde:', this.projectState)
        
        // Mettre à jour le contexte expert si catégorie définie
        if (this.conversationState.currentFocus === 'project_category') {
          this.updateExpertContext(input)
        }
      }

      // Décider de la prochaine action experte
      console.log('🤔 Décision de la prochaine action experte...')
      const nextAction = await this.decideExpertAction(input, intent)
      console.log('⚡ Action experte décidée:', nextAction)
      
      // Exécuter l'action
      console.log('🚀 Exécution de l\'action experte...')
      const result = await this.executeExpertAction(nextAction, input)
      console.log('✨ Résultat final expert:', {
        output: result.output,
        currentQuestion: result.currentQuestion?.id || 'aucune',
        isComplete: result.isComplete
      })
      console.log('🎯 === FIN PROCESS INPUT EXPERT ===')
      
      return result
      
    } catch (error) {
      console.error('💥 Erreur processInput expert:', error)
      return this.handleError()
    }
  }

  // Analyser l'intention avec expertise métier
  private async analyzeIntent(input: string): Promise<string> {
    console.log('🔍 Analyse intention experte - Input:', input)
    
    if (!process.env.OPENAI_API_KEY || !input) {
      console.log('⚡ Pas d\'API ou input vide, retour fallback: complete_answer')
      return 'complete_answer'
    }

    try {
      const contextData = {
        currentFocus: this.conversationState.currentFocus,
        category: this.projectState.project_category,
        serviceType: this.projectState.service_type
      }
      console.log('📋 Contexte expert pour analyse:', contextData)
      
      const prompt = INTENT_ANALYSIS_PROMPT
        .replace('{user_input}', input)
        .replace('{context}', JSON.stringify(contextData))
        .replace('{expert_context}', this.conversationState.expertContext)

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Tu es un expert en analyse d'intention pour devis de rénovation." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 50,
      })

      const intent = response.choices[0]?.message?.content?.trim().toLowerCase() || "complete_answer"
      
      // Valider que l'intention est dans la liste autorisée
      const validIntents = [
        'complete_answer', 'need_help', 'uncertainty', 'question_back', 
        'validates_choice', 'provides_details'
      ]
      
      const finalIntent = validIntents.includes(intent) ? intent : 'complete_answer'
      console.log('🎭 Intention analysée par expert IA:', finalIntent)
      
      this.conversationState.lastIntent = finalIntent
      
      return finalIntent
    } catch (error) {
      console.error('💥 Erreur analyse intention experte:', error)
      console.log('⚡ Fallback: complete_answer')
      return 'complete_answer'
    }
  }

  // Décider de la prochaine action avec expertise métier
  private async decideExpertAction(userInput: string, intent: string): Promise<any> {
    console.log('🤔 Décision action experte - Input:', userInput, 'Intent:', intent)
    
    // Calculer les champs manquants avec la nouvelle logique experte
    const category = this.projectState.project_category
    const requiredFields = category ? getRequiredFieldsForCategory(category) : ALWAYS_REQUIRED_FIELDS
    const conditionalFields = getConditionalFields(this.projectState)
    
    const missingRequired = requiredFields.filter(f => !this.projectState[f])
    const missingConditional = conditionalFields.filter(f => !this.projectState[f])
    const missingOptional = OPTIONAL_FIELDS.filter(f => !this.projectState[f])
    
    console.log('📋 Analyse experte des champs:')
    console.log('   - Requis manquants:', missingRequired)
    console.log('   - Conditionnels manquants:', missingConditional)
    console.log('   - Optionnels manquants:', missingOptional)
    console.log('🎯 Focus actuel:', this.conversationState.currentFocus)
    
    // VÉRIFICATION EXPERTE 1 : Si tous les champs essentiels sont remplis → FINALISER
    if (missingRequired.length === 0 && missingConditional.length === 0) {
      console.log('✅ EXPERTISE COMPLÈTE → GÉNÉRATION DEVIS')
      return {
        action: 'validate',
        target_field: null,
        reasoning: 'Toutes les informations techniques nécessaires collectées'
      }
    }
    
    // VÉRIFICATION EXPERTE 2 : Éviter la répétition sur champ déjà rempli
    if (this.conversationState.currentFocus && this.projectState[this.conversationState.currentFocus]) {
      console.log('🚫 FOCUS SUR CHAMP DÉJÀ REMPLI:', this.conversationState.currentFocus)
      
      // Rediriger intelligemment vers le prochain champ important
      if (missingRequired.length > 0) {
        console.log('🔄 Redirection experte vers champ requis:', missingRequired[0])
        return {
          action: 'ask_next',
          target_field: missingRequired[0],
          reasoning: 'Éviter répétition - focus sur prochain champ essentiel'
        }
      } else if (missingConditional.length > 0) {
        console.log('🔄 Redirection experte vers champ conditionnel:', missingConditional[0])
        return {
          action: 'ask_next',
          target_field: missingConditional[0],
          reasoning: 'Éviter répétition - focus sur champ technique pertinent'
        }
      }
    }

    // Logique experte pour les photos
    if (this.shouldRequestPhotos()) {
      return {
        action: 'request_photos',
        target_field: 'photos_uploaded',
        reasoning: 'Photos nécessaires pour estimation précise selon expertise métier'
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      console.log('⚡ Pas d\'API, utilisation fallback expert')
      return this.fallbackExpertAction(intent, missingRequired, missingConditional)
    }

    try {
      const prompt = NEXT_ACTION_PROMPT
        .replace('{project_state}', this.getExpertProjectDescription())
        .replace('{last_interaction}', JSON.stringify({
          userInput,
          intent,
          currentFocus: this.conversationState.currentFocus
        }))
        .replace('{expert_context}', this.conversationState.expertContext)

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Tu es un expert en devis de rénovation pour la prise de décision intelligente." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.4,
        max_tokens: 200,
      })

      const content = response.choices[0]?.message?.content || '{}'
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const decision = JSON.parse(jsonMatch[0])
          
          if (decision.action && ['ask_next', 'clarify', 'suggest', 'request_photos', 'validate', 'expert_advice'].includes(decision.action)) {
            console.log('✅ Décision experte validée:', decision)
            return decision
          }
        }
      } catch (parseError) {
        console.error('Erreur parsing JSON décision experte:', parseError)
      }
      
      // Fallback intelligent
      return {
        action: 'ask_next',
        target_field: missingRequired[0] || 'project_category',
        reasoning: 'Fallback expert - continuer collecte info essentielles'
      }
      
    } catch (error) {
      console.error('💥 Erreur décision prochaine action experte:', error)
      return this.fallbackExpertAction(intent, missingRequired, missingConditional)
    }
  }

  // Fallback expert si pas d'API
  private fallbackExpertAction(intent: string, missingRequired: string[], missingConditional: string[]): any {
    console.log('⚡ Fallback action experte - Intent:', intent)
    
    if (intent === 'need_help' || intent === 'uncertainty') {
      return {
        action: 'suggest',
        target_field: this.conversationState.currentFocus,
        reasoning: 'Expert help needed'
      }
    }
    
    if (missingRequired.length > 0) {
      return {
        action: 'ask_next',
        target_field: missingRequired[0],
        reasoning: 'Next required field by expert priority'
      }
    }
    
    if (missingConditional.length > 0) {
      return {
        action: 'ask_next',
        target_field: missingConditional[0],
        reasoning: 'Next conditional field by expert analysis'
      }
    }
    
    return {
      action: 'validate',
      target_field: null,
      reasoning: 'Expert analysis complete'
    }
  }

  // Exécuter l'action avec expertise métier
  private async executeExpertAction(action: any, userInput: string): Promise<FormRunnerResult> {
    const { action: actionType, target_field } = action
    
    console.log('🎬 Exécution action experte:', actionType, 'pour le champ:', target_field)
    
    // Mettre à jour le focus
    if (target_field) {
      this.conversationState.currentFocus = target_field
    }

    switch (actionType) {
      case 'ask_next':
        console.log('➡️ Action experte: Demander prochaine question technique')
        return this.askExpertQuestion(target_field)
        
      case 'clarify':
        console.log('❓ Action experte: Clarifier point technique')
        return this.clarifyExpertPoint(target_field, userInput)
        
      case 'suggest':
        console.log('💡 Action experte: Donner suggestions métier')
        return this.provideExpertSuggestions(target_field)
        
      case 'request_photos':
        console.log('📸 Action experte: Demander photos pour analyse')
        return this.requestPhotosForAnalysis()
        
      case 'validate':
        console.log('✅ Action experte: Valider et générer devis')
        return this.validateAndGenerateQuote()
        
      case 'expert_advice':
        console.log('👨‍🔧 Action experte: Conseil d\'expert')
        return this.provideExpertAdvice(userInput)
        
      default:
        console.log('🔄 Action experte par défaut')
        return this.askNextLogicalExpertQuestion()
    }
  }

  // Poser une question experte selon le champ
  private async askExpertQuestion(fieldName: string): Promise<FormRunnerResult> {
    console.log('📝 askExpertQuestion appelé pour:', fieldName)
    
    const fieldMetadata = FIELD_METADATA[fieldName]
    if (!fieldMetadata) {
      console.error('❌ Aucune métadonnée experte trouvée pour le champ:', fieldName)
      return this.handleError()
    }

    console.log('❓ Métadonnées expertes trouvées:', fieldMetadata.displayName)
    
    // Générer les options automatiquement selon le type de champ
    let options: Array<{ id: string, label: string, value: string }> | undefined = undefined
    
    console.log('🔍 Vérification fieldName:', fieldName)
    console.log('🔍 Catégories statiques disponibles:', staticCategories?.length || 0)
    
    if (fieldName === 'project_category') {
      console.log('✅ Condition project_category remplie')
      // Pour les catégories, utiliser les catégories statiques
      if (staticCategories && staticCategories.length > 0) {
        options = staticCategories.map(cat => ({
          id: cat.id,
          label: cat.name,
          value: cat.name // Utiliser le nom comme valeur
        }))
        console.log('🏷️ Options catégories générées:', options.length)
        console.log('🏷️ Première catégorie:', options[0])
      } else {
        console.error('❌ Catégories statiques vides ou indisponibles')
      }
    } else if (fieldMetadata.options) {
      // Pour les autres champs avec options prédéfinies
      options = fieldMetadata.options.map(opt => ({
        id: opt.toLowerCase().replace(/\s+/g, '-'),
        label: opt,
        value: opt
      }))
      console.log('🏷️ Options prédéfinies générées:', options.length)
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚡ Pas d\'API, retour question experte statique avec options')
      return {
        output: fieldMetadata.helpPrompt,
        isComplete: false,
        currentQuestion: fieldMetadata,
        conversationState: this.conversationState,
        options
      }
    }

    try {
      const expertPrompt = `Tu es un expert en ${this.projectState.project_category || 'rénovation'}.

Tu dois collecter l'information suivante de manière experte : 
- Champ : ${fieldName}
- Nom : ${fieldMetadata.displayName}
- Type : ${fieldMetadata.type}
- Contexte : ${fieldMetadata.helpPrompt}
${fieldMetadata.examples ? `- Exemples : ${fieldMetadata.examples.join(', ')}` : ''}
${options ? `- Options disponibles : ${options.map(o => o.label).join(', ')}` : ''}

Contexte projet actuel : 
${this.getExpertProjectDescription()}

Expertise métier :
${this.conversationState.expertContext}

MISSION EXPERTE : Pose UNE question précise et technique pour collecter cette information cruciale pour le devis.

RÈGLES EXPERT :
- Question courte et technique (2-3 phrases max)
- Vocabulaire adapté au domaine (${this.projectState.project_category || 'rénovation'})
- Focus sur ce qui impacte réellement le prix
- ${options ? 'Les utilisateurs pourront choisir parmi les options proposées ou répondre librement' : 'Exemples concrets si nécessaire pour clarifier'}
- Pas de formatage markdown

Génère UNIQUEMENT la question experte, sans introduction.`

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: EXPERT_SYSTEM_PROMPT
              .replace('{project_context}', this.getExpertProjectDescription())
              .replace('{expert_context}', this.conversationState.expertContext)
          },
          { role: "user", content: expertPrompt }
        ],
        temperature: 0.7,
        max_tokens: 150,
      })

      const output = response.choices[0]?.message?.content?.trim() || fieldMetadata.helpPrompt

      console.log('✅ Question experte générée:', output)
      console.log('🏷️ Options à afficher:', options?.length || 0)

      return {
        output,
        isComplete: false,
        currentQuestion: fieldMetadata,
        conversationState: this.conversationState,
        options
      }
    } catch (error) {
      console.error('💥 Erreur askExpertQuestion:', error)
      console.log('⚡ Fallback vers question statique avec options')
      return {
        output: fieldMetadata.helpPrompt,
        isComplete: false,
        currentQuestion: fieldMetadata,
        conversationState: this.conversationState,
        options
      }
    }
  }

  // Autres méthodes expertes simplifiées...
  private async clarifyExpertPoint(fieldName: string, userInput: string): Promise<FormRunnerResult> {
    const fieldMetadata = FIELD_METADATA[fieldName]
    if (!fieldMetadata) {
      return this.askNextLogicalExpertQuestion()
    }

    const response = await this.generateExpertResponse(`L'utilisateur semble avoir besoin d'éclaircissement technique sur "${fieldMetadata.displayName}".

Sa réponse : "${userInput}"
Contexte expert : ${this.conversationState.expertContext}

En tant qu'expert, aide-le avec des précisions techniques et des exemples concrets du domaine. Reste bref et professionnel.`)
    
    this.conversationState.lastSuggestions = `[CLARIFICATION EXPERTE pour ${fieldName}] ${response}`
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: fieldMetadata,
      conversationState: this.conversationState
    }
  }

  private async provideExpertSuggestions(fieldName: string): Promise<FormRunnerResult> {
    const fieldMetadata = FIELD_METADATA[fieldName]
    
    if (!fieldMetadata?.examples) {
      return this.clarifyExpertPoint(fieldName, '')
    }

    const response = await this.generateExpertResponse(`L'utilisateur a besoin de suggestions d'expert pour "${fieldMetadata.displayName}".

Contexte technique : ${fieldMetadata.helpPrompt}
Domaine d'expertise : ${this.conversationState.expertContext}

Propose 2-3 options concrètes basées sur ton expertise métier : ${fieldMetadata.examples?.join(', ')}. Explique brièvement l'impact sur le devis si pertinent.`)
    
    this.conversationState.lastSuggestions = `[SUGGESTIONS EXPERTES pour ${fieldName}] ${response}`
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: fieldMetadata,
      conversationState: this.conversationState
    }
  }

  private async requestPhotosForAnalysis(): Promise<FormRunnerResult> {
    const response = await this.generateExpertResponse(`En tant qu'expert, tu as besoin de photos pour une estimation précise.

Projet : ${this.projectState.service_type} - ${this.projectState.project_category}
Localisation : ${this.projectState.project_location}

Explique pourquoi les photos sont importantes pour ce type de projet et quels éléments photographier (état actuel, contraintes d'accès, détails techniques). Sois spécifique au domaine.`)
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: FIELD_METADATA['photos_uploaded'],
      conversationState: this.conversationState,
      photos: []
    }
  }

  private async validateAndGenerateQuote(): Promise<FormRunnerResult> {
    console.log('✅ Validation experte et génération devis')
    
    // Analyser les photos avec GPT-4 Vision si disponibles
    let photoAnalysis = ""
    if (this.projectState.photos_uploaded && Array.isArray(this.projectState.photos_uploaded) && this.projectState.photos_uploaded.length > 0) {
      console.log('📸 Analyse des photos en cours...', this.projectState.photos_uploaded.length, 'photos')
      photoAnalysis = await this.analyzePhotosWithVision(this.projectState.photos_uploaded)
      console.log('✅ Analyse visuelle terminée')
    } else {
      console.log('⚠️ Aucune photo valide trouvée pour l\'analyse')
    }
    
    // Générer une estimation de prix experte
    const estimatedPrice = await this.generateExpertPriceEstimation()
    
    // Créer un résumé professionnel et bien formaté
    const response = await this.generateProfessionalSummary(photoAnalysis, estimatedPrice)
    
    this.conversationState.isComplete = true
    
    return {
      output: response,
      isComplete: true,
      currentQuestion: null,
      conversationState: this.conversationState,
      finalAnswers: this.projectState,
      estimatedPrice
    }
  }

  // Générer un résumé professionnel bien formaté
  private async generateProfessionalSummary(photoAnalysis: string, estimatedPrice: EstimatedPrice): Promise<string> {
    const category = this.projectState.project_category
    const service = this.projectState.service_type
    const location = this.projectState.project_location
    
    // Informations principales du projet
    const projectInfo = [
      `Catégorie : ${category}`,
      `Service : ${service}`,
      `Localisation : ${location}`,
      this.projectState.surface_area ? `Surface : ${this.projectState.surface_area}m²` : null,
      this.projectState.room_type ? `Pièce : ${this.projectState.room_type}` : null,
      this.projectState.current_state ? `État actuel : ${this.projectState.current_state}` : null,
      this.projectState.materials_preferences ? `Préférences : ${this.projectState.materials_preferences}` : null,
      this.projectState.specific_requirements ? `Exigences : ${this.projectState.specific_requirements}` : null
    ].filter(Boolean)
    
    // Estimation budgétaire
    const budgetText = `Estimation budgétaire : ${estimatedPrice.min}€ - ${estimatedPrice.max}€`
    
    // Facteurs de prix
    const factorsText = estimatedPrice.factors && estimatedPrice.factors.length > 0 
      ? `Facteurs influençant le prix :\n${estimatedPrice.factors.map(factor => `• ${factor}`).join('\n')}`
      : ""
    
    // Analyse visuelle si disponible
    const visualAnalysisText = photoAnalysis && photoAnalysis !== "Aucune photo fournie pour l'analyse" 
      ? `\nAnalyse des photos :\n${photoAnalysis}`
      : ""
    
    // Construire le résumé final
    const summary = [
      `🎯 ANALYSE EXPERTE TERMINÉE`,
      ``,
      `📋 DÉTAILS DU PROJET`,
      projectInfo.join('\n'),
      ``,
      `💰 ${budgetText}`,
      ``,
      factorsText,
      visualAnalysisText,
      ``,
      `✅ Votre projet est maintenant prêt pour recevoir des devis d'artisans qualifiés.`
    ].filter(Boolean).join('\n')
    
    return summary
  }

  private async provideExpertAdvice(userInput: string): Promise<FormRunnerResult> {
    const response = await this.generateExpertResponse(`L'utilisateur semble avoir besoin d'un conseil d'expert.

Son message : "${userInput}"
Contexte projet : ${this.getExpertProjectDescription()}
Expertise : ${this.conversationState.expertContext}

Donne un conseil professionnel pertinent basé sur ton expertise du domaine. Sois constructif et technique.`)
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: null,
      conversationState: this.conversationState
    }
  }

  private async askNextLogicalExpertQuestion(): Promise<FormRunnerResult> {
    const category = this.projectState.project_category
    const requiredFields = category ? getRequiredFieldsForCategory(category) : ALWAYS_REQUIRED_FIELDS
    const conditionalFields = getConditionalFields(this.projectState)
    
    const missingRequired = requiredFields.filter(f => !this.projectState[f])
    const missingConditional = conditionalFields.filter(f => !this.projectState[f])
    const missingOptional = OPTIONAL_FIELDS.filter(f => !this.projectState[f])
    
    console.log('📋 Demande question logique experte:')
    console.log('   - Requis manquants:', missingRequired)
    console.log('   - Conditionnels manquants:', missingConditional)
    console.log('   - Optionnels manquants:', missingOptional)
    
    if (missingRequired.length > 0) {
      console.log('➡️ Prochaine question experte: champ requis', missingRequired[0])
      return this.askExpertQuestion(missingRequired[0])
    }
    
    if (missingConditional.length > 0) {
      console.log('➡️ Prochaine question experte: champ conditionnel', missingConditional[0])
      return this.askExpertQuestion(missingConditional[0])
    }
    
    if (missingOptional.length > 0 && missingOptional.includes('photos_uploaded')) {
      console.log('📸 Proposition experte: photos')
      return this.requestPhotosForAnalysis()
    }
    
    console.log('✅ Toutes les questions expertes complétées, génération devis')
    return this.validateAndGenerateQuote()
  }

  // Méthodes utilitaires expertes
  private updateExpertContext(category: string) {
    this.conversationState.expertContext = CATEGORY_EXPERTISE[category] || 'Expert généraliste en rénovation.'
    console.log('🎓 Contexte expert mis à jour:', this.conversationState.expertContext)
  }

  private shouldRequestPhotos(): boolean {
    const category = this.projectState.project_category
    const hasPhotos = this.projectState.photos_uploaded && this.projectState.photos_uploaded.length > 0
    
    // Photos importantes pour certaines catégories
    const photoCriticalCategories = ['Salle de bain', 'Rénovation générale', 'Maçonnerie']
    
    return !hasPhotos && 
           !!category && 
           photoCriticalCategories.includes(category) &&
           !!this.projectState.project_description &&
           !!this.projectState.service_type
  }

  private async generateExpertResponse(prompt: string): Promise<string> {
    if (!process.env.OPENAI_API_KEY) {
      return "En tant qu'expert, continuons avec votre projet de rénovation."
    }

    try {
      const systemPrompt = EXPERT_SYSTEM_PROMPT
        .replace('{project_context}', this.getExpertProjectDescription())
        .replace('{expert_context}', this.conversationState.expertContext)

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
      })

      return response.choices[0]?.message?.content?.trim() || "Continuons avec votre projet !"
    } catch (error) {
      console.error('Erreur génération réponse experte:', error)
      return "En tant qu'expert, analysons votre projet ensemble !"
    }
  }

  private async generateExpertPriceEstimation(): Promise<EstimatedPrice> {
    try {
      // Estimation experte basée sur la catégorie et les détails
      const category = this.projectState.project_category
      const serviceType = this.projectState.service_type?.toLowerCase() || ''
      const roomType = this.projectState.room_type?.toLowerCase() || ''
      const currentState = this.projectState.current_state?.toLowerCase() || ''
      
      const factors: string[] = []
      let basePrice = 300
      let multiplier = 1
      
      // Logique experte par catégorie
      if (category === 'Plomberie') {
        if (serviceType.includes('robinet')) {
          basePrice = 150
          factors.push('Remplacement robinet standard')
          if (roomType.includes('cuisine')) {
            multiplier *= 1.2
            factors.push('Cuisine (accès plus complexe)')
          }
        } else if (serviceType.includes('fuite')) {
          basePrice = 200
          factors.push('Réparation fuite')
          if (currentState.includes('mauvais')) {
            multiplier *= 1.5
            factors.push('État dégradé')
          }
        }
      } else if (category === 'Peinture') {
        const surface = parseInt(this.projectState.surface_area || '20')
        basePrice = surface * 25
        factors.push(`Surface ${surface}m² à peindre`)
        
        if (currentState.includes('mauvais')) {
          multiplier *= 1.4
          factors.push('Préparation importante des surfaces')
        }
      } else if (category === 'Électricité') {
        basePrice = 250
        factors.push('Installation électrique')
        
        if (currentState.includes('ancien') || currentState.includes('mauvais')) {
          multiplier *= 1.6
          factors.push('Mise aux normes nécessaire')
        }
      }
      
      // Facteurs de contraintes d'accès
      const accessConstraints = this.projectState.access_constraints?.toLowerCase() || ''
      if (accessConstraints.includes('étage') && accessConstraints.includes('sans ascenseur')) {
        multiplier *= 1.15
        factors.push('Étage élevé sans ascenseur')
      }
      
      // Facteur urgence
      const urgency = this.projectState.project_urgency?.toLowerCase() || ''
      if (urgency.includes('urgent')) {
        multiplier *= 1.1
        factors.push('Intervention urgente')
      }
      
      const finalPrice = Math.round(basePrice * multiplier)
      
      return {
        min: Math.round(finalPrice * 0.8),
        max: Math.round(finalPrice * 1.3),
        factors
      }
    } catch (error) {
      console.error('Erreur estimation prix experte:', error)
      return {
        min: 200,
        max: 600,
        factors: ['Estimation basique']
      }
    }
  }

  // Analyser les photos avec GPT-4 Vision
  private async analyzePhotosWithVision(photoUrls: string[] | string): Promise<string> {
    // Validation et normalisation du paramètre
    let photosArray: string[] = []
    
    if (Array.isArray(photoUrls)) {
      photosArray = photoUrls
    } else if (typeof photoUrls === 'string' && photoUrls.trim()) {
      // Si c'est une chaîne, on peut essayer de la parser ou l'ignorer
      console.log('⚠️ photoUrls est une chaîne, pas un tableau:', photoUrls)
      return "Aucune photo valide fournie pour l'analyse"
    }
    
    if (!photosArray || photosArray.length === 0) {
      return "Aucune photo fournie pour l'analyse"
    }

    try {
      console.log('🔍 Analyse GPT-4 Vision des photos:', photosArray.length)
      
      const category = this.projectState.project_category || 'rénovation'
      const description = this.projectState.project_description || 'projet'
      
      const visionPrompt = `Vous êtes un expert en ${category}. Analysez ces photos d'un projet de ${description}.

Décrivez ce que vous voyez dans les images en vous concentrant sur :

**État actuel visible :**
   - Décrivez l'état des éléments visibles sur la photo

**Matériaux identifiés :**
   - Quels matériaux pouvez-vous identifier ?

**Complexité estimée des travaux :**
   - Évaluez la difficulté du projet basé sur ce que vous voyez

**Points techniques importants :**
   - Quels aspects techniques faut-il considérer ?

**Recommandations d'expert :**
   - Quels conseils donneriez-vous pour ce type de projet ?

Répondez de manière professionnelle et détaillée, en français, sans utiliser de markdown.`

      // Convertir les images S3 en base64 pour OpenAI Vision
      const imageContents: Array<{ type: string, image_url?: { url: string, detail: string } }> = []
      
      for (const url of photosArray) {
        if (url.includes('renoveo.s3.') || url.includes('.amazonaws.com')) {
          // Importer la fonction S3
          const { getImageAsBase64 } = await import('@/lib/s3')
          const base64Url = await getImageAsBase64(url)
          
          if (base64Url) {
            console.log('✅ Image S3 convertie en base64')
            imageContents.push({
              type: "image_url",
              image_url: { url: base64Url, detail: "high" }
            })
          } else {
            console.warn('⚠️ Impossible de convertir l\'image S3:', url)
          }
        } else {
          // Garder les autres URLs telles quelles
          imageContents.push({
            type: "image_url",
            image_url: { url, detail: "high" }
          })
        }
      }

      console.log('🖼️ Images préparées pour OpenAI Vision:', imageContents.length)

      const messages: any[] = [
        {
          role: "system",
          content: `Vous êtes un expert en ${category} qui analyse des photos de projet pour établir un devis précis.`
        },
        {
          role: "user",
          content: [
            { type: "text", text: visionPrompt },
            ...imageContents
          ]
        }
      ]

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.3,
        max_tokens: 400,
      })

      const analysis = response.choices[0]?.message?.content?.trim() || "Analyse visuelle non disponible"
      console.log('✅ Analyse GPT Vision terminée')
      
      // Sauvegarder l'analyse dans l'état du projet
      this.projectState.visual_analysis = analysis
      
      return analysis
    } catch (error) {
      console.error('❌ Erreur analyse GPT Vision:', error)
      return "Analyse visuelle temporairement indisponible, mais nous procéderons avec les informations techniques collectées."
    }
  }

  private getExpertProjectDescription(): string {
    const filled = Object.entries(this.projectState)
      .filter(([key, value]) => value && key !== 'estimated_price')
      .map(([field, value]) => `${FIELD_METADATA[field]?.displayName || field}: ${value}`)
      .join('\n')
    
    const category = this.projectState.project_category
    const requiredFields = category ? getRequiredFieldsForCategory(category) : ALWAYS_REQUIRED_FIELDS
    const conditionalFields = getConditionalFields(this.projectState)
    
    const missingRequired = requiredFields.filter(f => !this.projectState[f])
    const missingConditional = conditionalFields.filter(f => !this.projectState[f])
    
    const missing = [...missingRequired, ...missingConditional]
      .map(f => FIELD_METADATA[f]?.displayName || f)
      .join(', ')
    
    return `=== ANALYSE EXPERTE ===
Informations collectées :
${filled || 'Aucune'}

Informations manquantes pour devis précis : ${missing || 'Aucune'}
Expertise activée : ${this.conversationState.expertContext}`
  }

  private async saveToProjectState(field: string, value: any) {
    console.log('💾 Sauvegarde experte:', field, '=', value)
    
    // Nettoyage expert selon le type de champ
    let cleanedValue = typeof value === 'string' ? value.trim() : value
    
    // Validation spécifique par type de champ
    const fieldMetadata = FIELD_METADATA[field]
    if (fieldMetadata?.type === 'number') {
      const numValue = parseInt(cleanedValue)
      if (!isNaN(numValue)) {
        cleanedValue = numValue.toString()
      }
    }
    
    this.projectState[field] = cleanedValue
    
    // EXTRACTION INTELLIGENTE : extraire automatiquement d'autres informations
    await this.extractAdditionalInfo(field, value)
    
    console.log('💾 État expert après sauvegarde:', this.projectState)
  }

  // Extraire intelligemment d'autres informations depuis la réponse utilisateur
  private async extractAdditionalInfo(currentField: string, userInput: string) {
    if (typeof userInput !== 'string') return
    
    const input = userInput.toLowerCase()
    
    // Extraction de pièces depuis les descriptions
    if (currentField === 'project_description' || currentField === 'service_type') {
      const rooms = ['cuisine', 'salon', 'chambre', 'salle de bain', 'bureau', 'garage', 'entrée', 'couloir']
      
      for (const room of rooms) {
        if (input.includes(room) && !this.projectState.room_type) {
          this.projectState.room_type = room.charAt(0).toUpperCase() + room.slice(1)
          console.log('🧠 Extraction intelligente - room_type:', this.projectState.room_type)
          break
        }
      }
    }
    
    // Extraction de surface depuis les descriptions
    if ((currentField === 'project_description' || currentField === 'service_type') && !this.projectState.surface_area) {
      const surfaceMatch = input.match(/(\d+)\s*m[²2]|(\d+)\s*mètres?\s*carrés?|(\d+)\s*m\s*carrés?/)
      if (surfaceMatch) {
        const surface = surfaceMatch[1] || surfaceMatch[2] || surfaceMatch[3]
        this.projectState.surface_area = surface
        console.log('🧠 Extraction intelligente - surface_area:', this.projectState.surface_area)
      }
    }
    
    // Extraction d'état depuis les descriptions  
    if ((currentField === 'project_description' || currentField === 'service_type') && !this.projectState.current_state) {
      if (input.includes('vieux') || input.includes('ancien') || input.includes('abîmé') || input.includes('cassé')) {
        this.projectState.current_state = 'Mauvais état'
        console.log('🧠 Extraction intelligente - current_state:', this.projectState.current_state)
      } else if (input.includes('neuf') || input.includes('récent')) {
        this.projectState.current_state = 'Neuf (moins de 5 ans)'
        console.log('🧠 Extraction intelligente - current_state:', this.projectState.current_state)
      }
    }
    
    // Extraction de matériaux/finitions depuis les descriptions
    if ((currentField === 'project_description' || currentField === 'service_type') && !this.projectState.materials_preferences) {
      const materials = ['mat', 'mate', 'satiné', 'satinée', 'brillant', 'brillante', 'lessivable', 'bois', 'pvc', 'carrelage']
      
      for (const material of materials) {
        if (input.includes(material)) {
          this.projectState.materials_preferences = material
          console.log('🧠 Extraction intelligente - materials_preferences:', this.projectState.materials_preferences)
          break
        }
      }
    }
  }

  private async startExpertConversation(): Promise<FormRunnerResult> {
    console.log('🏁 Démarrage de la conversation experte')
    
    // Définir le premier focus
    this.conversationState.currentFocus = 'project_category'
    console.log('🎯 Focus expert défini sur:', this.conversationState.currentFocus)
    
    // Appeler askExpertQuestion pour générer les options automatiquement
    console.log('❓ Première question experte: project_category')
    return await this.askExpertQuestion('project_category')
  }

  private handleError(): FormRunnerResult {
    return {
      output: "Oups, j'ai eu un petit souci technique. Pouvez-vous répéter votre dernière réponse ?",
      isComplete: false,
      currentQuestion: null,
      conversationState: this.conversationState
    }
  }

  // Méthodes utilitaires publiques
  public getProjectState(): ProjectState {
    return this.projectState
  }

  public getConversationState(): ConversationState {
    return this.conversationState
  }

  public reset() {
    this.projectState = {}
    this.conversationState = {
      currentFocus: null,
      lastIntent: null,
      conversationMode: 'guided',
      helpCount: 0,
      lastSuggestions: '',
      isComplete: false,
      expertContext: ''
    }
    this.conversationMemory = []
  }

  public async goToQuestion(questionId: string): Promise<FormRunnerResult> {
    this.conversationState.currentFocus = questionId
    return this.askExpertQuestion(questionId)
  }
} 