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
import { ArtisanProfile, NotificationSetting } from "@/types/artisan"

export default function ArtisanParametresPage() {
  const [isEditing, setIsEditing] = useState(false)
  
  const userProfile: ArtisanProfile = {
    name: "Thomas Durand",
    email: "thomas.durand@example.com",
    phone: "06 12 34 56 78",
    avatar: "/placeholder.svg?height=128&width=128",
    companyName: "Durand Rénovation",
    siren: "123 456 789"
  }

  const notificationSettings: NotificationSetting[] = [
    { id: "new-messages", label: "Nouveaux messages", enabled: true },
    { id: "appointment-reminder", label: "Rappels de rendez-vous", enabled: true },
    { id: "quote-updates", label: "Mises à jour de devis", enabled: true },
    { id: "project-updates", label: "Mises à jour de projets", enabled: false },
    { id: "marketing", label: "Offres et actualités", enabled: false }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre */}
      <div className="flex justify-between items-center h-10 mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Paramètres
        </h1>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col">
        <div className="mb-6 w-full overflow-x-auto">
          <TabsList className="w-full max-w-md h-10 grid grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-1.5">
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
              <Card className="border shadow-sm sticky top-0">
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    <Avatar className="h-28 w-28 border-2 border-primary/20">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="text-2xl bg-primary/10">{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="icon" variant="secondary" className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="font-medium text-center text-base">{userProfile.name}</h3>
                  <p className="text-muted-foreground text-sm text-center mt-1">{userProfile.companyName}</p>
                  <Badge variant="outline" className="mt-2">{userProfile.siren}</Badge>
                  
                  {!isEditing && (
                    <Button variant="outline" size="sm" className="w-full mt-6" onClick={() => setIsEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Modifier le profil
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm mt-4">
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
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-sm">2 documents en attente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Spécialités et compétences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Rénovation</Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Plomberie</Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Salle de bain</Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Cuisine</Badge>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">Isolation</Badge>
                    <Badge variant="outline">+ Ajouter</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Carte Informations personnelles (à droite) */}
            <div className="md:flex-1 order-2 md:order-2 flex flex-col">
              <Card className="border shadow-sm h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Informations personnelles</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Modifier
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Vos informations personnelles et professionnelles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); setIsEditing(false) }}>
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Nom complet</Label>
                          <Input 
                            id="name" 
                            defaultValue={userProfile.name} 
                            readOnly={!isEditing} 
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            defaultValue={userProfile.email} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                          <Input 
                            id="phone" 
                            defaultValue={userProfile.phone} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <h3 className="font-medium text-sm text-muted-foreground">Informations professionnelles</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName" className="text-sm font-medium">Nom de l&apos;entreprise</Label>
                          <Input 
                            id="companyName" 
                            defaultValue={userProfile.companyName} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="siren" className="text-sm font-medium">SIREN / SIRET</Label>
                          <Input 
                            id="siren" 
                            defaultValue={userProfile.siren} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address" className="text-sm font-medium">Adresse</Label>
                          <Input 
                            id="address" 
                            defaultValue="12 rue des Artisans, 69000 Lyon" 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" size="sm" type="button" onClick={() => setIsEditing(false)}>
                          Annuler
                        </Button>
                        <Button type="submit" size="sm">
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
          
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Documents d&apos;entreprise</CardTitle>
              <CardDescription>
                Vos documents professionnels et certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Attestation d&apos;assurance</p>
                      <p className="text-xs text-muted-foreground">Valide jusqu&apos;au 31/12/2024</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">Vérifié</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-5 w-5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Kbis</p>
                      <p className="text-xs text-muted-foreground">Téléchargé le 15/02/2024</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-4 flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Préférences de notifications</CardTitle>
              <CardDescription>
                Choisissez les notifications que vous souhaitez recevoir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {setting.id === "new-messages" && "Soyez alerté lorsque vous recevez un nouveau message"}
                      {setting.id === "appointment-reminder" && "Rappels 24h avant vos rendez-vous"}
                      {setting.id === "quote-updates" && "Notifications lors des mises à jour de devis"}
                      {setting.id === "project-updates" && "Suivi des modifications de projets"}
                      {setting.id === "marketing" && "Actualités et offres spéciales"}
                    </p>
                  </div>
                  <Switch id={setting.id} defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-2 flex justify-end">
              <Button size="sm">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Enregistrer les préférences
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Canaux de notification</CardTitle>
              <CardDescription>
                Comment souhaitez-vous être notifié ?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Email</p>
                    <p className="text-xs text-muted-foreground">{userProfile.email}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">SMS</p>
                    <p className="text-xs text-muted-foreground">{userProfile.phone}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Application mobile</p>
                    <p className="text-xs text-muted-foreground">Notifications push</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Compte */}
        <TabsContent value="account" className="space-y-4 flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez l&apos;accès à votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-0.5">
                  <Label className="font-medium">Mot de passe</Label>
                  <p className="text-xs text-muted-foreground">Dernière modification il y a 3 mois</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Modifier
                </Button>
              </div>
              
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-0.5">
                  <Label className="font-medium">Authentification à deux facteurs</Label>
                  <p className="text-xs text-muted-foreground">Protection supplémentaire pour votre compte</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Activer
                </Button>
              </div>
              
              <div className="flex justify-between items-center pb-2">
                <div className="space-y-0.5">
                  <Label className="font-medium">Appareil connectés</Label>
                  <p className="text-xs text-muted-foreground">1 appareil actif</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Zone de danger
              </CardTitle>
              <CardDescription>
                Actions irréversibles pour votre compte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-200 p-4 bg-red-50 dark:bg-red-950/10">
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Désactiver votre compte</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                  La désactivation de votre compte masquera votre profil et suspendra vos services. Vous pourrez réactiver votre compte à tout moment.
                </p>
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600">
                  Désactiver mon compte
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
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