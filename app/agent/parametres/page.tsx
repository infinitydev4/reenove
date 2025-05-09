"use client"

import { useState } from "react"
import { Settings, Save, User, Bell, Shield, Camera, Pencil, LogOut, AlertTriangle, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AgentProfile, NotificationSetting } from "@/types/agent"

export default function AgentParametresPage() {
  const [isEditing, setIsEditing] = useState(false)
  
  const userProfile: AgentProfile = {
    name: "Alexandre Martin",
    email: "alexandre.martin@example.com",
    phone: "06 12 34 56 78",
    avatar: "/placeholder.svg?height=128&width=128",
    address: "45 avenue Victor Hugo, 75016 Paris",
    iban: "FR76 3000 1007 1234 5678 9012 345",
    affiliateCode: "ALEX2024",
    commissionRate: "5%"
  }

  const notificationSettings: NotificationSetting[] = [
    { id: "new-affiliates", label: "Nouveaux filleuls", enabled: true },
    { id: "new-artisans", label: "Nouveaux artisans parrainés", enabled: true },
    { id: "new-projects", label: "Nouveaux projets", enabled: true },
    { id: "commission-paid", label: "Paiement de commissions", enabled: true },
    { id: "commission-pending", label: "Commissions en attente", enabled: true },
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
                  <p className="text-muted-foreground text-sm text-center mt-1">{userProfile.email}</p>
                  <Badge variant="outline" className="mt-2">Agent d'affiliation</Badge>
                  
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
                      <span className="text-sm">RIB en attente de validation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Code d'affiliation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
                    <span className="font-medium">{userProfile.affiliateCode}</span>
                    <Button variant="outline" size="sm" className="h-8">
                      Copier
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Partagez ce code avec vos contacts pour les parrainer sur la plateforme.
                  </p>
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
                    Vos informations personnelles et bancaires
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
                      
                      <h3 className="font-medium text-sm text-muted-foreground">Adresse</h3>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-sm font-medium">Adresse complète</Label>
                        <Input 
                          id="address" 
                          defaultValue={userProfile.address} 
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted/50" : ""}
                        />
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <h3 className="font-medium text-sm text-muted-foreground">Informations bancaires</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="iban" className="text-sm font-medium">IBAN</Label>
                        <Input 
                          id="iban" 
                          defaultValue={userProfile.iban} 
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted/50" : ""}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Votre IBAN est nécessaire pour recevoir vos commissions.
                        </p>
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
              <CardTitle className="text-base">Paramètres d&apos;affiliation</CardTitle>
              <CardDescription>
                Vos taux de commission et conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Percent className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Taux de commission standard</p>
                      <p className="text-xs text-muted-foreground">Applicable sur les projets et artisans parrainés</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">{userProfile.commissionRate}</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Percent className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Taux de commission sur filleuls</p>
                      <p className="text-xs text-muted-foreground">Applicable sur l&apos;activité des filleuls directement parrainés</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 border-green-200">2%</Badge>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Percent className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Bonus de performance</p>
                      <p className="text-xs text-muted-foreground">Augmentation du taux en fonction du volume d&apos;affiliation</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">Jusqu&apos;à +2%</Badge>
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
                      {setting.id === "new-affiliates" && "Soyez alerté lorsque vous avez un nouveau filleul"}
                      {setting.id === "new-artisans" && "Notifications pour les nouveaux artisans parrainés"}
                      {setting.id === "new-projects" && "Notifications pour les nouveaux projets apportés"}
                      {setting.id === "commission-paid" && "Alertes lors des paiements de vos commissions"}
                      {setting.id === "commission-pending" && "Suivi de vos commissions en attente"}
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
                  <p className="text-xs text-muted-foreground">Dernière modification il y a 1 mois</p>
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
                  <Label className="font-medium">Appareils connectés</Label>
                  <p className="text-xs text-muted-foreground">2 appareils actifs</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Gérer
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Paramètres de confidentialité</CardTitle>
              <CardDescription>
                Gérez qui peut voir vos informations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-sm">Profil visible pour les artisans</p>
                    <p className="text-xs text-muted-foreground">Permettre aux artisans de voir votre profil</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-sm">Profil visible pour les clients</p>
                    <p className="text-xs text-muted-foreground">Permettre aux clients de voir votre profil</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-sm">Afficher mes statistiques</p>
                    <p className="text-xs text-muted-foreground">Afficher vos statistiques de parrainage publiquement</p>
                  </div>
                  <Switch defaultChecked />
                </div>
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
                  La désactivation de votre compte suspendra temporairement votre activité d&apos;agent d&apos;affiliation. Vos filleuls resteront liés à votre compte.
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