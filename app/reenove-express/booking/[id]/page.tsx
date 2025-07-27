"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Clock, 
  Euro, 
  MapPin, 
  Phone, 
  Mail, 
  User,
  Loader2,
  Check,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TimeSlot, TIME_SLOT_LABELS } from "@/types/express"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

interface ExpressService {
  id: string
  name: string
  description?: string
  expressDescription?: string
  icon?: string
  price: number
  estimatedDuration?: number
  isPopular: boolean
  category: {
    id: string
    name: string
    icon?: string
    slug: string
  }
}

interface BookingFormData {
  clientName: string
  clientPhone: string
  clientEmail: string
  address: string
  city: string
  postalCode: string
  floor?: number
  hasElevator?: boolean
  notes?: string
  specialRequirements?: string
}

export default function ServiceBookingPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [service, setService] = useState<ExpressService | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // État du formulaire
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined)
  const [formData, setFormData] = useState<BookingFormData>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    address: '',
    city: '',
    postalCode: '',
    floor: undefined,
    hasElevator: false,
    notes: '',
    specialRequirements: '',
  })

  const serviceId = params.id as string

  useEffect(() => {
    if (serviceId) {
      fetchServiceDetails()
    }
  }, [serviceId])

  // Pré-remplir avec les données utilisateur
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        clientName: session.user.name || '',
        clientEmail: session.user.email || '',
      }))
    }
  }, [session])

  const fetchServiceDetails = async () => {
    try {
      const response = await fetch('/api/express/services')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du service')
      }
      
      const data = await response.json()
      const foundService = data.services.find((s: ExpressService) => s.id === serviceId)
      
      if (!foundService) {
        throw new Error('Service non trouvé')
      }
      
      setService(foundService)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Durée variable'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
  }

  const isFormValid = () => {
    return selectedDate && 
           selectedTimeSlot && 
           formData.clientName.trim() &&
           formData.clientPhone.trim() &&
           formData.clientEmail.trim() &&
           formData.address.trim() &&
           formData.city.trim() &&
           formData.postalCode.trim()
  }

  const handleSubmit = async () => {
    if (!isFormValid() || !service || !selectedDate || !selectedTimeSlot) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
      })
      return
    }

    if (status !== "authenticated") {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Vous devez être connecté pour effectuer une réservation",
      })
      router.push('/auth')
      return
    }

    setSubmitting(true)

    try {
      const bookingData = {
        serviceId: service.id,
        bookingDate: selectedDate.toISOString(),
        timeSlot: selectedTimeSlot,
        ...formData,
      }

      const response = await fetch('/api/express/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la réservation')
      }

      const result = await response.json()

      toast({
        title: "Réservation confirmée !",
        description: `Votre réservation pour ${service.name} a été enregistrée.`,
      })

      // Rediriger vers une page de confirmation ou le dashboard
      router.push(`/client/projets`)
      
    } catch (err: any) {
      console.error('Erreur réservation:', err)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la réservation",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Fonction pour désactiver les dates passées
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89] mx-auto mb-4"></div>
          <p className="text-white/70">Chargement du service...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Service non trouvé'}</p>
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
            <Link href="/reenove-express">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux services
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Réservation Express
              </h1>
              <p className="text-white/70">
                Finalisez votre réservation en quelques clics
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Détails du service */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{service.name}</CardTitle>
                  {service.isPopular && (
                    <Badge className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                      Populaire
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-white/70">
                  {service.category.name}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {service.expressDescription && (
                  <p className="text-white/80 text-sm">
                    {service.expressDescription}
                  </p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                      <Euro className="h-4 w-4" />
                      <span>Prix fixe</span>
                    </div>
                    <div className="text-2xl font-bold text-[#FCDA89]">
                      {formatPrice(service.price)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white/70">
                      <Clock className="h-4 w-4" />
                      <span>Durée estimée</span>
                    </div>
                    <div className="text-white">
                      {formatDuration(service.estimatedDuration)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Formulaire de réservation */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Informations de réservation</CardTitle>
                <CardDescription className="text-white/70">
                  Choisissez votre créneau et renseignez vos coordonnées
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                                 {/* Sélection de date */}
                 <div className="space-y-3">
                   <Label className="text-white">Date souhaitée *</Label>
                   <div className="w-full flex justify-center">
                     <Calendar
                       mode="single"
                       selected={selectedDate}
                       onSelect={setSelectedDate}
                       disabled={isDateDisabled}
                       className="rounded-md border border-[#FCDA89]/20 bg-white/5 text-white w-full"
                       classNames={{
                         months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                         month: "space-y-4 w-full",
                         caption: "flex justify-center pt-1 relative items-center text-white",
                         caption_label: "text-sm font-medium text-white",
                         nav: "space-x-1 flex items-center",
                         nav_button: cn(
                           "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10 border border-[#FCDA89]/20"
                         ),
                         nav_button_previous: "absolute left-1",
                         nav_button_next: "absolute right-1",
                         table: "w-full border-collapse space-y-1",
                         head_row: "flex w-full",
                         head_cell: "text-white/70 rounded-md font-normal text-sm flex-1 text-center py-2",
                         row: "flex w-full mt-2",
                         cell: "relative p-1 text-center text-sm focus-within:relative focus-within:z-20 flex-1",
                         day: cn(
                           "h-12 w-full p-0 font-normal text-white hover:bg-[#FCDA89]/20 hover:text-[#FCDA89] rounded-md transition-colors flex items-center justify-center"
                         ),
                         day_selected: "bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89] hover:text-[#0E261C] focus:bg-[#FCDA89] focus:text-[#0E261C] font-semibold",
                         day_today: "bg-white/10 text-white font-medium",
                         day_outside: "text-white/30 aria-selected:bg-[#FCDA89]/50 aria-selected:text-[#0E261C]",
                         day_disabled: "text-white/20 opacity-50 cursor-not-allowed",
                         day_range_middle: "aria-selected:bg-[#FCDA89]/20 aria-selected:text-[#FCDA89]",
                         day_hidden: "invisible",
                       }}
                     />
                   </div>
                 </div>

                {/* Sélection du créneau */}
                <div className="space-y-3">
                  <Label className="text-white">Créneau horaire *</Label>
                  <Select 
                    value={selectedTimeSlot} 
                    onValueChange={(value) => setSelectedTimeSlot(value as TimeSlot)}
                  >
                    <SelectTrigger className="bg-white/5 border-[#FCDA89]/20 text-white">
                      <SelectValue placeholder="Choisissez un créneau" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TIME_SLOT_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Informations client */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Vos coordonnées
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName" className="text-white">Nom complet *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                        placeholder="Votre nom et prénom"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone" className="text-white">Téléphone *</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                        className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail" className="text-white">Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                      placeholder="votre.email@exemple.com"
                    />
                  </div>
                </div>

                {/* Adresse d'intervention */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Adresse d&apos;intervention
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">Adresse complète *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                      placeholder="123 rue de la République"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">Ville *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                        placeholder="Paris"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="text-white">Code postal *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                        placeholder="75001"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="floor" className="text-white">Étage (optionnel)</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.floor || ''}
                        onChange={(e) => handleInputChange('floor', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                        placeholder="3"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Checkbox
                        id="hasElevator"
                        checked={formData.hasElevator}
                        onCheckedChange={(checked) => handleInputChange('hasElevator', checked === true)}
                        className="border-[#FCDA89]/20 data-[state=checked]:bg-[#FCDA89] data-[state=checked]:text-[#0E261C]"
                      />
                      <Label htmlFor="hasElevator" className="text-white">
                        Ascenseur disponible
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Notes et exigences */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-white">Notes pour l&apos;artisan (optionnel)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50 resize-none h-20"
                      placeholder="Informations complémentaires sur votre demande..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialRequirements" className="text-white">Exigences particulières (optionnel)</Label>
                    <Textarea
                      id="specialRequirements"
                      value={formData.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50 resize-none h-20"
                      placeholder="Contraintes d'accès, matériel spécifique, etc."
                    />
                  </div>
                </div>

                {/* Bouton de soumission */}
                <div className="pt-6 border-t border-[#FCDA89]/20">
                  <Button
                    onClick={handleSubmit}
                    disabled={!isFormValid() || submitting}
                    className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold text-lg py-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Réservation en cours...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-5 w-5" />
                        Confirmer la réservation · {formatPrice(service.price)}
                      </>
                    )}
                  </Button>
                  
                  <p className="text-center text-white/60 text-sm mt-3">
                    Vous recevrez une confirmation par email et SMS
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 