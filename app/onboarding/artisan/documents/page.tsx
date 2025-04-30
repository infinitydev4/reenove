"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FileText, Loader2, Upload, AlertCircle, CheckCircle, X, File } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

// Types de documents requis
const REQUIRED_DOCUMENTS = [
  {
    id: "kbis",
    title: "KBIS",
    description: "Document officiel attestant de l'existence juridique de votre entreprise",
    acceptedFormats: ".pdf, .jpg, .jpeg, .png",
    required: true,
  },
  {
    id: "insurance",
    title: "Assurance professionnelle",
    description: "Attestation d'assurance décennale ou responsabilité civile professionnelle",
    acceptedFormats: ".pdf, .jpg, .jpeg, .png",
    required: true,
  },
  {
    id: "qualification",
    title: "Certifications et qualifications",
    description: "RGE, Qualibat, ou autres certifications professionnelles (optionnel)",
    acceptedFormats: ".pdf, .jpg, .jpeg, .png",
    required: false,
  },
  {
    id: "id",
    title: "Pièce d'identité",
    description: "Carte d'identité ou passeport du gérant",
    acceptedFormats: ".pdf, .jpg, .jpeg, .png",
    required: true,
  }
]

type Document = {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  verified: boolean;
}

export default function ArtisanDocumentsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [hasLoadedDocuments, setHasLoadedDocuments] = useState(false)

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan/documents")
      return
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "ARTISAN") {
        router.push("/")
        toast({
          title: "Accès refusé",
          description: "Cette section est réservée aux artisans.",
          variant: "destructive"
        })
        return
      }

      // Éviter de charger les documents plusieurs fois
      if (hasLoadedDocuments) return

      // Charger les documents déjà téléchargés
      const fetchDocuments = async () => {
        try {
          setIsLoading(true)
          const response = await fetch("/api/artisan/documents")
          if (response.ok) {
            const data = await response.json()
            setDocuments(data)
            setHasLoadedDocuments(true)
          }
        } catch (error) {
          console.error("Erreur lors du chargement des documents:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchDocuments()
    }
  }, [status, router, toast, session?.user, hasLoadedDocuments])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const documentConfig = REQUIRED_DOCUMENTS.find(doc => doc.id === documentType)
    if (!documentConfig) return;

    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const acceptedExtensions = documentConfig.acceptedFormats
      .split(', ')
      .map(format => format.replace('.', ''))
    
    if (fileExtension && !acceptedExtensions.includes(fileExtension)) {
      toast({
        title: "Format de fichier non supporté",
        description: `Formats acceptés: ${documentConfig.acceptedFormats}`,
        variant: "destructive"
      })
      return
    }

    // Limiter la taille des fichiers à 5 Mo
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille du fichier ne doit pas dépasser 5 Mo",
        variant: "destructive"
      })
      return
    }

    try {
      setUploading(documentType)
      setUploadProgress({ ...uploadProgress, [documentType]: 0 })
      
      // Créer le FormData pour l'upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', documentType)
      formData.append('title', documentConfig.title)

      // Simuler la progression de l'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[documentType] || 0
          if (currentProgress < 90) {
            return { ...prev, [documentType]: currentProgress + 10 }
          }
          return prev
        })
      }, 300)

      const response = await fetch('/api/artisan/documents/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload du document")
      }

      setUploadProgress({ ...uploadProgress, [documentType]: 100 })
      
      const result = await response.json()
      
      // Mettre à jour la liste des documents
      setDocuments(prev => {
        // Supprimer l'ancien document du même type s'il existe
        const filtered = prev.filter(doc => doc.id !== documentType)
        return [...filtered, {
          id: documentType,
          title: documentConfig.title,
          fileUrl: result.fileUrl,
          fileType: file.type,
          verified: false
        }]
      })

      toast({
        title: "Document téléchargé",
        description: `${documentConfig.title} a été téléchargé avec succès.`,
      })
    } catch (error) {
      console.error("Erreur lors de l'upload:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du téléchargement du document.",
        variant: "destructive"
      })
    } finally {
      // Attendre un peu avant de réinitialiser pour que l'utilisateur puisse voir la progression à 100%
      setTimeout(() => {
        setUploading(null)
        setUploadProgress({ ...uploadProgress, [documentType]: 0 })
      }, 1000)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/artisan/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du document")
      }

      // Mettre à jour la liste des documents
      setDocuments(prev => prev.filter(doc => doc.id !== documentId))

      toast({
        title: "Document supprimé",
        description: "Le document a été supprimé avec succès.",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du document.",
        variant: "destructive"
      })
    }
  }

  const handleContinue = async () => {
    // Vérifier que tous les documents requis sont téléchargés
    const requiredDocumentTypes = REQUIRED_DOCUMENTS.filter(doc => doc.required).map(doc => doc.id)
    const uploadedRequiredDocuments = documents.filter(doc => requiredDocumentTypes.includes(doc.id))
    
    if (uploadedRequiredDocuments.length < requiredDocumentTypes.length) {
      toast({
        title: "Documents manquants",
        description: "Veuillez télécharger tous les documents obligatoires avant de continuer.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      
      // Ici, on pourrait envoyer une requête pour mettre à jour l'état de progression de l'artisan
      // Mais comme les documents sont déjà enregistrés, on peut passer directement à l'étape suivante
      
      // Passer à l'étape suivante
      router.push("/onboarding/artisan/assessment")
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getDocumentStatus = (documentType: string) => {
    const document = documents.find(doc => doc.id === documentType)
    if (!document) {
      return (
        <span className="text-yellow-500 dark:text-yellow-400 flex items-center text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          Non téléchargé
        </span>
      )
    }

    if (document.verified) {
      return (
        <span className="text-green-500 dark:text-green-400 flex items-center text-sm">
          <CheckCircle className="h-4 w-4 mr-1" />
          Vérifié
        </span>
      )
    }

    return (
      <span className="text-blue-500 dark:text-blue-400 flex items-center text-sm">
        <File className="h-4 w-4 mr-1" />
        En attente de vérification
      </span>
    )
  }

  // Vérifier si tous les documents requis sont téléchargés
  const requiredDocumentTypes = REQUIRED_DOCUMENTS.filter(doc => doc.required).map(doc => doc.id)
  const hasAllRequiredDocuments = requiredDocumentTypes.every(type => 
    documents.some(doc => doc.id === type)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de vos documents...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Documents professionnels</h1>
          <p className="text-muted-foreground max-w-md">
            Téléchargez les documents nécessaires pour vérifier votre activité professionnelle et rassurer vos futurs clients.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Documents obligatoires</CardTitle>
            <CardDescription>
              Ces documents sont nécessaires pour valider votre profil d&apos;artisan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {REQUIRED_DOCUMENTS.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formats acceptés: {doc.acceptedFormats}
                      {doc.required && " • Obligatoire"}
                    </p>
                  </div>
                  <div>
                    {getDocumentStatus(doc.id)}
                  </div>
                </div>

                {uploading === doc.id ? (
                  <div className="space-y-2">
                    <Progress value={uploadProgress[doc.id] || 0} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Upload en cours...</span>
                      <span>{uploadProgress[doc.id] || 0}%</span>
                    </div>
                  </div>
                ) : documents.some(d => d.id === doc.id) ? (
                  <div className="flex justify-between items-center">
                    <span className="text-sm truncate max-w-xs">
                      Document téléchargé
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id={`file-${doc.id}`}
                      className="hidden"
                      accept={doc.acceptedFormats}
                      onChange={(e) => handleFileChange(e, doc.id)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4 px-6">
            <Button
              variant="outline"
              onClick={() => router.push("/onboarding/artisan/specialties")}
            >
              Retour
            </Button>
            <Button 
              onClick={handleContinue} 
              disabled={isSaving || !hasAllRequiredDocuments}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Continuer"
              )}
            </Button>
          </CardFooter>
        </Card>

        {!hasAllRequiredDocuments && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300">Documents manquants</h4>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Veuillez télécharger tous les documents obligatoires avant de continuer.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 