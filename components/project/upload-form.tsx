import { useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface UploadFormProps {
  maxFiles?: number
}

export function UploadForm({ maxFiles = 6 }: UploadFormProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    
    const newFiles = Array.from(e.target.files)
    const totalFiles = [...files, ...newFiles]
    
    // Limiter le nombre de fichiers
    if (totalFiles.length > maxFiles) {
      alert(`Vous ne pouvez pas télécharger plus de ${maxFiles} photos.`)
      return
    }
    
    // Créer des URLs pour les aperçus
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    
    setFiles(prev => [...prev, ...newFiles])
    setPreviews(prev => [...prev, ...newPreviews])
  }
  
  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index])
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
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
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => removeFile(index)}
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
                accept="image/png, image/jpeg"
                multiple
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 