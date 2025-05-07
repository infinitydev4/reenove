"use client"

import { useState } from "react"
import { Upload, X, FileText, File, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

type DocumentsUploaderProps = {
  documentType: string
  existingDocument?: { id: string; name: string; type: string; url: string }
  onUploadSuccess: (document: { id: string; name: string; type: string; url: string }) => void
  onDelete: (documentId: string) => void
}

export function DocumentsUploader({
  documentType,
  existingDocument,
  onUploadSuccess,
  onDelete
}: DocumentsUploaderProps) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | null>(
    existingDocument ? "pending" : null
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    const validTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format de fichier non supporté",
        description: "Veuillez télécharger un fichier PDF, JPG ou PNG",
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
      setUploading(true)
      setProgress(0)

      // Créer le FormData pour l'upload
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", documentType)

      // Simuler la progression de l'upload
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 10
          return prev
        })
      }, 300)

      // Appel API pour télécharger le document
      const response = await fetch("/api/artisan/documents/upload", {
        method: "POST",
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Erreur lors du téléchargement: ${response.statusText}`)
      }

      setProgress(100)

      const data = await response.json()
      
      // Notifier le composant parent du succès
      onUploadSuccess({
        id: data.id || crypto.randomUUID(),
        name: file.name,
        type: documentType,
        url: data.url || data.fileUrl
      })

      setVerificationStatus("pending")

      toast({
        title: "Document téléchargé",
        description: "Votre document a été téléchargé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du téléchargement du document",
        variant: "destructive"
      })
    } finally {
      // Attendre un peu avant de réinitialiser
      setTimeout(() => {
        setUploading(false)
        setProgress(0)
      }, 500)
    }
  }

  const handleDelete = async () => {
    if (!existingDocument) return

    try {
      const response = await fetch(`/api/artisan/documents/${existingDocument.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du document")
      }

      onDelete(existingDocument.id)
      setVerificationStatus(null)

      toast({
        title: "Document supprimé",
        description: "Votre document a été supprimé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression du document",
        variant: "destructive"
      })
    }
  }

  // Afficher l'état du document
  const renderStatus = () => {
    if (verificationStatus === "verified") {
      return (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>Vérifié</span>
        </div>
      )
    }

    if (verificationStatus === "pending") {
      return (
        <div className="flex items-center text-amber-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>En attente de vérification</span>
        </div>
      )
    }

    return null
  }

  return (
    <div className="border rounded-lg p-4">
      {uploading ? (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className="flex items-center">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Téléchargement en cours...
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      ) : existingDocument ? (
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="flex items-start space-x-2 max-w-[70%]">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{existingDocument.name}</p>
                {renderStatus()}
              </div>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Supprimer</span>
            </Button>
          </div>
          <div className="flex justify-end">
            <a 
              href={existingDocument.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline flex items-center"
            >
              <File className="h-3 w-3 mr-1" />
              Consulter le document
            </a>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id={`file-${documentType}`}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById(`file-${documentType}`)?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Télécharger un document
          </Button>
        </div>
      )}
    </div>
  )
} 