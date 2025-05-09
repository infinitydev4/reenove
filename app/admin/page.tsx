"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  MessageSquare,
  FileText,
  Star,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  LayoutDashboard,
  Settings,
  Plus,
  Search,
  Filter
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TestNotifications } from "@/components/admin/TestNotifications"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("today")
  
  // Données fictives pour les statistiques
  const stats = {
    utilisateursTotal: 1240,
    utilisateursNouveaux: 48,
    artisansTotal: 156,
    artisansVerifies: 124,
    artisansEnAttente: 32,
    projetsEnCours: 78,
    projetsTermines: 235,
  }
  
  // Données fictives pour les dernières actions
  const recentActivity = [
    {
      id: 1,
      type: "nouveau_utilisateur",
      content: "Emma Martin s&apos;est inscrite",
      timestamp: "Il y a 12 minutes",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      type: "nouvel_artisan",
      content: "Jean Dupont (Électricien) a créé un compte artisan",
      timestamp: "Il y a 48 minutes",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      type: "verification",
      content: "Thomas Bernard (Plombier) a été vérifié",
      timestamp: "Il y a 2 heures",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 4,
      type: "projet",
      content: "Nouveau projet: Rénovation salle de bain",
      timestamp: "Il y a 5 heures",
    },
    {
      id: 5,
      type: "signalement",
      content: "Un signalement a été effectué sur le profil de Lucas Martin",
      timestamp: "Il y a 8 heures",
      priority: "high",
    }
  ]
  
  // Nouveaux artisans récents
  const recentArtisans = [
    {
      id: 1,
      name: "Alexandre Dubois",
      profession: "Menuisier",
      location: "Lyon",
      status: "verified",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "Inscrit il y a 2 jours",
    },
    {
      id: 2,
      name: "Sophie Leroy",
      profession: "Électricienne",
      location: "Paris",
      status: "pending",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "Inscrit il y a 3 jours",
    },
    {
      id: 3,
      name: "Marc Petit",
      profession: "Plombier",
      location: "Marseille",
      status: "pending",
      avatar: "/placeholder.svg?height=40&width=40",
      date: "Inscrit il y a 4 jours",
    },
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "nouveau_utilisateur":
        return <Users className="h-4 w-4 text-blue-500" />
      case "nouvel_artisan":
        return <Wrench className="h-4 w-4 text-green-500" />
      case "verification":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "projet":
        return <FileText className="h-4 w-4 text-purple-500" />
      case "signalement":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Bonjour, {session?.user?.name?.split(' ')[0] || "Admin"}</h1>
        <p className="text-muted-foreground text-sm">Tableau de bord administrateur</p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/admin/users">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Utilisateurs</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/admin/artisans">
            <Wrench className="h-5 w-5 mb-1" />
            <span className="text-xs">Artisans</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/admin/projets">
            <FileText className="h-5 w-5 mb-1" />
            <span className="text-xs">Projets</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex" asChild>
          <Link href="/admin/stats">
            <BarChart3 className="h-5 w-5 mb-1" />
            <span className="text-xs">Statistiques</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex" asChild>
          <Link href="/admin/settings">
            <Settings className="h-5 w-5 mb-1" />
            <span className="text-xs">Paramètres</span>
          </Link>
        </Button>
      </div>

      {/* Résumé avec cards modernes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.utilisateursTotal}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Utilisateurs</span>
            <span className="text-xs text-green-500 mt-1">+{stats.utilisateursNouveaux} cette semaine</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.artisansTotal}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Artisans</span>
            <span className="text-xs text-amber-500 mt-1">{stats.artisansEnAttente} en attente</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">{stats.projetsEnCours}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Projets en cours</span>
            <span className="text-xs text-green-500 mt-1">{stats.projetsTermines} terminés</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">24.8%</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Taux de conversion</span>
            <span className="text-xs text-green-500 mt-1">+2.5% ce mois-ci</span>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs pour le contenu principal */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 mb-4">
          <TabsTrigger value="users">Derniers utilisateurs</TabsTrigger>
          <TabsTrigger value="artisans">Artisans</TabsTrigger>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-0 space-y-4">
          <div className="flex mb-3 h-9">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="pl-9 pr-12 rounded-r-none h-9"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
              <CardDescription className="text-xs">
                Les derniers utilisateurs inscrits sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentArtisans.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-sm">{user.name}</p>
                          {user.status === "verified" ? (
                            <Badge className="ml-auto">Vérifié</Badge>
                          ) : (
                            <Badge variant="outline" className="ml-auto">En attente</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {user.profession} • {user.location}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t bg-muted/20">
              <Button className="w-full" size="sm" asChild>
                <Link href="/admin/users">
                  Voir tous les utilisateurs
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="artisans" className="mt-0 space-y-4">
          <div className="flex mb-3 h-9">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un artisan..."
                className="pl-9 pr-12 rounded-r-none h-9"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Artisans en attente
              </CardTitle>
              <CardDescription className="text-xs">
                Artisans nécessitant une vérification
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentArtisans.filter(a => a.status === "pending").map((artisan) => (
                  <div key={artisan.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={artisan.avatar} alt={artisan.name} />
                        <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium text-sm">{artisan.name}</p>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En attente</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{artisan.profession} • {artisan.location}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="default" className="h-7 text-xs">Vérifier</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">Rejeter</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t bg-muted/20">
              <Button className="w-full" size="sm" asChild>
                <Link href="/admin/artisans">
                  Voir tous les artisans
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activités récentes</CardTitle>
              <CardDescription className="text-xs">
                Les dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{activity.content}</p>
                          {activity.priority === "high" && (
                            <Badge variant="destructive" className="ml-auto">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t bg-muted/20">
              <Button className="w-full" size="sm" asChild>
                <Link href="/admin/activity">
                  Voir toute l&apos;activité
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs">Satisfaction utilisateurs</div>
                <div className="flex items-center text-xs">
                  <Star className="fill-yellow-500 text-yellow-500 h-3 w-3 mr-1" />
                  <span className="font-semibold">4.7</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </div>
              <Progress value={94} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs">Taux de conversion</div>
                <div className="text-xs font-semibold">24.8%</div>
              </div>
              <Progress value={24.8} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs">Artisans vérifiés</div>
                <div className="text-xs font-semibold">{stats.artisansVerifies}/{stats.artisansTotal}</div>
              </div>
              <Progress value={(stats.artisansVerifies / stats.artisansTotal) * 100} className="h-1.5" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href="/admin/stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir les statistiques détaillées
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Test de notifications */}
      <Card className="hidden">
        <CardHeader>
          <CardTitle className="text-sm">Test de notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <TestNotifications />
        </CardContent>
      </Card>
    </div>
  )
} 