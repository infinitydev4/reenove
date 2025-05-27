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
  Star,
  X,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { FilterDrawer, FilterGroup } from "@/components/admin/FilterDrawer"

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
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | null>>({
    status: null,
    speciality: null, 
    availability: null, 
    verification: null
  })
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [uniqueSpecialities, setUniqueSpecialities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupération des filtres individuels pour retrocompatibilité avec le code existant
  const selectedStatus = selectedFilters.status
  const selectedSpeciality = selectedFilters.speciality
  const selectedAvailability = selectedFilters.availability
  const selectedVerification = selectedFilters.verification

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

  // Définition des groupes de filtres
  const filterGroups: FilterGroup[] = [
    {
      id: "status",
      title: "Statut",
      options: [
        { id: "all", label: "Tous", value: null as any },
        { id: "active", label: "Actifs", value: "actif" },
        { id: "inactive", label: "Inactifs", value: "inactif" }
      ]
    },
    {
      id: "verification",
      title: "Vérification",
      options: [
        { id: "all-verif", label: "Toutes", value: null as any },
        { id: "verified", label: "Vérifiées", value: "VERIFIED" },
        { id: "pending", label: "En attente", value: "PENDING" },
        { id: "rejected", label: "Rejetées", value: "REJECTED" }
      ]
    },
    {
      id: "availability",
      title: "Disponibilité",
      options: [
        { id: "all-avail", label: "Toutes", value: null as any },
        { id: "available", label: "Disponible", value: "disponible" },
        { id: "busy", label: "Occupé", value: "occupé" },
        { id: "unavailable", label: "Indisponible", value: "indisponible" }
      ]
    },
    {
      id: "speciality",
      title: "Spécialité",
      options: [
        { id: "all-spec", label: "Toutes", value: null as any },
        ...uniqueSpecialities.map(spec => ({
          id: spec.toLowerCase().replace(/\s+/g, '-'),
          label: spec,
          value: spec
        }))
      ]
    }
  ];

  // Fonction pour changer un filtre
  const handleFilterChange = (groupId: string, value: string | null) => {
    setSelectedFilters(prev => ({
      ...prev,
      [groupId]: value
    }));
  };

  // Fonction pour réinitialiser tous les filtres
  const handleResetFilters = () => {
    setSelectedFilters({
      status: null,
      speciality: null,
      availability: null,
      verification: null
    });
    setSearchQuery("");
  };

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Artisans</h1>
          <p className="text-white/70">
            Gérez tous les artisans partenaires de la plateforme.
          </p>
        </div>
        <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold">
          <Hammer className="mr-2 h-4 w-4" />
          Ajouter un artisan
        </Button>
      </div>

      {/* Vue d'ensemble des artisans - Optimisée pour mobile */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-9 w-12 my-2" />
            ) : (
              <>
                <span className="text-2xl md:text-4xl font-bold text-blue-400">{totalArtisans}</span>
                <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">Artisans</span>
                <span className="text-[10px] md:text-xs text-green-400 mt-0.5 md:mt-1">{activeArtisans} actifs</span>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-9 w-12 my-2" />
            ) : (
              <>
                <span className="text-2xl md:text-4xl font-bold text-amber-400">{totalCurrentProjects}</span>
                <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">Projets</span>
                <span className="text-[10px] md:text-xs text-green-400 mt-0.5 md:mt-1">{totalCompletedProjects} terminés</span>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-2 md:p-4 flex flex-col items-center justify-center">
            {isLoading ? (
              <Skeleton className="h-9 w-12 my-2" />
            ) : (
              <>
                <span className="text-2xl md:text-4xl font-bold text-green-400">{totalEarnings.toLocaleString()}€</span>
                <span className="text-[10px] md:text-xs text-white/70 mt-1 md:mt-2 text-center">CA</span>
                <div className="flex items-center text-[10px] md:text-xs text-amber-400 mt-0.5 md:mt-1">
                  <Star className="h-3 w-3 mr-1 fill-amber-400" />
                  <span>{averageRating}/5</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche avec bouton pour ouvrir le drawer de filtres */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Rechercher par nom, email, téléphone..."
            className="w-full pl-9 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        {/* FilterDrawer pour desktop */}
        <FilterDrawer
          title="Filtres"
          description="Filtrez les artisans selon différents critères"
          side="right"
          className="hidden md:block"
          trigger={
                      <Button variant="outline" size="icon" className="h-9 w-9 hidden md:flex bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Filter className="h-4 w-4" />
          </Button>
          }
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        
        {/* FilterDrawer pour mobile */}
        <FilterDrawer
          title="Filtres"
          description="Filtrez les artisans selon différents critères"
          side="bottom"
          isMobile={true}
          trigger={
                      <Button variant="outline" size="icon" className="h-9 w-9 md:hidden bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Filter className="h-4 w-4" />
          </Button>
          }
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        
        {/* Indicateurs de filtres actifs */}
        {(selectedStatus || selectedSpeciality || selectedAvailability || selectedVerification) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden sm:inline-flex gap-1 h-9"
            onClick={handleResetFilters}
          >
            <X className="h-3.5 w-3.5" />
            Réinitialiser
          </Button>
        )}
        
        <Button variant="outline" size="icon" className="h-9 w-9 bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
          <Download className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Affichage des filtres actifs */}
      {(selectedStatus || selectedSpeciality || selectedAvailability || selectedVerification) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/70">Filtres actifs:</span>
          {selectedStatus && (
            <Badge variant="secondary" className="h-6 gap-1">
              Statut: {selectedStatus === "actif" ? "Actif" : "Inactif"}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handleFilterChange("status", null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {selectedSpeciality && (
            <Badge variant="secondary" className="h-6 gap-1">
              Spécialité: {selectedSpeciality}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handleFilterChange("speciality", null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {selectedAvailability && (
            <Badge variant="secondary" className="h-6 gap-1">
              Disponibilité: {selectedAvailability}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handleFilterChange("availability", null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {selectedVerification && (
            <Badge variant="secondary" className="h-6 gap-1">
              Vérification: {
                selectedVerification === "VERIFIED" ? "Vérifié" : 
                selectedVerification === "PENDING" ? "En attente" : 
                "Rejeté"
              }
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-3 w-3 p-0 ml-1"
                onClick={() => handleFilterChange("verification", null)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
              <Input
                type="search"
                placeholder="Rechercher par nom, email, téléphone..."
                className="w-full pl-9 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
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
                    onClick={() => handleFilterChange("status", null)}
                  >
                    Tous
                    {!selectedStatus && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "actif" && "font-bold")}
                    onClick={() => handleFilterChange("status", "actif")}
                  >
                    Actifs
                    {selectedStatus === "actif" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedStatus === "inactif" && "font-bold")}
                    onClick={() => handleFilterChange("status", "inactif")}
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
                    onClick={() => handleFilterChange("speciality", null)}
                  >
                    Toutes
                    {!selectedSpeciality && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  {uniqueSpecialities.map(speciality => (
                    <DropdownMenuItem 
                      key={speciality}
                      className={cn("flex items-center gap-2 cursor-pointer", selectedSpeciality === speciality && "font-bold")}
                      onClick={() => handleFilterChange("speciality", speciality)}
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
                    onClick={() => handleFilterChange("availability", null)}
                  >
                    Toutes
                    {!selectedAvailability && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedAvailability === "disponible" && "font-bold")}
                    onClick={() => handleFilterChange("availability", "disponible")}
                  >
                    Disponible
                    {selectedAvailability === "disponible" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedAvailability === "occupé" && "font-bold")}
                    onClick={() => handleFilterChange("availability", "occupé")}
                  >
                    Occupé
                    {selectedAvailability === "occupé" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedAvailability === "indisponible" && "font-bold")}
                    onClick={() => handleFilterChange("availability", "indisponible")}
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
                    onClick={() => handleFilterChange("verification", null)}
                  >
                    Toutes
                    {!selectedVerification && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedVerification === "VERIFIED" && "font-bold")}
                    onClick={() => handleFilterChange("verification", "VERIFIED")}
                  >
                    Vérifiées
                    {selectedVerification === "VERIFIED" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedVerification === "REJECTED" && "font-bold")}
                    onClick={() => handleFilterChange("verification", "REJECTED")}
                  >
                    Rejetées
                    {selectedVerification === "REJECTED" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className={cn("flex items-center gap-2 cursor-pointer", selectedVerification === "PENDING" && "font-bold")}
                    onClick={() => handleFilterChange("verification", "PENDING")}
                  >
                    En attente
                    {selectedVerification === "PENDING" && <Check className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
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
                                className="font-medium hover:underline text-[#FCDA89]"
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
                          <div className="flex items-center text-sm text-white">
                            <Mail className="mr-2 h-3 w-3 text-[#FCDA89]" />
                            <span>{artisan.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-white">
                            <Phone className="mr-2 h-3 w-3 text-[#FCDA89]" />
                            <span>{artisan.phone}</span>
                          </div>
                          <div className="flex items-center text-sm text-white">
                            <MapPin className="mr-2 h-3 w-3 text-[#FCDA89]" />
                            <span className="truncate max-w-[200px]">{artisan.address}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-2">
                          <Badge variant="outline" className="border-[#FCDA89] text-[#FCDA89]">
                            {artisan.speciality}
                          </Badge>
                          <div>
                            {getAvailabilityBadge(artisan.availability)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1">
                          <div className="text-sm text-white">
                            <span className="font-medium">{artisan.projectsCompleted}</span> projets complétés
                          </div>
                          <div className="text-sm text-white">
                            <span className="font-medium">{artisan.currentProjects}</span> projets en cours
                          </div>
                          <div className="text-sm font-medium text-white">
                            Gains totaux: {artisan.totalEarnings}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-2">
                          <div className="text-sm flex items-center text-white">
                            <CalendarDays className="mr-2 h-3 w-3 text-[#FCDA89]" />
                            <span>Depuis: {artisan.startDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-white">
                            {renderRating(artisan.rating)}
                          </div>
                          <div className="w-full">
                            <Progress 
                              value={Math.min(artisan.projectsCompleted * 2, 100)} 
                              className="h-2 bg-[#FCDA89]" 
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4 text-[#FCDA89]" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-99">
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