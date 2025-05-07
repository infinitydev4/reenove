import { useState, useEffect } from 'react'
import { Trash2, Upload, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/toast-handler'

interface UploadFormProps {
  maxFiles?: number
  onUploadComplete?: (urls: string[]) => void
}

export function UploadForm({ maxFiles = 6, onUploadComplete }: UploadFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Notifier le composant parent quand les URLs changent
    if (onUploadComplete && uploadedUrls.length > 0) {
      onUploadComplete(uploadedUrls);
    }
  }, [uploadedUrls, onUploadComplete]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const newFiles = Array.from(e.target.files)
    const totalFiles = [...files, ...newFiles]
    
    // Limiter le nombre de fichiers
    if (totalFiles.length > maxFiles) {
      toast({
        title: "Limite de fichiers atteinte",
        description: `Vous ne pouvez pas télécharger plus de ${maxFiles} photos.`,
        variant: "destructive"
      })
      return
    }
    
    // Vérifier les types de fichiers
    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('image/jpeg') || file.type.startsWith('image/png') || file.type.startsWith('image/jpg')
      if (!isValid) {
        toast({
          title: "Format non supporté",
          description: `Le fichier ${file.name} n'est pas au format JPG ou PNG.`,
          variant: "destructive"
        })
      }
      return isValid
    })
    
    // Vérifier la taille des fichiers (max 5MB)
    const sizeValidFiles = validFiles.filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024
      if (!isValidSize) {
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier ${file.name} dépasse la limite de 5Mo.`,
          variant: "destructive"
        })
      }
      return isValidSize
    })
    
    if (sizeValidFiles.length === 0) return
    
    // Créer des URLs pour les aperçus
    const newPreviews = sizeValidFiles.map(file => URL.createObjectURL(file))
    const newFilesArray = [...files, ...sizeValidFiles]
    
    setFiles(newFilesArray)
    setPreviews([...previews, ...newPreviews])
    
    // Démarrer l'upload immédiatement
    await uploadFiles(sizeValidFiles)
  }
  
  const uploadFiles = async (filesToUpload: File[]) => {
    setIsUploading(true)
    
    const newProgress = { ...uploadProgress }
    const newErrors = { ...uploadErrors }
    const newUploadedUrls = [...uploadedUrls]
    
    for (const file of filesToUpload) {
      const fileId = crypto.randomUUID()
      newProgress[fileId] = 0
      
      try {
        // Créer le FormData pour l'upload
        const formData = new FormData()
        formData.append('file', file)
        
        // Simuler la progression pour l'interface utilisateur
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: prev[fileId] < 90 ? prev[fileId] + 10 : prev[fileId]
          }))
        }, 300)
        
        // Faire l'appel API pour télécharger le fichier
        const response = await fetch('/api/project/upload', {
          method: 'POST',
          body: formData
        })
        
        clearInterval(progressInterval)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors du téléchargement')
        }
        
        const data = await response.json()
        
        // Mettre à jour les états avec les informations d'upload
        newProgress[fileId] = 100
        newUploadedUrls.push(data.url)
        
        toast({
          title: "Image téléchargée",
          description: "Votre image a été téléchargée avec succès.",
        })
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
        newErrors[fileId] = (error as Error).message || 'Erreur lors du téléchargement'
        
        toast({
          title: "Erreur de téléchargement",
          description: (error as Error).message || "Une erreur s'est produite lors du téléchargement de l'image.",
          variant: "destructive"
        })
      }
    }
    
    setUploadProgress(newProgress)
    setUploadErrors(newErrors)
    setUploadedUrls(newUploadedUrls)
    setIsUploading(false)
  }
  
  const removeFile = (index: number) => {
    // Révoquer l'URL de l'aperçu pour éviter les fuites de mémoire
    URL.revokeObjectURL(previews[index])
    
    // Supprimer le fichier des états
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
    
    // Si une URL a été téléchargée pour ce fichier, la supprimer aussi
    if (index < uploadedUrls.length) {
      setUploadedUrls(uploadedUrls.filter((_, i) => i !== index))
    }
    
    toast({
      title: "Image supprimée",
      description: "L'image a été supprimée de votre projet."
    })
  }
  
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
              <Image 
                src={preview} 
                alt={`Photo ${index + 1}`} 
                fill 
                className="object-cover"
              />
              
              {/* Indicateur de statut de téléchargement */}
              {index >= uploadedUrls.length ? (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-4">
                  <Loader2 className="h-8 w-8 text-white animate-spin mb-2" />
                  <p className="text-white text-sm text-center">Téléchargement...</p>
                  <Progress 
                    value={Object.values(uploadProgress)[index] || 0} 
                    className="h-1 w-3/4 mt-2 bg-white/20" 
                  />
                </div>
              ) : uploadErrors[index] ? (
                <div className="absolute inset-0 bg-red-500/60 flex flex-col items-center justify-center p-4">
                  <AlertCircle className="h-8 w-8 text-white mb-2" />
                  <p className="text-white text-xs text-center">{uploadErrors[index]}</p>
                </div>
              ) : (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
              
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 left-2 h-8 w-8"
                onClick={() => removeFile(index)}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {files.length < maxFiles && (
            <label className="relative flex flex-col items-center justify-center aspect-square cursor-pointer border-2 border-dashed rounded-md hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center p-4 text-center space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Déposer les photos ici</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou JPEG (max {maxFiles - files.length} photos)
                </p>
              </div>
              <input
                type="file"
                className="sr-only"
                accept="image/png, image/jpeg, image/jpg"
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>
        
        {isUploading && (
          <div className="flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <p className="text-sm">Téléchargement de vos images en cours...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 