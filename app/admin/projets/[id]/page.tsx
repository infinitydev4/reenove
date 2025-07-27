"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  User, 
  Euro, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Download,
  Eye,
  MoreHorizontal,
  UserPlus,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { ProjectStatus } from "@/lib/generated/prisma"
import GoogleMapComponent from "@/components/maps/GoogleMapComponent"
import ArtisanSelectionDialog from "@/components/admin/projects/ArtisanSelectionDialog"

interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  budget: number | null;
  budgetMax: number | null;
  location: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  category: {
    id: string;
    name: string;
  } | null;
  service: {
    id: string;
    name: string;
  } | null;
  _count: {
    quotes: number;
  };
}



// Fonction pour obtenir le badge de statut
function getStatusBadge(status: ProjectStatus) {
  switch (status) {
    case ProjectStatus.DRAFT:
      return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">Brouillon</Badge>
    case ProjectStatus.PENDING:
      return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En attente</Badge>
    case ProjectStatus.PUBLISHED:
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Publié</Badge>
    case ProjectStatus.ASSIGNED:
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Attribué</Badge>
    case ProjectStatus.IN_PROGRESS:
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">En cours</Badge>
    case ProjectStatus.COMPLETED:
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Terminé</Badge>
    case ProjectStatus.CANCELLED:
      return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Annulé</Badge>
    default:
      return <Badge variant="outline">Inconnu</Badge>
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignedArtisan, setAssignedArtisan] = useState<any>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`)
        if (!response.ok) {
          throw new Error('Projet non trouvé')
        }
        const data = await response.json()
        setProject(data)
        
        // Si le projet est assigné, récupérer les informations de l'artisan
        if (data.status === ProjectStatus.ASSIGNED) {
          fetchAssignedArtisan()
        }
      } catch (err) {
        console.error('Erreur lors du chargement du projet:', err)
        setError('Impossible de charger les détails du projet')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchAssignedArtisan = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}/assigned-artisan`)
        if (response.ok) {
          const data = await response.json()
          setAssignedArtisan(data.artisan)
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'artisan assigné:', err)
      }
    }

    fetchProject()
  }, [projectId])

  const handleDeleteProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return
    
    try {
      const response = await fetch(`/api/admin/projects/${projectId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }
      
      toast.success('Projet supprimé avec succès')
      router.push('/admin/projets')
    } catch (err) {
      console.error('Erreur:', err)
      toast.error('Impossible de supprimer le projet')
    }
  }

  const handleAssignSuccess = () => {
    // Recharger les données du projet pour voir le nouveau statut
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`)
        if (response.ok) {
          const data = await response.json()
          setProject(data)
          
          // Récupérer les informations de l'artisan assigné
          if (data.status === ProjectStatus.ASSIGNED) {
            const artisanResponse = await fetch(`/api/admin/projects/${projectId}/assigned-artisan`)
            if (artisanResponse.ok) {
              const artisanData = await artisanResponse.json()
              setAssignedArtisan(artisanData.artisan)
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du rechargement:', err)
      }
    }
    fetchProject()
  }

  const handleUnassignProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désattribuer ce projet ? L\'artisan sera notifié de cette annulation.')) return
    
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/unassign`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la désattribution')
      }

      const result = await response.json()
      
      toast.success('Attribution annulée avec succès')
      
      // Recharger les données du projet
      setProject(result.project)
      setAssignedArtisan(null)

    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Impossible de désattribuer le projet')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Link href="/admin/projets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Projet non trouvé</CardTitle>
            <CardDescription className="text-white/70">
              Le projet que vous recherchez n'existe pas ou a été supprimé.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Link href="/admin/projets">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{project.title}</h1>
            <p className="text-white/70">Détails du projet</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={handleDeleteProject}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Détails du projet */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Informations du projet</CardTitle>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Description</h3>
                <p className="text-white/70 leading-relaxed">{project.description}</p>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-white mb-1">Catégorie</h4>
                  <p className="text-white/70">{project.category?.name || 'Non définie'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Service</h4>
                  <p className="text-white/70">{project.service?.name || 'Non défini'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Budget</h4>
                  <p className="text-white/70">
                    {project.budget ? `${project.budget.toLocaleString('fr-FR')} €` : 'Non défini'}
                    {project.budgetMax && project.budgetMax !== project.budget && 
                      ` - ${project.budgetMax.toLocaleString('fr-FR')} €`
                    }
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-1">Devis reçus</h4>
                  <p className="text-white/70">{project._count.quotes} devis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Localisation avec carte */}
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Localisation du chantier
              </CardTitle>
              <CardDescription className="text-white/70">
                {project.location}, {project.postalCode} {project.city}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleMapComponent 
                address={project.location || ""} 
                city={project.city || ""} 
                postalCode={project.postalCode || ""} 
                mapHeight="300px"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informations client */}
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={project.user.image || undefined} alt={project.user.name || ""} />
                  <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                    {project.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-white">{project.user.name || "Utilisateur sans nom"}</h3>
                  <p className="text-sm text-white/70">{project.user.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                  <Mail className="mr-2 h-4 w-4" />
                  Contacter
                </Button>
                <Button variant="outline" size="sm" className="w-full bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messages
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dates importantes */}
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Dates importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Créé le</p>
                  <p className="text-xs text-white/70">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/70" />
                <div>
                  <p className="text-sm font-medium text-white">Dernière mise à jour</p>
                  <p className="text-xs text-white/70">
                    {new Date(project.updatedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Artisan assigné */}
          {project.status === ProjectStatus.ASSIGNED && assignedArtisan && (
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Artisan assigné</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={assignedArtisan.image || undefined} alt={assignedArtisan.name || ""} />
                    <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                      {assignedArtisan.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-white flex items-center gap-2">
                      {assignedArtisan.name || "Artisan"}
                      {assignedArtisan.profile?.verificationStatus === 'VERIFIED' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </h3>
                    <p className="text-sm text-white/70">{assignedArtisan.email}</p>
                    {assignedArtisan.specialties?.length > 0 && (
                      <p className="text-xs text-white/60">
                        {assignedArtisan.specialties.find((s: any) => s.isPrimary)?.service || assignedArtisan.specialties[0]?.service}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {assignedArtisan.phone && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Phone className="h-3 w-3" />
                      <span>{assignedArtisan.phone}</span>
                    </div>
                  )}
                  {assignedArtisan.address && (
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="h-3 w-3" />
                      <span>{assignedArtisan.address}</span>
                    </div>
                  )}
                  {assignedArtisan.assignment?.assignedAt && (
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Assigné le {new Date(assignedArtisan.assignment.assignedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                                 <div className="mt-4 space-y-2">
                   <Button variant="outline" size="sm" className="w-full bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                     <Mail className="mr-2 h-4 w-4" />
                     Contacter l'artisan
                   </Button>
                   <Button variant="outline" size="sm" className="w-full bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                     <MessageSquare className="mr-2 h-4 w-4" />
                     Voir les messages
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     className="w-full bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10"
                     onClick={() => handleUnassignProject()}
                   >
                     <X className="mr-2 h-4 w-4" />
                     Désattribuer
                   </Button>
                 </div>
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.status !== ProjectStatus.ASSIGNED && project.status !== ProjectStatus.IN_PROGRESS && project.status !== ProjectStatus.COMPLETED && (
                <Button 
                  onClick={() => setAssignDialogOpen(true)}
                  className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Attribuer à un artisan
                </Button>
              )}
              
              {project.status === ProjectStatus.ASSIGNED && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    Projet attribué avec succès
                  </div>
                  <p className="text-green-400/70 text-xs mt-1">
                    L'artisan a été notifié par email
                  </p>
                </div>
              )}

              <Button className="w-full bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10" variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Marquer comme terminé
              </Button>
              <Button variant="outline" className="w-full bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                <Edit className="mr-2 h-4 w-4" />
                Modifier le projet
              </Button>
              <Button variant="outline" className="w-full bg-white/5 border-red-500/20 text-red-400 hover:bg-red-500/10">
                <AlertCircle className="mr-2 h-4 w-4" />
                Signaler un problème
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onglets pour plus de détails */}
      <Tabs defaultValue="quotes" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border-[#FCDA89]/20">
          <TabsTrigger value="quotes" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">
            Devis ({project._count.quotes})
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">
            Messages
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">
            Historique
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="quotes" className="mt-6">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Devis reçus</CardTitle>
              <CardDescription className="text-white/70">
                Liste des devis soumis par les artisans
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project._count.quotes === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/70">Aucun devis reçu pour ce projet</p>
                </div>
              ) : (
                <p className="text-white/70">Chargement des devis...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages" className="mt-6">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Messages</CardTitle>
              <CardDescription className="text-white/70">
                Conversation avec le client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70">Aucun message pour ce projet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Historique du projet</CardTitle>
              <CardDescription className="text-white/70">
                Chronologie des événements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FCDA89] rounded-full mt-2"></div>
                  <div>
                    <p className="text-white font-medium">Projet créé</p>
                    <p className="text-white/70 text-sm">
                      {new Date(project.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'attribution */}
      <ArtisanSelectionDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        projectId={projectId}
        projectTitle={project.title}
        projectCategory={project.category?.name}
        onAssignSuccess={handleAssignSuccess}
      />
    </div>
  )
} 