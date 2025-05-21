"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
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

  useEffect(() => {
    // Nettoyer le stockage avant de commencer un nouveau projet
    cleanProjectStorage()
    
    // Rediriger directement vers la page de catégorie (sans vérification d'authentification)
    router.push("/create-project/category")
  }, [router])

  // Afficher un indicateur de chargement pendant la redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E261C]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#FCDA89] mb-4" />
        <p className="text-white">Préparation de votre projet...</p>
      </div>
    </div>
  )
} 