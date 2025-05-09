import React from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { ONBOARDING_STEPS } from "../constants"

interface StepProgressBarProps {
  currentStep: string
  completedSteps: string[]
}

export function StepProgressBar({ currentStep, completedSteps }: StepProgressBarProps) {
  const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"
  
  return (
    <div className="w-full py-2">
      <div className="relative flex justify-between items-center max-w-3xl mx-auto">
        {/* Barre de progression neumorphique avec taille limitée */}
        <div 
          className={cn(
            "absolute h-1 top-1/2 -translate-y-1/2 z-0",
            isDarkTheme
              ? "bg-gray-800 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.5),_inset_-1px_-1px_1px_rgba(255,255,255,0.03)]"
              : "bg-gray-100 shadow-[inset_1px_1px_1px_rgba(0,0,0,0.03),_inset_-1px_-1px_1px_rgba(255,255,255,0.7)]"
          )}
          style={{
            left: "25px", // Demi-largeur du premier cercle
            right: "25px"  // Demi-largeur du dernier cercle
          }}
        ></div>
        
        {/* Barre de progression complétée avec effet neumorphique */}
        <div 
          className={cn(
            "absolute h-1 top-1/2 -translate-y-1/2 z-1 transition-all duration-500",
            isDarkTheme
              ? "bg-gradient-to-r from-yellow-500 to-amber-600 shadow-[0_0_5px_rgba(250,204,21,0.3)]"
              : "bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_5px_rgba(250,204,21,0.2)]"
          )}
          style={{ 
            left: "25px", // Demi-largeur du premier cercle
            width: currentIndex === 0 
              ? "0%" 
              : `calc(${(currentIndex / (ONBOARDING_STEPS.length - 1)) * 100}% - ${currentIndex === ONBOARDING_STEPS.length - 1 ? "50px" : "0px"})`
          }}
        ></div>
        
        {/* Étapes avec design neumorphique */}
        {ONBOARDING_STEPS.map((step, index) => {
          // Une étape est considérée complétée si:
          // - Elle est explicitement dans le tableau completedSteps OU
          // - Elle est antérieure à l'étape actuelle
          const isCompleted = completedSteps.includes(step.id) || index < currentIndex 
          const isCurrent = currentStep === step.id
          
          return (
            <div 
              key={step.id} 
              className="relative z-10 flex flex-col items-center"
            >
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative",
                  isCurrent 
                    ? isDarkTheme
                      ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-[inset_2px_2px_5px_rgba(255,255,255,0.1),_inset_-2px_-2px_5px_rgba(0,0,0,0.2),_3px_3px_10px_rgba(0,0,0,0.2),_-2px_-2px_8px_rgba(255,255,255,0.05)]"
                      : "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-[inset_2px_2px_5px_rgba(255,255,255,0.2),_inset_-2px_-2px_5px_rgba(0,0,0,0.1),_3px_3px_10px_rgba(0,0,0,0.1),_-3px_-3px_10px_rgba(255,255,255,0.5)]"
                    : isCompleted
                      ? isDarkTheme
                        ? "bg-gray-900 text-yellow-400 shadow-[inset_2px_2px_3px_rgba(0,0,0,0.5),_inset_-2px_-2px_3px_rgba(255,255,255,0.05),_2px_2px_6px_rgba(0,0,0,0.2)]"
                        : "bg-white text-yellow-500 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.05),_inset_-2px_-2px_3px_rgba(255,255,255,0.8),_2px_2px_5px_rgba(0,0,0,0.05),_-3px_-3px_8px_rgba(255,255,255,0.8)]"
                      : isDarkTheme
                        ? "bg-gray-800 text-gray-400 shadow-[inset_2px_2px_3px_rgba(0,0,0,0.5),_inset_-2px_-2px_3px_rgba(255,255,255,0.03)]"
                        : "bg-gray-50 text-gray-400 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.03),_inset_-2px_-2px_3px_rgba(255,255,255,0.7)]"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "text-xs mt-2 font-medium transition-all duration-300 absolute -bottom-6",
                  isCompleted || isCurrent
                    ? "text-yellow-500 dark:text-yellow-400"
                    : isDarkTheme ? "text-gray-400" : "text-gray-500"
                )}
              >
                {/* {step.title} */}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
} 