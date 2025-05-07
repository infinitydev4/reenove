import React from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export const ONBOARDING_STEPS = [
  {
    id: "profile",
    title: "Profil",
    path: "/onboarding/artisan/profile"
  },
  {
    id: "specialties",
    title: "Spécialités",
    path: "/onboarding/artisan/specialties"
  },
  {
    id: "documents",
    title: "Documents",
    path: "/onboarding/artisan/documents"
  },
  {
    id: "confirmation",
    title: "Confirmation",
    path: "/onboarding/artisan/confirmation"
  }
]

interface StepProgressBarProps {
  currentStep: string
  completedSteps: string[]
}

export function StepProgressBar({ currentStep, completedSteps }: StepProgressBarProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
  
  return (
    <div className="w-full py-2">
      <h2 className="text-xl font-semibold text-center mb-6 lg:mb-8">
        {ONBOARDING_STEPS.find(step => step.id === currentStep)?.title || "Inscription"}
      </h2>
      
      <div className="relative flex justify-between items-center px-4 max-w-xl mx-auto">
        {/* Barre de progression */}
        <div className="absolute left-0 right-0 h-1 bg-gray-200 top-1/2 -translate-y-1/2 z-0"></div>
        <div 
          className="absolute left-0 h-1 bg-primary top-1/2 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ 
            width: `${
              currentIndex === 0 
                ? '0%' 
                : `${(currentIndex / (ONBOARDING_STEPS.length - 1)) * 100}%`
            }`
          }}
        ></div>
        
        {/* Étapes */}
        {ONBOARDING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = currentStep === step.id
          
          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center"
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300",
                  isCompleted ? "bg-primary text-white" : 
                    isCurrent ? "bg-primary/20 text-primary border-2 border-primary" : 
                      "bg-gray-100 text-gray-400 border border-gray-300"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "text-xs mt-1 font-medium transition-all duration-300 absolute -bottom-6",
                  isCompleted ? "text-primary" : 
                    isCurrent ? "text-primary" : "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 