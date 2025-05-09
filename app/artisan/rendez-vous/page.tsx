"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  User,
  Search,
  Filter,
  CheckCircle,
  X,
  MoreHorizontal,
  CalendarPlus,
  ChevronFirst,
  ChevronLast
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Appointment } from "@/types/artisan"

export default function ArtisanRendezVousPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">("week")
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1)
  const [currentPastPage, setCurrentPastPage] = useState(1)
  const appointmentsPerPage = 4
  
  // Jours de la semaine en français
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
  
  // Noms des mois en français
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]

  // Données fictives pour les rendez-vous
  const appointments: Appointment[] = [
    {
      id: "rdv-001",
      title: "Visite technique",
      client: {
        name: "Pierre Durand",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      address: "15 Rue du Commerce, Lyon",
      date: "2024-05-15",
      startTime: "10:00",
      endTime: "12:00",
      status: "confirmed",
      project: "Rénovation salle de bain"
    },
    {
      id: "rdv-002",
      title: "Devis sur place",
      client: {
        name: "Isabelle Blanc",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      address: "7 Avenue des Fleurs, Villeurbanne",
      date: "2024-05-16",
      startTime: "14:30",
      endTime: "16:00",
      status: "confirmed",
      project: "Installation cuisine"
    },
    {
      id: "rdv-003",
      title: "Livraison matériaux",
      client: {
        name: "Thomas Leroy",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      address: "22 Rue Centrale, Caluire",
      date: "2024-05-18",
      startTime: "09:00",
      endTime: "10:30",
      status: "confirmed",
      project: "Réparation terrasse"
    },
    {
      id: "rdv-004",
      title: "Finalisation travaux",
      client: {
        name: "Marie Dubois",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      address: "3 Avenue Berthelot, Lyon",
      date: "2024-05-19",
      startTime: "13:00",
      endTime: "17:00",
      status: "pending",
      project: "Isolation combles"
    },
    {
      id: "rdv-005",
      title: "Consultation initiale",
      client: {
        name: "Jean Martin",
        avatar: "/placeholder.svg?height=40&width=40"
      },
      address: "45 Rue de la République, Lyon",
      date: "2024-05-20",
      startTime: "11:00",
      endTime: "12:00",
      status: "pending",
      project: "Nouvelle salle de bain"
    }
  ]

  // Format de date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = date.getDate()
    const month = months[date.getMonth()]
    return `${day} ${month}`
  }
  
  // Obtenir le jour du mois
  const getDayOfMonth = (dateString: string) => {
    return new Date(dateString).getDate()
  }
  
  // Obtenir le jour de la semaine
  const getDayOfWeek = (dateString: string) => {
    return weekDays[new Date(dateString).getDay()]
  }

  // Filtrer les rendez-vous en fonction du terme de recherche
  const filteredAppointments = appointments.filter(appointment => 
    appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appointment.project.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Obtenir les rendez-vous à venir (aujourd'hui et futurs)
  const today = new Date().toISOString().split('T')[0]
  
  const upcomingAppointments = filteredAppointments.filter(appointment => 
    appointment.date >= today
  ).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  
  // Obtenir les rendez-vous passés
  const pastAppointments = filteredAppointments.filter(appointment => 
    appointment.date < today
  ).sort((a, b) => b.date.localeCompare(a.date))

  // Pagination
  const totalUpcomingPages = Math.ceil(upcomingAppointments.length / appointmentsPerPage)
  const totalPastPages = Math.ceil(pastAppointments.length / appointmentsPerPage)
  
  const paginatedUpcomingAppointments = upcomingAppointments.slice(
    (currentUpcomingPage - 1) * appointmentsPerPage,
    currentUpcomingPage * appointmentsPerPage
  )
  
  const paginatedPastAppointments = pastAppointments.slice(
    (currentPastPage - 1) * appointmentsPerPage,
    currentPastPage * appointmentsPerPage
  )

  // Navigation entre les mois
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const goToNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  // Navigation temporelle selon la vue actuelle
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (currentView === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (currentView === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  // Obtenir les jours de la semaine actuelle
  const getDaysInWeek = () => {
    const date = new Date(currentDate)
    const day = date.getDay() || 7 // 0 = Dimanche, 1-6 = Lundi-Samedi
    
    // Aller au début de la semaine (lundi)
    date.setDate(date.getDate() - day + 1)
    
    const days = []
    
    // Ajouter les 7 jours de la semaine
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(date)
      dayDate.setDate(date.getDate() + i)
      
      days.push({
        day: dayDate.getDate(),
        month: dayDate.getMonth(),
        year: dayDate.getFullYear(),
        date: dayDate,
        isCurrentMonth: dayDate.getMonth() === currentDate.getMonth()
      })
    }
    
    return days
  }

  // Générer les jours du mois actuel pour la vue mensuelle
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay() || 7 // 0 = Dimanche, 1-6 = Lundi-Samedi
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Ajouter les jours du mois précédent pour compléter la première semaine
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDay - 1; i > 0; i--) {
      days.push({
        day: prevMonthDays - i + 1,
        month: month - 1,
        year,
        isCurrentMonth: false
      })
    }
    
    // Ajouter les jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      })
    }
    
    // Ajouter les jours du mois suivant pour compléter la dernière semaine
    const remainingDays = 7 - (days.length % 7 || 7)
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: month + 1,
        year,
        isCurrentMonth: false
      })
    }
    
    return days
  }

  // Vérifier si un jour a des rendez-vous
  const hasAppointmentsOnDay = (day: number, month: number, year: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return appointments.some(appointment => appointment.date === dateStr)
  }

  // Détermine les heures de la journée à afficher
  const getHoursOfDay = () => {
    return Array.from({ length: 13 }, (_, i) => i + 8) // 8h à 20h
  }

  // Composant pour afficher une carte de rendez-vous
  const AppointmentCard = ({ appointment }: { appointment: typeof appointments[number] }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-1.5 ${appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-sm">{appointment.title}</h3>
            <div className="flex items-center gap-1 mt-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={appointment.client.avatar} alt={appointment.client.name} />
                <AvatarFallback>{appointment.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground">{appointment.client.name}</p>
            </div>
          </div>
          <Badge variant="outline" className={`${
            appointment.status === 'confirmed' 
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
              : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
          } text-xs`}>
            {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
          </Badge>
        </div>
        
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{appointment.startTime} - {appointment.endTime}</span>
          </div>
          <div className="flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 mt-0.5" />
            <span>{appointment.address}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">{appointment.project}</span>
          
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
              Détails
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem>Modifier</DropdownMenuItem>
                <DropdownMenuItem>Rappel</DropdownMenuItem>
                <DropdownMenuItem>Confirmer</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">Annuler</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Pagination component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange 
  }: { 
    currentPage: number, 
    totalPages: number, 
    onPageChange: (page: number) => void 
  }) => {
    if (totalPages <= 1) return null
    
    return (
      <Card className="border-t shadow-sm">
        <CardContent className="p-2">
          <div className="flex items-center justify-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => onPageChange(1)} 
              disabled={currentPage === 1}
            >
              <ChevronFirst className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => onPageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            
            <span className="text-xs px-2">
              Page {currentPage} sur {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => onPageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => onPageChange(totalPages)} 
              disabled={currentPage === totalPages}
            >
              <ChevronLast className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre et bouton nouveau */}
      <div className="flex justify-between items-center h-10 mb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Rendez-vous
        </h1>
        
        <Button size="sm" className="h-8 px-3 py-0" asChild>
          <Link href="/artisan/rendez-vous/nouveau">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouveau
          </Link>
        </Button>
      </div>

      {/* Barre de recherche et filtre */}
      <div className="flex mb-3 h-9">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un rendez-vous..."
            className="pl-9 pr-12 rounded-r-none h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Conteneur principal */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
        {/* Calendrier */}
        <div className="md:w-64 lg:w-72 md:order-1 order-1 flex-shrink-0">
          <Card className="h-full md:h-[400px] flex flex-col overflow-hidden">
            <CardHeader className="py-2 px-3">
              <div className="flex items-center justify-between">
                <Select value={currentView} onValueChange={(value: "day" | "week" | "month") => setCurrentView(value)}>
                  <SelectTrigger className="w-[100px] h-8 text-xs">
                    <SelectValue placeholder="Vue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Jour</SelectItem>
                    <SelectItem value="week">Semaine</SelectItem>
                    <SelectItem value="month">Mois</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-center font-medium mt-1 text-sm">
                {currentView === "day" 
                  ? `${currentDate.getDate()} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : currentView === "week" 
                    ? `Semaine du ${getDaysInWeek()[0].day} ${months[getDaysInWeek()[0].month]}`
                    : `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                }
              </div>
            </CardHeader>
            <CardContent className="p-2 flex-1 overflow-y-auto">              
              {currentView === "month" && (
                <>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {weekDays.map((day, i) => (
                      <div key={i} className="text-xs text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth().map((day, i) => {
                      const isToday = 
                        day.day === new Date().getDate() && 
                        day.month === new Date().getMonth() && 
                        day.year === new Date().getFullYear()
                      
                      const hasAppointments = hasAppointmentsOnDay(day.day, day.month, day.year)
                      
                      return (
                        <button
                          key={i}
                          className={`aspect-square flex flex-col items-center justify-center text-xs rounded-md relative
                            ${day.isCurrentMonth ? '' : 'text-muted-foreground/50'}
                            ${isToday ? 'bg-primary text-primary-foreground' : hasAppointments && day.isCurrentMonth ? 'bg-primary/10' : 'hover:bg-muted'}
                          `}
                        >
                          {day.day}
                          {hasAppointments && !isToday && day.isCurrentMonth && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </>
              )}
              
              {currentView === "week" && (
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {getDaysInWeek().map((day, i) => {
                      const isToday = 
                        day.day === new Date().getDate() && 
                        day.month === new Date().getMonth() && 
                        day.year === new Date().getFullYear()
                      
                      return (
                        <div key={i} className="flex flex-col items-center">
                          <div className="text-xs text-muted-foreground">
                            {weekDays[i]}
                          </div>
                          <div className={`mt-1 flex items-center justify-center w-7 h-7 rounded-full text-xs
                            ${isToday ? 'bg-primary text-primary-foreground' : day.isCurrentMonth ? '' : 'text-muted-foreground/50'}
                          `}>
                            {day.day}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="space-y-1 mt-2 flex-1 overflow-y-auto">
                    {getHoursOfDay().map((hour) => {
                      // Trouver les rendez-vous à cette heure
                      const hourAppointments = appointments.filter(appointment => {
                        const appointmentDate = new Date(appointment.date)
                        const appointmentHour = parseInt(appointment.startTime.split(':')[0])
                        
                        // Vérifier si le rendez-vous est dans la semaine actuelle
                        const weekDays = getDaysInWeek()
                        const isInCurrentWeek = weekDays.some(day => 
                          day.day === appointmentDate.getDate() && 
                          day.month === appointmentDate.getMonth() && 
                          day.year === appointmentDate.getFullYear()
                        )
                        
                        return isInCurrentWeek && appointmentHour === hour
                      })
                      
                      return (
                        <div key={hour} className="grid grid-cols-[25px_1fr] gap-1">
                          <div className="text-xs text-muted-foreground">
                            {hour}h
                          </div>
                          <div className={`h-6 rounded-l-sm pl-1 flex items-center text-xs ${
                            hourAppointments.length > 0 ? 'bg-primary/10 text-primary-foreground' : 'bg-muted/30'
                          }`}>
                            {hourAppointments.length > 0 && (
                              <span className="truncate">
                                {hourAppointments[0].title} {hourAppointments.length > 1 && `+${hourAppointments.length - 1}`}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {currentView === "day" && (
                <div className="flex flex-col h-full">
                  <div className="flex justify-center mb-2">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm
                      bg-primary text-primary-foreground
                    `}>
                      {currentDate.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-2 flex-1 overflow-y-auto">
                    {getHoursOfDay().map((hour) => {
                      // Trouver les rendez-vous à cette heure
                      const hourAppointments = appointments.filter(appointment => {
                        const appointmentDate = new Date(appointment.date)
                        const appointmentHour = parseInt(appointment.startTime.split(':')[0])
                        
                        return appointmentDate.getDate() === currentDate.getDate() && 
                               appointmentDate.getMonth() === currentDate.getMonth() && 
                               appointmentDate.getFullYear() === currentDate.getFullYear() && 
                               appointmentHour === hour
                      })
                      
                      return (
                        <div key={hour} className="grid grid-cols-[25px_1fr] gap-1">
                          <div className="text-xs text-muted-foreground">
                            {hour}h
                          </div>
                          <div className={`p-1 min-h-[40px] rounded-l-sm pl-1 flex flex-col justify-center text-xs ${
                            hourAppointments.length > 0 ? 'bg-primary/10' : 'bg-muted/30'
                          }`}>
                            {hourAppointments.map((appointment, idx) => (
                              <div key={idx} className="flex items-center gap-1 py-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  appointment.status === 'confirmed' ? 'bg-green-500' : 'bg-orange-500'
                                }`}></div>
                                <span className="truncate">{appointment.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-2 justify-center">
              <Button className="w-full h-8" size="sm" variant="outline" asChild>
                <Link href="/artisan/rendez-vous/nouveau">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Nouveau rendez-vous
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Liste des rendez-vous */}
        <div className="md:flex-1 order-2 md:order-2 min-h-0 flex-1 flex flex-col mb-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="py-2 px-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm">Mes rendez-vous</CardTitle>
                  <CardDescription className="text-xs">
                    {filteredAppointments.length} rendez-vous au total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 overflow-hidden flex-1">
              <Tabs defaultValue="upcoming" className="h-full flex flex-col">
                <TabsList className="w-full grid grid-cols-2 h-8 mb-2 p-0.5">
                  <TabsTrigger value="upcoming" className="relative text-xs py-1">
                    À venir
                    {upcomingAppointments.length > 0 && (
                      <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5">
                        {upcomingAppointments.length > 9 ? '9+' : upcomingAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="past" className="relative text-xs py-1">
                    Passés
                    {pastAppointments.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5">
                        {pastAppointments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-0 flex-1 overflow-auto pr-1 space-y-3 relative pb-12">
                  {upcomingAppointments.length > 0 ? (
                    <>
                      {paginatedUpcomingAppointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                      <div className="absolute bottom-0 left-0 right-0">
                        <PaginationControls 
                          currentPage={currentUpcomingPage} 
                          totalPages={totalUpcomingPages} 
                          onPageChange={setCurrentUpcomingPage}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Calendar className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-medium mb-2">Aucun rendez-vous à venir</h3>
                      <p className="text-muted-foreground text-sm max-w-md">
                        Vous n&apos;avez pas de rendez-vous programmés. Planifiez une visite ou consultez vos rendez-vous passés.
                      </p>
                      <Button className="mt-4" size="sm" asChild>
                        <Link href="/artisan/rendez-vous/nouveau">
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Planifier un rendez-vous
                        </Link>
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past" className="mt-0 flex-1 overflow-auto pr-1 space-y-3 relative pb-12">
                  {pastAppointments.length > 0 ? (
                    <>
                      {paginatedPastAppointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                      <div className="absolute bottom-0 left-0 right-0">
                        <PaginationControls 
                          currentPage={currentPastPage} 
                          totalPages={totalPastPages} 
                          onPageChange={setCurrentPastPage}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="rounded-full bg-muted p-3 mb-3">
                        <Clock className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-base font-medium mb-2">Aucun rendez-vous passé</h3>
                      <p className="text-muted-foreground text-sm max-w-md">
                        Votre historique de rendez-vous est vide. Les rendez-vous passés apparaîtront ici.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 