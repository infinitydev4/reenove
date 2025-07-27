"use client"

import { useState, useEffect } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ExpressBookingStatus, 
  TimeSlot, 
  BOOKING_STATUS_LABELS, 
  BOOKING_STATUS_COLORS,
  TIME_SLOT_LABELS 
} from "@/types/express"

// Interfaces
interface ExpressBooking {
  id: string
  serviceName: string
  serviceIcon?: string
  categoryName: string
  categoryIcon?: string
  clientName: string
  clientPhone: string
  clientEmail: string
  userId: string
  userName: string
  userEmail: string
  bookingDate: string
  timeSlot: TimeSlot
  price: number
  status: ExpressBookingStatus
  address: string
  city: string
  postalCode: string
  floor?: number
  hasElevator?: boolean
  notes?: string
  specialRequirements?: string
  assignedArtisan?: {
    id: string
    name: string
    phone?: string
    companyName?: string
    rating?: number
  }
  createdAt: string
  updatedAt: string
  confirmedAt?: string
  completedAt?: string
  assignedAt?: string
}

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  in_progress: number
  completed: number
  cancelled: number
  no_show: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Schéma de validation pour le formulaire de mise à jour
const updateSchema = z.object({
  status: z.nativeEnum(ExpressBookingStatus),
  assignedArtisanId: z.string().optional(),
  notes: z.string().optional(),
})

type UpdateFormValues = z.infer<typeof updateSchema>

