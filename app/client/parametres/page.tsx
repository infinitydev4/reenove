"use client"

import { useState } from "react"
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

interface ClientProfile {
  name: string
  email: string
  phone: string
  avatar: string
  address: string
}

interface NotificationSetting {
  id: string
  label: string
  enabled: boolean
}

export default function ClientParametresPage() {
  const [isEditing, setIsEditing] = useState(false)
  
  const userProfile: ClientProfile = {
    name: "Jean Dupont",
    email: "jean.dupont@example.com",
    phone: "06 12 34 56 78",
    avatar: "/placeholder.svg?height=128&width=128",
    address: "12 rue de la Paix, 75001 Paris"
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
              <Card className="border-white/10 bg-white/5 text-white shadow-sm sticky top-0">
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
              
              <Card className="border-white/10 bg-white/5 text-white shadow-sm mt-4">
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
              
              <Card className="border-white/10 bg-white/5 text-white shadow-sm mt-4">
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
                  <form onSubmit={(e) => { e.preventDefault(); setIsEditing(false) }}>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-white">Nom complet</Label>
                          <Input 
                            id="name" 
                            defaultValue={userProfile.name} 
                            readOnly={!isEditing} 
                            className={!isEditing ? "bg-white/5 border-white/10 text-white" : "bg-white/10 border-white/20 text-white"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                          <Input 
                            id="email" 
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
                        <Input 
                          id="address" 
                          defaultValue={userProfile.address} 
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-white/5 border-white/10 text-white" : "bg-white/10 border-white/20 text-white"}
                        />
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(false)} className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
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
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border border-white/10 rounded-md bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FCDA89]/20 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FCDA89] h-5 w-5"><path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><circle cx="10" cy="16" r="2"/><path d="m22 9-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 9"/></svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Rénovation salle de bain</p>
                      <p className="text-xs text-white/70">Terminé le 15/03/2024</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">Terminé</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-white/10 rounded-md bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FCDA89]/20 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FCDA89] h-5 w-5"><path d="M2 9V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1"/><circle cx="10" cy="16" r="2"/><path d="m22 9-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 9"/></svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Rénovation cuisine</p>
                      <p className="text-xs text-white/70">Terminé le 10/01/2024</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">Terminé</Badge>
                </div>
              </div>
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
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">
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