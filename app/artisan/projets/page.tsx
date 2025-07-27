"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Briefcase,
  Search,
  Plus,
  Filter,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Calendar,
  FileText,
  Archive,
  X
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet"

interface Project {
  id: string
  title: string
  client: string
  location: string
  description: string
  status: string
  statusColor: string
  progress: number
  startDate: string
  endDate: string
  amount: string
  projectType: string
  messages: number
  lastMessage: string
}

export default function ArtisanProjetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/artisan/projets')
        const data = await response.json()
        
        if (data.success) {
          setProjects(data.projects)
        } else {
          setError(data.error || "Erreur lors du chargement des projets")
        }
      } catch (err) {
        console.error("Erreur lors du chargement des projets:", err)
        setError("Erreur lors du chargement des projets")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  // Filtrer les projets selon le terme de recherche
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Trier les projets par statut
  const activeProjects = filteredProjects.filter(project => project.status === "En cours" || project.status === "Finition")
  const pendingProjects = filteredProjects.filter(project => 
    project.status === "À démarrer" || 
    project.status === "Confirmé" || 
    project.status === "Nouveau" ||
    project.status === "En attente"
  )
  const completedProjects = filteredProjects.filter(project => project.status === "Terminé")

  // Fonction pour afficher une carte de projet
  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white hover:shadow-md transition-shadow">
      <div className="h-1.5 bg-[#FCDA89]"></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-sm text-white">{project.title}</h3>
            <p className="text-white/70 text-xs">{project.client}</p>
          </div>
          <Badge variant="outline" className="bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30 text-xs">
            {project.status}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-3">
          <p className="text-xs text-white/70 line-clamp-2">{project.description}</p>
          <p className="text-xs flex items-center gap-1 text-white/70">
            <MapPin className="h-3 w-3" /> {project.location}
          </p>
        </div>
        
        {project.progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/70">Progression</span>
              <span className="font-medium text-[#FCDA89]">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5 bg-white/20" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-white/70">
            <Clock className="h-3 w-3 mr-1" />
            <span>{project.startDate} - {project.endDate}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[#FCDA89] hover:bg-[#FCDA89]/10" asChild>
              <Link href={`/artisan/projets/${project.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <DropdownMenuItem className="hover:bg-[#FCDA89]/10" onClick={() => {
                  setActiveProject(project)
                  setSheetOpen(true)
                }}>
                  <Pencil className="h-4 w-4 mr-2 text-[#FCDA89]" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FCDA89]/10">
                  <FileText className="h-4 w-4 mr-2 text-[#FCDA89]" />
                  Générer devis
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#FCDA89]/10">
                  <Calendar className="h-4 w-4 mr-2 text-[#FCDA89]" />
                  Planifier RDV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Affichage du loading
  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-[#FCDA89]" />
              Mes Projets
            </h1>
            <p className="text-sm text-white/70">Gérez vos projets et suivez leur avancement</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89] mx-auto mb-2"></div>
            <p>Chargement des projets...</p>
          </div>
        </div>
      </div>
    )
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-[#FCDA89]" />
              Mes Projets
            </h1>
            <p className="text-sm text-white/70">Gérez vos projets et suivez leur avancement</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#FCDA89]" />
            Mes Projets
          </h1>
          <p className="text-sm text-white/70">Gérez vos projets et suivez leur avancement</p>
        </div>
        
        <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C] font-medium" asChild>
          <Link href="/artisan/projets/nouveau">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau projet
          </Link>
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
          <Input
            placeholder="Rechercher un projet, client, ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0E261C] border-[#FCDA89]/30 text-white placeholder:text-white/70"
          />
        </div>
        <Button variant="outline" size="sm" className="bg-[#0E261C] border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Liste des projets */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardHeader className="py-2 px-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm text-white">Tous les projets</CardTitle>
                <CardDescription className="text-xs text-white/70">
                  {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 overflow-hidden flex-1">
            <Tabs defaultValue="active" className="h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-3 h-8 mb-2 p-0.5 bg-[#0E261C] border border-[#FCDA89]/30">
                <TabsTrigger value="active" className="relative text-xs py-1 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
                  En cours
                  {activeProjects.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5 bg-[#FCDA89]/20 text-[#FCDA89]">
                      {activeProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative text-xs py-1 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
                  À démarrer
                  {pendingProjects.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5 bg-[#FCDA89]/20 text-[#FCDA89]">
                      {pendingProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="relative text-xs py-1 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
                  Terminés
                  {completedProjects.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5 bg-[#FCDA89]/20 text-[#FCDA89]">
                      {completedProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="active" className="h-full mt-0">
                  <div className="h-full overflow-y-auto pr-1 space-y-2 scrollbar-hide">
                    {activeProjects.length > 0 ? (
                      activeProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/70">
                        <AlertCircle className="h-8 w-8 mb-2 text-[#FCDA89]" />
                        <p className="text-sm">Aucun projet en cours</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="pending" className="h-full mt-0">
                  <div className="h-full overflow-y-auto pr-1 space-y-2 scrollbar-hide">
                    {pendingProjects.length > 0 ? (
                      pendingProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/70">
                        <AlertCircle className="h-8 w-8 mb-2 text-[#FCDA89]" />
                        <p className="text-sm">Aucun projet à démarrer</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="h-full mt-0">
                  <div className="h-full overflow-y-auto pr-1 space-y-2 scrollbar-hide">
                    {completedProjects.length > 0 ? (
                      completedProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-white/70">
                        <CheckCircle className="h-8 w-8 mb-2 text-[#FCDA89]" />
                        <p className="text-sm">Aucun projet terminé</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Sheet pour les détails du projet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <SheetHeader>
            <SheetTitle className="text-[#FCDA89]">{activeProject?.title}</SheetTitle>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <span>{activeProject?.client}</span>
              <span>•</span>
              <span>{activeProject?.location}</span>
            </div>
          </SheetHeader>
          
          {activeProject && (
            <div className="py-6 space-y-6">
              <div>
                <h4 className="font-medium mb-2 text-[#FCDA89]">Description du projet</h4>
                <p className="text-sm text-white/80">{activeProject.description}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 text-[#FCDA89]">Progression</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Avancement</span>
                    <span className="font-medium text-[#FCDA89]">{activeProject.progress}%</span>
                  </div>
                  <Progress value={activeProject.progress} className="bg-white/20" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-1 text-[#FCDA89]">Montant</h4>
                  <p className="text-lg font-bold text-white">{activeProject.amount}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1 text-[#FCDA89]">Type</h4>
                  <p className="text-sm text-white/80">{activeProject.projectType}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-1 text-[#FCDA89]">Période</h4>
                <p className="text-sm text-white/80">{activeProject.startDate} - {activeProject.endDate}</p>
              </div>
            </div>
          )}
          
          <SheetFooter>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 bg-transparent border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10">
                Contacter client
              </Button>
              <Button className="flex-1 bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C]">
                Modifier projet
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
} 