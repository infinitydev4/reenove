"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ONBOARDING_STEPS } from "./components/OnboardingProgress"

export default function ArtisanOnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session) {
      const fetchProgress = async () => {
        try {
          const response = await fetch("/api/artisan/onboarding/progress", { 
            method: "GET",
            cache: 'no-store'
          })

          if (!response.ok) {
            throw new Error("Erreur lors de la récupération de la progression")
          }

          const data = await response.json()
          console.log("Données de progression:", data)
          
          // S'assurer que l'objet a la structure attendue
          const completedSteps = data.completedSteps || []

          // Déterminer vers quelle étape rediriger
          let nextStep = "/onboarding/artisan/profile" // Par défaut, rediriger vers le profil

          // Si l'étape de confirmation est complétée, rediriger vers le tableau de bord
          if (completedSteps.includes("confirmation")) {
            router.push("/artisan")
            return
          }

          // Trouver la première étape non complétée
          if (completedSteps.includes("profile")) {
            // Si le profil est complété, vérifier les spécialités
            if (!completedSteps.includes("specialties")) {
              nextStep = "/onboarding/artisan/specialties"
            } else if (!completedSteps.includes("documents")) {
              // Si les spécialités sont complétées, vérifier les documents
              nextStep = "/onboarding/artisan/documents"
            } else if (!completedSteps.includes("confirmation")) {
              // Si les documents sont complétés, passer à la confirmation
              nextStep = "/onboarding/artisan/confirmation"
            }
          }

          console.log("Redirection vers:", nextStep)
          router.push(nextStep)
        } catch (error) {
          console.error("Erreur:", error)
          toast({
            title: "Erreur",
            description: "Impossible de déterminer votre progression. Veuillez réessayer.",
            variant: "destructive",
          })
          // En cas d'erreur, rediriger vers la première étape
          router.push("/onboarding/artisan/profile")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProgress()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, session?.user?.id])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Chargement de votre compte...</h2>
        <p className="text-muted-foreground">Nous préparons votre espace artisan</p>
      </div>
    </div>
  )
} 