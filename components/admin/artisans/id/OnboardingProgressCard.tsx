import { CheckCircle, CheckSquare, Clock, Layers } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type OnboardingStep = {
  name: string
  completed: boolean
}

type OnboardingProgressCardProps = {
  progress: number
  steps: OnboardingStep[]
}

export function OnboardingProgressCard({ progress, steps }: OnboardingProgressCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-primary/60"></div>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Layers className="mr-2 h-5 w-5 text-primary" />
          Progression d&apos;onboarding
        </CardTitle>
        <CardDescription>
          Suivi du processus d&apos;inscription et de validation de l&apos;artisan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progression totale</span>
            <span className="text-sm font-medium">{progress || 0}%</span>
          </div>
          <Progress value={progress || 0} className="h-2" />
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex items-center">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                )}
                <span className="text-sm">{step.name}</span>
              </div>
              <Badge variant={step.completed ? "default" : "outline"} className={step.completed ? "bg-green-500" : ""}>
                {step.completed ? "Complété" : "En attente"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <CheckSquare className="mr-2 h-4 w-4" />
          Gérer les étapes d&apos;onboarding
        </Button>
      </CardFooter>
    </Card>
  )
} 