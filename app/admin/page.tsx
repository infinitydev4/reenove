"use client"

import { useState, useEffect } from "react"
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

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalArtisans: number;
  recentUsers: any[];
  recentProjects: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("users")
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalArtisans: 0,
    recentUsers: [],
    recentProjects: []
  })
  const [isLoading, setIsLoading] = useState(true)

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersResponse, projectsResponse] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/projects')
        ])

        if (usersResponse.ok && projectsResponse.ok) {
          const usersData = await usersResponse.json()
          const projectsData = await projectsResponse.json()

          setStats({
            totalUsers: usersData.pagination?.total || usersData.users?.length || 0,
            totalProjects: projectsData.projects?.length || 0,
            totalArtisans: usersData.users?.filter((u: any) => u.role === 'ARTISAN')?.length || 0,
            recentUsers: usersData.users?.slice(0, 5) || [],
            recentProjects: projectsData.projects?.slice(0, 5) || []
          })
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])
  
  // Générer l'activité récente à partir des vraies données
  const recentActivity = [
    // Nouveaux utilisateurs
    ...stats.recentUsers.slice(0, 3).map((user, index) => ({
      id: `user-${user.id}`,
      type: user.role === "ARTISAN" ? "nouvel_artisan" : "nouveau_utilisateur",
      content: `${user.name || "Utilisateur"} s'est inscrit${user.role === "ARTISAN" ? " comme artisan" : ""}`,
      timestamp: `Il y a ${Math.floor(Math.random() * 60) + 1} minutes`,
      avatar: user.image,
    })),
    // Nouveaux projets
    ...stats.recentProjects.slice(0, 2).map((project, index) => ({
      id: `project-${project.id}`,
      type: "projet",
      content: `Nouveau projet: ${project.title}`,
      timestamp: `Il y a ${Math.floor(Math.random() * 120) + 60} minutes`,
    }))
  ].slice(0, 5)
  
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
        return <Users className="h-4 w-4 text-blue-400" />
      case "nouvel_artisan":
        return <Wrench className="h-4 w-4 text-green-400" />
      case "verification":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "projet":
        return <FileText className="h-4 w-4 text-purple-400" />
      case "signalement":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl text-white">Bonjour, {session?.user?.name?.split(' ')[0] || "Admin"}</h1>
        <p className="text-white/70 text-sm">Tableau de bord administrateur</p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 bg-white/5 border-[#FCDA89]/20 hover:bg-[#FCDA89]/10 transition-colors" asChild>
          <Link href="/admin/users">
            <Users className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs text-white">Utilisateurs</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 bg-white/5 border-[#FCDA89]/20 hover:bg-[#FCDA89]/10 transition-colors" asChild>
          <Link href="/admin/artisans">
            <Wrench className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs text-white">Artisans</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 bg-white/5 border-[#FCDA89]/20 hover:bg-[#FCDA89]/10 transition-colors" asChild>
          <Link href="/admin/projets">
            <FileText className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs text-white">Projets</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex bg-white/5 border-[#FCDA89]/20 hover:bg-[#FCDA89]/10 transition-colors" asChild>
          <Link href="/admin/stats">
            <BarChart3 className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs text-white">Statistiques</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex bg-white/5 border-[#FCDA89]/20 hover:bg-[#FCDA89]/10 transition-colors" asChild>
          <Link href="/admin/settings">
            <Settings className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs text-white">Paramètres</span>
          </Link>
        </Button>
      </div>

      {/* Résumé avec cards modernes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-400">{stats.totalUsers}</span>
            <span className="text-xs text-white/70 mt-2 text-center">Utilisateurs</span>
            <span className="text-xs text-green-400 mt-1">Total enregistrés</span>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-400">{stats.totalArtisans}</span>
            <span className="text-xs text-white/70 mt-2 text-center">Artisans</span>
            <span className="text-xs text-amber-400 mt-1">Total inscrits</span>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-400">{stats.totalProjects}</span>
            <span className="text-xs text-white/70 mt-2 text-center">Projets créés</span>
            <span className="text-xs text-green-400 mt-1">Total projets</span>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-purple-400">24.8%</span>
            <span className="text-xs text-white/70 mt-2 text-center">Taux de conversion</span>
            <span className="text-xs text-green-400 mt-1">+2.5% ce mois-ci</span>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs pour le contenu principal */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 mb-4 bg-white/5 border-[#FCDA89]/20">
          <TabsTrigger value="users" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Derniers utilisateurs</TabsTrigger>
          <TabsTrigger value="artisans" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Artisans</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Activité récente</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-0 space-y-4">
          <div className="flex mb-3 h-9">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Rechercher un utilisateur..."
                className="pl-9 pr-12 rounded-r-none h-9 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0 bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Nouveaux utilisateurs</CardTitle>
              <CardDescription className="text-xs text-white/70">
                Les derniers utilisateurs inscrits sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {isLoading ? (
                  <div className="p-4 text-center text-white/70">Chargement...</div>
                ) : stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.image} alt={user.name || "Utilisateur"} />
                          <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">{user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm text-white">{user.name || "Utilisateur sans nom"}</p>
                            <Badge className={`ml-auto ${
                              user.role === "ARTISAN" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                              user.role === "ADMIN" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                              "bg-green-500/20 text-green-400 border-green-500/30"
                            }`}>
                              {user.role === "ARTISAN" ? "Artisan" : user.role === "ADMIN" ? "Admin" : "Client"}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/70">
                            {user.email}
                          </p>
                          <p className="text-xs text-white/50">
                            Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-white/70">Aucun utilisateur récent</div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t border-white/10 bg-white/5">
              <Button className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold" size="sm" asChild>
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
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Rechercher un artisan..."
                className="pl-9 pr-12 rounded-r-none h-9 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0 bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Wrench className="h-4 w-4" />
                Artisans en attente
              </CardTitle>
              <CardDescription className="text-xs text-white/70">
                Artisans nécessitant une vérification
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {isLoading ? (
                  <div className="p-4 text-center text-white/70">Chargement...</div>
                ) : stats.recentUsers.filter(u => u.role === "ARTISAN").length > 0 ? (
                  stats.recentUsers.filter(u => u.role === "ARTISAN").map((artisan) => (
                    <div key={artisan.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={artisan.image} alt={artisan.name || "Artisan"} />
                          <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">{artisan.name?.charAt(0) || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm text-white">{artisan.name || "Artisan sans nom"}</p>
                            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">En attente</Badge>
                          </div>
                          <p className="text-xs text-white/70">{artisan.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white">Vérifier</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/20">Rejeter</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-white/70">Aucun artisan en attente</div>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t border-white/10 bg-white/5">
              <Button className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold" size="sm" asChild>
                <Link href="/admin/artisans">
                  Voir tous les artisans
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0 space-y-4">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">Activités récentes</CardTitle>
              <CardDescription className="text-xs text-white/70">
                Les dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/10">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-white/10 p-2">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white">{activity.content}</p>
                          {(activity as any).priority === "high" && (
                            <Badge variant="destructive" className="ml-auto bg-red-500/20 text-red-400 border-red-500/30">Urgent</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t border-white/10 bg-white/5">
              <Button className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold" size="sm" asChild>
                <Link href="/admin/activity">
                  Voir toute l&apos;activité
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test de notifications */}
      <Card className="hidden bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm text-white">Test de notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <TestNotifications />
        </CardContent>
      </Card>
    </div>
  )
} 