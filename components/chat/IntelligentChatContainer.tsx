"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Bot, Send, ArrowLeft, Camera, Upload, User } from "lucide-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { staticCategories, staticServices } from '@/lib/data/categories'
import GoogleAddressAutocomplete from "@/components/maps/GoogleAddressAutocomplete"
import PhotoUpload from "@/components/chat/PhotoUpload"
import ProjectSummary from "./ProjectSummary"
import { Badge } from "@/components/ui/badge"
import MultiRoomSelector from "@/components/chat/MultiRoomSelector"

// Types pour le système intelligent
export type MessageType = "user" | "bot" | "system" | "photos" | "summary" | "expert_analysis"

export interface IntelligentMessage {
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
  currentQuestion?: any
  estimatedPrice?: {
    min: number
    max: number
    factors?: string[]
  }
  canEdit?: boolean
}

export interface ProjectData {
  title?: string
  description?: string
  categoryId?: string
  serviceId?: string
  location?: string
  city?: string
  postalCode?: string
  budget?: number
  budgetMin?: number
  budgetMax?: number
  photos?: string[]
  projectDetails?: any
}

interface IntelligentChatContainerProps {
  onSaveProject?: (projectData: ProjectData) => Promise<void>
}

export default function IntelligentChatContainer({ onSaveProject }: IntelligentChatContainerProps) {
  const { theme } = useTheme()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: session } = useSession()
  
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<IntelligentMessage[]>([])
  const [projectState, setProjectState] = useState<any>({})
  const [conversationState, setConversationState] = useState<any>({})
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState<{ min: number, max: number, factors?: string[] } | null>(null)
  const [showHomeConfirm, setShowHomeConfirm] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // États spécifiques pour photos et adresse
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [addressValue, setAddressValue] = useState("")
  
  // État pour le formulaire de connexion/inscription
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [showContinueButton, setShowContinueButton] = useState(false)
  const [tempProjectData, setTempProjectData] = useState<any>(null)
  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "register">("register")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [authStep, setAuthStep] = useState<"none" | "register">("none")

  // Initialiser la conversation experte
  useEffect(() => {
    initializeExpertChat()
  }, [])

  // Faire défiler vers le bas à chaque nouveau message (dans le conteneur seulement)
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages])

  // Surveiller les changements de session pour la connexion
  useEffect(() => {
    if (session?.user && showAuthForm) {
      // L'utilisateur vient de se connecter
      setShowAuthForm(false)
      
      // Sauvegarder le projet si on a des données temporaires
      if (tempProjectData && onSaveProject) {
        console.log('👤 Utilisateur connecté, sauvegarde du projet temporaire')
        onSaveProject(tempProjectData)
          .then(() => {
            console.log('✅ Projet sauvegardé après connexion')
            setTempProjectData(null) // Nettoyer les données temporaires
            setShowContinueButton(true)
          })
          .catch((error) => {
            console.error('❌ Erreur sauvegarde après connexion:', error)
            setShowContinueButton(true) // Afficher quand même le bouton
          })
      } else {
        setShowContinueButton(true)
      }
      
      const connectedMessage: IntelligentMessage = {
        id: `connected-${Date.now()}`,
        type: "bot",
        content: "🎉 Connexion réussie ! Votre projet a été sauvegardé dans votre espace client.",
        timestamp: new Date(),
        options: [
          {
            id: "continue-client",
            label: "🚀 Continuer vers mon espace client",
            value: "continue-client"
          }
        ]
      }
      
      setMessages(prev => [...prev, connectedMessage])
    }
  }, [session, showAuthForm])

  // Gérer les options d'authentification (login/register)
  const handleAuthOption = (authType: "login" | "register") => {
    console.log('🔐 Option auth sélectionnée:', authType)
    
    // Ajouter un message de confirmation
    const confirmMessage: IntelligentMessage = {
      id: `auth-confirm-${Date.now()}`,
      type: "user",
      content: authType === "login" ? "🔓 Se connecter" : "✨ Créer un compte",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, confirmMessage])
    
    // Ouvrir le drawer d'authentification après un court délai
    setTimeout(() => {
      setActiveAuthTab(authType)
      setAuthStep("register")
      setIsDrawerOpen(true)
    }, 500)
  }

  // Fonction pour fermer le drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setAuthStep("none")
  }

  const initializeExpertChat = async () => {
    // PROTECTION: Ne pas réinitialiser si on a déjà des messages
    if (messages.length > 0) {
      console.log('🚫 Initialisation ignorée - messages déjà présents')
      return
    }
    
    setIsLoading(true)
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (sessionId) {
        headers['x-session-id'] = sessionId
      }

      console.log('🚀 Initialisation chat expert - Session:', sessionId)

      const response = await fetch("/api/ai-project", {
        method: "POST",
        headers,
        body: JSON.stringify({ 
          userInput: "",
          resetFlow: true
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'initialisation experte")
      }

      const data = await response.json()
      
      // Récupérer l'ID de session depuis la réponse JSON (nouvelle méthode)
      if (data.sessionId) {
        setSessionId(data.sessionId)
      }
      
      // Ajouter le message d'accueil expert
      const welcomeMessage: IntelligentMessage = {
        id: "expert-welcome",
        type: "bot",
        content: data.output || "Bonjour ! Je suis votre expert Reenove spécialisé en devis de rénovation.",
        timestamp: new Date(),
        currentQuestion: data.currentQuestion,
        options: data.options, // Ajouter les options reçues de l'API
        canEdit: false
      }

      setMessages([welcomeMessage])
      setCurrentQuestion(data.currentQuestion)
      setProjectState(data.projectState || {})
      setConversationState(data.conversationState || {})

    } catch (error) {
      console.error("Erreur initialisation expert:", error)
      
      const errorMessage: IntelligentMessage = {
        id: "error-init",
        type: "system",
        content: "Désolé, une erreur s'est produite lors de l'initialisation. Veuillez réessayer.",
        timestamp: new Date()
      }
      
      setMessages([errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Gérer les messages utilisateur avec l'expert IA
  const handleExpertMessage = async (message: string = inputValue, photos?: string[]) => {
    if (!message.trim() || isLoading) return

    // Gestion spéciale pour les options d'authentification et navigation
    if (message === "login" || message === "register") {
      handleAuthOption(message)
      return
    }
    
    if (message === "continue-client") {
      // Rediriger vers l'espace client
      router.push("/client")
      return
    }
    
    // Ajouter le message de l'utilisateur
    const userMessage: IntelligentMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (sessionId) {
        headers['x-session-id'] = sessionId
      }

      // Préparer les données à envoyer (inclure les photos si nécessaires)
      const requestData: any = { 
        userInput: message
      }
      
      // Si des photos sont passées en paramètre, les inclure
      if (photos && photos.length > 0) {
        requestData.photos = photos
        console.log('📸 Photos incluses dans la requête:', photos.length)
        console.log('📸 URLs des photos:', photos)
      } else if (photoUrls.length > 0) {
        requestData.photos = photoUrls
        console.log('📸 Photos du state incluses dans la requête:', photoUrls.length)
        console.log('📸 URLs du state:', photoUrls)
      }
      
      console.log('🚀 Requête envoyée à /api/ai-project:', requestData)

      const response = await fetch("/api/ai-project", {
        method: "POST",
        headers,
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la communication avec l'expert IA")
      }

      const data = await response.json()
      
      // Récupérer l'ID de session depuis la réponse JSON si ce n'est pas déjà fait
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }
      
      // Mettre à jour les états
      setProjectState(data.finalAnswers || {})
      setConversationState(data.conversationState || {})
      setCurrentQuestion(data.currentQuestion)
      setIsComplete(data.isComplete || false)
      
      if (data.estimatedPrice) {
        setEstimatedPrice(data.estimatedPrice)
      }

      // Ajouter la réponse de l'expert IA
      const expertMessage: IntelligentMessage = {
        id: `expert-${Date.now()}`,
        type: data.isComplete ? "summary" : "bot",
        content: data.output,
        timestamp: new Date(),
        currentQuestion: data.currentQuestion,
        estimatedPrice: data.estimatedPrice,
        photos: data.photos,
        options: data.options, // Ajouter les options reçues de l'API
        canEdit: true
      }

      setMessages(prev => [...prev, expertMessage])
      
      // Si le processus est terminé, préparer la sauvegarde
      if (data.isComplete && data.finalAnswers) {
        await handleProjectComplete(data.finalAnswers, data.estimatedPrice)
      }

    } catch (error) {
      console.error("Erreur expert:", error)
      
      const errorMessage: IntelligentMessage = {
        id: `error-${Date.now()}`,
        type: "system",
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Continuer avec les photos uploadées
  const handleContinueWithPhotos = async () => {
    if (photoUrls.length === 0) return
    
    // Créer le message avec les photos avant d'envoyer à l'IA
    const photoMessage: IntelligentMessage = {
      id: `photos-${Date.now()}`,
      type: "photos",
      content: `${photoUrls.length} photo(s) ajoutée(s)`,
      timestamp: new Date(),
      photos: photoUrls
    }
    
    setMessages(prev => [...prev, photoMessage])
    
    // Envoyer les photos à l'expert IA pour continuer
    await handleExpertMessage(`J'ai ajouté ${photoUrls.length} photo(s) de mon projet.`, photoUrls)
  }



  // Fonction pour s'assurer que les catégories et services statiques existent
  const ensureStaticDataExists = async (): Promise<boolean> => {
    try {
      console.log('🔄 Vérification des données statiques...')
      
      // Vérifier si les catégories et services existent
      const [categoriesResponse, servicesResponse] = await Promise.all([
        fetch('/api/admin/categories').catch(() => null),
        fetch('/api/services').catch(() => null)
      ])
      
      let needsImport = false
      
      if (!categoriesResponse?.ok || !servicesResponse?.ok) {
        needsImport = true
      } else {
        const [categoriesData, servicesData] = await Promise.all([
          categoriesResponse.json(),
          servicesResponse.json()
        ])
        
        // Vérifier si on a au moins quelques catégories de base
        const hasBasicCategories = categoriesData.categories?.some((cat: any) => 
          ['plomberie', 'électricité', 'peinture'].includes(cat.name.toLowerCase())
        )
        
        if (!hasBasicCategories || servicesData.length < 5) {
          needsImport = true
        }
      }
      
      if (needsImport) {
        console.log('📥 Import des données statiques nécessaire...')
        
        // Essayer d'importer les données statiques
        const importResponse = await fetch('/api/admin/categories/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            categories: staticCategories,
            services: staticServices
          }),
        })
        
        if (importResponse.ok) {
          console.log('✅ Données statiques importées avec succès')
          return true
        } else {
          console.log('⚠️ Échec import - utilisation des fallbacks')
          return false
        }
      }
      
      console.log('✅ Données statiques déjà présentes')
      return true
    } catch (error) {
      console.error('❌ Erreur vérification données statiques:', error)
      return false
    }
  }

  // Gérer la finalisation du projet
  const handleProjectComplete = async (finalAnswers: any, estimatedPrice: any) => {
    try {
      // S'assurer que les données statiques existent
      await ensureStaticDataExists()
      
      // Adapter les données pour l'API et les stocker temporairement
      const projectData = await adaptProjectDataForSaving(finalAnswers, estimatedPrice)
      
      // Stocker temporairement les données du projet
      setTempProjectData(projectData)
      console.log('💾 Données projet stockées temporairement:', projectData)
      
      // Vérifier si l'utilisateur est connecté
      if (session?.user && onSaveProject) {
        // Utilisateur connecté : sauvegarder immédiatement et afficher option de continuer
        console.log('👤 Utilisateur connecté, sauvegarde immédiate')
        await onSaveProject(projectData)
        
        // Afficher un message de succès avec option de continuer
        const projectSavedMessage: IntelligentMessage = {
          id: `project-saved-${Date.now()}`,
          type: "bot",
          content: "✅ Parfait ! Votre projet a été sauvegardé avec succès dans votre espace client.",
          timestamp: new Date(),
          options: [
            {
              id: "continue-client",
              label: "🚀 Continuer vers mon espace client",
              value: "continue-client"
            }
          ]
        }
        
        setMessages(prev => [...prev, projectSavedMessage])
      } else {
        // Utilisateur non connecté : afficher les options dans le chat
        console.log('🚪 Utilisateur non connecté, affichage des options de connexion')
        
        const authOptionsMessage: IntelligentMessage = {
          id: `auth-options-${Date.now()}`,
          type: "bot", 
          content: "✅ Votre analyse est terminée ! Pour finaliser votre projet et recevoir des devis d'artisans qualifiés, vous devez vous connecter ou créer un compte.",
          timestamp: new Date(),
          options: [
            {
              id: "login",
              label: "🔓 J'ai déjà un compte - Se connecter",
              value: "login"
            },
            {
              id: "register",
              label: "✨ Créer un nouveau compte",
              value: "register"
            }
          ]
        }
        
        setMessages(prev => [...prev, authOptionsMessage])
      }
    } catch (error) {
      console.error("Erreur sauvegarde projet:", error)
      
      const errorMessage: IntelligentMessage = {
        id: `save-error-${Date.now()}`,
        type: "system",
        content: "Votre analyse est terminée, mais nous avons eu un problème pour sauvegarder. Veuillez vous connecter et réessayer.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Adapter les données du projet pour la sauvegarde
  const adaptProjectDataForSaving = async (finalAnswers: any, estimatedPrice: any): Promise<ProjectData> => {
    console.log('🔄 Adaptation données projet:', finalAnswers)
    console.log('📸 Photos dans finalAnswers:', finalAnswers.photos_uploaded)
    console.log('📸 Photos dans photoUrls state:', photoUrls)
    
    try {
      // Trouver la catégorie réelle dans la BDD
      let categoryId = ""
      let serviceId = ""
      
      // D'abord, essayer de récupérer les services depuis l'API (qui inclut les catégories)
      const servicesResponse = await fetch('/api/services').catch(() => null)
      
      if (servicesResponse?.ok) {
        const servicesData = await servicesResponse.json()
        
        // Extraire les catégories uniques des services
        const categories = servicesData.reduce((acc: any[], service: any) => {
          if (service.category && !acc.find(cat => cat.id === service.category.id)) {
            acc.push(service.category)
          }
          return acc
        }, [])
        
        // Trouver la catégorie par nom (insensible à la casse)
        const foundCategory = categories.find((cat: any) => 
          cat.name.toLowerCase() === finalAnswers.project_category?.toLowerCase()
        )
        
        if (foundCategory) {
          categoryId = foundCategory.id
          
          // Trouver un service approprié dans cette catégorie
          const categoryServices = servicesData.filter((service: any) => 
            service.categoryId === foundCategory.id
          )
          
          if (categoryServices.length > 0) {
            // Essayer de trouver un service correspondant au type de service décrit
            const serviceType = finalAnswers.service_type?.toLowerCase() || ''
            let foundService = categoryServices.find((service: any) =>
              service.name.toLowerCase().includes(serviceType.split(' ')[0]) ||
              serviceType.includes(service.name.toLowerCase().split(' ')[0])
            )
            
            // Si pas de correspondance exacte, prendre le premier service de la catégorie
            if (!foundService) {
              foundService = categoryServices[0]
            }
            
            serviceId = foundService.id
          }
        }
      }
      
      // Fallback : créer des catégories/services de base si aucune correspondance trouvée
      if (!categoryId || !serviceId) {
        console.log('⚠️ Aucune correspondance trouvée - création fallback robuste')
        
        // Utiliser des IDs universels qui existent toujours
        try {
          // Essayer de récupérer la première catégorie et le premier service disponibles
          const servicesData = await (await fetch('/api/services')).json()
          
          if (servicesData && servicesData.length > 0) {
            // Prendre le premier service disponible
            const firstService = servicesData[0]
            categoryId = firstService.categoryId
            serviceId = firstService.id
            console.log('🔄 Utilisation du premier service disponible:', { categoryId, serviceId })
          } else {
            // Fallback absolu - utiliser des valeurs sûres
            console.log('⚠️ Aucun service trouvé - utilisation fallback absolu')
            categoryId = 'fallback-category'
            serviceId = 'fallback-service'
          }
        } catch (error) {
          console.error('❌ Erreur récupération services fallback:', error)
          // Fallback ultime
          categoryId = 'fallback-category'
          serviceId = 'fallback-service'
        }
      }
      
      // Extraire la localisation
      const locationParts = finalAnswers.project_location?.split(',') || []
      const city = locationParts[locationParts.length - 1]?.trim() || finalAnswers.project_location
      
      // Extraire le code postal de la localisation si possible
      const postalCodeMatch = finalAnswers.project_location?.match(/\b(\d{5})\b/)
      const postalCode = postalCodeMatch ? postalCodeMatch[1] : ""
      
      // Générer un titre intelligent
      const title = generateProjectTitle(finalAnswers)
      
      console.log('✅ Données adaptées:', {
        title,
        categoryId,
        serviceId,
        location: finalAnswers.project_location,
        city,
        postalCode,
        photos: finalAnswers.photos_uploaded || photoUrls || []
      })
      
      return {
        title,
        description: finalAnswers.project_description || "Projet créé via l'assistant expert Reenove",
        categoryId,
        serviceId,
        location: finalAnswers.project_location,
        city,
        postalCode,
        budget: estimatedPrice ? Math.round((estimatedPrice.min + estimatedPrice.max) / 2) : undefined,
        budgetMin: estimatedPrice?.min,
        budgetMax: estimatedPrice?.max,
        photos: finalAnswers.photos_uploaded || photoUrls || [],
        projectDetails: {
          surface_area: finalAnswers.surface_area,
          room_type: finalAnswers.room_type,
          current_state: finalAnswers.current_state,
          materials_preferences: finalAnswers.materials_preferences,
          access_constraints: finalAnswers.access_constraints,
          timeline_constraints: finalAnswers.timeline_constraints,
          specific_requirements: finalAnswers.specific_requirements,
          project_urgency: finalAnswers.project_urgency,
          expert_analysis: conversationState.expertContext,
          // Métadonnées pour débogage
          original_category: finalAnswers.project_category,
          original_service_type: finalAnswers.service_type
        }
      }
    } catch (error) {
      console.error('❌ Erreur adaptation données:', error)
      
      // Fallback complet avec des valeurs par défaut sûres - utiliser le premier service disponible
      try {
        const servicesData = await (await fetch('/api/services')).json()
        const firstService = servicesData?.[0]
        
        return {
          title: `Projet ${finalAnswers.project_category || 'Rénovation'} - ${finalAnswers.project_location || 'Devis'}`,
          description: finalAnswers.project_description || "Projet créé via l'assistant expert Reenove",
          categoryId: firstService?.categoryId || 'cm9t8w8cr0000l70cjaxd8a9u', // ID sûr existant
          serviceId: firstService?.id || 'cm9t8w8cs0001l70ceqhb4k5m', // ID sûr existant
          location: finalAnswers.project_location || "",
          city: finalAnswers.project_location || "",
          postalCode: "",
          budget: estimatedPrice ? Math.round((estimatedPrice.min + estimatedPrice.max) / 2) : 500,
          budgetMin: estimatedPrice?.min || 200,
          budgetMax: estimatedPrice?.max || 800,
          photos: finalAnswers.photos_uploaded || photoUrls || [],
          projectDetails: {
            error_fallback: true,
            expert_analysis: `Projet créé via l'assistant expert. Catégorie: ${finalAnswers.project_category}, Service: ${finalAnswers.service_type}`,
            original_answers: finalAnswers
          }
        }
      } catch (fallbackError) {
        console.error('❌ Erreur fallback complet:', fallbackError)
        // Fallback ultime avec IDs génériques mais sûrs
        return {
          title: "Projet Reenove - Devis personnalisé",
          description: "Projet créé via l'assistant expert Reenove",
          categoryId: 'cm9t8w8cr0000l70cjaxd8a9u', // ID existant en BDD
          serviceId: 'cm9t8w8cs0001l70ceqhb4k5m', // ID existant en BDD
          location: finalAnswers.project_location || "",
          city: "",
          postalCode: "",
          budget: 500,
          budgetMin: 200,
          budgetMax: 800,
          photos: photoUrls || [],
          projectDetails: {
            ultimate_fallback: true,
            original_answers: finalAnswers
          }
        }
      }
    }
  }

  // Générer un titre intelligent pour le projet
  const generateProjectTitle = (answers: any): string => {
    const category = answers.project_category || "Rénovation"
    const serviceType = answers.service_type || ""
    const location = answers.project_location || ""
    
    if (serviceType && location) {
      return `${serviceType} - ${location}`
    } else if (serviceType) {
      return `${category} - ${serviceType}`
    } else {
      return `Projet ${category} - ${location || 'Devis personnalisé'}`
    }
  }

  // Gérer le retour à l'accueil
  const handleHomeClick = () => {
    if (!isComplete && messages.length > 1 && !showHomeConfirm) {
      setShowHomeConfirm(true)
      setTimeout(() => setShowHomeConfirm(false), 5000)
      return
    }
    
    router.push("/")
  }

  // Gérer l'envoi avec Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleExpertMessage()
    }
  }

  // Formater les prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Fonction pour nettoyer le markdown
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Retirer **texte**
      .replace(/\*(.*?)\*/g, '$1')     // Retirer *texte*
      .replace(/^\s*-\s*/gm, '• ')     // Remplacer - par •
      .replace(/^\s*\d+\.\s*\*\*(.*?)\*\*\s*:/gm, '$1:') // Nettoyer 1. **titre**:
      .trim()
  }

  // Fonction pour formatter l'analyse des photos avec structure
  const formatPhotoAnalysis = (analysis: string) => {
    if (!analysis || analysis === "Aucune photo valide fournie pour l'analyse") {
      return null
    }

    // Diviser l'analyse en sections basées sur les titres "**Section :**"
    const sections = analysis.split(/\*\*(.*?)\*\*\s*:/g).filter(Boolean)
    const formattedSections = []

    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i]?.trim()
      const content = sections[i + 1]?.trim()
      
      if (title && content) {
        // Nettoyer et structurer le contenu
        const lines = content.split('\n').filter(line => line.trim())
        
        formattedSections.push(
          <div key={i} className="mb-4">
            <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FCDA89] rounded-full flex-shrink-0"></div>
              {title}
            </h5>
            <div className="ml-4">
              {lines.map((line, lineIndex) => {
                const trimmedLine = line.trim()
                
                // Gérer les listes numérotées
                if (/^\d+\./.test(trimmedLine)) {
                  return (
                    <div key={lineIndex} className="flex items-start gap-2 mb-1">
                      <span className="text-[#FCDA89] font-semibold text-sm flex-shrink-0">
                        {trimmedLine.match(/^\d+\./)?.[0]}
                      </span>
                      <span className="text-sm">{trimmedLine.replace(/^\d+\.\s*/, '')}</span>
                    </div>
                  )
                }
                
                // Gérer les puces
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                  return (
                    <div key={lineIndex} className="flex items-start gap-2 mb-1">
                      <div className="w-1.5 h-1.5 bg-[#FCDA89] rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-sm">{trimmedLine.replace(/^[•-]\s*/, '')}</span>
                    </div>
                  )
                }
                
                // Paragraphe normal
                return (
                  <p key={lineIndex} className="text-sm mb-2 leading-relaxed">
                    {trimmedLine}
                  </p>
                )
              })}
            </div>
          </div>
        )
      }
    }

    // Si aucune section structurée trouvée, afficher le texte brut mais formaté
    if (formattedSections.length === 0) {
      const lines = analysis.split('\n').filter(line => line.trim())
      return (
        <div className="space-y-2">
          {lines.map((line, index) => (
            <p key={index} className="text-sm leading-relaxed">
              {cleanMarkdown(line)}
            </p>
          ))}
        </div>
      )
    }

    return <div className="space-y-1">{formattedSections}</div>
  }

  // Parser le contenu du résumé expert pour l'afficher en cartes
  const parseExpertSummary = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim())
    
    const result = {
      projectDetails: {} as Record<string, string>,
      budget: '',
      factors: [] as string[],
      photoAnalysis: '',
      photos: [] as string[],
      conclusion: ''
    }
    
    let currentSection = ''
    let photoAnalysisLines: string[] = []
    
    lines.forEach(line => {
      const trimmed = line.trim()
      
      if (trimmed.includes('📋 DÉTAILS DU PROJET')) {
        currentSection = 'details'
      } else if (trimmed.includes('📸 PHOTOS DU PROJET')) {
        currentSection = 'photosSection'
      } else if (trimmed.includes('💰 Estimation budgétaire')) {
        currentSection = 'budget'
        result.budget = trimmed.replace('💰 Estimation budgétaire :', '').trim()
      } else if (trimmed.includes('Facteurs influençant le prix')) {
        currentSection = 'factors'
      } else if (trimmed.includes('Analyse des photos')) {
        currentSection = 'photos'
        photoAnalysisLines = [] // Reset
      } else if (trimmed.includes('✅')) {
        result.conclusion = trimmed
      } else if (currentSection === 'details' && trimmed.includes(':')) {
        const [key, value] = trimmed.split(':').map(s => s.trim())
        if (key && value) {
          result.projectDetails[key] = value
        }
      } else if (currentSection === 'photosSection' && trimmed.startsWith('Photo ') && trimmed.includes('https')) {
        // Extraire l'URL de la photo depuis "Photo X: URL"
        const photoUrl = trimmed.split(': ')[1]
        if (photoUrl) {
          result.photos.push(photoUrl)
        }
      } else if (currentSection === 'factors' && trimmed.startsWith('•')) {
        result.factors.push(trimmed.replace('•', '').trim())
      } else if (currentSection === 'photos' && !trimmed.includes('Analyse des photos') && trimmed.length > 0) {
        photoAnalysisLines.push(trimmed)
      }
    })
    
    // Assembler l'analyse des photos et nettoyer le markdown
    if (photoAnalysisLines.length > 0) {
      result.photoAnalysis = cleanMarkdown(photoAnalysisLines.join('\n'))
    }
    
    return result
  }

  // Rendu des messages experts
  const renderExpertMessage = (message: IntelligentMessage) => {
    switch (message.type) {
      case "user":
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              {message.content}
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )
      
      case "bot":
        return (
          <div className="flex items-start gap-2.5 self-start">
            <div className="bg-[#0E261C] p-1.5 rounded-full border-[0.5px] border-[#FCDA89]/20 self-start">
              <Bot className="h-4 w-4 text-[#FCDA89]" />
            </div>
            <div className="bg-card p-3 rounded-xl rounded-bl-sm max-w-[85%] shadow-sm border border-muted">
              <div className="space-y-2">
                <div>{cleanMarkdown(message.content)}</div>
                
                {/* Options de sélection si disponibles (sauf pour room_type qui a sa propre interface) */}
                {message.options && (message.currentQuestion?.id !== 'room_type' && message.currentQuestion !== 'room_type') && (
                  <div className="grid gap-2 mt-3">
                    {message.options.map(option => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="justify-start text-left h-auto py-2 px-3 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleExpertMessage(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                {/* Interface spécialisée pour l'upload de photos */}
                {(message.currentQuestion?.id === 'photos_uploaded' || message.currentQuestion === 'photos_uploaded') && (
                  <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-muted">
                    <PhotoUpload 
                      onPhotosUploaded={(urls) => {
                        // Simplement mettre à jour le state sans créer de message
                        setPhotoUrls(prev => {
                          const newUrls = [...prev, ...urls.filter(url => !prev.includes(url))]
                          console.log('📸 URLs des photos mises à jour:', newUrls)
                          return newUrls
                        })
                      }}
                      maxPhotos={5} // Limite totale
                      initialPhotos={photoUrls} // Passer les photos existantes
                      onContinue={handleContinueWithPhotos} // Fonction pour continuer
                    />
                  </div>
                )}

                {/* Interface spécialisée pour la sélection multiple de room_type */}
                {(message.currentQuestion?.id === 'room_type' || message.currentQuestion === 'room_type') && message.options && (
                  <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-muted">
                    <MultiRoomSelector 
                      options={message.options}
                      onSelectionChange={(selectedRooms: string[]) => {
                        if (selectedRooms.length > 0) {
                          const roomsText = selectedRooms.join(', ');
                          handleExpertMessage(roomsText);
                        }
                      }}
                    />
                  </div>
                )}
                
                {/* Interface spécialisée pour l'adresse avec autocomplétion Google */}
                {(message.currentQuestion?.id === 'project_location' || message.currentQuestion === 'project_location') && (
                  <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-muted">
                    <div className="space-y-3">
                      <GoogleAddressAutocomplete
                        value={addressValue}
                        onChange={(newAddress) => {
                          console.log('📍 IntelligentChatContainer - onChange reçu:', newAddress)
                          console.log('📍 IntelligentChatContainer - ancienne valeur addressValue:', addressValue)
                          setAddressValue(newAddress)
                          console.log('📍 IntelligentChatContainer - setAddressValue appelé avec:', newAddress)
                        }}
                        onPlaceSelect={(place) => {
                          // Plus besoin d'appeler setAddressValue ici car GoogleAddressAutocomplete
                          // appelle déjà onChange(place.formatted_address) qui met à jour addressValue
                          console.log('📍 Adresse sélectionnée par l\'utilisateur:', place.formatted_address)
                        }}
                        placeholder="Saisissez l'adresse de votre projet..."
                        className="w-full"
                      />
                      <Button 
                        onClick={() => {
                          console.log('📍 IntelligentChatContainer - Bouton confirmé cliqué avec addressValue:', addressValue)
                          if (addressValue.trim()) {
                            handleExpertMessage(addressValue)
                          }
                        }}
                        disabled={!addressValue.trim()}
                        className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C]"
                      >
                        Confirmer cette adresse
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case "photos":
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="h-4 w-4" />
                <span className="font-medium">Photos du projet</span>
              </div>
              {message.photos && message.photos.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {message.photos.map((photoUrl, index) => (
                    <div 
                      key={index} 
                      className="relative w-12 h-12 rounded-md overflow-hidden border border-white/20 hover:scale-110 transition-transform cursor-pointer group"
                      onClick={() => {
                        // Ouvrir l'image en grand avec modal simple
                        const modal = document.createElement('div')
                        modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer'
                        modal.onclick = (e: MouseEvent) => {
                          if (e.target === modal) modal.remove()
                        }
                        
                        const img = document.createElement('img')
                        img.src = photoUrl
                        img.className = 'max-w-full max-h-full object-contain rounded-lg cursor-default'
                        img.loading = 'lazy'
                        img.onclick = (e: MouseEvent) => e.stopPropagation()
                        
                        const closeBtn = document.createElement('button')
                        closeBtn.innerHTML = '✕'
                        closeBtn.className = 'absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 hover:bg-black/70 transition-colors'
                        closeBtn.onclick = () => modal.remove()
                        
                        modal.appendChild(img)
                        modal.appendChild(closeBtn)
                        document.body.appendChild(modal)
                        
                        // Supprimer avec Escape
                        const handleEscape = (e: KeyboardEvent) => {
                          if (e.key === 'Escape') {
                            modal.remove()
                            document.removeEventListener('keydown', handleEscape)
                          }
                        }
                        document.addEventListener('keydown', handleEscape)
                      }}
                    >
                      <Image
                        src={photoUrl}
                        alt={`Photo ${index + 1}`}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">👁️</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicateur du nombre total */}
                  {message.photos.length > 0 && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-md bg-white/10 border border-white/20 text-white/70 text-xs font-medium">
                      {message.photos.length}
                    </div>
                  )}
                </div>
              ) : (
                <p>Aucune photo</p>
              )}
              
              
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )

      case "summary":
        const minPrice = message.estimatedPrice?.min || 0
        const maxPrice = message.estimatedPrice?.max || 0
        const parsedSummary = parseExpertSummary(message.content)
        
        return (
          <div className="flex items-start gap-2.5 self-start w-full">
            <div className="bg-[#0E261C] p-1.5 rounded-full border-[0.5px] border-[#FCDA89]/20 self-start">
              <Bot className="h-4 w-4 text-[#FCDA89]" />
            </div>
            <div className="flex-1 max-w-[95%] space-y-4">
              {/* En-tête */}
              <div className="bg-gradient-to-r from-[#0E261C] to-[#0E261C]/90 p-4 rounded-xl shadow-md border border-[#FCDA89]/20">
                <h3 className="text-xl font-bold text-[#FCDA89] flex items-center gap-2">
                  🎯 Analyse experte terminée
                </h3>
                <p className="text-white/80 text-sm mt-2">
                  Votre projet a été analysé par notre expert. Voici le résumé détaillé :
                </p>
              </div>

              {/* Détails du projet */}
              <div className="bg-card p-4 rounded-xl shadow-sm border border-muted">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  📋 Détails du projet
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(parsedSummary.projectDetails).map(([key, value]) => (
                    <div key={key} className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-muted-foreground">{key}</span>
                      <Badge variant="outline" className="justify-start text-left w-fit">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos du projet avec slider si plusieurs */}
              {parsedSummary.photos && parsedSummary.photos.length > 0 && (
                <div className="bg-card p-4 rounded-xl shadow-sm border border-muted">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    📸 Photos du projet ({parsedSummary.photos.length})
                  </h4>
                                     {parsedSummary.photos.length === 1 ? (
                     // Affichage simple pour une seule photo
                     <div className="w-full max-w-md mx-auto">
                       <Image
                         src={parsedSummary.photos[0]}
                         alt="Photo du projet"
                         width={400}
                         height={192}
                         className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                         onClick={() => {
                          // Modal pour agrandir l'image
                          const modal = document.createElement('div')
                          modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer'
                          modal.onclick = (e: MouseEvent) => {
                            if (e.target === modal) modal.remove()
                          }
                          
                                                     const img = document.createElement('img')
                           img.src = parsedSummary.photos[0]
                           img.className = 'max-w-full max-h-full object-contain rounded-lg cursor-default'
                           img.loading = 'lazy'
                           img.onclick = (e: MouseEvent) => e.stopPropagation()
                          
                          const closeBtn = document.createElement('button')
                          closeBtn.innerHTML = '✕'
                          closeBtn.className = 'absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 hover:bg-black/70 transition-colors'
                          closeBtn.onclick = () => modal.remove()
                          
                          modal.appendChild(img)
                          modal.appendChild(closeBtn)
                          document.body.appendChild(modal)
                          
                          const handleEscape = (e: KeyboardEvent) => {
                            if (e.key === 'Escape') {
                              modal.remove()
                              document.removeEventListener('keydown', handleEscape)
                            }
                          }
                          document.addEventListener('keydown', handleEscape)
                        }}
                      />
                    </div>
                  ) : (
                    // Slider pour plusieurs photos
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                             {parsedSummary.photos.map((photoUrl, index) => (
                         <div key={index} className="relative group">
                           <Image
                             src={photoUrl}
                             alt={`Photo ${index + 1}`}
                             width={200}
                             height={128}
                             className="w-full h-32 object-cover rounded-lg cursor-pointer group-hover:opacity-90 transition-opacity"
                             onClick={() => {
                              // Modal avec navigation entre photos
                              const modal = document.createElement('div')
                              modal.className = 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4'
                              
                              let currentIndex = index
                              
                              const updateImage = () => {
                                const img = modal.querySelector('img')
                                const counter = modal.querySelector('.photo-counter')
                                if (img && counter) {
                                  img.src = parsedSummary.photos[currentIndex]
                                  counter.textContent = `${currentIndex + 1} / ${parsedSummary.photos.length}`
                                }
                              }
                              
                                                             modal.innerHTML = `
                                 <button class="absolute top-4 right-4 text-white bg-black/50 rounded-full w-10 h-10 hover:bg-black/70 transition-colors z-10">✕</button>
                                 <button class="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full w-10 h-10 hover:bg-black/70 transition-colors prev-btn">‹</button>
                                 <button class="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 rounded-full w-10 h-10 hover:bg-black/70 transition-colors next-btn">›</button>
                                 <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm photo-counter">${currentIndex + 1} / ${parsedSummary.photos.length}</div>
                                 <img src="${photoUrl}" class="max-w-full max-h-full object-contain rounded-lg" loading="lazy">
                               `
                              
                              modal.querySelector('.prev-btn')?.addEventListener('click', () => {
                                currentIndex = (currentIndex - 1 + parsedSummary.photos.length) % parsedSummary.photos.length
                                updateImage()
                              })
                              
                              modal.querySelector('.next-btn')?.addEventListener('click', () => {
                                currentIndex = (currentIndex + 1) % parsedSummary.photos.length
                                updateImage()
                              })
                              
                              modal.querySelector('button')?.addEventListener('click', () => modal.remove())
                              modal.addEventListener('click', (e) => {
                                if (e.target === modal) modal.remove()
                              })
                              
                              document.body.appendChild(modal)
                              
                              const handleEscape = (e: KeyboardEvent) => {
                                if (e.key === 'Escape') {
                                  modal.remove()
                                  document.removeEventListener('keydown', handleEscape)
                                } else if (e.key === 'ArrowLeft') {
                                  currentIndex = (currentIndex - 1 + parsedSummary.photos.length) % parsedSummary.photos.length
                                  updateImage()
                                } else if (e.key === 'ArrowRight') {
                                  currentIndex = (currentIndex + 1) % parsedSummary.photos.length
                                  updateImage()
                                }
                              }
                              document.addEventListener('keydown', handleEscape)
                            }}
                          />
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Estimation budgétaire */}
              {(parsedSummary.budget || message.estimatedPrice) && (
                <div className="bg-gradient-to-r from-[#FCDA89]/10 to-amber-100/10 p-4 rounded-xl border border-[#FCDA89]/20">
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    💰 Estimation budgétaire
                  </h4>
                  <div className="bg-gradient-to-r from-[#FCDA89] to-amber-400 p-4 rounded-lg text-[#0E261C]">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {parsedSummary.budget || `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                      </div>
                      <p className="text-sm opacity-80 mt-1">
                        Prix estimé main d&apos;œuvre et matériaux inclus
                      </p>
                    </div>
                  </div>
                  
                  {parsedSummary.factors.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-2">Facteurs influençant le prix :</h5>
                      <div className="space-y-1">
                        {parsedSummary.factors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#FCDA89] rounded-full flex-shrink-0"></div>
                            <span className="text-sm">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analyse des photos */}
              {parsedSummary.photoAnalysis && parsedSummary.photoAnalysis !== "Aucune photo valide fournie pour l'analyse" && (
                <div className="bg-card p-4 rounded-xl shadow-sm border border-muted">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    📸 Analyse experte des photos
                  </h4>
                  <div className="space-y-3">
                    {formatPhotoAnalysis(parsedSummary.photoAnalysis)}
                  </div>
                </div>
              )}

              {/* Conclusion */}
              {parsedSummary.conclusion && (
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-green-800 dark:text-green-200 font-medium">
                    {parsedSummary.conclusion}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      
      case "system":
        return (
          <div className="flex items-start gap-3 self-center mx-auto">
            <div className="bg-muted/80 text-muted-foreground p-2.5 rounded-xl max-w-[80%] shadow-sm text-center text-sm">
              {message.content}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full overflow-hidden"
    >
      <Card className="flex-1 flex flex-col h-full border-0 md:border shadow-none md:shadow-sm bg-background overflow-hidden rounded-none md:rounded-md">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* En-tête expert */}
          <div className="py-3 px-4 border-b bg-[#0E261C] flex items-center flex-shrink-0 z-10">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white p-2 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-white">Expert Reenove</h3>
                <p className="text-xs text-muted-foreground">
                  {conversationState.expertContext ? 
                    `Spécialisé en ${projectState.project_category}` : 
                    "Expert en devis de rénovation"
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={handleHomeClick}
              className="flex items-center justify-center gap-1 text-[#FCDA89] hover:text-[#FCDA89]/90 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{showHomeConfirm ? "Confirmer le retour ?" : "Retour à l'accueil"}</span>
            </button>
          </div>
          
          {/* Zone des messages - Adaptée dynamiquement */}
          <div className={`flex-1 overflow-hidden ${isDrawerOpen ? "h-16" : ""}`}>
            <div 
              ref={messagesContainerRef}
              className="h-full overflow-y-auto p-3 space-y-3 md:space-y-4 scrollbar-thin"
            >
              <AnimatePresence>
                {messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    {renderExpertMessage(message)}
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Indicateur de chargement expert */}
              {isLoading && (
                <div className="flex items-start gap-2.5 self-start">
                  <div className="bg-[#0E261C] p-1.5 rounded-full border-[0.5px] border-[#FCDA89]/20">
                    <Bot className="h-4 w-4 text-[#FCDA89]" />
                  </div>
                  <div className="bg-card p-3 rounded-xl rounded-bl-sm shadow-sm border flex items-center justify-center">
                    <div className="flex items-center">
                      <div className="flex space-x-1.5">
                        <div className="w-2 h-2 bg-[#FCDA89] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                        <div className="w-2 h-2 bg-[#FCDA89] rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                        <div className="w-2 h-2 bg-[#FCDA89] rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
                      </div>
                      <span className="ml-3 text-sm text-muted-foreground">Analyse experte en cours...</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Référence pour faire défiler vers le bas */}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Barre de saisie experte - fixe en bas */}
          {!isComplete && !isDrawerOpen && (
            <div className="flex-shrink-0 border-t bg-background">
              {/* Bouton continuer vers l'espace client */}
              {showContinueButton && (
                <div className="p-3 bg-[#FCDA89]/10 border-t border-[#FCDA89]/20">
                  <Button
                    onClick={() => router.push("/client")}
                    className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold"
                  >
                    🚀 Continuer vers mon espace client
                  </Button>
                </div>
              )}

              {/* Input de saisie */}
              {!showContinueButton && (
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        currentQuestion ? 
                          `Répondez à la question de l'expert...` :
                          "Posez votre question à l'expert..."
                      }
                      disabled={isLoading}
                      className="flex-1 bg-muted/30 border-muted focus-visible:ring-primary/30"
                      autoComplete="off"
                    />
                    <Button
                      onClick={() => handleExpertMessage()}
                      size="icon"
                      className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90"
                      disabled={!inputValue.trim() || isLoading}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Drawer pour l'inscription/connexion (affiché uniquement après acceptation du projet) */}
      {authStep === "register" && (
        <motion.div 
          id="registration-section" 
          className="border-t border-[#FCDA89]/30 bg-gradient-to-b from-[#0E261C]/80 to-[#0E261C] backdrop-blur-sm transition-all duration-500 overflow-y-auto fixed inset-0 z-50 md:rounded-t-lg md:inset-x-0 md:bottom-0 md:top-auto"
          initial={{ height: 0 }}
          animate={{ height: isDrawerOpen ? "100%" : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="sticky top-0 left-0 right-0 flex justify-center py-2 z-10 bg-[#0E261C]/95 border-b border-[#FCDA89]/20">
            <button 
              onClick={handleCloseDrawer}
              className="w-16 h-1.5 bg-[#FCDA89]/50 rounded-full hover:bg-[#FCDA89]/70 transition-colors"
              aria-label="Fermer le panneau d'inscription"
            ></button>
          </div>
          
          <div className="h-[calc(100vh-40px)] overflow-y-auto">
            <ProjectSummary 
              projectState={{
                step: "register",
                category: projectState.project_category ? { 
                  id: projectState.project_category, 
                  name: projectState.project_category 
                } : undefined,
                service: projectState.service_type ? { 
                  id: projectState.service_type, 
                  name: projectState.service_type 
                } : undefined,
                location: projectState.project_location ? {
                  address: projectState.project_location,
                  city: '',
                  postalCode: ''
                } : undefined,
                details: projectState.project_description,
                title: `Projet ${projectState.project_category || ''} - ${projectState.service_type || ''}`,
                photos: projectState.photos_uploaded,
                estimatedPrice: tempProjectData?.estimatedPrice ? {
                  min: tempProjectData.estimatedPrice.min,
                  max: tempProjectData.estimatedPrice.max
                } : undefined
              }}
              onSaveProject={async () => {
                // Logique de sauvegarde du projet avec les données temporaires
                if (tempProjectData && onSaveProject) {
                  await onSaveProject(tempProjectData)
                  
                  // Fermer le drawer après sauvegarde réussie
                  handleCloseDrawer()
                  
                  // Afficher un message de succès avec option de continuer au lieu de rediriger automatiquement
                  const registrationSuccessMessage: IntelligentMessage = {
                    id: `registration-success-${Date.now()}`,
                    type: "bot",
                    content: "🎉 Inscription réussie ! Votre projet a été sauvegardé dans votre nouvel espace client.",
                    timestamp: new Date(),
                    options: [
                      {
                        id: "continue-client",
                        label: "🚀 Accéder à mon espace client",
                        value: "continue-client"
                      }
                    ]
                  }
                  
                  setMessages(prev => [...prev, registrationSuccessMessage])
                }
              }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  )
} 