export default function AdminExpressReservationsPage() {
  const { toast } = useToast()
  
  // États
  const [bookings, setBookings] = useState<ExpressBooking[]>([])
  const [stats, setStats] = useState<BookingStats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // Filtres et recherche
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Modal
  const [selectedBooking, setSelectedBooking] = useState<ExpressBooking | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showUpdate, setShowUpdate] = useState(false)
  
  // Formulaire de mise à jour
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
  })

  // Chargement des données
  const fetchBookings = async (page: number = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      })
      
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (searchQuery) params.append("search", searchQuery)
      
      const response = await fetch(`/api/admin/express-bookings?${params}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des réservations')
      
      const data = await response.json()
      setBookings(data.bookings || [])
      setStats(data.stats || null)
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 })
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Erreur lors du chargement des réservations",
      })
    } finally {
      setLoading(false)
    }
  }

  // Mise à jour d'une réservation
  const updateBooking = async (bookingId: string, data: Partial<UpdateFormValues>) => {
    setUpdating(bookingId)
    try {
      const response = await fetch(`/api/admin/express-bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }
      
      toast({
        title: "Succès",
        description: "Réservation mise à jour avec succès",
      })
      
      fetchBookings(pagination.page)
      setShowUpdate(false)
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setUpdating(null)
    }
  }

  // Formatage des données
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: ExpressBookingStatus) => {
    return (
      <Badge className={`${BOOKING_STATUS_COLORS[status]} border`}>
        {BOOKING_STATUS_LABELS[status]}
      </Badge>
    )
  }

  // Chargement initial et sur changement de filtres
  useEffect(() => {
    fetchBookings(1)
  }, [statusFilter, searchQuery, sortBy, sortOrder])

  // Actions sur les réservations
  const handleStatusChange = (bookingId: string, newStatus: ExpressBookingStatus) => {
    updateBooking(bookingId, { status: newStatus })
  }

  const handleShowDetails = (booking: ExpressBooking) => {
    setSelectedBooking(booking)
    setShowDetails(true)
  }

  const handleShowUpdate = (booking: ExpressBooking) => {
    setSelectedBooking(booking)
    form.reset({
      status: booking.status,
      assignedArtisanId: booking.assignedArtisan?.id || "",
      notes: booking.notes || "",
    })
    setShowUpdate(true)
  }

  const onSubmitUpdate = (values: UpdateFormValues) => {
    if (selectedBooking) {
      updateBooking(selectedBooking.id, values)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Réservations Express</h1>
          <p className="text-white/70">Gestion des services à prix fixe</p>
        </div>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card className="bg-white/5 border-[#FCDA89]/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-white/70">Total</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
              <div className="text-sm text-white/70">En attente</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-400">{stats.confirmed}</div>
              <div className="text-sm text-white/70">Confirmées</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-orange-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-400">{stats.in_progress}</div>
              <div className="text-sm text-white/70">En cours</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
              <div className="text-sm text-white/70">Terminées</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-red-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
              <div className="text-sm text-white/70">Annulées</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-gray-500/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-400">{stats.no_show}</div>
              <div className="text-sm text-white/70">Absences</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtres et recherche */}
      <Card className="bg-white/5 border-[#FCDA89]/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Rechercher par nom, email, téléphone, adresse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] bg-white/5 border-[#FCDA89]/20 text-white">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des réservations */}
      <Card className="bg-white/5 border-[#FCDA89]/20">
        <CardHeader>
          <CardTitle className="text-white">
            Réservations ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#FCDA89]" />
              <span className="ml-2 text-white/70">Chargement...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 text-white/70">
              Aucune réservation trouvée
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#FCDA89]/20">
                      <TableHead className="text-white/70">Service</TableHead>
                      <TableHead className="text-white/70">Client</TableHead>
                      <TableHead className="text-white/70">Date/Heure</TableHead>
                      <TableHead className="text-white/70">Prix</TableHead>
                      <TableHead className="text-white/70">Statut</TableHead>
                      <TableHead className="text-white/70">Artisan</TableHead>
                      <TableHead className="text-white/70">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="border-[#FCDA89]/10 hover:bg-white/5">
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{booking.serviceName}</div>
                            <div className="text-sm text-white/70">{booking.categoryName}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">{booking.clientName}</div>
                            <div className="text-sm text-white/70">{booking.clientPhone}</div>
                            <div className="text-sm text-white/70">{booking.city}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-medium text-white">
                              {new Date(booking.bookingDate).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-sm text-white/70">
                              {TIME_SLOT_LABELS[booking.timeSlot]}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-semibold text-[#FCDA89]">
                            {formatPrice(booking.price)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        
                        <TableCell>
                          {booking.assignedArtisan ? (
                            <div>
                              <div className="font-medium text-white">{booking.assignedArtisan.name}</div>
                              {booking.assignedArtisan.companyName && (
                                <div className="text-sm text-white/70">{booking.assignedArtisan.companyName}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-white/50">Non assigné</div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowDetails(booking)}
                              className="text-[#FCDA89] hover:bg-[#FCDA89]/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowUpdate(booking)}
                              className="text-blue-400 hover:bg-blue-400/10"
                              disabled={updating === booking.id}
                            >
                              {updating === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-white/70">
                    Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultats)
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchBookings(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="bg-white/5 border-[#FCDA89]/20 text-white hover:bg-[#FCDA89]/10"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchBookings(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="bg-white/5 border-[#FCDA89]/20 text-white hover:bg-[#FCDA89]/10"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal Détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-[#0E261C] border-[#FCDA89]/20 max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Détails de la réservation</DialogTitle>
            <DialogDescription className="text-white/70">
              Informations complètes de la réservation Express
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Service */}
              <div>
                <h3 className="font-semibold text-white mb-2">Service</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="font-medium text-white">{selectedBooking.serviceName}</div>
                  <div className="text-sm text-white/70">{selectedBooking.categoryName}</div>
                  <div className="text-lg font-semibold text-[#FCDA89] mt-2">
                    {formatPrice(selectedBooking.price)}
                  </div>
                </div>
              </div>

              {/* Informations client */}
              <div>
                <h3 className="font-semibold text-white mb-2">Client</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <strong className="text-white mr-2">Nom:</strong>
                    <span className="text-white/70">{selectedBooking.clientName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-white/70 mr-2" />
                    <span className="text-white/70">{selectedBooking.clientPhone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-white/70 mr-2" />
                    <span className="text-white/70">{selectedBooking.clientEmail}</span>
                  </div>
                </div>
              </div>

              {/* Date et heure */}
              <div>
                <h3 className="font-semibold text-white mb-2">Planification</h3>
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-white/70 mr-2" />
                    <span className="text-white/70">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-white/70 mr-2" />
                    <span className="text-white/70">{TIME_SLOT_LABELS[selectedBooking.timeSlot]}</span>
                  </div>
                </div>
              </div>

              {/* Adresse */}
              <div>
                <h3 className="font-semibold text-white mb-2">Adresse d'intervention</h3>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-white/70 mr-2 mt-0.5" />
                    <div className="text-white/70">
                      <div>{selectedBooking.address}</div>
                      <div>{selectedBooking.postalCode} {selectedBooking.city}</div>
                      {selectedBooking.floor && (
                        <div className="text-sm">Étage: {selectedBooking.floor}</div>
                      )}
                      {selectedBooking.hasElevator && (
                        <div className="text-sm">Ascenseur disponible</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statut et artisan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-white mb-2">Statut</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    {getStatusBadge(selectedBooking.status)}
                    <div className="text-sm text-white/70 mt-2">
                      Créé le {formatDate(selectedBooking.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">Artisan assigné</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    {selectedBooking.assignedArtisan ? (
                      <div>
                        <div className="font-medium text-white">{selectedBooking.assignedArtisan.name}</div>
                        {selectedBooking.assignedArtisan.companyName && (
                          <div className="text-sm text-white/70">{selectedBooking.assignedArtisan.companyName}</div>
                        )}
                        {selectedBooking.assignedArtisan.phone && (
                          <div className="text-sm text-white/70">{selectedBooking.assignedArtisan.phone}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-white/50">Aucun artisan assigné</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(selectedBooking.notes || selectedBooking.specialRequirements) && (
                <div>
                  <h3 className="font-semibold text-white mb-2">Notes</h3>
                  <div className="bg-white/5 rounded-lg p-4 space-y-2">
                    {selectedBooking.notes && (
                      <div>
                        <strong className="text-white">Notes client:</strong>
                        <p className="text-white/70 mt-1">{selectedBooking.notes}</p>
                      </div>
                    )}
                    {selectedBooking.specialRequirements && (
                      <div>
                        <strong className="text-white">Exigences particulières:</strong>
                        <p className="text-white/70 mt-1">{selectedBooking.specialRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Mise à jour */}
      <Dialog open={showUpdate} onOpenChange={setShowUpdate}>
        <DialogContent className="bg-[#0E261C] border-[#FCDA89]/20">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier la réservation</DialogTitle>
            <DialogDescription className="text-white/70">
              Changez le statut ou assignez un artisan
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Statut</Label>
              <Select 
                value={form.watch('status')} 
                onValueChange={(value) => form.setValue('status', value as ExpressBookingStatus)}
              >
                <SelectTrigger className="bg-white/5 border-[#FCDA89]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Notes admin (optionnel)</Label>
              <Input
                {...form.register('notes')}
                placeholder="Notes internes..."
                className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpdate(false)}
                className="bg-white/5 border-[#FCDA89]/20 text-white hover:bg-[#FCDA89]/10"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={updating !== null}
                className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  'Sauvegarder'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 