"use client"

import { useState, useEffect } from "react"
import { Settings, Save, User, Bell, Shield, Camera, Pencil, LogOut, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface UserProfile {
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  address?: string
  city?: string
  postalCode?: string
  companyName?: string
  siren?: string
  avatar?: string
}

export default function ArtisanParametresPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const notificationSettings = [
    { id: "new-messages", label: "Nouveaux messages", enabled: true },
    { id: "appointment-reminder", label: "Rappels de rendez-vous", enabled: true },
    { id: "quote-updates", label: "Mises à jour de devis", enabled: true },
    { id: "project-updates", label: "Mises à jour de projets", enabled: false },
    { id: "marketing", label: "Offres et actualités", enabled: false }
  ]

  // Récupérer le profil utilisateur
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/artisan/profile')
        const data = await response.json()
        
        if (response.ok) {
          setUserProfile(data)
        } else {
          setError(data.error || "Erreur lors du chargement du profil")
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err)
        setError("Erreur lors du chargement du profil")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async (formData: FormData) => {
    try {
      setSaving(true)
      const response = await fetch('/api/artisan/profile', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setUserProfile(data)
        setIsEditing(false)
        toast.success("Profil mis à jour avec succès")
      } else {
        toast.error(data.error || "Erreur lors de la sauvegarde")
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err)
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    handleSaveProfile(formData)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#FCDA89]" />
              Paramètres
            </h1>
            <p className="text-sm text-white/70">Gérez votre profil et vos préférences</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89] mx-auto mb-2"></div>
            <p>Chargement du profil...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-[#FCDA89]" />
              Paramètres
            </h1>
            <p className="text-sm text-white/70">Gérez votre profil et vos préférences</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#FCDA89]" />
            Paramètres
          </h1>
          <p className="text-sm text-white/70">Gérez votre profil et vos préférences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col">
        <TabsList className="w-full max-w-md h-10 grid grid-cols-3 bg-[#0E261C] border border-[#FCDA89]/30 mb-4">
          <TabsTrigger value="profile" className="flex items-center gap-1.5 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Profil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1.5 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto space-y-4">
          <TabsContent value="profile" className="space-y-4 mt-0">
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-[#FCDA89]">Informations personnelles</CardTitle>
                <CardDescription className="text-white/70">
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Photo de profil */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                        <AvatarFallback className="bg-[#FCDA89]/20 text-white text-lg">
                          {userProfile.name?.split(' ').map(n => n[0]).join('') || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#FCDA89] border-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/80"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{userProfile.name}</h3>
                      <p className="text-sm text-white/70">{userProfile.companyName || "Artisan"}</p>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Formulaire */}
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Nom complet</Label>
                        <Input
                          id="name"
                          name="name"
                          defaultValue={userProfile.name}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-white">Entreprise</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          defaultValue={userProfile.companyName || ""}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          defaultValue={userProfile.email}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">Téléphone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          defaultValue={userProfile.phone || ""}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="address" className="text-white">Adresse</Label>
                        <Input
                          id="address"
                          name="address"
                          defaultValue={userProfile.address || ""}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-white">Ville</Label>
                        <Input
                          id="city"
                          name="city"
                          defaultValue={userProfile.city || ""}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-white">Code postal</Label>
                        <Input
                          id="postalCode"
                          name="postalCode"
                          defaultValue={userProfile.postalCode || ""}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siren" className="text-white">SIREN</Label>
                        <Input
                          id="siren"
                          name="siren"
                          defaultValue={userProfile.siren || ""}
                          disabled={!isEditing}
                          className="bg-transparent border-white/20 text-white disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-transparent border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {isEditing ? "Annuler" : "Modifier"}
                  </Button>
                  {isEditing && (
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C]"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Sauvegarde..." : "Sauvegarder"}
                    </Button>
                  )}
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-0">
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardHeader>
                <CardTitle className="text-[#FCDA89]">Préférences de notification</CardTitle>
                <CardDescription className="text-white/70">
                  Choisissez les notifications que vous souhaitez recevoir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-2">
                    <div>
                      <Label htmlFor={setting.id} className="text-white font-medium">
                        {setting.label}
                      </Label>
                    </div>
                    <Switch
                      id={setting.id}
                      defaultChecked={setting.enabled}
                      className="data-[state=checked]:bg-[#FCDA89]"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-0">
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardHeader>
                <CardTitle className="text-[#FCDA89]">Sécurité du compte</CardTitle>
                <CardDescription className="text-white/70">
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-white">Mot de passe actuel</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-transparent border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-white">Nouveau mot de passe</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="bg-transparent border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-white">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-transparent border-white/20 text-white"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C]">
                  Modifier le mot de passe
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-[#0E261C] border-red-500/30 text-white">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Zone de danger
                </CardTitle>
                <CardDescription className="text-white/70">
                  Actions irréversibles sur votre compte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                  <LogOut className="h-4 w-4 mr-2" />
                  Supprimer le compte
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
} 