"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  CheckCircle, 
  ClipboardCheck, 
  Loader2, 
  User, 
  MapPin, 
  Wrench, 
  FileText, 
  Calendar, 
  Phone, 
  Building2,
  Info,
  Briefcase,
  InfoIcon,
  CheckSquare,
  Edit,
  Ruler,
  Hammer,
  Paintbrush,
  Zap,
  Check
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { OnboardingLayout } from "../components/OnboardingLayout"
import { useOnboarding } from "../context/OnboardingContext"
import GoogleMapComponent from "@/components/maps/GoogleMapComponent"
import InterventionRadiusMap from "@/components/maps/InterventionRadiusMap"

// Obtenir l'icône par catégorie
const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary" />

  // Normaliser le nom de catégorie (supprimer les accents, mettre en minuscules)
  const normalizedName = categoryName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  switch (normalizedName) {
    case "plomberie":
      return <Wrench className="h-4 w-4 md:h-5 md:w-5 text-primary" />
    case "electricite":
    case "électricité":
      return <Zap className="h-4 w-4 md:h-5 md:w-5 text-primary" />
    case "menuiserie":
      return <Hammer className="h-4 w-4 md:h-5 md:w-5 text-primary" />
    case "peinture":
      return <Paintbrush className="h-4 w-4 md:h-5 md:w-5 text-primary" />
    default:
      return <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary" />
  }
}

