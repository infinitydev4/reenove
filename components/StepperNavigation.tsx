import { Check, Circle } from "lucide-react"

interface StepperNavigationProps {
  steps: string[]
  currentStep: number
  onStepClick?: (step: number) => void
  completedSteps?: number[]
  disabled?: boolean
}

export function StepperNavigation({
  steps,
  currentStep,
  onStepClick,
  completedSteps = [],
  disabled = false
}: StepperNavigationProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 md:gap-2">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index)
        const isActive = currentStep === index
        const isClickable = onStepClick && !disabled && (isCompleted || index <= Math.min(currentStep + 1, steps.length - 1))

        return (
          <div key={index} className="flex items-center">
            <button
              type="button"
              className={`
                flex h-8 items-center gap-2 rounded-full px-3 text-sm font-medium
                ${isActive 
                  ? "bg-primary text-primary-foreground" 
                  : isCompleted 
                    ? "bg-primary/20 text-primary hover:bg-primary/30" 
                    : "bg-muted text-muted-foreground"}
                ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
              `}
              onClick={() => isClickable && onStepClick && onStepClick(index)}
              disabled={!isClickable}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle className={`h-4 w-4 ${isActive ? "fill-primary-foreground" : ""}`} />
              )}
              <span>{step}</span>
            </button>
            
            {index < steps.length - 1 && (
              <div className="mx-1 h-px w-4 bg-border md:w-6" />
            )}
          </div>
        )
      })}
    </div>
  )
} 