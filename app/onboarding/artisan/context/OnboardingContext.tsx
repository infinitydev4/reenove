"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { ONBOARDING_STEPS } from "../constants"

// Types
type OnboardingStep = "profile" | "location" | "specialties" | "documents" | "payment" | "confirmation"

interface OnboardingContextType {
  isLoading: boolean
  isSaving: boolean
  completedSteps: string[]
  setIsSaving: (value: boolean) => void
  goToNextStep: (currentStep: OnboardingStep) => void
  goToPreviousStep: (currentStep: OnboardingStep) => void
  updateProgress: (step: OnboardingStep) => Promise<boolean>
  currentUserData: any
  refreshProgress: () => Promise<void>
  refreshProfile: () => Promise<void>
  silentMode: boolean
  setSilentMode: (value: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [currentUserData, setCurrentUserData] = useState<any>(null)
  const [silentMode, setSilentMode] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // Fonction pour récupérer la progression de l'onboarding
  const fetchOnboardingProgress = useCallback(async () => {
    try {
      const progressResponse = await fetch("/api/artisan/onboarding/progress", { 
        method: "GET", 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (progressResponse.ok) {
        const progressData = await progressResponse.json()
        
        // Transformer les données de progression en tableau d'étapes complétées
        const completed: string[] = []
        if (progressData?.progress?.profile) completed.push("profile")
        if (progressData?.progress?.location) completed.push("location")
        if (progressData?.progress?.specialties) completed.push("specialties")
        if (progressData?.progress?.documents) completed.push("documents")
        if (progressData?.progress?.payment) completed.push("payment")
        if (progressData?.progress?.confirmation) completed.push("confirmation")
        
        setCompletedSteps(completed)
        return progressData
      }
      return null
    } catch (error) {
      console.error("Erreur lors de la récupération de la progression:", error)
      return null
    }
  }, [])

  // Rafraîchir la progression
  const refreshProgress = useCallback(async () => {
    await fetchOnboardingProgress()
  }, [fetchOnboardingProgress])

  // Fonction pour récupérer le profil artisan
  const fetchArtisanProfile = useCallback(async () => {
    try {
      const profileResponse = await fetch("/api/artisan/profile", { 
        method: "GET", 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()

        setCurrentUserData(profileData)
        return profileData
      }
      return null
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error)
      return null
    }
  }, [])

  // Rafraîchir le profil
  const refreshProfile = useCallback(async () => {
    await fetchArtisanProfile()
  }, [fetchArtisanProfile])

  // Initialisation des données
  useEffect(() => {
    const initData = async () => {
      if (status === "authenticated" && session?.user) {
        setIsLoading(true)
        try {
          await Promise.all([
            fetchOnboardingProgress(),
            fetchArtisanProfile()
          ])
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status !== "loading") {
      initData()
    }
  }, [status, session, fetchOnboardingProgress, fetchArtisanProfile])

  // Fonction pour mettre à jour la progression de l'onboarding
  const updateProgress = useCallback(async (step: OnboardingStep) => {
    try {
      const response = await fetch("/api/artisan/onboarding/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify({ step }),
        cache: "no-store"
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la mise à jour de la progression pour l'étape ${step}`)
      }

      // Recharger la progression
      await fetchOnboardingProgress()
      
      return true
    } catch (error) {
      console.error("Erreur mise à jour progression:", error)
      // Toujours afficher les erreurs, même en mode silencieux
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre progression.",
        variant: "destructive",
      })
      return false
    }
  }, [toast, fetchOnboardingProgress])

  // Navigation vers l'étape suivante
  const goToNextStep = useCallback((currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
    
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      const nextStep = ONBOARDING_STEPS[currentIndex + 1]
      router.push(nextStep.path)
    }
  }, [router])

  // Navigation vers l'étape précédente
  const goToPreviousStep = useCallback((currentStep: OnboardingStep) => {
    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
    
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1]
      router.push(previousStep.path)
    }
  }, [router])

  const value = {
    isLoading,
    isSaving,
    completedSteps,
    setIsSaving,
    goToNextStep,
    goToPreviousStep,
    updateProgress,
    currentUserData,
    refreshProgress,
    refreshProfile,
    silentMode,
    setSilentMode
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within a OnboardingProvider")
  }
  return context
} 