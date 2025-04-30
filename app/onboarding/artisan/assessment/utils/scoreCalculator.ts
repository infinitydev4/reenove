import { questions } from "../data/questions"

type Answer = string | string[]
type Answers = Record<string, Answer>
type CategoryScores = Record<string, number>

/**
 * Calcule les scores par catégorie de compétence en fonction des réponses
 * @param answers Les réponses aux questions d'évaluation
 * @returns Un objet avec les scores par catégorie (en pourcentage)
 */
export function calculateScores(answers: Answers): CategoryScores {
  // Initialiser les scores par catégorie
  const categoryScores: Record<string, { score: number; total: number }> = {}

  // Parcourir chaque section de questions
  questions.forEach((section) => {
    // Parcourir chaque question de la section
    section.questions.forEach((question) => {
      const questionId = question.id
      const answer = answers[questionId]
      
      if (!answer) return // Ignorer les questions sans réponse
      
      // Initialiser la catégorie si elle n'existe pas encore
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { score: 0, total: 0 }
      }
      
      const categoryData = categoryScores[question.category]

      if (question.type === "single-choice") {
        // Pour les questions à choix unique
        const selectedOption = question.options?.find(opt => opt.id === answer)
        if (selectedOption) {
          categoryData.score += selectedOption.value
          categoryData.total += question.maxValue || 5 // Valeur maximale par défaut
        }
      } else if (question.type === "multiple-choice" && Array.isArray(answer)) {
        // Pour les questions à choix multiples
        let questionScore = 0
        
        answer.forEach(optionId => {
          const selectedOption = question.options?.find(opt => opt.id === optionId)
          if (selectedOption) {
            questionScore += selectedOption.value
          }
        })
        
        // Limiter le score de la question à sa valeur maximale
        questionScore = Math.min(questionScore, question.maxValue || 5)
        
        categoryData.score += questionScore
        categoryData.total += question.maxValue || 5
      }
    })
  })

  // Calculer les pourcentages pour chaque catégorie
  const percentageScores: CategoryScores = {}
  
  Object.entries(categoryScores).forEach(([category, data]) => {
    if (data.total > 0) {
      percentageScores[category] = (data.score / data.total) * 100
    } else {
      percentageScores[category] = 0
    }
  })

  return percentageScores
} 