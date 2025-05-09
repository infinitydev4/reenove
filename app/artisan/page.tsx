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
  AlertTriangle,
  ChevronRight as ChevronRightIcon,
  Plus,
  Briefcase,
  Clock3,
  Bell
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { TestNotificationsArtisan } from "@/components/artisan/TestNotificationsArtisan"
import { useNotifications } from "@/lib/contexts/NotificationContext"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { OnboardingStatus } from "@/types/artisan"

export default function ArtisanDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("today")
  const { unreadCount } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingStatus | null>(null)

  // Vérifier si l'onboarding est complété
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/artisan")
      return
    }

    if (status === "authenticated" && session?.user?.role === "ARTISAN") {
      const checkOnboardingStatus = async () => {
        try {
          const response = await fetch("/api/artisan/onboarding/progress")
          if (response.ok) {
            const data = await response.json()
            setOnboardingProgress(data.progress)
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'onboarding:", error)
        } finally {
          setIsLoading(false)
        }
      }
      
      checkOnboardingStatus()
    } else {
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

  // Vérifier si l'onboarding est complet
  const isOnboardingComplete = 
    onboardingProgress?.profile && 
    onboardingProgress?.specialties && 
    onboardingProgress?.documents;

  // Calculer le pourcentage de complétion
  const calculateCompletionPercentage = () => {
    if (!onboardingProgress) return 0;
    
    const steps = ['profile', 'specialties', 'documents', 'assessment'];
    const completedSteps = steps.filter(step => onboardingProgress[step as keyof typeof onboardingProgress]).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Données fictives
  const pendingQuotes = [
    {
      id: "DEV-2345",
      client: "Sophie Martin",
      project: "Rénovation salle de bain",
      amount: "3 450 €",
      date: "12/05/2024",
      status: "En attente",
      color: "orange"
    },
    {
      id: "DEV-2341",
      client: "Jean Dupont",
      project: "Installation électrique cuisine",
      amount: "1 250 €",
      date: "10/05/2024",
      status: "En attente",
      color: "orange"
    },
    {
      id: "DEV-2339",
      client: "Marie Lefebvre",
      project: "Pose parquet salon",
      amount: "2 800 €",
      date: "09/05/2024",
      status: "En attente",
      color: "orange"
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
  
  const activeProjects = [
    {
      id: "PRJ-001",
      client: "Martin Dubois",
      title: "Rénovation complète",
      location: "Lyon 6ème",
      progress: 65,
      startDate: "10/04/2024",
      endDate: "30/06/2024",
      status: "En cours",
      color: "blue"
    },
    {
      id: "PRJ-002",
      client: "Emma Laurent",
      title: "Installation électrique",
      location: "Villeurbanne",
      progress: 80,
      startDate: "01/05/2024",
      endDate: "15/05/2024",
      status: "Finition",
      color: "green"
    },
    {
      id: "PRJ-003",
      client: "Thomas Petit",
      title: "Salle de bain moderne",
      location: "Lyon 3ème",
      progress: 25,
      startDate: "05/05/2024",
      endDate: "20/06/2024",
      status: "En cours",
      color: "blue"
    }
  ]

  // Composant de statut d'onboarding
  const OnboardingStatusCard = () => {
    if (isOnboardingComplete) return null;
    
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/10 dark:border-orange-800/50 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
            Compte en attente de vérification
          </CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-400 text-sm">
            Complétez votre profil pour activer toutes les fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1 text-xs">
                <span>Progression</span>
                <span className="font-medium">{calculateCompletionPercentage()}%</span>
              </div>
              <Progress value={calculateCompletionPercentage()} className="h-2" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            className="w-full" 
            onClick={() => router.push('/onboarding/artisan')}
            size="sm"
          >
            Compléter mon profil
            <ChevronRightIcon className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
        <div>
        <h1 className="text-xl font-bold md:text-2xl">Bonjour, {session?.user?.name?.split(' ')[0] || "Artisan"}</h1>
        <p className="text-muted-foreground text-sm">Voici un aperçu de votre activité</p>
      </div>

      {/* Section statut onboarding */}
      <OnboardingStatusCard />

      {/* Actions rapides */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/artisan/devis/create">
            <FileClock className="h-5 w-5 mb-1" />
            <span className="text-xs">Devis</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/artisan/rendez-vous/schedule">
            <Calendar className="h-5 w-5 mb-1" />
            <span className="text-xs">RDV</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2" asChild>
          <Link href="/artisan/messages">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Messages</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex" asChild>
          <Link href="/artisan/clients">
            <Users className="h-5 w-5 mb-1" />
            <span className="text-xs">Clients</span>
          </Link>
        </Button>
              </div>

      {/* Tabs pour le contenu principal */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 mb-4">
          <TabsTrigger value="projects">Projets</TabsTrigger>
          <TabsTrigger value="quotes">Devis</TabsTrigger>
          <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-0 space-y-4">
          {activeProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className={`h-1 bg-${project.color}-500`}></div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-sm">{project.title}</h3>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {project.location}
                    </p>
              </div>
                  <Badge variant="outline" className={`bg-${project.color}-50 text-${project.color}-700 border-${project.color}-200 text-xs`}>
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
                    <Clock3 className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>{project.startDate} - {project.endDate}</span>
              </div>
                  <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                    <Link href={`/artisan/projets/${project.id}`}>
                      Détails <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
            </div>
          </CardContent>
        </Card>
          ))}
          
          <Button className="w-full flex items-center gap-2" variant="outline" asChild>
            <Link href="/artisan/projets">
              <Plus className="h-4 w-4" />
              Voir tous les projets
                </Link>
              </Button>
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-0 space-y-4">
              {pendingQuotes.map((quote) => (
            <Card key={quote.id} className="overflow-hidden">
              <div className={`h-1 bg-${quote.color}-500`}></div>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{quote.project}</h3>
                    <p className="text-muted-foreground text-xs">{quote.client}</p>
                  </div>
                  <p className="font-semibold text-sm">{quote.amount}</p>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <Clock3 className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span>Envoyé le {quote.date}</span>
                  </div>
                  <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                    <Link href={`/artisan/devis/${quote.id}`}>
                      Détails <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
            </div>
          </CardContent>
        </Card>
          ))}
          
          <Button className="w-full flex items-center gap-2" variant="outline" asChild>
            <Link href="/artisan/devis">
              <Plus className="h-4 w-4" />
              Voir tous les devis
                </Link>
              </Button>
        </TabsContent>
        
        <TabsContent value="appointments" className="mt-0 space-y-4">
              {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <div className="h-1 bg-blue-500"></div>
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-sm">{appointment.client}</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {appointment.project}
                    </Badge>
                  </div>
                
                <div className="space-y-1.5 mb-3">
                  <p className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{appointment.date}, {appointment.time}</span>
                  </p>
                  <p className="text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{appointment.address}</span>
                  </p>
                    </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs flex-1">Confirmer</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1">Modifier</Button>
                    </div>
              </CardContent>
            </Card>
          ))}
          
          <Button className="w-full flex items-center gap-2" variant="outline" asChild>
            <Link href="/artisan/rendez-vous">
              <Plus className="h-4 w-4" />
              Voir tous les rendez-vous
            </Link>
                    </Button>
        </TabsContent>
      </Tabs>

      {/* Aperçu des performances */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Performance</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs">Note client</div>
                <div className="flex items-center text-xs">
                  <Star className="fill-yellow-500 text-yellow-500 h-3 w-3 mr-1" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </div>
              <Progress value={96} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs">Taux de conversion</div>
                <div className="text-xs font-semibold">68%</div>
              </div>
              <Progress value={68} className="h-1.5" />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs">Temps de réponse</div>
                <div className="text-xs font-semibold">3h</div>
              </div>
              <Progress value={85} className="h-1.5" />
            </div>
            </div>
          </CardContent>
        <CardFooter>
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href="/artisan/statistiques">
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir les statistiques détaillées
              </Link>
            </Button>
          </CardFooter>
        </Card>

      {/* Messages récents */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages récents
          </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentMessages.map((message) => (
                <div key={message.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={message.avatar} alt={message.from} />
                      <AvatarFallback>{message.from.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm flex items-center">
                          {message.from}
                          {message.unread && (
                          <span className="ml-2 w-2 h-2 rounded-full bg-primary"></span>
                          )}
                      </div>
                      <span className="text-xs text-muted-foreground">{message.date.split(', ')[1]}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </CardContent>
        <CardFooter className="p-3 border-t bg-muted/20">
          <Button className="w-full" size="sm" asChild>
            <Link href="/artisan/messages">
              Voir tous les messages
            </Link>
          </Button>
        </CardFooter>
        </Card>

      {/* Section de test des notifications - cachée en production */}
      <div className="hidden">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Test des Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TestNotificationsArtisan />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 