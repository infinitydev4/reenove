"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
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
import GoogleAddressAutocomplete from "@/components/maps/GoogleAddressAutocomplete"

interface ClientProfile {
  name: string
  email: string
  phone: string
  avatar: string
  address: string
  city: string
  postalCode: string
}

interface NotificationSetting {
  id: string
  label: string
  enabled: boolean
}

export default function ClientParametresPage() {
  const { data: session, status } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<ClientProfile>({
    name: "",
    email: "",
    phone: "",
    avatar: "/placeholder.svg?height=128&width=128",
    address: "",
    city: "",
    postalCode: ""
  })
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" })

  // Charger les données utilisateur depuis l'API
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "authenticated" && session?.user) {
        try {
          const response = await fetch('/api/client/profile')
          if (response.ok) {
            const data = await response.json()
            setUserProfile({
              name: data.user.name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              avatar: data.user.image || "/placeholder.svg?height=128&width=128",
              address: data.user.address || "",
              city: data.user.city || "",
              postalCode: data.user.postalCode || ""
            })
          } else {
            // Fallback vers les données de session si l'API échoue
            setUserProfile({
              name: session.user.name || "",
              email: session.user.email || "",
              phone: session.user.phone || "",
              avatar: session.user.image || "/placeholder.svg?height=128&width=128",
              address: session.user.address || "",
              city: session.user.city || "",
              postalCode: session.user.postalCode || ""
            })
          }
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error)
          // Fallback vers les données de session
          setUserProfile({
            name: session.user.name || "",
            email: session.user.email || "",
            phone: session.user.phone || "",
            avatar: session.user.image || "/placeholder.svg?height=128&width=128",
            address: session.user.address || "",
            city: session.user.city || "",
            postalCode: session.user.postalCode || ""
          })
        } finally {
          setLoading(false)
        }
      } else if (status === "loading") {
        setLoading(true)
      } else {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [session, status])

  // Charger les projets de l'utilisateur
  useEffect(() => {
    const fetchProjects = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/client/projects')
          if (response.ok) {
            const data = await response.json()
            setProjects(Array.isArray(data) ? data : [])
          } else {
            console.error('Erreur lors du chargement des projets')
            setProjects([])
          }
        } catch (error) {
          console.error('Erreur lors du chargement des projets:', error)
          setProjects([])
        } finally {
          setLoadingProjects(false)
        }
      }
    }
    
    fetchProjects()
  }, [session?.user])

  // Gérer la déconnexion
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth' })
  }

  // Sauvegarder les modifications du profil
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const updatedProfile = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: userProfile.address, // Utiliser l'adresse de l'autocomplétion
      city: userProfile.city,
      postalCode: userProfile.postalCode,
    }

    try {
      const response = await fetch('/api/client/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()
      
      // Mettre à jour l'état local avec les données du serveur
      setUserProfile(prev => ({
        ...prev,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || "",
        address: result.user.address || "",
        city: result.user.city || "",
        postalCode: result.user.postalCode || ""
      }))
      
      setIsEditing(false)
      setSaveStatus({ type: 'success', message: 'Profil mis à jour avec succès !' })
      
      // Masquer le message après 3 secondes
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000)
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setSaveStatus({ type: 'error', message: error instanceof Error ? error.message : 'Erreur lors de la sauvegarde' })
      
      // Masquer le message après 5 secondes
      setTimeout(() => setSaveStatus({ type: null, message: "" }), 5000)
    }
  }

  // Fonction pour gérer la sélection d'adresse via Google Autocomplete
  const handleAddressSelect = (place: google.maps.places.PlaceResult) => {
    if (place.formatted_address) {
      let city = ""
      let postalCode = ""
      
      // Extraire ville et code postal des composants d'adresse
      if (place.address_components) {
        place.address_components.forEach(component => {
          const types = component.types
          if (types.includes('locality')) {
            city = component.long_name
          } else if (types.includes('postal_code')) {
            postalCode = component.long_name
          }
        })
      }
      
      setUserProfile(prev => ({
        ...prev,
        address: place.formatted_address || "",
        city,
        postalCode
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  const notificationSettings: NotificationSetting[] = [
    { id: "new-messages", label: "Nouveaux messages", enabled: true },
    { id: "appointment-reminder", label: "Rappels de rendez-vous", enabled: true },
    { id: "quote-updates", label: "Mises à jour de devis", enabled: true },
    { id: "project-updates", label: "Mises à jour de projets", enabled: true },
    { id: "recommendations", label: "Recommandations d'artisans", enabled: false },
    { id: "marketing", label: "Offres et actualités", enabled: false }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre */}
      <div className="flex justify-between items-center h-10 mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-[#FCDA89]" />
          Paramètres
        </h1>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col">
        <div className="mb-6 w-full overflow-x-auto">
          <TabsList className="w-full max-w-md h-10 grid grid-cols-3 bg-white/10 text-white">
            <TabsTrigger value="profile" className="flex items-center gap-1.5 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <User className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <Bell className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1.5 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
              <Shield className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Compte</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Onglet Profil */}
        <TabsContent value="profile" className="space-y-4 flex-1">
          <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4">
            {/* Carte Avatar (flottante à gauche) */}
            <div className="md:w-72 lg:w-80 md:order-1 order-1 flex-shrink-0">
              <div className="sticky top-4 space-y-4">
                <Card className="border-white/10 bg-white/5 text-white shadow-sm">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-28 w-28 border-2 border-[#FCDA89]/30">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="text-2xl bg-[#FCDA89]/20 text-white">{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="icon" variant="secondary" className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="font-medium text-center text-base">{userProfile.name}</h3>
                  <p className="text-white/70 text-sm text-center mt-1">{userProfile.email}</p>
                  
                  {!isEditing && (
                    <Button variant="outline" size="sm" className="w-full mt-6 border-white/10 bg-white/5 hover:bg-white/10 text-white" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Modifier le profil
                    </Button>
                  )}
                </CardContent>
              </Card>
              
                <Card className="border-white/10 bg-white/5 text-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Statut du compte</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-2">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Compte vérifié</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Profil complété</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Email confirmé</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-white/10 bg-white/5 text-white shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Préférences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mode sombre</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Recherche de proximité</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Afficher les prix</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Carte Informations personnelles (à droite) */}
            <div className="md:flex-1 order-2 md:order-2 flex flex-col">
              <Card className="border-white/10 bg-white/5 text-white shadow-sm h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Informations personnelles</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-white" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Modifier
                      </Button>
                    )}
                  </div>
                  <CardDescription className="text-white/70">
                    Vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile}>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-white">Nom complet</Label>
                          <Input 
                            id="name" 
                            name="name"
                            defaultValue={userProfile.name} 
                            readOnly={!isEditing} 
                            className={!isEditing ? "bg-white/5 border-white/10 text-white" : "bg-white/10 border-white/20 text-white"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email" 
                            defaultValue={userProfile.email} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-white/5 border-white/10 text-white" : "bg-white/10 border-white/20 text-white"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-white">Téléphone</Label>
                          <Input 
                            id="phone" 
                            name="phone"
                            defaultValue={userProfile.phone} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-white/5 border-white/10 text-white" : "bg-white/10 border-white/20 text-white"}
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-4 bg-white/10" />
                      
                      <h3 className="font-medium text-sm text-white/70">Adresse</h3>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-sm font-medium text-white">Adresse complète</Label>
                        {isEditing ? (
                          <GoogleAddressAutocomplete
                            value={userProfile.address}
                            onChange={(value) => setUserProfile(prev => ({ ...prev, address: value }))}
                            onPlaceSelect={handleAddressSelect}
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                            placeholder="Recherchez votre adresse..."
                          />
                        ) : (
                          <Input 
                            id="address" 
                            value={userProfile.address || "Aucune adresse renseignée"} 
                            readOnly
                            className="bg-white/5 border-white/10 text-white"
                          />
                        )}
                        {userProfile.city && userProfile.postalCode && (
                          <p className="text-xs text-white/70 mt-1">
                            {userProfile.postalCode} {userProfile.city}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Message de statut */}
                    {saveStatus.type && (
                      <div className={`mt-4 p-3 rounded-md text-sm ${
                        saveStatus.type === 'success' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {saveStatus.message}
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" size="sm" type="button" onClick={() => {
                          setIsEditing(false)
                          setSaveStatus({ type: null, message: "" })
                        }} className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                          Annuler
                        </Button>
                        <Button type="submit" size="sm" className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                          Enregistrer
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <Card className="border-white/10 bg-white/5 text-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Historique des projets</CardTitle>
              <CardDescription className="text-white/70">
                Récapitulatif de vos projets précédents
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89]"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/70 text-sm">Aucun projet pour le moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex justify-between items-center p-3 border border-white/10 rounded-md bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#FCDA89]/20 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FCDA89] h-5 w-5"><path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><circle cx="10" cy="16" r="2"/><path d="m22 9-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 9"/></svg>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-xs text-white/70">
                            {project.status === 'COMPLETED' && `Terminé le ${new Date(project.updatedAt).toLocaleDateString('fr-FR')}`}
                            {project.status === 'IN_PROGRESS' && `En cours depuis le ${new Date(project.createdAt).toLocaleDateString('fr-FR')}`}
                            {project.status === 'PUBLISHED' && `Publié le ${new Date(project.createdAt).toLocaleDateString('fr-FR')}`}
                            {project.status === 'DRAFT' && `Brouillon créé le ${new Date(project.createdAt).toLocaleDateString('fr-FR')}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        project.status === 'COMPLETED' ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        project.status === 'IN_PROGRESS' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        project.status === 'PUBLISHED' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }>
                        {project.status === 'COMPLETED' && 'Terminé'}
                        {project.status === 'IN_PROGRESS' && 'En cours'}
                        {project.status === 'PUBLISHED' && 'Publié'}
                        {project.status === 'DRAFT' && 'Brouillon'}
                      </Badge>
                    </div>
                  ))}
                  {projects.length > 3 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-white/50">Et {projects.length - 3} autres projet{projects.length - 3 > 1 ? 's' : ''}...</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-4 flex-1">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Préférences de notifications</CardTitle>
              <CardDescription className="text-white/70">
                Choisissez les notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-white/70">
                      {setting.id === "new-messages" && "Soyez alerté lorsque vous recevez un nouveau message"}
                      {setting.id === "appointment-reminder" && "Rappels 24h avant vos rendez-vous"}
                      {setting.id === "quote-updates" && "Notifications lors des mises à jour de devis"}
                      {setting.id === "project-updates" && "Suivi des modifications de projets"}
                      {setting.id === "recommendations" && "Suggestions d'artisans basées sur vos projets"}
                      {setting.id === "marketing" && "Actualités et offres spéciales"}
                    </p>
                  </div>
                  <Switch id={setting.id} defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-2 flex justify-end">
              <Button size="sm" className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Enregistrer les préférences
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Canaux de notification</CardTitle>
              <CardDescription className="text-white/70">
                Comment souhaitez-vous être notifié ?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Email</p>
                    <p className="text-xs text-white/70">{userProfile.email}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">SMS</p>
                    <p className="text-xs text-white/70">{userProfile.phone}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Application mobile</p>
                    <p className="text-xs text-white/70">Notifications push</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Compte */}
        <TabsContent value="account" className="space-y-4 flex-1">
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sécurité du compte</CardTitle>
              <CardDescription className="text-white/70">
                Gérez l&apos;accès à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <Label className="font-medium text-white">Mot de passe</Label>
                  <p className="text-xs text-white/70">Dernière modification il y a 2 mois</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-white">
                  Modifier
                </Button>
              </div>
              
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="space-y-0.5">
                  <Label className="font-medium text-white">Authentification à deux facteurs</Label>
                  <p className="text-xs text-white/70">Protection supplémentaire pour votre compte</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-white">
                  Activer
                </Button>
              </div>
              
              <div className="flex justify-between items-center pb-2">
                <div className="space-y-0.5">
                  <Label className="font-medium text-white">Appareil connectés</Label>
                  <p className="text-xs text-white/70">1 appareil actif</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 border-white/10 bg-white/5 hover:bg-white/10 text-white">
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-white/10 bg-white/5 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Zone de danger
              </CardTitle>
              <CardDescription className="text-white/70">
                Actions irréversibles pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-500/30 p-4 bg-red-900/10">
                <h3 className="font-medium text-red-400 mb-2">Supprimer votre compte</h3>
                <p className="text-sm text-red-400/80 mb-4">
                  La suppression de votre compte effacera toutes vos données personnelles et votre historique de projets. Cette action est irréversible.
                </p>
                <Button variant="outline" size="sm" className="text-red-400 border-red-500/30 hover:bg-red-900/20 hover:text-red-300">
                  Supprimer mon compte
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/70 hover:text-white hover:bg-white/5"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}