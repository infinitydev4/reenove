"use client"

import { useState, useEffect } from "react"
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
  Filter,
  Loader2
} from "lucide-react"
import { formatDistance } from "date-fns"
import { fr } from "date-fns/locale"
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
import { toast } from "sonner"

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: Role;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  })
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Fonction pour charger les utilisateurs
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedRole) params.append("role", selectedRole)
      if (selectedStatus) params.append("status", selectedStatus)
      params.append("page", pagination.page.toString())
      params.append("limit", pagination.limit.toString())

      const response = await fetch(`/api/users?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs")
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de charger les utilisateurs. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les utilisateurs au chargement et lors des changements de filtres
  useEffect(() => {
    loadUsers()
  }, [searchQuery, selectedRole, selectedStatus, pagination.page, pagination.limit])

  // Formater la date relative
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistance(date, new Date(), { addSuffix: true, locale: fr })
    } catch (error) {
      return "Date inconnue"
    }
  }

  // Formater la date d'inscription
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    } catch (error) {
      return "Date inconnue"
    }
  }

  const handleCopyEmail = (email: string) => {
    if (!email) return
    navigator.clipboard.writeText(email)
    toast.success("L'email a été copié dans le presse-papiers")
  }
  
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return
    }

    setIsDeleting(userId)
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression de l'utilisateur")
      }

      toast.success("L'utilisateur a été supprimé avec succès")

      // Recharger les utilisateurs après suppression
      loadUsers()
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression")
    } finally {
      setIsDeleting(null)
    }
  }

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Admin</Badge>
      case Role.AGENT:
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Agent</Badge>
      case Role.ARTISAN:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Artisan</Badge>
      case Role.USER:
        return <Badge variant="outline" className="bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30">Client</Badge>
      default:
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inconnu</Badge>
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Actif</Badge>
      case "inactive":
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactif</Badge>
      case "blocked":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Bloqué</Badge>
      case null:
      case undefined:
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Actif</Badge>
      default:
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inconnu</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Utilisateurs</h1>
          <p className="text-white/70">
            Gérez les utilisateurs de la plateforme.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold" asChild>
            <Link href="/admin/users/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Link>
          </Button>
        </div>
      </div>

      <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-9 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                <Filter className="mr-2 h-4 w-4" />
                Rôle
                {selectedRole && <Badge className="ml-2 bg-[#FCDA89]/20 text-[#FCDA89]">1</Badge>}
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
                                <Button variant="outline" size="sm" className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Statut
                {selectedStatus && <Badge className="ml-2 bg-[#FCDA89]/20 text-[#FCDA89]">1</Badge>}
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
              
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedRole(null)
                  setSelectedStatus(null)
                }}
              >
                Réinitialiser
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                disabled={isLoading || users.length === 0}
                onClick={() => {
                  toast("Cette fonctionnalité sera disponible prochainement.")
                }}
              >
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
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Utilisateur</TableHead>
                  <TableHead className="text-white/70">Rôle</TableHead>
                  <TableHead className="text-white/70">Statut</TableHead>
                  <TableHead className="text-white/70">Inscription</TableHead>
                  <TableHead className="hidden md:table-cell text-white/70">Dernière activité</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FCDA89] mr-2" />
                        <span className="text-white">Chargement des utilisateurs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="text-center py-8 text-white/70">
                      Aucun utilisateur ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                            <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">{user.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="font-medium text-white">{user.name || "Utilisateur sans nom"}</div>
                            <div className="text-xs text-white/70 flex items-center gap-1">
                              {user.email || "Email non défini"}
                              {user.email && (
                                <button 
                                  className="hover:text-[#FCDA89] transition-colors"
                                  onClick={() => handleCopyEmail(user.email || "")}
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-white">{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="hidden md:table-cell text-white">{formatRelativeDate(user.updatedAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
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
                              className={cn(
                                "text-red-500 cursor-pointer",
                                isDeleting === user.id && "opacity-50 cursor-not-allowed"
                              )}
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              {isDeleting === user.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Suppression...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Supprimer
                                </>
                              )}
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
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                disabled={pagination.page >= pagination.pages || isLoading}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Suivant
              </Button>
            </div>
            <p className="text-sm text-white/70">
              {isLoading 
                ? "Chargement..." 
                : `Page ${pagination.page}/${pagination.pages || 1} • ${pagination.total} utilisateur${pagination.total > 1 ? "s" : ""}`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 