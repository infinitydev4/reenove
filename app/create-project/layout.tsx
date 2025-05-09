"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface StepProps {
  href: string
  label: string
  index: number
  isActive: boolean
  isCompleted: boolean
}

const projectSteps = [
  { path: "/create-project/category", label: "Catégorie" },
  { path: "/create-project/details", label: "Détails" },
  { path: "/create-project/budget", label: "Budget" },
  { path: "/create-project/location", label: "Localisation" },
  { path: "/create-project/date", label: "Planification" },
  { path: "/create-project/review", label: "Révision" },
]

const Step = ({ href, label, index, isActive, isCompleted }: StepProps) => {
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  
  return (
    <Link href={href} className="flex flex-col items-center">
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-full relative z-10 transition-all duration-300",
          isActive 
            ? isDarkTheme
              ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-[inset_2px_2px_5px_rgba(255,255,255,0.1),_inset_-2px_-2px_5px_rgba(0,0,0,0.2),_3px_3px_10px_rgba(0,0,0,0.2),_-2px_-2px_8px_rgba(255,255,255,0.05)]"
              : "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-[inset_2px_2px_5px_rgba(255,255,255,0.2),_inset_-2px_-2px_5px_rgba(0,0,0,0.1),_3px_3px_10px_rgba(0,0,0,0.1),_-3px_-3px_10px_rgba(255,255,255,0.5)]"
            : isCompleted
              ? isDarkTheme
                ? "bg-gray-900 text-yellow-400 border-yellow-500/40 shadow-[inset_2px_2px_3px_rgba(0,0,0,0.5),_inset_-2px_-2px_3px_rgba(255,255,255,0.05),_2px_2px_6px_rgba(0,0,0,0.2)]"
                : "bg-white text-yellow-500 border-yellow-400/40 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05),_inset_-2px_-2px_3px_rgba(255,255,255,0.8),_2px_2px_5px_rgba(0,0,0,0.05),_-3px_-3px_8px_rgba(255,255,255,0.8)]"
              : isDarkTheme
                ? "bg-gray-800 text-gray-400 border-gray-700 shadow-[inset_2px_2px_3px_rgba(0,0,0,0.5),_inset_-2px_-2px_3px_rgba(255,255,255,0.03)]"
                : "bg-gray-50 text-gray-400 border-gray-200 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.03),_inset_-2px_-2px_3px_rgba(255,255,255,0.7)]"
        )}
      >
        {isCompleted ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
      </div>
    </Link>
  )
}

export default function CreateProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";
  
  // Identifier l'étape active
  const activeStepIndex = projectSteps.findIndex(step => pathname.includes(step.path));
  
  // Vérifier si c'est la page de succès
  const isSuccessPage = pathname === "/create-project/success";
  
  // Vérifier s'il est possible de revenir en arrière
  const canGoBack = activeStepIndex > 0;
  
  // Naviguer à l'étape précédente
  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      router.push(projectSteps[activeStepIndex - 1].path);
    }
  };
  
  const isLastStep = activeStepIndex === projectSteps.length - 1;
  
  // Gérer la soumission du formulaire ou la navigation à l'étape suivante
  const handleNextStep = () => {
    // Soumettre le formulaire actuel si nous ne sommes pas à la dernière étape
    if (activeStepIndex < projectSteps.length - 1) {
      // Trouver le formulaire sur la page et le soumettre
      const form = document.getElementById('project-form') as HTMLFormElement | null;
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      } else {
        // S'il n'y a pas de formulaire, naviguer directement
        router.push(projectSteps[activeStepIndex + 1].path);
      }
    }
  };

  if (isSuccessPage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-7xl mx-auto pt-24 px-4">
          {children}
        </main>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen flex flex-col mb-16 md:mb-0">
      <Navbar />
      
      {/* Bannière de progression avec style neumorphique */}
      <div className={cn(
        "sticky top-14 z-30 w-full border-b backdrop-blur",
        isDarkTheme 
          ? "bg-[#121212]/90 border-gray-800"
          : "bg-[#f8f9fa]/90 border-gray-200"
      )}>
        <div className="container max-w-7xl mx-auto">
          <div className="py-3 lg:py-4">
            <div className="relative flex justify-between items-center max-w-2xl mx-auto pb-1">
              {/* Ligne de progression neumorphique */}
              <div className={cn(
                "absolute top-5 left-0 right-0 h-1 -z-10",
                isDarkTheme
                  ? "bg-gray-800 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5),_inset_-1px_-1px_1px_rgba(255,255,255,0.03)]"
                  : "bg-gray-100 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.03),_inset_-1px_-1px_1px_rgba(255,255,255,0.7)]"
              )} />
              
              {/* Ligne de progression complétée */}
              <div 
                className={cn(
                  "absolute top-5 left-0 h-1 -z-10 transition-all duration-500",
                  isDarkTheme
                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 shadow-[0_0_5px_rgba(250,204,21,0.3)]"
                    : "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_5px_rgba(250,204,21,0.2)]"
                )}
                style={{ 
                  width: `${Math.max(0, (activeStepIndex / (projectSteps.length - 1)) * 100)}%` 
                }}
              />
              
              {/* Étapes */}
              {projectSteps.map((step, index) => (
                <Step
                  key={step.path}
                  href={step.path}
                  label={step.label}
                  index={index}
                  isActive={index === activeStepIndex}
                  isCompleted={index < activeStepIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-1 container max-w-7xl mx-auto pt-6 md:pt-8 px-4 pb-24 md:pb-12">
        <Card className="max-w-4xl mx-auto p-4 md:p-8 border rounded-lg bg-background shadow-sm">
          <div className="relative mx-auto max-w-4xl">
            {/* <h1 className="text-2xl font-bold mb-3">Créer un projet</h1> */}
          {children}
          </div>
        </Card>
      </main>
      
      {/* Barre de navigation fixe en bas (visible uniquement sur mobile) */}
      {!isSuccessPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-background border-t shadow-[0_-2px_10px_rgba(0,0,0,0.05)] py-3 px-4">
          <div className="flex justify-between items-center w-full gap-4">
            {canGoBack ? (
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                className="flex-1 flex items-center justify-center gap-2"
                size="sm" 
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>
            ) : (
              <div className="flex-1"></div>
            )}
            
            {!isLastStep && (
              <Button 
                onClick={handleNextStep}
                className="flex-1 flex items-center justify-center gap-2"
                size="sm" 
              >
                Suivant
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            
            {isLastStep && (
              <Button
                onClick={() => {
                  const form = document.getElementById('project-form') as HTMLFormElement | null;
                  if (form) {
                    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  } else {
                    // Si nous sommes sur la page de révision et qu'il n'y a pas de formulaire standard
                    // déclencher directement le handleSubmit qui est attaché au bouton de publication
                    const publishButton = document.querySelector('button[id="project-form"]') as HTMLButtonElement | null;
                    if (publishButton) {
                      publishButton.click();
                    }
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                Publier
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
      </div>
      )}
    </div>
  )
} 