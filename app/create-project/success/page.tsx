"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Check, Home, Search, Clock, UserPlus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function SuccessPage() {
  const { data: session, status } = useSession()
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
        <div className="h-14 w-14 md:h-20 md:w-20 bg-[#FCDA89]/20 rounded-full flex items-center justify-center">
          <Check className="h-7 w-7 md:h-10 md:w-10 text-[#FCDA89]" />
        </div>
        <h1 className="text-xl md:text-3xl font-bold text-white">Projet soumis avec succès !</h1>
        <p className="text-white/70 text-sm md:text-base max-w-xl">
          {projectTitle ? (
            <>Votre projet <span className="font-medium text-[#FCDA89]">&quot;{projectTitle}&quot;</span> a été enregistré et sera bientôt examiné.</>
          ) : (
            <>Votre projet a été enregistré et sera bientôt examiné par des artisans.</>
          )}
        </p>
      </div>
      
      {/* Si l'utilisateur n'est pas connecté, afficher le message de création de compte */}
      {status !== "authenticated" && (
        <Card className="border-[#FCDA89]/30 bg-[#0E261C]/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex gap-3 md:gap-4 items-start">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-[#FCDA89]/20 rounded-full flex items-center justify-center">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-[#FCDA89]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium text-white">Créez un compte pour suivre votre projet</h3>
                <p className="text-xs md:text-sm text-white/70 mb-3 md:mb-4">
                  Pour recevoir des devis d'artisans et suivre l'avancement de votre projet, créez un compte gratuitement.
                </p>
                <Button 
                  size="sm" 
                  className="w-full sm:w-auto bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C]"
                  asChild
                >
                  <Link href="/register/role">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer un compte
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
        <CardContent className="p-3 md:p-6">
          <h2 className="text-base md:text-xl font-semibold mb-2 md:mb-4 text-white">Que se passe-t-il maintenant ?</h2>
          
          <div className="space-y-3 md:space-y-5">
            <div className="flex gap-2 md:gap-4">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-[#FCDA89]/20 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-[#FCDA89]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium text-white">Examen du projet</h3>
                <p className="text-xs md:text-sm text-white/70">
                  Notre équipe vérifiera votre projet sous 24h pour s&apos;assurer que tout est en ordre.
                </p>
              </div>
            </div>
            
            <Separator className="my-1 md:my-2 bg-white/10" />
            
            <div className="flex gap-2 md:gap-4">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-[#FCDA89]/20 rounded-full flex items-center justify-center">
                <Search className="h-4 w-4 md:h-5 md:w-5 text-[#FCDA89]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium text-white">Recherche d&apos;artisans</h3>
                <p className="text-xs md:text-sm text-white/70">
                  Des artisans qualifiés dans votre région recevront votre demande.
                </p>
              </div>
            </div>
            
            <Separator className="my-1 md:my-2 bg-white/10" />
            
            <div className="flex gap-2 md:gap-4">
              <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10 bg-[#FCDA89]/20 rounded-full flex items-center justify-center">
                <Home className="h-4 w-4 md:h-5 md:w-5 text-[#FCDA89]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm md:text-base font-medium text-white">Démarrage des travaux</h3>
                <p className="text-xs md:text-sm text-white/70">
                  Après avoir choisi un artisan, planifiez le démarrage selon vos disponibilités.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-3 md:gap-4 pt-2 md:pt-4">
        {status === "authenticated" ? (
          <Button 
            variant="outline" 
            size="lg" 
            className="text-xs md:text-sm h-10 md:h-12 border-white/20 text-white hover:bg-white/10" 
            asChild
          >
            <Link href="/client/projets">
              Voir mes projets
            </Link>
          </Button>
        ) : null}
        <Button 
          size="lg" 
          className={cn(
            "text-xs md:text-sm h-10 md:h-12 bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C]",
            status !== "authenticated" && "flex-1"
          )} 
          asChild
        >
          <Link href="/">
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
      
      <div className="text-center text-xs md:text-sm text-white/60 pt-2 md:pt-6 pb-4 md:pb-10">
        <p>{status === "authenticated" ? "Vous recevrez un email récapitulatif avec les détails de votre projet." : "Créez un compte pour recevoir des notifications sur votre projet."}</p>
        <p className="mt-1">
          Besoin d&apos;aide ? <Link href="/contact" className="text-[#FCDA89] hover:underline">Contactez notre support</Link>
        </p>
      </div>
    </div>
  )
} 