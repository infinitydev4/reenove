"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, Home, Search, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function SuccessPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [projectTitle, setProjectTitle] = useState<string | null>(null)
  
  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
    // Récupérer le titre du projet depuis le localStorage
    try {
      const projectDetails = localStorage.getItem("projectDetails")
      if (projectDetails) {
        const details = JSON.parse(projectDetails)
        setProjectTitle(details.title)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error)
    }
    
    // Nettoyage complet du localStorage et sessionStorage
    const cleanupStorage = () => {
      try {
        // Liste des clés à supprimer spécifiquement du localStorage
        const localStorageKeys = [
          "selectedCategory",
          "projectDetails",
          "projectLocation",
          "projectBudget",
          "projectDate",
          "projectSchedule",
          "projectPhotos"
        ]
        
        // Supprimer les clés spécifiques du localStorage
        localStorageKeys.forEach(key => {
          localStorage.removeItem(key)
        })
        
        // Nettoyer le sessionStorage des images du projet
        const sessionKeys = Object.keys(sessionStorage)
        sessionKeys.forEach(key => {
          // Supprimer toutes les entrées liées aux images du projet
          if (key.startsWith('projectImage_')) {
            sessionStorage.removeItem(key)
          }
        })
        
        console.log("Nettoyage du stockage terminé avec succès")
      } catch (error) {
        console.error("Erreur lors du nettoyage du stockage:", error)
      }
    }
    
    // Exécuter le nettoyage immédiatement
    cleanupStorage()
    
    return () => {
      // Nettoyage supplémentaire si nécessaire lors du démontage du composant
    }
  }, [])
  
  return (
    <div className={`max-w-3xl mx-auto space-y-3 md:space-y-6 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="flex flex-col items-center text-center space-y-2 md:space-y-4 py-3 md:py-6">
        <div className="h-14 w-14 md:h-20 md:w-20 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-7 w-7 md:h-10 md:w-10 text-green-600" />
        </div>
        <h1 className="text-xl md:text-3xl font-bold">Projet soumis avec succès !</h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-xl">
          {projectTitle ? (
            <>Votre projet <span className="font-medium text-foreground">&quot;{projectTitle}&quot;</span> a été enregistré et sera bientôt examiné.</>
          ) : (
            <>Votre projet a été enregistré et sera bientôt examiné par des artisans.</>
          )}
        </p>
      </div>
      
      <Card className="border-green-100">
        <CardContent className="p-3 md:p-6">
          <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-4">Que se passe-t-il maintenant ?</h2>
          
          <div className="space-y-3 md:space-y-5">
            <div className="flex gap-2 md:gap-4">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium">Examen du projet</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Notre équipe vérifiera votre projet sous 24h pour s&apos;assurer que tout est en ordre.
                </p>
              </div>
            </div>
            
            <Separator className="my-1 md:my-2" />
            
            <div className="flex gap-2 md:gap-4">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium">Recherche d&apos;artisans</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Des artisans qualifiés dans votre région recevront votre demande.
                </p>
              </div>
            </div>
            
            <Separator className="my-1 md:my-2" />
            
            <div className="flex gap-2 md:gap-4">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Home className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium">Démarrage des travaux</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Après avoir choisi un artisan, planifiez le démarrage selon vos disponibilités.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-3 md:gap-4 pt-2 md:pt-4">
        <Button variant="outline" size="lg" className="text-xs md:text-sm h-10 md:h-12" asChild>
          <Link href="/client/projets">
            Voir mes projets
          </Link>
        </Button>
        <Button size="lg" className="text-xs md:text-sm h-10 md:h-12" asChild>
          <Link href="/">
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
      
      <div className="text-center text-xs md:text-sm text-muted-foreground pt-2 md:pt-6 pb-4 md:pb-10">
        <p>Vous recevrez un email récapitulatif avec les détails de votre projet.</p>
        <p className="mt-1">
          Besoin d&apos;aide ? <Link href="/contact" className="text-primary hover:underline">Contactez notre support</Link>
        </p>
      </div>
    </div>
  )
} 