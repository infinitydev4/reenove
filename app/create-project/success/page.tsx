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
    
    // Nettoyage des données du localStorage après soumission réussie
    const cleanupStorage = setTimeout(() => {
      localStorage.removeItem("selectedCategory")
      localStorage.removeItem("projectDetails")
      localStorage.removeItem("projectLocation")
      localStorage.removeItem("projectSchedule")
      localStorage.removeItem("projectPhotos")
    }, 2000)
    
    return () => clearTimeout(cleanupStorage)
  }, [])
  
  return (
    <div className={`max-w-3xl mx-auto space-y-8 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
      <div className="flex flex-col items-center text-center space-y-4 py-8">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Projet soumis avec succès !</h1>
        <p className="text-muted-foreground max-w-xl">
          {projectTitle ? (
            <>Votre projet <span className="font-medium text-foreground">"{projectTitle}"</span> a été enregistré et sera bientôt examiné par des artisans qualifiés.</>
          ) : (
            <>Votre projet a été enregistré et sera bientôt examiné par des artisans qualifiés.</>
          )}
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Que se passe-t-il maintenant ?</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Examen du projet</h3>
                <p className="text-muted-foreground">
                  Notre équipe va vérifier les détails de votre projet dans les 24 heures pour s'assurer que tout est en ordre.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Recherche d'artisans</h3>
                <p className="text-muted-foreground">
                  Des artisans qualifiés dans votre région recevront votre demande et pourront vous proposer leurs services.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Démarrage des travaux</h3>
                <p className="text-muted-foreground">
                  Une fois que vous aurez choisi un artisan, vous pourrez planifier le démarrage des travaux selon vos disponibilités.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-4 pt-4">
        <Button variant="outline" asChild>
          <Link href="/client/projets">
            Voir mes projets
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            Retour à l'accueil
          </Link>
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground pt-6 pb-10">
        <p>Vous recevrez également un email récapitulatif avec les détails de votre projet.</p>
        <p className="mt-1">
          Besoin d'aide ? <Link href="/contact" className="text-primary hover:underline">Contactez notre support</Link>
        </p>
      </div>
    </div>
  )
} 