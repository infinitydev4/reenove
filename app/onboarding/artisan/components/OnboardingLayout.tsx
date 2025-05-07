import React, { useMemo } from "react"
import { StepProgressBar } from "./StepProgressBar"

interface OnboardingLayoutProps {
  currentStep: string
  completedSteps: string[]
  children: React.ReactNode
  title?: string
  description?: string
}

export function OnboardingLayout({
  currentStep,
  completedSteps,
  children,
  title,
  description
}: OnboardingLayoutProps) {
  // Mémoriser les completedSteps pour éviter les mises à jour inutiles
  const memoizedCompletedSteps = useMemo(() => completedSteps, [completedSteps.join(',')]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header fixe avec progression */}
      <header className="sticky top-0 bg-white dark:bg-gray-900 shadow-sm z-10 py-4">
        <div className="container mx-auto px-4">
          <StepProgressBar 
            currentStep={currentStep} 
            completedSteps={memoizedCompletedSteps} 
          />
        </div>
      </header>
      
      {/* Contenu principal avec défilement */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {(title || description) && (
          <div className="text-center mb-6">
            {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
            {description && <p className="text-muted-foreground max-w-lg mx-auto">{description}</p>}
          </div>
        )}
        
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
} 