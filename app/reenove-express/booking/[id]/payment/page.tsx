"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import StripePaymentForm from "@/components/payment/StripePaymentForm"
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Calendar,
  Euro,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { TimeSlot, TIME_SLOT_LABELS } from "@/types/express"

interface ExpressBooking {
  id: string
  serviceName: string
  categoryName: string
  clientName: string
  clientPhone: string
  clientEmail: string
  address: string
  city: string
  postalCode: string
  bookingDate: string
  timeSlot: string
  price: number
  status: string
  floor?: number
  hasElevator?: boolean
  notes?: string
  specialRequirements?: string
}

interface PaymentData {
  paymentIntent: {
    id: string
    client_secret: string
    amount: number
    currency: string
  }
  customer_id: string
  payment_id: string
}



export default function ExpressPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  
  const [booking, setBooking] = useState<ExpressBooking | null>(null)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingPayment, setCreatingPayment] = useState(false)

  const bookingId = params.id as string

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/express/bookings/${bookingId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement')
      }

      const data = await response.json()
      setBooking(data.booking)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const createPaymentIntent = async () => {
    try {
      setCreatingPayment(true)
      setError(null)

      const response = await fetch(`/api/express/bookings/${bookingId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/reenove-express/booking/${bookingId}/success`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du paiement')
      }

      const data = await response.json()
      setPaymentData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du paiement')
    } finally {
      setCreatingPayment(false)
    }
  }

  const handlePaymentSuccess = (paymentIntent: any) => {
    console.log("✅ Paiement réussi:", paymentIntent)
    router.push(`/reenove-express/booking/${bookingId}/success`)
  }

  const handlePaymentError = (error: string) => {
    setError(`Erreur de paiement: ${error}`)
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} €`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89] mx-auto mb-4"></div>
          <p className="text-white/70">Chargement de la réservation...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Réservation non trouvée'}</p>
          <Button variant="outline" asChild className="border-[#FCDA89]/30 text-[#FCDA89]">
            <Link href="/reenove-express">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux services
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-white/70 hover:text-white mb-4">
            <Link href={`/reenove-express/booking/${bookingId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la réservation
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Paiement de votre réservation
              </h1>
              <p className="text-white/70">
                Finalisez le paiement de votre service Express
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Récapitulatif */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="text-white">Récapitulatif de la réservation</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Service */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">{booking.serviceName}</h3>
                  <p className="text-white/70 text-sm">{booking.categoryName}</p>
                  {booking.status === 'PENDING' && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                      En attente de paiement
                    </Badge>
                  )}
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                {/* Date et heure */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Date d'intervention</span>
                  </div>
                  <p className="text-white font-medium">
                    {formatDate(booking.bookingDate)}
                  </p>
                  <p className="text-white/80 text-sm">
                                         {TIME_SLOT_LABELS[booking.timeSlot as TimeSlot]}
                  </p>
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                {/* Adresse */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">Adresse d'intervention</span>
                  </div>
                  <div className="text-white text-sm">
                    <p>{booking.address}</p>
                    <p>{booking.postalCode} {booking.city}</p>
                    {booking.floor && (
                      <p>Étage: {booking.floor} {booking.hasElevator ? '(avec ascenseur)' : '(sans ascenseur)'}</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                {/* Client */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Informations client</span>
                  </div>
                  <div className="text-white text-sm space-y-1">
                    <p>{booking.clientName}</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{booking.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />  
                      <span>{booking.clientEmail}</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#FCDA89]/20" />

                {/* Prix */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/70">
                    <Euro className="h-4 w-4" />
                    <span>Prix total</span>
                  </div>
                  <div className="text-2xl font-bold text-[#FCDA89]">
                    {formatPrice(booking.price)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Paiement */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Paiement sécurisé</CardTitle>
                <CardDescription className="text-white/70">
                  Vos informations de paiement sont protégées par Stripe
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!paymentData ? (
                  <div className="text-center py-8">
                    <Button 
                      onClick={createPaymentIntent}
                      disabled={creatingPayment}
                      className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold px-8 py-3"
                    >
                      {creatingPayment ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Préparation du paiement...
                        </>
                      ) : (
                        <>
                          <Euro className="mr-2 h-5 w-5" />
                          Procéder au paiement · {formatPrice(booking.price)}
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold">Paiement sécurisé</span>
                      </div>
                      <p className="text-green-300 text-sm">
                        Vos données bancaires sont cryptées et sécurisées par Stripe
                      </p>
                    </div>

                    <StripePaymentForm
                      clientSecret={paymentData.paymentIntent.client_secret}
                      amount={booking.price}
                      currency="eur"
                      description={`Service Express: ${booking.serviceName}`}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      submitButtonText={`Payer ${formatPrice(booking.price)}`}
                      returnUrl={`${window.location.origin}/reenove-express/booking/${bookingId}/success`}
                    />
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">Erreur</span>
                    </div>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 