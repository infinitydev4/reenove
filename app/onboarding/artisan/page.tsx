"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useOnboarding } from "./context/OnboardingContext"

export default function ArtisanOnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { isLoading, completedSteps } = useOnboarding()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated" && session && !isLoading) {
      // Déterminer vers quelle étape rediriger
      let nextStep = "/onboarding/artisan/profile" // Par défaut, rediriger vers le profil

      // Si l'étape de confirmation est complétée, rediriger vers le tableau de bord
      if (completedSteps.includes("confirmation")) {
        router.push("/artisan")
        return
      }

      // Trouver la première étape non complétée
      if (completedSteps.includes("profile")) {
        // Si le profil est complété, vérifier la localisation
        if (!completedSteps.includes("location")) {
          nextStep = "/onboarding/artisan/location"
        }
        // Si la localisation est complétée, vérifier les spécialités
        else if (!completedSteps.includes("specialties")) {
          nextStep = "/onboarding/artisan/specialties"
        } else if (!completedSteps.includes("documents")) {
          // Si les spécialités sont complétées, vérifier les documents
          nextStep = "/onboarding/artisan/documents"
        } else if (!completedSteps.includes("confirmation")) {
          // Si les documents sont complétés, passer à la confirmation
          nextStep = "/onboarding/artisan/confirmation"
        }
      }

      router.push(nextStep)
    }
  }, [status, router, session, completedSteps, isLoading])

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