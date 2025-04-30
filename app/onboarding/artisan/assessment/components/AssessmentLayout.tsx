import React, { useState } from "react"
import { StepperNavigation } from "@/components/StepperNavigation"
import { AssessmentQuestions } from "./AssessmentQuestions"
import { AssessmentScore } from "./AssessmentScore"
import { useRouter } from "next/navigation"

interface AssessmentLayoutProps {
  onComplete?: (answers?: Record<string, any>) => void
  isSubmitting?: boolean
}

export function AssessmentLayout({ onComplete, isSubmitting = false }: AssessmentLayoutProps) {
  const router = useRouter()
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [showResults, setShowResults] = useState(false)
  
  const handleNextSection = () => {
    if (currentSectionIndex < 5) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      window.scrollTo(0, 0)
    } else {
      setShowResults(true)
    }
  }
  
  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      window.scrollTo(0, 0)
    }
  }
  
  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }
  
  const handleRetakeAssessment = () => {
    setShowResults(false)
    setCurrentSectionIndex(0)
  }
  
  const handleCompleteOnboarding = () => {
    if (onComplete) {
      onComplete(answers)
    } else {
      // Rediriger vers la page du tableau de bord
      router.push("/dashboard")
    }
  }
  
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Évaluation des compétences</h1>
      
      {!showResults ? (
        <>
          <div className="mb-6">
            <StepperNavigation
              steps={[
                "Expérience",
                "Compétences",
                "Certification",
                "Méthodologie",
                "Questions",
                "Auto-évaluation"
              ]}
              currentStep={currentSectionIndex}
              onStepClick={(step: number) => setCurrentSectionIndex(step)}
              completedSteps={Array(currentSectionIndex).fill(0).map((_, i) => i)}
            />
          </div>
          
          <AssessmentQuestions
            currentSectionIndex={currentSectionIndex}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onNextSection={handleNextSection}
            onPrevSection={handlePrevSection}
            handleComplete={handleCompleteOnboarding}
            isSubmitting={isSubmitting}
          />
        </>
      ) : (
        <AssessmentScore
          answers={answers}
          onRetakeAssessment={handleRetakeAssessment}
          onCompleteOnboarding={handleCompleteOnboarding}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
} 