export default function ArtisanConfirmationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const { 
    isLoading, 
    isSaving, 
    setIsSaving, 
    updateProgress, 
    completedSteps, 
    currentUserData,
    silentMode, 
    setSilentMode 
  } = useOnboarding()
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [artisanData, setArtisanData] = useState<any>({})
  const [specialties, setSpecialties] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])

  // Animation d'entrée et chargement des données
  useEffect(() => {
    setIsVisible(true)
    
    const fetchData = async () => {
      try {
        // Charger les spécialités
        const specialtiesResponse = await fetch("/api/artisan/specialties", { cache: 'no-store' })
        if (specialtiesResponse.ok) {
          const specialtiesData = await specialtiesResponse.json()
          setSpecialties(specialtiesData || [])
        }
        
        // Charger les documents
        const documentsResponse = await fetch("/api/artisan/documents", { cache: 'no-store' })
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          setDocuments(documentsData || [])
        }
        
        // Préparer les données combinées
        setArtisanData({
          ...currentUserData,
          specialties: specialties || [],
          documents: documents || []
        })
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error)
        }
      }

    if (!isLoading && currentUserData) {
      fetchData()
    }
  }, [isLoading, currentUserData])

  // Vérifier si l'onboarding est déjà complété
  useEffect(() => {
    if (completedSteps.includes("confirmation")) {
      setOnboardingComplete(true)
    }
  }, [completedSteps])

  const handleConfirm = async () => {
    try {
      setIsSaving(true)
      
      // Activer le mode silencieux
      setSilentMode(true)
      
      // Mettre à jour la progression
      await updateProgress("confirmation")
      
      // Désactiver le mode silencieux car c'est la dernière étape
      setSilentMode(false)
      
      setOnboardingComplete(true)
        
      // Afficher la notification de succès pour la dernière étape uniquement
        toast({
          title: "Inscription terminée !",
          description: "Votre compte artisan est maintenant activé. Vous allez être redirigé vers votre tableau de bord.",
      })
        
        // Rediriger vers le tableau de bord après un court délai
        setTimeout(() => {
        router.push("/artisan")
      }, 2000)
    } catch (error) {
      console.error("Erreur:", error)
      setSilentMode(false)
      toast({
        title: "Erreur",
        description: "Impossible de finaliser votre inscription.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setSilentMode(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de vos informations...</p>
      </div>
    )
  }

  return (
    <OnboardingLayout 
      currentStep="confirmation"
      title="Confirmation de l'inscription"
      description="Vérifiez vos informations et terminez votre inscription."
      isLastStep={true}
    >
      <div className={`space-y-4 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <Card className="w-full">
        {/* <CardHeader>
            <CardTitle>Résumé de votre profil artisan</CardTitle>
          <CardDescription>
              Vérifiez les informations avant de finaliser votre inscription
          </CardDescription>
        </CardHeader> */}
          <CardContent className="p-2 md:p-6">
            <Accordion type="single" collapsible className="w-full" defaultValue="profile">
              {/* Section Profil */}
              <AccordionItem value="profile" className="border-b">
                <AccordionTrigger className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base">
                  <div className="flex items-center">
                    <div className="mr-1 md:mr-2 p-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                      <User className="h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <span>Profil</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Carte informations personnelles */}
                      <div className="flex items-center bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/40 transition-colors rounded-lg p-3 md:p-4">
                        <div className="mr-3 md:mr-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full flex-shrink-0">
                          <User className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs uppercase font-medium text-primary/80">Informations personnelles</p>
                          {(currentUserData?.firstName && currentUserData?.lastName) ? (
                            <p className="text-xs md:text-sm font-medium break-words">
                              {currentUserData.firstName.charAt(0).toUpperCase() + currentUserData.firstName.slice(1)} {currentUserData.lastName.charAt(0).toUpperCase() + currentUserData.lastName.slice(1)}
                            </p>
                          ) : session?.user?.name ? (
                            <p className="text-xs md:text-sm font-medium break-words">
                              {session.user.name.split(' ').map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ')}
                            </p>
                          ) : (
                            <p className="text-xs md:text-sm font-medium break-words text-muted-foreground">
                              Non renseigné
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Carte expérience professionnelle */}
                      <div className="flex items-center bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/40 transition-colors rounded-lg p-3 md:p-4">
                        <div className="mr-3 md:mr-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full flex-shrink-0">
                          <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs uppercase font-medium text-primary/80">Expérience professionnelle</p>
                          <p className="text-xs md:text-sm font-medium break-words">{currentUserData?.yearsOfExperience} années d&apos;expérience</p>
                        </div>
                      </div>
                      
                      {/* Carte informations entreprise */}
                      <div className="flex items-center bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/40 transition-colors rounded-lg p-3 md:p-4">
                        <div className="mr-3 md:mr-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full flex-shrink-0">
                          <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs uppercase font-medium text-primary/80">Entreprise</p>
                          <p className="text-xs md:text-sm font-medium break-words">{currentUserData?.companyName}</p>
                          <p className="text-xs text-muted-foreground">SIRET: {currentUserData?.siret}</p>
                        </div>
                      </div>
                      
                      {/* Carte contact */}
                      <div className="flex items-center bg-muted/50 dark:bg-muted/30 hover:bg-muted/70 dark:hover:bg-muted/40 transition-colors rounded-lg p-3 md:p-4">
                        <div className="mr-3 md:mr-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-full flex-shrink-0">
                          <Phone className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] md:text-xs uppercase font-medium text-primary/80">Contact</p>
                          <p className="text-xs md:text-sm font-medium break-words">{currentUserData?.phone}</p>
                          <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bouton modifier discret en bas à droite */}
                    <div className="mt-3 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => router.push("/onboarding/artisan/profile")}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Section Localisation */}
              <AccordionItem value="location" className="border-b">
                <AccordionTrigger className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base">
                  <div className="flex items-center">
                    <div className="mr-1 md:mr-2 p-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                      <MapPin className="h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <span>Localisation</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="border-0 shadow-none">
                    <CardContent className="pt-2 md:pt-6 px-2 md:px-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{currentUserData?.address}</p>
                            <p className="text-xs text-muted-foreground">{currentUserData?.postalCode} {currentUserData?.city}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Ruler className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm">Rayon d&apos;intervention: <span className="font-medium">{currentUserData?.interventionRadius || 50} km</span></p>
                          </div>
                        </div>
                        
                        {currentUserData?.address && currentUserData?.city && currentUserData?.postalCode && (
                          <InterventionRadiusMap
                            address={currentUserData.address}
                            city={currentUserData.city}
                            postalCode={currentUserData.postalCode}
                            radius={currentUserData.interventionRadius || 50}
                            mapHeight="200px"
                            className="w-full rounded-md mt-2"
                          />
                        )}
                        
                        <div className="mt-2 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => router.push("/onboarding/artisan/location")}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* Section Spécialités */}
              <AccordionItem value="specialties" className="border-b">
                <AccordionTrigger className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base">
                  <div className="flex items-center">
                    <div className="mr-1 md:mr-2 p-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                      <Wrench className="h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <span>Spécialités</span>
                    {specialties.length > 0 && (
                      <Badge className="ml-2 bg-primary/10 text-primary">{specialties.length}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="border-0 shadow-none">
                    <CardContent className="pt-2 md:pt-6 px-2 md:px-6">
                      <div className="space-y-4">
                        {specialties.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {specialties.map((specialty, index) => (
                              <div key={index} 
                                className={`p-3 rounded-md border flex items-start gap-3 ${
                                  specialty.isPrimary 
                                    ? "border-amber-500 bg-amber-50/70 dark:bg-amber-900/20" 
                                    : "border-gray-200 dark:border-gray-700"
                                }`}
                              >
                                <div className="p-1.5 bg-primary/10 rounded-full">
                                  {getCategoryIcon(specialty.service?.name)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{specialty.service?.name}</p>
                                  {specialty.isPrimary && (
                                    <Badge className="mt-1 bg-amber-500 hover:bg-amber-600 text-white border-none">
                                      <Check className="h-3 w-3 mr-1" />
                                      Principal
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Aucune spécialité définie
                          </p>
                        )}
                        
                        <div className="mt-2 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => router.push("/onboarding/artisan/specialties")}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* Section Documents */}
              <AccordionItem value="documents" className="border-b">
                <AccordionTrigger className="hover:no-underline py-1.5 md:py-3 px-1 md:px-2 text-xs md:text-base">
                  <div className="flex items-center">
                    <div className="mr-1 md:mr-2 p-1 rounded-full bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400">
                      <FileText className="h-3 w-3 md:h-5 md:w-5" />
                    </div>
                    <span>Documents</span>
                    {documents.length > 0 && (
                      <Badge className="ml-2 bg-primary/10 text-primary">{documents.length}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="border-0 shadow-none">
                    <CardContent className="pt-2 md:pt-6 px-2 md:px-6">
                      <div className="space-y-3">
                        {documents.length > 0 ? (
                          documents.map((doc, index) => (
                            <div key={index} className="p-3 rounded-md border flex items-start gap-3">
                              <div className="p-1.5 bg-primary/10 rounded-full">
                                <FileText className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">{doc.type === "KBIS" ? "Extrait KBIS" : 
                                                                   doc.type === "INSURANCE" ? "Attestation d'assurance" : 
                                                                   doc.type === "QUALIFICATION" ? "Qualification professionnelle" : 
                                                                   doc.name}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{doc.name}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Aucun document téléchargé
                          </p>
                        )}
                        
                        <div className="mt-2 text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => router.push("/onboarding/artisan/documents")}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        {/* Section récapitulative */}
        <Card className="bg-primary-50 border-primary-200 dark:bg-primary-950/10 dark:border-primary-900/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 mb-4">
              <ClipboardCheck className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-sm md:text-base">Prochaine étape : Vérification</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Votre profil sera vérifié par notre équipe dans les 24-48h ouvrées. 
                    Vous recevrez une notification par email lorsque votre compte sera validé.
                  </p>
                </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-xs md:text-sm">Profil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-xs md:text-sm">Localisation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-xs md:text-sm">Spécialités</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-green-600" />
                <span className="text-xs md:text-sm">Documents</span>
              </div>
            </div>
            
            {/* Bouton pour desktop */}
            <div className="hidden md:block">
          {onboardingComplete ? (
                <Button onClick={() => router.push("/artisan")} variant="default" className="w-full">
                  Accéder à mon espace artisan
            </Button>
          ) : (
                <Button onClick={handleConfirm} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalisation en cours...
                </>
              ) : (
                "Terminer l'inscription"
              )}
            </Button>
          )}
            </div>
          </CardContent>
      </Card>
      </div>
    </OnboardingLayout>
  )
} 