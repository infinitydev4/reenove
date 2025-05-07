import { ONBOARDING_STEPS } from "./components/OnboardingProgress"

export const getStepProgress = (userId: string) => {
  // Cette fonction pourrait être améliorée pour récupérer l'état de progression depuis une API
  // Pour l'instant, nous utilisons un mock pour démonstration
  return {
    completedSteps: ["profile", "specialties"],
    currentStep: "documents"
  }
}

export { ONBOARDING_STEPS } 