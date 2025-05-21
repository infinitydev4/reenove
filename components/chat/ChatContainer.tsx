"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Bot, Send, ArrowLeft, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import LocationInput from "./LocationInput"
import ProjectSummary from "./ProjectSummary"
import PhotoUpload from "./PhotoUpload"
import ProjectDetailsForm, { ProjectDetails } from "./ProjectDetailsForm"

// Types pour les messages du chat
export type MessageType = "user" | "bot" | "system" | "location" | "selection" | "summary" | "photos" | "details"

export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
  options?: Array<{
    id: string
    label: string
    value: string
    icon?: React.ReactNode
  }>
  location?: {
    address: string
    city: string
    postalCode: string
  }
  selectedCategoryId?: string
  selectedServiceId?: string
  photos?: string[]
  projectDetails?: ProjectDetails
  estimatedPrice?: {
    min: number
    max: number
  }
}

// État du projet
export interface ProjectState {
  step: "category" | "location" | "details" | "photos" | "project_details" | "questions" | "summary" | "register"
  category?: {
    id: string
    name: string
  }
  service?: {
    id: string
    name: string
  }
  location?: {
    address: string
    city: string
    postalCode: string
  }
  details?: string
  title?: string
  photos?: string[]
  projectDetails?: ProjectDetails
  answers?: Record<string, string>
  estimatedPrice?: {
    min: number
    max: number
  }
}

export interface Category {
  id: string
  name: string
  description?: string
  icon?: string
}

export interface Service {
  id: string
  name: string
  description?: string
  categoryId: string
  category?: {
    id: string
    name: string
    icon?: string
  }
}

interface ChatContainerProps {
  onSaveProject?: (projectData: any) => Promise<void>
}

