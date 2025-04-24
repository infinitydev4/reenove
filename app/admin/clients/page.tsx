"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Check, 
  Download, 
  Filter,
  MoreHorizontal, 
  Search, 
  SlidersHorizontal, 
  Trash2,
  Users,
  MessageSquare,
  FileText,
  Eye,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CircleDollarSign,
  Star
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
const mockClients = [
  {
    id: "C-2024-001",
    name: "Martin Dupont",
    email: "martin.dupont@exemple.fr",
    phone: "06 12 34 56 78",
    address: "15 rue des Fleurs, 69000 Lyon",
    status: "actif",
    type: "particulier",
    totalProjects: 3,
    currentProjects: 1,
    totalSpent: "14500€",
    lastContact: "il y a 2 jours",
    registeredDate: "15 janvier 2023",
    avatar: "/placeholder.svg",
  },
  {
    id: "C-2024-002",
    name: "Julie Lambert",
    email: "julie.lambert@exemple.fr",
    phone: "07 23 45 67 89",
    address: "8 avenue Victor Hugo, 75016 Paris",
    status: "actif",
    type: "particulier",
    totalProjects: 2,
    currentProjects: 0,
    totalSpent: "3800€",
    lastContact: "il y a 2 semaines",
    registeredDate: "3 mars 2023",
    avatar: "/placeholder.svg",
  },
  {
    id: "C-2024-003",
    name: "Immobilier Saint-Michel",
    email: "contact@immobilier-sm.fr",
    phone: "01 23 45 67 89",
    address: "23 rue de la Paix, 13000 Marseille",
    status: "actif",
    type: "professionnel",
    totalProjects: 7,
    currentProjects: 2,
    totalSpent: "45200€",
    lastContact: "hier",
    registeredDate: "10 décembre 2022",
    avatar: "/placeholder.svg",
  },
  {
    id: "C-2024-004",
    name: "Sophie Mercier",
    email: "sophie.mercier@exemple.fr",
    phone: "06 98 76 54 32",
    address: "42 rue du Port, 33000 Bordeaux",
    status: "inactif",
    type: "particulier",
    totalProjects: 1,
    currentProjects: 0,
    totalSpent: "2200€",
    lastContact: "il y a 4 mois",
    registeredDate: "5 juin 2023",
    avatar: "/placeholder.svg",
  },
  {
    id: "C-2024-005",
    name: "Jean Lefevre",
    email: "jean.lefevre@exemple.fr",
    phone: "07 65 43 21 09",
    address: "17 rue des Lilas, 59000 Lille",
    status: "actif",
    type: "particulier",
    totalProjects: 2,
    currentProjects: 1,
    totalSpent: "5400€",
    lastContact: "il y a 1 semaine",
    registeredDate: "20 avril 2023",
    avatar: "/placeholder.svg",
  },
  {
    id: "C-2024-006",
    name: "Appartements Modernes",
    email: "contact@appart-mod.fr",
    phone: "04 56 78 90 12",
    address: "5 rue des Capucines, 31000 Toulouse",
    status: "actif",
    type: "professionnel",
    totalProjects: 12,
    currentProjects: 3,
    totalSpent: "89600€",
    lastContact: "aujourd'hui",
    registeredDate: "15 novembre 2022",
    avatar: "/placeholder.svg",
  },
  {
    id: "C-2024-007",
    name: "Philippe Girard",
    email: "philippe.girard@exemple.fr",
    phone: "06 45 67 89 01",
    address: "28 boulevard des Océans, 44000 Nantes",
    status: "inactif",
    type: "particulier",
    totalProjects: 1,
    currentProjects: 0,
    totalSpent: "3100€",
    lastContact: "il y a 6 mois",
    registeredDate: "2 février 2023",
    avatar: "/placeholder.svg",
  },
]

export default function AdminClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [clients, setClients] = useState(mockClients)

  // Filtrer les clients selon les critères
  const filteredClients = clients.filter(client => {
    // Filtre de recherche
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtre par statut
    const matchesStatus = selectedStatus ? client.status === selectedStatus : true
    
    // Filtre par type
    const matchesType = selectedType ? client.type === selectedType : true
    
    return matchesSearch && matchesStatus && matchesType
  })
  
  const handleDeleteClient = (clientId: string) => {
    // Dans une vraie application, une confirmation serait demandée
    // et une requête API serait effectuée pour supprimer le client
    setClients(clients.filter(client => client.id !== clientId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif":
        return <Badge className="bg-green-500">Actif</Badge>
      case "inactif":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactif</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "particulier":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Particulier</Badge>
      case "professionnel":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Professionnel</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez tous les clients de la plateforme.
          </p>
        </div>
        <Button>
          <Users className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </div>

      {/* Vue d'ensemble des clients */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.status === "actif").length} clients actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets en cours
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + c.currentProjects, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sur {clients.reduce((sum, c) => sum + c.totalProjects, 0)} projets au total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valeur totale générée
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((sum, c) => {
                const value = parseInt(c.totalSpent.replace("€", "").replace(" ", ""))
                return sum + value
              }, 0).toLocaleString()}€
            </div>
            <p className="text-xs text-muted-foreground">
              {(clients.reduce((sum, c) => {
                const value = parseInt(c.totalSpent.replace("€", "").replace(" ", ""))
                return sum + value
              }, 0) / clients.length).toLocaleString()}€ en moyenne par client
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
                placeholder="Rechercher par nom, email, téléphone..."
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
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "actif" && "font-bold")}
                    onClick={() => setSelectedStatus("actif")}
                  >
                    Actifs
                    {selectedStatus === "actif" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "inactif" && "font-bold")}
                    onClick={() => setSelectedStatus("inactif")}
                  >
                    Inactifs
                    {selectedStatus === "inactif" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Type
                    {selectedType && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedType && "font-bold")}
                    onClick={() => setSelectedType(null)}
                  >
                    Tous
                    {!selectedType && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedType === "particulier" && "font-bold")}
                    onClick={() => setSelectedType("particulier")}
                  >
                    Particuliers
                    {selectedType === "particulier" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedType === "professionnel" && "font-bold")}
                    onClick={() => setSelectedType("professionnel")}
                  >
                    Professionnels
                    {selectedType === "professionnel" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("")
                setSelectedStatus(null)
                setSelectedType(null)
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
                  <TableHead>Client</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden lg:table-cell">Projets</TableHead>
                  <TableHead className="hidden lg:table-cell">Activité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun client ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={client.avatar} alt={client.name} />
                            <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              href={`/admin/clients/${client.id}`}
                              className="font-medium hover:underline"
                            >
                              {client.name}
                            </Link>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{client.id}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {getStatusBadge(client.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{client.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{client.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getTypeBadge(client.type)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">Total: {client.totalProjects}</div>
                          <div className="text-sm">En cours: {client.currentProjects}</div>
                          <div className="text-sm font-medium">Dépensé: {client.totalSpent}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm flex items-center">
                            <CalendarDays className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>Inscrit le: {client.registeredDate}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            <MessageSquare className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>Dernier contact: {client.lastContact}</span>
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
                              <Link href={`/admin/clients/${client.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Voir profil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/clients/${client.id}/edit`} className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/clients/${client.id}/projets`} className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Projets
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/clients/${client.id}/messages`} className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Messages
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleDeleteClient(client.id)}
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
              Affichage de {filteredClients.length} sur {clients.length} clients
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 