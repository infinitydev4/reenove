import React, { useMemo } from "react"
import { StepProgressBar } from "./StepProgressBar"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { BottomStepperNav } from "./BottomStepperNav"
import { ONBOARDING_STEPS } from "../constants"
import { useOnboarding } from "../context/OnboardingContext"
import { PageTransition } from "./PageTransition"

interface OnboardingLayoutProps {
  currentStep: string
  children: React.ReactNode
  title?: string
  description?: string
  onNext?: () => void
  onPrevious?: () => void
  isLastStep?: boolean
}

export function OnboardingLayout({
  currentStep,
  children,
  title,
  description,
  onNext,
  onPrevious,
  isLastStep = false
}: OnboardingLayoutProps) {
  const { completedSteps } = useOnboarding()
  // Mémoriser les completedSteps pour éviter les mises à jour inutiles
  const memoizedCompletedSteps = useMemo(() => completedSteps, [completedSteps])
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  
  // Récupérer le titre de l'étape actuelle pour l'afficher dans le contenu principal
  const stepTitle = ONBOARDING_STEPS.find(step => step.id === currentStep)?.title || "Inscription"
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground mb-16 md:mb-0">
      {/* Header fixe avec progression */}
      <header className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-xl",
        isDarkTheme 
          ? "bg-background/90 border-gray-800"
          : "bg-background/90 border-gray-200"
      )}>
        <div className="container mx-auto py-6">
          <StepProgressBar 
            currentStep={currentStep} 
            completedSteps={memoizedCompletedSteps} 
          />
        </div>
      </header>
      
      {/* Contenu principal avec défilement et espace pour la barre fixe en bas sur mobile */}
      <main className="flex-grow container mx-auto px-4 py-6 pb-24 md:pb-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">{title || stepTitle}</h1>
          {description && <p className={cn(
            "text-sm mt-2 max-w-md mx-auto",
            "text-muted-foreground"
          )}>{description}</p>}
        </div>
        
        <div className="max-w-3xl mx-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
      
      {/* Barre de navigation inférieure (mobile uniquement) */}
      <BottomStepperNav 
        currentStep={currentStep}
        isLastStep={isLastStep}
        onNext={onNext}
        onPrevious={onPrevious}
      />
    </div>
  )
} 