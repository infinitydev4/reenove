// Définition centralisée des étapes d'onboarding
export const ONBOARDING_STEPS = [
  {
    id: "profile",
    title: "Profil",
    description: "Complétez vos informations personnelles et d'entreprise",
    path: "/onboarding/artisan/profile"
  },
  {
    id: "location",
    title: "Localisation",
    description: "Indiquez votre adresse et votre zone d'intervention",
    path: "/onboarding/artisan/location"
  },
  {
    id: "specialties",
    title: "Spécialités",
    description: "Indiquez vos domaines d'expertise",
    path: "/onboarding/artisan/specialties"
  },
  {
    id: "documents",
    title: "Documents",
    description: "Importez vos documents professionnels",
    path: "/onboarding/artisan/documents"
  },
  {
    id: "payment",
    title: "Abonnement",
    description: "Choisissez votre plan d'abonnement",
    path: "/onboarding/artisan/payment"
  },
  {
    id: "confirmation",
    title: "Confirmation",
    description: "Vérifiez et confirmez vos informations",
    path: "/onboarding/artisan/confirmation"
  }
]

export const getStepProgress = (userId: string) => {
  // Cette fonction pourrait être améliorée pour récupérer l'état de progression depuis une API
  // Pour l'instant, nous utilisons un mock pour démonstration
  return {
    completedSteps: ["profile", "specialties"],
    currentStep: "documents"
  }
} 