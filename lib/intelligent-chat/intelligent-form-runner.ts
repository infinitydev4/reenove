import { 
  ProjectState, 
  FieldConfig,
  getRequiredFieldsForCategory,
  getConditionalFields,
  isFieldRelevantForCategory
} from '@/lib/config/serviceFieldsConfig';
import { LangChainConversationService, ConversationContext } from '@/lib/services/langchainConversationService';

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
  currentQuestion?: FieldConfig | null
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

export class IntelligentFormRunner {
  private langChainService: LangChainConversationService;
  private projectState: ProjectState = {};
  private conversationState: ConversationState = {
    currentFocus: null,
    lastIntent: null,
    conversationMode: 'guided',
    helpCount: 0,
    lastSuggestions: '',
    isComplete: false,
    expertContext: ''
  };
  private conversationMemory: ChatMessage[] = [];

  constructor() {
    console.log('🚀 Initialisation IntelligentFormRunner avec LangChain');
    this.langChainService = new LangChainConversationService();
  }

  async processInput(input: string, photos?: string[]): Promise<FormRunnerResult> {
    console.log('🎯 === DÉBUT PROCESS INPUT EXPERT ===');
    console.log('📥 Input utilisateur:', input);
    console.log('📸 Photos fournies:', photos?.length || 0);
    console.log('🗂️ État projet actuel:', this.projectState);

    try {
      // Sauvegarder les photos si fournies (éviter les doublons)
      if (photos && photos.length > 0) {
        console.log('📸 Sauvegarde des photos dans le project state:', photos);
        const existingPhotos = this.projectState.photos_uploaded || [];
        const newPhotos = photos.filter(photo => !existingPhotos.includes(photo));
        
        if (newPhotos.length > 0) {
          this.projectState.photos_uploaded = [...existingPhotos, ...newPhotos];
          console.log('✅ Photos sauvegardées dans le project state (sans doublons)');
        } else {
          console.log('📸 Photos déjà présentes, aucune nouvelle photo ajoutée');
        }
      }

      // Mettre à jour le contexte conversation
      this.conversationState.expertContext = this.updateExpertContext(this.projectState.project_category);
      
      console.log('💭 Contexte conversation:', this.conversationState);
      console.log('📸 Photos sauvegardées dans l\'état projet');

      // Si c'est le début, initialiser la conversation
      if (Object.keys(this.projectState).length === 0 && !input) {
        console.log('🏁 Initialisation de la conversation experte');
        return this.startExpertConversation();
      }

      // Traiter avec LangChain
      const result = await this.langChainService.processUserInput(input, this.conversationState);
      
      // Synchroniser les états MAIS préserver les photos existantes
      const langChainState = this.langChainService.getProjectState();
      
      // Préserver les photos si elles existent déjà dans notre state
      if (Array.isArray(this.projectState.photos_uploaded) && this.projectState.photos_uploaded.length > 0) {
        langChainState.photos_uploaded = this.projectState.photos_uploaded;
        console.log('📸 Conservation des photos lors de la synchronisation:', this.projectState.photos_uploaded);
      }
      
      this.projectState = { ...this.projectState, ...langChainState };
      this.conversationState = result.conversationState;

      console.log('✅ Résultat traitement:', {
        output: result.output.substring(0, 100) + '...',
        isComplete: result.isComplete,
        currentQuestion: result.currentQuestion?.id || 'none'
      });
      console.log('🎯 === FIN PROCESS INPUT EXPERT ===');

      return result;
      
    } catch (error) {
      console.error('❌ Erreur processInput expert:', error);
      return this.handleError();
    }
  }