export default function ChatContainer({ onSaveProject }: ChatContainerProps) {
  const { theme } = useTheme()
  const isDarkTheme = theme === "light"
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [projectState, setProjectState] = useState<ProjectState>({ step: "category" })
  const [projectAccepted, setProjectAccepted] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  
  // États pour la localisation
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [showMap, setShowMap] = useState(false)
  
  // États pour les photos
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  
  // États pour les catégories et services
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, Service[]>>({})
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showHomeConfirm, setShowHomeConfirm] = useState(false)

  // Effet pour charger les catégories et services
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        // Charger les services qui incluent les informations de catégorie
        const servicesResponse = await fetch('/api/services')
        if (!servicesResponse.ok) {
          throw new Error('Erreur lors du chargement des services')
        }
        const servicesData = await servicesResponse.json()
        
        // Extraire les catégories uniques des services
        const uniqueCategories = new Map<string, Category>()
        servicesData.forEach((service: Service) => {
          if (service.category && !uniqueCategories.has(service.category.id)) {
            uniqueCategories.set(service.category.id, {
              id: service.category.id,
              name: service.category.name,
              icon: service.category.icon
            })
          }
        })
        
        // Convertir Map en tableau pour les catégories
        const categoriesArray = Array.from(uniqueCategories.values())
        
        // Organiser les services par catégorie
        const servicesByCat: Record<string, Service[]> = {}
        servicesData.forEach((service: Service) => {
          if (!servicesByCat[service.categoryId]) {
            servicesByCat[service.categoryId] = []
          }
          servicesByCat[service.categoryId].push(service)
        })
        
        setCategories(categoriesArray)
        setServices(servicesData)
        setServicesByCategory(servicesByCat)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setIsLoadingData(false)
      }
    }
    
    fetchData()
  }, [])

  // Effet pour initialiser le chat
  useEffect(() => {
    // Message de bienvenue
    const initialMessage: Message = {
      id: "welcome",
      type: "bot",
      content: "Bonjour ! Je suis votre assistant pour créer votre projet de rénovation. Pour commencer, quel type de travaux souhaitez-vous réaliser ?",
      timestamp: new Date(),
    }
    
    // Vérifier si les catégories sont chargées
    if (!isLoadingData && categories.length > 0) {
      // Préparer les options de catégorie
      const categoryOptions = categories.map(category => ({
        id: category.id,
        label: category.name,
        value: category.id,
      }))
      
      // Ajouter les options au message initial
      initialMessage.options = categoryOptions
    }
    
    setMessages([initialMessage])
    
    // Si les catégories ne sont pas encore chargées, attendre et mettre à jour le message
    if (isLoadingData || categories.length === 0) {
      const checkDataInterval = setInterval(() => {
        if (!isLoadingData && categories.length > 0) {
          clearInterval(checkDataInterval)
          
          // Préparer les options de catégorie
          const categoryOptions = categories.map(category => ({
            id: category.id,
            label: category.name,
            value: category.id,
          }))
          
          // Mettre à jour le message
          setMessages(prev => {
            const updatedMessages = [...prev]
            if (updatedMessages[0] && updatedMessages[0].id === "welcome") {
              updatedMessages[0].options = categoryOptions
            }
            return updatedMessages
          })
        }
      }, 500)
      
      return () => {
        clearInterval(checkDataInterval)
      }
    }
  }, [isLoadingData, categories])

  // Fonction pour faire défiler vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fonction pour mettre à jour les états de localisation
  const updateLocationState = (newAddress: string, newCity: string, newPostalCode: string) => {
    setAddress(newAddress)
    setCity(newCity)
    setPostalCode(newPostalCode)
    
    const valid = 
      newAddress.trim().length > 0 && 
      newCity.trim().length > 0 && 
      newPostalCode.trim().length === 5 && 
      /^\d{5}$/.test(newPostalCode)
    
    setShowMap(valid)
  }

  // Fonction pour gérer les photos uploadées
  const handlePhotosUploaded = (urls: string[]) => {
    setPhotoUrls(urls)
  }
  
  // Fonction pour envoyer les photos
  const handlePhotoSubmit = () => {
    // Ajouter un message avec les photos
    const photoMessage: Message = {
      id: `photos-${Date.now()}`,
      type: "photos",
      content: `${photoUrls.length} photo(s) ajoutée(s)`,
      timestamp: new Date(),
      photos: photoUrls
    }
    
    setMessages(prev => [...prev, photoMessage])
    
    // Mettre à jour l'état du projet
    setProjectState(prev => ({
      ...prev,
      step: "project_details",
      photos: photoUrls
    }))
    
    // Ajouter un message bot pour les détails du projet - avec un court délai pour l'animation
    setTimeout(() => {
      const detailsFormMessage: Message = {
        id: `project-details-ask-${Date.now()}`,
        type: "bot",
        content: "Merci ! Pour mieux comprendre votre projet, pourriez-vous me donner quelques informations complémentaires sur votre bien ?",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, detailsFormMessage])
      
      // Faire défiler vers le bas après l'ajout du message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }, 500)
  }
  
  // Fonction pour gérer la soumission des détails du projet
  const handleProjectDetailsSubmit = (details: ProjectDetails) => {
    // Ajouter un message avec les détails du projet
    const detailsMessage: Message = {
      id: `project-details-${Date.now()}`,
      type: "details",
      content: `Surface: ${details.surface}m² | Étage: ${details.floor === "0" ? "RDC" : `${details.floor} étage`} | État: ${details.condition}`,
      timestamp: new Date(),
      projectDetails: details
    }
    
    setMessages(prev => [...prev, detailsMessage])
    
    // Mettre à jour l'état du projet
    setProjectState(prev => ({
      ...prev,
      step: "location",
      projectDetails: details
    }))
    
    // Demander la localisation après un court délai
    setTimeout(() => {
      const locationMessage: Message = {
        id: `location-request-${Date.now()}`,
        type: "bot",
        content: "Maintenant, pouvez-vous indiquer l'adresse où se situe votre projet ?",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, locationMessage])
      
      // Faire défiler vers le bas après l'ajout du message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }, 500)
  }

  // Fonction pour envoyer la localisation
  const handleLocationSubmit = () => {
    if (!showMap) return

    // Ajouter un message avec la localisation
    const locationMessage: Message = {
      id: `location-${Date.now()}`,
      type: "location",
      content: `${address}, ${postalCode} ${city}`,
      timestamp: new Date(),
      location: {
        address,
        city,
        postalCode
      }
    }
    
    setMessages(prev => [...prev, locationMessage])
    
    // Mettre à jour l'état du projet
    setProjectState(prev => ({
      ...prev,
      step: "questions",
      location: {
        address,
        city,
        postalCode
      }
    }))
    
    // Simuler une analyse de l'IA
    setIsLoading(true)
    
    setTimeout(() => {
      setIsLoading(false)
      
      // Ajouter une question estimative
      const estimationMessage: Message = {
        id: `estimation-${Date.now()}`,
        type: "bot",
        content: "Selon les informations que vous m'avez fournies, je peux maintenant vous proposer une première estimation. Souhaitez-vous me donner d'autres précisions avant que je finalise mon analyse ?",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, estimationMessage])
    }, 2000)
  }

  // Fonction pour afficher les options de catégorie
  const displayCategoryOptions = () => {
    if (categories.length === 0) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: "system",
        content: "Impossible de charger les catégories. Veuillez réessayer ultérieurement.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }
    
    const categoryOptions = categories.map(category => ({
      id: category.id,
      label: category.name,
      value: category.id,
    }))
    
    const categoryMessage: Message = {
      id: `category-${Date.now()}`,
      type: "bot",
      content: "Merci pour cette information ! Maintenant, quelle catégorie de projet souhaitez-vous réaliser ?",
      timestamp: new Date(),
      options: categoryOptions
    }
    
    setMessages(prev => [...prev, categoryMessage])
  }

  // Fonction pour sélectionner une catégorie
  const handleCategorySelect = (categoryId: string) => {
    if (isLoadingData) {
      console.error('Les données ne sont pas encore chargées')
      return
    }
    
    const category = categories.find(c => c.id === categoryId)
    if (!category) {
      console.error('Erreur: Catégorie non trouvée')
      return
    }
    
    // Ajouter un message avec la catégorie sélectionnée
    const categoryMessage: Message = {
      id: `category-selection-${Date.now()}`,
      type: "selection",
      content: `Catégorie sélectionnée : ${category.name}`,
      timestamp: new Date(),
      selectedCategoryId: categoryId
    }
    
    setMessages(prev => [...prev, categoryMessage])
    
    // Mettre à jour l'état du projet
    setProjectState(prev => ({
      ...prev,
      category: {
        id: categoryId,
        name: category.name
      }
    }))
    
    // Ajouter un message bot pour demander le service
    setTimeout(() => {
      // Vérifier si la catégorie a des services
      const categoryServices = servicesByCategory[categoryId] || []
      
      if (categoryServices.length === 0) {
        console.error('Aucun service disponible pour cette catégorie:', categoryId)
        
        // Passer directement à l'étape des détails si pas de services
        setProjectState(prev => ({
          ...prev,
          step: "details"
        }))
        
        const detailsMessage: Message = {
          id: `details-${Date.now()}`,
          type: "bot",
          content: "Pourriez-vous me décrire plus en détail votre projet ? N'hésitez pas à être précis sur vos besoins, attentes et contraintes.",
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, detailsMessage])
        return
      }
      
      // Créer les options de service
      const serviceOptions = categoryServices.map(service => ({
        id: service.id,
        label: service.name,
        value: service.id,
      }))
      
      const serviceMessage: Message = {
        id: `service-${Date.now()}`,
        type: "bot",
        content: `Excellent ! Maintenant, quel type de service de ${category.name.toLowerCase()} recherchez-vous ?`,
        timestamp: new Date(),
        options: serviceOptions
      }
      
      setMessages(prev => [...prev, serviceMessage])
    }, 500)
  }

  // Fonction pour sélectionner un service
  const handleServiceSelect = (serviceId: string) => {
    if (isLoadingData || !projectState.category) {
      console.error('Erreur: Données non chargées ou pas de catégorie sélectionnée')
      return
    }
    
    const categoryServices = servicesByCategory[projectState.category.id] || []
    const service = categoryServices.find(s => s.id === serviceId)
    
    if (!service) {
      console.error('Erreur: Service non trouvé', serviceId)
      return
    }
    
    // Ajouter un message avec le service sélectionné
    const serviceMessage: Message = {
      id: `service-selection-${Date.now()}`,
      type: "selection",
      content: `Service sélectionné : ${service.name}`,
      timestamp: new Date(),
      selectedServiceId: serviceId
    }
    
    setMessages(prev => [...prev, serviceMessage])
    
    // Mettre à jour l'état du projet
    setProjectState(prev => ({
      ...prev,
      step: "details",
      service: {
        id: serviceId,
        name: service.name
      }
    }))
    
    // Ajouter un message bot pour demander les détails - avec un délai pour l'animation
    setTimeout(() => {
      const detailsMessage: Message = {
        id: `details-${Date.now()}`,
        type: "bot",
        content: "Pourriez-vous me décrire plus en détail votre projet ? N'hésitez pas à être précis sur vos besoins, attentes et contraintes.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, detailsMessage])
    }, 500)
  }

  // Fonction pour gérer les messages utilisateur
  const handleUserMessage = async (message: string = inputValue) => {
    if (!message.trim() || isLoading) return
    
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: message,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      // Construire l'historique des messages pour l'API
      const apiMessages = messages
        .filter(msg => msg.type === "user" || msg.type === "bot")
        .map(msg => ({
          role: msg.type === "user" ? "user" : "assistant",
          content: msg.content
        }))
      
      // Ajouter le message actuel de l'utilisateur
      apiMessages.push({
        role: "user",
        content: message
      })

      // Appel à l'API
      const response = await fetch("/api/ai-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          projectData: {
            step: projectState.step,
            location: projectState.location,
            category: projectState.category,
            service: projectState.service,
            details: projectState.step === "details" ? message : projectState.details,
            title: projectState.title
          }
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la communication avec l'API")
      }

      const data = await response.json()
      
      // Traiter selon l'étape actuelle
      if (projectState.step === "details") {
        // Mise à jour de l'état du projet avec les détails
        setProjectState(prev => ({
          ...prev,
          step: "photos",
          details: message,
          title: data.detectedTitle || `Projet de ${prev.service?.name.toLowerCase()} - ${prev.location?.city || ""}`,
          // Ne pas stocker l'estimation de prix à cette étape
        }))
        
        // Ajouter la réponse de l'IA (sans mention du prix) - avec un contenu simplifié
        // const botMessage: Message = {
        //   id: `bot-${Date.now()}`,
        //   type: "bot",
        //   // Supprimer toute mention de prix dans la réponse et simplifier
        //   content: "Pour changer votre " + (message.includes("robinet") ? "robinet" : "installation") + " de cuisine.",
        //   timestamp: new Date(),
        // }
        
        // setMessages(prev => [...prev, botMessage])
        
        // Demander des photos du projet après un court délai
        setTimeout(() => {
          const photoRequestMessage: Message = {
            id: `photos-request-${Date.now()}`,
            type: "bot",
            content: "Pourriez-vous ajouter des photos de votre projet pour nous aider à mieux comprendre vos besoins ?",
            timestamp: new Date()
          }
          
          setMessages(prev => [...prev, photoRequestMessage])
          
          // Faire défiler vers le bas après l'ajout du message
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
          }, 100)
        }, 500) // Réduit le délai pour éviter l'impression de deux messages distincts
      } else if (projectState.step === "questions") {
        // Mettre à jour les réponses
        setProjectState(prev => {
          const answers = prev.answers || {}
          const lastQuestionId = messages
            .filter(m => m.type === "bot" && m.options)
            .pop()?.options?.[0]?.value
          
          if (lastQuestionId) {
            answers[lastQuestionId] = message
          }
          
          return {
            ...prev,
            answers,
            // Stocker l'estimation de prix seulement à cette étape
            estimatedPrice: data.estimatedPrice || prev.estimatedPrice
          }
        })
        
        // Ajouter d'abord la réponse de l'IA
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: data.response,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, botMessage])
        
        // Vérifier si nous avons reçu une estimation de prix (soit dans cette réponse, soit déjà stockée)
        if (data.estimatedPrice || projectState.estimatedPrice) {
          // Une estimation a été fournie, générer le résumé après un court délai
          setTimeout(() => {
            // Mettre à jour l'état du projet
            setProjectState(prev => ({
              ...prev,
              step: "summary",
              estimatedPrice: data.estimatedPrice || prev.estimatedPrice
            }))
            
            // Puis ajouter le message de résumé
            const summaryMessage: Message = {
              id: `summary-${Date.now()}`,
              type: "summary",
              content: "Voici votre devis estimatif :",
              timestamp: new Date(),
              estimatedPrice: data.estimatedPrice || projectState.estimatedPrice
            }
            
            setMessages(prev => [...prev, summaryMessage])
            
            // Faire défiler vers le bas après l'ajout du message
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }, 100)
          }, 1000)
        }
      }
    } catch (error) {
      console.error("Erreur:", error)
      
      // Message d'erreur
      const errorMessage: Message = {
        id: `system-${Date.now()}`,
        type: "system",
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour sauvegarder le projet
  const saveProject = async () => {
    if (!projectState.location || !projectState.category || !projectState.service || !onSaveProject) return
    
    try {
      // Préparer les données du projet
      const projectData = {
        title: projectState.title,
        description: projectState.details || "",
        categoryId: projectState.category.id,
        serviceId: projectState.service.id,
        location: projectState.location.address,
        postalCode: projectState.location.postalCode,
        city: projectState.location.city,
        status: "PUBLISHED",
        budget: projectState.estimatedPrice ? 
          (projectState.estimatedPrice.min + projectState.estimatedPrice.max) / 2 : undefined,
        budgetMin: projectState.estimatedPrice?.min,
        budgetMax: projectState.estimatedPrice?.max,
      }
      
      await onSaveProject(projectData)
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du projet:", error)
    }
  }

  // Fonction pour gérer le clic sur "Prendre en charge ce projet"
  const handleProjectAccept = () => {
    console.log("Fonction handleProjectAccept appelée");
    setProjectAccepted(true);
    setProjectState(prev => ({
      ...prev,
      step: "register"
    }));
    
    // Ouvrir le drawer
    setIsDrawerOpen(true);
    
    // Ajouter un message système pour indiquer la transition
    const systemMessage: Message = {
      id: `system-${Date.now()}`,
      type: "system",
      content: "Veuillez vous inscrire ou vous connecter pour finaliser votre projet",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, systemMessage]);
    
    // Faire défiler vers le bas après l'ajout du message
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };
  
  // Fonction pour fermer le drawer
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Fonction pour gérer le retour à l'accueil
  const handleHomeClick = () => {
    if (projectState.step !== "category" && !showHomeConfirm) {
      // Si nous sommes au milieu d'un projet, demander confirmation
      setShowHomeConfirm(true)
      setTimeout(() => setShowHomeConfirm(false), 5000) // Masquer après 5 secondes
      return
    }
    
    // Si confirmation ou aucune progression, rediriger
    router.push("/")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, duration: 0.3 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex-1 flex flex-col w-full h-full overflow-hidden md:max-w-5xl md:mx-auto"
    >
      <Card className="flex-1 flex flex-col h-full w-full border-0 md:border shadow-none md:shadow-sm bg-background overflow-hidden rounded-none md:rounded-md">
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* En-tête du chat - Fixé en haut pour qu'il soit toujours visible */}
          <div className="py-3 px-4 border-b bg-[#0E261C] flex items-center sticky top-0 z-10">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-white p-2 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-white">Assistant Reenove</h3>
                <p className="text-xs text-muted-foreground">Toujours disponible pour vous aider</p>
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
          
          {/* Zone des messages - Ajustée pour une hauteur adaptative sur mobile */}
          <div 
            className={`flex-1 overflow-hidden ${isDrawerOpen ? "max-h-[5vh]" : ""}`} 
            style={{ 
              height: isDrawerOpen ? undefined : 'calc(100vh - 200px)',
              maxHeight: '100%' 
            }}
          >
            <ChatMessages 
              messages={messages} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef} 
              projectState={projectState}
              handleCategorySelect={handleCategorySelect}
              handleServiceSelect={handleServiceSelect}
              handleProjectAccept={handleProjectAccept}
            />
          </div>
          
          {/* Composant d'upload de photos (affiché uniquement à l'étape photos) */}
          {projectState.step === "photos" && (
            <div className="border-t border-white/10 bg-[#0E261C]/80 backdrop-blur-sm p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Ajoutez des photos de votre projet</h3>
              <PhotoUpload 
                onPhotosUploaded={handlePhotosUploaded} 
                maxPhotos={5} 
              />
              
              {photoUrls.length > 0 && (
                <Button 
                  onClick={handlePhotoSubmit} 
                  className="w-full mt-4 bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold"
                >
                  Continuer avec {photoUrls.length} photo{photoUrls.length > 1 ? "s" : ""}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}
          
          {/* Composant des détails du projet (affiché uniquement à l'étape project_details) */}
          {projectState.step === "project_details" && (
            <ProjectDetailsForm 
              onSubmit={handleProjectDetailsSubmit} 
              initialValues={projectState.projectDetails}
            />
          )}
          
          {/* Composant de saisie d'adresse (affiché uniquement à l'étape de localisation) */}
          {projectState.step === "location" && (
            <LocationInput 
              address={address}
              city={city}
              postalCode={postalCode}
              showMap={showMap}
              onAddressChange={(newAddress) => setAddress(newAddress)}
              onCityChange={(newCity) => setCity(newCity)}
              onPostalCodeChange={(newPostalCode) => setPostalCode(newPostalCode)}
              onLocationUpdate={updateLocationState}
              onSubmit={handleLocationSubmit}
            />
          )}
          
          {/* Drawer pour l'inscription (affiché uniquement après acceptation du projet) */}
          {projectState.step === "register" && (
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
                  projectState={projectState}
                  onSaveProject={saveProject}
                />
              </div>
            </motion.div>
          )}
          
          {/* Barre de saisie (non affichée à l'étape de localisation, summary ou register quand le drawer est ouvert) */}
          {projectState.step !== "location" && projectState.step !== "summary" && !(projectState.step === "register" && isDrawerOpen) && (
            <ChatInput 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onSend={handleUserMessage}
              disabled={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
} 