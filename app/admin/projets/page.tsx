"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  CalendarDays,
  Check, 
  Download, 
  ExternalLink,
  MoreHorizontal, 
  Search, 
  SlidersHorizontal, 
  Trash2,
  CircleDollarSign,
  FileText,
  Eye,
  Filter,
  MessageSquare,
  Calendar,
  User,
  Tool,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// Données fictives pour la démo
const mockProjets = [
  {
    id: "P-2024-0103",
    title: "Rénovation cuisine complète",
    client: {
      name: "Martin Dupont",
      email: "martin.dupont@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Thomas Dubois",
      profession: "Menuisier",
      avatar: "/placeholder.svg",
    },
    address: "15 rue des Fleurs, 69000 Lyon",
    status: "en_cours",
    budget: "12500€",
    startDate: "12 février 2024",
    endDate: "15 avril 2024",
    progress: 65,
    urgency: "normal",
    lastActivity: "il y a 2 heures",
  },
  {
    id: "P-2024-0097",
    title: "Installation électrique salle de bain",
    client: {
      name: "Julie Lambert",
      email: "julie.lambert@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Sophie Leroy",
      profession: "Électricienne",
      avatar: "/placeholder.svg",
    },
    address: "8 avenue Victor Hugo, 75016 Paris",
    status: "terminé",
    budget: "1800€",
    startDate: "5 février 2024",
    endDate: "15 février 2024",
    progress: 100,
    urgency: "normal",
    lastActivity: "il y a 2 semaines",
  },
  {
    id: "P-2024-0112",
    title: "Réparation fuite plomberie urgente",
    client: {
      name: "Pierre Moreau",
      email: "pierre.moreau@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Marc Petit",
      profession: "Plombier",
      avatar: "/placeholder.svg",
    },
    address: "23 rue de la Paix, 13000 Marseille",
    status: "terminé",
    budget: "450€",
    startDate: "20 février 2024",
    endDate: "21 février 2024",
    progress: 100,
    urgency: "haute",
    lastActivity: "il y a 10 jours",
  },
  {
    id: "P-2024-0118",
    title: "Peinture salon et couloir",
    client: {
      name: "Sophie Mercier",
      email: "sophie.mercier@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Julie Martin",
      profession: "Peintre",
      avatar: "/placeholder.svg",
    },
    address: "42 rue du Port, 33000 Bordeaux",
    status: "en_attente",
    budget: "2200€",
    startDate: "1 mars 2024",
    endDate: "10 mars 2024",
    progress: 0,
    urgency: "normal",
    lastActivity: "il y a 3 jours",
  },
  {
    id: "P-2024-0124",
    title: "Construction abri de jardin",
    client: {
      name: "Jean Lefevre",
      email: "jean.lefevre@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Antoine Blanc",
      profession: "Maçon",
      avatar: "/placeholder.svg",
    },
    address: "17 rue des Lilas, 59000 Lille",
    status: "en_cours",
    budget: "3400€",
    startDate: "25 février 2024",
    endDate: "15 mars 2024",
    progress: 30,
    urgency: "basse",
    lastActivity: "il y a 1 jour",
  },
  {
    id: "P-2024-0132",
    title: "Aménagement dressing sur mesure",
    client: {
      name: "Claire Roux",
      email: "claire.roux@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Émilie Rousseau",
      profession: "Décoratrice d'intérieur",
      avatar: "/placeholder.svg",
    },
    address: "5 rue des Capucines, 31000 Toulouse",
    status: "en_cours",
    budget: "4800€",
    startDate: "10 février 2024",
    endDate: "25 mars 2024",
    progress: 75,
    urgency: "normal",
    lastActivity: "aujourd'hui",
  },
  {
    id: "P-2024-0141",
    title: "Remplacement carrelage salle de bain",
    client: {
      name: "Philippe Girard",
      email: "philippe.girard@exemple.fr",
      avatar: "/placeholder.svg",
    },
    artisan: {
      name: "Lucas Bernard",
      profession: "Carreleur",
      avatar: "/placeholder.svg",
    },
    address: "28 boulevard des Océans, 44000 Nantes",
    status: "en_attente",
    budget: "3100€",
    startDate: "15 mars 2024",
    endDate: "30 mars 2024",
    progress: 0,
    urgency: "normal",
    lastActivity: "il y a 5 jours",
  },
]

