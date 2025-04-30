import { questions } from "../data/questions"
import { calculateScores } from "./scoreCalculator"

type Answer = string | string[]
type Answers = Record<string, Answer>

/**
 * Vérifie si l'évaluation est complète (toutes les questions ont été répondues)
 * @param answers Les réponses aux questions d'évaluation
 * @returns Vrai si toutes les questions ont une réponse
 */
export function isAssessmentComplete(answers: Answers): boolean {
  let totalQuestions = 0
  let answeredQuestions = 0

  questions.forEach(section => {
    section.questions.forEach(question => {
      totalQuestions++
      if (answers[question.id]) {
        answeredQuestions++
      }
    })
  })

  return totalQuestions === answeredQuestions
}

/**
 * Calcule le pourcentage de progression de l'évaluation
 * @param answers Les réponses aux questions d'évaluation
 * @returns Le pourcentage de complétion (0-100)
 */
export function getCompletionPercentage(answers: Answers): number {
  let totalQuestions = 0
  let answeredQuestions = 0

  questions.forEach(section => {
    section.questions.forEach(question => {
      totalQuestions++
      if (answers[question.id]) {
        answeredQuestions++
      }
    })
  })

  return totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
}

/**
 * Récupère les catégories d'expertise (score >= 70%)
 * @param answers Les réponses aux questions d'évaluation
 * @returns Un tableau de paires [catégorie, score]
 */
export function getExpertiseCategories(answers: Answers): [string, number][] {
  const scores = calculateScores(answers)
  return Object.entries(scores)
    .filter(([_, score]) => score >= 70)
    .sort((a, b) => b[1] - a[1])
}

/**
 * Récupère les catégories à améliorer (score < 40%)
 * @param answers Les réponses aux questions d'évaluation
 * @returns Un tableau de paires [catégorie, score]
 */
export function getImprovementCategories(answers: Answers): [string, number][] {
  const scores = calculateScores(answers)
  return Object.entries(scores)
    .filter(([_, score]) => score < 40)
    .sort((a, b) => a[1] - b[1])
}

/**
 * Compte le nombre total de questions dans l'évaluation
 * @returns Le nombre total de questions
 */
export function getTotalQuestions(): number {
  let count = 0
  questions.forEach(section => {
    count += section.questions.length
  })
  return count
}

/**
 * Compte le nombre de questions répondues
 * @param answers Les réponses aux questions d'évaluation
 * @returns Le nombre de questions répondues
 */
export function getAnsweredQuestions(answers: Answers): number {
  let count = 0
  questions.forEach(section => {
    section.questions.forEach(question => {
      if (answers[question.id]) {
        count++
      }
    })
  })
  return count
} 