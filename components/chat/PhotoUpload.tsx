"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, Image as ImageIcon, X, Loader2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useDropzone } from "react-dropzone"

interface PhotoUploadProps {
  onPhotosUploaded: (photoUrls: string[]) => void
  maxPhotos?: number
}

export default function PhotoUpload({ onPhotosUploaded, maxPhotos = 5 }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">
          Photos de votre projet ({photos.length}/{maxPhotos})
        </p>
        
        <input 
          type="file" 
          accept="image/*" 
          multiple
          ref={fileInputRef} 
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) {
              onDrop(Array.from(e.target.files))
            }
          }}
          className="hidden" 
          disabled={uploading || photos.length >= maxPhotos} 
        />
      </div>
      
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-md border border-red-400/20">
          <p>{error}</p>
        </div>
      )}
      
      {/* Zone de drag & drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors duration-200
          flex flex-col items-center justify-center text-center
          ${isDragActive ? 'border-[#FCDA89]/80 bg-[#FCDA89]/10' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'}
          ${uploading || photos.length >= maxPhotos ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="py-4 flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-[#FCDA89] mb-3 animate-spin" />
            <p className="text-white font-medium">Upload en cours...</p>
            
            {/* Barre de progression */}
            <div className="w-full max-w-xs mt-3 bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-[#FCDA89] h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 text-white/40 mb-3" />
            <p className="text-white font-medium mb-1">
              {isDragActive ? "Déposez vos images ici" : "Glissez-déposez vos images ici"}
            </p>
            <p className="text-sm text-white/60 mb-3">
              ou cliquez pour sélectionner (5 Mo max. par fichier)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation()
                triggerFileInput()
              }}
              disabled={uploading || photos.length >= maxPhotos}
              className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Sélectionner des photos
            </Button>
          </>
        )}
      </div>
      
      {/* Grille des photos téléchargées */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-2">Images téléchargées</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => (
              <div 
                key={index} 
                className="group relative aspect-square rounded-lg overflow-hidden border border-white/15 bg-white/5"
              >
                {photo.startsWith('data:') ? (
                  // Affichage direct pour les images en base64
                  <div 
                    style={{
                      backgroundImage: `url(${photo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                ) : (
                  // Utilisation de Next Image pour les URLs normales
                  <Image
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Supprimer cette image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 