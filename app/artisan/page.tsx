"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  BarChart3,
  TrendingUp,
  Calendar,
  MessageSquare,
  FileClock,
  Star,
  Bell,
  ChevronRight,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench,
  MapPin
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function ArtisanDashboardPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("today")

  // Données fictives
  const pendingQuotes = [
    {
      id: "DEV-2345",
      client: "Sophie Martin",
      project: "Rénovation salle de bain",
      amount: "3 450 €",
      date: "12/05/2024",
      status: "En attente",
    },
    {
      id: "DEV-2341",
      client: "Jean Dupont",
      project: "Installation électrique cuisine",
      amount: "1 250 €",
      date: "10/05/2024",
      status: "En attente",
    },
    {
      id: "DEV-2339",
      client: "Marie Lefebvre",
      project: "Pose parquet salon",
      amount: "2 800 €",
      date: "09/05/2024",
      status: "En attente",
    },
  ]

  const upcomingAppointments = [
    {
      id: "RDV-567",
      client: "Pierre Durand",
      address: "15 Rue du Commerce, Lyon",
      date: "15/05/2024",
      time: "10:00 - 12:00",
      project: "Visite technique",
    },
    {
      id: "RDV-568",
      client: "Isabelle Blanc",
      address: "7 Avenue des Fleurs, Villeurbanne",
      date: "16/05/2024",
      time: "14:30 - 16:00",
      project: "Devis sur place",
    },
  ]

  const recentMessages = [
    {
      id: "MSG-123",
      from: "Lucie Petit",
      avatar: "/placeholder.svg?height=40&width=40",
      message: "Bonjour, je souhaiterais des précisions sur le devis que vous m'avez envoyé...",
      date: "Aujourd'hui, 09:45",
      unread: true,
    },
    {
      id: "MSG-122",
      from: "Thomas Leroy",
      avatar: "/placeholder.svg?height=40&width=40",
      message: "Merci pour votre intervention rapide. Le problème est bien résolu...",
      date: "Hier, 18:20",
      unread: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue, {session?.user?.name || "Artisan"}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button>
            <FileClock className="h-4 w-4 mr-2" />
            Créer un devis
          </Button>
        </div>
      </div>

      {/* Section des cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-medium">Projets en cours</span>
                <span className="text-2xl font-bold">8</span>
              </div>
              <div className="bg-primary/10 p-2 rounded-full">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Progression</span>
                <span className="font-semibold">65%</span>
              </div>
              <Progress value={65} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-medium">Devis en attente</span>
                <span className="text-2xl font-bold">5</span>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full">
                <FileClock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-500 font-medium">+2</span>
                <span className="text-muted-foreground ml-1">depuis la semaine dernière</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-medium">Rendez-vous à venir</span>
                <span className="text-2xl font-bold">3</span>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs">
                <span className="text-muted-foreground">Prochain: </span>
                <span className="font-medium ml-1">15 mai, 10:00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-sm font-medium">Messages non lus</span>
                <span className="text-2xl font-bold">4</span>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                <span className="text-muted-foreground">Dernier reçu il y a 45 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section des devis en attente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Devis en attente</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/artisan/devis">
                  Voir tout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>Devis nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {pendingQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <span className="font-medium">{quote.project}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {quote.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>{quote.client}</span> • <span>{quote.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-4">{quote.amount}</span>
                    <Button size="sm" variant="ghost">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-4">
            <Button className="w-full" asChild>
              <Link href="/artisan/devis/create">
                <FileClock className="mr-2 h-4 w-4" />
                Créer un nouveau devis
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Section des rendez-vous à venir */}
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Rendez-vous à venir</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/artisan/rendez-vous">
                  Voir tout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>Planning des prochains jours</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{appointment.client}</div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                      {appointment.project}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {appointment.date}, {appointment.time}
                    </div>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {appointment.address}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">Modifier</Button>
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-800 dark:hover:bg-red-950/30">
                      Annuler
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 p-4">
            <Button className="w-full" asChild>
              <Link href="/artisan/rendez-vous/schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Planifier un rendez-vous
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Section inférieure: Messages récents et Revue d'activité */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Messages récents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/artisan/messages">
                  Voir tout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <CardDescription>Dernières communications clients</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentMessages.map((message) => (
                <div key={message.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={message.avatar} alt={message.from} />
                      <AvatarFallback>{message.from.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium flex items-center">
                          {message.from}
                          {message.unread && (
                            <Badge className="ml-2 px-1 py-0" variant="default">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{message.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm">Répondre</Button>
                        <Button size="sm" variant="outline">
                          Marquer comme lu
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Revue de performance</CardTitle>
            <CardDescription>Statistiques de votre activité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Note globale</div>
                  <div className="flex items-center text-yellow-500">
                    <Star className="fill-yellow-500 h-4 w-4 mr-1" />
                    <span className="font-bold">4.8</span>
                    <span className="text-xs text-muted-foreground ml-1">/ 5</span>
                  </div>
                </div>
                <Progress value={96} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Taux de conversion</div>
                  <div className="font-bold">68%</div>
                </div>
                <Progress value={68} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Temps de réponse</div>
                  <div className="font-bold">3h</div>
                </div>
                <Progress value={85} className="h-2" />
              </div>

              <Separator className="my-4" />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Activité récente</h4>

                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 rounded-full bg-green-500/20 p-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">Projet terminé pour <span className="font-medium">Marie Dubois</span></p>
                      <p className="text-xs text-muted-foreground">Aujourd'hui à 14:30</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 rounded-full bg-blue-500/20 p-1">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">Nouveau client: <span className="font-medium">Thomas Martin</span></p>
                      <p className="text-xs text-muted-foreground">Hier à 11:15</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 rounded-full bg-orange-500/20 p-1">
                      <AlertCircle className="h-3 w-3 text-orange-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">Rappel: Paiement en attente pour <span className="font-medium">Projet #2341</span></p>
                      <p className="text-xs text-muted-foreground">12/05/2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 