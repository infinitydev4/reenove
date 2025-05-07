"use client"

import { AssessmentLayout } from "./components/AssessmentLayout"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { OnboardingProgress, ONBOARDING_STEPS } from "../components/OnboardingProgress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

export default function ArtisanAssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

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
      
      // Récupérer l'état d'avancement de l'onboarding de l'artisan
      const fetchProgress = async () => {
        try {
          const response = await fetch("/api/artisan/onboarding/progress")
          if (response.ok) {
            const data = await response.json()
            
            // Transformer les données de progression en tableau d'étapes complétées
            const completed: string[] = []
            if (data.progress.profile) completed.push("profile")
            if (data.progress.specialties) completed.push("specialties")
            if (data.progress.documents) completed.push("documents")
            if (data.progress.assessment) completed.push("assessment")
            if (data.progress.confirmation) completed.push("confirmation")
            
            setCompletedSteps(completed)
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la progression:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchProgress()
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
        body: JSON.stringify({ score, answers })
      })
      
      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de l'évaluation")
      }
      
      toast({
        title: "Évaluation terminée",
        description: "Votre évaluation a été enregistrée avec succès."
      })
      
      // Rediriger vers la page de confirmation du processus d'onboarding
      router.push("/onboarding/artisan/confirmation")
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
  
  if (loading || status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Processus d&apos;inscription</CardTitle>
          <CardDescription>
            Votre progression dans le processus d&apos;inscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingProgress
            currentStep="assessment"
            completedSteps={completedSteps}
          />
        </CardContent>
      </Card>
      
      <Separator className="my-8" />
      
      <AssessmentLayout onComplete={handleComplete} isSubmitting={isSubmitting} />
    </div>
  )
} 