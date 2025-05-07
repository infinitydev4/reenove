"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CheckCircle, ClipboardCheck, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { OnboardingLayout } from "../components/OnboardingLayout"

export default function ArtisanConfirmationPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan/confirmation")
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

      // Récupérer l'état d'avancement de l'onboarding
      const fetchData = async () => {
        try {
          setIsLoading(true)
          
          // Récupérer l'état d'avancement de l'onboarding
          const progressResponse = await fetch("/api/artisan/onboarding/progress")
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            
            // Transformer les données de progression en tableau d'étapes complétées
            const completed: string[] = []
            if (progressData.progress.profile) completed.push("profile")
            if (progressData.progress.specialties) completed.push("specialties")
            if (progressData.progress.documents) completed.push("documents")
            if (progressData.progress.confirmation) completed.push("confirmation")
            
            setCompletedSteps(completed)
            setOnboardingComplete(progressData.progress.confirmation || false)
            
            // Si l'étape des documents n'est pas complétée, rediriger vers cette étape
            if (!progressData.progress.documents) {
              router.push("/onboarding/artisan/documents")
              return
            }
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [status, router, session])

  const updateOnboardingProgress = async () => {
    try {
      const response = await fetch("/api/artisan/onboarding/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ step: "confirmation" }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la progression");
      }

      // Récupérer les étapes complétées mises à jour
      const data = await response.json();
      setCompletedSteps(data.progress.completedSteps);
      
      return true;
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre progression.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleConfirm = async () => {
    try {
      setIsSaving(true);
      
      // Mettre à jour la progression
      const progressUpdated = await updateOnboardingProgress();
      
      if (progressUpdated) {
        setOnboardingComplete(true);
        
        toast({
          title: "Inscription terminée !",
          description: "Votre compte artisan est maintenant activé. Vous allez être redirigé vers votre tableau de bord.",
        });
        
        // Rediriger vers le tableau de bord après un court délai
        setTimeout(() => {
          router.push("/artisan");
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser votre inscription.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de vos informations...</p>
      </div>
    )
  }

  return (
    <OnboardingLayout 
      currentStep="confirmation"
      completedSteps={completedSteps}
      title="Confirmation de l'inscription"
      description="Vérifiez vos informations et terminez votre inscription."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Finalisation de l&apos;inscription</CardTitle>
          <CardDescription>
            Vérifiez et confirmez les informations fournies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">Profil</h3>
                  <div className="flex items-center text-sm space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Informations professionnelles</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">Spécialités</h3>
                  <div className="flex items-center text-sm space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Services proposés</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm text-muted-foreground">Documents</h3>
                  <div className="flex items-center text-sm space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Documents administratifs</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <ClipboardCheck className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-medium">Prochaine étape : Vérification</h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Votre profil sera vérifié par notre équipe dans les 24-48h ouvrées. 
                    Vous recevrez une notification par email lorsque votre compte sera validé.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/onboarding/artisan/documents")}
          >
            Retour
          </Button>
          
          {onboardingComplete ? (
            <Button onClick={() => router.push("/artisan")} variant="default">
              Accéder à mon espace
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalisation...
                </>
              ) : (
                "Terminer l'inscription"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
} 