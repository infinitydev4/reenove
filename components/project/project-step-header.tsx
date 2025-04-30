import React from 'react';

interface ProjectStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
}

export function ProjectStepHeader({ 
  currentStep, 
  totalSteps, 
  title, 
  description 
}: ProjectStepHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Étape {currentStep} sur {totalSteps}</span>
        <div className="ml-auto">
          <div className="flex items-center">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
} 