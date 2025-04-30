"use client"

import { AssessmentLayout } from "./components/AssessmentLayout"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function ArtisanAssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan/assessment")
      return
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "ARTISAN") {
        router.push("/")
        toast({
          title: "Accès refusé",
          description: "Cette section est réservée aux artisans.",
          variant: "destructive"
        })
        return
      }
    }
  }, [status, router, toast, session?.user])
  
  const handleComplete = async (answers?: Record<string, any>) => {
    try {
      setIsSubmitting(true)
      
      // Calculer un score moyen si des réponses sont fournies
      let score: number | undefined = undefined
      if (answers && Object.keys(answers).length > 0) {
        // Exemple simple: un score entre 0 et 100 basé sur le nombre de réponses
        const answerCount = Object.keys(answers).length
        score = Math.min(Math.round(answerCount * 10), 100)
      }
      
      // Mettre à jour le statut d'évaluation dans la base de données
      const response = await fetch("/api/artisan/assessment/complete", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score })
      })
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de l'évaluation")
      }
      
      toast({
        title: "Évaluation terminée",
        description: "Votre évaluation a été enregistrée avec succès."
      })
      
      // Rediriger vers le tableau de bord artisan
      router.push("/artisan")
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre évaluation."
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  }
  
  return <AssessmentLayout onComplete={handleComplete} isSubmitting={isSubmitting} />
} 