"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Phone, 
  Mail, 
  FileText, 
  Camera,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Wrench,
  Star
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProjectDetail {
  id: string
  type: "classic" | "express"
  title: string
  description: string
  client: {
    name: string
    email: string
    phone: string
  }
  location: {
    address: string
    city: string
    postalCode: string
  }
  category: string
  service: string
  status: string
  budget: string
  startDate: string
  endDate: string
  createdAt: string
  images: string[]
  invitation?: {
    status: string
    message: string
    date: string
  }
  quote?: {
    id: string
    amount: string
    status: string
    description: string
    date: string
  }
  notes?: string
  specialRequirements?: string
  floor?: number
  hasElevator?: boolean
  assignedAt?: string
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/artisan/projets/${params.id}`)
        const data = await response.json()

        if (data.success) {
          setProject(data.project)
        } else {
          setError(data.error || "Projet non trouvé")
        }
      } catch (err) {
        console.error("Erreur lors du chargement du projet:", err)
        setError("Erreur lors du chargement du projet")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "terminé":
        return "bg-green-500/20 text-green-300"
      case "en cours":
      case "finition":
        return "bg-blue-500/20 text-blue-300"
      case "confirmé":
        return "bg-[#FCDA89]/20 text-[#FCDA89]"
      default:
        return "bg-orange-500/20 text-orange-300"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E261C] flex items-center justify-center">
        <div className="text-center text-white/70">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89] mx-auto mb-2"></div>
          <p>Chargement du projet...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#0E261C] flex items-center justify-center">
        <div className="text-center text-white/70">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p>{error}</p>
          <Button 
            onClick={() => router.back()} 
            className="mt-4 bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C]"
          >
            Retour
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E261C] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-[#FCDA89] hover:bg-[#FCDA89]/10 self-start"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-white break-words">{project.title}</h1>
            <p className="text-sm md:text-base text-white/70 break-words">
              {project.type === "express" ? "Projet Express" : "Projet Standard"} • Créé le {project.createdAt}
            </p>
          </div>
          <Badge className={`px-3 py-1 ${getStatusColor(project.status)} self-start md:self-center`}>
            {project.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations du projet */}
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#FCDA89]" />
                  Détails du projet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-[#FCDA89] mb-2">Description</h3>
                  <p className="text-white/80">{project.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-[#FCDA89] mb-1">Catégorie</h4>
                    <p className="text-white/80 break-words">{project.category}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#FCDA89] mb-1">Service</h4>
                    <p className="text-white/80 break-words">{project.service}</p>
                  </div>
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#FCDA89] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white/70">Date de début</p>
                      <p className="text-white break-words">{project.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#FCDA89] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-white/70">Date de fin</p>
                      <p className="text-white break-words">{project.endDate}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#FCDA89]" />
                  <div>
                    <p className="text-sm text-white/70">Budget</p>
                    <p className="text-xl font-bold text-[#FCDA89]">{project.budget}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations Express spécifiques */}
            {project.type === "express" && (
              <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-[#FCDA89]" />
                    Informations Express
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.assignedAt && (
                    <div>
                      <h4 className="font-medium text-[#FCDA89] mb-1">Assigné le</h4>
                      <p className="text-white/80">{project.assignedAt}</p>
                    </div>
                  )}

                                     {project.floor && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div>
                         <h4 className="font-medium text-[#FCDA89] mb-1">Étage</h4>
                         <p className="text-white/80">{project.floor}</p>
                       </div>
                       <div>
                         <h4 className="font-medium text-[#FCDA89] mb-1">Ascenseur</h4>
                         <p className="text-white/80">{project.hasElevator ? "Oui" : "Non"}</p>
                       </div>
                     </div>
                   )}

                  {project.notes && (
                    <div>
                      <h4 className="font-medium text-[#FCDA89] mb-1">Notes</h4>
                      <p className="text-white/80">{project.notes}</p>
                    </div>
                  )}

                  {project.specialRequirements && (
                    <div>
                      <h4 className="font-medium text-[#FCDA89] mb-1">Exigences particulières</h4>
                      <p className="text-white/80">{project.specialRequirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Images du projet */}
            {project.images.length > 0 && (
              <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-[#FCDA89]" />
                    Photos du projet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg bg-white/10 overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informations client */}
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[#FCDA89]" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#FCDA89]/20 text-white">
                      {project.client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{project.client.name}</p>
                    <div className="flex items-center gap-1 text-sm text-white/70">
                      <Star className="h-3 w-3 text-[#FCDA89]" />
                      <span>Client vérifié</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                <div className="space-y-3">
                  {project.client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#FCDA89]" />
                      <span className="text-sm text-white/80">{project.client.email}</span>
                    </div>
                  )}
                  {project.client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-[#FCDA89]" />
                      <span className="text-sm text-white/80">{project.client.phone}</span>
                    </div>
                  )}
                                     <div className="flex items-start gap-2">
                     <MapPin className="h-4 w-4 text-[#FCDA89] flex-shrink-0 mt-0.5" />
                     <div className="text-sm text-white/80 min-w-0">
                       <p className="break-words">{project.location.address}</p>
                       <p className="break-words">{project.location.postalCode} {project.location.city}</p>
                     </div>
                   </div>
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                                 <div className="space-y-2">
                   <Button 
                     className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C] text-sm"
                     onClick={() => window.open(`tel:${project.client.phone}`, '_self')}
                   >
                     <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                     <span className="truncate">Appeler</span>
                   </Button>
                   <Button 
                     variant="outline" 
                     className="w-full border-[#FCDA89]/30 text-[#FCDA89] hover:bg-[#FCDA89]/10 text-sm"
                     onClick={() => window.open(`mailto:${project.client.email}`, '_self')}
                   >
                     <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                     <span className="truncate">Envoyer un email</span>
                   </Button>
                   <Button 
                     variant="outline" 
                     className="w-full border-[#FCDA89]/30 text-[#FCDA89] hover:bg-[#FCDA89]/10 text-sm"
                   >
                     <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                     <span className="truncate">Messages</span>
                   </Button>
                 </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#FCDA89]" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.type === "classic" && !project.quote && (
                  <Button className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C]">
                    <FileText className="h-4 w-4 mr-2" />
                    Créer un devis
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full border-[#FCDA89]/30 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier RDV
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-[#FCDA89]/30 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Voir sur la carte
                </Button>
                
                {project.status !== "Terminé" && (
                  <Button 
                    variant="outline" 
                    className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme terminé
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Information sur l'invitation (projets classiques) */}
            {project.type === "classic" && project.invitation && (
              <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#FCDA89]" />
                    Invitation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-white/70">Statut</p>
                    <Badge className={`${getStatusColor(project.invitation.status)} mt-1`}>
                      {project.invitation.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Date d'invitation</p>
                    <p className="text-white">{project.invitation.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Message</p>
                    <p className="text-white/80 text-sm">{project.invitation.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Information sur le devis (projets classiques) */}
            {project.type === "classic" && project.quote && (
              <Card className="bg-[#0E261C] border-[#FCDA89]/30 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#FCDA89]" />
                    Devis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-white/70">Montant</p>
                    <p className="text-xl font-bold text-[#FCDA89]">{project.quote.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Statut</p>
                    <Badge className={`${getStatusColor(project.quote.status)} mt-1`}>
                      {project.quote.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Date</p>
                    <p className="text-white">{project.quote.date}</p>
                  </div>
                  {project.quote.description && (
                    <div>
                      <p className="text-sm text-white/70">Description</p>
                      <p className="text-white/80 text-sm">{project.quote.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 