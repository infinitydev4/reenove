"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Clock, 
  FileText, 
  MessageSquare, 
  Star, 
  Calendar, 
  Plus, 
  ArrowRight,
  Search
} from "lucide-react"

// Données fictives pour le tableau de bord
const mockProjects = [
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

const mockArtisans = [
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

const mockEvents = [
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

export default function ClientDashboard() {
  const { data: session } = useSession()
  const [selectedTab, setSelectedTab] = useState("projets")
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bienvenue, {session?.user?.name?.split(' ')[0] || 'Client'}</h1>
          <p className="text-muted-foreground">Voici un aperçu de vos projets et activités récentes.</p>
        </div>
        
        <div className="flex gap-2">
          <Button className="hidden md:flex">
            <Search className="mr-2 h-4 w-4" />
            Trouver un artisan
          </Button>
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau projet
          </Button>
        </div>
      </div>
      
      {/* Résumé */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets totaux</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              1 en cours, 2 en attente
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +1 depuis hier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements à venir</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artisans favoris</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Sur 15 consultés
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs pour différentes sections */}
      <Tabs defaultValue="projets" className="space-y-4" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="projets">Mes projets</TabsTrigger>
          <TabsTrigger value="artisans">Artisans recommandés</TabsTrigger>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
        </TabsList>
        
        {/* Projets */}
        <TabsContent value="projets" className="space-y-4">
          {mockProjects.map((project) => (
            <Card key={project.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{project.title}</h3>
                      <Badge variant={project.status === "En cours" ? "default" : "outline"}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Artisan: {project.artisan}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {project.messages > 0 && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {project.messages} nouveau{project.messages > 1 ? 'x' : ''}
                      </Badge>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/client/projets/${project.id}`}>
                        Détails
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progression: {project.progress}%</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {project.lastUpdate}
                    </span>
                  </div>
                  <Progress value={project.progress} />
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="text-center">
            <Button variant="outline" asChild>
              <a href="/client/projets">
                Voir tous les projets
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </TabsContent>
        
        {/* Artisans recommandés */}
        <TabsContent value="artisans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockArtisans.map((artisan) => (
              <Card key={artisan.id}>
                <CardContent className="p-4 md:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={artisan.image} 
                      alt={artisan.name} 
                      className="h-10 w-10 rounded-full" 
                    />
                    <div>
                      <h3 className="font-semibold">{artisan.name}</h3>
                      <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{artisan.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({artisan.reviews} avis)
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">Profil</Button>
                    <Button size="sm" className="flex-1">Contacter</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button variant="outline" asChild>
              <a href="/artisans">
                Voir plus d'artisans
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </TabsContent>
        
        {/* Agenda */}
        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements à venir</CardTitle>
              <CardDescription>
                Vos rendez-vous et échéances pour les prochains jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <Button size="sm" variant="outline">Détails</Button>
                    </div>
                  </div>
                ))}

                <Separator />
                
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="sm">
                    <Plus className="mr-1 h-4 w-4" />
                    Ajouter un événement
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a href="/client/agenda">
                      Voir agenda complet
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 