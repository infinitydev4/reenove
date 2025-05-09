"use client"

import { useState, useCallback } from "react"
import { Upload, X, FileText, File, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

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

  const processFile = async (file: File) => {
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': []
    },
    maxFiles: 1,
    multiple: false
  });

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

  const getIconByFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    if (ext === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
    } else if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
      return <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
    }
    
    return <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
  }

  return (
    <div className={cn(
      "rounded-lg transition-all duration-200",
      existingDocument ? "border p-3" : "border-dashed border-2",
      isDragActive && !existingDocument && !uploading ? "border-primary bg-primary/5" : "border-muted-foreground/20"
    )}>
      {uploading ? (
        <div className="space-y-2 p-2">
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
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-2 max-w-[70%]">
              {getIconByFileType(existingDocument.name)}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{existingDocument.name}</p>
                {renderStatus()}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDelete}
              className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-end">
            <a 
              href={existingDocument.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center"
            >
              <File className="h-3 w-3 mr-1" />
              Consulter le document
            </a>
          </div>
        </div>
      ) : (
        <div {...getRootProps()} className="cursor-pointer py-4 px-3">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragActive ? "Déposez votre fichier ici" : "Glissez-déposez un fichier ou cliquez"}
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPG ou PNG (max. 5 Mo)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 