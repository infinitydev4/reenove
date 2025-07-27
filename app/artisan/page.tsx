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
  Plus,
  Briefcase,
  Clock3,
  Bell,
  Euro,
  FileText,
  Activity
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

interface DashboardData {
  activeProjects: Array<{
    id: string
    client: string
    title: string
    category: string
    location: string
    budget: string
    status: string
    createdAt: Date
    quote: any
  }>
  pendingQuotes: Array<{
    id: string
    client: string
    project: string
    category: string
    amount: string
    date: Date
    status: string
  }>
  recentNotifications: Array<{
    id: string
    title: string
    message: string
    date: Date
    read: boolean
    type: string
  }>
  stats: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    pendingQuotesCount: number
  }
}

export default function ArtisanDashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState("projects")
  const { unreadCount } = useNotifications()
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingStatus | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  // Vérifier l'onboarding et charger les données
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/artisan")
      return
    }

    if (status === "authenticated" && session?.user?.role === "ARTISAN") {
      const loadData = async () => {
        try {
          // Vérifier l'onboarding
          const onboardingResponse = await fetch("/api/artisan/onboarding/progress")
          if (onboardingResponse.ok) {
            const onboardingData = await onboardingResponse.json()
            setOnboardingProgress(onboardingData.progress)
          }

          // Charger les données du dashboard
          const dashboardResponse = await fetch("/api/artisan/dashboard")
          if (dashboardResponse.ok) {
            const dashboardResult = await dashboardResponse.json()
            setDashboardData(dashboardResult.data)
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error)
        } finally {
          setIsLoading(false)
        }
      }
      
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [session, status, router])

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E261C]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  // Vérifier si l'onboarding est complet
  const isOnboardingComplete = 
    onboardingProgress?.profile && 
    onboardingProgress?.specialties && 
    onboardingProgress?.documents

  // Calculer le pourcentage de complétion
  const calculateCompletionPercentage = () => {
    if (!onboardingProgress) return 0
    
    const steps = ['profile', 'specialties', 'documents', 'assessment']
    const completedSteps = steps.filter(step => onboardingProgress[step as keyof typeof onboardingProgress]).length
    return Math.round((completedSteps / steps.length) * 100)
  }

  // Composant pour la carte de statut d'onboarding
  const OnboardingStatusCard = () => {
    const completionPercentage = calculateCompletionPercentage()
    
    if (isOnboardingComplete) {
      return (
        <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCDA89]/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-[#FCDA89]" />
              </div>
              <div>
                <h3 className="font-medium text-[#FCDA89]">Profil complété !</h3>
                <p className="text-sm text-white/70">Votre profil artisan est prêt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#FCDA89]" />
              <CardTitle className="text-sm text-[#FCDA89]">Compléter votre profil</CardTitle>
            </div>
            <span className="text-xs text-white/70">{completionPercentage}%</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Progress value={completionPercentage} className="mb-3 h-2" />
          <p className="text-xs text-white/70 mb-3">
            Finalisez votre profil pour recevoir plus de projets
          </p>
          <Button
            size="sm"
            className="w-full bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90"
            onClick={() => router.push('/onboarding/artisan')}
          >
            Continuer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-xl font-bold md:text-2xl text-white">
          Bonjour, {session?.user?.name?.split(' ')[0] || "Artisan"} 👋
        </h1>
        <p className="text-white/70 text-sm">Voici un aperçu de votre activité</p>
      </div>

      {/* Section statut onboarding */}
      <OnboardingStatusCard />

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCDA89]/20 rounded-lg">
                <Briefcase className="h-4 w-4 text-[#FCDA89]" />
              </div>
              <div>
                <p className="text-xs text-white/70">Total projets</p>
                <p className="text-lg font-bold text-[#FCDA89]">
                  {dashboardData?.stats.totalProjects || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCDA89]/20 rounded-lg">
                <Activity className="h-4 w-4 text-[#FCDA89]" />
              </div>
              <div>
                <p className="text-xs text-white/70">En cours</p>
                <p className="text-lg font-bold text-[#FCDA89]">
                  {dashboardData?.stats.activeProjects || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCDA89]/20 rounded-lg">
                <CheckCircle className="h-4 w-4 text-[#FCDA89]" />
              </div>
              <div>
                <p className="text-xs text-white/70">Terminés</p>
                <p className="text-lg font-bold text-[#FCDA89]">
                  {dashboardData?.stats.completedProjects || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FCDA89]/20 rounded-lg">
                <FileText className="h-4 w-4 text-[#FCDA89]" />
              </div>
              <div>
                <p className="text-xs text-white/70">Devis</p>
                <p className="text-lg font-bold text-[#FCDA89]">
                  {dashboardData?.stats.pendingQuotesCount || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 bg-[#0E261C] border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10" asChild>
          <Link href="/artisan/devis">
            <FileClock className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs">Devis</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 bg-[#0E261C] border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10" asChild>
          <Link href="/artisan/rendez-vous">
            <Calendar className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs">RDV</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 bg-[#0E261C] border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10" asChild>
          <Link href="/artisan/messages">
            <MessageSquare className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs">Messages</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 hidden md:flex bg-[#0E261C] border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10" asChild>
          <Link href="/artisan/projets">
            <Users className="h-5 w-5 mb-1 text-[#FCDA89]" />
            <span className="text-xs">Projets</span>
          </Link>
        </Button>
      </div>

      {/* Tabs pour le contenu principal */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 mb-4 bg-[#0E261C] border border-[#FCDA89]/30">
          <TabsTrigger value="projects" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
            Projets
          </TabsTrigger>
          <TabsTrigger value="quotes" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
            Devis
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
            Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-0 space-y-4">
          {dashboardData?.activeProjects && dashboardData.activeProjects.length > 0 ? (
            dashboardData.activeProjects.map((project) => (
              <Card key={project.id} className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <div className="h-1 bg-[#FCDA89]"></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-sm text-white">{project.title}</h3>
                      <p className="text-white/70 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {project.location}
                      </p>
                      <p className="text-white/70 text-xs">Client: {project.client}</p>
                    </div>
                    <Badge variant="outline" className="bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30 text-xs">
                      {project.status === 'IN_PROGRESS' ? 'En cours' : 
                       project.status === 'AWAITING_QUOTES' ? 'Devis attendu' :
                       project.status === 'REVIEW' ? 'En révision' : project.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/70">Budget: {project.budget}</span>
                    <span className="text-white/70">Catégorie: {project.category}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90"
                    asChild
                  >
                    <Link href={`/artisan/projets`}>
                      Voir le projet
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardContent className="p-6 text-center">
                <Briefcase className="h-12 w-12 text-[#FCDA89]/50 mx-auto mb-3" />
                <h3 className="font-medium mb-2 text-white">Aucun projet actif</h3>
                <p className="text-sm text-white/70">
                  Vos nouveaux projets apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quotes" className="mt-0 space-y-4">
          {dashboardData?.pendingQuotes && dashboardData.pendingQuotes.length > 0 ? (
            dashboardData.pendingQuotes.map((quote) => (
              <Card key={quote.id} className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-sm text-white">{quote.project}</h3>
                      <p className="text-white/70 text-xs">Client: {quote.client}</p>
                      <p className="text-white/70 text-xs">Catégorie: {quote.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#FCDA89]">{quote.amount}</p>
                      <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        En attente
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-white/70">
                    Créé le {new Date(quote.date).toLocaleDateString('fr-FR')}
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-[#FCDA89]/50 mx-auto mb-3" />
                <h3 className="font-medium mb-2 text-white">Aucun devis en attente</h3>
                <p className="text-sm text-white/70">
                  Vos devis en attente apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="mt-0 space-y-4">
          {dashboardData?.recentNotifications && dashboardData.recentNotifications.length > 0 ? (
            dashboardData.recentNotifications.map((notification) => (
              <Card key={notification.id} className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#FCDA89]/20 rounded-lg">
                      <Bell className="h-4 w-4 text-[#FCDA89]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-white">{notification.title}</h3>
                      <p className="text-white/70 text-xs mt-1">{notification.message}</p>
                      <p className="text-xs text-white/50 mt-2">
                        {new Date(notification.date).toLocaleDateString('fr-FR')} à {new Date(notification.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 text-[#FCDA89]/50 mx-auto mb-3" />
                <h3 className="font-medium mb-2 text-white">Aucune notification</h3>
                <p className="text-sm text-white/70">
                  Vos notifications récentes apparaîtront ici
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 