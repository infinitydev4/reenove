import React from "react"
import { Check, Loader2 } from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { questions } from "../data/questions"

// Questions par catégorie
export const ASSESSMENT_QUESTIONS = [
  {
    id: "experience",
    title: "Expérience professionnelle",
    questions: [
      {
        id: "years_experience",
        type: "radio",
        question: "Depuis combien d'années exercez-vous votre métier ?",
        options: [
          { value: "less_1", label: "Moins d'1 an", score: 1 },
          { value: "1_3", label: "1 à 3 ans", score: 2 },
          { value: "3_5", label: "3 à 5 ans", score: 3 },
          { value: "more_5", label: "Plus de 5 ans", score: 4 }
        ],
        required: true
      },
      {
        id: "projects_completed",
        type: "radio",
        question: "Combien de projets avez-vous réalisés dans votre spécialité principale ?",
        options: [
          { value: "less_10", label: "Moins de 10", score: 1 },
          { value: "10_50", label: "Entre 10 et 50", score: 2 },
          { value: "more_50", label: "Plus de 50", score: 3 }
        ],
        required: true
      }
    ]
  },
  {
    id: "skills",
    title: "Compétences spécifiques",
    questions: [
      {
        id: "specific_skills",
        type: "checkbox",
        question: "Dans votre spécialité, quelles tâches maîtrisez-vous parfaitement ?",
        options: [
          { value: "basic", label: "Travaux basiques et courants", score: 1 },
          { value: "medium", label: "Installations complexes", score: 2 },
          { value: "advanced", label: "Rénovation complète", score: 3 },
          { value: "expert", label: "Projets spécialisés ou haut de gamme", score: 4 }
        ],
        required: true
      },
      {
        id: "team_lead",
        type: "radio",
        question: "Êtes-vous capable de superviser une équipe sur un chantier ?",
        options: [
          { value: "yes", label: "Oui", score: 3 },
          { value: "no", label: "Non", score: 0 }
        ],
        required: true
      }
    ]
  },
  {
    id: "certifications",
    title: "Certifications et formations",
    questions: [
      {
        id: "certifications",
        type: "checkbox",
        question: "Avez-vous obtenu des certifications professionnelles reconnues ?",
        options: [
          { value: "rge", label: "RGE (Reconnu Garant de l'Environnement)", score: 2 },
          { value: "qualibat", label: "Qualibat", score: 2 },
          { value: "specific", label: "Certification spécifique à mon métier", score: 2 },
          { value: "none", label: "Non, aucune certification particulière", score: 0 }
        ],
        required: true
      },
      {
        id: "certifications_details",
        type: "textarea",
        question: "Si vous avez des certifications, précisez lesquelles et depuis quand :",
        required: false
      }
    ]
  },
  {
    id: "quality",
    title: "Méthodologie et qualité",
    questions: [
      {
        id: "quality_methods",
        type: "checkbox",
        question: "Comment garantissez-vous la qualité de votre travail ?",
        options: [
          { value: "materials", label: "Utilisation de matériaux certifiés", score: 1 },
          { value: "standards", label: "Respect strict des normes", score: 1 },
          { value: "warranty", label: "Garantie après travaux", score: 1 },
          { value: "checks", label: "Audits et contrôles qualité", score: 2 }
        ],
        required: true
      },
      {
        id: "standards",
        type: "radio",
        question: "Travaillez-vous selon des normes spécifiques (ex: normes RT, DTU, etc.) ?",
        options: [
          { value: "always", label: "Systématiquement", score: 3 },
          { value: "often", label: "Souvent", score: 2 },
          { value: "sometimes", label: "Parfois", score: 1 },
          { value: "never", label: "Rarement ou jamais", score: 0 }
        ],
        required: true
      }
    ]
  },
  {
    id: "practical",
    title: "Questions pratiques",
    questions: [
      {
        id: "equipment",
        type: "radio",
        question: "Êtes-vous équipé pour intervenir seul sur un chantier (véhicule, outillage complet) ?",
        options: [
          { value: "yes", label: "Oui, j'ai tout l'équipement nécessaire", score: 2 },
          { value: "partial", label: "Partiellement, certains outils me manquent", score: 1 },
          { value: "no", label: "Non", score: 0 }
        ],
        required: true
      },
      {
        id: "availability",
        type: "radio",
        question: "En combien de temps êtes-vous généralement disponible pour commencer un nouveau projet ?",
        options: [
          { value: "less_week", label: "Moins d'une semaine", score: 3 },
          { value: "1_2_weeks", label: "1 à 2 semaines", score: 2 },
          { value: "more_2_weeks", label: "Plus de 2 semaines", score: 1 }
        ],
        required: true
      }
    ]
  },
  {
    id: "self_evaluation",
    title: "Auto-évaluation",
    questions: [
      {
        id: "self_evaluation",
        type: "radio",
        question: "Comment évalueriez-vous votre niveau de compétence dans votre spécialité principale ?",
        options: [
          { value: "beginner", label: "Débutant", score: 1 },
          { value: "intermediate", label: "Intermédiaire", score: 2 },
          { value: "confirmed", label: "Confirmé", score: 3 },
          { value: "expert", label: "Expert", score: 4 }
        ],
        required: true
      },
      {
        id: "additional_info",
        type: "textarea",
        question: "Souhaitez-vous ajouter des informations sur vos compétences ou votre expérience ?",
        required: false
      }
    ]
  }
]

