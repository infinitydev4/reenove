"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CreditCard, Check, Star, Users, ArrowRight, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OnboardingLayout } from "../components/OnboardingLayout"
import { useOnboarding } from "../context/OnboardingContext"
import StripePaymentForm from "@/components/payment/StripePaymentForm"
import { toast } from "sonner"

interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  type: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  price: number
  stripeProductId: string | null
  stripePriceId: string | null
  features: string[]
  maxProjects: number | null
  maxRadius: number | null
  commissionRate: number | null
  isActive: boolean
  isPopular: boolean
  subscribersCount: number
}

export default function ArtisanPaymentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { 
    isLoading, 
    isSaving, 
    setIsSaving, 
    updateProgress, 
    goToNextStep,
    goToPreviousStep,
    silentMode, 
    setSilentMode 
  } = useOnboarding()

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [paymentStep, setPaymentStep] = useState<'selection' | 'payment' | 'processing'>('selection')
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [plansLoading, setPlansLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)

  // Animation d'entrée
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Vérifier l'abonnement existant et charger les plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPlansLoading(true)
        
        // Vérifier l'abonnement existant
        const subscriptionResponse = await fetch('/api/artisan/subscription', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json()
          if (subscriptionData.subscription) {
            if (subscriptionData.subscription.status === 'ACTIVE') {
              setHasActiveSubscription(true)
              console.log('✅ Abonnement actif détecté, permettre de passer l\'étape')
            } else if (subscriptionData.subscription.status === 'INCOMPLETE') {
              console.log('⚠️ Abonnement incomplet détecté, nettoyage en cours...')
              toast.info("Nettoyage de l'abonnement non payé précédent...")
              // Supprimer l'abonnement INCOMPLETE pour permettre un nouveau paiement
              await fetch('/api/artisan/subscription', {
                method: 'DELETE',
                headers: { 'Cache-Control': 'no-cache' }
              })
              console.log('✅ Abonnement incomplet supprimé, vous pouvez maintenant sélectionner un plan')
            }
          }
        }
        
        // Charger les plans d'abonnement
        const plansResponse = await fetch('/api/artisan/subscription-plans?active=true', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          setSubscriptionPlans(plansData.plans || [])
        } else {
          toast.error("Erreur lors du chargement des plans d'abonnement")
        }
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Erreur lors du chargement des données")
      } finally {
        setPlansLoading(false)
      }
    }

    if (!isLoading) {
      fetchData()
    }
  }, [isLoading])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BASIC':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
      case 'PREMIUM':
        return 'bg-[#FCDA89]/20 text-[#8B4513] border-[#FCDA89]'
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-950 dark:text-gray-300'
    }
  }

  const handlePlanSelection = async (plan: SubscriptionPlan) => {
    try {
      setIsSaving(true)
      setSelectedPlan(plan)
      
      // Créer uniquement l'intention de paiement (pas l'abonnement en base)
      const response = await fetch('/api/artisan/subscription/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          subscriptionPlanId: plan.id
        }),
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de l\'intention de paiement')
      }

      const data = await response.json()
      setPaymentClientSecret(data.paymentIntent?.client_secret || null)
      setPaymentIntentId(data.paymentIntent?.id || null)
      setPaymentStep('payment')
      
      console.log('💳 Intention de paiement créée, en attente du paiement...')
      
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || "Erreur lors de la sélection du plan")
      setSelectedPlan(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePaymentSuccess = async () => {
    try {
      setPaymentStep('processing')
      
      // Finaliser l'abonnement après paiement réussi
      if (!paymentIntentId) {
        throw new Error("ID de l'intention de paiement manquant")
      }

      const response = await fetch('/api/artisan/subscription/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId
        }),
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la finalisation de l\'abonnement')
      }

      const subscriptionData = await response.json()
      console.log('✅ Abonnement finalisé avec succès:', subscriptionData)
      
      // Activer le mode silencieux
      setSilentMode(true)
      
      // Mettre à jour la progression
      await updateProgress("payment")
      
      toast.success("Abonnement créé avec succès ! Paiement effectué.")
      
      // Passer à l'étape suivante
      goToNextStep("payment")
      
    } catch (error: any) {
      console.error("Erreur:", error)
      toast.error(error.message || "Erreur lors de la finalisation de l'abonnement")
      
      // Retourner à la sélection en cas d'erreur
      setPaymentStep('selection')
      setSelectedPlan(null)
      setPaymentClientSecret(null)
      setPaymentIntentId(null)
    } finally {
      setSilentMode(false)
    }
  }

  const handlePaymentError = (error: string) => {
    toast.error(error)
    setPaymentStep('selection')
    setSelectedPlan(null)
    setPaymentClientSecret(null)
    setPaymentIntentId(null)
  }

  const handleSkipPayment = async () => {
    try {
      setSilentMode(true)
      
      // Vérifier encore une fois qu'il y a bien un abonnement actif
      if (!hasActiveSubscription) {
        toast.error("Vous devez avoir un abonnement actif pour passer cette étape")
        return
      }
      
      await updateProgress("payment")
      toast.success("Étape abonnement terminée ! Abonnement actif confirmé.")
      goToNextStep("payment")
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la progression")
    } finally {
      setSilentMode(false)
    }
  }

  if (isLoading || plansLoading) {
    return (
      <OnboardingLayout currentStep="payment">
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Chargement des plans d&apos;abonnement...</p>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout currentStep="payment">
      <div className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <Card className="w-full max-w-6xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl md:text-3xl">
              {paymentStep === 'selection' && 'Choisissez votre plan d\'abonnement'}
              {paymentStep === 'payment' && 'Finaliser votre abonnement'}
              {paymentStep === 'processing' && 'Traitement en cours...'}
            </CardTitle>
            <CardDescription className="text-base md:text-lg max-w-2xl mx-auto">
              {paymentStep === 'selection' && 'Sélectionnez le plan qui correspond le mieux à vos besoins professionnels'}
              {paymentStep === 'payment' && `Plan sélectionné: ${selectedPlan?.name}`}
              {paymentStep === 'processing' && 'Nous finalisons votre inscription...'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentStep === 'selection' && (
              <>
                {hasActiveSubscription ? (
                  <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      ✅ Vous avez déjà un abonnement actif et payé ! Vous pouvez passer cette étape et continuer votre inscription.
                    </AlertDescription>
                  </Alert>
                ) : subscriptionPlans.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucun plan d&apos;abonnement n&apos;est actuellement disponible. Veuillez contacter notre support.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan) => (
                      <Card 
                        key={plan.id} 
                        className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
                          plan.isPopular ? 'ring-2 ring-primary shadow-lg' : ''
                        }`}
                        onClick={() => handlePlanSelection(plan)}
                      >
                        {plan.isPopular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground px-3 py-1">
                              <Star className="h-3 w-3 mr-1" />
                              Populaire
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="text-center pb-4">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <Badge variant="outline" className={getTypeColor(plan.type)}>
                              {plan.type}
                            </Badge>
                          </div>
                          
                          <div className="text-3xl font-bold text-primary">
                            {plan.price}€
                            <span className="text-sm font-normal text-muted-foreground">/mois</span>
                          </div>
                          
                          {plan.description && (
                            <CardDescription className="mt-2">
                              {plan.description}
                            </CardDescription>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>

                          {plan.maxProjects && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              Jusqu&apos;à {plan.maxProjects} projets/mois
                            </div>
                          )}

                          {plan.maxRadius && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <ArrowRight className="h-4 w-4" />
                              Rayon: {plan.maxRadius} km
                            </div>
                          )}
                        </CardContent>

                        <CardFooter>
                          <Button 
                            className="w-full" 
                            variant={plan.isPopular ? "default" : "outline"}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              "Choisir ce plan"
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {paymentStep === 'payment' && selectedPlan && paymentClientSecret && (
              <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      Plan sélectionné: {selectedPlan.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedPlan.price}€/mois - {selectedPlan.description}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <StripePaymentForm
                  clientSecret={paymentClientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  amount={selectedPlan.price}
                  currency="eur"
                  description={`Abonnement ${selectedPlan.name}`}
                />
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Finalisation en cours...</h3>
                <p className="text-muted-foreground">
                  Nous activons votre abonnement et finalisons votre inscription.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={() => goToPreviousStep("payment")}
              disabled={isSaving || paymentStep === 'processing'}
            >
              Retour
            </Button>
            
            {paymentStep === 'selection' && (subscriptionPlans.length === 0 || hasActiveSubscription) && (
              <Button 
                onClick={handleSkipPayment}
                disabled={isSaving}
              >
                {hasActiveSubscription ? 'Continuer avec abonnement existant' : 'Continuer sans abonnement'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </OnboardingLayout>
  )
} 