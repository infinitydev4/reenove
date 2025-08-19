import { ChatOpenAI } from '@langchain/openai';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';
import { 
  ChatPromptTemplate, 
  HumanMessagePromptTemplate, 
  SystemMessagePromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts';
import { ChainValues } from '@langchain/core/utils/types';
import { getServiceFieldsConfig, getNextRequiredField, FieldConfig, getRequiredFieldsForCategory, CATEGORY_REQUIRED_FIELDS } from '@/lib/config/serviceFieldsConfig';
import { getImageAsBase64 } from '@/lib/s3';

// Configuration OpenAI
const openAIApiKey = process.env.OPENAI_API_KEY || '';

if (!openAIApiKey) {
  console.warn('Missing OPENAI_API_KEY - LangChain will use fallback mode');
}

// Modèle GPT-4 pour la conversation principale
export const llm = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  openAIApiKey,
  maxTokens: 200,
});

// Modèle GPT-3.5 pour l'extraction de données (plus rapide)
export const extractionLLM = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  temperature: 0.3,
  openAIApiKey,
  maxTokens: 300,
});

// Interface pour l'état du projet
export interface ProjectState {
  [key: string]: any;
  project_category?: string;
  service_type?: string;
  project_description?: string;
  project_location?: string;
  photos_uploaded?: string[];
  room_type?: string;
  current_state?: string;
  materials_preferences?: string;
  surface_area?: string;
  project_urgency?: string;
  access_constraints?: string;
  timeline_constraints?: string;
  specific_requirements?: string;
}

// Interface pour le contexte de conversation
export interface ConversationContext {
  currentFocus: string | null;
  lastIntent: string | null;
  conversationMode: 'guided' | 'free' | 'helping';
  helpCount: number;
  lastSuggestions: string;
  isComplete: boolean;
  expertContext: string; // Contexte expert selon la catégorie
}

// Interface pour le prix estimé
export interface EstimatedPrice {
  min: number;
  max: number;
  factors: string[];
}

// Interface pour le résultat du FormRunner
export interface FormRunnerResult {
  output: string;
  isComplete: boolean;
  currentQuestion?: FieldConfig | null;
  conversationState: ConversationContext;
  finalAnswers?: ProjectState;
  estimatedPrice?: EstimatedPrice;
  photos?: string[];
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
}

// Prompt système principal pour l'expert en rénovation
const MASTER_SYSTEM_PROMPT = `Tu es un assistant IA expert en accompagnement de projets de rénovation pour Reenove. Ton rôle est d'aider l'utilisateur à structurer son projet de manière naturelle et conversationnelle.

CONTEXTE PROJET :
{project_context}

MISSION :
- Guide l'utilisateur pour collecter les informations nécessaires à son devis
- Adapte-toi à son niveau, ses besoins, ses doutes
- Détecte quand l'utilisateur a besoin d'aide, d'exemples ou de suggestions
- Pose une seule question à la fois, de manière naturelle

COMPORTEMENT :
- Reste conversationnel et naturel
- Maximum 1-2 phrases par réponse
- Pas de formatage markdown
- Sois encourageant et positif
- Utilise un langage simple et accessible

STYLE :
- Français naturel et professionnel
- Ton chaleureux mais efficace
- Évite le jargon technique
- Sois précis et utile

INTELLIGENCE :
- Analyse l'intention derrière chaque réponse
- Détecte les hésitations, doutes ou besoins d'aide
- Propose spontanément quand tu sens que c'est utile
- Fais des liens entre les différentes informations collectées

IMPORTANT : Ne jamais inventer ou supposer des informations. Toujours se baser sur les réponses de l'utilisateur.`;

// Prompt pour l'analyse d'intention
const INTENT_ANALYSIS_PROMPT = `Analyse cette réponse utilisateur et détermine son intention principale :

Réponse : "{user_input}"
Contexte : {context}
Mémoire récente : {recent_context}

INTENTIONS POSSIBLES :
- complete_answer : Réponse complète et directe à la question
- validates_suggestions : L'utilisateur VALIDE des suggestions précédentes
- need_help : Demande d'aide ou d'exemples  
- uncertainty : Hésitation ou doute
- question_back : Pose une question à l'IA
- clarification : Demande de clarification
- suggestion_request : Demande de suggestions

DÉTECTION INTELLIGENTE DE VALIDATION :
Si l'utilisateur fait référence à des suggestions précédentes avec des phrases comme :
- "Les 3 points sont justes" / "Ces points me vont"
- "Le point 2 est bon" / "L'exemple 1 convient"
- "Ces suggestions sont parfaites" / "C'est exactement ça"
- "Oui ces idées" / "Ces exemples me conviennent"
- Références à des numéros (1, 2, 3, "le premier", "les deux")
→ ALORS c'est "validates_suggestions"

Réponds UNIQUEMENT avec l'intention détectée, en un seul mot.`;

// Prompt pour décider la prochaine action
const NEXT_ACTION_PROMPT = `En tant qu'assistant intelligent, analyse l'état actuel du projet et décide de la meilleure action à prendre.

État du projet :
{project_state}

Dernière interaction :
{last_interaction}

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
- surface_area (Surface à traiter)
- room_type (Type de pièce)
- current_state (État actuel)
- materials_preferences (Préférences matériaux)
- photos_uploaded (Photos du projet)
- access_constraints (Contraintes d'accès)
- timeline_constraints (Contraintes de planning)
- specific_requirements (Exigences spécifiques)

Décide quelle action est la plus appropriée et quel champ cibler (ou null si conversation libre).

IMPORTANT : Utilise UNIQUEMENT les IDs de champs listés ci-dessus dans target_field. Ne les invente pas !

Réponds en JSON avec cette structure exacte :
{
  "action": "une des actions listées ci-dessus",
  "target_field": "le nom du champ ou null",
  "reasoning": "ton explication"
}`;

// Classe principale pour gérer la conversation LangChain
export class LangChainConversationService {
  private llm: ChatOpenAI;
  private extractionLLM: ChatOpenAI;
  public memory: BufferMemory;
  private chain: ConversationChain | null = null;
  private useAI: boolean = false;
  private projectState: ProjectState = {};
  private conversationState: ConversationContext = {
    currentFocus: null,
    lastIntent: null,
    conversationMode: 'guided',
    helpCount: 0,
    lastSuggestions: '',
    isComplete: false,
    expertContext: ''
  };
  private conversationMemory: any[] = [];