interface AssessmentQuestionsProps {
  currentSectionIndex: number
  answers: Record<string, any>
  onAnswerChange: (questionId: string, value: any) => void
  onNextSection: () => void
  onPrevSection: () => void
  handleComplete: () => void
  isSubmitting: boolean
}

export function AssessmentQuestions({
  currentSectionIndex,
  answers,
  onAnswerChange,
  onNextSection,
  onPrevSection,
  handleComplete,
  isSubmitting
}: AssessmentQuestionsProps) {
  const currentSection = questions[currentSectionIndex]
  
  if (!currentSection) {
    return <div>Section introuvable</div>
  }
  
  const isLastSection = currentSectionIndex === questions.length - 1
  const isFirstSection = currentSectionIndex === 0
  
  const handleOptionChange = (questionId: string, value: number) => {
    onAnswerChange(questionId, value)
  }
  
  const handleCheckboxChange = (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswers = answers[questionId] || []
    
    if (checked) {
      onAnswerChange(questionId, [...currentAnswers, optionId])
    } else {
      onAnswerChange(
        questionId,
        currentAnswers.filter((id: string) => id !== optionId)
      )
    }
  }
  
  // Vérifie si toutes les questions de la section actuelle ont des réponses
  const areAllQuestionsAnswered = () => {
    return currentSection.questions.every(question => {
      // Les questions de type text sont considérées comme optionnelles
      if (question.type === "text") return true;
      
      if (question.type === "multiple-choice") {
        // Pour les questions à choix multiples, au moins une option doit être sélectionnée
        return answers[question.id] && answers[question.id].length > 0;
      }
      
      // Pour les questions à choix unique, une valeur doit être définie
      return answers[question.id] !== undefined;
    });
  }
  
  return (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-4">{currentSection.title}</h2>
        <p className="text-gray-500 mb-6">{currentSection.description}</p>
        
        <div className="space-y-8">
          {currentSection.questions.map((question) => (
            <div key={question.id} className="pb-4 border-b border-gray-100">
              <h3 className="font-medium mb-3">{question.text}</h3>
              
              {question.type === "single" ? (
                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={(value) => handleOptionChange(question.id, parseInt(value))}
                  className="space-y-3"
                >
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`${question.id}-${index}`} />
                      <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">{option.text}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-3">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Checkbox
                        id={`${question.id}-${index}`}
                        checked={(answers[question.id] || []).includes(index.toString())}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(question.id, index.toString(), checked === true)
                        }
                      />
                      <Label
                        htmlFor={`${question.id}-${index}`}
                        className="cursor-pointer leading-normal"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isFirstSection && (
          <Button variant="outline" onClick={onPrevSection}>
            Précédent
          </Button>
        )}
        {isFirstSection && (
          <div></div> // Espace vide pour maintenir l'alignement flex
        )}
        
        {isLastSection ? (
          <Button onClick={handleComplete} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Terminer l'évaluation"
            )}
          </Button>
        ) : (
          <Button onClick={onNextSection}>
            Suivant
          </Button>
        )}
      </CardFooter>
    </Card>
  )
} 