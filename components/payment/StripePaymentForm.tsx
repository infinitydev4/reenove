"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CreditCard, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PaymentResult } from "@/types/stripe"

// Initialiser Stripe (côté client seulement)
const stripePromise = typeof window !== 'undefined' 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!) 
  : null

interface StripePaymentFormProps {
  clientSecret: string
  amount: number
  currency?: string
  description?: string
  onSuccess?: (paymentIntent: any) => void
  onError?: (error: string) => void
  submitButtonText?: string
  returnUrl?: string
}

function PaymentForm({ 
  amount, 
  currency = 'eur', 
  description,
  onSuccess, 
  onError,
  submitButtonText = "Payer",
  returnUrl 
}: Omit<StripePaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl || `${window.location.origin}/payment/success`,
          payment_method_data: {
            billing_details: {
              address: {
                country: 'FR', // Pays par défaut France
              }
            }
          }
        },
        redirect: 'if_required'
      })

      if (error) {
        console.error('❌ Erreur de paiement:', error)
        
        // Messages d'erreur personnalisés en français  
        let errorMessage = "Une erreur est survenue lors du paiement"
        
        if (error.type === 'card_error' || error.type === 'validation_error') {
          switch (error.code) {
            case 'card_declined':
              errorMessage = "Votre carte a été déclinée"
              break
            case 'insufficient_funds':
              errorMessage = "Fonds insuffisants sur votre carte"
              break
            case 'incorrect_cvc':
              errorMessage = "Code de sécurité incorrect"
              break
            case 'expired_card':
              errorMessage = "Votre carte a expiré"
              break
            case 'processing_error':
              errorMessage = "Erreur de traitement. Veuillez réessayer"
              break
            default:
              errorMessage = error.message || errorMessage
          }
        }

        toast.error(errorMessage)

        onError?.(errorMessage)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('✅ Paiement réussi:', paymentIntent.id)
        
        toast.success("Paiement réussi ! Votre paiement a été traité avec succès")

        onSuccess?.(paymentIntent)
      }
    } catch (err: any) {
      console.error('❌ Erreur inattendue:', err)
      const errorMessage = "Une erreur inattendue est survenue"
      
      toast.error(errorMessage)

      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-[#FCDA89]" />
          Paiement sécurisé
        </CardTitle>
        {description && (
          <p className="text-gray-600 text-sm">{description}</p>
        )}
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {amount} {currency.toUpperCase()}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <PaymentElement 
              options={{
                layout: 'tabs',
                terms: {
                  card: 'never'
                },
                fields: {
                  billingDetails: {
                    address: {
                      country: 'never'
                    }
                  }
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4" />
            <span>Vos informations de paiement sont sécurisées par Stripe</span>
          </div>

          <Button
            type="submit"
            disabled={!stripe || isLoading}
            className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  if (!stripePromise) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de configuration</h3>
          <p className="text-gray-600">Le système de paiement n&apos;est pas configuré correctement.</p>
        </CardContent>
      </Card>
    )
  }

  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#FCDA89',
        colorBackground: '#ffffff',
        colorText: '#0a0a0a',
        colorTextSecondary: '#6b7280',
        colorTextPlaceholder: '#9ca3af',
        colorDanger: '#dc2626',
        colorSuccess: '#16a34a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        spacingUnit: '4px',
        borderRadius: '6px',
        fontSizeBase: '14px',
        colorBorder: '#d1d5db',
        colorInputBackground: '#ffffff',
        colorInputBorder: '#d1d5db',
        colorInputText: '#0a0a0a',
        focusBoxShadow: '0 0 0 2px #FCDA89',
        focusOutline: 'none',
      },
      rules: {
        '.Input': {
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '14px',
          color: '#0a0a0a',
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
        },
        '.Input:focus': {
          borderColor: '#FCDA89',
          boxShadow: '0 0 0 2px rgba(252, 218, 137, 0.2)',
          outline: 'none',
        },
        '.Input::placeholder': {
          color: '#9ca3af',
        },
        '.Label': {
          color: '#374151',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px',
        },
        '.Error': {
          color: '#dc2626',
          fontSize: '12px',
        },
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} />
    </Elements>
  )
}