  private updateExpertContext(category?: string): string {
    if (!category) return '';
    
    const expertContexts: Record<string, string> = {
      'Plomberie': 'Expert en installations sanitaires : robinetterie, canalisations, réparations.\n    Questions clés : type d\'intervention, urgence, accessibilité, normes.',
      'Électricité': 'Expert en installations électriques : prises, éclairage, tableaux, mise aux normes.\n    Questions clés : installation existante, normes, puissance nécessaire, sécurité.',
      'Menuiserie': 'Expert en travail du bois : meubles, parquets, escaliers, structures.\n    Questions clés : essence de bois, finitions, contraintes techniques, sur-mesure.',
      'Peinture': 'Expert en revêtements et finitions : peinture, papier peint, enduits.\n    Questions clés : surface, préparation, type de peinture, finition souhaitée.',
      'Maçonnerie': 'Expert en gros œuvre : murs, cloisons, fondations, rénovation structurelle.\n    Questions clés : type de travaux, contraintes structurelles, matériaux, réglementation.',
      'Salle de bain': 'Expert en rénovation de salles de bain : aménagement, plomberie, carrelage.\n    Questions clés : configuration, équipements, étanchéité, évacuations.',
      'Portes et fenêtres': 'Expert en menuiserie d\'ouverture : pose, rénovation, isolation.\n    Questions clés : matériaux, dimensions, isolation, sécurité.',
      'Jardinage': 'Expert en espaces verts : aménagement, plantation, entretien.\n    Questions clés : surface, exposition, type de sol, végétation souhaitée.',
      'Rénovation générale': 'Expert en rénovation complète : coordination, planning, budget global.\n    Questions clés : étendue des travaux, priorités, contraintes, délais.'
    };

    return expertContexts[category] || expertContexts['Rénovation générale'];
  }

  private async startExpertConversation(): Promise<FormRunnerResult> {
    console.log('🏁 Démarrage conversation experte');
    
    const welcomeMessage = "Bonjour ! Je suis votre expert Reenove spécialisé en devis de rénovation. Je vais vous accompagner pour créer un devis personnalisé et précis. Commençons par identifier votre projet.";
    
    // Initialiser le service LangChain
    await this.langChainService.initialize(this.conversationState);
    
    // Définir le premier focus sur la catégorie
    this.conversationState.currentFocus = 'project_category';
    
    // Générer les options de catégorie
    const categoryOptions = this.generateCategoryOptions();
    
    // Créer un FieldConfig compatible pour project_category
    const categoryFieldConfig: FieldConfig = {
      id: 'project_category',
      displayName: 'Catégorie du projet',
      type: 'select',
      required: true,
      question: 'Dans quel domaine se situe votre projet de rénovation ?',
      helpPrompt: 'Identifiez le domaine principal de votre projet',
      options: categoryOptions
    };
    
    return {
      output: welcomeMessage,
      isComplete: false,
      currentQuestion: categoryFieldConfig,
      conversationState: this.conversationState,
      options: categoryOptions
    };
  }

  private generateCategoryOptions(): Array<{ id: string; label: string; value: string }> {
    const categories = [
      'Plomberie', 'Électricité', 'Menuiserie', 'Peinture', 
      'Maçonnerie', 'Salle de bain', 'Portes et fenêtres', 
      'Jardinage', 'Rénovation générale'
    ];
    
    return categories.map(cat => ({
      id: cat.toLowerCase().replace(/\s+/g, '_'),
      label: cat,
      value: cat
    }));
  }

  private handleError(): FormRunnerResult {
    return {
      output: "Désolé, une erreur s'est produite. Pouvez-vous réessayer ?",
      isComplete: false,
      currentQuestion: null,
      conversationState: this.conversationState
    };
  }

  // Méthodes publiques pour compatibilité
  public getProjectState(): ProjectState {
    return { ...this.projectState, ...this.langChainService.getProjectState() };
  }

  public getConversationState(): ConversationState {
    return this.conversationState;
  }

  public reset() {
    console.log('🔄 Reset IntelligentFormRunner');
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
    this.conversationMemory = [];
    this.langChainService.reset();
  }

  public async loadConversationHistory(history: ChatMessage[]) {
    this.conversationMemory = history;
    // Convertir l'historique pour LangChain
    const langChainHistory = history.map(msg => ({
      input: msg.type === 'user' ? msg.content : '',
      output: msg.type === 'bot' ? msg.content : ''
    })).filter(item => item.input || item.output);
    
    await this.langChainService.loadConversationHistory(langChainHistory);
  }

  public clearMemory() {
    this.conversationMemory = [];
    this.langChainService.clearMemory();
  }


} 