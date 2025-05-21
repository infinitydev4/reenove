"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  CheckCircle,
  Edit,
  Calendar,
  MapPin,
  ImageIcon,
  Pencil,
  FileText,
  CheckSquare,
  ArrowRight,
  InfoIcon,
  Loader2,
  Euro,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Construction,
  Bath,
  DoorOpen,
  Trees,
  Home,
  Briefcase,
  UserPlus,
  LogIn
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import GoogleMapComponent from "@/components/maps/GoogleMapComponent"
import { toast } from "@/components/ui/use-toast"

interface Project {
  category?: string
  title?: string
  service?: string
  description?: string
  propertyType?: string
  location?: {
    address?: string
    city?: string
    postalCode?: string
    region?: string
    accessibility?: string
  }
  schedule?: {
    startDate?: string
    urgency?: string
    flexibleDates?: boolean
    preferredTime?: string
  }
  budget?: {
    type: string
    amount: number
    maxAmount?: number
  }
  photos?: { id: string, name: string, preview: string }[]
}

// Fonction pour obtenir l'icône de la catégorie
const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return <Briefcase className="h-4 w-4 md:h-6 md:w-6 text-primary" />

  // Normaliser le nom de catégorie (supprimer les accents, mettre en minuscules)
  const normalizedName = categoryName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  switch (normalizedName) {
    case "plomberie":
      return <Wrench className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "electricite":
    case "électricité":
      return <Zap className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "menuiserie":
      return <Hammer className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "peinture":
      return <Paintbrush className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "maconnerie":
    case "maçonnerie":
      return <Construction className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "salle de bain":
      return <Bath className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "portes et fenetres":
    case "portes et fenêtres":
      return <DoorOpen className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "jardinage":
      return <Trees className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    case "renovation generale":
    case "rénovation générale":
      return <Home className="h-4 w-4 md:h-6 md:w-6 text-primary" />
    default:
      return <Briefcase className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  }
}

// Fonction pour obtenir l'icône du service
const getServiceIcon = (serviceName?: string) => {
  if (!serviceName) return <Wrench className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  
  // On pourrait étendre cette fonction avec une logique plus spécifique pour les services
  // Pour l'instant, on utilise une approche simple
  
  const normalizedService = serviceName.toLowerCase()
  
  if (normalizedService.includes("electricite") || normalizedService.includes("électricité"))
    return <Zap className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  if (normalizedService.includes("plomberie"))
    return <Wrench className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  if (normalizedService.includes("peinture"))
    return <Paintbrush className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  if (normalizedService.includes("menuiserie"))
    return <Hammer className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  if (normalizedService.includes("salle de bain"))
    return <Bath className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  if (normalizedService.includes("porte") || normalizedService.includes("fenetre") || normalizedService.includes("fenêtre"))
    return <DoorOpen className="h-4 w-4 md:h-6 md:w-6 text-primary" />
  
  // Par défaut on utilise l'icône d'outil
  return <Wrench className="h-4 w-4 md:h-6 md:w-6 text-primary" />
}

// Fonction pour récupérer les vraies URLs depuis les références
const retrieveImageUrls = (refs: string[]) => {
  if (!Array.isArray(refs)) return [];
  return refs.map(ref => {
    if (ref?.startsWith?.('session:')) {
      const key = ref.replace('session:', '');
      return sessionStorage.getItem(key) || '';
    }
    return ref;
  }).filter(Boolean);
};

