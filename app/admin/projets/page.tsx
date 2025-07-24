"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Edit, 
  Eye, 
  FileText, 
  Filter, 
  MapPin, 
  MoreHorizontal, 
  Search, 
  Trash,
  X,
  AlertCircle,
  Construction,
  ListFilter,
  Download,
  Loader2,
  Building,
  Euro,
  Grid3X3,
  List
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet"
import { ProjectStatus } from "@/lib/generated/prisma"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { FilterDrawer, FilterGroup } from "@/components/admin/FilterDrawer"
import { toast } from "sonner"
import { ProjectImg } from "@/components/ui/project-image"

interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  budget: number | null;
  budgetMax: number | null;
  location: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: string[];
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  service: {
    id: string;
    name: string;
  } | null;
  _count: {
    quotes: number;
  };
}

// Fonction pour afficher le statut avec le bon style
function getStatusBadge(status: ProjectStatus) {
  switch (status) {
    case ProjectStatus.DRAFT:
      return <Badge variant="outline" className="text-gray-500">Brouillon</Badge>
    case ProjectStatus.PENDING:
      return <Badge variant="outline" className="text-yellow-500">En attente</Badge>
    case ProjectStatus.PUBLISHED:
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Publié</Badge>
    case ProjectStatus.ASSIGNED:
      return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Attribué</Badge>
    case ProjectStatus.IN_PROGRESS:
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En cours</Badge>
    case ProjectStatus.COMPLETED:
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Terminé</Badge>
    case ProjectStatus.CANCELLED:
      return <Badge variant="destructive">Annulé</Badge>
    default:
      return <Badge variant="outline">Inconnu</Badge>
  }
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

export default function ProjetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<Record<string, string | null>>({
    budget: null,
    date: null,
    location: null,
    category: null
  })

  // États pour la gestion de la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Charger les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/projects')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des projets')
        }
        const data = await response.json()
        setProjects(data.projects || [])
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error)
        toast.error('Impossible de charger les projets')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Configuration des filtres avancés
  const advancedFilterGroups: FilterGroup[] = [
    {
      id: "category",
      title: "Catégorie",
      options: [
        { id: "all-cat", label: "Toutes les catégories", value: null as any },
        { id: "plomberie", label: "Plomberie", value: "Plomberie" },
        { id: "electricite", label: "Électricité", value: "Électricité" },
        { id: "menuiserie", label: "Menuiserie", value: "Menuiserie" },
        { id: "peinture", label: "Peinture", value: "Peinture" },
        { id: "revetement", label: "Revêtement sol", value: "Revêtement sol" },
        { id: "toiture", label: "Toiture", value: "Toiture" },
        { id: "climatisation", label: "Climatisation", value: "Climatisation" }
      ]
    },
    {
      id: "location",
      title: "Localisation",
      options: [
        { id: "all-loc", label: "Toutes les localisations", value: null as any },
        { id: "paris", label: "Paris", value: "Paris" },
        { id: "lyon", label: "Lyon", value: "Lyon" },
        { id: "marseille", label: "Marseille", value: "Marseille" },
        { id: "toulouse", label: "Toulouse", value: "Toulouse" },
        { id: "bordeaux", label: "Bordeaux", value: "Bordeaux" },
        { id: "nantes", label: "Nantes", value: "Nantes" },
        { id: "nice", label: "Nice", value: "Nice" }
      ]
    }
  ];

  // Fonction pour changer un filtre avancé
  const handleAdvancedFilterChange = (groupId: string, value: string | null) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [groupId]: value
    }));
  };

  // Fonction pour réinitialiser tous les filtres
  const handleResetFilters = () => {
    setAdvancedFilters({
      budget: null,
      date: null,
      location: null,
      category: null
    });
    setStatusFilter("all");
    setSearchTerm("");
  };

  // Fonction pour gérer la suppression de projet
  const handleDeleteProject = async (projectId: string) => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/admin/projects/${projectId}`, {
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
  const openDeleteDialog = (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setProjectToDelete(projectId)
    setDeleteDialogOpen(true)
  }

  // Filtrage des projets
  const filteredProjects = projects.filter((project: Project) => {
    // Filtre par recherche (titre, description, localisation ou nom d'utilisateur)
    const matchesSearch = 
      searchTerm === "" || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.user.name && project.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Filtre par statut
    const matchesStatus = 
      statusFilter === "all" || 
      project.status === statusFilter

    // Filtre par catégorie
    const matchesCategory = 
      !advancedFilters.category || 
      (project.category && project.category.name === advancedFilters.category)

    // Filtre par localisation
    const matchesLocation = 
      !advancedFilters.location || 
      (project.city && project.city === advancedFilters.location)

    return matchesSearch && matchesStatus && matchesCategory && matchesLocation
  })

  const statusCounts = {
    all: projects.length,
    [ProjectStatus.DRAFT]: projects.filter((p: Project) => p.status === ProjectStatus.DRAFT).length,
    [ProjectStatus.PENDING]: projects.filter((p: Project) => p.status === ProjectStatus.PENDING).length,
    [ProjectStatus.PUBLISHED]: projects.filter((p: Project) => p.status === ProjectStatus.PUBLISHED).length,
    [ProjectStatus.ASSIGNED]: projects.filter((p: Project) => p.status === ProjectStatus.ASSIGNED).length,
    [ProjectStatus.IN_PROGRESS]: projects.filter((p: Project) => p.status === ProjectStatus.IN_PROGRESS).length,
    [ProjectStatus.COMPLETED]: projects.filter((p: Project) => p.status === ProjectStatus.COMPLETED).length,
    [ProjectStatus.CANCELLED]: projects.filter((p: Project) => p.status === ProjectStatus.CANCELLED).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Projets</h1>
          <p className="text-white/70">
            Gérez les projets des clients et suivez leur avancement
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* FilterDrawer pour desktop */}
          <FilterDrawer
            title="Filtres avancés"
            description="Filtrez les projets selon différents critères"
            side="right"
            className="hidden md:block"
            trigger={
              <Button variant="outline" className="flex items-center gap-2 hidden md:flex bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                <ListFilter className="h-4 w-4" /> Filtres avancés
              </Button>
            }
            filterGroups={advancedFilterGroups}
            selectedFilters={advancedFilters}
            onFilterChange={handleAdvancedFilterChange}
            onResetFilters={handleResetFilters}
          />
          
          {/* FilterDrawer pour mobile */}
          <FilterDrawer
            title="Filtres avancés"
            description="Filtrez les projets selon différents critères"
            side="bottom"
            isMobile={true}
            trigger={
              <Button variant="outline" className="flex items-center gap-2 md:hidden bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                <ListFilter className="h-4 w-4" /> Filtres avancés
              </Button>
            }
            filterGroups={advancedFilterGroups}
            selectedFilters={advancedFilters}
            onFilterChange={handleAdvancedFilterChange}
            onResetFilters={handleResetFilters}
          />
          
          <Button className="flex items-center gap-2 bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold">
            <Download className="h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Rechercher par titre, description, lieu..."
            className="w-full pl-9 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-white/5 border-[#FCDA89]/20 text-white">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts ({statusCounts.all})</SelectItem>
            <SelectItem value={ProjectStatus.DRAFT}>Brouillon ({statusCounts[ProjectStatus.DRAFT]})</SelectItem>
            <SelectItem value={ProjectStatus.PENDING}>En attente ({statusCounts[ProjectStatus.PENDING]})</SelectItem>
            <SelectItem value={ProjectStatus.PUBLISHED}>Publié ({statusCounts[ProjectStatus.PUBLISHED]})</SelectItem>
            <SelectItem value={ProjectStatus.ASSIGNED}>Attribué ({statusCounts[ProjectStatus.ASSIGNED]})</SelectItem>
            <SelectItem value={ProjectStatus.IN_PROGRESS}>En cours ({statusCounts[ProjectStatus.IN_PROGRESS]})</SelectItem>
            <SelectItem value={ProjectStatus.COMPLETED}>Terminé ({statusCounts[ProjectStatus.COMPLETED]})</SelectItem>
            <SelectItem value={ProjectStatus.CANCELLED}>Annulé ({statusCounts[ProjectStatus.CANCELLED]})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Affichage des filtres actifs */}
      {(advancedFilters.category || advancedFilters.location || statusFilter !== "all") && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/70">Filtres actifs:</span>
          
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="h-6 gap-1">
              Statut: {
                statusFilter === ProjectStatus.DRAFT ? "Brouillon" :
                statusFilter === ProjectStatus.PENDING ? "En attente" :
                statusFilter === ProjectStatus.PUBLISHED ? "Publié" :
                statusFilter === ProjectStatus.ASSIGNED ? "Attribué" :
                statusFilter === ProjectStatus.IN_PROGRESS ? "En cours" :
                statusFilter === ProjectStatus.COMPLETED ? "Terminé" :
                "Annulé"
              }
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => setStatusFilter("all")}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {advancedFilters.category && (
            <Badge variant="secondary" className="h-6 gap-1">
              Catégorie: {advancedFilters.category}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handleAdvancedFilterChange("category", null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          {advancedFilters.location && (
            <Badge variant="secondary" className="h-6 gap-1">
              Localisation: {advancedFilters.location}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handleAdvancedFilterChange("location", null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            className="h-6 text-xs bg-[#FCDA89] text-[#0E261C]"
            onClick={handleResetFilters}
          >
            Réinitialiser tous
          </Button>
        </div>
      )}

      {/* Statistiques améliorées avec design moderne */}
      <div className="grid grid-cols-4 gap-2 md:gap-4">
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-4xl font-bold text-blue-400">{projects.length}</span>
            <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">Total</span>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-4xl font-bold text-purple-400">{statusCounts[ProjectStatus.PUBLISHED]}</span>
            <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">Publiés</span>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-4xl font-bold text-amber-400">{statusCounts[ProjectStatus.IN_PROGRESS]}</span>
            <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">En cours</span>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            <span className="text-2xl md:text-4xl font-bold text-green-400">{statusCounts[ProjectStatus.COMPLETED]}</span>
            <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">Terminés</span>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour changer de vue */}
      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList className="bg-white/10 text-white">
            <TabsTrigger value="grid" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Cartes
            </TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <List className="h-4 w-4 mr-2" />
              Liste
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-white/70">
            {filteredProjects.length} projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Vue en grille (cartes) */}
        <TabsContent value="grid" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-white/10 rounded mb-3 w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded mb-2"></div>
                      <div className="h-3 bg-white/10 rounded mb-4 w-1/2"></div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-white/10 rounded w-16"></div>
                        <div className="h-6 bg-white/10 rounded w-16"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-white/50 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Aucun projet trouvé</h3>
                <p className="text-white/70 text-center">
                  {searchTerm || statusFilter !== "all" || advancedFilters.category || advancedFilters.location
                    ? "Aucun projet ne correspond à vos critères de recherche."
                    : "Aucun projet n'est disponible pour le moment."}
                </p>
                {(searchTerm || statusFilter !== "all" || advancedFilters.category || advancedFilters.location) && (
                  <Button 
                    variant="link" 
                    className="text-[#FCDA89] hover:text-[#FCDA89]/80 mt-2"
                    onClick={handleResetFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm hover:bg-white/10 transition-colors overflow-hidden">
                  {/* Section image */}
                  <div className="h-[200px] bg-white/10 relative">
                    {project.photos && project.photos.length > 0 ? (
                      <>
                        <ProjectImg
                          src={project.photos[0]}
                          alt={project.title}
                          className="object-cover w-full h-full"
                        />
                        
                        {/* Afficher des miniatures des images supplémentaires si disponibles */}
                        {project.photos.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 p-1 bg-black/30 backdrop-blur-sm rounded-lg">
                            {project.photos.slice(1, 4).map((photo, index) => (
                              <div key={index} className="h-12 w-12 rounded-md overflow-hidden border border-white/30">
                                <ProjectImg
                                  src={photo}
                                  alt={`Photo ${index + 2}`}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                            ))}
                            {project.photos.length > 4 && (
                              <div className="h-12 w-12 rounded-md overflow-hidden border border-white/30 flex items-center justify-center bg-black/50 text-white font-medium text-xs">
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

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-base line-clamp-1 mb-1">{project.title}</CardTitle>
                        <CardDescription className="text-white/70 text-sm line-clamp-2">
                          {project.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Informations du client */}
                    <div className="space-y-1">
                      <div className="text-xs text-white/50">Client</div>
                      <div className="text-sm text-white font-medium">{project.user.name || 'N/A'}</div>
                      <div className="text-xs text-white/70">{project.user.email}</div>
                    </div>

                    {/* Catégorie et service */}
                    <div className="space-y-1">
                      <div className="text-xs text-white/50">Catégorie</div>
                      <div className="text-sm text-white">{project.category?.name || 'Non définie'}</div>
                      <div className="text-xs text-white/70">{project.service?.name || 'Non défini'}</div>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-white">
                        {project.budget ? `${project.budget.toLocaleString('fr-FR')} €` : 'Budget non défini'}
                      </span>
                    </div>

                    {/* Localisation */}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-white/70" />
                      <span className="text-sm text-white line-clamp-1">
                        {project.city ? `${project.city}${project.postalCode ? ` (${project.postalCode})` : ''}` : project.location || 'Non spécifiée'}
                      </span>
                    </div>

                    {/* Date et devis */}
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: fr })}</span>
                      </div>
                      {project._count.quotes > 0 && (
                        <Badge variant="outline" className="bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30 text-xs">
                          {project._count.quotes} devis
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex gap-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                        <Link href={`/admin/projets/${project.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
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
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Vue en liste (tableau) */}
        <TabsContent value="list">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader className="pb-1">
              <CardTitle className="text-white">Liste des projets</CardTitle>
              <CardDescription className="text-white/70">
                {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} trouvé{filteredProjects.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Projet</TableHead>
                    <TableHead className="text-white/70">Client</TableHead>
                    <TableHead className="text-white/70">Catégorie</TableHead>
                    <TableHead className="text-white/70">Budget</TableHead>
                    <TableHead className="text-white/70">Localisation</TableHead>
                    <TableHead className="text-white/70">Statut</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                    <TableHead className="text-right text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <Construction className="h-10 w-10 text-white/50 animate-pulse" />
                          <p className="mt-2 text-white/70">Chargement des projets...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProjects.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell colSpan={8} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="h-10 w-10 text-white/50" />
                          <p className="mt-2 text-white/70">Aucun projet trouvé</p>
                          {searchTerm && (
                            <Button 
                              variant="link" 
                              className="text-[#FCDA89] hover:text-[#FCDA89]/80"
                              onClick={() => {
                                setSearchTerm("")
                                setStatusFilter("all")
                              }}
                            >
                              Réinitialiser les filtres
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id} className="border-white/10 hover:bg-white/5">
                        <TableCell>
                          <div className="font-medium text-white">{project.title}</div>
                          <div className="text-xs text-white/70 truncate max-w-[200px]">
                            {project.description}
                          </div>
                          {project._count.quotes > 0 && (
                            <Badge variant="outline" className="mt-1 bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30">
                              {project._count.quotes} devis
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white">{project.user.name}</div>
                          <div className="text-xs text-white/70">{project.user.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-white">{project.category?.name || 'Non définie'}</div>
                          <div className="text-xs text-white/70">{project.service?.name || 'Non défini'}</div>
                        </TableCell>
                        <TableCell className="text-white">
                          {project.budget?.toLocaleString('fr-FR')} €
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-white/50" />
                            <span className="text-white">{project.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(project.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-white/50" />
                            <span className="text-xs text-white">
                              {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/projets/${project.id}`}>
                                  <Eye className="h-4 w-4 mr-2" /> Voir détails
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" /> Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => openDeleteDialog(project.id)}
                              >
                                <Trash className="h-4 w-4 mr-2" /> Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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