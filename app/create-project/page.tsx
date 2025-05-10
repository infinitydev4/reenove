"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

// Fonction utilitaire pour nettoyer le stockage
const cleanProjectStorage = () => {
  try {
    // Liste des clés à supprimer du localStorage
    const localStorageKeys = [
      "selectedCategory",
      "projectDetails",
      "projectLocation",
      "projectBudget",
      "projectDate",
      "projectSchedule",
      "projectPhotos"
    ]
    
    // Supprimer les données du localStorage
    localStorageKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Nettoyer les images du projet dans le sessionStorage
    const sessionKeys = Object.keys(sessionStorage)
    sessionKeys.forEach(key => {
      if (key.startsWith('projectImage_')) {
        sessionStorage.removeItem(key)
      }
    })
    
    console.log("Stockage nettoyé avec succès pour un nouveau projet")
  } catch (error) {
    console.error("Erreur lors du nettoyage du stockage:", error)
  }
}

export default function CreateProjectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    // Nettoyer le stockage avant de commencer un nouveau projet
    cleanProjectStorage()
    
    if (status === "unauthenticated") {
      router.push("/auth?callbackUrl=/create-project/category")
    } else if (status === "authenticated") {
      router.push("/create-project/category")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return null
} 