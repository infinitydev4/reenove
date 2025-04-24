"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Check, 
  Copy, 
  Download, 
  MoreHorizontal, 
  PlusCircle, 
  Search, 
  SlidersHorizontal, 
  Trash2,
  UserCircle2,
  Filter
} from "lucide-react"
import { Role } from "@/lib/generated/prisma"
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
const mockUsers = [
  {
    id: "1",
    name: "Sophie Martin",
    email: "sophie.martin@exemple.fr",
    role: Role.USER,
    status: "active",
    lastSeen: "il y a 5 minutes",
    dateCreated: "15 mars 2024",
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Thomas Dubois",
    email: "thomas.dubois@exemple.fr",
    role: Role.ARTISAN,
    status: "active",
    lastSeen: "il y a 1 heure",
    dateCreated: "10 mars 2024",
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Emma Petit",
    email: "emma.petit@exemple.fr",
    role: Role.USER,
    status: "inactive",
    lastSeen: "il y a 3 jours",
    dateCreated: "5 mars 2024",
    avatar: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Lucas Bernard",
    email: "lucas.bernard@exemple.fr",
    role: Role.ARTISAN,
    status: "active",
    lastSeen: "il y a 12 heures",
    dateCreated: "28 février 2024",
    avatar: "/placeholder.svg",
  },
  {
    id: "5",
    name: "Julie Leroy",
    email: "julie.leroy@exemple.fr",
    role: Role.ADMIN,
    status: "active",
    lastSeen: "en ligne",
    dateCreated: "15 février 2024",
    avatar: "/placeholder.svg",
  },
  {
    id: "6",
    name: "Alexandre Moreau",
    email: "alexandre.moreau@exemple.fr",
    role: Role.USER,
    status: "blocked",
    lastSeen: "il y a 1 mois",
    dateCreated: "10 janvier 2024",
    avatar: "/placeholder.svg",
  },
  {
    id: "7",
    name: "Camille Fournier",
    email: "camille.fournier@exemple.fr",
    role: Role.USER,
    status: "active",
    lastSeen: "il y a 2 jours",
    dateCreated: "5 janvier 2024",
    avatar: "/placeholder.svg",
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [users, setUsers] = useState(mockUsers)

  // Filtrer les utilisateurs selon les critères
  const filteredUsers = users.filter(user => {
    // Filtre de recherche
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtre par rôle
    const matchesRole = selectedRole ? user.role === selectedRole : true
    
    // Filtre par statut
    const matchesStatus = selectedStatus ? user.status === selectedStatus : true
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    // Idéalement, afficher un toast de confirmation ici
  }
  
  const handleDeleteUser = (userId: string) => {
    // Dans une vraie application, une confirmation serait demandée
    // et une requête API serait effectuée pour supprimer l'utilisateur
    setUsers(users.filter(user => user.id !== userId))
  }

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Badge className="bg-red-500">Admin</Badge>
      case Role.AGENT:
        return <Badge className="bg-orange-500">Agent</Badge>
      case Role.ARTISAN:
        return <Badge className="bg-blue-500">Artisan</Badge>
      case Role.USER:
        return <Badge variant="outline">Client</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Actif</Badge>
      case "inactive":
        return <Badge variant="outline">Inactif</Badge>
      case "blocked":
        return <Badge variant="destructive">Bloqué</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Utilisateurs</h1>
          <p className="text-muted-foreground">
            Gérez les utilisateurs de la plateforme.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou email..."
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
                    Rôle
                    {selectedRole && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par rôle</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedRole && "font-bold")}
                    onClick={() => setSelectedRole(null)}
                  >
                    Tous
                    {!selectedRole && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedRole === Role.USER && "font-bold")}
                    onClick={() => setSelectedRole(Role.USER)}
                  >
                    Clients
                    {selectedRole === Role.USER && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedRole === Role.ARTISAN && "font-bold")}
                    onClick={() => setSelectedRole(Role.ARTISAN)}
                  >
                    Artisans
                    {selectedRole === Role.ARTISAN && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedRole === Role.ADMIN && "font-bold")}
                    onClick={() => setSelectedRole(Role.ADMIN)}
                  >
                    Administrateurs
                    {selectedRole === Role.ADMIN && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
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
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "active" && "font-bold")}
                    onClick={() => setSelectedStatus("active")}
                  >
                    Actifs
                    {selectedStatus === "active" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "inactive" && "font-bold")}
                    onClick={() => setSelectedStatus("inactive")}
                  >
                    Inactifs
                    {selectedStatus === "inactive" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "blocked" && "font-bold")}
                    onClick={() => setSelectedStatus("blocked")}
                  >
                    Bloqués
                    {selectedStatus === "blocked" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("")
                setSelectedRole(null)
                setSelectedStatus(null)
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
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="hidden md:table-cell">Dernière activité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              {user.email}
                              <button 
                                className="hover:text-primary transition-colors"
                                onClick={() => handleCopyEmail(user.email)}
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.dateCreated}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.lastSeen}</TableCell>
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
                              <Link href={`/admin/users/${user.id}`} className="flex items-center">
                                <UserCircle2 className="mr-2 h-4 w-4" />
                                Voir le profil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleDeleteUser(user.id)}
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
              Affichage de {filteredUsers.length} sur {users.length} utilisateurs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 