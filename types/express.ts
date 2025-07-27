// Types pour le système Reenove Express

export enum ExpressBookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum TimeSlot {
  MORNING_8_12 = 'MORNING_8_12',
  AFTERNOON_14_18 = 'AFTERNOON_14_18',
  EVENING_18_20 = 'EVENING_18_20',
  ALL_DAY = 'ALL_DAY',
}

// Interface pour un service Express
export interface ExpressService {
  id: string
  name: string
  description?: string
  expressDescription?: string
  slug: string
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

// Interface pour les services groupés par catégorie
export interface ServicesByCategory {
  category: {
    id: string
    name: string
    icon?: string
    slug: string
  }
  services: ExpressService[]
}

// Interface pour une réservation Express
export interface ExpressBooking {
  id: string
  userId: string
  serviceId: string
  
  // Détails de la réservation
  bookingDate: Date
  timeSlot: TimeSlot
  price: number
  
  // Informations client
  clientName: string
  clientPhone: string
  clientEmail: string
  
  // Localisation
  address: string
  city: string
  postalCode: string
  floor?: number
  hasElevator?: boolean
  
  // Détails supplémentaires
  notes?: string
  specialRequirements?: string
  
  // Gestion du statut
  status: ExpressBookingStatus
  
  // Gestion artisan assigné
  assignedArtisanId?: string
  assignedAt?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  confirmedAt?: Date
  completedAt?: Date
  
  // Relations (optionnelles pour l'affichage)
  service?: ExpressService
  assignedArtisan?: {
    id: string
    name: string
    phone?: string
    email?: string
    companyName?: string
    rating?: number
  }
}

// Interface pour créer une réservation Express
export interface CreateExpressBookingRequest {
  serviceId: string
  bookingDate: string // ISO string
  timeSlot: TimeSlot
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

// Interface pour mettre à jour une réservation Express
export interface UpdateExpressBookingRequest {
  status?: ExpressBookingStatus
  notes?: string
  specialRequirements?: string
}

// Interface pour la réponse de création de réservation
export interface CreateExpressBookingResponse {
  booking: {
    id: string
    serviceName: string
    categoryName: string
    bookingDate: Date
    timeSlot: TimeSlot
    price: number
    status: ExpressBookingStatus
    createdAt: Date
  }
}

// Interface pour la réponse de liste des réservations
export interface ExpressBookingListResponse {
  bookings: ExpressBookingListItem[]
  total: number
}

export interface ExpressBookingListItem {
  id: string
  serviceName: string
  categoryName: string
  categoryIcon?: string
  serviceIcon?: string
  bookingDate: Date
  timeSlot: TimeSlot
  price: number
  status: ExpressBookingStatus
  address: string
  city: string
  assignedArtisan?: {
    name: string
    phone?: string
  }
  createdAt: Date
  confirmedAt?: Date
}

// Interface pour les détails complets d'une réservation
export interface ExpressBookingDetails {
  id: string
  service: {
    id: string
    name: string
    description?: string
    expressDescription?: string
    icon?: string
    estimatedDuration?: number
    category: {
      id: string
      name: string
      icon?: string
    }
  }
  bookingDate: Date
  timeSlot: TimeSlot
  price: number
  status: ExpressBookingStatus
  clientInfo: {
    name: string
    phone: string
    email: string
  }
  location: {
    address: string
    city: string
    postalCode: string
    floor?: number
    hasElevator?: boolean
  }
  notes?: string
  specialRequirements?: string
  assignedArtisan?: {
    id: string
    name: string
    phone?: string
    email?: string
    companyName?: string
    rating?: number
  }
  timestamps: {
    createdAt: Date
    updatedAt: Date
    confirmedAt?: Date
    completedAt?: Date
    assignedAt?: Date
  }
}

// Interface pour la réponse des services Express
export interface ExpressServicesResponse {
  services: ExpressService[]
  servicesByCategory: ServicesByCategory[]
  totalServices: number
}

// Utilitaires de formatage
export interface ExpressFormattingUtils {
  formatPrice: (price: number) => string
  formatDuration: (minutes?: number) => string
  formatTimeSlot: (timeSlot: TimeSlot) => string
  formatStatus: (status: ExpressBookingStatus) => string
}

// Labels français pour les créneaux horaires
export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  [TimeSlot.MORNING_8_12]: '8h - 12h',
  [TimeSlot.AFTERNOON_14_18]: '14h - 18h',
  [TimeSlot.EVENING_18_20]: '18h - 20h',
  [TimeSlot.ALL_DAY]: 'Toute la journée',
}

// Labels français pour les statuts de réservation
export const BOOKING_STATUS_LABELS: Record<ExpressBookingStatus, string> = {
  [ExpressBookingStatus.PENDING]: 'En attente',
  [ExpressBookingStatus.CONFIRMED]: 'Confirmée',
  [ExpressBookingStatus.IN_PROGRESS]: 'En cours',
  [ExpressBookingStatus.COMPLETED]: 'Terminée',
  [ExpressBookingStatus.CANCELLED]: 'Annulée',
  [ExpressBookingStatus.NO_SHOW]: 'Client absent',
}

// Couleurs pour les statuts
export const BOOKING_STATUS_COLORS: Record<ExpressBookingStatus, string> = {
  [ExpressBookingStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  [ExpressBookingStatus.CONFIRMED]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  [ExpressBookingStatus.IN_PROGRESS]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  [ExpressBookingStatus.COMPLETED]: 'bg-green-500/20 text-green-400 border-green-500/30',
  [ExpressBookingStatus.CANCELLED]: 'bg-red-500/20 text-red-400 border-red-500/30',
  [ExpressBookingStatus.NO_SHOW]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}