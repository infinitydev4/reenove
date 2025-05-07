import React from "react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, ChevronRight } from "lucide-react"

export const ONBOARDING_STEPS = [
  {
    id: "profile",
    title: "Informations de profil",
    description: "Complétez vos informations personnelles et d'entreprise",
    path: "/onboarding/artisan/profile"
  },
  {
    id: "specialties",
    title: "Spécialités",
    description: "Indiquez vos domaines d'expertise principaux et secondaires",
    path: "/onboarding/artisan/specialties"
  },
  {
    id: "documents",
    title: "Documents obligatoires",
    description: "Importez vos documents professionnels (KBIS, assurances, etc.)",
    path: "/onboarding/artisan/documents"
  },
  {
    id: "confirmation",
    title: "Confirmation",
    description: "Vérifiez et confirmez vos informations",
    path: "/onboarding/artisan/confirmation"
  }
]

type StepStatus = "completed" | "current" | "pending" | "blocked"

interface OnboardingProgressProps {
  currentStep: string
  completedSteps: string[]
}

export function OnboardingProgress({ currentStep, completedSteps }: OnboardingProgressProps) {
  const getStepStatus = (stepId: string): StepStatus => {
    if (completedSteps.includes(stepId)) return "completed"
    if (stepId === currentStep) return "current"
    
    // Vérification des étapes antérieures pour déterminer si l'étape est bloquée
    const currentStepIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
    const stepIndex = ONBOARDING_STEPS.findIndex(step => step.id === stepId)
    
    // Si toutes les étapes précédentes ne sont pas complétées, cette étape est bloquée
    if (stepIndex > currentStepIndex) {
      const previousSteps = ONBOARDING_STEPS.slice(0, stepIndex).map(step => step.id)
      const allPreviousCompleted = previousSteps.every(id => completedSteps.includes(id))
      return allPreviousCompleted ? "pending" : "blocked"
    }
    
    return "pending"
  }
  
  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "current":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "blocked":
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return <ChevronRight className="h-5 w-5 text-gray-400" />
    }
  }
  
  const getStepBadge = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminé</Badge>
      case "current":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>
      case "blocked":
        return <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">Bloqué</Badge>
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">À venir</Badge>
    }
  }
  
  // Calcul du pourcentage de progression
  const stepCount = ONBOARDING_STEPS.length
  const completedCount = completedSteps.length
  const progressPercentage = (completedCount / stepCount) * 100

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Votre progression</h3>
          <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="space-y-4">
        {ONBOARDING_STEPS.map((step, index) => {
          const status = getStepStatus(step.id)
          const isClickable = status === "completed" || status === "current"
          
          return (
            <div key={step.id} className={`border rounded-lg ${status === "current" ? "border-blue-200 bg-blue-50/50" : "border-gray-200"}`}>
              <div className="flex items-start p-4">
                <div className="flex-shrink-0 mt-0.5 mr-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full border border-gray-200 bg-white">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {getStepBadge(status)}
                    </div>
                  </div>
                  
                  {isClickable && (
                    <div className="mt-2">
                      <Link 
                        href={step.path}
                        className={`text-sm font-medium ${
                          status === "current" ? "text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {status === "completed" ? "Modifier" : "Continuer"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 