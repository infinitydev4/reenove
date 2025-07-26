"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, X, Loader2, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDropzone } from "react-dropzone"

interface PhotoUploadProps {
  onPhotosUploaded: (photoUrls: string[]) => void
  maxPhotos?: number
  initialPhotos?: string[]
  onContinue?: (photoUrls: string[]) => void
}

export default function PhotoUpload({ onPhotosUploaded, maxPhotos = 5, initialPhotos = [], onContinue }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Synchroniser avec les photos initiales
  useEffect(() => {
    setPhotos(initialPhotos)
  }, [initialPhotos])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return
    
    // Vérifier si l'utilisateur dépasse le nombre maximum de photos
    if (photos.length + acceptedFiles.length > maxPhotos) {
      setError(`Vous pouvez uploader un maximum de ${maxPhotos} photos`)
      return
    }

    setUploading(true)
    setError(null)

    const uploadedUrls: string[] = []
    const failedUploads: string[] = []

    // Simuler une progression d'upload
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 200)

    // Créer un FormData pour chaque fichier et l'envoyer au serveur
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i]
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        failedUploads.push(`${file.name} (taille maximale dépassée)`)
        continue
      }
      
      // Vérifier le type de fichier
      if (!file.type.startsWith("image/")) {
        failedUploads.push(`${file.name} (format non supporté)`)
        continue
      }
      
      const formData = new FormData()
      formData.append("file", file)
      
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
        
        if (response.ok) {
          const data = await response.json()
          // Gestion flexible du nom de la propriété (fileUrl ou url)
          const imageUrl = data.fileUrl || data.url || ""
          if (imageUrl) {
            uploadedUrls.push(imageUrl)
            console.log("URL de l'image uploadée:", imageUrl)
          } else {
            console.error("URL d'image manquante dans la réponse:", data)
            failedUploads.push(file.name)
          }
        } else {
          console.error("Erreur de réponse API:", await response.text())
          failedUploads.push(file.name)
        }
      } catch (error) {
        console.error("Erreur lors de l'upload:", error)
        failedUploads.push(file.name)
      }
    }
    
    clearInterval(progressInterval)
    setUploadProgress(100)
    
    setTimeout(() => {
      setUploadProgress(0)
      
      if (failedUploads.length > 0) {
        setError(`Échec de l'upload pour: ${failedUploads.join(", ")}`)
      }
      
      if (uploadedUrls.length > 0) {
        const newPhotos = [...photos, ...uploadedUrls]
        setPhotos(newPhotos)
        onPhotosUploaded(newPhotos)
      }
      
      setUploading(false)
    }, 500)
  }, [photos, maxPhotos, onPhotosUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    disabled: uploading || photos.length >= maxPhotos
  })

  const removePhoto = (index: number) => {
    const newPhotos = [...photos]
    newPhotos.splice(index, 1)
    setPhotos(newPhotos)
    onPhotosUploaded(newPhotos)
    
    // Ajuster le slide actuel si nécessaire
    if (currentSlide >= newPhotos.length && newPhotos.length > 0) {
      setCurrentSlide(newPhotos.length - 1)
    } else if (newPhotos.length === 0) {
      setCurrentSlide(0)
    }
  }

  const nextSlide = () => {
    if (photos.length > 1) {
      setCurrentSlide((prev) => (prev + 1) % photos.length)
    }
  }

  const prevSlide = () => {
    if (photos.length > 1) {
      setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 p-2 rounded-md border border-red-400/20">
          <p>{error}</p>
        </div>
      )}
      
      {/* Zone de drag & drop compacte avec slider intégré */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg transition-colors duration-200
          ${isDragActive ? 'border-[#FCDA89]/80 bg-[#FCDA89]/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'}
          ${uploading || photos.length >= maxPhotos ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
          ${photos.length > 0 ? 'h-32' : 'h-24'}
        `}
      >
        <input {...getInputProps()} />
        
        {photos.length === 0 ? (
          // État vide - zone d'upload
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            {uploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-[#FCDA89] mb-2 animate-spin" />
                <p className="text-white text-sm font-medium">Upload en cours...</p>
                
                {/* Barre de progression */}
                <div className="w-32 mt-2 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#FCDA89] h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-black mb-2" />
                <p className="text-black text-sm font-medium mb-1">
                  {isDragActive ? "Déposez vos images ici" : "Glissez-déposez vos images"}
                </p>
                <p className="text-xs text-white/60">
                  ou cliquez pour sélectionner ({maxPhotos} max.)
                </p>
              </>
            )}
          </div>
        ) : (
          // État avec photos - slider horizontal
          <div className="h-full flex items-center justify-between p-2">
            {/* Bouton précédent */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  prevSlide()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}

            {/* Image centrale */}
            <div className="flex-1 flex items-center justify-center mx-8">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/15 bg-white/5 group">
                {photos[currentSlide]?.startsWith('data:') ? (
                  <div 
                    style={{
                      backgroundImage: `url(${photos[currentSlide]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ) : (
                  <Image
                    src={photos[currentSlide] || ''}
                    alt={`Photo ${currentSlide + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
                
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePhoto(currentSlide)
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Bouton suivant */}
            {photos.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  nextSlide()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-1 rounded-full transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {/* Indicateurs de pagination */}
            {photos.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentSlide(index)
                    }}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-[#FCDA89]' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Overlay d'information */}
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {photos.length}/{maxPhotos} photo{photos.length > 1 ? 's' : ''}
            </div>

            {/* Zone d'ajout si pas au maximum */}
            {photos.length < maxPhotos && !uploading && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                <div className="text-center">
                  <Upload className="h-6 w-6 text-white mx-auto mb-1" />
                  <p className="text-white text-xs">Ajouter plus</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bouton Continuer si des photos sont présentes */}
      {photos.length > 0 && onContinue && (
        <Button
          onClick={() => onContinue(photos)}
          className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-medium"
          disabled={uploading}
        >
          Continuer avec {photos.length} photo{photos.length > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
} 