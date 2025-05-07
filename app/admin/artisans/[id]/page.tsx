"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BadgeCheck,
  Wrench,
  FileText,
  User,
  Star,
  HardHat,
  CheckCircle,
  Clock,
  CircleDollarSign,
  Building,
  BarChart,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  CalendarDays,
  ClipboardList,
  History,
  CheckSquare,
  Layers,
  Download,
  Award,
  CreditCard,
  FileDigit,
  UserCircle,
  Pencil,
  ExternalLink
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { toast } from "@/components/ui/toast-handler"
import { useRouter } from "next/navigation"

// Type pour un artisan
type Artisan = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city?: string
  postalCode?: string
  status: string
  speciality: string
  rating: number
  projectsCompleted: number
  currentProjects: number
  totalEarnings: string
  availability: string
  startDate: string
  avatar: string
  verified: boolean
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED"
  onboarding: {
    progress: number
    steps: {
      name: string
      completed: boolean
    }[]
  }
  siret?: string
}

// Type pour un projet
type Project = {
  id: string
  title: string
  status: string
  amount: string
  clientName: string
  startDate: string
  endDate?: string
}

// Type pour un document
type Document = {
  id: string
  name: string
  type: string
  status: string
  uploadDate: string
  expiryDate?: string
  fileUrl?: string // URL du fichier à télécharger
}