export default function AdminProjetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedUrgency, setSelectedUrgency] = useState<string | null>(null)
  const [projets, setProjets] = useState(mockProjets)

  // Filtrer les projets selon les critères
  const filteredProjets = projets.filter(projet => {
    // Filtre de recherche
    const matchesSearch = 
      projet.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      projet.client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      projet.artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projet.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      projet.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtre par statut
    const matchesStatus = selectedStatus ? projet.status === selectedStatus : true
    
    // Filtre par urgence
    const matchesUrgency = selectedUrgency ? projet.urgency === selectedUrgency : true
    
    return matchesSearch && matchesStatus && matchesUrgency
  })
  
  const handleDeleteProjet = (projetId: string) => {
    // Dans une vraie application, une confirmation serait demandée
    // et une requête API serait effectuée pour supprimer le projet
    setProjets(projets.filter(projet => projet.id !== projetId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "terminé":
        return <Badge className="bg-green-500">Terminé</Badge>
      case "en_cours":
        return <Badge className="bg-blue-500">En cours</Badge>
      case "en_attente":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">En attente</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "haute":
        return <Badge variant="destructive">Haute</Badge>
      case "normal":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Normale</Badge>
      case "basse":
        return <Badge variant="outline" className="border-green-500 text-green-500">Basse</Badge>
      default:
        return <Badge variant="outline">Inconnue</Badge>
    }
  }

  const getProgressBar = (progress: number) => {
    return (
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full",
            progress === 100 ? "bg-green-500" : "bg-blue-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projets</h1>
          <p className="text-muted-foreground">
            Gérez tous les projets en cours et passés.
          </p>
        </div>
      </div>

      {/* Vue d'ensemble des projets */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des projets
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projets.length}</div>
            <p className="text-xs text-muted-foreground">
              +{projets.filter(p => p.startDate.includes("mars") || p.startDate.includes("février")).length} ce trimestre
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets en cours
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projets.filter(p => p.status === "en_cours").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {projets.filter(p => p.status === "en_attente").length} en attente de démarrage
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valeur totale des projets
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projets.reduce((sum, p) => sum + parseInt(p.budget.replace("€", "").replace(" ", "")), 0).toLocaleString()}€
            </div>
            <p className="text-xs text-muted-foreground">
              {projets.filter(p => p.status === "terminé").length} projets terminés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par titre, client, artisan..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Statut
                    {selectedStatus && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedStatus && "font-bold")}
                    onClick={() => setSelectedStatus(null)}
                  >
                    Tous
                    {!selectedStatus && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "en_cours" && "font-bold")}
                    onClick={() => setSelectedStatus("en_cours")}
                  >
                    En cours
                    {selectedStatus === "en_cours" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "en_attente" && "font-bold")}
                    onClick={() => setSelectedStatus("en_attente")}
                  >
                    En attente
                    {selectedStatus === "en_attente" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "terminé" && "font-bold")}
                    onClick={() => setSelectedStatus("terminé")}
                  >
                    Terminés
                    {selectedStatus === "terminé" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Urgence
                    {selectedUrgency && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par urgence</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedUrgency && "font-bold")}
                    onClick={() => setSelectedUrgency(null)}
                  >
                    Toutes
                    {!selectedUrgency && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedUrgency === "haute" && "font-bold")}
                    onClick={() => setSelectedUrgency("haute")}
                  >
                    Haute
                    {selectedUrgency === "haute" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedUrgency === "normal" && "font-bold")}
                    onClick={() => setSelectedUrgency("normal")}
                  >
                    Normale
                    {selectedUrgency === "normal" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedUrgency === "basse" && "font-bold")}
                    onClick={() => setSelectedUrgency("basse")}
                  >
                    Basse
                    {selectedUrgency === "basse" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("")
                setSelectedStatus(null)
                setSelectedUrgency(null)
              }}>
                Réinitialiser
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead className="hidden md:table-cell">Artisan</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">Progression</TableHead>
                  <TableHead className="hidden lg:table-cell">Planning</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Aucun projet ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjets.map((projet) => (
                    <TableRow key={projet.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <Link 
                            href={`/admin/projets/${projet.id}`}
                            className="font-medium hover:underline"
                          >
                            {projet.title}
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{projet.id}</span>
                            <span className="hidden sm:inline">• {projet.address.split(",")[1]}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={projet.client.avatar} alt={projet.client.name} />
                            <AvatarFallback>{projet.client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium">{projet.client.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={projet.artisan.avatar} alt={projet.artisan.name} />
                            <AvatarFallback>{projet.artisan.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium">{projet.artisan.name}</div>
                            <div className="text-xs text-muted-foreground">{projet.artisan.profession}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(projet.status)}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{getUrgencyBadge(projet.urgency)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{projet.progress}%</span>
                            <span>{projet.budget}</span>
                          </div>
                          {getProgressBar(projet.progress)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-col">
                          <div className="text-sm flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span>Début: {projet.startDate}</span>
                          </div>
                          <div className="text-sm flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            <span>Fin: {projet.endDate}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/projets/${projet.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/projets/${projet.id}/edit`} className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/projets/${projet.id}/messages`} className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Messages
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleDeleteProjet(projet.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <p className="text-sm text-muted-foreground">
              Affichage de {filteredProjets.length} sur {projets.length} projets
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 