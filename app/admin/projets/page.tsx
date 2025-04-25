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
  Construction
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { ProjectStatus } from "@/lib/generated/prisma"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

// Données fictives pour la démo
const mockProjects = [
  {
    id: "1",
    title: "Rénovation salle de bain",
    description: "Installation d'une douche italienne et remplacement des carrelages",
    status: ProjectStatus.PUBLISHED,
    budget: 5000,
    createdAt: new Date(2023, 5, 12),
    location: "Lyon",
    user: {
      id: "user1",
      name: "Thomas Martin",
      email: "thomas.martin@example.com",
    },
    category: {
      id: "cat1",
      name: "Plomberie",
    },
    service: {
      id: "serv1",
      name: "Installation salle de bain",
    },
    quotes: 3,
  },
  {
    id: "2",
    title: "Installation électrique complète",
    description: "Refonte complète du système électrique d'un appartement de 80m²",
    status: ProjectStatus.PENDING,
    budget: 3500,
    createdAt: new Date(2023, 5, 15),
    location: "Paris",
    user: {
      id: "user2",
      name: "Sophie Dubois",
      email: "sophie.dubois@example.com",
    },
    category: {
      id: "cat2",
      name: "Électricité",
    },
    service: {
      id: "serv2",
      name: "Installation électrique",
    },
    quotes: 1,
  },
  {
    id: "3",
    title: "Aménagement cuisine",
    description: "Installation de meubles IKEA et plan de travail sur mesure",
    status: ProjectStatus.ASSIGNED,
    budget: 2800,
    createdAt: new Date(2023, 5, 18),
    location: "Marseille",
    user: {
      id: "user3",
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
    },
    category: {
      id: "cat3",
      name: "Menuiserie",
    },
    service: {
      id: "serv3",
      name: "Aménagement cuisine",
    },
    quotes: 5,
  },
  {
    id: "4",
    title: "Peinture salon et chambres",
    description: "Peinture de 3 pièces (environ 60m²) avec préparation des murs",
    status: ProjectStatus.IN_PROGRESS,
    budget: 1500,
    createdAt: new Date(2023, 5, 20),
    location: "Toulouse",
    user: {
      id: "user4",
      name: "Emma Petit",
      email: "emma.petit@example.com",
    },
    category: {
      id: "cat4",
      name: "Peinture",
    },
    service: {
      id: "serv4",
      name: "Peinture intérieure",
    },
    quotes: 2,
  },
  {
    id: "5",
    title: "Pose de parquet",
    description: "Installation de parquet flottant dans un salon de 30m²",
    status: ProjectStatus.COMPLETED,
    budget: 2200,
    createdAt: new Date(2023, 4, 10),
    location: "Bordeaux",
    user: {
      id: "user5",
      name: "Lucas Moreau",
      email: "lucas.moreau@example.com",
    },
    category: {
      id: "cat5",
      name: "Revêtement sol",
    },
    service: {
      id: "serv5",
      name: "Pose de parquet",
    },
    quotes: 4,
  },
  {
    id: "6",
    title: "Réparation toit",
    description: "Remplacement de tuiles cassées et réparation de fuite",
    status: ProjectStatus.DRAFT,
    budget: 1800,
    createdAt: new Date(2023, 5, 22),
    location: "Nantes",
    user: {
      id: "user6",
      name: "Julie Bernard",
      email: "julie.bernard@example.com",
    },
    category: {
      id: "cat6",
      name: "Toiture",
    },
    service: {
      id: "serv6",
      name: "Réparation toiture",
    },
    quotes: 0,
  },
  {
    id: "7",
    title: "Installation de climatisation",
    description: "Pose d'un système de climatisation réversible dans un appartement",
    status: ProjectStatus.CANCELLED,
    budget: 4500,
    createdAt: new Date(2023, 4, 5),
    location: "Nice",
    user: {
      id: "user7",
      name: "Antoine Lefebvre",
      email: "antoine.lefebvre@example.com",
    },
    category: {
      id: "cat7",
      name: "Climatisation",
    },
    service: {
      id: "serv7",
      name: "Installation climatisation",
    },
    quotes: 2,
  },
]

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

export default function ProjetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [projects, setProjects] = useState(mockProjects)
  const [isLoading, setIsLoading] = useState(false)

  // Dans une vraie application, on chargerait les projets depuis l'API
  useEffect(() => {
    // Simulation de chargement
    setIsLoading(true)
    setTimeout(() => {
      setProjects(mockProjects)
      setIsLoading(false)
    }, 500)
  }, [])

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
    // Filtre par recherche (titre, description, localisation ou nom d'utilisateur)
    const matchesSearch = 
      searchTerm === "" || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtre par statut
    const matchesStatus = 
      statusFilter === "all" || 
      project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: projects.length,
    [ProjectStatus.DRAFT]: projects.filter(p => p.status === ProjectStatus.DRAFT).length,
    [ProjectStatus.PENDING]: projects.filter(p => p.status === ProjectStatus.PENDING).length,
    [ProjectStatus.PUBLISHED]: projects.filter(p => p.status === ProjectStatus.PUBLISHED).length,
    [ProjectStatus.ASSIGNED]: projects.filter(p => p.status === ProjectStatus.ASSIGNED).length,
    [ProjectStatus.IN_PROGRESS]: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
    [ProjectStatus.COMPLETED]: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
    [ProjectStatus.CANCELLED]: projects.filter(p => p.status === ProjectStatus.CANCELLED).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">
            Gérez les projets des clients et suivez leur avancement
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> Filtres avancés
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            type="search"
            placeholder="Rechercher par titre, description, lieu..."
            className="w-full pl-9"
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
          <SelectTrigger className="w-full md:w-[180px]">
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

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-sm text-muted-foreground">Total des projets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600">{statusCounts[ProjectStatus.PUBLISHED]}</div>
            <p className="text-sm text-muted-foreground">Projets publiés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-amber-600">{statusCounts[ProjectStatus.IN_PROGRESS]}</div>
            <p className="text-sm text-muted-foreground">Projets en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600">{statusCounts[ProjectStatus.COMPLETED]}</div>
            <p className="text-sm text-muted-foreground">Projets terminés</p>
          </CardContent>
        </Card>
      </div>

      {/* Table des projets */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Liste des projets</CardTitle>
          <CardDescription>
            {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} trouvé{filteredProjects.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Construction className="h-10 w-10 text-muted-foreground animate-pulse" />
                      <p className="mt-2 text-muted-foreground">Chargement des projets...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <AlertCircle className="h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">Aucun projet trouvé</p>
                      {searchTerm && (
                        <Button 
                          variant="link" 
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
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {project.description}
                      </div>
                      {project.quotes > 0 && (
                        <Badge variant="outline" className="mt-1">
                          {project.quotes} devis
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{project.user.name}</div>
                      <div className="text-xs text-muted-foreground">{project.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{project.category.name}</div>
                      <div className="text-xs text-muted-foreground">{project.service.name}</div>
                    </TableCell>
                    <TableCell>
                      {project.budget?.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{project.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(project.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">
                          {formatDistanceToNow(project.createdAt, { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
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
                          <DropdownMenuItem className="text-red-500">
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
    </div>
  )
} 