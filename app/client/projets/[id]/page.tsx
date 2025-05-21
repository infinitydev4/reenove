"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  ClipboardList, 
  Edit, 
  MessagesSquare, 
  FileText, 
  ArrowRight, 
  Building, 
  Euro, 
  Check, 
  Clock, 
  XCircle,
  Loader2,
  CalendarDays,
  CircleDollarSign,
  Share,
  Truck,
  MessageSquare,
  Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import GoogleMapComponent from "@/components/maps/GoogleMapComponent"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Interface pour les projets
interface Project {
  id: string
  title: string
  description: string
  status: string
  categoryName?: string
  serviceName?: string
  budget?: number
  budgetType?: string
  budgetMax?: number
  location?: string
  city?: string
  postalCode?: string
  startDate?: string
  endDate?: string
  urgencyLevel?: string
  createdAt: string
  updatedAt: string
  photos?: string[]
  quotes?: {
    id: string
    amount: number
    status: string
    providerName?: string
  }[]
}

// Fonction pour formater le statut du projet
const getStatusBadge = (status: string) => {
  switch (status) {
    case "DRAFT":
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">Brouillon</Badge>
    case "PENDING":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">En attente</Badge>
    case "PUBLISHED":
      return <Badge className="bg-blue-100 text-blue-800">Publié</Badge>
    case "ASSIGNED":
      return <Badge className="bg-indigo-100 text-indigo-800">Attribué</Badge>
    case "IN_PROGRESS":
      return <Badge className="bg-purple-100 text-purple-800">En cours</Badge>
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
    default:
      return <Badge variant="outline">Inconnu</Badge>
  }
}

// Fonction pour formater le statut du projet en français
const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    DRAFT: "Brouillon",
    PENDING: "En attente de devis",
    PUBLISHED: "Publié",
    ASSIGNED: "Attribué à un artisan",
    IN_PROGRESS: "Travaux en cours",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé"
  }
  
  return statusMap[status] || status
}

// Fonction pour formater une date
const formatDate = (dateString?: string) => {
  if (!dateString) return "Non définie"
  
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  return date.toLocaleDateString('fr-FR', options)
}

// Fonction pour obtenir le pourcentage d'avancement du projet
const getProjectProgress = (status: string) => {
  switch (status) {
    case "DRAFT":
      return 10
    case "PENDING":
      return 20
    case "PUBLISHED":
      return 30
    case "ASSIGNED":
      return 50
    case "IN_PROGRESS":
      return 75
    case "COMPLETED":
      return 100
    case "CANCELLED":
      return 100
    default:
      return 0
  }
}

