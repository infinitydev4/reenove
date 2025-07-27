"use client"

import { useState, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Upload, 
  X, 
  Loader2, 
  Image as ImageIcon,
  Trash2
} from "lucide-react"
import Image from "next/image"

interface ImageUploaderProps {
  label?: string
  currentImageUrl?: string | null
  onImageUploaded: (imageUrl: string) => void
  onImageRemoved?: () => void
  endpoint: string // L'endpoint API à utiliser pour l'upload
  entityId?: string // ID de l'entité (service, etc.) pour l'upload
  acceptedTypes?: string[]
  maxSizeMB?: number
  disabled?: boolean
  className?: string
}

export default function ImageUploader({
  label = "Image",
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  endpoint,
  entityId = "",
  acceptedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxSizeMB = 5,
  disabled = false,
  className = ""
}: ImageUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Validation du fichier
  const validateFile = (file: File): string | null => {
    // Vérifier le type
    if (!acceptedTypes.includes(file.type)) {
      return `Type de fichier non supporté. Utilisez ${acceptedTypes.join(", ")}.`
    }

    // Vérifier la taille
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `Le fichier est trop volumineux. Taille maximum : ${maxSizeMB}MB.`
    }

    return null
  }

  // Upload du fichier
  const uploadFile = async (file: File) => {
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      if (entityId) {
        formData.append('serviceId', entityId)
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'upload')
      }

      const data = await response.json()
      
      toast({
        title: "Succès",
        description: "Image uploadée avec succès",
      })

      onImageUploaded(data.imageUrl)
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Supprimer l'image
  const removeImage = async () => {
    if (!currentImageUrl || !onImageRemoved) return

    setIsRemoving(true)
    
    try {
      const url = new URL(endpoint)
      if (entityId) {
        url.searchParams.set('serviceId', entityId)
      }

      const response = await fetch(url.toString(), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      toast({
        title: "Succès",
        description: "Image supprimée avec succès",
      })

      onImageRemoved()
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setIsRemoving(false)
    }
  }

  // Gestion de la sélection de fichier
  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast({
        variant: "destructive",
        title: "Fichier invalide",
        description: error,
      })
      return
    }
    
    uploadFile(file)
  }

  // Gestion du clic sur le bouton
  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Gestion du changement de fichier
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset l'input pour permettre de sélectionner le même fichier
    event.target.value = ''
  }

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-white">{label}</Label>
      
      <div className="space-y-4">
        {/* Aperçu de l'image actuelle */}
        {currentImageUrl && (
          <Card className="bg-white/5 border-[#FCDA89]/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                  <Image
                    src={currentImageUrl}
                    alt="Image du service"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="text-sm text-white/70">Image actuelle</div>
                  <div className="text-xs text-white/50 truncate max-w-xs">
                    {currentImageUrl}
                  </div>
                </div>

                {onImageRemoved && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    disabled={isRemoving || disabled}
                    className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                  >
                    {isRemoving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Zone d'upload */}
        <Card 
          className={`bg-white/5 border-2 border-dashed transition-colors cursor-pointer ${
            dragOver 
              ? 'border-[#FCDA89] bg-[#FCDA89]/10' 
              : 'border-[#FCDA89]/20 hover:border-[#FCDA89]/40'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={disabled ? undefined : handleButtonClick}
        >
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-[#FCDA89] animate-spin" />
                  <div>
                    <div className="text-white font-medium">Upload en cours...</div>
                    <div className="text-sm text-white/70">Veuillez patienter</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-12 w-12 rounded-full bg-[#FCDA89]/10 flex items-center justify-center">
                    {currentImageUrl ? (
                      <Upload className="h-6 w-6 text-[#FCDA89]" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-[#FCDA89]" />
                    )}
                  </div>
                  
                  <div>
                    <div className="text-white font-medium">
                      {currentImageUrl ? 'Remplacer l\'image' : 'Ajouter une image'}
                    </div>
                    <div className="text-sm text-white/70">
                      Glissez-déposez ou cliquez pour sélectionner
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()} • Max {maxSizeMB}MB
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input file caché */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  )
} 