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
import { toast } from "@/components/ui/toast"

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
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails de l'utilisateur.",
          variant: "destructive",
        })
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
      
      toast({
        title: "Succès",
        description: "Utilisateur mis à jour avec succès",
      })
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
      })
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

      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      })

      // Rediriger vers la liste des utilisateurs
      router.push("/admin/users")
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      })
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
        return <Badge className="bg-red-500">Administrateur</Badge>
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

  // Obtenir le badge de statut
  const getStatusBadge = (status: string | null) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Utilisateur non trouvé</CardTitle>
            <CardDescription>
              L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
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
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Profil utilisateur</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={isDeleting || user.role === Role.ADMIN}
            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
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
          <Button onClick={handleSave} disabled={isSaving}>
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
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'utilisateur</CardTitle>
            <CardDescription>
              Détails du compte utilisateur et paramètres.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} alt={user.name || ""} />
                <AvatarFallback className="text-2xl">{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-xl font-medium">{user.name || "Utilisateur sans nom"}</h3>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  ID: {user.id}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nom de l'utilisateur"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email de l'utilisateur"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger>
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
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
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

        <Card>
          <CardHeader>
            <CardTitle>Activité et détails du compte</CardTitle>
            <CardDescription>
              Informations sur l'historique du compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date de création</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarClock className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Dernière mise à jour</p>
                  <p className="text-sm text-muted-foreground">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email || "Non défini"}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <UserRound className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Type de compte</p>
                  <p className="text-sm text-muted-foreground">
                    {user.role === Role.ADMIN ? "Administrateur" : 
                     user.role === Role.AGENT ? "Agent" : 
                     user.role === Role.ARTISAN ? "Artisan" : "Client"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <ShieldAlert className="h-5 w-5 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <p className="text-sm text-muted-foreground">
                    {user.status === "active" ? "Actif" : 
                     user.status === "inactive" ? "Inactif" : 
                     user.status === "blocked" ? "Bloqué" : "Inconnu"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Actions disponibles</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/users/${user.id}/projects`}>
                    Voir les projets
                  </Link>
                </Button>
                {user.role === Role.ARTISAN && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/artisans/${user.id}`}>
                      Profil artisan
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                  disabled={user.status === "blocked"}
                  onClick={() => handleChange("status", "blocked")}
                >
                  Bloquer l'utilisateur
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 