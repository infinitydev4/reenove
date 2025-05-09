"use client"

import { useState } from "react"
import { Settings, Save, User, Bell, Shield, Database, Key, Pencil, LogOut, AlertTriangle, UserCog, Cloud, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminProfile, SystemSetting } from "@/types/admin"

export default function AdminParametresPage() {
  const [isEditing, setIsEditing] = useState(false)
  
  const adminProfile: AdminProfile = {
    name: "Admin Principal",
    email: "admin@reenove.com",
    phone: "06 00 00 00 00",
    avatar: "/placeholder.svg?height=128&width=128",
    role: "Super Administrateur",
    lastLogin: "09/07/2024 à 14:30"
  }

  const systemSettings: SystemSetting[] = [
    { id: "maintenance-mode", label: "Mode maintenance", enabled: false, description: "Active le mode maintenance sur toute la plateforme" },
    { id: "new-registrations", label: "Nouvelles inscriptions", enabled: true, description: "Autorise les nouvelles inscriptions d'utilisateurs" },
    { id: "artisan-validation", label: "Validation automatique", enabled: false, description: "Valide automatiquement les nouveaux artisans" },
    { id: "email-notifications", label: "Notifications email", enabled: true, description: "Envoie des notifications par email" },
    { id: "activity-logging", label: "Journal d'activité", enabled: true, description: "Enregistre toutes les actions des utilisateurs" }
  ]

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre */}
      <div className="flex justify-between items-center h-10 mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Paramètres administrateur
        </h1>
      </div>

      <Tabs defaultValue="profile" className="flex-1 flex flex-col">
        <div className="mb-6 w-full overflow-x-auto">
          <TabsList className="w-full max-w-md h-10 grid grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Système</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Sécurité</span>
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
                      <AvatarImage src={adminProfile.avatar} alt={adminProfile.name} />
                      <AvatarFallback className="text-2xl bg-primary/10">{adminProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="icon" variant="secondary" className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="font-medium text-center text-base">{adminProfile.name}</h3>
                  <p className="text-muted-foreground text-sm text-center mt-1">{adminProfile.role}</p>
                  <Badge variant="outline" className="mt-2">Dernière connexion: {adminProfile.lastLogin}</Badge>
                  
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
                  <CardTitle className="text-base">Accès aux modules</CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Utilisateurs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Projets</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Finances</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Paramètres système</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Carte Informations personnelles (à droite) */}
            <div className="md:flex-1 order-2 md:order-2 flex flex-col">
              <Card className="border shadow-sm h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Informations administrateur</CardTitle>
                    {!isEditing && (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Modifier
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Vos informations personnelles et accès administrateur
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
                            defaultValue={adminProfile.name} 
                            readOnly={!isEditing} 
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            defaultValue={adminProfile.email} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                          <Input 
                            id="phone" 
                            defaultValue={adminProfile.phone} 
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted/50" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-sm font-medium">Rôle</Label>
                          <Select disabled={!isEditing} defaultValue="super-admin">
                            <SelectTrigger id="role" className={!isEditing ? "bg-muted/50" : ""}>
                              <SelectValue placeholder="Sélectionner un rôle" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super-admin">Super Administrateur</SelectItem>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="moderator">Modérateur</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Separator className="my-4" />
                      
                      <h3 className="font-medium text-sm text-muted-foreground">Paramètres de notification</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">Alertes système</p>
                            <p className="text-xs text-muted-foreground">Recevoir les alertes critiques du système</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">Notifications de modération</p>
                            <p className="text-xs text-muted-foreground">Recevoir les demandes de modération</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        
                        <div className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-sm font-medium">Rapports hebdomadaires</p>
                            <p className="text-xs text-muted-foreground">Recevoir un résumé des activités chaque semaine</p>
                          </div>
                          <Switch defaultChecked />
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
        </TabsContent>

        {/* Onglet Système */}
        <TabsContent value="system" className="space-y-4 flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Paramètres système</CardTitle>
              <CardDescription>
                Configuration générale de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch id={setting.id} defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
            <CardFooter className="pt-2 flex justify-end">
              <Button size="sm">
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gestion des emails</CardTitle>
                <CardDescription>
                  Configuration des templates d&apos;emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Email de bienvenue</p>
                        <p className="text-xs text-muted-foreground">Envoyé lors de l&apos;inscription</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Modifier
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Validation de projet</p>
                        <p className="text-xs text-muted-foreground">Envoyé lorsqu&apos;un projet est validé</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Modifier
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sauvegarde et données</CardTitle>
                <CardDescription>
                  Gestion des données de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Database className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Sauvegarde automatique</p>
                          <p className="text-xs text-muted-foreground">Quotidienne à 03:00</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Actif</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-7">Configurer</Button>
                      <Button variant="outline" size="sm" className="text-xs h-7">Exécuter maintenant</Button>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          <Cloud className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Espace de stockage</p>
                          <p className="text-xs text-muted-foreground">65% utilisé (650 Go / 1 To)</p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-4 flex-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez les accès et la sécurité de votre compte administrateur
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
                  <p className="text-xs text-muted-foreground">Activée pour une sécurité renforcée</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Activé</Badge>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b">
                <div className="space-y-0.5">
                  <Label className="font-medium">Dernières connexions</Label>
                  <p className="text-xs text-muted-foreground">Suivi des connexions récentes</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Voir l&apos;historique
                </Button>
              </div>
              
              <div className="flex justify-between items-center pb-2">
                <div className="space-y-0.5">
                  <Label className="font-medium">Journaux d&apos;audit</Label>
                  <p className="text-xs text-muted-foreground">Historique des actions d&apos;administration</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Consulter
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gestion des accès administrateurs</CardTitle>
              <CardDescription>
                Gérez les comptes administrateurs et leurs permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>MP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Marie Poulain</p>
                      <p className="text-xs text-muted-foreground">Administrateur</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <UserCog className="h-3.5 w-3.5 mr-1.5" />
                    Gérer
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">Jean Dupont</p>
                      <p className="text-xs text-muted-foreground">Modérateur</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-8">
                    <UserCog className="h-3.5 w-3.5 mr-1.5" />
                    Gérer
                  </Button>
                </div>
              </div>
              
              <Button className="w-full mt-4" size="sm">
                <Key className="h-3.5 w-3.5 mr-1.5" />
                Ajouter un administrateur
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Actions sensibles
              </CardTitle>
              <CardDescription>
                Actions critiques nécessitant une attention particulière
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-red-200 p-4 bg-red-50 dark:bg-red-950/10">
                <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Réinitialiser la plateforme</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-4">
                  Cette action réinitialisera toutes les données de la plateforme. Cette action est irréversible.
                </p>
                <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-100 hover:text-red-600">
                  Réinitialiser la plateforme
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