"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  Euro,
  MessageSquare,
  Home,
  Download,
  Clock,
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

interface PaymentInfo {
  id: string
  amount: number
  currency: string
  status: string
  paidAt: string
  description: string
}



export default function PaymentSuccessPage() {
  const params = useParams()
  const { data: session } = useSession()
  
  const [booking, setBooking] = useState<ExpressBooking | null>(null)
  const [payment, setPayment] = useState<PaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bookingId = params.id as string

  useEffect(() => {
    fetchBookingAndPaymentDetails()
  }, [bookingId])

  const fetchBookingAndPaymentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/express/bookings/${bookingId}/payment`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors du chargement')
      }

      const data = await response.json()
      setBooking(data.booking)
      
      // Récupérer le dernier paiement réussi
      const successfulPayment = data.payments.find((p: any) => p.status === 'SUCCEEDED')
      if (successfulPayment) {
        setPayment(successfulPayment)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89] mx-auto mb-4"></div>
          <p className="text-white/70">Vérification du paiement...</p>
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
              <Home className="mr-2 h-4 w-4" />
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
        {/* Header avec animation de succès */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse"></div>
            <CheckCircle className="h-12 w-12 text-green-400 relative z-10" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Paiement confirmé !
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Votre réservation a été confirmée et votre paiement a été traité avec succès. 
            Un artisan Reenove vous contactera sous 24h pour confirmer l&apos;intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Détails de la réservation */}
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Détails de votre réservation</CardTitle>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Confirmée
                </Badge>
              </div>
              <CardDescription className="text-white/70">
                Référence: #{booking.id.slice(0, 8).toUpperCase()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Service */}
              <div className="space-y-2">
                <h3 className="font-semibold text-white text-lg">{booking.serviceName}</h3>
                <p className="text-white/70">{booking.categoryName}</p>
              </div>

              <Separator className="bg-[#FCDA89]/20" />

              {/* Date et heure */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/70">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Date et créneau d&apos;intervention</span>
                </div>
                <div className="pl-7 space-y-1">
                  <p className="text-white font-medium text-lg">
                    {formatDate(booking.bookingDate)}
                  </p>
                  <p className="text-white/80">
                                         {TIME_SLOT_LABELS[booking.timeSlot as TimeSlot]}
                  </p>
                </div>
              </div>

              <Separator className="bg-[#FCDA89]/20" />

              {/* Adresse */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Adresse d&apos;intervention</span>
                </div>
                <div className="pl-7 text-white space-y-1">
                  <p>{booking.address}</p>
                  <p>{booking.postalCode} {booking.city}</p>
                  {booking.floor && (
                    <p className="text-white/80 text-sm">
                      Étage: {booking.floor} {booking.hasElevator ? '(avec ascenseur)' : '(sans ascenseur)'}
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-[#FCDA89]/20" />

              {/* Contact */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/70">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Informations de contact</span>
                </div>
                <div className="pl-7 text-white space-y-2">
                  <p className="font-medium">{booking.clientName}</p>
                  <div className="flex items-center gap-2 text-white/80">
                    <Phone className="h-4 w-4" />
                    <span>{booking.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Mail className="h-4 w-4" />  
                    <span>{booking.clientEmail}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails du paiement et prochaines étapes */}
          <div className="space-y-8">
            {/* Récapitulatif paiement */}
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Récapitulatif du paiement
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white/70">Montant payé</span>
                  <span className="text-[#FCDA89] font-bold text-xl">
                    {formatPrice(booking.price)}
                  </span>
                </div>
                
                {payment && (
                  <>
                    <Separator className="bg-[#FCDA89]/20" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Statut</span>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Payé
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Date du paiement</span>
                        <span className="text-white">{formatDateTime(payment.paidAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Méthode</span>
                        <span className="text-white">Carte bancaire</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Prochaines étapes */}
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prochaines étapes
                </CardTitle>
                <CardDescription className="text-white/70">
                  Que va-t-il se passer maintenant ?
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FCDA89] text-[#0E261C] flex items-center justify-center text-sm font-bold mt-1">
                      1
                    </div>
                    <div>
                      <p className="text-white font-medium">Confirmation immédiate</p>
                      <p className="text-white/70 text-sm">
                        Vous recevrez un email et SMS de confirmation dans les prochaines minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FCDA89] text-[#0E261C] flex items-center justify-center text-sm font-bold mt-1">
                      2
                    </div>
                    <div>
                      <p className="text-white font-medium">Contact artisan</p>
                      <p className="text-white/70 text-sm">
                        Un artisan Reenove qualifié vous contactera sous 24h pour finaliser les détails
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#FCDA89] text-[#0E261C] flex items-center justify-center text-sm font-bold mt-1">
                      3
                    </div>
                    <div>
                      <p className="text-white font-medium">Intervention</p>
                      <p className="text-white/70 text-sm">
                        L&apos;artisan interviendra à la date et au créneau choisis
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <Button 
                asChild
                className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
              >
                <Link href="/client/projets">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Suivre ma réservation
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                className="border-[#FCDA89]/30 text-[#FCDA89] hover:bg-[#FCDA89]/10"
              >
                <Link href="/reenove-express">
                  <Home className="mr-2 h-4 w-4" />
                  Nouvelle réservation Express
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Section d'aide */}
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm max-w-4xl mx-auto mt-12">
          <CardContent className="text-center py-8">
            <h3 className="text-white font-semibold text-lg mb-2">Besoin d&apos;aide ?</h3>
            <p className="text-white/70 mb-4">
              Notre équipe support est disponible pour vous accompagner
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" className="border-[#FCDA89]/30 text-[#FCDA89]">
                <Phone className="mr-2 h-4 w-4" />
                01 23 45 67 89
              </Button>
              <Button variant="outline" className="border-[#FCDA89]/30 text-[#FCDA89]">
                <Mail className="mr-2 h-4 w-4" />
                support@reenove.fr
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 