"use client"

import { useState, useEffect } from "react"
import { Search, UserCheck, MapPin, Star, Filter, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface Artisan {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  address?: string
  speciality?: string
  rating?: string
  projectsCompleted?: number
  availability?: string
  verified?: boolean
  verificationStatus?: string
  avatar?: string
}

interface ExpressBooking {
  id: string
  serviceName: string
  categoryName: string
  clientName: string
  bookingDate: string
  city: string
}

interface ArtisanSelectionDialogProps {
  booking: ExpressBooking | null
  open: boolean
  onClose: () => void
  onAssignSuccess: () => void
}

export default function ArtisanSelectionDialog({
  booking,
  open,
  onClose,
  onAssignSuccess
}: ArtisanSelectionDialogProps) {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("")
  const [availabilityFilter, setAvailabilityFilter] = useState("available")
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null)

  // Charger les artisans
  const fetchArtisans = async () => {
    if (!open) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (specialtyFilter) params.append("specialty", specialtyFilter)
      if (availabilityFilter) params.append("availability", availabilityFilter)

      const response = await fetch(`/api/admin/artisans?${params}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des artisans")

      const data = await response.json()
      // L'API retourne directement un tableau d'artisans
      setArtisans(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Impossible de charger les artisans")
    } finally {
      setLoading(false)
    }
  }

  // Attribuer la réservation à un artisan
  const handleAssign = async () => {
    if (!selectedArtisan || !booking) return

    setAssigning(true)
    try {
      const response = await fetch(`/api/admin/express-bookings/${booking.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artisanId: selectedArtisan.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de l'attribution")
      }

      toast.success(`Réservation attribuée avec succès à ${selectedArtisan.name}`)
      onAssignSuccess()
      onClose()
    } catch (error: any) {
      console.error("Erreur lors de l'attribution:", error)
      toast.error(error.message || "Erreur lors de l'attribution")
    } finally {
      setAssigning(false)
    }
  }

  // Charger les artisans quand le dialog s'ouvre ou les filtres changent
  useEffect(() => {
    fetchArtisans()
  }, [open, searchQuery, specialtyFilter, availabilityFilter])

  // Reset sélection quand on change de réservation
  useEffect(() => {
    setSelectedArtisan(null)
    setSearchQuery("")
    setSpecialtyFilter("")
  }, [booking])



  const getVerificationBadge = (status?: string) => {
    const badges = {
      VERIFIED: { label: "Vérifié", color: "bg-green-500/20 text-green-300 border-green-500/30" },
      PENDING: { label: "En cours", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
      REJECTED: { label: "Rejeté", color: "bg-red-500/20 text-red-300 border-red-500/30" },
    }
    
    const badge = badges[(status || 'PENDING') as keyof typeof badges] || badges.PENDING
    return (
      <Badge className={`${badge.color} border text-xs`}>
        {badge.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0E261C] border-[#FCDA89]/20 max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white">Attribuer un artisan</DialogTitle>
          <DialogDescription className="text-white/70">
            {booking && (
              <>Sélectionnez un artisan pour la réservation "{booking.serviceName}" du {new Date(booking.bookingDate).toLocaleDateString('fr-FR')}</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Filtres */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Rechercher un artisan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[200px] bg-white/5 border-[#FCDA89]/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="all">Tous</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Liste des artisans */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#FCDA89]" />
              <span className="ml-2 text-white/70">Chargement des artisans...</span>
            </div>
          ) : artisans.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              Aucun artisan trouvé
            </div>
          ) : (
            <div className="space-y-3">
              {artisans.map((artisan) => (
                <Card
                  key={artisan.id}
                  className={`cursor-pointer transition-all bg-white/5 border-[#FCDA89]/20 hover:bg-white/10 ${
                    selectedArtisan?.id === artisan.id
                      ? "ring-2 ring-[#FCDA89] bg-[#FCDA89]/10"
                      : ""
                  }`}
                  onClick={() => setSelectedArtisan(artisan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={artisan.avatar} />
                        <AvatarFallback className="bg-[#FCDA89]/10 text-[#FCDA89]">
                          {artisan.name?.charAt(0) || "A"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white truncate">
                              {artisan.name}
                            </h3>
                            <p className="text-sm text-white/60">
                              {artisan.email}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {artisan.verificationStatus && 
                              getVerificationBadge(artisan.verificationStatus)
                            }
                            {selectedArtisan?.id === artisan.id && (
                              <UserCheck className="h-5 w-5 text-[#FCDA89]" />
                            )}
                          </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-4 text-sm text-white/70">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {artisan.rating || "Nouveau"}
                          </div>
                          
                          <div>
                            {artisan.projectsCompleted || 0} projets
                          </div>
                          
                          {artisan.city && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {artisan.city}
                            </div>
                          )}
                        </div>

                        {/* Spécialité */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {artisan.speciality && (
                            <Badge
                              className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                            >
                              {artisan.speciality}
                            </Badge>
                          )}
                        </div>

                        {/* Statut de disponibilité */}
                        <div className="mt-2">
                          <Badge 
                            className={
                              artisan.availability === "disponible"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-red-500/20 text-red-300 border-red-500/30"
                            }
                          >
                            {artisan.availability === "disponible" ? "Disponible" : "Indisponible"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-white/5 border-[#FCDA89]/20 text-white hover:bg-[#FCDA89]/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedArtisan || assigning}
            className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
          >
            {assigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Attribution...
              </>
            ) : (
              "Attribuer la réservation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 