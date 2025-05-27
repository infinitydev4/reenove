"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  Mail, 
  CalendarClock, 
  UserRound, 
  ShieldAlert, 
  Trash2, 
  Save,
  Loader2
} from "lucide-react"
import { Role } from "@/lib/generated/prisma"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    status: ""
  })
  
  // Charger les détails de l'utilisateur
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${params.id}`)
        if (!response.ok) {
          throw new Error("Utilisateur non trouvé")
        }
        const userData = await response.json()
        setUser(userData)
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          role: userData.role,
          status: userData.status || "active"
        })
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Impossible de charger les détails de l'utilisateur.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id])

  // Gérer les changements de formulaire
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Sauvegarder les modifications
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour de l'utilisateur")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      
      toast.success("Utilisateur mis à jour avec succès")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour")
    } finally {
      setIsSaving(false)
    }
  }

  // Supprimer l'utilisateur
  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression de l'utilisateur")
      }

      toast.success("L'utilisateur a été supprimé avec succès")

      // Rediriger vers la liste des utilisateurs
      router.push("/admin/users")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression")
      setIsDeleting(false)
    }
  }

  // Formatage des dates
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd MMMM yyyy 'à' HH:mm", { locale: fr })
    } catch (error) {
      return "Date inconnue"
    }
  }

  // Obtenir le badge de rôle
  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Administrateur</Badge>
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

  // Obtenir le badge de statut
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FCDA89]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Utilisateur non trouvé</CardTitle>
            <CardDescription className="text-white/70">
              L&apos;utilisateur que vous recherchez n&apos;existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold">
              <Link href="/admin/users">Retour à la liste des utilisateurs</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profil utilisateur</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={isDeleting || user.role === Role.ADMIN}
            className="text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
          >
            {isDeleting ? (
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
          </Button>
          <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Informations de l&apos;utilisateur</CardTitle>
            <CardDescription className="text-white/70">
              Détails du compte utilisateur et paramètres.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                <AvatarFallback className="text-2xl bg-[#FCDA89] text-[#0E261C] font-semibold">{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-medium text-white">{user.name || "Utilisateur sans nom"}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <p className="text-sm text-white/70">
                  ID: {user.id}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-white">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom de l'utilisateur"
                  className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email de l'utilisateur"
                  className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="text-white">Rôle</Label>
                              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
              >
                <SelectTrigger className="bg-white/5 border-[#FCDA89]/20 text-white">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rôles</SelectLabel>
                      <SelectItem value={Role.USER}>Client</SelectItem>
                      <SelectItem value={Role.ARTISAN}>Artisan</SelectItem>
                      <SelectItem value={Role.AGENT}>Agent</SelectItem>
                      <SelectItem value={Role.ADMIN}>Administrateur</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status" className="text-white">Statut</Label>
                              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger className="bg-white/5 border-[#FCDA89]/20 text-white">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Statuts</SelectLabel>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="blocked">Bloqué</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Activité et détails du compte</CardTitle>
            <CardDescription className="text-white/70">
              Informations sur l&apos;historique du compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Date de création</p>
                  <p className="text-sm text-white/70">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Dernière mise à jour</p>
                  <p className="text-sm text-white/70">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <p className="text-sm text-white/70">{user.email || "Non défini"}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Type de compte</p>
                  <p className="text-sm text-white/70">
                    {user.role === Role.ADMIN ? "Administrateur" : 
                     user.role === Role.AGENT ? "Agent" : 
                     user.role === Role.ARTISAN ? "Artisan" : "Client"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Statut</p>
                  <p className="text-sm text-white/70">
                    {user.status === "active" ? "Actif" : 
                     user.status === "inactive" ? "Inactif" : 
                     user.status === "blocked" ? "Bloqué" : "Actif"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white">Actions disponibles</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                  <Link href={`/admin/users/${user.id}/projects`}>
                    Voir les projets
                  </Link>
                </Button>
                {user.role === Role.ARTISAN && (
                  <Button variant="outline" size="sm" asChild className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                    <Link href={`/admin/artisans/${user.id}`}>
                      Profil artisan
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-400 border-red-500/20 hover:bg-red-500/20 hover:text-red-300"
                  disabled={user.status === "blocked"}
                  onClick={() => handleChange("status", "blocked")}
                >
                  Bloquer l&apos;utilisateur
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 