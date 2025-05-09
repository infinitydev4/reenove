"use client"

import { useState } from "react"
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
import { Project } from "@/types/project"

export default function ArtisanProjetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Données fictives pour les projets
  const projects: Project[] = [
    {
      id: "PRJ-001",
      title: "Rénovation complète appartement",
      client: "Martin Dubois",
      location: "Lyon 6ème",
      progress: 65,
      startDate: "10/04/2024",
      endDate: "30/06/2024",
      status: "En cours",
      statusColor: "blue",
      description: "Rénovation complète d'un appartement de 80m², incluant cuisine, salle de bain et réfection électrique.",
    },
    {
      id: "PRJ-002",
      title: "Installation électrique maison",
      client: "Emma Laurent",
      location: "Villeurbanne",
      progress: 80,
      startDate: "01/05/2024",
      endDate: "15/05/2024",
      status: "Finition",
      statusColor: "green",
      description: "Mise aux normes de l'installation électrique d'une maison de 120m² avec ajout de prises et luminaires.",
    },
    {
      id: "PRJ-003",
      title: "Salle de bain moderne",
      client: "Thomas Petit",
      location: "Lyon 3ème",
      progress: 25,
      startDate: "05/05/2024",
      endDate: "20/06/2024",
      status: "En cours",
      statusColor: "blue",
      description: "Rénovation complète d'une salle de bain avec installation d'une douche à l'italienne et double vasque.",
    },
    {
      id: "PRJ-004",
      title: "Cuisine équipée",
      client: "Sophie Martin",
      location: "Caluire",
      progress: 100,
      startDate: "15/03/2024",
      endDate: "20/04/2024",
      status: "Terminé",
      statusColor: "green",
      description: "Installation d'une cuisine équipée sur mesure avec ilôt central et électroménager encastré.",
    },
    {
      id: "PRJ-005",
      title: "Isolation combles",
      client: "Pierre Durand",
      location: "Écully",
      progress: 0,
      startDate: "01/06/2024",
      endDate: "10/06/2024",
      status: "À démarrer",
      statusColor: "orange",
      description: "Isolation des combles perdus d'une maison individuelle de 100m² avec pose de laine de verre.",
    },
    {
      id: "PRJ-006",
      title: "Terrasse bois",
      client: "Isabelle Blanc",
      location: "Tassin-la-Demi-Lune",
      progress: 30,
      startDate: "20/04/2024",
      endDate: "15/05/2024",
      status: "En cours",
      statusColor: "blue",
      description: "Construction d'une terrasse en bois exotique de 30m² avec garde-corps et escalier d'accès.",
    },
  ]

  // Filtrer les projets en fonction du terme de recherche
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Trier les projets par statut
  const activeProjects = filteredProjects.filter(project => project.status === "En cours" || project.status === "Finition")
  const pendingProjects = filteredProjects.filter(project => project.status === "À démarrer")
  const completedProjects = filteredProjects.filter(project => project.status === "Terminé")

  // Fonction pour afficher une carte de projet
  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="overflow-visible hover:shadow-md transition-shadow">
      <div className={`h-1.5 bg-${project.statusColor}-500`}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-sm">{project.title}</h3>
            <p className="text-muted-foreground text-xs">{project.client}</p>
          </div>
          <Badge variant="outline" className={`bg-${project.statusColor}-50 text-${project.statusColor}-700 border-${project.statusColor}-200 text-xs`}>
            {project.status}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
          <p className="text-xs flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" /> {project.location}
          </p>
        </div>
        
        {project.progress > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progression</span>
              <span className="font-medium">{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-1.5" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            <span>{project.startDate} - {project.endDate}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
              <Link href={`/artisan/projets/${project.id}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            
            {/* Dropdown Menu pour desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[180px] z-[1000]"
                  align="end"
                  style={{ position: "absolute" }}
                >
                  <DropdownMenuItem>Modifier</DropdownMenuItem>
                  <DropdownMenuItem>Planifier RDV</DropdownMenuItem>
                  <DropdownMenuItem>Créer facture</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500">Archiver</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Bouton pour ouvrir le drawer sur mobile */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 md:hidden"
              onClick={() => {
                setActiveProject(project);
                setSheetOpen(true);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre et bouton nouveau */}
      <div className="flex justify-between items-center h-10 mb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Projets
        </h1>
        
        <Button size="sm" className="h-8 px-3 py-0" asChild>
          <Link href="/artisan/projets/nouveau">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouveau
          </Link>
        </Button>
      </div>

      {/* Barre de recherche et filtre */}
      <div className="flex mb-3 h-9">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un projet..."
            className="pl-9 pr-12 rounded-r-none h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteneur principal avec les projets */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="py-2 px-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm">Tous les projets</CardTitle>
                <CardDescription className="text-xs">
                  {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 overflow-hidden flex-1">
            <Tabs defaultValue="active" className="h-full flex flex-col">
              <TabsList className="w-full grid grid-cols-3 h-8 mb-2 p-0.5">
                <TabsTrigger value="active" className="relative text-xs py-1">
                  En cours
                  {activeProjects.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5">
                      {activeProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="pending" className="relative text-xs py-1">
                  À démarrer
                  {pendingProjects.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5">
                      {pendingProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="completed" className="relative text-xs py-1">
                  Terminés
                  {completedProjects.length > 0 && (
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5">
                      {completedProjects.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-0 flex-1 overflow-auto pr-1">
                {activeProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600 mb-3">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Aucun projet en cours</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Vous n&apos;avez pas de projets en cours actuellement. Commencez par créer un nouveau projet.
                    </p>
                    <Button className="mt-4" size="sm" asChild>
                      <Link href="/artisan/projets/nouveau">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Nouveau projet
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-0 flex-1 overflow-auto pr-1">
                {pendingProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-orange-100 p-3 text-orange-600 mb-3">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-medium mb-2">Aucun projet à démarrer</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Vous n&apos;avez pas de projets en attente de démarrage actuellement.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0 flex-1 overflow-auto pr-1">
                {completedProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {completedProjects.map(project => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="rounded-full bg-green-100 p-3 text-green-600 mb-3">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-medium mb-2">Aucun projet terminé</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Vous n&apos;avez pas encore de projets terminés. Ils apparaîtront ici une fois complétés.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Drawer d'actions sur mobile */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent 
          side="bottom" 
          className="h-auto max-h-[80vh] overflow-auto rounded-t-xl animate-in slide-in-from-bottom duration-300"
        >
          <SheetHeader className="mb-4">
            <SheetTitle className="text-center">
              Actions
              {activeProject && <span className="text-sm block text-muted-foreground font-normal mt-1">{activeProject.title}</span>}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center gap-3 px-4">
            <Button 
              variant="outline" 
              className="justify-center h-12 w-full text-base font-normal border border-gray-200 rounded-xl"
              onClick={() => setSheetOpen(false)}
            >
              <Pencil className="h-5 w-5 mr-3 text-blue-500" />
              Modifier le projet
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-center h-12 w-full text-base font-normal border border-gray-200 rounded-xl"
              onClick={() => setSheetOpen(false)}
            >
              <Calendar className="h-5 w-5 mr-3 text-purple-500" />
              Planifier un rendez-vous
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-center h-12 w-full text-base font-normal border border-gray-200 rounded-xl"
              onClick={() => setSheetOpen(false)}
            >
              <FileText className="h-5 w-5 mr-3 text-green-500" />
              Créer une facture
            </Button>
            
            <div className="border-t w-full my-3"></div>
            
            <Button 
              variant="outline" 
              className="justify-center h-12 w-full text-base font-normal border border-red-200 text-red-500 hover:bg-red-50 rounded-xl"
              onClick={() => setSheetOpen(false)}
            >
              <Archive className="h-5 w-5 mr-3" />
              Archiver le projet
            </Button>
          </div>
          
          <SheetFooter className="mt-6 px-4">
            <SheetClose asChild>
              <Button variant="outline" className="w-full h-12 border-gray-300 rounded-xl">Annuler</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
} 