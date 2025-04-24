import React from "react"
import Link from "next/link"
import { 
  Activity, 
  ArrowRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  User, 
  UserCheck, 
  Users, 
  UserX,
  AlertCircle,
  Wrench
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Cette fonction serait remplacée par un appel API dans une application réelle
function getDashboardData() {
  return {
    stats: {
      utilisateursTotal: 1240,
      utilisateursNouveaux: 48,
      artisansTotal: 156,
      artisansVerifies: 124,
      artisansEnAttente: 32,
      projetsEnCours: 78,
      projetsTermines: 235,
    },
    activiteRecente: [
      {
        id: 1,
        type: "nouveau_utilisateur",
        content: "Emma Martin s'est inscrite",
        timestamp: "Il y a 12 minutes",
        avatar: "/placeholder.svg",
      },
      {
        id: 2,
        type: "nouvel_artisan",
        content: "Jean Dupont (Électricien) a créé un compte artisan",
        timestamp: "Il y a 48 minutes",
        avatar: "/placeholder.svg",
      },
      {
        id: 3,
        type: "verification",
        content: "Thomas Bernard (Plombier) a été vérifié",
        timestamp: "Il y a 2 heures",
        avatar: "/placeholder.svg",
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
    ],
    artisansRecents: [
      {
        id: 1,
        name: "Alexandre Dubois",
        profession: "Menuisier",
        location: "Lyon",
        status: "verified",
        avatar: "/placeholder.svg",
        date: "Inscrit il y a 2 jours",
      },
      {
        id: 2,
        name: "Sophie Leroy",
        profession: "Électricienne",
        location: "Paris",
        status: "pending",
        avatar: "/placeholder.svg",
        date: "Inscrit il y a 3 jours",
      },
      {
        id: 3,
        name: "Marc Petit",
        profession: "Plombier",
        location: "Marseille",
        status: "pending",
        avatar: "/placeholder.svg",
        date: "Inscrit il y a 4 jours",
      },
    ],
  }
}

export default function AdminDashboardPage() {
  const { stats, activiteRecente, artisansRecents } = getDashboardData()

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "nouveau_utilisateur":
        return <User className="h-4 w-4 text-blue-500" />
      case "nouvel_artisan":
        return <Wrench className="h-4 w-4 text-green-500" />
      case "verification":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "projet":
        return <Activity className="h-4 w-4 text-purple-500" />
      case "signalement":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre tableau de bord d'administration.
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="outline">
            Télécharger les rapports
          </Button>
          <Button>
            Ajouter un artisan
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.utilisateursTotal}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{stats.utilisateursNouveaux} nouveaux cette semaine
            </p>
            <div className="mt-3">
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Artisans vérifiés
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.artisansVerifies}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.artisansEnAttente} en attente de vérification
            </p>
            <div className="mt-3">
              <Progress value={(stats.artisansVerifies / stats.artisansTotal) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets en cours
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projetsEnCours}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.projetsTermines} projets terminés
            </p>
            <div className="mt-3">
              <Progress value={65} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taux de conversion
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2.5% depuis le mois dernier
            </p>
            <div className="mt-3">
              <Progress value={24.8} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Activité récente */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>
              Les 5 dernières activités sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activiteRecente.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {getActivityIcon(item.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.content}</p>
                      {item.priority === "high" && (
                        <Badge variant="destructive" className="ml-auto">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href="/admin/activity">
                Voir toutes les activités
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Artisans récents */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Nouveaux artisans</CardTitle>
            <CardDescription>
              Artisans récemment inscrits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {artisansRecents.map((artisan) => (
                <div key={artisan.id} className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={artisan.avatar} alt={artisan.name} />
                    <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{artisan.name}</p>
                      {artisan.status === "verified" ? (
                        <Badge className="ml-auto">Vérifié</Badge>
                      ) : (
                        <Badge variant="outline" className="ml-auto">En attente</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {artisan.profession} • {artisan.location}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {artisan.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link href="/admin/artisans">
                Gérer les artisans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 