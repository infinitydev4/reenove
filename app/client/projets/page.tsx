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
  Trash2
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

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mes projets</h1>
          <p className="text-muted-foreground">
            Gérez et suivez tous vos projets de rénovation
          </p>
        </div>
        
        <Button asChild>
          <Link href="/create-project/category">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un projet..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select 
          value={statusFilter || "all"}
          onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-52">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="PENDING">En attente de devis</SelectItem>
            <SelectItem value="PUBLISHED">Publié</SelectItem>
            <SelectItem value="ASSIGNED">Attribué</SelectItem>
            <SelectItem value="IN_PROGRESS">En cours</SelectItem>
            <SelectItem value="COMPLETED">Terminé</SelectItem>
            <SelectItem value="CANCELLED">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="grid" className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid">
              <FileText className="h-4 w-4 mr-2" />
              Grille
            </TabsTrigger>
            <TabsTrigger value="list">
              <FileText className="h-4 w-4 mr-2" />
              Liste
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length > 1 ? "projets" : "projet"}
          </div>
        </div>
        
        {/* Vue en grille */}
        <TabsContent value="grid" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="h-40 bg-muted">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex justify-between mt-4">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery || statusFilter
                    ? "Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                    : "Vous n'avez pas encore créé de projet. Commencez par créer votre premier projet de rénovation."}
                </p>
                <Button asChild>
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
                <Card key={project.id} className="overflow-hidden">
                  <div className="h-40 bg-muted relative">
                    {project.photos && project.photos.length > 0 ? (
                      <img
                        src={project.photos[0]}
                        alt={project.title}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-project.svg"
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <Building className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-1 line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {project.categoryName} {project.serviceName ? `• ${project.serviceName}` : ''}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="line-clamp-1">
                          {project.city || "Non spécifié"}
                          {project.postalCode ? ` (${project.postalCode})` : ""}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <Euro className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>
                          {project.budget 
                            ? `${project.budget.toLocaleString('fr-FR')} €` 
                            : "Budget non défini"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <span>Créé le {formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2 mt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/client/projets/${project.id}`}>
                          Voir détails
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => {
                          toast.error("Voulez-vous vraiment supprimer ce projet?")
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
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
          <Card>
            {isLoading ? (
              <div className="divide-y">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-60" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery || statusFilter
                    ? "Aucun projet ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
                    : "Vous n'avez pas encore créé de projet. Commencez par créer votre premier projet de rénovation."}
                </p>
                <Button asChild>
                  <Link href="/create-project/category">
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>
            ) : (
              <div className="divide-y">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{project.title}</h3>
                          {getStatusBadge(project.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project.categoryName && project.serviceName 
                            ? `${project.categoryName} • ${project.serviceName}` 
                            : project.categoryName || project.serviceName || ""}
                          {project.city && ` • ${project.city}`}
                          {(project.categoryName || project.serviceName || project.city) && " • "}
                          Créé le {formatDate(project.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/projets/${project.id}`}>
                            Voir détails
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            toast.error("Voulez-vous vraiment supprimer ce projet?")
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
        <Card>
          <CardHeader>
            <CardTitle>Vous avez besoin d&apos;aide ?</CardTitle>
            <CardDescription>
              Notre équipe est là pour vous accompagner dans votre projet de rénovation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-4">
            <Button variant="outline" className="w-full sm:w-auto">
              <MessagesSquare className="mr-2 h-4 w-4" />
              Contacter le support
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Télécharger le guide
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 