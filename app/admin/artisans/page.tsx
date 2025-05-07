"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  Check, 
  Download, 
  Filter,
  MoreHorizontal, 
  Search, 
  SlidersHorizontal, 
  Trash2,
  Users,
  MessageSquare,
  FileText,
  Eye,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CircleDollarSign,
  Hammer,
  BadgeCheck,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Type pour un artisan
type Artisan = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: string
  speciality: string
  rating: number
  projectsCompleted: number
  currentProjects: number
  totalEarnings: string
  availability: string
  startDate: string
  avatar: string
  verified: boolean
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED"
}

// Liste des spécialités 
const specialities = [
  "Plomberie",
  "Électricité",
  "Maçonnerie",
  "Peinture",
  "Menuiserie",
  "Carrelage"
]

export default function AdminArtisansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedSpeciality, setSelectedSpeciality] = useState<string | null>(null)
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null)
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null)
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [uniqueSpecialities, setUniqueSpecialities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les artisans depuis l'API
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/artisans')
        
        if (!response.ok) {
          throw new Error(`Erreur: ${response.status}`)
        }
        
        const data = await response.json()
        setArtisans(data)
        
        // Extraire les spécialités uniques des artisans
        const specialities = data
          .map((artisan: Artisan) => artisan.speciality)
          .filter((spec: string) => spec && spec !== "Non spécifié")
        
        // Éliminer les doublons et trier par ordre alphabétique
        const uniqueSpecialities = Array.from(new Set(specialities)) as string[];
        setUniqueSpecialities(uniqueSpecialities.sort())
        
        setError(null)
      } catch (err) {
        console.error("Erreur lors du chargement des artisans:", err)
        setError("Impossible de charger les artisans. Veuillez réessayer plus tard.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtisans()
  }, [])

  // Filtrer les artisans selon les critères
  const filteredArtisans = artisans.filter(artisan => {
    // Filtre de recherche
    const matchesSearch = 
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      artisan.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      artisan.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtre par statut
    const matchesStatus = selectedStatus ? artisan.status === selectedStatus : true
    
    // Filtre par spécialité
    const matchesSpeciality = selectedSpeciality ? artisan.speciality === selectedSpeciality : true
    
    // Filtre par disponibilité
    const matchesAvailability = selectedAvailability ? artisan.availability === selectedAvailability : true
    
    // Filtre par vérification
    const matchesVerification = selectedVerification ? artisan.verificationStatus === selectedVerification : true
    
    return matchesSearch && matchesStatus && matchesSpeciality && matchesAvailability && matchesVerification
  })
  
  const handleDeleteArtisan = async (artisanId: string) => {
    // Confirmation avant suppression
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet artisan ?")) {
      return
    }
    
    try {
      // Dans une vraie application, une requête API serait effectuée pour supprimer l'artisan
      // await fetch(`/api/admin/artisans/${artisanId}`, { method: 'DELETE' })
      
      // Pour le moment, juste une mise à jour locale
      setArtisans(artisans.filter(artisan => artisan.id !== artisanId))
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      alert("Erreur lors de la suppression de l'artisan.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif":
        return <Badge className="bg-green-500">Actif</Badge>
      case "inactif":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactif</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "disponible":
        return <Badge className="bg-green-500">Disponible</Badge>
      case "occupé":
        return <Badge className="bg-amber-500">Occupé</Badge>
      case "indisponible":
        return <Badge variant="outline" className="border-red-500 text-red-500">Indisponible</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getVerificationBadge = (verificationStatus?: string) => {
    switch (verificationStatus) {
      case "VERIFIED":
        return <Badge className="bg-green-500">Vérifié</Badge>
      case "REJECTED":
        return <Badge className="bg-red-500">Rejeté</Badge>
      case "PENDING":
      default:
        return <Badge className="bg-amber-500">En attente</Badge>
    }
  }

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        <span className="font-medium mr-1">{rating}</span>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "h-3 w-3", 
                i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : 
                i < rating ? "fill-amber-400/50 text-amber-400/50" : "text-gray-300"
              )} 
            />
          ))}
        </div>
      </div>
    )
  }

  // Calculer les totaux pour les cartes récapitulatives
  const totalArtisans = artisans.length
  const activeArtisans = artisans.filter(a => a.status === "actif").length
  const totalCurrentProjects = artisans.reduce((sum, a) => sum + a.currentProjects, 0)
  const totalCompletedProjects = artisans.reduce((sum, a) => sum + a.projectsCompleted, 0)
  const totalEarnings = artisans.reduce((sum, a) => {
    const value = parseInt(a.totalEarnings.replace("€", "").replace(" ", ""))
    return sum + value
  }, 0)
  const averageRating = artisans.length > 0 
    ? (artisans.reduce((sum, a) => sum + Number(a.rating), 0) / artisans.length).toFixed(1)
    : "0.0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Artisans</h1>
          <p className="text-muted-foreground">
            Gérez tous les artisans partenaires de la plateforme.
          </p>
        </div>
        <Button>
          <Hammer className="mr-2 h-4 w-4" />
          Ajouter un artisan
        </Button>
      </div>

      {/* Vue d'ensemble des artisans */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des artisans
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalArtisans}</div>
                <p className="text-xs text-muted-foreground">
                  {activeArtisans} artisans actifs
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projets en cours
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalCurrentProjects}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sur {totalCompletedProjects} projets complétés
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d&apos;affaires généré
            </CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {totalEarnings.toLocaleString()}€
                </div>
                <p className="text-xs text-muted-foreground">
                  Note moyenne: {averageRating}/5
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom, email, téléphone..."
                className="w-full pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Statut
                    {selectedStatus && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par statut</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedStatus && "font-bold")}
                    onClick={() => setSelectedStatus(null)}
                  >
                    Tous
                    {!selectedStatus && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "actif" && "font-bold")}
                    onClick={() => setSelectedStatus("actif")}
                  >
                    Actifs
                    {selectedStatus === "actif" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "inactif" && "font-bold")}
                    onClick={() => setSelectedStatus("inactif")}
                  >
                    Inactifs
                    {selectedStatus === "inactif" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Spécialité
                    {selectedSpeciality && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par spécialité</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedSpeciality && "font-bold")}
                    onClick={() => setSelectedSpeciality(null)}
                  >
                    Toutes
                    {!selectedSpeciality && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  {uniqueSpecialities.map(speciality => (
                    <DropdownMenuItem 
                      key={speciality}
                      className={cn("flex items-center gap-2 cursor-pointer", selectedSpeciality === speciality && "font-bold")}
                      onClick={() => setSelectedSpeciality(speciality)}
                    >
                      {speciality}
                      {selectedSpeciality === speciality && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Disponibilité
                    {selectedAvailability && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par disponibilité</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedAvailability && "font-bold")}
                    onClick={() => setSelectedAvailability(null)}
                  >
                    Toutes
                    {!selectedAvailability && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedAvailability === "disponible" && "font-bold")}
                    onClick={() => setSelectedAvailability("disponible")}
                  >
                    Disponible
                    {selectedAvailability === "disponible" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedAvailability === "occupé" && "font-bold")}
                    onClick={() => setSelectedAvailability("occupé")}
                  >
                    Occupé
                    {selectedAvailability === "occupé" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedAvailability === "indisponible" && "font-bold")}
                    onClick={() => setSelectedAvailability("indisponible")}
                  >
                    Indisponible
                    {selectedAvailability === "indisponible" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Vérification
                    {selectedVerification && <Badge className="ml-2 bg-primary/20 text-primary">1</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrer par vérification</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", !selectedVerification && "font-bold")}
                    onClick={() => setSelectedVerification(null)}
                  >
                    Toutes
                    {!selectedVerification && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedVerification === "VERIFIED" && "font-bold")}
                    onClick={() => setSelectedVerification("VERIFIED")}
                  >
                    Vérifiées
                    {selectedVerification === "VERIFIED" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedVerification === "REJECTED" && "font-bold")}
                    onClick={() => setSelectedVerification("REJECTED")}
                  >
                    Rejetées
                    {selectedVerification === "REJECTED" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedVerification === "PENDING" && "font-bold")}
                    onClick={() => setSelectedVerification("PENDING")}
                  >
                    En attente
                    {selectedVerification === "PENDING" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={() => {
                setSearchQuery("")
                setSelectedStatus(null)
                setSelectedSpeciality(null)
                setSelectedAvailability(null)
                setSelectedVerification(null)
              }}>
                Réinitialiser
              </Button>
              
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artisan</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Spécialité</TableHead>
                  <TableHead className="hidden lg:table-cell">Activité</TableHead>
                  <TableHead className="hidden lg:table-cell">Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Affichage de squelettes de chargement
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-9 w-9 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-2 w-full" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredArtisans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun artisan ne correspond aux critères de recherche
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArtisans.map((artisan) => (
                    <TableRow key={artisan.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={artisan.avatar} alt={artisan.name} />
                            <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center">
                              <Link 
                                href={`/admin/artisans/${artisan.id}`}
                                className="font-medium hover:underline"
                              >
                                {artisan.name}
                              </Link>
                              {artisan.verified && (
                                <BadgeCheck className="h-4 w-4 ml-1 text-blue-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{artisan.id.substring(0, 8)}...</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {getStatusBadge(artisan.status)}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                {getVerificationBadge(artisan.verificationStatus)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{artisan.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>{artisan.phone}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[200px]">{artisan.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-2">
                          <Badge variant="outline" className="border-purple-500 text-purple-500">
                            {artisan.speciality}
                          </Badge>
                          <div>
                            {getAvailabilityBadge(artisan.availability)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">{artisan.projectsCompleted}</span> projets complétés
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{artisan.currentProjects}</span> projets en cours
                          </div>
                          <div className="text-sm font-medium">
                            Gains totaux: {artisan.totalEarnings}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-2">
                          <div className="text-sm flex items-center">
                            <CalendarDays className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span>Depuis: {artisan.startDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderRating(artisan.rating)}
                          </div>
                          <div className="w-full">
                            <Progress 
                              value={Math.min(artisan.projectsCompleted * 2, 100)} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/artisans/${artisan.id}`} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" />
                                Voir profil
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/artisans/${artisan.id}/edit`} className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Modifier
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/artisans/${artisan.id}/projets`} className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                Projets
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/artisans/${artisan.id}/messages`} className="flex items-center">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Messages
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleDeleteArtisan(artisan.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <p className="text-sm text-muted-foreground">
              Affichage de {filteredArtisans.length} sur {artisans.length} artisans
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 