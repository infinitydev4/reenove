"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ProjectImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  placeholder?: string
  onError?: () => void
}

// Fonction pour récupérer les vraies URLs depuis les références sessionStorage
const getImageFromSessionStorage = (imageUrl: string): string => {
  if (!imageUrl) {
    return '/placeholder-project.png'
  }
  
  if (imageUrl.startsWith('session:')) {
    const key = imageUrl.replace('session:', '')
    try {
      const sessionImage = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null
      if (sessionImage) {
        console.log("✅ Image récupérée depuis sessionStorage")
        return sessionImage
      } else {
        console.warn("⚠️ Image non trouvée dans sessionStorage:", key)
        return '/placeholder-project.png'
      }
    } catch (error) {
      console.error("❌ Erreur sessionStorage:", error)
      return '/placeholder-project.png'
    }
  }
  
  // Si l'URL ne commence pas par session:, on la retourne directement
  return imageUrl
}

export function ProjectImage({ 
  src, 
  alt, 
  className, 
  width, 
  height, 
  fill = false, 
  sizes, 
  priority = false, 
  placeholder = '/placeholder-project.png',
  onError,
  ...props 
}: ProjectImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const resolvedSrc = getImageFromSessionStorage(src)
    setImageSrc(resolvedSrc)
    setImageError(false)
  }, [src])

  const handleError = () => {
    console.warn("Erreur de chargement de l'image:", imageSrc)
    setImageError(true)
    setImageSrc(placeholder)
    onError?.()
  }

  if (fill) {
    return (
      <Image
        src={imageError ? placeholder : imageSrc}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        {...props}
      />
    )
  }

  return (
    <Image
      src={imageError ? placeholder : imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={cn("object-cover", className)}
      sizes={sizes}
      priority={priority}
      onError={handleError}
      {...props}
    />
  )
}

// Version pour les images régulières (non Next.js Image)
export function ProjectImg({ 
  src, 
  alt, 
  className, 
  placeholder = '/placeholder-project.png',
  onError,
  ...props 
}: Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string
  alt: string
  placeholder?: string
  onError?: () => void
}) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const resolvedSrc = getImageFromSessionStorage(src)
    setImageSrc(resolvedSrc)
    setImageError(false)
  }, [src])

  const handleError = () => {
    console.warn("Erreur de chargement de l'image:", imageSrc)
    setImageError(true)
    setImageSrc(placeholder)
    onError?.()
  }

  return (
    <img
      src={imageError ? placeholder : imageSrc}
      alt={alt}
      className={cn("object-cover", className)}
      onError={handleError}
      {...props}
    />
  )
} 