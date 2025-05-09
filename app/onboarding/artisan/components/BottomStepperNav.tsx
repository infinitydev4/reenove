import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ONBOARDING_STEPS } from "../constants";
import { useOnboarding } from "../context/OnboardingContext";

interface BottomStepperNavProps {
  currentStep: string;
  isLastStep?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function BottomStepperNav({
  currentStep,
  isLastStep = false,
  onNext,
  onPrevious,
}: BottomStepperNavProps) {
  const { goToNextStep, goToPreviousStep, isSaving } = useOnboarding();
  
  // Déterminer l'index actuel
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep);
  const isFirstStep = currentIndex === 0;
  
  // Navigation à l'étape précédente ou suivante
  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else {
      goToPreviousStep(currentStep as any);
    }
  };
  
  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      // Vérifier si un formulaire existe et le soumettre
      const form = document.getElementById('onboarding-form') as HTMLFormElement | null;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      } else {
        goToNextStep(currentStep as any);
      }
    }
  };
  
  const handleComplete = () => {
    // Vérifier si un formulaire existe et le soumettre
    const form = document.getElementById('onboarding-form') as HTMLFormElement | null;
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-3 px-4">
      <div className="flex justify-between items-center w-full gap-4">
        {!isFirstStep ? (
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            className="flex-1 flex items-center justify-center gap-2"
            size="sm" 
            disabled={isSaving}
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>
        ) : (
          <div className="flex-1"></div>
        )}
        
        {!isLastStep ? (
          <Button 
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2"
            size="sm" 
            disabled={isSaving}
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleComplete}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            disabled={isSaving}
          >
            Terminer
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
} 