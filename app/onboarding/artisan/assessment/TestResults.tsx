import React from "react"
import { Circle } from "rc-progress"
import { calculateScores } from "./utils/scoreCalculator"
import { getExpertiseCategories, getImprovementCategories } from "./utils/assessmentHelpers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Answer = string | string[]
type Answers = Record<string, Answer>

interface TestResultsProps {
  answers: Answers
}

export default function TestResults({ answers }: TestResultsProps) {
  const scores = calculateScores(answers)
  const expertiseCategories = getExpertiseCategories(answers)
  const improvementCategories = getImprovementCategories(answers)
  
  const getColorForScore = (score: number) => {
    if (score >= 70) return "#22c55e" // vert
    if (score >= 40) return "#f59e0b" // orange
    return "#ef4444" // rouge
  }

  return (
    <div className="space-y-8 py-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Résultats de votre évaluation</h1>
        <p className="text-muted-foreground">
          Découvrez vos points forts et vos axes d&apos;amélioration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(scores).map(([category, score]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-center py-4">
                <div className="relative w-32 h-32">
                  <Circle
                    percent={score}
                    strokeWidth={8}
                    strokeColor={getColorForScore(score)}
                    trailWidth={8}
                    trailColor="#e5e7eb"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{score}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vos points forts</CardTitle>
            <CardDescription>Catégories où vous excellez (70% ou plus)</CardDescription>
          </CardHeader>
          <CardContent>
            {expertiseCategories.length > 0 ? (
              <ul className="space-y-2">
                {expertiseCategories.map(([category, score]) => (
                  <li key={category} className="flex justify-between items-center">
                    <span>{category}</span>
                    <span className="font-semibold text-green-600">{score}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">
                Continuez à vous entraîner pour développer vos compétences
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Axes d&apos;amélioration</CardTitle>
            <CardDescription>Catégories à renforcer (moins de 40%)</CardDescription>
          </CardHeader>
          <CardContent>
            {improvementCategories.length > 0 ? (
              <ul className="space-y-2">
                {improvementCategories.map(([category, score]) => (
                  <li key={category} className="flex justify-between items-center">
                    <span>{category}</span>
                    <span className="font-semibold text-red-600">{score}%</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">
                Vous avez un bon niveau dans toutes les catégories !
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4 pt-4">
        <Button asChild variant="outline">
          <Link href="/onboarding/artisan/assessment">Refaire l&apos;évaluation</Link>
        </Button>
        <Button asChild>
          <Link href="/onboarding/artisan/profile">Compléter mon profil</Link>
        </Button>
      </div>
    </div>
  )
} 