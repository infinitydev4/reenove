"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  ArtisanHeader,
  ArtisanProfileCard,
  ArtisanDetailsCard,
  OnboardingProgressCard,
  StatisticsCards,
  ArtisanTabs,
  ArtisanLoadingState,
  ArtisanErrorState
} from "@/components/admin/artisans/id"

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
    fetchArtisanData()
  }, [artisanId])

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
          toast.error("Impossible de récupérer les documents de l'artisan.")
        }
      } catch (docError) {
        console.error("Erreur lors de la récupération des documents:", docError)
        setDocuments([])
        toast.error("Une erreur s'est produite lors de la récupération des documents.")
      }
      
      setError(null)
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err)
      setError("Impossible de charger les données de l'artisan. Veuillez réessayer plus tard.")
    } finally {
      setIsLoading(false)
    }
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
      
      if (status === "VERIFIED") {
        toast.success("L'artisan a été vérifié avec succès.")
      } else if (status === "REJECTED") {
        toast.error("L'artisan a été rejeté.")
      } else {
        toast("L'artisan est en attente de vérification.")
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err)
      toast.error("Impossible de mettre à jour le statut de vérification.")
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
          toast.error("Ce document n'a pas de fichier associé pour le téléchargement.")
          return
        }
        
        const documentData = await response.json()
        if (!documentData.fileUrl) {
          toast.error("URL du document non disponible.")
          return
        }
        
        // Utiliser l'URL du document réel
        window.open(documentData.fileUrl, '_blank')
        
        toast.success(`Le document "${document.name}" est en cours de téléchargement.`)
        
        return
      }
      
      // Si le document a une URL S3 réelle
      if (document.fileUrl.includes('amazonaws.com')) {
        window.open(document.fileUrl, '_blank')
        
        toast.success(`Le document "${document.name}" est en cours de téléchargement.`)
        return
      }
      
      // Pour les documents fictifs locaux dans le dashboard (pour la démo)
      const link = window.document.createElement('a')
      link.href = document.fileUrl
      link.download = document.name
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
      
      toast.success(`Le document "${document.name}" est en cours de téléchargement.`)
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err)
      toast.error("Impossible de télécharger le document.")
    }
  }

  // Fonction pour télécharger tous les documents
  const handleDownloadAllDocuments = async () => {
    if (documents.length === 0) {
      toast.info("Aucun document à télécharger.")
      return
    }

    // Télécharger les documents un par un
    try {
      toast.info(`${documents.length} documents en cours de récupération...`)
      
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
        toast.success(`${downloadCount} document(s) en cours de téléchargement.`)
      } else {
        toast.error("Aucun document n'a pu être téléchargé.")
      }
    } catch (err) {
      console.error("Erreur lors du téléchargement des documents:", err)
      toast.error("Impossible de télécharger les documents.")
    }
  }

  if (isLoading) {
    return <ArtisanLoadingState />
  }

  if (error) {
    return <ArtisanErrorState message={error} onRetry={() => window.location.reload()} />
  }

  // Page de détails de l'artisan avec les nouveaux composants
  return (
    <div className="space-y-6">
      <ArtisanHeader artisanName={artisan?.name || ""} />

      {/* Informations principales */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ArtisanProfileCard 
          artisan={artisan as any} 
          onUpdateVerification={updateVerificationStatus}
          isUpdating={isUpdating}
        />
        
        <ArtisanDetailsCard artisan={artisan as any} />
      </div>

      {/* Progression d'onboarding */}
      <OnboardingProgressCard 
        progress={artisan?.onboarding?.progress || 0}
        steps={artisan?.onboarding?.steps || []}
      />

      {/* Statistiques */}
      <StatisticsCards 
        stats={{
          projectsCompleted: artisan?.projectsCompleted || 0,
          currentProjects: artisan?.currentProjects || 0,
          totalEarnings: artisan?.totalEarnings || "0€"
        }} 
      />

      {/* Onglets (Projets, Documents, Historique) */}
      <ArtisanTabs 
        artisanId={artisanId}
        projects={projects}
        documents={documents}
        onDocumentDownload={handleDocumentDownload}
        onDownloadAllDocuments={handleDownloadAllDocuments}
      />
    </div>
  )
} 