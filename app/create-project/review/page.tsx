"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  Euro
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

export default function ReviewPage() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [project, setProject] = useState<Project>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completionStatus, setCompletionStatus] = useState({
    category: false,
    details: false,
    budget: false,
    location: false,
    schedule: false,
    photos: false,
  })
  
  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
    // Récupérer toutes les données du localStorage
    const selectedCategory = localStorage.getItem("selectedCategory")
    const projectDetails = localStorage.getItem("projectDetails")
    const projectBudget = localStorage.getItem("projectBudget")
    const projectLocation = localStorage.getItem("projectLocation")
    const projectDate = localStorage.getItem("projectDate")
    const projectPhotos = localStorage.getItem("projectPhotos")
    
    console.log("Données brutes récupérées:", {
      selectedCategory,
      projectDetails,
      projectBudget,
      projectLocation,
      projectDate,
      projectPhotos
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
    
    // Traitement des photos
    if (projectPhotos) {
      try {
        const photos = JSON.parse(projectPhotos)
        console.log("Photos du projet:", photos)
        if (Array.isArray(photos) && photos.length > 0) {
          projectData.photos = photos
          setCompletionStatus(prev => ({ ...prev, photos: true }))
        }
      } catch (error) {
        console.error("Erreur lors du chargement des photos:", error)
      }
    }
    
    console.log("Données du projet finales:", projectData)
    console.log("État de complétion initial:", completionStatus)
    setProject(projectData)
  }, [])
  
  const isFormComplete = () => {
    const isComplete = (
      completionStatus.category && 
      completionStatus.details &&
      completionStatus.budget &&
      completionStatus.location &&
      completionStatus.schedule
      // photos est optionnel
    )
    
    console.log("État de complétion:", completionStatus, "Formulaire complet:", isComplete)
    
    return isComplete
  }
  
  const handleSubmit = async () => {
    if (!isFormComplete()) {
      console.log("Formulaire incomplet, vérifiez les étapes manquantes:", completionStatus)
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Récupérer toutes les données du localStorage
      const projectDetails = localStorage.getItem("projectDetails") 
        ? JSON.parse(localStorage.getItem("projectDetails") || "{}") 
        : {}
      const projectBudget = localStorage.getItem("projectBudget")
        ? JSON.parse(localStorage.getItem("projectBudget") || "{}")
        : {}
      const projectLocation = localStorage.getItem("projectLocation") 
        ? JSON.parse(localStorage.getItem("projectLocation") || "{}") 
        : {}
      const projectDate = localStorage.getItem("projectDate") 
        ? JSON.parse(localStorage.getItem("projectDate") || "{}") 
        : {}
      
      // Préparer les données à envoyer à l'API
      const projectData = {
        title: projectDetails.title || "",
        description: projectDetails.description || "",
        categoryId: projectDetails.categoryId || "",
        serviceId: projectDetails.serviceId || "",
        propertyType: projectDetails.propertyType || "HOUSE",
        
        // Budget
        budget: projectBudget.budget || null,
        budgetType: projectBudget.budgetType || "Fixed",
        budgetMax: projectBudget.budgetType === "range" ? projectBudget.budgetMax : null,
        
        // Localisation
        location: projectLocation.address || "",
        postalCode: projectLocation.postalCode || "",
        city: projectLocation.city || "",
        accessibility: projectLocation.accessibility || "EASY",
        
        // Planification
        startDate: projectDate.startDate ? new Date(projectDate.startDate).toISOString() : null,
        endDate: projectDate.endDate ? new Date(projectDate.endDate).toISOString() : null,
        urgencyLevel: convertUrgencyLevel(projectDate.urgency),
        flexibleDates: projectDate.timeFrame === "flexible",
        preferredTime: projectDate.preferredTime || "ANY",
        
        // Statut
        status: "PUBLISHED",
        visibility: "PUBLIC",
      }
      
      console.log("Données à envoyer:", projectData)
      
      // Appel à l'API
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la création du projet")
      }
      
      const result = await response.json()
      console.log("Projet créé avec succès:", result)
      
      // Rediriger vers la page de succès
      router.push("/create-project/success")
    } catch (error) {
      console.error("Erreur lors de la création du projet:", error)
      setIsSubmitting(false)
      // Ici, vous pourriez mettre en place un affichage d'erreur pour l'utilisateur
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
    <div className={`space-y-4 md:space-y-6 transition-opacity duration-500 px-2 sm:px-4 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="space-y-2">
        <h2 className="text-xl md:text-2xl font-semibold">Récapitulatif de votre projet</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Vérifiez les informations de votre projet avant de le publier
        </p>
      </div>

      {!completionStatus.category && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/10 dark:border-amber-700/30">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5 text-amber-600" />
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                  Vous n'avez pas encore choisi de catégorie et de service pour votre projet
                </p>
              </div>
              <Button 
                size="sm" 
                className="bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => router.push("/create-project/category")}
              >
                Choisir maintenant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:gap-6">
        <Accordion type="single" collapsible className="w-full" defaultValue="category">
          <AccordionItem value="category" className="border-b">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
              <div className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${completionStatus.category ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                  {completionStatus.category ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <InfoIcon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className="text-sm md:text-base">Catégorie et Service</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Catégorie</p>
                      <p className="text-sm md:font-medium">{project.category || "Non spécifiée"}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Service</p>
                      <p className="text-sm md:font-medium">{project.service || "Non spécifié"}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push("/create-project/category")}>
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="details" className="border-b">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
              <div className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${completionStatus.details ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                  {completionStatus.details ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <InfoIcon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className="text-sm md:text-base">Informations générales</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="md:col-span-2">
                      <p className="text-xs md:text-sm text-muted-foreground">Titre du projet</p>
                      <p className="text-sm md:font-medium">{project.title || "Non spécifié"}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Type de propriété</p>
                      <p className="text-sm md:font-medium">{project.propertyType || "Non spécifié"}</p>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-4">
                    <p className="text-xs md:text-sm text-muted-foreground">Description</p>
                    <p className="text-sm whitespace-pre-line">{project.description || "Aucune description fournie"}</p>
                  </div>
                  <div className="mt-3 md:mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push("/create-project/details")}>
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="budget" className="border-b">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
              <div className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${completionStatus.budget ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                  {completionStatus.budget ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <InfoIcon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className="text-sm md:text-base">Budget</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-full">
                      <Euro className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      {project.budget ? (
                        <>
                          {project.budget.type === "fixed" && (
                            <p className="text-sm md:font-medium">
                              Budget fixe: {project.budget.amount.toLocaleString('fr-FR')} €
                            </p>
                          )}
                          
                          {project.budget.type === "range" && (
                            <p className="text-sm md:font-medium">
                              Fourchette de budget: {project.budget.amount.toLocaleString('fr-FR')} € - {project.budget.maxAmount?.toLocaleString('fr-FR')} €
                            </p>
                          )}
                          
                          {project.budget.type === "hourly" && (
                            <p className="text-sm md:font-medium">
                              Taux horaire: {project.budget.amount.toLocaleString('fr-FR')} €/h
                            </p>
                          )}
                          
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            Type de budget: {
                              project.budget.type === "fixed" ? "Budget fixe" : 
                              project.budget.type === "range" ? "Fourchette" : "Taux horaire"
                            }
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun budget défini</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push("/create-project/budget")}>
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="location" className="border-b">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
              <div className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${completionStatus.location ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                  {completionStatus.location ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <InfoIcon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className="text-sm md:text-base">Localisation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm md:font-medium">{project.location?.address || "Adresse non spécifiée"}</p>
                      <p className="text-xs md:text-sm">
                        {project.location?.postalCode} {project.location?.city}
                        {project.location?.region && `, ${project.location.region}`}
                      </p>
                    </div>
                  </div>
                  
                  {project.location?.accessibility && (
                    <div className="mt-3 md:mt-4">
                      <p className="text-xs md:text-sm text-muted-foreground">Accessibilité</p>
                      <p className="text-sm">{project.location.accessibility}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 md:mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push("/create-project/location")}>
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="schedule" className="border-b">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
              <div className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${completionStatus.schedule ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                  {completionStatus.schedule ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5" /> : <InfoIcon className="h-4 w-4 md:h-5 md:w-5" />}
                </div>
                <span className="text-sm md:text-base">Planification</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-full">
                      <Calendar className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm md:font-medium">
                        Date souhaitée: {formatDate(project.schedule?.startDate)}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {project.schedule?.flexibleDates ? "Dates flexibles (±7 jours)" : "Dates fixes"}
                      </p>
                      <p className="mt-1 md:mt-2 text-sm">
                        <span className="text-xs md:text-sm text-muted-foreground">Urgence: </span>
                        <span className={`text-sm md:font-medium ${
                          project.schedule?.urgency === "urgent" ? "text-red-600" : 
                          project.schedule?.urgency === "soon" ? "text-amber-600" : 
                          "text-blue-600"
                        }`}>
                          {project.schedule?.urgency === "urgent" ? "Urgent (7 jours)" : 
                           project.schedule?.urgency === "soon" ? "Dès que possible (15 jours)" : 
                           "Normal (30 jours)"}
                        </span>
                      </p>
                      <p className="mt-1">
                        <span className="text-xs md:text-sm text-muted-foreground">Horaire préféré: </span>
                        <span className="text-sm md:font-medium">
                          {project.schedule?.preferredTime === "morning" ? "Matin (8h-12h)" :
                           project.schedule?.preferredTime === "afternoon" ? "Après-midi (12h-17h)" :
                           project.schedule?.preferredTime === "evening" ? "Fin de journée (17h-20h)" :
                           project.schedule?.preferredTime === "weekend" ? "Week-end uniquement" :
                           "N'importe quand"}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 md:mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => router.push("/create-project/date")}>
                      <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="photos" className="border-b">
            <AccordionTrigger className="hover:no-underline py-3 px-2">
              <div className="flex items-center">
                <div className={`mr-2 p-1 rounded-full ${project.photos && project.photos.length > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
                  <ImageIcon className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-sm md:text-base">Photos</span>
                {project.photos && project.photos.length > 0 && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                    {project.photos.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card>
                <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
                  {project.photos && project.photos.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        {project.photos.map((photo, index) => (
                          <div key={photo.id} className="relative aspect-square rounded-md overflow-hidden border bg-gray-50">
                            <Image
                              src={photo.preview}
                              alt={`Photo ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 md:mt-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => router.push("/create-project/details")}>
                          <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> Modifier
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3 md:py-4">
                      <ImageIcon className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Aucune photo ajoutée</p>
                      <Button variant="outline" className="mt-3 md:mt-4 text-sm" onClick={() => router.push("/create-project/details")}>
                        Ajouter des photos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <Card className="bg-primary-50 border-primary-100 dark:bg-primary-950/10 dark:border-primary-900/20">
          <CardContent className="p-3 md:p-4">
            <h3 className="text-sm md:text-base font-medium mb-2 flex items-center">
              <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
              Récapitulatif
            </h3>
            <ul className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
              <li className="flex items-center">
                <div className={`mr-2 ${completionStatus.category ? "text-green-600" : "text-amber-600"}`}>
                  {completionStatus.category ? <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> : <div className="h-3 w-3 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-sm">Catégorie et service</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-2 ${completionStatus.details ? "text-green-600" : "text-amber-600"}`}>
                  {completionStatus.details ? <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> : <div className="h-3 w-3 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-sm">Informations sur le projet</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-2 ${completionStatus.budget ? "text-green-600" : "text-amber-600"}`}>
                  {completionStatus.budget ? <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> : <div className="h-3 w-3 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-sm">Budget</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-2 ${completionStatus.location ? "text-green-600" : "text-amber-600"}`}>
                  {completionStatus.location ? <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> : <div className="h-3 w-3 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-sm">Localisation</span>
              </li>
              <li className="flex items-center">
                <div className={`mr-2 ${completionStatus.schedule ? "text-green-600" : "text-amber-600"}`}>
                  {completionStatus.schedule ? <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> : <div className="h-3 w-3 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-sm">Planification</span>
              </li>
              <li className="flex items-center text-muted-foreground">
                <div className={`mr-2 ${completionStatus.photos ? "text-green-600" : "text-gray-400"}`}>
                  {completionStatus.photos ? <CheckSquare className="h-3 w-3 md:h-4 md:w-4" /> : <div className="h-3 w-3 md:h-4 md:w-4 border rounded-sm"></div>}
                </div>
                <span className="text-sm">Photos (optionnel)</span>
              </li>
            </ul>
            
            <Button
              className="w-full py-2 md:py-3 text-sm md:text-base"
              onClick={handleSubmit}
              disabled={!isFormComplete() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                <>
                  Publier mon projet <ArrowRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 