export default function ArtisanDetailPage() {
  const params = useParams()
  const artisanId = params.id as string
  
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  // Récupération des données de l'artisan
  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        setIsLoading(true)
        
        // Récupérer les informations de l'artisan
        const artisanResponse = await fetch(`/api/admin/artisans/${artisanId}`)
        if (!artisanResponse.ok) {
          throw new Error(`Erreur: ${artisanResponse.status}`)
        }
        const artisanData = await artisanResponse.json()
        
        // Ajouter les données d'onboarding fictives pour le MVP
        // À remplacer par les vraies données plus tard
        const artisanWithOnboarding = {
          ...artisanData,
          onboarding: {
            progress: 75, // pourcentage de complétion
            steps: [
              { name: "Inscription", completed: true },
              { name: "Informations personnelles", completed: true },
              { name: "Documents légaux", completed: true },
              { name: "Qualifications", completed: false },
              { name: "Profil validé", completed: false }
            ]
          }
        }
        
        setArtisan(artisanWithOnboarding)
        
        // Pour le MVP, on utilise des données fictives pour les projets
        setProjects([
          {
            id: "proj1",
            title: "Rénovation salle de bain",
            status: "completed",
            amount: "2 800€",
            clientName: "Dupont Marc",
            startDate: "15/02/2023",
            endDate: "28/03/2023"
          },
          {
            id: "proj2",
            title: "Installation électrique",
            status: "in_progress",
            amount: "1 500€",
            clientName: "Martin Sophie",
            startDate: "05/04/2023"
          },
          {
            id: "proj3", 
            title: "Réfection toiture",
            status: "pending",
            amount: "4 200€",
            clientName: "Dubois Jean",
            startDate: "Programmé 15/06/2023"
          }
        ])
        
        // Récupérer les vrais documents de l'artisan
        try {
          const documentsResponse = await fetch(`/api/admin/artisans/${artisanId}/documents`)
          
          if (documentsResponse.ok) {
            const documentsData = await documentsResponse.json()
            
            // Transformer les données pour correspondre au format attendu
            const formattedDocuments = documentsData.map((doc: any) => ({
              id: doc.id,
              name: doc.title || doc.type,
              type: doc.type,
              status: doc.verified ? "valid" : "pending",
              uploadDate: new Date(doc.uploadDate).toLocaleDateString('fr-FR'),
              expiryDate: doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString('fr-FR') : undefined,
              fileUrl: doc.fileUrl
            }))
            
            // Ne pas remplacer par des données fictives si aucun document n'est trouvé
            setDocuments(formattedDocuments)
          } else {
            console.error("Impossible de récupérer les documents:", await documentsResponse.text())
            setDocuments([])
            toast({
              title: "Erreur",
              description: "Impossible de récupérer les documents de l'artisan.",
              variant: "destructive",
            })
          }
        } catch (docError) {
          console.error("Erreur lors de la récupération des documents:", docError)
          setDocuments([])
          toast({
            title: "Erreur",
            description: "Une erreur s'est produite lors de la récupération des documents.",
            variant: "destructive",
          })
        }
        
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données de l'artisan. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtisanData()
  }, [artisanId])

  // Fonction pour le statut de l'artisan
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif":
        return <Badge className="bg-green-500">Actif</Badge>
      case "inactif":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactif</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  // Fonction pour la disponibilité de l'artisan
  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "disponible":
        return <Badge className="bg-green-500">Disponible</Badge>
      case "occupé":
        return <Badge className="bg-amber-500">Occupé</Badge>
      case "indisponible":
        return <Badge variant="outline" className="border-red-500 text-red-500">Indisponible</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  // Fonction pour le statut du projet
  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Terminé</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500">En cours</Badge>
      case "pending":
        return <Badge className="bg-amber-500">À venir</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  // Fonction pour le statut du document
  const getDocumentStatusBadge = (status: string, expiryDate?: string) => {
    let badge;
    
    switch (status) {
      case "valid":
        badge = <Badge className="bg-green-500">Valide</Badge>
        break;
      case "expired":
        badge = <Badge className="bg-red-500">Expiré</Badge>
        break;
      case "pending":
        badge = <Badge className="bg-amber-500">En attente</Badge>
        break;
      default:
        badge = <Badge variant="outline">Inconnu</Badge>
    }
    
    // Si le document a une date d'expiration, ajouter un tooltip
    if (expiryDate) {
      return (
        <div className="group relative flex items-center">
          {badge}
          <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded-md bg-gray-900 p-2 text-xs text-white group-hover:block z-50">
            {status === "valid" 
              ? `Valide jusqu'au ${expiryDate}` 
              : status === "expired" 
                ? `Expiré depuis le ${expiryDate}` 
                : `Date d'expiration: ${expiryDate}`
            }
          </div>
        </div>
      )
    }
    
    return badge;
  }

  // Fonction pour afficher la notation
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="font-medium mr-1">{rating}</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`h-4 w-4 ${
                i < Math.floor(rating) 
                  ? "fill-amber-400 text-amber-400" 
                  : i < rating 
                    ? "fill-amber-400/50 text-amber-400/50" 
                    : "text-gray-300"
              }`} 
            />
          ))}
        </div>
      </div>
    )
  }

  // Fonction pour mettre à jour le statut de vérification de l'artisan
  const updateVerificationStatus = async (status: string) => {
    if (!artisan) return
    
    try {
      setIsUpdating(true)
      
      // Appel API pour mettre à jour le statut de vérification
      const response = await fetch(`/api/admin/artisans/${artisanId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verificationStatus: status }),
      })
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`)
      }
      
      // Mettre à jour l'état local
      setArtisan({
        ...artisan,
        verificationStatus: status as "PENDING" | "VERIFIED" | "REJECTED",
        verified: status === "VERIFIED"
      })
      
      toast({
        title: "Statut mis à jour",
        description: status === "VERIFIED" 
          ? "L'artisan a été vérifié avec succès." 
          : status === "REJECTED" 
            ? "L'artisan a été rejeté." 
            : "L'artisan est en attente de vérification.",
        variant: status === "VERIFIED" ? "default" : status === "REJECTED" ? "destructive" : "default",
      })
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de vérification.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Fonction pour gérer le téléchargement d'un document
  const handleDocumentDownload = async (document: Document) => {
    try {
      // Pour un document de démonstration sans URL, on affiche un message d'erreur
      if (!document.fileUrl) {
        // Tenter de récupérer le document réel depuis l'API
        const response = await fetch(`/api/admin/documents/${document.id}`)
        
        if (!response.ok) {
          toast({
            title: "Erreur",
            description: "Ce document n'a pas de fichier associé pour le téléchargement.",
            variant: "destructive",
          })
          return
        }
        
        const documentData = await response.json()
        if (!documentData.fileUrl) {
          toast({
            title: "Erreur",
            description: "URL du document non disponible.",
            variant: "destructive",
          })
          return
        }
        
        // Utiliser l'URL du document réel
        window.open(documentData.fileUrl, '_blank')
        
        toast({
          title: "Téléchargement en cours",
          description: `Le document "${document.name}" est en cours de téléchargement.`,
        })
        
        return
      }
      
      // Si le document a une URL S3 réelle
      if (document.fileUrl.includes('amazonaws.com')) {
        window.open(document.fileUrl, '_blank')
        
        toast({
          title: "Téléchargement en cours",
          description: `Le document "${document.name}" est en cours de téléchargement.`,
        })
        return
      }
      
      // Pour les documents fictifs locaux dans le dashboard (pour la démo)
      const link = window.document.createElement('a')
      link.href = document.fileUrl
      link.download = document.name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      
      toast({
        title: "Téléchargement en cours",
        description: `Le document "${document.name}" est en cours de téléchargement.`,
      })
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour télécharger tous les documents
  const handleDownloadAllDocuments = async () => {
    if (documents.length === 0) {
      toast({
        title: "Information",
        description: "Aucun document à télécharger.",
        variant: "default",
      })
      return
    }

    // Télécharger les documents un par un
    try {
      toast({
        title: "Préparation du téléchargement",
        description: `${documents.length} documents en cours de récupération...`,
      })
      
      let downloadCount = 0
      
      // Traiter les documents séquentiellement avec un léger délai
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i]
        
        // Pour les URLs de documents réels stockés sur S3
        if (doc.fileUrl && doc.fileUrl.includes('amazonaws.com')) {
          window.open(doc.fileUrl, '_blank')
          downloadCount++
          // Attendre un peu avant de continuer
          await new Promise(resolve => setTimeout(resolve, 500))
          continue
        }
        
        // Pour les documents sans URL ou avec des URLs fictives, essayer de récupérer l'URL réelle
        try {
          const response = await fetch(`/api/admin/documents/${doc.id}`)
          if (response.ok) {
            const documentData = await response.json()
            if (documentData.fileUrl) {
              window.open(documentData.fileUrl, '_blank')
              downloadCount++
              // Attendre un peu avant de continuer
              await new Promise(resolve => setTimeout(resolve, 500))
            }
          }
        } catch (err) {
          console.error(`Erreur lors de la récupération du document ${doc.name}:`, err)
        }
      }
      
      if (downloadCount > 0) {
        toast({
          title: "Téléchargement en cours",
          description: `${downloadCount} document(s) en cours de téléchargement.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: "Aucun document n'a pu être téléchargé.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Erreur lors du téléchargement des documents:", err)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger les documents.",
        variant: "destructive",
      })
    }
  }

  // Fonction pour obtenir le nom et l'icône appropriés pour chaque type de document
  const getDocumentTypeInfo = (type: string) => {
    switch (type.toUpperCase()) {
      case "KBIS":
        return { 
          label: "Extrait KBIS", 
          icon: <FileText className="h-4 w-4 mr-2 text-blue-600" /> 
        }
      case "INSURANCE":
        return { 
          label: "Assurance décennale", 
          icon: <ShieldCheck className="h-4 w-4 mr-2 text-green-600" /> 
        }
      case "QUALIFICATION":
        return { 
          label: "Certification professionnelle", 
          icon: <Award className="h-4 w-4 mr-2 text-amber-600" /> 
        }
      case "ID":
        return { 
          label: "Pièce d'identité", 
          icon: <User className="h-4 w-4 mr-2 text-red-600" /> 
        }
      case "RIB":
        return { 
          label: "Relevé d'identité bancaire", 
          icon: <CreditCard className="h-4 w-4 mr-2 text-purple-600" /> 
        }
      case "LEGAL":
        return { 
          label: "Document légal", 
          icon: <FileDigit className="h-4 w-4 mr-2 text-blue-600" /> 
        }
      default:
        return { 
          label: type || "Document", 
          icon: <FileText className="h-4 w-4 mr-2 text-gray-600" /> 
        }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg lg:col-span-2" />
        </div>
        
        <div>
          <Skeleton className="h-10 w-64 mb-4" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link href="/admin/artisans">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
          </Button>
        </Link>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40 flex-col gap-2">
              <p className="text-red-500">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Page de détails de l'artisan
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/artisans">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Détails de l&apos;artisan
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button variant="outline">
            <Phone className="mr-2 h-4 w-4" />
            Appeler
          </Button>
          <Button>
            <User className="mr-2 h-4 w-4" />
            Éditer
          </Button>
        </div>
      </div>

      {/* Carte principale de l'artisan */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar className="h-24 w-24 mt-2">
                <AvatarImage src={artisan?.avatar} alt={artisan?.name} />
                <AvatarFallback className="text-2xl">{artisan?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center justify-center">
                  <h2 className="text-xl font-bold">{artisan?.name}</h2>
                  {artisan?.verified && (
                    <BadgeCheck className="h-5 w-5 ml-1 text-blue-500" />
                  )}
                </div>
                <p className="text-muted-foreground">{artisan?.speciality}</p>
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex-1 flex justify-between px-4 py-2">
                    <span>Statut</span>
                    <span>{getStatusBadge(artisan?.status || "")}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex-1 flex justify-between px-4 py-2">
                    <span>Disponibilité</span>
                    <span>{getAvailabilityBadge(artisan?.availability || "")}</span>
                  </Badge>
                </div>
              </div>
              
              {/* Nouveau: Section de vérification */}
              <div className="border-t pt-4 w-full">
                <div className="text-sm font-medium mb-2">Statut de vérification</div>
                <Select 
                  value={artisan?.verificationStatus}
                  onValueChange={(value) => updateVerificationStatus(value)}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Statut de vérification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VERIFIED">
                      <div className="flex items-center">
                        <BadgeCheck className="h-4 w-4 mr-2 text-blue-500" />
                        <span>Vérifié</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <div className="flex items-center">
                        <CheckSquare className="h-4 w-4 mr-2 text-red-500" />
                        <span>Rejeté</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-500" />
                        <span>En attente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold flex items-center">
              <UserCircle className="mr-2 h-6 w-6 text-primary" />
              Informations personnelles
            </CardTitle>
            <CardDescription className="text-sm">
              Coordonnées et informations détaillées
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne gauche */}
              <div className="space-y-5">
                <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <span className="text-sm font-medium break-all">{artisan?.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Téléphone</span>
                      <span className="text-sm font-medium">{artisan?.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    Entreprise
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Nom</span>
                      <span className="text-sm font-medium">SARL {artisan?.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">SIRET</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium tracking-wide font-mono">{artisan?.siret || "Non renseigné"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Colonne droite */}
              <div className="space-y-5">
                <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Adresse
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Rue</span>
                      <span className="text-sm font-medium">{artisan?.address}</span>
                    </div>
                    <div className="flex flex-row gap-3">
                      <div className="flex flex-col flex-1">
                        <span className="text-xs text-muted-foreground">Code postal</span>
                        <span className="text-sm font-medium">{artisan?.postalCode}</span>
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="text-xs text-muted-foreground">Ville</span>
                        <span className="text-sm font-medium">{artisan?.city}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center">
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-primary hover:text-primary-focus hover:bg-primary/10">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Voir sur la carte</span>
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                    <Badge className="h-4 w-4 mr-2" />
                    Certifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Assurance</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">Valide jusqu'au 15/01/2024</span>
                        <Badge className="ml-2 bg-green-500 text-[10px] py-0 px-2">Active</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Qualifications</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] border-primary text-primary">RGE</Badge>
                        <Badge variant="outline" className="text-[10px] border-primary text-primary">Qualibat</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex justify-center">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Modifier les informations
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Nouvelle carte: Progression de l'onboarding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Progression d&apos;onboarding
          </CardTitle>
          <CardDescription>
            Suivi du processus d&apos;inscription et de validation de l&apos;artisan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progression totale</span>
              <span className="text-sm font-medium">{artisan?.onboarding?.progress || 0}%</span>
            </div>
            <Progress value={artisan?.onboarding?.progress || 0} className="h-2" />
          </div>
          
          <div className="space-y-4">
            {artisan?.onboarding?.steps.map((step, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  )}
                  <span className="text-sm">{step.name}</span>
                </div>
                <Badge variant={step.completed ? "default" : "outline"} className={step.completed ? "bg-green-500" : ""}>
                  {step.completed ? "Complété" : "En attente"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <CheckSquare className="mr-2 h-4 w-4" />
            Gérer les étapes d&apos;onboarding
          </Button>
        </CardFooter>
      </Card>

      {/* Statistiques de l'artisan */}
      <div>
        <h2 className="text-xl font-bold mb-4">Statistiques</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Projets terminés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {artisan?.projectsCompleted || 0}
                <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
              </div>
              <Progress 
                value={Math.min((artisan?.projectsCompleted || 0) * 10, 100)} 
                className="h-2 mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {artisan?.projectsCompleted || 0} projets terminés avec succès
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Projets en cours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {artisan?.currentProjects || 0}
                <Clock className="ml-2 h-5 w-5 text-blue-500" />
              </div>
              <Progress 
                value={Math.min((artisan?.currentProjects || 0) * 33, 100)} 
                className="h-2 mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {artisan?.currentProjects || 0} projets actuellement en cours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Chiffre d&apos;affaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center">
                {artisan?.totalEarnings}
                <CircleDollarSign className="ml-2 h-5 w-5 text-green-500" />
              </div>
              <Progress 
                value={70} 
                className="h-2 mt-2" 
              />
              <p className="text-xs text-muted-foreground mt-2">
                +15% par rapport à la période précédente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs pour les différentes sections */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="projects" className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>Projets</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            <span>Historique</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projets de l&apos;artisan</CardTitle>
              <CardDescription>
                Liste des projets en cours et terminés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projet</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Aucun projet trouvé pour cet artisan
                        </TableCell>
                      </TableRow>
                    ) : (
                      projects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>{project.clientName}</TableCell>
                          <TableCell>{project.startDate}</TableCell>
                          <TableCell>{project.amount}</TableCell>
                          <TableCell>{getProjectStatusBadge(project.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Voir tous les projets
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Documents administratifs</CardTitle>
                  <CardDescription>
                    Pièces justificatives et documents légaux
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => router.push("/admin/artisans")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la liste
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date d&apos;ajout</TableHead>
                      <TableHead>Expiration</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <FileText className="h-12 w-12 text-muted-foreground/40" />
                            <div className="text-center">
                              <p className="text-base font-medium">Aucun document disponible</p>
                              <p className="text-sm mt-1">Cet artisan n&apos;a pas encore téléchargé de documents.</p>
                            </div>
                            <div className="mt-2 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 text-sm px-4 py-2 rounded-md max-w-md text-center">
                              Les documents obligatoires (KBIS, attestation d&apos;assurance) doivent être téléchargés 
                              pendant le processus d&apos;onboarding de l&apos;artisan.
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center">
                            {getDocumentTypeInfo(doc.type).icon}
                            <span>{doc.name}</span>
                          </TableCell>
                          <TableCell>{getDocumentTypeInfo(doc.type).label}</TableCell>
                          <TableCell>{doc.uploadDate}</TableCell>
                          <TableCell>{doc.expiryDate || "N/A"}</TableCell>
                          <TableCell>{getDocumentStatusBadge(doc.status, doc.expiryDate)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDocumentDownload(doc)}
                              title={`Télécharger ${doc.name}`}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {documents.length > 0 ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadAllDocuments}
                    className="flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger tout
                  </Button>
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les documents
                  </Button>
                </>
              ) : (
                <div className="w-full">
                  <Button variant="outline" className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Gérer les documents
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des activités</CardTitle>
              <CardDescription>
                Journal des actions et modifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-muted pl-4 py-2">
                  <div className="text-sm font-medium">Mise à jour du profil</div>
                  <div className="text-xs text-muted-foreground">15/04/2023 à 14:30</div>
                  <div className="text-sm mt-1">L'artisan a mis à jour ses informations de contact</div>
                </div>
                <div className="border-l-2 border-muted pl-4 py-2">
                  <div className="text-sm font-medium">Nouveau projet</div>
                  <div className="text-xs text-muted-foreground">10/04/2023 à 09:15</div>
                  <div className="text-sm mt-1">Ajout du projet "Installation électrique"</div>
                </div>
                <div className="border-l-2 border-muted pl-4 py-2">
                  <div className="text-sm font-medium">Document expiré</div>
                  <div className="text-xs text-muted-foreground">05/04/2023 à 00:00</div>
                  <div className="text-sm mt-1">L'assurance professionnelle a expiré</div>
                </div>
                <div className="border-l-2 border-muted pl-4 py-2">
                  <div className="text-sm font-medium">Projet terminé</div>
                  <div className="text-xs text-muted-foreground">28/03/2023 à 17:45</div>
                  <div className="text-sm mt-1">Le projet "Rénovation salle de bain" a été marqué comme terminé</div>
                </div>
                <div className="border-l-2 border-muted pl-4 py-2">
                  <div className="text-sm font-medium">Nouvelle évaluation</div>
                  <div className="text-xs text-muted-foreground">28/03/2023 à 18:10</div>
                  <div className="text-sm mt-1">L'artisan a reçu une évaluation 5/5 pour le projet "Rénovation salle de bain"</div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Historique complet
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 