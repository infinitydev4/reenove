"use client"

import { useEffect, useState } from "react"
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

import { toast } from "sonner"

interface Client {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    projects: number;
  };
}

export default function AdminClientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Charger les clients depuis l'API
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/users')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des clients')
        }
        const data = await response.json()
        setClients(data.users || [])
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error)
        toast.error('Impossible de charger les clients')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Filtrer les clients selon les critères
  const filteredClients = clients.filter((client: Client) => {
    // Filtre de recherche
    const matchesSearch = 
      searchQuery === "" ||
      (client.name && client.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (client.phone && client.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.address && client.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtre par statut - pour l'instant on considère tous les clients comme actifs
    const matchesStatus = selectedStatus ? true : true
    
    // Filtre par type - pour l'instant on considère tous les utilisateurs comme particuliers
    const matchesType = selectedType ? true : true
    
    return matchesSearch && matchesStatus && matchesType
  })
  
  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.")) {
      return
    }

    try {
      const response = await fetch(`/api/users/${clientId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression du client")
      }

      toast.success("Le client a été supprimé avec succès")
      setClients(clients.filter(client => client.id !== clientId))
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression")
    }
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
              {clients.length} clients actifs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets créés
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((sum, c) => sum + c._count.projects, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total des projets créés
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Moyenne projets/client
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.length > 0 ? (clients.reduce((sum, c) => sum + c._count.projects, 0) / clients.length).toFixed(1) : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Projets par client en moyenne
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
                            <AvatarImage src={client.image || undefined} alt={client.name || ""} />
                            <AvatarFallback>{client.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              href={`/admin/clients/${client.id}`}
                              className="font-medium hover:underline"
                            >
                              {client.name || "Utilisateur sans nom"}
                            </Link>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{client.id}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {getStatusBadge("active")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{client.email || "Non défini"}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{client.phone || "Non défini"}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">
                              {client.address ? `${client.address}, ${client.postalCode} ${client.city}` : "Non définie"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getTypeBadge("particulier")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">Projets: {client._count.projects}</div>
                          <div className="text-sm">En cours: 0</div>
                          <div className="text-sm font-medium">Rôle: {client.role}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm flex items-center">
                            <CalendarDays className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>Inscrit le: {new Date(client.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="text-sm flex items-center">
                            <MessageSquare className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>Dernière activité: {new Date(client.updatedAt).toLocaleDateString('fr-FR')}</span>
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