// Fonction pour récupérer les vraies URLs depuis les références sessionStorage
const getImageFromSessionStorage = (imageUrl: string) => {
  if (imageUrl.startsWith('session:')) {
    const key = imageUrl.replace('session:', '');
    try {
      const sessionImage = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
      if (sessionImage) {
        console.log("Image récupérée avec succès depuis sessionStorage:", key);
        return sessionImage;
      } else {
        console.warn("Image non trouvée dans sessionStorage:", key);
        return '/placeholder-project.png';
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'image depuis sessionStorage:", error);
      return '/placeholder-project.png';
    }
  }
  return imageUrl;
};

export default function ProjectDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // États pour la gestion de la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Récupérer les détails du projet
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/client/projects/${projectId}`)
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des détails du projet")
        }
        
        const data = await response.json()
        setProject(data)
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Impossible de charger les détails du projet. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId])
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-40 bg-white/10" />
        </div>
        
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full bg-white/10" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-24 w-full bg-white/10" />
              <Skeleton className="h-24 w-full bg-white/10" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Link href="/client/projets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Projet non trouvé</h1>
        </div>
        
        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-[#FCDA89] mb-4" />
            <h3 className="text-lg font-medium mb-2">Projet introuvable</h3>
            <p className="text-white/70 text-center max-w-md mb-6">
              Ce projet n&apos;existe pas ou vous n&apos;avez pas les permissions pour y accéder.
            </p>
            <Button asChild className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
              <Link href="/client/projets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour aux projets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Fonction pour gérer la suppression de projet
  const handleDeleteProject = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/client/projects/${projectId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la suppression du projet")
      }
      
      toast.success("Projet supprimé avec succès")
      
      // Rediriger vers la liste des projets après suppression
      router.push('/client/projets')
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast.error("Impossible de supprimer le projet. Veuillez réessayer plus tard.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2 w-full overflow-hidden">
          <Button asChild variant="outline" size="icon" className="shrink-0 border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Link href="/client/projets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0 overflow-hidden">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{project.title}</h1>
            <div className="flex items-center gap-1 md:gap-2 text-white/70 text-xs md:text-sm overflow-hidden">
              <span className="truncate">{project.categoryName}</span>
              {project.serviceName && (
                <>
                  <span className="shrink-0">•</span>
                  <span className="truncate">{project.serviceName}</span>
                </>
              )}
              <span className="shrink-0">•</span>
              <span className="truncate shrink-0">Créé le {formatDate(project.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2 md:mt-0 shrink-0">
          <Button variant="outline" asChild className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4 border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Link href={`/client/projets/${projectId}/edit`}>
              <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="truncate">Modifier</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-8 md:h-10 text-xs md:text-sm px-2 md:px-4 border-white/10 bg-white/5 hover:bg-white/10 text-white">
            <Share className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            <span className="truncate">Partager</span>
          </Button>
        </div>
      </div>
      
      {/* Barre de progression et statut */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Statut:</span>
              {getStatusBadge(project.status)}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contacter un artisan
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{getProjectProgress(project.status)}%</span>
            </div>
            <Progress value={getProjectProgress(project.status)} className="h-2" indicatorClassName="bg-[#FCDA89]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-6">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>Création</span>
              </div>
              <span className="text-sm font-medium">✓ Terminé</span>
            </div>
            <div className={`rounded-xl p-3 ${project.status === "DRAFT" ? "bg-white/5" : "bg-[#FCDA89]/10"}`}>
              <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span>Publication</span>
              </div>
              <span className="text-sm font-medium">
                {project.status === "DRAFT" ? "En attente" : "✓ Terminé"}
              </span>
            </div>
            <div className={`rounded-xl p-3 ${["DRAFT", "PUBLISHED", "PENDING"].includes(project.status) ? "bg-white/5" : "bg-[#FCDA89]/10"}`}>
              <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                <User className="h-3.5 w-3.5" />
                <span>Attribution</span>
              </div>
              <span className="text-sm font-medium">
                {["DRAFT", "PUBLISHED", "PENDING"].includes(project.status) ? "En attente" : "✓ Terminé"}
              </span>
            </div>
            <div className={`rounded-xl p-3 ${project.status === "COMPLETED" ? "bg-green-900/20" : "bg-white/5"}`}>
              <div className="flex items-center gap-2 text-xs text-white/70 mb-1">
                <Check className="h-3.5 w-3.5" />
                <span>Réalisation</span>
              </div>
              <span className="text-sm font-medium">
                {project.status === "COMPLETED" ? "✓ Terminé" : "En attente"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex w-full md:w-auto bg-white/10 text-white">
          <TabsTrigger value="details" className="flex-1 md:flex-initial data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
            <FileText className="mr-2 h-4 w-4" />
            Détails
          </TabsTrigger>
          <TabsTrigger value="devis" className="flex-1 md:flex-initial data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
            <CircleDollarSign className="mr-2 h-4 w-4" />
            Devis
            {project.quotes && project.quotes.length > 0 && (
              <Badge className="ml-2 bg-[#FCDA89]/20 text-[#FCDA89]">{project.quotes.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex-1 md:flex-initial data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
            <Calendar className="mr-2 h-4 w-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex-1 md:flex-initial data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
            <MessagesSquare className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>
        
        {/* Onglet Détails */}
        <TabsContent value="details" className="space-y-6">
          <Card className="bg-white/5 border-white/10 text-white">
            <CardHeader>
              <CardTitle>Description du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{project.description}</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations financières */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Informations financières</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-white/70" />
                      <span className="text-sm">Budget</span>
                    </div>
                    <span className="font-medium">
                      {project.budget ? `${project.budget.toLocaleString('fr-FR')} €` : "Non défini"}
                      {project.budgetType === "range" && project.budgetMax && ` - ${project.budgetMax.toLocaleString('fr-FR')} €`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-white/70" />
                      <span className="text-sm">Type de budget</span>
                    </div>
                    <span className="font-medium">
                      {project.budgetType === "fixed" ? "Budget fixe" : 
                       project.budgetType === "range" ? "Fourchette de prix" : 
                       project.budgetType === "hourly" ? "Taux horaire" : 
                       "Non défini"}
                    </span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-white/70" />
                      <span className="text-sm">Devis reçus</span>
                    </div>
                    <span className="font-medium">
                      {project.quotes?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Localisation */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Localisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-white/70 mt-0.5" />
                    <div>
                      <div className="font-medium">{project.location || "Adresse non spécifiée"}</div>
                      <div className="text-sm text-white/70">
                        {project.postalCode && project.city ? `${project.postalCode} ${project.city}` : ""}
                      </div>
                    </div>
                  </div>
                  
                  {project.location && project.postalCode && project.city && (
                    <div className="mt-4">
                      <GoogleMapComponent
                        address={project.location}
                        city={project.city}
                        postalCode={project.postalCode}
                        mapHeight="200px"
                        className="w-full rounded-md border border-white/10"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Onglet Devis */}
        <TabsContent value="devis">
          <Card>
            <CardHeader>
              <CardTitle>Devis reçus</CardTitle>
              <CardDescription>
                Consultez et comparez les devis proposés par les artisans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.quotes && project.quotes.length > 0 ? (
                <div className="space-y-4">
                  {project.quotes.map((quote) => (
                    <Card key={quote.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="font-medium text-base">{quote.providerName || "Artisan"}</div>
                            <div className="text-sm text-muted-foreground">Devis #{quote.id.slice(0, 8)}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              quote.status === "accepted" ? "bg-green-100 text-green-800" :
                              quote.status === "rejected" ? "bg-red-100 text-red-800" :
                              quote.status === "expired" ? "bg-gray-100 text-gray-800" :
                              "bg-blue-100 text-blue-800"
                            }>
                              {quote.status === "accepted" ? "Accepté" :
                               quote.status === "rejected" ? "Refusé" :
                               quote.status === "expired" ? "Expiré" :
                               "En attente"}
                            </Badge>
                            <div className="font-bold text-lg">{quote.amount.toLocaleString('fr-FR')} €</div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" asChild>
                            <Link href={`/client/projets/${projectId}/devis/${quote.id}`}>
                              Voir détails
                            </Link>
                          </Button>
                          {quote.status === "pending" && (
                            <Button>
                              Accepter ce devis
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <CircleDollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun devis reçu</h3>
                  <p className="text-muted-foreground text-center max-w-md mb-6">
                    Vous n&apos;avez pas encore reçu de devis pour ce projet. 
                    {project.status === "DRAFT" 
                      ? " Publiez votre projet pour recevoir des propositions d&apos;artisans." 
                      : " Les artisans consultent votre projet et pourront vous envoyer leurs propositions."}
                  </p>
                  {project.status === "DRAFT" && (
                    <Button>
                      Publier mon projet
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Planning */}
        <TabsContent value="planning">
          <Card>
            <CardHeader>
              <CardTitle>Planning des travaux</CardTitle>
              <CardDescription>
                Suivez l&apos;avancement et les dates clés de votre projet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Planning non disponible</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Le planning détaillé sera disponible une fois que vous aurez accepté un devis et que les travaux seront planifiés.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Messages */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Échangez avec les artisans et suivez vos conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <MessagesSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune conversation</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Vous n&apos;avez pas encore de conversation liées à ce projet.
                </p>
                <Button>
                  Contacter un artisan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Actions */}
      <div className="flex justify-between gap-4">
        <Button asChild variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
          <Link href="/client/projets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Link>
        </Button>
        
        <div className="flex gap-2">
          {project.status === "DRAFT" && (
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Publier le projet
            </Button>
          )}
          {["DRAFT", "PUBLISHED", "PENDING"].includes(project.status) && (
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Boîte de dialogue de confirmation pour la suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0E261C] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr de vouloir supprimer ce projet ?</DialogTitle>
            <DialogDescription className="text-white/70">
              Cette action est irréversible. Toutes les données associées à ce projet seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={isDeleting}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleDeleteProject}
              disabled={isDeleting}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>Supprimer</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 