  constructor() {
    this.llm = llm;
    this.extractionLLM = extractionLLM;
    this.memory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true,
    });

    // Vérifier la disponibilité de l'API OpenAI
    if (openAIApiKey) {
      try {
        this.useAI = true;
        console.log('✅ LangChain initialisé avec OpenAI');
      } catch (error) {
        // Mode fallback silencieux - l'utilisateur ne voit aucune différence
        this.useAI = false;
      }
    } else {
      // Mode fallback silencieux - l'utilisateur ne voit aucune différence
      this.useAI = false;
    }
  }

  // Initialiser la chaîne de conversation
  async initialize(context: ConversationContext) {
    if (!this.useAI || !this.llm) {
      return;
    }

    try {
      const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(
          this.buildSystemPrompt(context)
        ),
        new MessagesPlaceholder('chat_history'),
        HumanMessagePromptTemplate.fromTemplate('{input}')
      ]);

      this.chain = new ConversationChain({
        llm: this.llm,
        memory: this.memory,
        prompt: prompt,
      });

      console.log('✅ Chaîne LangChain initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation LangChain:', error);
      this.useAI = false;
    }
  }

  // Construire le prompt système dynamique
  private buildSystemPrompt(context: ConversationContext): string {
    const projectContext = this.getProjectDescription();
    
    let systemPrompt = MASTER_SYSTEM_PROMPT.replace('{project_context}', projectContext);
    
    // Ajouter le contexte expert selon la catégorie
    if (context.expertContext) {
      systemPrompt += `\n\nCONTEXTE EXPERT :\n${context.expertContext}`;
    }

    // Ajouter les informations sur le champ actuel
    if (context.currentFocus) {
      const currentField = getServiceFieldsConfig('default').find(f => f.id === context.currentFocus);
      if (currentField) {
        systemPrompt += `\n\nQUESTION ACTUELLE À POSER : "${currentField.question}"\nType de réponse attendu : ${currentField.type}`;
      }
    }

    // Instructions spéciales selon le mode
    if (context.conversationMode === 'helping') {
      systemPrompt += `\n\nMODE AIDE : L'utilisateur a besoin d'aide. Propose des exemples concrets et des suggestions.`;
    }

    systemPrompt += `\n\nInstructions :
- Phrases très courtes (1-2 max)
- Professionnel mais chaleureux
- Exemples brefs si nécessaire
- Confirme rapidement avant de continuer

IMPORTANT : Base-toi uniquement sur les réponses utilisateur.`;

    return systemPrompt;
  }

  // Traiter l'input utilisateur avec LangChain
  async processUserInput(input: string, context: ConversationContext): Promise<FormRunnerResult> {
    console.log('🎯 === DÉBUT PROCESS INPUT LANGCHAIN ===');
    console.log('📥 Input utilisateur:', input);
    console.log('🗂️ État projet actuel:', this.projectState);
    console.log('💭 Contexte conversation:', context);

    if (!this.useAI) {
      return this.processWithoutAI(input, context);
    }

    try {
      // Initialiser la chaîne si nécessaire
      if (!this.chain) {
        await this.initialize(context);
      }

      // Analyser l'intention de l'utilisateur
      const intent = await this.analyzeIntent(input, context);
      console.log('🎭 Intention détectée:', intent);

      // Sauvegarder la réponse si pertinente
      if ((intent === 'complete_answer' || intent === 'validates_suggestions') && context.currentFocus) {
        console.log('💾 Sauvegarde réponse pour:', context.currentFocus);
        
        let valueToSave = input;
        if (intent === 'validates_suggestions') {
          valueToSave = await this.extractValidatedSuggestions(input, context);
        }
        
        await this.saveToProjectState(context.currentFocus, valueToSave);
        console.log('✅ État projet après sauvegarde:', this.projectState);
      }

      // Décider de la prochaine action
      const nextAction = await this.decideNextAction(input, intent, context);
      console.log('⚡ Action décidée:', nextAction);

      // Exécuter l'action
      const result = await this.executeAction(nextAction, input, context);
      console.log('✨ Résultat final:', result);
      console.log('🎯 === FIN PROCESS INPUT LANGCHAIN ===');

      return result;

    } catch (error) {
      console.error('❌ Erreur LangChain processUserInput:', error);
      return this.handleError();
    }
  }

  // Mode sans IA (fallback silencieux)
  private async processWithoutAI(input: string, context: ConversationContext): Promise<FormRunnerResult> {
    console.log('⚡ Mode sans IA - traitement basique');

    // Sauvegarder la réponse si on a un focus
    if (context.currentFocus && input.trim()) {
      await this.saveToProjectState(context.currentFocus, input);
    }

    // Passer à la question suivante
    const nextField = this.getNextLogicalField();
    
    if (nextField) {
      return {
        output: this.generateSimpleQuestion(nextField),
        isComplete: false,
        currentQuestion: nextField,
        conversationState: {
          ...context,
          currentFocus: nextField.id
        }
      };
    } else {
      // Génération du résumé
      return this.generateProjectSummary();
    }
  }

  // Analyser l'intention utilisateur
  private async analyzeIntent(input: string, context: ConversationContext): Promise<string> {
    if (!input) {
      return 'complete_answer';
    }

    // NOUVEAU: Vérification déterministe AVANT l'IA
    // Si l'input correspond exactement aux options communes, c'est forcément "complete_answer"
    if (context.currentFocus) {
      const inputLower = input.trim().toLowerCase();
      
      // Options communes pour les champs les plus fréquents
      const commonOptions = {
        project_category: ['plomberie', 'électricité', 'menuiserie', 'peinture', 'maçonnerie', 'salle de bain', 'portes et fenêtres', 'jardinage', 'rénovation générale', 'Rénovation générale'],
        current_state: ['bon état', 'état moyen', 'mauvais état', 'endommagé', 'problèmes d\'humidité'],
        materials_preferences: ['aucune préférence', 'standard', 'haute qualité', 'économique', 'finition mate', 'finition satinée'],
        project_urgency: ['urgent', 'dans les 15 jours', 'dans les 30 jours', 'quand vous voulez'],
        surface_area: []
      };
      
      const fieldOptions = commonOptions[context.currentFocus as keyof typeof commonOptions];
      if (fieldOptions && fieldOptions.some(option => 
        option.toLowerCase() === inputLower || 
        inputLower.includes(option.toLowerCase()) ||
        option.toLowerCase().includes(inputLower)
      )) {
        console.log('✅ Réponse exacte détectée pour', context.currentFocus, ':', input);
        this.conversationState.lastIntent = 'complete_answer';
        return 'complete_answer';
      }
    }

    // Fallback vers l'analyse IA seulement si pas de correspondance exacte
    if (!this.useAI) {
      return 'complete_answer';
    }

    try {
      const contextData = {
        currentFocus: context.currentFocus,
        lastField: context.currentFocus
      };
      
      const prompt = ChatPromptTemplate.fromTemplate(INTENT_ANALYSIS_PROMPT);
      const chain = prompt.pipe(this.llm);
      
      const result = await chain.invoke({
        user_input: input,
        context: JSON.stringify(contextData),
        recent_context: context.lastSuggestions || 'Aucune suggestion récente'
      });

      const intent = typeof result.content === 'string' ? result.content.trim().toLowerCase() : 'complete_answer';
      this.conversationState.lastIntent = intent;
      
      console.log('🎭 Intention détectée par IA:', intent, 'pour input:', input);
      return intent;
    } catch (error) {
      console.error('❌ Erreur analyse intention:', error);
      return 'complete_answer';
    }
  }

  // Décider de la prochaine action
  private async decideNextAction(userInput: string, intent: string, context: ConversationContext): Promise<any> {
    const missingRequired = this.getMissingRequiredFields();
    const missingConditional = this.getMissingConditionalFields();

    // Protection anti-répétition améliorée
    if (context.currentFocus && this.projectState[context.currentFocus]) {
      const currentValue = this.projectState[context.currentFocus];
      const isFieldComplete = this.isFieldSufficientlyAnswered(context.currentFocus, currentValue);
      
      console.log('🚫 Focus sur champ déjà rempli:', context.currentFocus, 'Valeur:', currentValue, 'Complet:', isFieldComplete);
      
      if (isFieldComplete) {
        // Séparer project_location des autres champs requis
        const missingRequiredExceptLocation = missingRequired.filter(field => field !== 'project_location');
        const isLocationMissing = missingRequired.includes('project_location');
        
        if (missingRequiredExceptLocation.length > 0) {
          console.log('➡️ ORDRE IMPOSÉ - prochain champ requis:', missingRequiredExceptLocation[0]);
          return {
            action: 'ask_next',
            target_field: missingRequiredExceptLocation[0],
            reasoning: 'Suivre l\'ordre strict des champs requis'
          };
        } else if (missingConditional.length > 0) {
          return {
            action: 'ask_next',
            target_field: missingConditional[0],
            reasoning: 'Focus sur prochain champ conditionnel'
          };
        } else {
          // Vérifier les champs optionnels (comme les photos) avant l'adresse
          const category = this.projectState.project_category || 'default';
          const completeOrder = this.getCompleteFieldsOrder(category);
          const missingOptional = completeOrder.filter(fieldId => 
            !this.projectState[fieldId] && 
            fieldId === 'photos_uploaded' // Pour l'instant, seules les photos sont optionnelles
          );
          
          if (missingOptional.length > 0) {
            console.log('📸 Champ optionnel manquant détecté:', missingOptional[0]);
            return {
              action: 'ask_next',
              target_field: missingOptional[0],
              reasoning: 'Question optionnelle (photos) à poser'
            };
          }
          
          // Maintenant, vérifier project_location en dernier
          if (isLocationMissing) {
            console.log('📍 Localisation manquante - demander en dernier:', 'project_location');
            return {
              action: 'ask_next',
              target_field: 'project_location',
              reasoning: 'Localisation demandée après les photos'
            };
          }
          
          return {
            action: 'validate',
            target_field: null,
            reasoning: 'Toutes les informations collectées'
          };
        }
      }
    }

    // LOGIQUE DÉTERMINISTE : Toujours suivre l'ordre défini des champs
    // Séparer project_location des autres champs requis pour le traiter après les photos
    const missingRequiredExceptLocation = missingRequired.filter(field => field !== 'project_location');
    const isLocationMissing = missingRequired.includes('project_location');
    
    if (missingRequiredExceptLocation.length > 0) {
      console.log('➡️ ORDRE IMPOSÉ - prochain champ requis dans l\'ordre:', missingRequiredExceptLocation[0]);
      return {
        action: 'ask_next',
        target_field: missingRequiredExceptLocation[0],
        reasoning: 'Suivre l\'ordre strict des champs requis'
      };
    }

    if (missingConditional.length > 0) {
      return {
        action: 'ask_next',
        target_field: missingConditional[0],
        reasoning: 'Compléter les champs conditionnels'
      };
    }

    // Vérifier les champs optionnels (comme les photos) avant l'adresse
    const category = this.projectState.project_category || 'default';
    const completeOrder = this.getCompleteFieldsOrder(category);
    const missingOptional = completeOrder.filter(fieldId => 
      !this.projectState[fieldId] && 
      fieldId === 'photos_uploaded' // Pour l'instant, seules les photos sont optionnelles
    );
    
    if (missingOptional.length > 0) {
      console.log('📸 Champ optionnel manquant détecté (logique générale):', missingOptional[0]);
      return {
        action: 'ask_next',
        target_field: missingOptional[0],
        reasoning: 'Question optionnelle (photos) à poser'
      };
    }
    
    // Maintenant, vérifier project_location en dernier
    if (isLocationMissing) {
      console.log('📍 Localisation manquante - demander en dernier:', 'project_location');
      return {
        action: 'ask_next',
        target_field: 'project_location',
        reasoning: 'Localisation demandée après les photos'
      };
    }

    // Si tous les champs essentiels sont complétés
    return {
      action: 'validate',
      target_field: null,
      reasoning: 'Toutes les informations techniques nécessaires collectées'
    };
  }

  // Exécuter l'action décidée
  private async executeAction(action: any, userInput: string, context: ConversationContext): Promise<FormRunnerResult> {
    const { action: actionType, target_field } = action;
    
    console.log('🎬 Exécution action:', actionType, 'pour le champ:', target_field);
    
    // Mettre à jour le focus
    if (target_field) {
      this.conversationState.currentFocus = target_field;
    }

    switch (actionType) {
      case 'ask_next':
        return this.askNextQuestion(target_field);
        
      case 'clarify':
        return this.clarifyField(target_field, userInput);
        
      case 'suggest':
        return this.provideSuggestions(target_field);
        
      case 'validate':
        return this.validateAndGenerateQuote();
        
      case 'free_talk':
        return this.engageFreeConversation(userInput);
        
      default:
        return this.askNextLogicalQuestion();
    }
  }

  // Poser la prochaine question
  private async askNextQuestion(fieldName: string): Promise<FormRunnerResult> {
    console.log('📝 askNextQuestion appelé pour:', fieldName);
    
    const fieldConfig = getServiceFieldsConfig('default').find(f => f.id === fieldName);
    if (!fieldConfig) {
      console.error('❌ Aucune configuration trouvée pour le champ:', fieldName);
      return this.askNextLogicalQuestion();
    }

    const category = this.projectState.project_category || '';
    const serviceType = this.projectState.service_type || '';
    
    if (!this.useAI) {
      // Options spéciales pour les photos
      let options = fieldConfig.options || this.generateFieldSuggestions(fieldName, category, serviceType);
      
      if (fieldName === 'photos_uploaded') {
        options = [
          { id: 'skip_photos', label: '🚫 Je n\'ai pas d\'image', value: 'Je n\'ai pas d\'image pour le moment' }
        ];
      }
      
      // Pour room_type, toujours utiliser les suggestions dynamiques contextuelles
      if (fieldName === 'room_type') {
        options = this.generateFieldSuggestions(fieldName, category, serviceType);
      }
      
      const output = fieldConfig.question || `Pouvez-vous me parler de ${fieldConfig.displayName} ?`;
      const finalOutput = options.length > 0 
        ? `${output}\n\n💡 Cliquez sur une option ou précisez autre chose :`
        : output;
        
      return {
        output: finalOutput,
        isComplete: false,
        currentQuestion: fieldConfig,
        conversationState: this.conversationState,
        options: options
      };
    }

    try {
      
      // Prompts intelligents selon le champ et le contexte
      let contextualPrompt = '';
      
      switch (fieldName) {
        case 'service_type':
          contextualPrompt = `L'utilisateur a choisi la catégorie "${category}". 
          Demande-lui précisément quel type de travaux ${category.toLowerCase()} il souhaite réaliser.
          Donne 2-3 exemples concrets pour ${category} pour l'aider.
          Exemple pour Électricité: "installation de prises", "mise aux normes du tableau", "ajout de luminaires"`;
          break;
          
        case 'project_description':
          contextualPrompt = `L'utilisateur veut faire "${serviceType}" en ${category}.
          Demande-lui de décrire son projet en détail avec des exemples encourageants.
          Suggère des éléments à préciser selon le contexte.`;
          break;
          
        case 'room_type':
          contextualPrompt = `Pour un projet de ${category} (${serviceType}), 
          demande précisément dans quel type de pièce les travaux auront lieu.
          Sois très clair : il s'agit de savoir si c'est un salon, une cuisine, une chambre, un garage, etc.
          Donne des exemples concrets : "salon", "cuisine", "chambre", "salle de bain", "garage", "bureau"`;
          break;
          
         case 'current_state':
          contextualPrompt = this.getContextualCurrentStatePrompt(category, serviceType);
          break;
          
        case 'project_urgency':
          if (category === 'Plomberie' || category === 'Électricité') {
            contextualPrompt = `Pour ${category}, l'urgence est importante pour la sécurité.
            Demande le niveau d'urgence avec des exemples: "fuite d'eau urgente", "panne électrique", "travaux planifiés"`;
          } else {
            contextualPrompt = `Demande quand il souhaite réaliser ses travaux de ${category}.
            Propose des délais: "dans la semaine", "dans le mois", "quand c'est possible"`;
          }
          break;
          
        case 'materials_preferences':
          contextualPrompt = `Pour ${category}, demande ses préférences matériaux avec des exemples pertinents.
          Pour Menuiserie: "bois massif", "aggloméré", "MDF"
          Pour Peinture: "peinture écologique", "lessivable", "mat ou satiné"`;
          break;
          
        case 'project_location':
          contextualPrompt = `Demande la localisation pour ${serviceType}.
          Explique brièvement pourquoi c'est important (prix, disponibilité artisans).
          Exemple: "Paris", "Marseille", "Lyon" ou code postal`;
          break;
          
        case 'photos_uploaded':
          contextualPrompt = `Pour ${category} (${serviceType}), demande des photos pour un devis précis.
          Suggère quoi photographier selon le domaine:
          Pour Électricité: "tableau actuel", "prises concernées", "vue d'ensemble"
          Pour Plomberie: "robinet/fuite", "canalisation", "pièce complète"
          Mentionne que c'est optionnel et qu'ils peuvent continuer sans photos si nécessaire.`;
          break;
          
        default:
          contextualPrompt = `Demande des informations sur ${fieldConfig.displayName} pour le projet ${category}.`;
      }

      const prompt = `${contextualPrompt}

Contexte du projet jusqu'ici : 
${this.getProjectDescription()}

MISSION : Pose une question naturelle, encourageante avec des exemples concrets pour guider l'utilisateur.

RÈGLES :
- Maximum 1-2 phrases courtes
- Toujours donner des exemples pertinents
- Ton professionnel mais chaleureux  
- Adapté au contexte ${category}
- Pas de formatage markdown

Génère UNIQUEMENT la question avec exemples.`;

      const result = await this.generateAIResponse(prompt);
      
      // Utiliser les options de la configuration si disponibles, sinon générer des suggestions
      let options = fieldConfig.options || this.generateFieldSuggestions(fieldName, category, serviceType);
      
      // Pour room_type, toujours utiliser les suggestions dynamiques contextuelles
      if (fieldName === 'room_type') {
        options = this.generateFieldSuggestions(fieldName, category, serviceType);
      }
      
      // Ajouter l'instruction pour les options
      const finalOutput = options.length > 0 
        ? `${result}\n\n💡 Cliquez sur une option ou précisez autre chose :`
        : result;

      return {
        output: finalOutput,
        isComplete: false,
        currentQuestion: fieldConfig,
        conversationState: this.conversationState,
        options: options // Ajouter les options au résultat
      };
    } catch (error) {
      console.error('❌ Erreur askNextQuestion:', error);
      // Fallback - utiliser les options de la configuration si disponibles, sinon générer des suggestions
      let options = fieldConfig.options || this.generateFieldSuggestions(fieldName, category, serviceType);
      
      // Pour room_type, toujours utiliser les suggestions dynamiques contextuelles
      if (fieldName === 'room_type') {
        options = this.generateFieldSuggestions(fieldName, category, serviceType);
      }
      const output = fieldConfig.question || `Pouvez-vous me parler de ${fieldConfig.displayName} ?`;
      const finalOutput = options.length > 0 
        ? `${output}\n\n💡 Cliquez sur une option ou précisez autre chose :`
        : output;
        
      return {
        output: finalOutput,
        isComplete: false,
        currentQuestion: fieldConfig,
        conversationState: this.conversationState,
        options: options
      };
    }
  }

  // Générer des suggestions d'options pour un champ
  private generateFieldSuggestions(fieldName: string, category: string, serviceType: string): Array<{ id: string; label: string; value: string }> {
    // Nettoyer la catégorie des guillemets superflus
    const cleanCategory = category.replace(/^["']|["']$/g, '');
    const cleanServiceType = serviceType.replace(/^["']|["']$/g, '');
    
    console.log('🔍 generateFieldSuggestions - Catégorie nettoyée:', cleanCategory, 'ServiceType:', cleanServiceType);
    
    const suggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      project_category: [
        { id: 'plumbing', label: '🔧 Plomberie', value: 'Plomberie' },
        { id: 'electricity', label: '⚡ Électricité', value: 'Électricité' },
        { id: 'carpentry', label: '🪵 Menuiserie', value: 'Menuiserie' },
        { id: 'painting', label: '🎨 Peinture', value: 'Peinture' },
        { id: 'masonry', label: '🧱 Maçonnerie', value: 'Maçonnerie' },
        { id: 'bathroom', label: '🚿 Salle de bain', value: 'Salle de bain' },
        { id: 'doors_windows', label: '🚪 Portes et fenêtres', value: 'Portes et fenêtres' },
        { id: 'gardening', label: '🌱 Jardinage', value: 'Jardinage' },
        { id: 'general', label: '🏠 Rénovation générale', value: 'Rénovation générale' }
      ],
      service_type: this.getServiceTypeSuggestions(cleanCategory),
      project_description: this.getProjectDescriptionSuggestions(cleanCategory, cleanServiceType),
      room_type: this.getRoomTypeSuggestions(cleanCategory),
      surface_area: [],
      current_state: this.getCurrentStateSuggestions(cleanCategory),
      materials_preferences: this.getMaterialsSuggestions(cleanCategory),
      project_urgency: [
        { id: 'urgent', label: '🚨 Urgent (dans la semaine)', value: 'urgent' },
        { id: 'soon', label: '⏰ Rapidement (dans le mois)', value: 'dans le mois' },
        { id: 'flexible', label: '📅 Quand c\'est possible', value: 'flexible' }
      ]
    };

    return suggestions[fieldName] || [];
  }

  // Suggestions spécifiques pour le type de service selon la catégorie
  private getServiceTypeSuggestions(category: string): Array<{ id: string; label: string; value: string }> {
    const serviceSuggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      'Électricité': [
        { id: 'tableau', label: '⚡ Changer le tableau électrique', value: 'changer le tableau électrique' },
        { id: 'prises', label: '🔌 Installer des prises', value: 'installer des prises' },
        { id: 'luminaires', label: '💡 Ajouter des luminaires', value: 'ajouter des luminaires' },
        { id: 'mise_aux_normes', label: '🛡️ Mise aux normes', value: 'mise aux normes électrique' }
      ],
      // Version sans accent pour compatibilité
      'Electricite': [
        { id: 'tableau', label: '⚡ Changer le tableau électrique', value: 'changer le tableau électrique' },
        { id: 'prises', label: '🔌 Installer des prises', value: 'installer des prises' },
        { id: 'luminaires', label: '💡 Ajouter des luminaires', value: 'ajouter des luminaires' },
        { id: 'mise_aux_normes', label: '🛡️ Mise aux normes', value: 'mise aux normes électrique' }
      ],
      'Plomberie': [
        { id: 'robinet', label: '🚰 Réparer/changer un robinet', value: 'réparer un robinet' },
        { id: 'fuite', label: '💧 Réparer une fuite', value: 'réparer une fuite' },
        { id: 'canalisation', label: '🔧 Refaire les canalisations', value: 'refaire les canalisations' },
        { id: 'chauffe_eau', label: '🔥 Installer un chauffe-eau', value: 'installer un chauffe-eau' }
      ],
      'Peinture': [
        { id: 'repeindre', label: '🎨 Repeindre les murs', value: 'repeindre les murs' },
        { id: 'plafond', label: '🏠 Peindre le plafond', value: 'peindre le plafond' },
        { id: 'boiseries', label: '🪵 Peindre les boiseries', value: 'peindre les boiseries' },
        { id: 'renovation', label: '✨ Rénovation complète', value: 'rénovation peinture complète' }
      ],
      'Menuiserie': [
        { id: 'placard', label: '🗄️ Installer un placard', value: 'installer un placard' },
        { id: 'parquet', label: '🪵 Poser du parquet', value: 'poser du parquet' },
        { id: 'etageres', label: '📚 Créer des étagères', value: 'créer des étagères' },
        { id: 'escalier', label: '🪜 Réparer un escalier', value: 'réparer un escalier' }
      ],
      'Maçonnerie': [
        { id: 'mur', label: '🧱 Construire un mur', value: 'construire un mur' },
        { id: 'cloison', label: '🚧 Monter une cloison', value: 'monter une cloison' },
        { id: 'dalle', label: '🏗️ Couler une dalle', value: 'couler une dalle béton' },
        { id: 'facade', label: '🏠 Rénover la façade', value: 'rénover la façade' }
      ],
      // Version sans accent pour compatibilité
      'Maconnerie': [
        { id: 'mur', label: '🧱 Construire un mur', value: 'construire un mur' },
        { id: 'cloison', label: '🚧 Monter une cloison', value: 'monter une cloison' },
        { id: 'dalle', label: '🏗️ Couler une dalle', value: 'couler une dalle béton' },
        { id: 'facade', label: '🏠 Rénover la façade', value: 'rénover la façade' }
      ],
      'Salle de bain': [
        { id: 'renovation_complete', label: '🛁 Rénovation complète', value: 'rénovation complète salle de bain' },
        { id: 'douche', label: '🚿 Installer une douche', value: 'installer une douche' },
        { id: 'baignoire', label: '🛀 Changer la baignoire', value: 'changer la baignoire' },
        { id: 'carrelage', label: '🟫 Refaire le carrelage', value: 'refaire le carrelage' }
      ],
      'Portes et fenêtres': [
        { id: 'porte', label: '🚪 Installer une porte', value: 'installer une porte' },
        { id: 'fenetre', label: '🪟 Changer les fenêtres', value: 'changer les fenêtres' },
        { id: 'volets', label: '🪟 Poser des volets', value: 'poser des volets' },
        { id: 'porte_fenetre', label: '🚪 Porte-fenêtre', value: 'installer porte-fenêtre' }
      ],
      // Version sans accents pour compatibilité
      'Portes et fenetres': [
        { id: 'porte', label: '🚪 Installer une porte', value: 'installer une porte' },
        { id: 'fenetre', label: '🪟 Changer les fenêtres', value: 'changer les fenêtres' },
        { id: 'volets', label: '🪟 Poser des volets', value: 'poser des volets' },
        { id: 'porte_fenetre', label: '🚪 Porte-fenêtre', value: 'installer porte-fenêtre' }
      ],
      'Jardinage': [
        { id: 'amenagement', label: '🌿 Aménagement paysager', value: 'aménagement paysager' },
        { id: 'pelouse', label: '🌱 Créer une pelouse', value: 'créer une pelouse' },
        { id: 'plantation', label: '🌳 Plantation d\'arbres', value: 'plantation d\'arbres' },
        { id: 'terrasse', label: '🪵 Terrasse en bois', value: 'construire terrasse bois' }
      ],
      // Version minuscule pour compatibilité
      'jardinage': [
        { id: 'amenagement', label: '🌿 Aménagement paysager', value: 'aménagement paysager' },
        { id: 'pelouse', label: '🌱 Créer une pelouse', value: 'créer une pelouse' },
        { id: 'plantation', label: '🌳 Plantation d\'arbres', value: 'plantation d\'arbres' },
        { id: 'terrasse', label: '🪵 Terrasse en bois', value: 'construire terrasse bois' }
      ],
      'Rénovation générale': [
        { id: 'renovation_complete', label: '🏠 Rénovation complète', value: 'rénovation complète' },
        { id: 'agrandissement', label: '📐 Agrandissement', value: 'agrandissement maison' },
        { id: 'isolation', label: '🧱 Isolation thermique', value: 'isolation thermique' },
        { id: 'combles', label: '🏠 Aménagement combles', value: 'aménagement combles' }
      ],
      // Version sans accents pour compatibilité
      'Renovation generale': [
        { id: 'renovation_complete', label: '🏠 Rénovation complète', value: 'rénovation complète' },
        { id: 'agrandissement', label: '📐 Agrandissement', value: 'agrandissement maison' },
        { id: 'isolation', label: '🧱 Isolation thermique', value: 'isolation thermique' },
        { id: 'combles', label: '🏠 Aménagement combles', value: 'aménagement combles' }
      ]
      // 'Autre': [
      //   { id: 'autre_service', label: '🔧 Autre service', value: 'autre type de travaux' },
      //   { id: 'conseil', label: '💡 Demande de conseil', value: 'demande de conseil' },
      //   { id: 'devis', label: '📋 Devis personnalisé', value: 'devis personnalisé' },
      //   { id: 'expertise', label: '🔍 Expertise technique', value: 'expertise technique' }
      // ]
    };

    console.log('🔍 getServiceTypeSuggestions - Recherche pour catégorie:', category);
    const suggestions = serviceSuggestions[category];
    console.log('📋 Suggestions trouvées:', suggestions ? suggestions.length : 0);
    
    return suggestions || [];
  }

  // Suggestions pour les types de pièces selon la catégorie
  private getRoomTypeSuggestions(category: string): Array<{ id: string; label: string; value: string }> {
    const roomSuggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      'Plomberie': [
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'wc', label: '🚽 WC', value: 'WC' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' },
        { id: 'exterieur', label: '🌿 Extérieur/Jardin', value: 'extérieur' }
      ],
      'plomberie': [
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'wc', label: '🚽 WC', value: 'WC' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' },
        { id: 'exterieur', label: '🌿 Extérieur/Jardin', value: 'extérieur' }
      ],
      'Électricité': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
      ],
      'Electricite': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
      ],
      'Peinture': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'wc', label: '🚽 WC', value: 'WC' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
      ],
      'Menuiserie': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
      ],
      'Maçonnerie': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' },
        { id: 'exterieur', label: '🌿 Extérieur/Jardin', value: 'extérieur' }
      ],
      'Salle de bain': [
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'wc', label: '🚽 WC', value: 'WC' },
        { id: 'salle_d_eau', label: '🚿 Salle d\'eau', value: 'salle d\'eau' }
      ],
      'Portes et fenêtres': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'entree', label: '🚪 Entrée', value: 'entrée' }
      ],
      'Jardinage': [
        { id: 'jardin', label: '🌿 Jardin', value: 'jardin' },
        { id: 'terrasse', label: '🪵 Terrasse', value: 'terrasse' },
        { id: 'balcon', label: '🏢 Balcon', value: 'balcon' },
        { id: 'cour', label: '🏠 Cour', value: 'cour' },
        { id: 'exterieur', label: '🌿 Extérieur', value: 'extérieur' }
      ],
      'Rénovation générale': [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'wc', label: '🚽 WC', value: 'WC' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
      ]
    };

    console.log('🏠 getRoomTypeSuggestions - Recherche pour catégorie:', category);
    const suggestions = roomSuggestions[category];
    console.log('🏠 Suggestions pièces trouvées:', suggestions ? suggestions.length : 0);
    
    // Fallback vers toutes les pièces si catégorie non trouvée
    return suggestions || [
      { id: 'salon', label: '🛋️ Salon', value: 'salon' },
      { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
      { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
      { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
      { id: 'garage', label: '🚗 Garage', value: 'garage' },
      { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
      { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
      { id: 'wc', label: '🚽 WC', value: 'WC' },
      { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
    ];
  }

  // Suggestions pour l'état actuel selon la catégorie
  private getCurrentStateSuggestions(category: string): Array<{ id: string; label: string; value: string }> {
    const stateSuggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      'Électricité': [
        { id: 'vetuste', label: '⚠️ Vétuste mais fonctionne', value: 'vétuste mais fonctionne' },
        { id: 'disjoncte', label: '⚡ Disjoncte souvent', value: 'disjoncte souvent' },
        { id: 'norme', label: '✅ Aux normes', value: 'aux normes' },
        { id: 'panne', label: '❌ En panne', value: 'en panne' }
      ],
      // Version sans accent pour compatibilité
      'Electricite': [
        { id: 'vetuste', label: '⚠️ Vétuste mais fonctionne', value: 'vétuste mais fonctionne' },
        { id: 'disjoncte', label: '⚡ Disjoncte souvent', value: 'disjoncte souvent' },
        { id: 'norme', label: '✅ Aux normes', value: 'aux normes' },
        { id: 'panne', label: '❌ En panne', value: 'en panne' }
      ],
      'Plomberie': [
        { id: 'fuit', label: '💧 Fuit légèrement', value: 'fuit légèrement' },
        { id: 'casse', label: '❌ Complètement cassé', value: 'complètement cassé' },
        { id: 'fonctionne', label: '✅ Fonctionne bien', value: 'fonctionne bien' },
        { id: 'bouche', label: '🚫 Bouché', value: 'bouché' }
      ],
      'Peinture': [
        { id: 'ecaille', label: '🎨 Peinture écaillée', value: 'peinture écaillée' },
        { id: 'fissures', label: '🔍 Murs avec fissures', value: 'murs avec fissures' },
        { id: 'bon_etat', label: '✅ En bon état', value: 'en bon état' },
        { id: 'humidite', label: '💧 Problèmes d\'humidité', value: 'problèmes d\'humidité' }
      ],
      'Menuiserie': [
        { id: 'bon_etat', label: '✅ En bon état', value: 'en bon état' },
        { id: 'abime', label: '⚠️ Abîmé', value: 'abîmé' },
        { id: 'pourri', label: '❌ Bois pourri', value: 'bois pourri' },
        { id: 'a_renover', label: '🔨 À rénover', value: 'à rénover' }
      ],
      'Maçonnerie': [
        { id: 'fissures', label: '🔍 Fissures visibles', value: 'fissures visibles' },
        { id: 'bon_etat', label: '✅ Structure saine', value: 'structure saine' },
        { id: 'humidite', label: '💧 Problèmes d\'humidité', value: 'problèmes d\'humidité' },
        { id: 'renovation', label: '🔨 À rénover', value: 'à rénover complètement' }
      ],
      // Version sans accent pour compatibilité
      'Maconnerie': [
        { id: 'fissures', label: '🔍 Fissures visibles', value: 'fissures visibles' },
        { id: 'bon_etat', label: '✅ Structure saine', value: 'structure saine' },
        { id: 'humidite', label: '💧 Problèmes d\'humidité', value: 'problèmes d\'humidité' },
        { id: 'renovation', label: '🔨 À rénover', value: 'à rénover complètement' }
      ],
      'Salle de bain': [
        { id: 'vieillot', label: '⚠️ Vieillotte mais fonctionnelle', value: 'vieillotte mais fonctionnelle' },
        { id: 'humidite', label: '💧 Problèmes d\'humidité', value: 'problèmes d\'humidité' },
        { id: 'carrelage_abime', label: '🟫 Carrelage abîmé', value: 'carrelage abîmé' },
        { id: 'renovation', label: '🔨 À rénover', value: 'à rénover complètement' }
      ],
      'Portes et fenêtres': [
        { id: 'bon_etat', label: '✅ En bon état', value: 'en bon état' },
        { id: 'isolation', label: '❄️ Mauvaise isolation', value: 'mauvaise isolation' },
        { id: 'abime', label: '⚠️ Abîmées', value: 'abîmées' },
        { id: 'changer', label: '🔄 À changer', value: 'à changer' }
      ],
      // Version sans accents pour compatibilité
      'Portes et fenetres': [
        { id: 'bon_etat', label: '✅ En bon état', value: 'en bon état' },
        { id: 'isolation', label: '❄️ Mauvaise isolation', value: 'mauvaise isolation' },
        { id: 'abime', label: '⚠️ Abîmées', value: 'abîmées' },
        { id: 'changer', label: '🔄 À changer', value: 'à changer' }
      ],
      'Jardinage': [
        { id: 'entretenu', label: '✅ Bien entretenu', value: 'bien entretenu' },
        { id: 'a_amenager', label: '🌱 À aménager', value: 'à aménager' },
        { id: 'friche', label: '🌿 En friche', value: 'en friche' },
        { id: 'vierge', label: '🟫 Terrain vierge', value: 'terrain vierge' }
      ],
      // Version minuscule pour compatibilité
      'jardinage': [
        { id: 'entretenu', label: '✅ Bien entretenu', value: 'bien entretenu' },
        { id: 'a_amenager', label: '🌱 À aménager', value: 'à aménager' },
        { id: 'friche', label: '🌿 En friche', value: 'en friche' },
        { id: 'vierge', label: '🟫 Terrain vierge', value: 'terrain vierge' }
      ],
      'Rénovation générale': [
        { id: 'habitable', label: '✅ Habitable', value: 'habitable' },
        { id: 'renovation_legere', label: '🔧 Rénovation légère', value: 'rénovation légère nécessaire' },
        { id: 'gros_travaux', label: '🏗️ Gros travaux', value: 'gros travaux nécessaires' },
        { id: 'a_refaire', label: '🔨 Tout à refaire', value: 'tout à refaire' }
      ],
      // Version sans accents pour compatibilité
      'Renovation generale': [
        { id: 'habitable', label: '✅ Habitable', value: 'habitable' },
        { id: 'renovation_legere', label: '🔧 Rénovation légère', value: 'rénovation légère nécessaire' },
        { id: 'gros_travaux', label: '🏗️ Gros travaux', value: 'gros travaux nécessaires' },
        { id: 'a_refaire', label: '🔨 Tout à refaire', value: 'tout à refaire' }
      ],
      // 'Autre': [
      //   { id: 'bon_etat', label: '✅ En bon état', value: 'en bon état' },
      //   { id: 'moyen', label: '⚠️ État moyen', value: 'état moyen' },
      //   { id: 'mauvais', label: '❌ Mauvais état', value: 'mauvais état' },
      //   { id: 'expertise', label: '🔍 Besoin d\'expertise', value: 'besoin d\'expertise' }
      // ]
    };

    console.log('🔍 getCurrentStateSuggestions - Recherche pour catégorie:', category);
    const suggestions = stateSuggestions[category];
    console.log('📋 Suggestions état trouvées:', suggestions ? suggestions.length : 0);

    return suggestions || [
      { id: 'bon', label: '✅ En bon état', value: 'en bon état' },
      { id: 'moyen', label: '⚠️ État moyen', value: 'état moyen' },
      { id: 'mauvais', label: '❌ Mauvais état', value: 'mauvais état' }
    ];
  }

  // Suggestions pour les matériaux selon la catégorie
  private getMaterialsSuggestions(category: string): Array<{ id: string; label: string; value: string }> {
    const materialSuggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      'Peinture': [
        { id: 'lessivable', label: '🧽 Peinture lessivable', value: 'peinture lessivable' },
        { id: 'eco', label: '🌱 Peinture écologique', value: 'peinture écologique' },
        { id: 'mat', label: '✨ Finition mate', value: 'finition mate' },
        { id: 'satine', label: '🌟 Finition satinée', value: 'finition satinée' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      'Électricité': [
        { id: 'standard', label: '⚡ Matériel standard', value: 'matériel électrique standard' },
        { id: 'qualite', label: '💎 Haute qualité', value: 'matériel haute qualité' },
        { id: 'economique', label: '💰 Économique', value: 'matériel économique' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      // Version sans accent pour compatibilité
      'Electricite': [
        { id: 'standard', label: '⚡ Matériel standard', value: 'matériel électrique standard' },
        { id: 'qualite', label: '💎 Haute qualité', value: 'matériel haute qualité' },
        { id: 'economique', label: '💰 Économique', value: 'matériel économique' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      'Plomberie': [
        { id: 'cuivre', label: '🔸 Cuivre', value: 'tuyaux en cuivre' },
        { id: 'per', label: '🔹 PER', value: 'tuyaux PER' },
        { id: 'pvc', label: '⚪ PVC', value: 'tuyaux PVC' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      'Menuiserie': [
        { id: 'massif', label: '🪵 Bois massif', value: 'bois massif' },
        { id: 'agglomere', label: '📦 Aggloméré', value: 'aggloméré' },
        { id: 'mdf', label: '🔧 MDF', value: 'MDF' },
        { id: 'stratifie', label: '✨ Stratifié', value: 'stratifié' }
      ],
      'Maçonnerie': [
        { id: 'beton', label: '🏗️ Béton', value: 'béton' },
        { id: 'brique', label: '🧱 Brique', value: 'brique' },
        { id: 'pierre', label: '🪨 Pierre naturelle', value: 'pierre naturelle' },
        { id: 'parpaing', label: '⬜ Parpaing', value: 'parpaing' }
      ],
      // Version sans accent pour compatibilité
      'Maconnerie': [
        { id: 'beton', label: '🏗️ Béton', value: 'béton' },
        { id: 'brique', label: '🧱 Brique', value: 'brique' },
        { id: 'pierre', label: '🪨 Pierre naturelle', value: 'pierre naturelle' },
        { id: 'parpaing', label: '⬜ Parpaing', value: 'parpaing' }
      ],
      'Salle de bain': [
        { id: 'ceramique', label: '🟫 Céramique', value: 'carrelage céramique' },
        { id: 'faience', label: '🔳 Faïence', value: 'faïence' },
        { id: 'gres', label: '⬛ Grès cérame', value: 'grès cérame' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      'Portes et fenêtres': [
        { id: 'pvc', label: '⚪ PVC', value: 'PVC' },
        { id: 'aluminium', label: '🔘 Aluminium', value: 'aluminium' },
        { id: 'bois', label: '🪵 Bois', value: 'bois' },
        { id: 'mixte', label: '🔄 Mixte', value: 'matériaux mixtes' }
      ],
      // Version sans accents pour compatibilité
      'Portes et fenetres': [
        { id: 'pvc', label: '⚪ PVC', value: 'PVC' },
        { id: 'aluminium', label: '🔘 Aluminium', value: 'aluminium' },
        { id: 'bois', label: '🪵 Bois', value: 'bois' },
        { id: 'mixte', label: '🔄 Mixte', value: 'matériaux mixtes' }
      ],
      'Jardinage': [
        { id: 'bois', label: '🪵 Bois', value: 'bois naturel' },
        { id: 'composite', label: '🔧 Composite', value: 'matériau composite' },
        { id: 'pierre', label: '🪨 Pierre', value: 'pierre naturelle' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      // Version minuscule pour compatibilité
      'jardinage': [
        { id: 'bois', label: '🪵 Bois', value: 'bois naturel' },
        { id: 'composite', label: '🔧 Composite', value: 'matériau composite' },
        { id: 'pierre', label: '🪨 Pierre', value: 'pierre naturelle' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      'Rénovation générale': [
        { id: 'standard', label: '⭐ Standard', value: 'matériaux standard' },
        { id: 'qualite', label: '💎 Haute qualité', value: 'matériaux haute qualité' },
        { id: 'eco', label: '🌱 Écologique', value: 'matériaux écologiques' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      // Version sans accents pour compatibilité
      'Renovation generale': [
        { id: 'standard', label: '⭐ Standard', value: 'matériaux standard' },
        { id: 'qualite', label: '💎 Haute qualité', value: 'matériaux haute qualité' },
        { id: 'eco', label: '🌱 Écologique', value: 'matériaux écologiques' },
        { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      ],
      // 'Autre': [
      //   { id: 'standard', label: '⭐ Standard', value: 'matériaux standard' },
      //   { id: 'qualite', label: '💎 Haute qualité', value: 'matériaux haute qualité' },
      //   { id: 'economique', label: '💰 Économique', value: 'matériaux économiques' },
      //   { id: 'aucune', label: '🚫 Aucune préférence', value: 'aucune préférence' }
      // ]
    };

    console.log('🔍 getMaterialsSuggestions - Recherche pour catégorie:', category);
    const suggestions = materialSuggestions[category];
    console.log('📋 Suggestions matériaux trouvées:', suggestions ? suggestions.length : 0);

    return suggestions || [
      { id: 'standard', label: '⭐ Standard', value: 'standard' },
      { id: 'qualite', label: '💎 Haute qualité', value: 'haute qualité' },
      { id: 'economique', label: '💰 Économique', value: 'économique' }
    ];
  }

  // Suggestions pour la description selon la catégorie et le service
  private getProjectDescriptionSuggestions(category: string, serviceType: string): Array<{ id: string; label: string; value: string }> {
    // Si on a un service_type spécifique, utiliser des suggestions contextuelles
    if (serviceType && serviceType.trim() !== '') {
      const serviceTypeSuggestions = this.getServiceTypeSpecificDescriptions(serviceType, category);
      if (serviceTypeSuggestions.length > 0) {
        console.log('🎯 Utilisation suggestions spécifiques pour service_type:', serviceType);
        return serviceTypeSuggestions;
      }
    }

    const descriptionSuggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      'Peinture': [
        { id: 'blanc', label: '🎨 Je veux du blanc', value: 'Je souhaite une peinture blanche' },
        { id: 'couleur', label: '🌈 Je veux de la couleur', value: 'Je souhaite une couleur spécifique' },
        { id: 'rafraichir', label: '✨ Rafraîchir la pièce', value: 'Je veux rafraîchir la pièce' },
        { id: 'moderne', label: '🏠 Look moderne', value: 'Je veux un style moderne' }
      ],
      'Électricité': [
        { id: 'panne', label: '⚡ Problème électrique', value: 'J\'ai un problème électrique' },
        { id: 'ajout', label: '🔌 Ajouter des prises', value: 'Je veux ajouter des prises' },
        { id: 'normes', label: '🛡️ Mise aux normes', value: 'Je veux mettre aux normes' },
        { id: 'renovation', label: '✨ Rénovation complète', value: 'Je rénove tout l\'électrique' }
      ],
      // Version sans accent pour compatibilité
      'Electricite': [
        { id: 'panne', label: '⚡ Problème électrique', value: 'J\'ai un problème électrique' },
        { id: 'ajout', label: '🔌 Ajouter des prises', value: 'Je veux ajouter des prises' },
        { id: 'normes', label: '🛡️ Mise aux normes', value: 'Je veux mettre aux normes' },
        { id: 'renovation', label: '✨ Rénovation complète', value: 'Je rénove tout l\'électrique' }
      ],
      'Plomberie': [
        { id: 'fuite', label: '💧 Problème de fuite', value: 'J\'ai une fuite' },
        { id: 'robinet', label: '🚰 Changer robinet', value: 'Je veux changer le robinet' },
        { id: 'douche', label: '🚿 Installation douche', value: 'Je veux installer une douche' },
        { id: 'chauffage', label: '🔥 Problème chauffage', value: 'J\'ai un problème de chauffage' }
      ],
      'Menuiserie': [
        { id: 'placard', label: '🗄️ Créer un placard', value: 'Je veux créer un placard sur mesure' },
        { id: 'parquet', label: '🪵 Poser du parquet', value: 'Je veux poser du parquet' },
        { id: 'escalier', label: '🪜 Rénover escalier', value: 'Je veux rénover mon escalier' },
        { id: 'porte', label: '🚪 Installer une porte', value: 'Je veux installer une porte' }
      ],
      'Maçonnerie': [
        { id: 'mur', label: '🧱 Construire un mur', value: 'Je veux construire un mur' },
        { id: 'cloison', label: '🚧 Abattre/monter cloison', value: 'Je veux abattre ou monter une cloison' },
        { id: 'dalle', label: '🏗️ Couler une dalle', value: 'Je veux couler une dalle béton' },
        { id: 'facade', label: '🏠 Rénover façade', value: 'Je veux rénover ma façade' }
      ],
      // Version sans accent pour compatibilité
      'Maconnerie': [
        { id: 'mur', label: '🧱 Construire un mur', value: 'Je veux construire un mur' },
        { id: 'cloison', label: '🚧 Abattre/monter cloison', value: 'Je veux abattre ou monter une cloison' },
        { id: 'dalle', label: '🏗️ Couler une dalle', value: 'Je veux couler une dalle béton' },
        { id: 'facade', label: '🏠 Rénover façade', value: 'Je veux rénover ma façade' }
      ],
      'Salle de bain': [
        { id: 'renovation', label: '🛁 Rénovation complète', value: 'Je veux rénover complètement ma salle de bain' },
        { id: 'douche', label: '🚿 Remplacer baignoire par douche', value: 'Je veux remplacer ma baignoire par une douche' },
        { id: 'carrelage', label: '🟫 Refaire le carrelage', value: 'Je veux refaire le carrelage' },
        { id: 'moderniser', label: '✨ Moderniser', value: 'Je veux moderniser ma salle de bain' }
      ],
      'Portes et fenêtres': [
        { id: 'isolation', label: '❄️ Améliorer isolation', value: 'Je veux améliorer l\'isolation' },
        { id: 'changer', label: '🔄 Changer fenêtres', value: 'Je veux changer mes fenêtres' },
        { id: 'porte', label: '🚪 Installer porte', value: 'Je veux installer une nouvelle porte' },
        { id: 'volets', label: '🪟 Ajouter volets', value: 'Je veux ajouter des volets' }
      ],
      // Version sans accents pour compatibilité
      'Portes et fenetres': [
        { id: 'isolation', label: '❄️ Améliorer isolation', value: 'Je veux améliorer l\'isolation' },
        { id: 'changer', label: '🔄 Changer fenêtres', value: 'Je veux changer mes fenêtres' },
        { id: 'porte', label: '🚪 Installer porte', value: 'Je veux installer une nouvelle porte' },
        { id: 'volets', label: '🪟 Ajouter volets', value: 'Je veux ajouter des volets' }
      ],
      'Jardinage': [
        { id: 'amenagement', label: '🌿 Aménager le jardin', value: 'Je veux aménager mon jardin' },
        { id: 'pelouse', label: '🌱 Créer une pelouse', value: 'Je veux créer une belle pelouse' },
        { id: 'terrasse', label: '🪵 Construire terrasse', value: 'Je veux construire une terrasse' },
        { id: 'plantation', label: '🌳 Planter des arbres', value: 'Je veux planter des arbres et arbustes' }
      ],
      // Version minuscule pour compatibilité
      'jardinage': [
        { id: 'amenagement', label: '🌿 Aménager le jardin', value: 'Je veux aménager mon jardin' },
        { id: 'pelouse', label: '🌱 Créer une pelouse', value: 'Je veux créer une belle pelouse' },
        { id: 'terrasse', label: '🪵 Construire terrasse', value: 'Je veux construire une terrasse' },
        { id: 'plantation', label: '🌳 Planter des arbres', value: 'Je veux planter des arbres et arbustes' }
      ],
      'Rénovation générale': [
        { id: 'complete', label: '🏠 Rénovation complète', value: 'Je veux rénover complètement' },
        { id: 'agrandissement', label: '📐 Agrandir la maison', value: 'Je veux agrandir ma maison' },
        { id: 'moderniser', label: '✨ Moderniser', value: 'Je veux moderniser mon habitat' },
        { id: 'isolation', label: '🧱 Améliorer isolation', value: 'Je veux améliorer l\'isolation thermique' }
      ],
      // Version sans accents pour compatibilité
      'Renovation generale': [
        { id: 'complete', label: '🏠 Rénovation complète', value: 'Je veux rénover complètement' },
        { id: 'agrandissement', label: '📐 Agrandir la maison', value: 'Je veux agrandir ma maison' },
        { id: 'moderniser', label: '✨ Moderniser', value: 'Je veux moderniser mon habitat' },
        { id: 'isolation', label: '🧱 Améliorer isolation', value: 'Je veux améliorer l\'isolation thermique' }
      ],
      // 'Autre': [
      //   { id: 'conseil', label: '💡 Demande de conseil', value: 'J\'ai besoin de conseils' },
      //   { id: 'devis', label: '📋 Devis personnalisé', value: 'Je veux un devis personnalisé' },
      //   { id: 'expertise', label: '🔍 Expertise technique', value: 'J\'ai besoin d\'une expertise technique' },
      //   { id: 'urgent', label: '🚨 Intervention urgente', value: 'J\'ai besoin d\'une intervention urgente' }
      // ]
    };

    console.log('🔍 getProjectDescriptionSuggestions - Recherche pour catégorie:', category);
    const suggestions = descriptionSuggestions[category];
    console.log('📋 Suggestions description trouvées:', suggestions ? suggestions.length : 0);

    return suggestions || [];
  }

  // Nouvelles suggestions contextuelles basées sur le service_type
  private getServiceTypeSpecificDescriptions(serviceType: string, category: string): Array<{ id: string; label: string; value: string }> {
    const cleanServiceType = serviceType.toLowerCase().trim();
    
    // Normaliser les variations d'accents et d'espaces
    const normalizedServiceType = cleanServiceType
      .replace(/é/g, 'e')
      .replace(/è/g, 'e')
      .replace(/ê/g, 'e')
      .replace(/à/g, 'a')
      .replace(/ç/g, 'c')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Suggestions spécifiques par type de service (avec toutes les variations)
    const serviceSpecificSuggestions: Record<string, Array<{ id: string; label: string; value: string }>> = {
      'rénovation complète': [
        { id: 'complete_maison', label: '🏠 Rénover toute la maison', value: 'Je veux rénover entièrement ma maison de A à Z' },
        { id: 'complete_appartement', label: '🏢 Rénover tout l\'appartement', value: 'Je veux rénover complètement mon appartement' },
        { id: 'complete_etages', label: '📐 Rénover par étages', value: 'Je veux rénover étage par étage' },
        { id: 'complete_priorites', label: '🎯 Rénover par priorités', value: 'Je veux rénover en définissant des priorités' }
      ],
      'renovation complete': [
        { id: 'complete_maison', label: '🏠 Rénover toute la maison', value: 'Je veux rénover entièrement ma maison de A à Z' },
        { id: 'complete_appartement', label: '🏢 Rénover tout l\'appartement', value: 'Je veux rénover complètement mon appartement' },
        { id: 'complete_etages', label: '📐 Rénover par étages', value: 'Je veux rénover étage par étage' },
        { id: 'complete_priorites', label: '🎯 Rénover par priorités', value: 'Je veux rénover en définissant des priorités' }
      ],
      'agrandissement maison': [
        { id: 'extension', label: '📐 Extension de maison', value: 'Je veux faire une extension de ma maison' },
        { id: 'combles', label: '🏠 Aménager les combles', value: 'Je veux aménager mes combles pour gagner de l\'espace' },
        { id: 'garage', label: '🚗 Transformer le garage', value: 'Je veux transformer mon garage en pièce à vivre' },
        { id: 'veranda', label: '🌿 Construire une véranda', value: 'Je veux construire une véranda' }
      ],
      'agrandissement': [
        { id: 'extension', label: '📐 Extension de maison', value: 'Je veux faire une extension de ma maison' },
        { id: 'combles', label: '🏠 Aménager les combles', value: 'Je veux aménager mes combles pour gagner de l\'espace' },
        { id: 'garage', label: '🚗 Transformer le garage', value: 'Je veux transformer mon garage en pièce à vivre' },
        { id: 'veranda', label: '🌿 Construire une véranda', value: 'Je veux construire une véranda' }
      ],
      'isolation thermique': [
        { id: 'isolation_murs', label: '🧱 Isoler les murs', value: 'Je veux améliorer l\'isolation de mes murs' },
        { id: 'isolation_combles', label: '🏠 Isoler les combles', value: 'Je veux isoler mes combles perdus' },
        { id: 'isolation_sol', label: '⬇️ Isoler le sol', value: 'Je veux isoler le sol de ma maison' },
        { id: 'isolation_complete', label: '🌡️ Isolation complète', value: 'Je veux une isolation thermique complète' }
      ],
      'isolation': [
        { id: 'isolation_murs', label: '🧱 Isoler les murs', value: 'Je veux améliorer l\'isolation de mes murs' },
        { id: 'isolation_combles', label: '🏠 Isoler les combles', value: 'Je veux isoler mes combles perdus' },
        { id: 'isolation_sol', label: '⬇️ Isoler le sol', value: 'Je veux isoler le sol de ma maison' },
        { id: 'isolation_complete', label: '🌡️ Isolation complète', value: 'Je veux une isolation thermique complète' }
      ],
      'aménagement combles': [
        { id: 'combles_chambre', label: '🛏️ Créer une chambre', value: 'Je veux créer une chambre dans les combles' },
        { id: 'combles_bureau', label: '💼 Créer un bureau', value: 'Je veux aménager un bureau sous les combles' },
        { id: 'combles_salon', label: '🛋️ Créer un salon', value: 'Je veux créer un espace salon dans les combles' },
        { id: 'combles_salle_jeux', label: '🎮 Créer une salle de jeux', value: 'Je veux créer une salle de jeux pour les enfants' }
      ],
      'amenagement combles': [
        { id: 'combles_chambre', label: '🛏️ Créer une chambre', value: 'Je veux créer une chambre dans les combles' },
        { id: 'combles_bureau', label: '💼 Créer un bureau', value: 'Je veux aménager un bureau sous les combles' },
        { id: 'combles_salon', label: '🛋️ Créer un salon', value: 'Je veux créer un espace salon dans les combles' },
        { id: 'combles_salle_jeux', label: '🎮 Créer une salle de jeux', value: 'Je veux créer une salle de jeux pour les enfants' }
      ],
      // Services de jardinage spécifiques
      'créer une pelouse': [
        { id: 'pelouse_naturelle', label: '🌱 Pelouse naturelle', value: 'Je veux une pelouse avec du gazon naturel' },
        { id: 'pelouse_synthetique', label: '🟢 Pelouse synthétique', value: 'Je préfère une pelouse synthétique sans entretien' },
        { id: 'pelouse_mixte', label: '🌿 Pelouse mixte', value: 'Je veux mélanger gazon naturel et zones synthétiques' },
        { id: 'pelouse_sport', label: '⚽ Pelouse sport/jeux', value: 'Je veux une pelouse résistante pour le sport et les jeux' }
      ],
      'creer une pelouse': [
        { id: 'pelouse_naturelle', label: '🌱 Pelouse naturelle', value: 'Je veux une pelouse avec du gazon naturel' },
        { id: 'pelouse_synthetique', label: '🟢 Pelouse synthétique', value: 'Je préfère une pelouse synthétique sans entretien' },
        { id: 'pelouse_mixte', label: '🌿 Pelouse mixte', value: 'Je veux mélanger gazon naturel et zones synthétiques' },
        { id: 'pelouse_sport', label: '⚽ Pelouse sport/jeux', value: 'Je veux une pelouse résistante pour le sport et les jeux' }
      ],
      'aménagement paysager': [
        { id: 'jardin_moderne', label: '🏡 Jardin moderne', value: 'Je veux un jardin au style moderne et épuré' },
        { id: 'jardin_naturel', label: '🌿 Jardin naturel', value: 'Je préfère un jardin au style naturel et sauvage' },
        { id: 'jardin_mediterraneen', label: '🌴 Jardin méditerranéen', value: 'Je veux un jardin méditerranéen avec plantes résistantes' },
        { id: 'jardin_potager', label: '🥕 Jardin potager', value: 'Je veux créer un potager pour cultiver mes légumes' }
      ],
      'amenagement paysager': [
        { id: 'jardin_moderne', label: '🏡 Jardin moderne', value: 'Je veux un jardin au style moderne et épuré' },
        { id: 'jardin_naturel', label: '🌿 Jardin naturel', value: 'Je préfère un jardin au style naturel et sauvage' },
        { id: 'jardin_mediterraneen', label: '🌴 Jardin méditerranéen', value: 'Je veux un jardin méditerranéen avec plantes résistantes' },
        { id: 'jardin_potager', label: '🥕 Jardin potager', value: 'Je veux créer un potager pour cultiver mes légumes' }
      ],
      "plantation d'arbres": [
        { id: 'arbres_fruitiers', label: '🍎 Arbres fruitiers', value: 'Je veux planter des arbres fruitiers (pommiers, poiriers, cerisiers)' },
        { id: 'arbres_ornement', label: '🌳 Arbres d\'ornement', value: 'Je veux planter des arbres d\'ornement pour embellir mon jardin' },
        { id: 'haie_vegetale', label: '🌿 Haie végétale', value: 'Je veux créer une haie avec des arbustes et arbres' },
        { id: 'ombrage', label: '🌲 Arbres d\'ombrage', value: 'Je veux planter des arbres pour créer de l\'ombrage' }
      ],
      'construire terrasse bois': [
        { id: 'terrasse_bois_naturel', label: '🪵 Terrasse bois naturel', value: 'Je veux une terrasse en bois naturel (pin, chêne, teck)' },
        { id: 'terrasse_composite', label: '🔧 Terrasse composite', value: 'Je préfère une terrasse en bois composite sans entretien' },
        { id: 'terrasse_surélevée', label: '📏 Terrasse surélevée', value: 'Je veux une terrasse surélevée avec garde-corps' },
        { id: 'terrasse_plain_pied', label: '🏡 Terrasse plain-pied', value: 'Je veux une terrasse de plain-pied avec le jardin' }
      ],
      'terrasse en bois': [
        { id: 'terrasse_bois_naturel', label: '🪵 Terrasse bois naturel', value: 'Je veux une terrasse en bois naturel (pin, chêne, teck)' },
        { id: 'terrasse_composite', label: '🔧 Terrasse composite', value: 'Je préfère une terrasse en bois composite sans entretien' },
        { id: 'terrasse_surélevée', label: '📏 Terrasse surélevée', value: 'Je veux une terrasse surélevée avec garde-corps' },
        { id: 'terrasse_plain_pied', label: '🏡 Terrasse plain-pied', value: 'Je veux une terrasse de plain-pied avec le jardin' }
      ],

      // === PORTES ET FENÊTRES ===
      'installer une porte': [
        { id: 'porte_entree', label: '🚪 Porte d\'entrée blindée', value: 'Je veux installer une porte d\'entrée sécurisée' },
        { id: 'porte_interieure', label: '🚪 Porte intérieure', value: 'Je veux installer une porte intérieure (chambre, salon)' },
        { id: 'porte_coulissante', label: '↔️ Porte coulissante', value: 'Je veux installer une porte coulissante pour gagner de l\'espace' },
        { id: 'porte_galandage', label: '📐 Porte à galandage', value: 'Je veux installer une porte à galandage dans le mur' }
      ],
      'changer les fenêtres': [
        { id: 'fenetres_double_vitrage', label: '🪟 Fenêtres double vitrage', value: 'Je veux changer pour du double vitrage performant' },
        { id: 'fenetres_triple_vitrage', label: '🪟 Fenêtres triple vitrage', value: 'Je veux du triple vitrage pour une isolation maximale' },
        { id: 'fenetres_pvc', label: '🔧 Fenêtres PVC', value: 'Je veux des fenêtres PVC sans entretien' },
        { id: 'fenetres_aluminium', label: '⚪ Fenêtres aluminium', value: 'Je veux des fenêtres aluminium modernes' }
      ],
      'poser des volets': [
        { id: 'volets_roulants', label: '🎚️ Volets roulants électriques', value: 'Je veux des volets roulants automatiques' },
        { id: 'volets_battants', label: '🚪 Volets battants', value: 'Je veux des volets battants traditionnels' },
        { id: 'volets_persiennés', label: '📏 Volets persiennés', value: 'Je veux des volets persiennés pour l\'aération' },
        { id: 'volets_pvc', label: '🔧 Volets PVC', value: 'Je veux des volets PVC résistants aux intempéries' }
      ],
      'installer porte-fenêtre': [
        { id: 'porte_fenetre_coulissante', label: '↔️ Porte-fenêtre coulissante', value: 'Je veux une porte-fenêtre coulissante sur terrasse' },
        { id: 'porte_fenetre_battante', label: '🚪 Porte-fenêtre battante', value: 'Je veux une porte-fenêtre battante classique' },
        { id: 'baie_vitree', label: '🪟 Baie vitrée panoramique', value: 'Je veux une grande baie vitrée pour plus de lumière' },
        { id: 'porte_fenetre_galandage', label: '📐 Porte-fenêtre à galandage', value: 'Je veux une porte-fenêtre escamotable dans le mur' }
      ],

      // === PLOMBERIE ===
      'réparer un robinet': [
        { id: 'robinet_qui_goutte', label: '💧 Robinet qui goutte', value: 'Mon robinet goutte et je veux le réparer définitivement' },
        { id: 'robinet_grippé', label: '🔧 Robinet grippé', value: 'Mon robinet est dur à tourner et grippé' },
        { id: 'changer_joint', label: '🔧 Changer les joints', value: 'Je veux changer les joints de mon robinet' },
        { id: 'robinet_cassé', label: '❌ Robinet cassé', value: 'Mon robinet est cassé et ne fonctionne plus' }
      ],
      'reparation de robinet': [
        { id: 'robinet_qui_goutte', label: '💧 Robinet qui goutte', value: 'Mon robinet goutte et je veux le réparer définitivement' },
        { id: 'robinet_grippé', label: '🔧 Robinet grippé', value: 'Mon robinet est dur à tourner et grippé' },
        { id: 'changer_joint', label: '🔧 Changer les joints', value: 'Je veux changer les joints de mon robinet' },
        { id: 'robinet_cassé', label: '❌ Robinet cassé', value: 'Mon robinet est cassé et ne fonctionne plus' }
      ],
      'réparer une fuite': [
        { id: 'fuite_canalisation', label: '🔧 Fuite de canalisation', value: 'J\'ai une fuite dans mes canalisations à réparer' },
        { id: 'fuite_wc', label: '🚽 Fuite de WC', value: 'Mes toilettes fuient au niveau du réservoir' },
        { id: 'fuite_chauffe_eau', label: '🔥 Fuite de chauffe-eau', value: 'Mon chauffe-eau fuit et perd de l\'eau' },
        { id: 'fuite_douche', label: '🚿 Fuite de douche', value: 'Ma douche fuit et infiltre les murs' }
      ],
      'reparation de fuite': [
        { id: 'fuite_canalisation', label: '🔧 Fuite de canalisation', value: 'J\'ai une fuite dans mes canalisations à réparer' },
        { id: 'fuite_wc', label: '🚽 Fuite de WC', value: 'Mes toilettes fuient au niveau du réservoir' },
        { id: 'fuite_chauffe_eau', label: '🔥 Fuite de chauffe-eau', value: 'Mon chauffe-eau fuit et perd de l\'eau' },
        { id: 'fuite_douche', label: '🚿 Fuite de douche', value: 'Ma douche fuit et infiltre les murs' }
      ],
      'refaire les canalisations': [
        { id: 'canalisations_cuivre', label: '🔶 Canalisations cuivre', value: 'Je veux refaire mes canalisations en cuivre' },
        { id: 'canalisations_pex', label: '🔧 Canalisations PEX', value: 'Je veux installer des canalisations PEX modernes' },
        { id: 'evacuation_eaux_usees', label: '🌊 Évacuation eaux usées', value: 'Je veux refaire l\'évacuation des eaux usées' },
        { id: 'adoucisseur_eau', label: '💧 Système d\'adoucissement', value: 'Je veux installer un système d\'adoucissement d\'eau' }
      ],
      'refaire canalisations': [
        { id: 'canalisations_cuivre', label: '🔶 Canalisations cuivre', value: 'Je veux refaire mes canalisations en cuivre' },
        { id: 'canalisations_pex', label: '🔧 Canalisations PEX', value: 'Je veux installer des canalisations PEX modernes' },
        { id: 'evacuation_eaux_usees', label: '🌊 Évacuation eaux usées', value: 'Je veux refaire l\'évacuation des eaux usées' },
        { id: 'adoucisseur_eau', label: '💧 Système d\'adoucissement', value: 'Je veux installer un système d\'adoucissement d\'eau' }
      ],
      'installer un chauffe-eau': [
        { id: 'chauffe_eau_electrique', label: '⚡ Chauffe-eau électrique', value: 'Je veux installer un chauffe-eau électrique' },
        { id: 'chauffe_eau_gaz', label: '🔥 Chauffe-eau gaz', value: 'Je veux installer un chauffe-eau à gaz' },
        { id: 'chauffe_eau_thermodynamique', label: '🌡️ Chauffe-eau thermodynamique', value: 'Je veux un chauffe-eau thermodynamique économique' },
        { id: 'ballon_eau_chaude', label: '🔥 Ballon d\'eau chaude', value: 'Je veux installer un ballon d\'eau chaude plus grand' }
      ],
      'installer chauffe-eau': [
        { id: 'chauffe_eau_electrique', label: '⚡ Chauffe-eau électrique', value: 'Je veux installer un chauffe-eau électrique' },
        { id: 'chauffe_eau_gaz', label: '🔥 Chauffe-eau gaz', value: 'Je veux installer un chauffe-eau à gaz' },
        { id: 'chauffe_eau_thermodynamique', label: '🌡️ Chauffe-eau thermodynamique', value: 'Je veux un chauffe-eau thermodynamique économique' },
        { id: 'ballon_eau_chaude', label: '🔥 Ballon d\'eau chaude', value: 'Je veux installer un ballon d\'eau chaude plus grand' }
      ],
      'installation chauffe-eau': [
        { id: 'chauffe_eau_electrique', label: '⚡ Chauffe-eau électrique', value: 'Je veux installer un chauffe-eau électrique' },
        { id: 'chauffe_eau_gaz', label: '🔥 Chauffe-eau gaz', value: 'Je veux installer un chauffe-eau à gaz' },
        { id: 'chauffe_eau_thermodynamique', label: '🌡️ Chauffe-eau thermodynamique', value: 'Je veux un chauffe-eau thermodynamique économique' },
        { id: 'ballon_eau_chaude', label: '🔥 Ballon d\'eau chaude', value: 'Je veux installer un ballon d\'eau chaude plus grand' }
      ],

      // === ÉLECTRICITÉ ===
      'changer le tableau électrique': [
        { id: 'tableau_complet', label: '⚡ Tableau électrique complet', value: 'Je veux changer complètement mon tableau électrique' },
        { id: 'mise_aux_normes_tableau', label: '📋 Mise aux normes du tableau', value: 'Je veux mettre mon tableau aux normes actuelles' },
        { id: 'ajouter_disjoncteurs', label: '🔌 Ajouter des disjoncteurs', value: 'Je veux ajouter des disjoncteurs dans mon tableau' },
        { id: 'tableau_connecte', label: '📱 Tableau connecté', value: 'Je veux un tableau électrique intelligent connecté' }
      ],
      'installer des prises': [
        { id: 'prises_cuisine', label: '🍽️ Prises de cuisine', value: 'Je veux installer des prises dans ma cuisine' },
        { id: 'prises_salon', label: '🛋️ Prises de salon', value: 'Je veux ajouter des prises dans le salon' },
        { id: 'prises_usb', label: '🔌 Prises avec USB', value: 'Je veux des prises électriques avec ports USB intégrés' },
        { id: 'prises_etanches', label: '💧 Prises étanches', value: 'Je veux des prises étanches pour salle de bain' }
      ],
      'ajouter des luminaires': [
        { id: 'spots_encastres', label: '💡 Spots encastrés', value: 'Je veux installer des spots encastrés au plafond' },
        { id: 'suspension_design', label: '✨ Suspension design', value: 'Je veux installer une belle suspension moderne' },
        { id: 'eclairage_led', label: '💡 Éclairage LED', value: 'Je veux passer à un éclairage LED économique' },
        { id: 'variateurs', label: '🎚️ Variateurs d\'intensité', value: 'Je veux installer des variateurs d\'intensité' }
      ],
      'mise aux normes électrique': [
        { id: 'diagnostic_complet', label: '🔍 Diagnostic complet', value: 'Je veux faire un diagnostic électrique complet' },
        { id: 'mise_aux_normes_complete', label: '📋 Mise aux normes complète', value: 'Je veux mettre toute l\'installation aux normes' },
        { id: 'terre_protection', label: '🛡️ Mise à la terre', value: 'Je veux améliorer la mise à la terre et les protections' },
        { id: 'disjoncteur_differentiel', label: '⚡ Disjoncteurs différentiels', value: 'Je veux installer des disjoncteurs différentiels' }
      ],

      // === PEINTURE ===
      'repeindre les murs': [
        { id: 'murs_salon', label: '🛋️ Murs du salon', value: 'Je veux repeindre les murs de mon salon' },
        { id: 'murs_chambre', label: '🛏️ Murs de chambre', value: 'Je veux repeindre les murs d\'une chambre' },
        { id: 'murs_cuisine', label: '🍽️ Murs de cuisine', value: 'Je veux repeindre les murs de ma cuisine' },
        { id: 'murs_couloir', label: '🚪 Murs de couloir', value: 'Je veux repeindre les murs du couloir' }
      ],
      'peindre le plafond': [
        { id: 'plafond_blanc', label: '⚪ Plafond blanc', value: 'Je veux peindre mon plafond en blanc classique' },
        { id: 'plafond_couleur', label: '🎨 Plafond coloré', value: 'Je veux peindre mon plafond dans une couleur' },
        { id: 'plafond_abime', label: '🔧 Plafond abîmé', value: 'Mon plafond est abîmé et nécessite réparation et peinture' },
        { id: 'plafond_taches', label: '🟫 Plafond avec taches', value: 'Mon plafond a des taches à masquer' }
      ],
      'peindre les boiseries': [
        { id: 'portes_interieures', label: '🚪 Portes intérieures', value: 'Je veux peindre mes portes intérieures' },
        { id: 'plinthes_cimaises', label: '📏 Plinthes et cimaises', value: 'Je veux peindre les plinthes et cimaises' },
        { id: 'volets_interieurs', label: '🪟 Volets intérieurs', value: 'Je veux peindre mes volets intérieurs' },
        { id: 'escalier_bois', label: '🪜 Escalier en bois', value: 'Je veux peindre ou lasurer mon escalier en bois' }
      ],
      'rénovation peinture complète': [
        { id: 'appartement_complet', label: '🏠 Appartement complet', value: 'Je veux rénover la peinture de tout mon appartement' },
        { id: 'maison_complete', label: '🏡 Maison complète', value: 'Je veux rénover la peinture de toute ma maison' },
        { id: 'etage_complet', label: '📐 Étage complet', value: 'Je veux rénover la peinture d\'un étage entier' },
        { id: 'pieces_principales', label: '🏠 Pièces principales', value: 'Je veux rénover les pièces principales (salon, chambres)' }
      ],

      // === MENUISERIE ===
      'installer un placard': [
        { id: 'placard_sur_mesure', label: '🚪 Placard sur mesure', value: 'Je veux un placard parfaitement adapté à mon espace' },
        { id: 'placard_coulissant', label: '↔️ Placard coulissant', value: 'Je veux installer un placard avec portes coulissantes' },
        { id: 'dressing_walk_in', label: '👗 Dressing walk-in', value: 'Je veux créer un dressing avec accès libre' },
        { id: 'placard_sous_pente', label: '📐 Placard sous pente', value: 'Je veux optimiser l\'espace sous les combles' }
      ],
      'poser du parquet': [
        { id: 'parquet_massif', label: '🪵 Parquet massif', value: 'Je veux poser du parquet en bois massif noble' },
        { id: 'parquet_contrecolle', label: '🔧 Parquet contrecollé', value: 'Je veux du parquet contrecollé pratique' },
        { id: 'parquet_stratifie', label: '✨ Parquet stratifié', value: 'Je veux du parquet stratifié économique' },
        { id: 'parquet_bambou', label: '🌿 Parquet bambou', value: 'Je veux du parquet bambou écologique' }
      ],
      'créer des étagères': [
        { id: 'bibliotheque_murale', label: '📚 Bibliothèque murale', value: 'Je veux créer une bibliothèque fixée au mur' },
        { id: 'etageres_sur_mesure', label: '📏 Étagères sur mesure', value: 'Je veux des étagères parfaitement adaptées' },
        { id: 'etageres_invisibles', label: '👻 Étagères invisibles', value: 'Je veux des étagères avec fixations invisibles' },
        { id: 'meuble_tv_integre', label: '📺 Meuble TV intégré', value: 'Je veux intégrer un meuble TV avec étagères' }
      ],
      'réparer un escalier': [
        { id: 'escalier_grince', label: '🔧 Escalier qui grince', value: 'Mon escalier grince et je veux le réparer' },
        { id: 'marches_abimees', label: '🪜 Marches abîmées', value: 'Les marches de mon escalier sont abîmées' },
        { id: 'rambarde_escalier', label: '🛡️ Rambarde d\'escalier', value: 'Je veux réparer ou changer la rambarde' },
        { id: 'escalier_vernir', label: '✨ Poncer et vernir', value: 'Je veux poncer et vernir mon escalier en bois' }
      ],

      // === MAÇONNERIE ===
      'construire un mur': [
        { id: 'mur_porteur', label: '🧱 Mur porteur', value: 'Je veux construire un mur porteur pour restructurer l\'espace' },
        { id: 'mur_cloture', label: '🏠 Mur de clôture', value: 'Je veux construire un mur de clôture pour délimiter' },
        { id: 'mur_soutenement', label: '🪨 Mur de soutènement', value: 'Je veux construire un mur de soutènement pour la terre' },
        { id: 'muret_decoratif', label: '🌿 Muret décoratif', value: 'Je veux construire un muret décoratif dans le jardin' }
      ],
      'monter une cloison': [
        { id: 'cloison_placo', label: '🧱 Cloison placo', value: 'Je veux monter une cloison en plaques de plâtre' },
        { id: 'cloison_brique', label: '🧱 Cloison en brique', value: 'Je veux monter une cloison en briques' },
        { id: 'cloison_beton', label: '⬜ Cloison béton cellulaire', value: 'Je veux une cloison en béton cellulaire' },
        { id: 'cloison_verriere', label: '🪟 Cloison verrière', value: 'Je veux installer une cloison type verrière' }
      ],
      'couler une dalle béton': [
        { id: 'dalle_terrasse', label: '🏡 Dalle de terrasse', value: 'Je veux couler une dalle pour faire une terrasse' },
        { id: 'dalle_garage', label: '🚗 Dalle de garage', value: 'Je veux couler une dalle béton dans mon garage' },
        { id: 'dalle_extension', label: '📐 Dalle d\'extension', value: 'Je veux couler une dalle pour une extension' },
        { id: 'dalle_abri', label: '🏠 Dalle d\'abri jardin', value: 'Je veux couler une dalle pour un abri de jardin' }
      ],
      'rénover la façade': [
        { id: 'enduit_facade', label: '🏠 Refaire l\'enduit', value: 'Je veux refaire l\'enduit de ma façade extérieure' },
        { id: 'reparer_fissures', label: '🔧 Réparer les fissures', value: 'J\'ai des fissures dans ma façade à réparer' },
        { id: 'nettoyage_facade', label: '✨ Nettoyer la façade', value: 'Je veux nettoyer et ravaler ma façade' },
        { id: 'isolation_exterieure', label: '🧱 Isolation par l\'extérieur', value: 'Je veux isoler ma façade par l\'extérieur' }
      ],

      // === SALLE DE BAIN ===
      'rénovation complète salle de bain': [
        { id: 'renov_complete_moderne', label: '✨ Rénovation moderne', value: 'Je veux une rénovation complète avec design moderne' },
        { id: 'renov_complete_classique', label: '🏛️ Rénovation classique', value: 'Je veux une rénovation complète dans un style classique' },
        { id: 'renov_complete_pmr', label: '♿ Rénovation PMR', value: 'Je veux rénover pour l\'accessibilité PMR' },
        { id: 'renov_complete_budget', label: '💰 Rénovation économique', value: 'Je veux rénover complètement avec un budget maîtrisé' }
      ],
      'installer une douche': [
        { id: 'douche_italienne_carrelee', label: '🚿 Douche italienne carrelée', value: 'Je veux installer une douche à l\'italienne avec carrelage' },
        { id: 'douche_cabine', label: '🚿 Cabine de douche', value: 'Je veux installer une cabine de douche complète' },
        { id: 'remplacer_baignoire_douche', label: '🛁➡️🚿 Remplacer baignoire par douche', value: 'Je veux remplacer ma baignoire par une douche' },
        { id: 'douche_hydromassante', label: '💆 Douche hydromassante', value: 'Je veux installer une douche avec jets hydromassants' }
      ],
      'changer la baignoire': [
        { id: 'baignoire_ilot', label: '🛁 Baignoire îlot', value: 'Je veux installer une baignoire îlot design' },
        { id: 'baignoire_encastree', label: '🛁 Baignoire encastrée', value: 'Je veux une baignoire encastrée classique' },
        { id: 'baignoire_balneo', label: '💆 Baignoire balnéo', value: 'Je veux installer une baignoire balnéothérapie' },
        { id: 'baignoire_douche', label: '🛁🚿 Baignoire-douche', value: 'Je veux une baignoire combinée avec douche' }
      ],
      'refaire le carrelage': [
        { id: 'carrelage_mural', label: '🟫 Carrelage mural', value: 'Je veux refaire le carrelage des murs de la salle de bain' },
        { id: 'carrelage_sol', label: '⬛ Carrelage au sol', value: 'Je veux refaire le carrelage du sol de la salle de bain' },
        { id: 'carrelage_complet', label: '🟫 Carrelage complet', value: 'Je veux refaire tout le carrelage murs et sol' },
        { id: 'faience_moderne', label: '✨ Faïence moderne', value: 'Je veux installer une faïence moderne et tendance' }
      ]
    };

    console.log('🔍 Recherche suggestions pour service_type:', cleanServiceType);
    console.log('🔍 Service type normalisé:', normalizedServiceType);
    
    // Chercher d'abord avec la version originale, puis avec la version normalisée
    let suggestions = serviceSpecificSuggestions[cleanServiceType] || serviceSpecificSuggestions[normalizedServiceType];
    
    console.log('📋 Suggestions spécifiques trouvées:', suggestions ? suggestions.length : 0);
    
    return suggestions || [];
  }

  // Générer un prompt contextuel pour current_state selon le service_type
  private getContextualCurrentStatePrompt(category: string, serviceType: string): string {
    const cleanServiceType = serviceType.toLowerCase().trim();
    
    // Prompts spécifiques selon le type de service
    if (cleanServiceType.includes('agrandissement') || cleanServiceType.includes('extension')) {
      return `Pour un projet d'agrandissement (${serviceType}), 
      demande l'état actuel de l'espace existant à agrandir ou de la zone concernée.
      Exemples: "espace disponible et dégagé", "mur porteur à étudier", "terrain prêt", "nécessite démolition partielle"`;
    }
    
    if (cleanServiceType.includes('isolation')) {
      return `Pour un projet d'isolation (${serviceType}), 
      demande l'état actuel de l'isolation existante.
      Exemples: "pas d'isolation", "isolation vétuste", "isolation partielle", "bonne isolation mais à améliorer"`;
    }
    
    if (cleanServiceType.includes('combles') || cleanServiceType.includes('aménagement')) {
      return `Pour un projet d'aménagement (${serviceType}), 
      demande l'état actuel de l'espace à aménager.
      Exemples: "combles vides", "espace brut", "déjà partiellement aménagé", "à remettre aux normes"`;
    }
    
    if (cleanServiceType.includes('rénovation') || cleanServiceType.includes('renovation')) {
      return `Pour un projet de rénovation (${serviceType}), 
      demande l'état général actuel des espaces à rénover.
      Exemples: "bon état général", "état moyen", "vétuste", "nécessite rénovation complète"`;
    }
    
    // Prompts par catégorie (fallback)
    switch (category) {
      case 'Électricité':
        return `Pour un projet d'électricité (${serviceType}), 
        demande l'état actuel de l'installation électrique.
        Exemples: "fonctionne mais vétuste", "disjoncte souvent", "aux normes", "installation dangereuse"`;
        
      case 'Plomberie':
        return `Pour un projet de plomberie (${serviceType}), 
        demande l'état actuel des installations.
        Exemples: "fuit légèrement", "complètement cassé", "fonctionne bien", "pression faible"`;
        
      case 'Peinture':
        return `Pour un projet de peinture (${serviceType}), 
        demande l'état actuel des surfaces à peindre.
        Exemples: "murs en bon état", "peinture écaillée", "fissures à reboucher", "support à préparer"`;
        
      default:
        return `Pour un projet de ${category} (${serviceType}), 
        demande l'état actuel avec des exemples concrets selon le contexte du projet.
        Adapte ta question au type de travaux demandé.`;
    }
  }

  // Clarifier un champ
  private async clarifyField(fieldName: string, userInput: string): Promise<FormRunnerResult> {
    console.log('❓ Clarification pour:', fieldName, 'avec input:', userInput);
    
    const fieldConfig = getServiceFieldsConfig('default').find(f => f.id === fieldName);
    if (!fieldConfig) {
      return this.askNextLogicalQuestion();
    }

    const prompt = `Clarifie "${fieldConfig.displayName}" pour l'utilisateur.

Sa réponse : "${userInput}"

RÈGLES : 1-2 phrases max, exemples brefs, aide à comprendre sans reposer la question.`;

    const response = await this.generateAIResponse(prompt);
    
    // Stocker les suggestions pour le contexte
    this.conversationState.lastSuggestions = response;
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: fieldConfig,
      conversationState: this.conversationState
    };
  }

  // Fournir des suggestions
  private async provideSuggestions(fieldName: string): Promise<FormRunnerResult> {
    const fieldConfig = getServiceFieldsConfig('default').find(f => f.id === fieldName);
    if (!fieldConfig) {
      return this.askNextLogicalQuestion();
    }

    const prompt = `Aide pour "${fieldConfig.displayName}".

${fieldConfig.examples ? `Exemples : ${fieldConfig.examples.join(', ')}` : ''}

RÈGLES : 1-2 phrases, exemples concrets, question d'aide courte.`;

    const response = await this.generateAIResponse(prompt);
    
    // Stocker les suggestions
    this.conversationState.lastSuggestions = response;
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: fieldConfig,
      conversationState: this.conversationState
    };
  }

  // Valider et générer le devis
  private async validateAndGenerateQuote(): Promise<FormRunnerResult> {
    console.log('✅ Validation et génération devis');
    
    // Générer l'estimation de prix
    const estimatedPrice = await this.generatePriceEstimation();
    
    // Récupérer les URLs des photos
    const photoUrls = Array.isArray(this.projectState.photos_uploaded) 
      ? this.projectState.photos_uploaded 
      : [];
    
    // Générer le résumé professionnel avec analyse photos
    const photoAnalysis = photoUrls.length > 0 ? 
      await this.analyzePhotosWithVision(photoUrls) : 
      "Aucune photo fournie pour l'analyse";
    
    const summary = await this.generateProfessionalSummary(photoAnalysis, estimatedPrice);
    
    return {
      output: summary,
      isComplete: true,
      currentQuestion: null,
      conversationState: { ...this.conversationState, isComplete: true },
      finalAnswers: this.projectState,
      estimatedPrice: estimatedPrice
    };
  }

  // Conversation libre
  private async engageFreeConversation(userInput: string): Promise<FormRunnerResult> {
    this.conversationState.conversationMode = 'free';
    
    const prompt = `Conversation libre avec l'utilisateur.

Message : "${userInput}"
Contexte : ${this.getProjectDescription()}

RÈGLES : 1-2 phrases, naturel, encourageant, bref.`;

    const response = await this.generateAIResponse(prompt);
    
    return {
      output: response,
      isComplete: false,
      currentQuestion: null,
      conversationState: this.conversationState
    };
  }

  // Demander la prochaine question logique
  private async askNextLogicalQuestion(): Promise<FormRunnerResult> {
    const missingRequired = this.getMissingRequiredFields();
    const missingConditional = this.getMissingConditionalFields();
    
    if (missingRequired.length > 0) {
      return this.askNextQuestion(missingRequired[0]);
    }
    
    if (missingConditional.length > 0) {
      return this.askNextQuestion(missingConditional[0]);
    }
    
    // Vérifier les champs optionnels (comme les photos)
    const category = this.projectState.project_category || 'default';
    const completeOrder = this.getCompleteFieldsOrder(category);
    const missingOptional = completeOrder.filter(fieldId => 
      !this.projectState[fieldId] && 
      fieldId === 'photos_uploaded' // Pour l'instant, seules les photos sont optionnelles
    );
    
    if (missingOptional.length > 0) {
      return this.askNextQuestion(missingOptional[0]);
    }
    
    return this.validateAndGenerateQuote();
  }

  // Méthodes utilitaires - UTILISE MAINTENANT LES CONSTANTES CONSOLIDÉES
  private getMissingRequiredFields(): string[] {
    const category = this.projectState.project_category || 'default';
    const requiredFields = getRequiredFieldsForCategory(category);
    
    console.log('🔍 DEBUG getMissingRequiredFields:');
    console.log('📂 Catégorie:', category);
    console.log('📋 Champs requis selon config:', requiredFields);
    console.log('🗂️ État projet actuel:', Object.keys(this.projectState));
    
    const missing = requiredFields.filter((fieldId: string) => {
      const hasField = !!this.projectState[fieldId];
      const fieldValue = this.projectState[fieldId];
      console.log(`🔍 Vérification champ "${fieldId}":`, hasField ? `✅ "${fieldValue}"` : '❌ manquant');
      return !hasField;
    });
    console.log('❌ Champs manquants:', missing);
    
    return missing;
  }

  // Nouvelle fonction pour obtenir l'ordre complet incluant les champs optionnels
  private getCompleteFieldsOrder(category: string): string[] {
    const normalizedCategory = category === 'rénovation générale' ? 'Rénovation générale' : category;
    const categorySpecific = CATEGORY_REQUIRED_FIELDS[normalizedCategory] || [];
    
    // Ordre complet incluant les champs optionnels comme les photos
    const completeOrder = [
      'project_category',
      'service_type', 
      'project_description',
      ...categorySpecific,  // room_type, current_state, etc.
      'photos_uploaded',    // Photos optionnelles AVANT l'adresse
      'project_location'    // Localisation en tout dernier
    ];
    
    return completeOrder;
  }

  private getMissingConditionalFields(): string[] {
    const category = this.projectState.project_category || 'default';
    const categorySpecificFields = CATEGORY_REQUIRED_FIELDS[category] || [];
    
    return categorySpecificFields.filter((fieldId: string) => !this.projectState[fieldId]);
  }

  private getNextLogicalField(): FieldConfig | null {
    const missingRequired = this.getMissingRequiredFields();
    if (missingRequired.length > 0) {
      return getServiceFieldsConfig('default').find(f => f.id === missingRequired[0]) || null;
    }
    
    // Vérifier les champs optionnels
    const category = this.projectState.project_category || 'default';
    const completeOrder = this.getCompleteFieldsOrder(category);
    const missingOptional = completeOrder.filter(fieldId => 
      !this.projectState[fieldId] && 
      fieldId === 'photos_uploaded' // Pour l'instant, seules les photos sont optionnelles
    );
    
    if (missingOptional.length > 0) {
      return getServiceFieldsConfig('default').find(f => f.id === missingOptional[0]) || null;
    }
    
    return null;
  }

  private generateSimpleQuestion(field: FieldConfig): string {
    return field.question || `Pouvez-vous me parler de ${field.displayName} ?`;
  }

  private async generateProjectSummary(): Promise<FormRunnerResult> {
    const estimatedPrice = await this.generatePriceEstimation();
    const summary = await this.generateProfessionalSummary("", estimatedPrice);
    
    return {
      output: summary,
      isComplete: true,
      currentQuestion: null,
      conversationState: { ...this.conversationState, isComplete: true },
      finalAnswers: this.projectState,
      estimatedPrice: estimatedPrice
    };
  }

  private getProjectDescription(): string {
    const filled = Object.entries(this.projectState)
      .map(([field, value]) => `${field}: ${value}`)
      .join('\n');
    
    return filled || 'Aucune information collectée';
  }

  // Générer une réponse IA
  private async generateAIResponse(prompt: string): Promise<string> {
    if (!this.useAI) {
      return "Continuons avec votre projet !";
    }

    try {
      const result = await this.llm.invoke([
        { role: 'system', content: MASTER_SYSTEM_PROMPT.replace('{project_context}', this.getProjectDescription()) },
        { role: 'user', content: prompt }
      ]);
      
      return typeof result.content === 'string' ? result.content : "Continuons !";
    } catch (error) {
      console.error('❌ Erreur génération IA:', error);
      return "Parlez-moi de votre projet !";
    }
  }

  // Sauvegarder dans l'état du projet
  private async saveToProjectState(field: string, value: any) {
    console.log('💾 Sauvegarde:', field, '=', value);
    
    // Mapper intelligemment la réponse vers les valeurs des options si possible
    const mappedValue = this.mapUserResponseToOptionValue(field, value);
    
    // Nettoyer la valeur
    const cleanedValue = await this.cleanValue(field, mappedValue);
    
    // Gestion spéciale pour photos_uploaded quand l'utilisateur passe
    if (field === 'photos_uploaded') {
      const skipPhotosAnswers = [
        'non', 'pas de photos', 'pas d\'image', 'je n\'ai pas d\'image', 
        'je n\'ai pas de photo', 'aucune photo', 'pas maintenant', 'plus tard',
        'je n\'ai pas', 'sans photo', 'sans image', 'skip', 'passer',
        'je n\'ai pas d\'image pour le moment'
      ];
      
      const valueString = String(cleanedValue).toLowerCase().trim();
      if (skipPhotosAnswers.some(answer => valueString.includes(answer))) {
        // Sauvegarder un tableau vide pour indiquer que l'utilisateur a choisi de passer
        this.projectState[field] = [];
        console.log('📸 Photos passées par l\'utilisateur - tableau vide sauvegardé');
      } else {
        this.projectState[field] = [cleanedValue];
      }
    } else {
      this.projectState[field] = cleanedValue;
    }
    
    // Sauvegarder en mémoire
    try {
      await this.memory.saveContext(
        { input: `Question sur ${field}` },
        { output: cleanedValue }
      );
    } catch (error) {
      console.error('❌ Erreur sauvegarde mémoire:', error);
    }
  }

  // Mapper les réponses utilisateur vers les valeurs des options
  private mapUserResponseToOptionValue(field: string, userResponse: string): string {
    if (!userResponse || typeof userResponse !== 'string') {
      return userResponse;
    }

    const lowerResponse = userResponse.toLowerCase().trim();
    const category = this.projectState.project_category || '';

    // Gestion spéciale pour room_type (sélection multiple)
    if (field === 'room_type') {
      return this.mapMultipleRoomTypes(userResponse);
    }

    // Mappings spécifiques par champ
    const mappings: Record<string, Record<string, string>> = {
      project_category: {
        'rénovation générale': 'Rénovation générale',
        'renovation générale': 'Rénovation générale',
        'renovation generale': 'Rénovation générale',
        'plomberie': 'Plomberie',
        'électricité': 'Électricité',
        'electricite': 'Électricité',
        'menuiserie': 'Menuiserie',
        'peinture': 'Peinture',
        'maçonnerie': 'Maçonnerie',
        'maconnerie': 'Maçonnerie',
        'salle de bain': 'Salle de bain',
        'portes et fenêtres': 'Portes et fenêtres',
        'portes et fenetres': 'Portes et fenêtres',
        'jardinage': 'Jardinage'
      },
      current_state: {
        // Réponses positives pour humidité
        'oui': category === 'Peinture' ? 'problèmes d\'humidité' : 'nécessite des réparations',
        'oui j\'ai de l\'humidité': 'problèmes d\'humidité',
        'oui il y a de l\'humidité': 'problèmes d\'humidité',
        'j\'ai de l\'humidité': 'problèmes d\'humidité',
        'il y a de l\'humidité': 'problèmes d\'humidité',
        'problème d\'humidité': 'problèmes d\'humidité',
        'problèmes d\'humidité': 'problèmes d\'humidité',
        'humidité': 'problèmes d\'humidité',
        
        // États généraux
        'bon état': 'en bon état',
        'bon': 'en bon état',
        'très bon': 'en excellent état',
        'excellent': 'en excellent état',
        'moyen': 'état moyen',
        'correct': 'état moyen',
        'mauvais': 'mauvais état',
        'très mauvais': 'mauvais état',
        'dégradé': 'mauvais état',
        'abîmé': 'mauvais état',
      },
      project_urgency: {
        'urgent': 'urgent',
        'très urgent': 'urgent',
        'rapidement': 'urgent',
        'vite': 'urgent',
        'bientôt': 'dans les 15 jours',
        'prochainement': 'dans les 15 jours',
        'pas pressé': 'dans les 30 jours',
        'normal': 'dans les 30 jours',
        'quand vous voulez': 'dans les 30 jours',
      },
      materials_preferences: {
        'aucune': 'aucune préférence',
        'aucune préférence': 'aucune préférence',
        'peu importe': 'aucune préférence',
        'standard': 'standard',
        'qualité': 'haute qualité',
        'haut de gamme': 'haute qualité',
        'économique': 'économique',
        'pas cher': 'économique',
      }
    };

    // Vérifier si on a un mapping pour ce champ
    if (mappings[field]) {
      const fieldMappings = mappings[field];
      
      // Chercher une correspondance exacte d'abord
      if (fieldMappings[lowerResponse]) {
        console.log(`🔄 Mapping: "${userResponse}" -> "${fieldMappings[lowerResponse]}" pour ${field}`);
        return fieldMappings[lowerResponse];
      }
      
      // Chercher une correspondance partielle
      for (const [key, value] of Object.entries(fieldMappings)) {
        if (lowerResponse.includes(key) || key.includes(lowerResponse)) {
          console.log(`🔄 Mapping partiel: "${userResponse}" -> "${value}" pour ${field}`);
          return value;
        }
      }
    }

    // Si aucun mapping trouvé, retourner la valeur originale
    return userResponse;
  }

  // Mapper les types de pièces multiples
  private mapMultipleRoomTypes(userResponse: string): string {
    const roomMappings: Record<string, string> = {
      'salon': 'salon',
      'séjour': 'salon',
      'living': 'salon',
      'cuisine': 'cuisine',
      'kitchen': 'cuisine',
      'chambre': 'chambre',
      'bedroom': 'chambre',
      'chambre à coucher': 'chambre',
      'salle de bain': 'salle de bain',
      'sdb': 'salle de bain',
      'bathroom': 'salle de bain',
      'douche': 'salle de bain',
      'wc': 'WC',
      'toilettes': 'WC',
      'toilet': 'WC',
      'couloir': 'couloir',
      'corridor': 'couloir',
      'hall': 'couloir',
      'garage': 'garage',
      'bureau': 'bureau',
      'office': 'bureau',
      'cave': 'cave/sous-sol',
      'sous-sol': 'cave/sous-sol',
      'basement': 'cave/sous-sol'
    };

    const lowerResponse = userResponse.toLowerCase();
    const foundRooms: string[] = [];

    // Chercher tous les types de pièces mentionnés
    for (const [key, value] of Object.entries(roomMappings)) {
      if (lowerResponse.includes(key)) {
        if (!foundRooms.includes(value)) {
          foundRooms.push(value);
        }
      }
    }

    // Si des pièces ont été trouvées, les retourner jointes par des virgules
    if (foundRooms.length > 0) {
      const result = foundRooms.join(', ');
      console.log(`🏠 Mapping multiple room_type: "${userResponse}" -> "${result}"`);
      return result;
    }

    // Si aucune pièce spécifique trouvée, retourner la réponse originale
    return userResponse;
  }

  private async cleanValue(field: string, rawValue: string): Promise<string> {
    if (!rawValue || typeof rawValue !== 'string') {
      return rawValue;
    }

    // Nettoyer d'abord les guillemets superflus
    const cleanedInput = rawValue.trim().replace(/^["']|["']$/g, '');

    if (!this.useAI) {
      return cleanedInput;
    }

    try {
      const prompt = `Nettoie et formate cette réponse pour le champ "${field}" :

      Réponse brute : ${cleanedInput}

      Règles :
      - Supprime les mots de validation ("parfait", "exactement", etc.)
      - Formate selon le type de champ
      - Garde uniquement l'information utile
      - Corrige l'orthographe si nécessaire
      - PAS de guillemets dans la réponse

      Réponds UNIQUEMENT avec la valeur nettoyée, sans guillemets.`;

      const result = await this.extractionLLM.invoke([
        { role: 'user', content: prompt }
      ]);
      
      let cleaned = typeof result.content === 'string' ? result.content.trim() : cleanedInput;
      // Supprimer les guillemets de la réponse IA aussi
      cleaned = cleaned.replace(/^["']|["']$/g, '');
      
      return cleaned.length > 0 ? cleaned : cleanedInput;
    } catch (error) {
      console.error('❌ Erreur nettoyage valeur:', error);
      return cleanedInput;
    }
  }

  private async extractValidatedSuggestions(input: string, context: ConversationContext): Promise<string> {
    if (!context.lastSuggestions || !this.useAI) {
      return input;
    }

    try {
      const prompt = `L'utilisateur valide des suggestions que j'ai données.

Suggestions données : "${context.lastSuggestions}"
Validation de l'utilisateur : "${input}"

Extrais uniquement le contenu validé, sans les mots de validation.

Réponds UNIQUEMENT avec le contenu extrait.`;

      const result = await this.extractionLLM.invoke([
        { role: 'user', content: prompt }
      ]);
      
      return typeof result.content === 'string' ? result.content.trim() : input;
    } catch (error) {
      console.error('❌ Erreur extraction suggestions:', error);
      return input;
    }
  }

  private async generatePriceEstimation(): Promise<EstimatedPrice> {
    // Logique d'estimation basique pour l'instant
    const category = this.projectState.project_category?.toLowerCase() || '';
    const description = this.projectState.project_description?.toLowerCase() || '';
    
    let basePrice = 500;
    
    if (category.includes('plomberie') || description.includes('plomberie')) {
      basePrice = 300;
    } else if (category.includes('électricité') || description.includes('électricité')) {
      basePrice = 400;
    } else if (category.includes('peinture') || description.includes('peinture')) {
      basePrice = 600;
    } else if (category.includes('menuiserie') || description.includes('menuiserie')) {
      basePrice = 800;
    }
    
    return {
      min: Math.floor(basePrice * 0.7),
      max: Math.ceil(basePrice * 1.5),
      factors: ['Complexité du projet', 'Matériaux nécessaires', 'Temps de réalisation']
    };
  }

  private async generateProfessionalSummary(photoAnalysis: string, estimatedPrice: EstimatedPrice): Promise<string> {
    // Mapping des clés vers les labels français
    const fieldLabels: Record<string, string> = {
      project_category: 'Catégorie',
      service_type: 'Type de service',
      project_description: 'Description',
      surface_area: 'Surface',
      room_type: 'Type de pièce',
      current_state: 'État actuel',
      materials_preferences: 'Matériaux préférés',
      specific_requirements: 'Exigences spécifiques',
      project_location: 'Localisation',
      project_urgency: 'Urgence',
      access_constraints: 'Contraintes d\'accès',
      timeline_constraints: 'Contraintes temporelles'
    };

    // Construire les détails avec labels français (exclure photos_uploaded)
    const projectDetails = Object.entries(this.projectState)
      .filter(([key, value]) => 
        value && 
        key !== 'estimated_price' && 
        key !== 'photos_uploaded' // Exclure les photos de cette section
      )
      .map(([key, value]) => {
        const label = fieldLabels[key] || key;
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        return `${label}: ${displayValue}`;
      })
      .join('\n');

    // Section photos séparée si présentes
    const photos = this.projectState.photos_uploaded;
    const photosSection = photos && Array.isArray(photos) && photos.length > 0 
      ? `📸 PHOTOS DU PROJET (${photos.length})\n${photos.map((photo, index) => `Photo ${index + 1}: ${photo}`).join('\n')}\n\n`
      : '';
      
    return `🎯 ANALYSE EXPERTE TERMINÉE

📋 DÉTAILS DU PROJET
${projectDetails}

${photosSection}💰 Estimation budgétaire : ${estimatedPrice.min}€ - ${estimatedPrice.max}€
Facteurs influençant le prix :
${estimatedPrice.factors.map(f => `• ${f}`).join('\n')}

${photoAnalysis ? `Analyse des photos :\n${photoAnalysis}\n` : ''}

✅ Votre projet est maintenant prêt pour recevoir des devis d'artisans qualifiés.`;
  }

  private async analyzePhotosWithVision(photoUrls: string[]): Promise<string> {
    if (!this.useAI || !photoUrls || photoUrls.length === 0) {
      return "Aucune photo fournie pour l'analyse.";
    }

    try {
      // PROMPT DYNAMIQUE ET INGÉNIEUX basé sur la catégorie
      const category = this.projectState.project_category || '';
      const serviceType = this.projectState.service_type || '';
      const description = this.projectState.project_description || '';
      
      const prompt = this.generateDynamicAnalysisPrompt(category, serviceType, description);

      // Convertir les images S3 en base64 pour OpenAI Vision
      console.log('🖼️ Conversion des images S3 en base64 pour OpenAI Vision...');
      const imageContents = [];
      
      for (const url of photoUrls) {
        console.log('🔄 Traitement image:', url);
        const base64Image = await getImageAsBase64(url);
        
        if (base64Image) {
          imageContents.push({
            type: 'image_url',
            image_url: { url: base64Image }
          });
          console.log('✅ Image convertie en base64 avec succès');
        } else {
          console.log('❌ Impossible de convertir l\'image:', url);
        }
      }
      
      if (imageContents.length === 0) {
        console.log('❌ Aucune image convertie, analyse impossible');
        return "Impossible d'analyser les photos fournies.";
      }
      
      console.log(`📸 Analyse de ${imageContents.length} image(s) avec GPT Vision...`);
      
      const result = await this.llm.invoke([
        { 
          role: 'user', 
          content: [
            { type: 'text', text: prompt },
            ...imageContents
          ]
        }
      ]);
      
      const analysis = typeof result.content === 'string' ? result.content : "Analyse des photos en cours de développement.";
      console.log('✅ Analyse GPT Vision terminée avec succès');
      return analysis;
    } catch (error) {
      console.error('❌ Erreur analyse photos:', error);
      
      // Fallback avec analyse contextuelle basique
      const category = this.projectState.project_category || '';
      return `**Analyse des photos :**

Photos reçues pour votre projet de ${category}. 

**Recommandations :**
- Les photos permettront aux artisans d'évaluer précisément l'état actuel
- Elles aideront à préparer un devis plus précis
- Les professionnels pourront anticiper les matériaux nécessaires

**Prochaines étapes :**
Les artisans analyseront ces photos pour vous proposer des devis adaptés à votre situation.`;
    }
  }

  // PROMPT ENGINEERING DYNAMIQUE - S'adapte à chaque domaine
  private generateDynamicAnalysisPrompt(category: string, serviceType: string, description: string): string {
    // Contexte spécialisé par domaine
    const domainExpertise = this.getDomainSpecificPrompt(category);
    
    // Questions techniques spécialisées
    const technicalQuestions = this.getTechnicalQuestions(category);
    
    // Indicateurs de qualité à rechercher
    const qualityIndicators = this.getQualityIndicators(category);
    
    return `🔍 RÔLE : Tu es ${domainExpertise.role}

📋 CONTEXTE DU PROJET :
- Catégorie: ${category}
- Service demandé: ${serviceType}
- Description client: "${description}"

🧠 MÉTHODOLOGIE D'ANALYSE (Chain of Thought) :

ÉTAPE 1 - OBSERVATION FACTUELLE
Décris précisément ce que tu vois dans l'image, sans interprétation :
- Type d'installation/équipement visible
- État visuel général
- Matériaux identifiables
- Configuration spatiale

ÉTAPE 2 - EXPERTISE SPÉCIALISÉE ${category.toUpperCase()}
${domainExpertise.context}

Analyse selon ces critères techniques spécialisés :
${technicalQuestions.map(q => `• ${q}`).join('\n')}

ÉTAPE 3 - DIAGNOSTIC EXPERT
Évalue ces indicateurs de qualité spécifiques au ${category} :
${qualityIndicators.map(i => `• ${i}`).join('\n')}

ÉTAPE 4 - ÉVALUATION CONTEXTUELLE
Corrèle tes observations avec la demande client : "${description}"
- Est-ce cohérent avec ce que je vois ?
- Quels éléments confirment ou infirment la description ?
- Quels détails supplémentaires sont révélés par l'image ?

🎯 STRUCTURE DE RÉPONSE EXPERTE :

**🔍 Observation directe :**
[Ce que je vois exactement dans l'image]

**🏷️ Identification technique :**
[Type d'installation/système identifié avec certitude]

**⚡ Diagnostic ${category} :**
[Analyse technique spécialisée selon mon expertise ${category}]

**📊 État et conformité :**
[Évaluation de l'état selon les standards ${category}]

**🔧 Points techniques critiques :**
[Éléments techniques importants pour le ${category}]

**💡 Cohérence avec la demande :**
[Correspondance entre l'image et la description "${description}"]

**⭐ Recommandations Reenove :**
[Conseils d'expert ${category} en mettant EXCLUSIVEMENT en avant les services Reenove]

EXEMPLES DE FORMULATIONS REENOVE OBLIGATOIRES :
• "Reenove vous conseille de remplacer..."
• "Nos experts Reenove recommandent..."
• "Faites appel à l'un de nos experts Reenove pour..."
• "L'équipe Reenove peut vous accompagner dans..."
• "Grâce au réseau Reenove, vous bénéficierez de..."
• "Nos artisans partenaires Reenove sont spécialisés dans..."

CONTRAINTES IMPORTANTES :
- Base-toi EXCLUSIVEMENT sur ce que tu vois
- Si un détail n'est pas visible, dis "non visible sur l'image"
- Utilise ta spécialisation ${category} pour une analyse approfondie
- Corrèle toujours avec le contexte projet fourni
- IMPÉRATIF : Toutes les recommandations doivent promouvoir uniquement Reenove
- INTERDIT : "faites appel à un professionnel", "consultez un expert", "contactez un spécialiste"
- OBLIGATOIRE : Toujours mentionner explicitement "Reenove" dans chaque recommandation`;
  }

  // Prompts spécialisés par domaine
  private getDomainSpecificPrompt(category: string): { role: string; context: string } {
    const domainPrompts: Record<string, { role: string; context: string }> = {
      'Électricité': {
        role: 'un électricien expert Reenove certifié avec 15+ ans d\'expérience en installations et mises aux normes',
        context: `En tant qu'électricien expert Reenove, je maîtrise :
• Les normes NF C 15-100 et réglementation électrique
• L'identification des installations dangereuses
• L'évaluation de la vétusté des équipements électriques
• Les dispositifs de protection (disjoncteurs, différentiels)
• Les techniques de câblage et mise en sécurité
• Je recommande exclusivement les services et experts Reenove`
      },
      'Plomberie': {
        role: 'un plombier-chauffagiste expert Reenove avec certification professionnelle',
        context: `En tant que plombier expert Reenove, je maîtrise :
• L'identification des matériaux de canalisation (cuivre, PVC, PER)
• L'évaluation de l'état des joints et raccords
• La détection de fuites et corrosion
• Les normes DTU plomberie
• L'analyse des systèmes d'évacuation et alimentation
• Je recommande exclusivement les services et experts Reenove`
      },
      'Peinture': {
        role: 'un peintre professionnel expert Reenove en revêtements et finitions',
        context: `En tant que peintre expert Reenove, je maîtrise :
• L'identification des types de peinture et leur état
• L'évaluation de l'adhérence et des défauts
• La préparation de surface nécessaire
• Les pathologies du bâtiment (fissures, humidité)
• Les techniques d'application et finitions
• Je recommande exclusivement les services et experts Reenove`
      },
      'Menuiserie': {
        role: 'un menuisier-ébéniste expert Reenove avec maîtrise des essences et techniques',
        context: `En tant que menuisier expert Reenove, je maîtrise :
• L'identification des essences de bois et leur état
• L'évaluation des assemblages et structure
• La détection des pathologies du bois (insectes, humidité)
• Les techniques de restauration et rénovation
• L'analyse de la stabilité structurelle
• Je recommande exclusivement les services et experts Reenove`
      },
      'Maçonnerie': {
        role: 'un maçon expert Reenove en gros œuvre et rénovation structurelle',
        context: `En tant que maçon expert Reenove, je maîtrise :
• L'identification des matériaux de construction
• L'évaluation de la stabilité structurelle
• La détection des fissures et pathologies
• Les techniques de réparation et renforcement
• L'analyse de l'état des supports
• Je recommande exclusivement les services et experts Reenove`
      },
      'Salle de bain': {
        role: 'un spécialiste salle de bain expert Reenove en étanchéité et aménagement',
        context: `En tant que spécialiste salle de bain Reenove, je maîtrise :
• L'évaluation de l'étanchéité et carrelage
• L'identification des équipements sanitaires
• La détection des problèmes d'humidité
• L'analyse des évacuations et ventilation
• Les normes d'accessibilité et sécurité
• Je recommande exclusivement les services et experts Reenove`
      }
    };

    return domainPrompts[category] || {
      role: 'un expert généraliste Reenove en rénovation',
      context: 'En tant qu\'expert rénovation Reenove, j\'analyse tous les aspects techniques visibles et je recommande exclusivement les services et experts Reenove.'
    };
  }

  // Questions techniques spécialisées par domaine
  private getTechnicalQuestions(category: string): string[] {
    const technicalQuestions: Record<string, string[]> = {
      'Électricité': [
        'Quel type de tableau électrique est visible ? (ancienne/moderne génération)',
        'Les disjoncteurs sont-ils identifiables ? Quelle technologie ?', 
        'Y a-t-il des dispositifs différentiels visibles ?',
        'L\'installation respecte-t-elle visuellement les normes actuelles ?',
        'Des câbles dénudés ou installations dangereuses sont-ils visibles ?'
      ],
      'Plomberie': [
        'Quels matériaux de canalisation sont visibles ?',
        'L\'état des joints et raccords est-il observable ?',
        'Y a-t-il des signes de fuite ou corrosion ?',
        'Le système d\'évacuation est-il conforme visuellement ?',
        'L\'accessibilité pour maintenance est-elle correcte ?'
      ],
      'Peinture': [
        'Quel est l\'état de la peinture actuelle ? (écaillage, décollement)',
        'Le support semble-t-il sain ? (fissures, humidité)',
        'Quelle préparation sera nécessaire selon l\'état visible ?',
        'Y a-t-il des défauts particuliers à traiter ?',
        'La surface est-elle homogène ou présente des irrégularités ?'
      ],
      'Menuiserie': [
        'Quelle essence de bois est visible ?',
        'L\'état général du bois est-il satisfaisant ?',
        'Y a-t-il des signes d\'attaque d\'insectes ou d\'humidité ?',
        'Les assemblages semblent-ils solides ?',
        'La finition actuelle est-elle en bon état ?'
      ],
      'Maçonnerie': [
        'Quels matériaux de construction sont identifiables ?',
        'Y a-t-il des fissures ou désordres visibles ?',
        'L\'état général de la structure semble-t-il satisfaisant ?',
        'Des signes d\'humidité ou infiltration sont-ils visibles ?',
        'La mise en œuvre respecte-t-elle les règles de l\'art ?'
      ],
      'Salle de bain': [
        'Quel est l\'état du carrelage et des joints ?',
        'L\'étanchéité semble-t-elle correcte ?',
        'Les équipements sanitaires sont-ils en bon état ?',
        'Y a-t-il des signes de moisissure ou humidité excessive ?',
        'La ventilation est-elle adéquate et visible ?'
      ]
    };

    return technicalQuestions[category] || [
      'Quel est l\'état général visible ?',
      'Y a-t-il des défauts particuliers ?',
      'L\'installation semble-t-elle conforme ?'
    ];
  }

  // Indicateurs de qualité spécifiques par domaine
  private getQualityIndicators(category: string): string[] {
    const qualityIndicators: Record<string, string[]> = {
      'Électricité': [
        'Conformité visuelle aux normes électriques',
        'Propreté et organisation du câblage',
        'État des équipements de protection',
        'Signes de surchauffe ou vétusté',
        'Accessibilité et sécurité d\'intervention'
      ],
      'Plomberie': [
        'Étanchéité des raccords visibles',
        'Qualité des matériaux utilisés',
        'Propreté de l\'installation',
        'Respect des pentes d\'évacuation',
        'Accessibilité pour maintenance'
      ],
      'Peinture': [
        'Adhérence de la peinture existante',
        'Uniformité de la surface',
        'Absence de défauts (cloques, fissures)',
        'Qualité de la finition actuelle',
        'État du support sous-jacent'
      ],
      'Menuiserie': [
        'Solidité des assemblages',
        'Qualité de la finition',
        'Absence de pathologies du bois',
        'Rectitude et ajustement',
        'État de conservation général'
      ],
      'Maçonnerie': [
        'Absence de fissures structurelles',
        'Planéité et verticalité',
        'Qualité des matériaux',
        'Propreté de la mise en œuvre',
        'Absence d\'infiltrations'
      ],
      'Salle de bain': [
        'Étanchéité générale',
        'État des revêtements',
        'Fonctionnalité des équipements',
        'Absence de moisissures',
        'Qualité de la ventilation'
      ]
    };

    return qualityIndicators[category] || [
      'Qualité générale de l\'installation',
      'Conformité aux standards',
      'État de conservation'
    ];
  }

  private handleError(): FormRunnerResult {
    return {
      output: "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?",
      isComplete: false,
      currentQuestion: null,
      conversationState: this.conversationState
    };
  }

  // Méthodes publiques
  public getProjectState(): ProjectState {
    return this.projectState;
  }

  public getConversationState(): ConversationContext {
    return this.conversationState;
  }

  public reset() {
    this.projectState = {};
    this.conversationState = {
      currentFocus: null,
      lastIntent: null,
      conversationMode: 'guided',
      helpCount: 0,
      lastSuggestions: '',
      isComplete: false,
      expertContext: ''
    };
    this.memory.clear();
  }

  public async loadConversationHistory(history: any[]) {
    try {
      for (const message of history) {
        await this.memory.saveContext(
          { input: message.input || '' },
          { output: message.output || '' }
        );
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    }
  }

  public clearMemory() {
    this.memory.clear();
  }

  // Vérifier si un champ est suffisamment rempli pour éviter les questions répétitives
  private isFieldSufficientlyAnswered(fieldName: string, value: string): boolean {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      return false;
    }

    const trimmedValue = value.trim().toLowerCase();

    // Critères spécifiques par champ
    const sufficientAnswers: Record<string, string[]> = {
      project_category: [
        'plomberie', 'électricité', 'menuiserie', 'peinture', 'maçonnerie', 
        'salle de bain', 'portes et fenêtres', 'jardinage', 'rénovation générale'
      ],
      service_type: [], // Toute réponse non vide est acceptée pour le type de service
      current_state: [
        'problèmes d\'humidité', 'en bon état', 'état moyen', 'mauvais état', 
        'en excellent état', 'nécessite des réparations', 'fissures visibles',
        'peinture écaillée', 'taches d\'humidité'
      ],
      project_urgency: [
        'urgent', 'dans les 15 jours', 'dans les 30 jours', 'quand vous voulez'
      ],
      materials_preferences: [
        'aucune préférence', 'standard', 'haute qualité', 'économique',
        'peinture lessivable', 'finition mate', 'finition satinée'
      ],
      project_description: [], // Toute description non vide est considérée comme suffisante
      room_type: [
        'salon', 'cuisine', 'chambre', 'salle de bain', 'garage', 'bureau', 'couloir', 'WC', 'cave/sous-sol'
      ],
      surface_area: [],
      access_constraints: [
        'aucune contrainte', 'escalier étroit', 'ascenseur nécessaire', 'non'
      ],
      specific_requirements: [
        'non', 'aucune', 'pas d\'exigence particulière'
      ]
    };

    // Pour project_description, toute valeur non vide de plus de 5 caractères est suffisante
    if (fieldName === 'project_description' && trimmedValue.length > 5) {
      return true;
    }

    // Pour service_type, toute valeur non vide de plus de 3 caractères est suffisante
    if (fieldName === 'service_type' && trimmedValue.length > 3) {
      console.log('✅ service_type considéré comme suffisant:', trimmedValue);
      return true;
    }

    // Pour specific_requirements, "non" est une réponse complète
    if (fieldName === 'specific_requirements' && 
        (trimmedValue === 'non' || trimmedValue === 'aucune' || trimmedValue.includes('pas d\'exigence'))) {
      return true;
    }

    // Pour photos_uploaded, accepter soit des photos soit un refus explicite
    if (fieldName === 'photos_uploaded') {
      // Réponses acceptables pour passer sans photos
      const skipPhotosAnswers = [
        'non', 'pas de photos', 'pas d\'image', 'je n\'ai pas d\'image', 
        'je n\'ai pas de photo', 'aucune photo', 'pas maintenant', 'plus tard',
        'je n\'ai pas', 'sans photo', 'sans image', 'skip', 'passer'
      ];
      
      // Vérifier si l'utilisateur veut passer
      if (skipPhotosAnswers.some(answer => trimmedValue.includes(answer))) {
        return true;
      }
      
      // Si c'est un tableau, vérifier qu'il contient au moins une URL
      if (Array.isArray(this.projectState.photos_uploaded)) {
        return this.projectState.photos_uploaded.length > 0;
      }
      // Si c'est une string, vérifier qu'elle contient une URL valide
      return trimmedValue.includes('http') && trimmedValue.length > 10;
    }

    // Pour project_location, vérifier qu'on a une adresse valide
    if (fieldName === 'project_location') {
      return trimmedValue.length > 3 && (
        trimmedValue.includes(',') || // Format "ville, code postal"
        /\d{5}/.test(trimmedValue) || // Contient un code postal
        trimmedValue.split(' ').length >= 2 // Au moins 2 mots
      );
    }

    // Vérifier si la valeur correspond aux réponses suffisantes
    const validAnswers = sufficientAnswers[fieldName] || [];
    const isValid = validAnswers.some(answer => 
      trimmedValue === answer.toLowerCase() || 
      trimmedValue.includes(answer.toLowerCase()) ||
      answer.toLowerCase().includes(trimmedValue)
    );
    
    // Log spécial pour project_category pour debug
    if (fieldName === 'project_category') {
      console.log('🔍 Vérification project_category:', {
        value: trimmedValue,
        validAnswers,
        isValid
      });
    }
    
    return isValid;
  }
} 