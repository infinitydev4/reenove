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
  const [projects, setProjects] = useState<any[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  
  // États pour artisans et événements 
  const [artisans, setArtisans] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [loadingArtisans, setLoadingArtisans] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  
  // États pour messages et activité
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)

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

  // Charger les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/client/projects')
          if (response.ok) {
            const data = await response.json()
            setProjects(Array.isArray(data) ? data : [])
          } else {
            console.error('Erreur lors du chargement des projets')
            setProjects([])
          }
        } catch (error) {
          console.error('Erreur lors du chargement des projets:', error)
          setProjects([])
        } finally {
          setLoadingProjects(false)
        }
      }
    }
    
    fetchProjects()
  }, [session?.user])

  // Charger les artisans depuis l'API (si besoin)
  useEffect(() => {
    const fetchArtisans = async () => {
      if (session?.user) {
        try {
          // Pour l'instant, pas d'API d'artisans spécifique au client
          // On peut laisser vide ou créer une API dédiée plus tard
          setArtisans([])
        } catch (error) {
          console.error('Erreur lors du chargement des artisans:', error)
          setArtisans([])
        } finally {
          setLoadingArtisans(false)
        }
      }
    }
    
    fetchArtisans()
  }, [session?.user])

  // Charger les événements depuis l'API (si besoin)
  useEffect(() => {
    const fetchEvents = async () => {
      if (session?.user) {
        try {
          // Pour l'instant, pas d'API d'événements spécifique au client
          // On peut laisser vide ou créer une API dédiée plus tard
          setEvents([])
        } catch (error) {
          console.error('Erreur lors du chargement des événements:', error)
          setEvents([])
        } finally {
          setLoadingEvents(false)
        }
      }
    }
    
    fetchEvents()
  }, [session?.user])

  // Charger les messages non lus
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/client/messages/unread')
          if (response.ok) {
            const data = await response.json()
            setUnreadMessages(data.unreadCount || 0)
          } else {
            setUnreadMessages(0)
          }
        } catch (error) {
          console.error('Erreur lors du chargement des messages non lus:', error)
          setUnreadMessages(0)
        } finally {
          setLoadingMessages(false)
        }
      }
    }
    
    fetchUnreadMessages()
  }, [session?.user])

  // Charger l'activité récente
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/client/activity')
          if (response.ok) {
            const data = await response.json()
            setRecentActivity(data.activities || [])
          } else {
            setRecentActivity([])
          }
        } catch (error) {
          console.error('Erreur lors du chargement de l\'activité récente:', error)
          setRecentActivity([])
        } finally {
          setLoadingActivity(false)
        }
      }
    }
    
    fetchRecentActivity()
  }, [session?.user])

  // Afficher un état de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Bonjour, {session?.user?.name?.split(' ')[0] || "Client"}</h1>
        <p className="text-white/70 text-sm">Voici un aperçu de vos projets et activités</p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
          <Link href="/client/projets/create">
            <FileClock className="h-5 w-5 mb-1" />
            <span className="text-xs">Projet</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
          <Link href="/client/artisans">
            <Wrench className="h-5 w-5 mb-1" />
            <span className="text-xs">Artisans</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
          <Link href="/client/messages">
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">Messages</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex flex-col h-auto py-3 px-2 border-white/10 bg-white/5 hover:bg-white/10 text-white hidden md:flex" asChild>
          <Link href="/client/favoris">
            <Heart className="h-5 w-5 mb-1" />
            <span className="text-xs">Favoris</span>
          </Link>
        </Button>
      </div>

      {/* Tabs pour le contenu principal */}
      <Tabs defaultValue="projets" className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-10 mb-4 bg-white/10 text-white">
          <TabsTrigger value="projets" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Projets</TabsTrigger>
          <TabsTrigger value="artisans" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Artisans</TabsTrigger>
          <TabsTrigger value="agenda" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Agenda</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projets" className="mt-0 space-y-4">
          {loadingProjects ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89]"></div>
            </div>
          ) : projects.length === 0 ? (
            <Card className="overflow-hidden bg-white/5 border-white/10 text-white">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-white/30" />
                <h3 className="font-medium mb-2">Aucun projet</h3>
                <p className="text-white/70 text-sm mb-4">Vous n'avez pas encore créé de projet</p>
                <Button className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
                  <Link href="/create-project-ai">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>  
            </Card>
          ) : (
            projects.map((project) => {
              const formatDate = (dateString: string) => {
                const date = new Date(dateString)
                const now = new Date()
                const diffInMs = now.getTime() - date.getTime()
                const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                
                if (diffInDays === 0) return "Aujourd'hui"
                if (diffInDays === 1) return "Hier"
                if (diffInDays < 7) return `Il y a ${diffInDays} jours`
                if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`
                return `Il y a ${Math.floor(diffInDays / 30)} mois`
              }

              const getStatusBadge = (status: string) => {
                const statusMap: Record<string, { label: string, color: string }> = {
                  'DRAFT': { label: 'Brouillon', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
                  'PUBLISHED': { label: 'Publié', color: 'bg-[#FCDA89]/10 text-[#FCDA89] border-[#FCDA89]/30' },
                  'IN_PROGRESS': { label: 'En cours', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
                  'COMPLETED': { label: 'Terminé', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
                  'CANCELLED': { label: 'Annulé', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
                }
                return statusMap[status] || statusMap['PUBLISHED']
              }

              const statusInfo = getStatusBadge(project.status)
              
              return (
                <Card key={project.id} className="overflow-hidden bg-white/5 border-white/10 text-white">
                  <div className="h-1 bg-[#FCDA89]"></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{project.title}</h3>
                        <div className="space-y-1">
                          <p className="text-white/70 text-xs flex items-center gap-1">
                            <Wrench className="h-3 w-3" /> 
                            {project.categoryName} - {project.serviceName}
                          </p>
                          {project.location && (
                            <p className="text-white/60 text-xs flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {project.city || project.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${statusInfo.color}`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    {project.budget && (
                      <div className="mb-3 p-2 bg-[#FCDA89]/10 rounded text-center">
                        <p className="text-[#FCDA89] font-medium text-sm">
                          {project.budgetMax ? 
                            `${project.budget}€ - ${project.budgetMax}€` : 
                            `${project.budget}€`
                          }
                        </p>
                        <p className="text-xs text-white/70">Budget estimé</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-white/70" />
                        <span>Mis à jour {formatDate(project.updatedAt)}</span>
                      </div>
                      <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-[#FCDA89] hover:text-[#FCDA89]/80 hover:bg-[#FCDA89]/10">
                        <Link href={`/client/projets/${project.id}`}>
                          Détails <ChevronRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
          
          <Button className="w-full flex items-center gap-2 bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
            <Link href="/client/projets">
              <Plus className="h-4 w-4" />
              Voir tous les projets
            </Link>
          </Button>
        </TabsContent>
        
        <TabsContent value="artisans" className="mt-0 space-y-4">
          {loadingArtisans ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89]"></div>
            </div>
          ) : artisans.length === 0 ? (
            <Card className="overflow-hidden bg-white/5 border-white/10 text-white">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-white/30" />
                <h3 className="font-medium mb-2">Aucun artisan favori</h3>
                <p className="text-white/70 text-sm mb-4">Vous n'avez pas encore d'artisans favoris</p>
                <Button className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
                  <Link href="/artisans">
                    <Plus className="h-4 w-4 mr-2" />
                    Découvrir les artisans
                  </Link>
                </Button>
              </CardContent>  
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {artisans.map((artisan) => (
                  <Card key={artisan.id} className="overflow-hidden bg-white/5 border-white/10 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={artisan.image} alt={artisan.name} />
                          <AvatarFallback className="bg-[#FCDA89]/20">{artisan.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-sm">{artisan.name}</h3>
                          <p className="text-white/70 text-xs">{artisan.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-[#FCDA89] text-[#FCDA89]" />
                          <span className="ml-1 text-sm font-medium">{artisan.rating}</span>
                        </div>
                        <span className="text-xs text-white/70">
                          ({artisan.reviews} avis)
                        </span>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button size="sm" className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
                          <Link href={`/client/artisans/${artisan.id}`}>
                            Voir profil
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Button className="w-full flex items-center gap-2 border-[#FCDA89] text-[#FCDA89] hover:bg-[#FCDA89]/10" variant="outline" asChild>
                <Link href="/client/artisans">
                  <Plus className="h-4 w-4" />
                  Voir tous les artisans
                </Link>
              </Button>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="agenda" className="mt-0 space-y-4">
          {loadingEvents ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89]"></div>
            </div>
          ) : events.length === 0 ? (
            <Card className="overflow-hidden bg-white/5 border-white/10 text-white">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-white/30" />
                <h3 className="font-medium mb-2">Aucun événement</h3>
                <p className="text-white/70 text-sm mb-4">Vous n'avez pas d'événements programmés</p>
                <Button className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
                  <Link href="/create-project-ai">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un projet
                  </Link>
                </Button>
              </CardContent>  
            </Card>
          ) : (
            <>
              {events.map((event) => (
                <Card key={event.id} className="overflow-hidden bg-white/5 border-white/10 text-white">
                  <div className="h-1 bg-[#FCDA89]"></div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{event.title}</h3>
                      <Badge variant="outline" className="bg-[#FCDA89]/10 text-[#FCDA89] border-[#FCDA89]/30 text-xs">
                        {event.type === "meeting" ? "Rendez-vous" : "Livraison"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 mb-3">
                      <p className="text-xs flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-white/70" />
                        <span>{event.date}, {event.time}</span>
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white">Détails</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button className="w-full flex items-center gap-2 border-[#FCDA89] text-[#FCDA89] hover:bg-[#FCDA89]/10" variant="outline" asChild>
                <Link href="/client/agenda">
                  <Plus className="h-4 w-4" />
                  Voir l&apos;agenda complet
                </Link>
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Résumé */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Résumé</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-white/10 shadow-sm overflow-hidden bg-white/5">
              <div className="h-1 bg-[#FCDA89]"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#FCDA89]">{projects.length}</span>
                <span className="text-xs text-white/70 mt-2 text-center">Projets total</span>
              </CardContent>
            </Card>

            <Card className="border-white/10 shadow-sm overflow-hidden bg-white/5">
              <div className="h-1 bg-[#FCDA89]"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#FCDA89]">
                  {loadingMessages ? "..." : unreadMessages}
                </span>
                <span className="text-xs text-white/70 mt-2 text-center">Messages non lus</span>
              </CardContent>
            </Card>

            <Card className="border-white/10 shadow-sm overflow-hidden bg-white/5">
              <div className="h-1 bg-[#FCDA89]"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#FCDA89]">{events.length}</span>
                <span className="text-xs text-white/70 mt-2 text-center">Événements à venir</span>
              </CardContent>
            </Card>

            <Card className="border-white/10 shadow-sm overflow-hidden bg-white/5">
              <div className="h-1 bg-[#FCDA89]"></div>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-[#FCDA89]">{artisans.length}</span>
                <span className="text-xs text-white/70 mt-2 text-center">Artisans favoris</span>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="w-full bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
            <Link href="/create-project-ai">
              <Plus className="h-4 w-4 mr-2" />
              Créer un nouveau projet
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Activité récente */}
      <Card className="overflow-hidden bg-white/5 border-white/10 text-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingActivity ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FCDA89]"></div>
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="p-6 text-center text-white/70">
              <FileClock className="h-8 w-8 mx-auto mb-2 text-white/50" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon === 'MessageSquare' ? MessageSquare : 
                                   activity.icon === 'CheckCircle' ? CheckCircle :
                                   activity.icon === 'Clock' ? Clock : FileClock
                
                return (
                  <div key={activity.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FCDA89]/20 text-[#FCDA89]">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-white/70">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 border-t border-white/10 bg-white/5">
          <Button className="w-full bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" size="sm">
            Voir toutes les activités
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 