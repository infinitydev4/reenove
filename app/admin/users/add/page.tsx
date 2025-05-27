"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Save, User } from "lucide-react"
import { Role } from "@/lib/generated/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { toast } from "sonner"

export default function AddUserPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.USER,
    status: "active"
  })
  const [isLoading, setIsLoading] = useState(false)

  // Gérer les changements de formulaire
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Valider le formulaire
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Le nom est requis")
      return false
    }

    if (!formData.email.trim()) {
      toast.error("L'email est requis")
      return false
    }

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("Veuillez entrer un email valide")
      return false
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error("Le mot de passe doit comporter au moins 8 caractères")
      return false
    }

    return true
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création de l'utilisateur")
      }

      const data = await response.json()
      toast.success("Utilisateur créé avec succès")

      // Rediriger vers la page de détail de l'utilisateur créé
      router.push(`/admin/users/${data.id}`)
    } catch (error) {
      console.error("Erreur:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue lors de la création")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
              <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ajouter un utilisateur</h1>
        </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Informations utilisateur</CardTitle>
            <CardDescription className="text-white/70">
              Créez un nouvel utilisateur en renseignant les informations suivantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
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
                placeholder="john.doe@example.com"
                disabled={isLoading}
                className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
              />
              <p className="text-xs text-white/70">
                Le mot de passe doit comporter au moins 8 caractères.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role" className="text-white">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
                disabled={isLoading}
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
                disabled={isLoading}
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => router.push("/admin/users")}
              disabled={isLoading}
              className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer l&apos;utilisateur
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
} 