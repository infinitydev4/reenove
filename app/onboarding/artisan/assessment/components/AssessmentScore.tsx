import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { questions } from "../data/questions"
import { calculateScores } from "../utils/scoreCalculator"
import { Loader2 } from "lucide-react"

interface AssessmentScoreProps {
  answers: Record<string, any>
  onRetakeAssessment: () => void
  onCompleteOnboarding: () => void
  isSubmitting?: boolean
}

export function AssessmentScore({
  answers,
  onRetakeAssessment,
  onCompleteOnboarding,
  isSubmitting = false
}: AssessmentScoreProps) {
  const scores = calculateScores(answers)

  const totalQuestionsCount = questions.reduce(
    (acc, section) => acc + section.questions.length,
    0
  )
  
  const answeredQuestionsCount = Object.keys(answers).length
  const completionPercentage = (answeredQuestionsCount / totalQuestionsCount) * 100

  // Trier les catégories par score (du plus élevé au plus bas)
  const sortedCategories = Object.entries(scores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .filter(([, score]) => score > 0)

  // Trouver les domaines d'expertise (scores > 70%)
  const expertises = sortedCategories.filter(([, score]) => score >= 70)
  
  // Trouver les domaines à améliorer (scores < 40%)
  const areasToImprove = sortedCategories.filter(([, score]) => score < 40)

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <h2 className="text-2xl font-bold mb-2">Résultats de votre évaluation</h2>
        <p className="text-gray-500 mb-6">
          Basé sur vos réponses, voici une analyse de vos compétences actuelles.
        </p>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progression de l&apos;évaluation</span>
            <span className="text-sm font-medium">{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Vos domaines d&apos;expertise</h3>
            {expertises.length > 0 ? (
              <div className="space-y-4">
                {expertises.map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{category}</span>
                      <span>{Math.round(score)}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Continuez à développer vos compétences pour atteindre un niveau d&apos;expertise.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Toutes vos compétences</h3>
            <div className="space-y-4">
              {sortedCategories.map(([category, score]) => (
                <div key={category}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{category}</span>
                    <span>{Math.round(score)}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </div>

          {areasToImprove.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Domaines à améliorer</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {areasToImprove.map(([category]) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onRetakeAssessment} disabled={isSubmitting}>
          Refaire l&apos;évaluation
        </Button>
        <Button onClick={onCompleteOnboarding} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            "Terminer l'inscription"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 