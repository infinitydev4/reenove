"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  Info
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

const STEPS = [
  {
    id: "profile",
    title: "Informations de profil",
    description: "Complétez vos informations personnelles et d'entreprise",
    path: "/onboarding/artisan/profile"
  },
  {
    id: "specialties",
    title: "Spécialités",
    description: "Indiquez vos domaines d'expertise principaux et secondaires",
    path: "/onboarding/artisan/specialties"
  },
  {
    id: "documents",
    title: "Documents obligatoires",
    description: "Importez vos documents professionnels (KBIS, assurances, etc.)",
    path: "/onboarding/artisan/documents"
  },
  {
    id: "assessment",
    title: "Évaluation des compétences",
    description: "Répondez à quelques questions pour évaluer votre niveau d'expertise",
    path: "/onboarding/artisan/assessment"
  },
  {
    id: "confirmation",
    title: "Confirmation",
    description: "Vérifiez et confirmez vos informations",
    path: "/onboarding/artisan/confirmation"
  }
]

export default function ArtisanOnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<{
    profile: boolean;
    specialties: boolean;
    documents: boolean;
    assessment: boolean;
    confirmation: boolean;
  }>({
    profile: false,
    specialties: false,
    documents: false,
    assessment: false,
    confirmation: false
  })
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [nextStep, setNextStep] = useState("")

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan")
      return
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "ARTISAN") {
        router.push("/")
        toast({
          title: "Accès refusé",
          description: "Cette section est réservée aux artisans.",
          variant: "destructive"
        })
        return
      }

      // Récupérer l'état d'avancement de l'onboarding de l'artisan
      const fetchProgress = async () => {
        try {
          const response = await fetch("/api/artisan/onboarding/progress")
          if (response.ok) {
            const data = await response.json()
            setProgress(data.progress)
            
            // Calculer le pourcentage global
            const steps = Object.values(data.progress)
            const completedSteps = steps.filter(step => step === true).length
            setProgressPercentage(Math.round((completedSteps / steps.length) * 100))
            
            // Déterminer la prochaine étape
            if (!data.progress.profile) {
              setNextStep("profile")
            } else if (!data.progress.specialties) {
              setNextStep("specialties")
            } else if (!data.progress.documents) {
              setNextStep("documents")
            } else if (!data.progress.assessment) {
              setNextStep("assessment")
            } else if (!data.progress.confirmation) {
              setNextStep("confirmation")
            } else {
              // Tout est complété, rediriger vers le dashboard
              router.push("/artisan")
            }
          } else {
            // En cas d'erreur, considérer que rien n'est complété
            setNextStep("profile")
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la progression:", error)
          // En cas d'erreur, considérer que rien n'est complété
          setNextStep("profile")
        } finally {
          setLoading(false)
        }
      }

      fetchProgress()
    }
  }, [session, status, router, toast])

  const getNextStepPath = () => {
    const step = STEPS.find(s => s.id === nextStep)
    return step?.path || "/onboarding/artisan/profile"
  }

  const getStepStatus = (stepId: string) => {
    const isCompleted = progress[stepId as keyof typeof progress]
    
    if (isCompleted) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      )
    }
    
    if (stepId === nextStep) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      )
    }
    
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800">
        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {STEPS.findIndex(s => s.id === stepId) + 1}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de votre progression...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Complétez votre profil d&apos;artisan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pour proposer vos services sur notre plateforme, veuillez compléter les informations ci-dessous.
          </p>
        </div>

        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <CardTitle>Votre progression</CardTitle>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {STEPS.map((step, index) => (
                <div key={step.id}>
                  <div className="flex items-start gap-4">
                    {getStepStatus(step.id)}
                    <div className="flex-1 space-y-1">
                      <h3 className="font-medium">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <Button 
                      variant={progress[step.id as keyof typeof progress] ? "outline" : (step.id === nextStep ? "default" : "ghost")}
                      size="sm"
                      onClick={() => router.push(step.path)}
                      disabled={!progress[step.id as keyof typeof progress] && step.id !== nextStep}
                    >
                      {progress[step.id as keyof typeof progress] ? "Modifier" : (step.id === nextStep ? "Continuer" : "Bloqué")}
                    </Button>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="ml-4 pl-4 mt-2 border-l border-dashed h-6"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-4 w-full">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Information importante</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Le statut de &quot;Professionnel vérifié&quot; ne sera attribué qu&apos;une fois toutes les étapes complétées et vos documents validés par notre équipe.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => router.push("/artisan")}>
                Revenir plus tard
              </Button>
              <Button onClick={() => router.push(getNextStepPath())}>
                {nextStep === "confirmation" && progress.profile && progress.specialties && progress.documents && progress.assessment
                  ? "Finaliser l'inscription"
                  : "Continuer l'inscription"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 