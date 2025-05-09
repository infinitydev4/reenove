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
  FileClock,
  Star,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  MapPin,
  Send,
  FileText,
  Plus,
  Search,
  Home,
  Heart
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useNotifications } from "@/lib/contexts/NotificationContext"

export default function ClientDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("projets")
  const { unreadCount } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)

  // Vérifier l'authentification
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/client")
      return
    }

    if (status === "authenticated") {
      setIsLoading(false)
    }
  }, [session, status, router])

  // Afficher un état de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Données fictives pour le tableau de bord
  const projects = [
    {
      id: 1,
      title: "Rénovation salle de bain",
      status: "En cours",
      progress: 35,
      artisan: "Martin Dupont",
      lastUpdate: "Il y a 2 jours",
      messages: 2,
    },
    {
      id: 2,
      title: "Peinture salon",
      status: "En attente de devis",
      progress: 10,
      artisan: "Sophie Martin",
      lastUpdate: "Il y a 1 semaine",
      messages: 0,
    },
    {
      id: 3,
      title: "Installation cuisine",
      status: "Planifié",
      progress: 5,
      artisan: "Jean Durand",
      lastUpdate: "Il y a 3 jours",
      messages: 1,
    }
  ]

  const artisans = [
    {
      id: 1,
      name: "Martin Dupont",
      specialty: "Plombier",
      rating: 4.8,
      reviews: 47,
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      name: "Sophie Martin",
      specialty: "Peintre",
      rating: 4.6,
      reviews: 23,
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      name: "Jean Durand",
      specialty: "Cuisiniste",
      rating: 4.9,
      reviews: 38,
      image: "https://randomuser.me/api/portraits/men/62.jpg",
    },
  ]

  const events = [
    {
      id: 1,
      title: "Rendez-vous avec plombier",
      date: "12 juin 2023",
      time: "14:00",
      type: "meeting",
    },
    {
      id: 2,
      title: "Livraison matériaux",
      date: "15 juin 2023",
      time: "09:30",
      type: "delivery",
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Bonjour, {session?.user?.name?.split(' ')[0] || "Client"}</h1>
        <p className="text-muted-foreground text-sm">Voici un aperçu de vos projets et activités</p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/client/projets/create">
            <FileClock className="h-5 w-5 mb-1" />
            <span className="text-xs">Projet</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/client/artisans">
            <Wrench className="h-5 w-5 mb-1" />
            <span className="text-xs">Artisans</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/client/messages">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Messages</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex" asChild>
          <Link href="/client/favoris">
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">Favoris</span>
          </Link>
        </Button>
      </div>

      {/* Tabs pour le contenu principal */}
      <Tabs defaultValue="projets" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 mb-4">
          <TabsTrigger value="projets">Projets</TabsTrigger>
          <TabsTrigger value="artisans">Artisans</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projets" className="mt-0 space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="h-1 bg-blue-500"></div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-sm">{project.title}</h3>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> {project.artisan}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-xs">
                    {project.status}
                  </Badge>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{project.lastUpdate}</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                    <Link href={`/client/projets/${project.id}`}>
                      Détails <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button className="w-full flex items-center gap-2" variant="outline" asChild>
            <Link href="/client/projets">
              <Plus className="h-4 w-4" />
              Voir tous les projets
            </Link>
          </Button>
        </TabsContent>
        
        <TabsContent value="artisans" className="mt-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {artisans.map((artisan) => (
              <Card key={artisan.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={artisan.image} alt={artisan.name} />
                      <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{artisan.name}</h3>
                      <p className="text-muted-foreground text-xs">{artisan.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium">{artisan.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({artisan.reviews} avis)
                    </span>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button size="sm" asChild>
                      <Link href={`/client/artisans/${artisan.id}`}>
                        Voir profil
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Button className="w-full flex items-center gap-2" variant="outline" asChild>
            <Link href="/client/artisans">
              <Plus className="h-4 w-4" />
              Voir tous les artisans
            </Link>
          </Button>
        </TabsContent>
        
        <TabsContent value="agenda" className="mt-0 space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="h-1 bg-purple-500"></div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{event.title}</h3>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 text-xs">
                    {event.type === "meeting" ? "Rendez-vous" : "Livraison"}
                  </Badge>
                </div>
                
                <div className="space-y-1.5 mb-3">
                  <p className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{event.date}, {event.time}</span>
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <Button size="sm" variant="outline">Détails</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button className="w-full flex items-center gap-2" variant="outline" asChild>
            <Link href="/client/agenda">
              <Plus className="h-4 w-4" />
              Voir l&apos;agenda complet
            </Link>
          </Button>
        </TabsContent>
      </Tabs>

      {/* Résumé */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Résumé</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-blue-500"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{projects.length}</span>
                <span className="text-xs text-muted-foreground mt-2 text-center">Projets en cours</span>
              </CardContent>
            </Card>

            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-amber-500"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">3</span>
                <span className="text-xs text-muted-foreground mt-2 text-center">Messages non lus</span>
              </CardContent>
            </Card>

            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-purple-500"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{events.length}</span>
                <span className="text-xs text-muted-foreground mt-2 text-center">Événements à venir</span>
              </CardContent>
            </Card>

            <Card className="border shadow-sm overflow-hidden">
              <div className="h-1 bg-green-500"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-green-600 dark:text-green-400">{artisans.length}</span>
                <span className="text-xs text-muted-foreground mt-2 text-center">Artisans favoris</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href="/client/projets/new">
              <Plus className="h-4 w-4 mr-2" />
              Créer un nouveau projet
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Activité récente */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Nouveau message de <span className="font-medium">Martin Dupont</span></p>
                  <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                </div>
              </div>
            </div>
            <div className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                  <FileClock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">Devis reçu pour <span className="font-medium">Peinture salon</span></p>
                  <p className="text-xs text-muted-foreground">Hier</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-3 border-t bg-muted/20">
          <Button className="w-full" size="sm">
            Voir toutes les activités
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 