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
  maxTokens: 1000,
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
- Maximum 2-3 phrases par réponse
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
- Reste professionnel mais chaleureux
- Utilise des phrases courtes et claires
- Si l'utilisateur semble hésiter, propose des exemples
- Confirme toujours la compréhension avant de passer à la suite
- Adapte ton ton selon l'urgence ou l'importance du projet

IMPORTANT : Ne jamais inventer ou supposer des informations. Toujours se baser sur les réponses de l'utilisateur.`;

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
    if (!this.useAI || !input) {
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
        if (missingRequired.length > 0) {
          console.log('➡️ ORDRE IMPOSÉ - prochain champ requis:', missingRequired[0]);
          return {
            action: 'ask_next',
            target_field: missingRequired[0],
            reasoning: 'Suivre l\'ordre strict des champs requis'
          };
        } else if (missingConditional.length > 0) {
          return {
            action: 'ask_next',
            target_field: missingConditional[0],
            reasoning: 'Focus sur prochain champ conditionnel'
          };
        } else {
          return {
            action: 'validate',
            target_field: null,
            reasoning: 'Toutes les informations collectées'
          };
        }
      }
    }

    // LOGIQUE DÉTERMINISTE : Toujours suivre l'ordre défini des champs
    if (missingRequired.length > 0) {
      console.log('➡️ ORDRE IMPOSÉ - prochain champ requis dans l\'ordre:', missingRequired[0]);
      return {
        action: 'ask_next',
        target_field: missingRequired[0],
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
      // Utiliser les options de la configuration si disponibles, sinon générer des suggestions
      const options = fieldConfig.options || this.generateFieldSuggestions(fieldName, category, serviceType);
      const output = fieldConfig.question || `Pouvez-vous me parler de ${fieldConfig.displayName} ?`;
      const finalOutput = options.length > 0 
        ? `${output}\n\n💡 Suggestions rapides :\nVous pouvez cliquer sur une option ci-dessous ou spécifier autre chose dans le champ de message si aucune suggestion ne correspond exactement.`
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
          contextualPrompt = `Pour un projet de ${category} (${serviceType}), 
          demande l'état actuel avec des exemples concrets selon le domaine.
          Pour Électricité: "fonctionne mais vétuste", "disjoncte souvent", "aux normes"
          Pour Plomberie: "fuit légèrement", "complètement cassé", "fonctionne bien"`;
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
          Pour Plomberie: "robinet/fuite", "canalisation", "pièce complète"`;
          break;
          
        default:
          contextualPrompt = `Demande des informations sur ${fieldConfig.displayName} pour le projet ${category}.`;
      }

      const prompt = `${contextualPrompt}

Contexte du projet jusqu'ici : 
${this.getProjectDescription()}

MISSION : Pose une question naturelle, encourageante avec des exemples concrets pour guider l'utilisateur.

RÈGLES :
- Maximum 2-3 phrases
- Toujours donner des exemples pertinents
- Ton professionnel mais chaleureux  
- Adapté au contexte ${category}
- Pas de formatage markdown

Génère UNIQUEMENT la question avec exemples.`;

      const result = await this.generateAIResponse(prompt);
      
      // Utiliser les options de la configuration si disponibles, sinon générer des suggestions
      const options = fieldConfig.options || this.generateFieldSuggestions(fieldName, category, serviceType);
      
      // Ajouter l'instruction pour les options
      const finalOutput = options.length > 0 
        ? `${result}\n\n💡 Suggestions rapides :\nVous pouvez cliquer sur une option ci-dessous ou spécifier autre chose dans le champ de message si aucune suggestion ne correspond exactement.`
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
      const options = fieldConfig.options || this.generateFieldSuggestions(fieldName, category, serviceType);
      const output = fieldConfig.question || `Pouvez-vous me parler de ${fieldConfig.displayName} ?`;
      const finalOutput = options.length > 0 
        ? `${output}\n\n💡 Suggestions rapides :\nVous pouvez cliquer sur une option ci-dessous ou spécifier autre chose dans le champ de message si aucune suggestion ne correspond exactement.`
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
        { id: 'general', label: '🏠 Rénovation générale', value: 'Rénovation générale' },
        { id: 'other', label: '❓ Autre', value: 'Autre' }
      ],
      service_type: this.getServiceTypeSuggestions(cleanCategory),
      project_description: this.getProjectDescriptionSuggestions(cleanCategory, cleanServiceType),
      room_type: [
        { id: 'salon', label: '🛋️ Salon', value: 'salon' },
        { id: 'cuisine', label: '🍳 Cuisine', value: 'cuisine' },
        { id: 'chambre', label: '🛏️ Chambre', value: 'chambre' },
        { id: 'salle_de_bain', label: '🚿 Salle de bain', value: 'salle de bain' },
        { id: 'garage', label: '🚗 Garage', value: 'garage' },
        { id: 'bureau', label: '💼 Bureau', value: 'bureau' },
        { id: 'couloir', label: '🚪 Couloir', value: 'couloir' },
        { id: 'wc', label: '🚽 WC', value: 'WC' },
        { id: 'cave', label: '🏠 Cave/Sous-sol', value: 'cave/sous-sol' }
      ],
      surface_area: [
        { id: 'petite', label: 'Moins de 10 m²', value: 'moins de 10 m²' },
        { id: 'moyenne', label: '10-20 m²', value: '10-20 m²' },
        { id: 'grande', label: '20-50 m²', value: '20-50 m²' },
        { id: 'tres_grande', label: 'Plus de 50 m²', value: 'plus de 50 m²' }
      ],
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
      ]
    };

    return serviceSuggestions[category];
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
      ]
    };

    return stateSuggestions[category] || [
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
      'Menuiserie': [
        { id: 'massif', label: '🪵 Bois massif', value: 'bois massif' },
        { id: 'agglomere', label: '📦 Aggloméré', value: 'aggloméré' },
        { id: 'mdf', label: '🔧 MDF', value: 'MDF' },
        { id: 'stratifie', label: '✨ Stratifié', value: 'stratifié' }
      ]
    };

    return materialSuggestions[category] || [
      { id: 'standard', label: '⭐ Standard', value: 'standard' },
      { id: 'qualite', label: '💎 Haute qualité', value: 'haute qualité' },
      { id: 'economique', label: '💰 Économique', value: 'économique' }
    ];
  }

  // Suggestions pour la description selon la catégorie et le service
  private getProjectDescriptionSuggestions(category: string, serviceType: string): Array<{ id: string; label: string; value: string }> {
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
      'Plomberie': [
        { id: 'fuite', label: '💧 Problème de fuite', value: 'J\'ai une fuite' },
        { id: 'robinet', label: '🚰 Changer robinet', value: 'Je veux changer le robinet' },
        { id: 'douche', label: '🚿 Installation douche', value: 'Je veux installer une douche' },
        { id: 'chauffage', label: '🔥 Problème chauffage', value: 'J\'ai un problème de chauffage' }
      ]
    };

    return descriptionSuggestions[category];
  }

  // Clarifier un champ
  private async clarifyField(fieldName: string, userInput: string): Promise<FormRunnerResult> {
    console.log('❓ Clarification pour:', fieldName, 'avec input:', userInput);
    
    const fieldConfig = getServiceFieldsConfig('default').find(f => f.id === fieldName);
    if (!fieldConfig) {
      return this.askNextLogicalQuestion();
    }

    const prompt = `L'utilisateur semble avoir besoin de clarification sur "${fieldConfig.displayName}".

Sa réponse : "${userInput}"

Aide-le en reformulant ou en donnant plus de contexte avec des exemples concrets si possible. Reste bref et naturel. 
IMPORTANT : Ne repose PAS la question technique, aide plutôt à comprendre ce qui est attendu.`;

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

    const prompt = `L'utilisateur a besoin d'aide pour "${fieldConfig.displayName}".

Contexte : ${fieldConfig.helpPrompt}
${fieldConfig.examples ? `Exemples disponibles : ${fieldConfig.examples.join(', ')}` : ''}

Propose 2-3 exemples concrets et demande s'il veut que tu l'aides davantage. Reste naturel et bref.`;

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
    
    const prompt = `L'utilisateur veut discuter librement. 

Son message : "${userInput}"
Contexte projet : ${this.getProjectDescription()}

Engage une conversation naturelle pour l'aider. Tu peux explorer ses idées, ses doutes, ses ambitions. Reste bref et encourageant.`;

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
    
    const missing = requiredFields.filter((fieldId: string) => !this.projectState[fieldId]);
    console.log('❌ Champs manquants:', missing);
    
    return missing;
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
    
    this.projectState[field] = cleanedValue;
    
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
      surface_area: [
        'moins de 10 m²', '10-20 m²', '20-50 m²', 'plus de 50 m²'
      ],
      room_type: [
        'salon', 'cuisine', 'chambre', 'salle de bain', 'garage', 'bureau', 'couloir', 'WC', 'cave/sous-sol'
      ],
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

    // Pour specific_requirements, "non" est une réponse complète
    if (fieldName === 'specific_requirements' && 
        (trimmedValue === 'non' || trimmedValue === 'aucune' || trimmedValue.includes('pas d\'exigence'))) {
      return true;
    }

    // Pour photos_uploaded, vérifier qu'on a au moins une photo
    if (fieldName === 'photos_uploaded') {
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
    return validAnswers.some(answer => 
      trimmedValue === answer.toLowerCase() || 
      trimmedValue.includes(answer.toLowerCase()) ||
      answer.toLowerCase().includes(trimmedValue)
    );
  }
} 