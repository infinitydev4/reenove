"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Calendar, 
  CheckCircle,
  XCircle,
  MessagesSquare,
  Download,
  ArrowRight,
  AlertCircle,
  Building,
  MapPin,
  CalendarDays,
  Euro,
  Trash2,
  Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
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
  location?: string
  city?: string
  postalCode?: string
  startDate?: string
  urgencyLevel?: string
  createdAt: string
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
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  return date.toLocaleDateString('fr-FR', options)
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

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  
  // États pour la gestion de la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Récupérer les projets de l'utilisateur
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/client/projects")
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des projets")
        }
        
        const data = await response.json()
        setProjects(data)
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Impossible de charger vos projets. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProjects()
  }, [])
  
  // Filtrer les projets en fonction de la recherche et du statut
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (project.categoryName && project.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (project.serviceName && project.serviceName.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter ? project.status === statusFilter : true
    
    return matchesSearch && matchesStatus
  })
  
  // Fonction pour gérer la suppression de projet
  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/client/projects/${projectId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la suppression du projet")
      }
      
      // Mettre à jour la liste des projets après suppression
      setProjects(prev => prev.filter(project => project.id !== projectId))
      
      toast.success("Projet supprimé avec succès")
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast.error("Impossible de supprimer le projet. Veuillez réessayer plus tard.")
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }
  
  // Fonction pour ouvrir la boîte de dialogue de confirmation
  const openDeleteDialog = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Empêcher la navigation vers la page de détails
    setProjectToDelete(projectId)
    setDeleteDialogOpen(true)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4">
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Mes projets</h1>
          <p className="text-xs md:text-sm text-white/70">
            Gérez et suivez tous vos projets de rénovation
          </p>
        </div>
        
        <Button asChild className="self-end md:self-auto h-9 md:h-10 text-sm w-full md:w-auto bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
          <Link href="/create-project/category" className="flex items-center justify-center">
            <Plus className="mr-2 h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Nouveau projet</span>
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
          <Input
            placeholder="Rechercher un projet..."
            className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select 
          value={statusFilter || "all"}
          onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-52 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent className="bg-[#0E261C] border-white/10 text-white">
            <SelectItem value="all" className="focus:bg-white/10 focus:text-white">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT" className="focus:bg-white/10 focus:text-white">Brouillon</SelectItem>
            <SelectItem value="PENDING" className="focus:bg-white/10 focus:text-white">En attente de devis</SelectItem>
            <SelectItem value="PUBLISHED" className="focus:bg-white/10 focus:text-white">Publié</SelectItem>
            <SelectItem value="ASSIGNED" className="focus:bg-white/10 focus:text-white">Attribué</SelectItem>
            <SelectItem value="IN_PROGRESS" className="focus:bg-white/10 focus:text-white">En cours</SelectItem>
            <SelectItem value="COMPLETED" className="focus:bg-white/10 focus:text-white">Terminé</SelectItem>
            <SelectItem value="CANCELLED" className="focus:bg-white/10 focus:text-white">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="bg-white/10 text-white">
            <TabsTrigger value="grid" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <FileText className="h-4 w-4 mr-2" />
              Grille
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <FileText className="h-4 w-4 mr-2" />
              Liste
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-white/70">
            {filteredProjects.length} {filteredProjects.length > 1 ? "projets" : "projet"}
          </div>
        </div>
        
        {/* Vue en grille */}
        <TabsContent value="grid" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden bg-white/5 border-white/10 text-white">
                  <div className="h-40 bg-white/10">
                    <Skeleton className="h-full w-full bg-white/10" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 mb-4 bg-white/10" />
                    <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                    <Skeleton className="h-4 w-full mb-2 bg-white/10" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-10 w-20 bg-white/10" />
                      <Skeleton className="h-10 w-20 bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-[#FCDA89] mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-white/70 text-center max-w-md mb-6">
                  {searchQuery || statusFilter
                    ? "Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                    : "Vous n'avez pas encore créé de projet. Commencez par créer votre premier projet de rénovation."}
                </p>
                <Button asChild className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
                  <Link href="/create-project/category">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden bg-white/5 border-white/10 text-white">
                  <div className="h-[300px] bg-white/10 relative">
                    {project.photos && project.photos.length > 0 ? (
                      <>
                        <img
                          src={getImageFromSessionStorage(project.photos[0])}
                          alt={project.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-project.png"
                          }}
                        />
                        
                        {/* Afficher des miniatures des images supplémentaires si disponibles */}
                        {project.photos.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 p-1 bg-black/30 backdrop-blur-sm rounded-lg">
                            {project.photos.slice(1, 4).map((photo, index) => (
                              <div key={index} className="h-16 w-16 rounded-md overflow-hidden border border-white/30">
                                <img
                                  src={getImageFromSessionStorage(photo)}
                                  alt={`Photo ${index + 2}`}
                                  className="object-cover w-full h-full"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder-project.png"
                                  }}
                                />
                              </div>
                            ))}
                            {project.photos.length > 4 && (
                              <div className="h-16 w-16 rounded-md overflow-hidden border border-white/30 flex items-center justify-center bg-black/50 text-white font-medium">
                                +{project.photos.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-white/5">
                        <Building className="h-12 w-12 text-[#FCDA89]" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-white/70 mb-3">
                      {project.categoryName} {project.serviceName ? `• ${project.serviceName}` : ''}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-white/70 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {project.city || "Non spécifié"}
                          {project.postalCode ? ` (${project.postalCode})` : ""}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Euro className="h-4 w-4 text-white/70 shrink-0 mt-0.5" />
                        <span>
                          {project.budget 
                            ? `${project.budget.toLocaleString('fr-FR')} €` 
                            : "Budget non défini"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-white/70 shrink-0 mt-0.5" />
                        <span>Créé le {formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2 mt-4">
                      <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                        <Link href={`/client/projets/${project.id}`}>
                          Voir détails
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-400 border-white/10 bg-white/5 hover:text-red-300 hover:bg-red-900/20"
                        onClick={(e) => openDeleteDialog(project.id, e)}
                        disabled={isDeleting}
                      >
                        {isDeleting && projectToDelete === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Vue en liste */}
        <TabsContent value="list">
          <Card className="bg-white/5 border-white/10 text-white">
            {isLoading ? (
              <div className="divide-y divide-white/10">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40 bg-white/10" />
                        <Skeleton className="h-4 w-60 bg-white/10" />
                      </div>
                      <Skeleton className="h-8 w-24 bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-[#FCDA89] mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-white/70 text-center max-w-md mb-6">
                  {searchQuery || statusFilter
                    ? "Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                    : "Vous n'avez pas encore créé de projet. Commencez par créer votre premier projet de rénovation."}
                </p>
                <Button asChild className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
                  <Link href="/create-project/category">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.title}</h3>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-sm text-white/70">
                          {project.categoryName && project.serviceName 
                            ? `${project.categoryName} • ${project.serviceName}` 
                            : project.categoryName || project.serviceName || ""}
                          {project.city && ` • ${project.city}`}
                          {(project.categoryName || project.serviceName || project.city) && " • "}
                          Créé le {formatDate(project.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                          <Link href={`/client/projets/${project.id}`}>
                            Voir détails
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 w-9 p-0 text-red-400 border-white/10 bg-white/5 hover:text-red-300 hover:bg-red-900/20"
                          onClick={(e) => openDeleteDialog(project.id, e)}
                          disabled={isDeleting}
                        >
                          {isDeleting && projectToDelete === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6">
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Vous avez besoin d&apos;aide ?</CardTitle>
            <CardDescription className="text-white/70">
              Notre équipe est là pour vous accompagner dans votre projet de rénovation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="outline" className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white">
              <MessagesSquare className="mr-2 h-4 w-4" />
              Contacter le support
            </Button>
            <Button variant="outline" className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-white">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le guide
            </Button>
          </CardContent>
        </Card>
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
              onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
              disabled={isDeleting}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
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