export default function ReviewPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [project, setProject] = useState<Project>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectPhotos, setProjectPhotos] = useState<string[]>([])
  const [showAuthOptions, setShowAuthOptions] = useState(false)
  const [completionStatus, setCompletionStatus] = useState({
    category: false,
    details: false,
    budget: false,
    location: false,
    schedule: false,
    photos: false,
  })
  const [isFormComplete, setIsFormComplete] = useState(false)
  
  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
    // Récupérer toutes les données du localStorage
    const selectedCategory = localStorage.getItem("selectedCategory")
    const projectDetails = localStorage.getItem("projectDetails")
    const projectBudget = localStorage.getItem("projectBudget")
    const projectLocation = localStorage.getItem("projectLocation")
    const projectDate = localStorage.getItem("projectDate")
    
    console.log("Données brutes récupérées:", {
      selectedCategory,
      projectDetails,
      projectBudget,
      projectLocation,
      projectDate
    })
    
    const projectData: Project = {}
    
    // Traitement de la catégorie et du service (depuis projectDetails)
    if (projectDetails) {
      try {
        const details = JSON.parse(projectDetails)
        console.log("Détails du projet:", details)
        
        // Récupérer les informations générales du projet
        projectData.title = details.title || ""
        projectData.description = details.description || ""
        projectData.propertyType = details.propertyType || ""
        
        // Récupérer spécifiquement la catégorie et le service
        projectData.category = details.category || ""
        projectData.service = details.service || ""
        
        console.log("Catégorie extraite:", projectData.category)
        console.log("Service extrait:", projectData.service)
        
        // Vérifier si la catégorie et le service sont présents
        if (projectData.category && projectData.service) {
          console.log("Catégorie et service trouvés")
          setCompletionStatus(prev => ({ 
            ...prev, 
            category: true 
          }))
        }
        
        // Vérifier si les informations générales sont présentes
        if (projectData.title && projectData.description) {
          console.log("Informations générales trouvées")
          setCompletionStatus(prev => ({ 
            ...prev, 
            details: true 
          }))
        }
        
        // Traitement des photos à partir de projectDetails
        if (details.photos && Array.isArray(details.photos) && details.photos.length > 0) {
          console.log("Photos trouvées dans les détails:", details.photos);
          // Récupérer les vraies URLs depuis les références
          const photoUrls = retrieveImageUrls(details.photos);
          setProjectPhotos(photoUrls);
          
          // Formater les photos pour l'affichage dans project
          projectData.photos = photoUrls.map((url: string, index: number) => ({
            id: `photo-${index}`,
            name: `Photo ${index + 1}`,
            preview: url
          }));
          
          setCompletionStatus(prev => ({ ...prev, photos: true }))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des détails:", error)
      }
    }
    
    // Force l'état de catégorie si un artisan est sélectionné même sans projectDetails
    if (selectedCategory) {
      try {
        const categoryId = selectedCategory;
        console.log("ID de catégorie sélectionnée:", categoryId)
        
        // Si nous avons l'ID de la catégorie mais pas le nom, essayons de le récupérer
        if (!projectData.category) {
          // Tenter de faire correspondre l'ID avec le nom (cette partie est simulée car la liste des catégories n'est pas accessible ici)
          console.log("Tentative de récupération de la catégorie depuis l'ID:", categoryId)
          // Nous ne pouvons pas accéder à la liste des catégories ici, donc on utilise une solution de contournement
          setCompletionStatus(prev => ({ 
            ...prev, 
            category: true 
          }))
        }
      } catch (error) {
        console.error("Erreur lors du traitement de la catégorie:", error)
      }
    }
    
    // Traitement de la localisation
    if (projectLocation) {
      try {
        projectData.location = JSON.parse(projectLocation)
        console.log("Localisation du projet:", projectData.location)
        if (projectData.location?.address && projectData.location?.city && projectData.location?.postalCode) {
          setCompletionStatus(prev => ({ ...prev, location: true }))
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la localisation:", error)
      }
    }
    
    // Traitement des dates et de la planification
    if (projectDate) {
      try {
        const dateData = JSON.parse(projectDate)
        console.log("Données de date:", dateData)
        projectData.schedule = {
          startDate: dateData.startDate,
          urgency: dateData.urgency,
          flexibleDates: dateData.timeFrame === "flexible",
          preferredTime: dateData.preferredTime || "any"
        }
        
        if (dateData.startDate) {
          setCompletionStatus(prev => ({ ...prev, schedule: true }))
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la planification:", error)
      }
    }
    
    // Traitement du budget
    if (projectBudget) {
      try {
        const budgetData = JSON.parse(projectBudget)
        console.log("Données du budget:", budgetData)
        
        projectData.budget = {
          type: budgetData.budgetType || "fixed",
          amount: budgetData.budget || 0,
          maxAmount: budgetData.budgetMax || undefined
        }
        
        if (budgetData.budget && budgetData.budget > 0) {
          setCompletionStatus(prev => ({ ...prev, budget: true }))
        }
      } catch (error) {
        console.error("Erreur lors du chargement du budget:", error)
      }
    }
    
    console.log("Données du projet finales:", projectData)
    console.log("État de complétion initial:", completionStatus)
    setProject(projectData)
  }, [])
  
  useEffect(() => {
    // Vérifier si toutes les sections obligatoires sont complètes
    const checkCompletionStatus = () => {
      const isComplete = 
        completionStatus.category && 
        completionStatus.details && 
        completionStatus.budget && 
        completionStatus.location && 
        completionStatus.schedule;
      
      setIsFormComplete(isComplete);
    };
    
    checkCompletionStatus();
  }, [completionStatus]);
  
  const handleSubmit = async () => {
    // Vérification si l'utilisateur est connecté
    if (status !== "authenticated") {
      // Afficher les options d'authentification
      setShowAuthOptions(true)
      return
    }
    
    setIsSubmitting(true)
    
    // Simulation d'une soumission de projet (à remplacer par votre API)
    try {
      // Attendre 2 secondes pour simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirection vers la page de succès
      router.push("/create-project/success")
    } catch (error) {
      console.error("Erreur lors de la soumission du projet:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission de votre projet. Veuillez réessayer."
      })
      setIsSubmitting(false)
    }
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie"
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr })
    } catch (error) {
      console.error("Erreur de format de date:", error, dateString)
      return "Date invalide"
    }
  }
  
  const convertUrgencyLevel = (urgency?: string): string => {
    // Conversion des valeurs de l'interface vers les valeurs enum de Prisma
    switch (urgency?.toLowerCase()) {
      case 'low':
      case 'normal':
        return 'NORMAL' // Dans les 30 jours
      case 'high':
        return 'SOON'   // Dans les 15 jours
      case 'urgent':
        return 'URGENT' // Dans les 7 jours
      default:
        return 'NORMAL' // Valeur par défaut
    }
  }
  
  return (
    <form 
      id="project-form" 
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className={`space-y-2 md:space-y-6 transition-opacity duration-500 px-0 sm:px-4 max-w-full ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-lg md:text-2xl font-semibold">Récapitulatif du projet</h2>
        <p className="text-xs md:text-base text-muted-foreground">
          Vérifiez les informations avant publication
        </p>
      </div>

      {!completionStatus.category && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-700/30">
          <CardContent className="p-2 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center gap-1 md:gap-2">
                <InfoIcon className="h-4 w-4 md:h-5 md:w-5 text-amber-600 shrink-0" />
                <p className="text-xs md:text-sm text-amber-800 dark:text-amber-400 font-medium">
                  Choisissez une catégorie pour votre projet
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8"
                onClick={() => router.push("/create-project/category")}
              >
                Choisir maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-2 md:gap-6 max-w-full">
        <Accordion type="single" collapsible className="w-full" defaultValue="category">
          <AccordionItem value="category" className="border-b">
            <AccordionTrigger 
              className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center">
                <div className={`mr-1 md:mr-2 p-1 rounded-full ${
                  completionStatus.category 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                    : "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {completionStatus.category ? <CheckCircle className="h-3 w-3 md:h-5 md:w-5" /> : <InfoIcon className="h-3 w-3 md:h-5 md:w-5" />}
                </div>
                <span>Catégorie et Service</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="w-full max-w-full">
                <CardContent className="pt-2 px-2 overflow-hidden w-full relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/create-project/category");
                    }}
                    type="button"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-center bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors rounded-lg p-3 md:p-4">
                      <div className="mr-3 md:mr-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full flex-shrink-0">
                        {getCategoryIcon(project.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs uppercase font-medium text-primary/80">Catégorie</p>
                        <p className="text-xs md:text-base font-medium break-words">{project.category || "Non spécifiée"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center bg-primary/5 dark:bg-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors rounded-lg p-3 md:p-4">
                      <div className="mr-3 md:mr-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full flex-shrink-0">
                        {getServiceIcon(project.service)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs uppercase font-medium text-primary/80">Service</p>
                        <p className="text-xs md:text-base font-medium break-words">{project.service || "Non spécifié"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="details" className="border-b">
            <AccordionTrigger 
              className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center">
                <div className={`mr-1 md:mr-2 p-1 rounded-full ${
                  completionStatus.details 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                    : "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {completionStatus.details ? <CheckCircle className="h-3 w-3 md:h-5 md:w-5" /> : <InfoIcon className="h-3 w-3 md:h-5 md:w-5" />}
                </div>
                <span>Informations générales</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="w-full max-w-full">
                <CardContent className="pt-2 md:pt-6 px-2 md:px-6 overflow-hidden w-full relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/create-project/details");
                    }}
                    type="button"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 w-full">
                    <div className="md:col-span-2">
                      <p className="text-[10px] md:text-sm text-muted-foreground">Titre du projet</p>
                      <p className="text-xs md:text-sm md:font-medium break-words">{project.title || "Non spécifié"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-sm text-muted-foreground">Type de propriété</p>
                      <p className="text-xs md:text-sm md:font-medium break-words">{project.propertyType || "Non spécifié"}</p>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-4 w-full">
                    <p className="text-[10px] md:text-sm text-muted-foreground">Description</p>
                    <div className="w-full overflow-hidden">
                      <p style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }} className="text-xs md:text-sm max-w-full">{project.description || "Aucune description fournie"}</p>
                  </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="budget" className="border-b">
            <AccordionTrigger 
              className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center">
                <div className={`mr-1 md:mr-2 p-1 rounded-full ${
                  completionStatus.budget 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                    : "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {completionStatus.budget ? <CheckCircle className="h-3 w-3 md:h-5 md:w-5" /> : <InfoIcon className="h-3 w-3 md:h-5 md:w-5" />}
                </div>
                <span>Budget</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="w-full max-w-full">
                <CardContent className="pt-2 md:pt-6 px-2 md:px-6 overflow-hidden w-full relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/create-project/budget");
                    }}
                    type="button"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                  </Button>
                  
                  <div className="flex items-start gap-1.5 md:gap-3">
                    <div className="p-1 md:p-2 bg-primary/10 rounded-full flex-shrink-0">
                      <Euro className="h-2.5 w-2.5 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {project.budget ? (
                        <>
                          {project.budget.type === "fixed" && (
                            <div className="text-xs md:text-sm md:font-medium word-break break-words">
                              Budget fixe: {project.budget.amount.toLocaleString('fr-FR')} €
                            </div>
                          )}
                          
                          {project.budget.type === "range" && (
                            <div className="text-xs md:text-sm md:font-medium word-break break-words">
                              Fourchette: {project.budget.amount.toLocaleString('fr-FR')} € - {project.budget.maxAmount?.toLocaleString('fr-FR')} €
                            </div>
                          )}
                          
                          {project.budget.type === "hourly" && (
                            <div className="text-xs md:text-sm md:font-medium word-break break-words">
                              Taux horaire: {project.budget.amount.toLocaleString('fr-FR')} €/h
                            </div>
                          )}
                          
                          <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1">
                            Type: {
                              project.budget.type === "fixed" ? "Budget fixe" : 
                              project.budget.type === "range" ? "Fourchette" : "Taux horaire"
                            }
                          </p>
                        </>
                      ) : (
                        <div className="text-xs md:text-sm text-muted-foreground word-break break-words">Aucun budget défini</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="location" className="border-b">
            <AccordionTrigger 
              className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center">
                <div className={`mr-1 md:mr-2 p-1 rounded-full ${
                  completionStatus.location 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                    : "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {completionStatus.location ? <CheckCircle className="h-3 w-3 md:h-5 md:w-5" /> : <InfoIcon className="h-3 w-3 md:h-5 md:w-5" />}
                </div>
                <span>Localisation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="w-full max-w-full">
                <CardContent className="pt-2 md:pt-6 px-2 md:px-6 overflow-hidden w-full relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/create-project/location");
                    }}
                    type="button"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                  </Button>
                  
                  <div className="flex items-start gap-1.5 md:gap-3">
                    <div className="p-1 md:p-2 bg-primary/10 rounded-full flex-shrink-0">
                      <MapPin className="h-2.5 w-2.5 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm md:font-medium word-break break-words">{project.location?.address || "Adresse non spécifiée"}</p>
                      <p className="text-[10px] md:text-sm word-break break-words">
                        {project.location?.postalCode} {project.location?.city}
                        {project.location?.region && `, ${project.location.region}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Carte Google Maps */}
                  {project.location?.address && project.location.city && project.location.postalCode && (
                    <div className="mt-3 md:mt-5 w-full">
                      <GoogleMapComponent
                        address={project.location.address}
                        city={project.location.city}
                        postalCode={project.location.postalCode}
                        mapHeight="180px"
                        className="w-full"
                      />
                    </div>
                  )}
                  
                  {project.location?.accessibility && (
                    <div className="mt-1.5 md:mt-4">
                      <p className="text-[10px] md:text-sm text-muted-foreground">Accessibilité</p>
                      <p className="text-xs md:text-sm">{project.location.accessibility}</p>
                  </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="schedule" className="border-b">
            <AccordionTrigger 
              className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center">
                <div className={`mr-1 md:mr-2 p-1 rounded-full ${
                  completionStatus.schedule 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                    : "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                }`}>
                  {completionStatus.schedule ? <CheckCircle className="h-3 w-3 md:h-5 md:w-5" /> : <InfoIcon className="h-3 w-3 md:h-5 md:w-5" />}
                </div>
                <span>Planification</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="w-full max-w-full">
                <CardContent className="pt-2 md:pt-6 px-2 md:px-6 overflow-hidden w-full relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push("/create-project/date");
                    }}
                    type="button"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                  </Button>
                  
                  <div className="flex items-start gap-1.5 md:gap-3">
                    <div className="p-1 md:p-2 bg-primary/10 rounded-full flex-shrink-0">
                      <Calendar className="h-2.5 w-2.5 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm md:font-medium">
                        Date: {formatDate(project.schedule?.startDate)}
                      </p>
                      <p className="text-[10px] md:text-sm text-muted-foreground">
                        {project.schedule?.flexibleDates ? "Dates flexibles" : "Dates fixes"}
                      </p>
                      <p className="mt-1 text-[10px] md:text-sm">
                        <span className="text-muted-foreground">Urgence: </span>
                        <span className={`text-xs md:text-sm md:font-medium truncate ${
                          project.schedule?.urgency === "urgent" ? "text-red-600" : 
                          project.schedule?.urgency === "soon" ? "text-amber-600" : 
                          "text-blue-600"
                        }`}>
                          {project.schedule?.urgency === "urgent" ? "Urgent (7j)" : 
                           project.schedule?.urgency === "soon" ? "Dès que possible (15j)" : 
                           "Normal (30j)"}
                        </span>
                      </p>
                      <p className="mt-0.5 md:mt-1">
                        <span className="text-[10px] md:text-sm text-muted-foreground">Horaire: </span>
                        <span className="text-xs md:text-sm md:font-medium">
                          {project.schedule?.preferredTime === "morning" ? "Matin" :
                           project.schedule?.preferredTime === "afternoon" ? "Après-midi" :
                           project.schedule?.preferredTime === "evening" ? "Fin de journée" :
                           project.schedule?.preferredTime === "weekend" ? "Week-end" :
                           "N'importe quand"}
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="photos" className="border-b">
            <AccordionTrigger 
              className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <div className="flex items-center">
                <div className={`mr-1 md:mr-2 p-1 rounded-full ${
                  project.photos && project.photos.length > 0 
                    ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}>
                  <ImageIcon className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span>Photos</span>
                {project.photos && project.photos.length > 0 && (
                  <span className="ml-1 md:ml-2 text-[10px] md:text-xs bg-primary/10 text-primary rounded-full px-1.5 md:px-2 py-0.5">
                    {project.photos.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="w-full max-w-full">
                <CardContent className="pt-2 md:pt-6 px-2 md:px-6 overflow-hidden w-full relative">
                  {project.photos && project.photos.length > 0 ? (
                    <div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push("/create-project/details");
                        }}
                        type="button"
                      >
                        <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                      </Button>
                      
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-1 md:gap-4">
                        {project.photos.map((photo, index) => (
                          <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border bg-gray-50">
                            <Image
                              src={photo.preview}
                              alt={`Photo ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 33vw, 25vw"
                              className="object-cover"
                              unoptimized={true}
                              onError={() => {
                                console.log("Erreur de chargement d'image:", photo.preview);
                                // Ne pas essayer de modifier la source ici pour éviter la boucle infinie
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2 md:py-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-7 md:h-auto text-xs md:text-sm absolute top-2 right-2 z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push("/create-project/details");
                        }}
                        type="button"
                      >
                        <Edit className="h-3 w-3 md:h-4 md:w-4 md:mr-2" /> <span className="hidden md:inline">Modifier</span>
                      </Button>
                      
                      <ImageIcon className="h-6 w-6 md:h-12 md:w-12 mx-auto text-muted-foreground" />
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-muted-foreground">Aucune photo ajoutée</p>
                      <Button 
                        variant="outline" 
                        className="mt-2 md:mt-4 text-xs md:text-sm h-7 md:h-9"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push("/create-project/details");
                        }}
                        type="button"
                      >
                        <span className="hidden md:inline">Ajouter des photos</span><span className="inline md:hidden">Photos</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Card className="bg-primary-50 border-primary-100 dark:bg-primary-950/10 dark:border-primary-900/20 w-full max-w-full">
          <CardContent className="p-2 md:p-4 overflow-hidden">
            <h3 className="text-xs md:text-base font-medium mb-1 md:mb-2 flex items-center">
              <FileText className="mr-1 md:mr-2 h-3 w-3 md:h-5 md:w-5 text-primary" />
              Récapitulatif
            </h3>
            <ul className="space-y-1 md:space-y-2 mb-2 md:mb-4">
              <li className="flex items-center">
                <div className={`mr-1 md:mr-2 ${completionStatus.category ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {completionStatus.category ? <CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <div className="h-2.5 w-2.5 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-xs md:text-sm">Catégorie et service</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-1 md:mr-2 ${completionStatus.details ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {completionStatus.details ? <CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <div className="h-2.5 w-2.5 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-xs md:text-sm">Informations sur le projet</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-1 md:mr-2 ${completionStatus.budget ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {completionStatus.budget ? <CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <div className="h-2.5 w-2.5 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-xs md:text-sm">Budget</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-1 md:mr-2 ${completionStatus.location ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {completionStatus.location ? <CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <div className="h-2.5 w-2.5 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-xs md:text-sm">Localisation</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-1 md:mr-2 ${completionStatus.schedule ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {completionStatus.schedule ? <CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <div className="h-2.5 w-2.5 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-xs md:text-sm">Planification</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <div className={`mr-1 md:mr-2 ${completionStatus.photos ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-600"}`}>
                  {completionStatus.photos ? <CheckSquare className="h-2.5 w-2.5 md:h-4 md:w-4" /> : <div className="h-2.5 w-2.5 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-xs md:text-sm">Photos (optionnel)</span>
              </li>
            </ul>
            
            {/* Bouton Publier pour la version desktop */}
            <div className="flex justify-end mt-6 mb-12">
              <Button 
                type="submit"
                disabled={!isFormComplete || isSubmitting}
                className="hidden md:flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    Publier le projet
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showAuthOptions && (
        <Card className="border-[#FCDA89]/20 bg-[#0E261C] text-white mb-4">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#FCDA89]">
              <InfoIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Connectez-vous pour continuer</h3>
            </div>
            
            <p className="text-white/80">
              Pour soumettre votre projet et recevoir des devis d'artisans qualifiés, 
              vous devez vous connecter ou créer un compte gratuitement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10"
                onClick={() => router.push(`/auth?tab=login&callbackUrl=${encodeURIComponent('/create-project/review')}`)}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Se connecter
              </Button>
              <Button 
                className="w-full sm:w-auto bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C]"
                onClick={() => router.push(`/register/role?callbackUrl=${encodeURIComponent('/create-project/review')}`)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Créer un compte
              </Button>
            </div>
            
            <p className="text-xs text-white/60 pt-2">
              Vos informations de projet seront conservées pendant votre inscription.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="flex items-center gap-4 pt-2 pb-10">
        <Button
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.back()}
          className="px-4"
        >
          Retour
        </Button>
        
        <Button
          className="flex-1 bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C]"
          disabled={!isFormComplete || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Soumission en cours...
            </>
          ) : showAuthOptions ? (
            "Continuer après connexion"
          ) : (
            <>
              Soumettre le projet
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
} 