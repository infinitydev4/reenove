"use client"

import { useState, useEffect } from "react"
import { Search, Star, MapPin, CheckCircle, X, Loader2, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
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
import { toast } from "sonner"

interface Artisan {
  id: string
  name: string
  email: string
  phone: string
  speciality: string
  rating: string
  projectsCompleted: number
  currentProjects: number
  availability: string
  verified: boolean
  avatar: string
  address: string
}

interface ArtisanSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectTitle: string
  projectCategory?: string
  onAssignSuccess?: () => void
}

export default function ArtisanSelectionDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  projectCategory,
  onAssignSuccess
}: ArtisanSelectionDialogProps) {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [filteredArtisans, setFilteredArtisans] = useState<Artisan[]>([])
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  // Charger les artisans
  useEffect(() => {
    if (open) {
      fetchArtisans()
    }
  }, [open])

  // Filtrer les artisans
  useEffect(() => {
    let filtered = artisans

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(artisan =>
        artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artisan.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artisan.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par spécialité
    if (specialtyFilter !== "all") {
      filtered = filtered.filter(artisan =>
        artisan.speciality.toLowerCase().includes(specialtyFilter.toLowerCase())
      )
    }

    // Filtre par disponibilité
    if (availabilityFilter !== "all") {
      filtered = filtered.filter(artisan =>
        artisan.availability === availabilityFilter
      )
    }

    setFilteredArtisans(filtered)
  }, [artisans, searchTerm, specialtyFilter, availabilityFilter])

  const fetchArtisans = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/artisans')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des artisans')
      }
      const data = await response.json()
      setArtisans(data)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Impossible de charger les artisans')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignProject = async () => {
    if (!selectedArtisan) return

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artisanId: selectedArtisan.id
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de l\'attribution')
      }

      const result = await response.json()
      
      toast.success(`Projet attribué à ${selectedArtisan.name} avec succès`)
      
      // Réinitialiser et fermer
      setSelectedArtisan(null)
      setSearchTerm("")
      setSpecialtyFilter("all")
      setAvailabilityFilter("all")
      onOpenChange(false)
      
      // Callback de succès
      if (onAssignSuccess) {
        onAssignSuccess()
      }

    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Impossible d\'attribuer le projet')
    } finally {
      setIsAssigning(false)
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "disponible":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Disponible</Badge>
      case "occupé":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Occupé</Badge>
      case "indisponible":
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">Indisponible</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const uniqueSpecialties = Array.from(new Set(artisans.map(a => a.speciality)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#0E261C] border-[#FCDA89]/20">
        <DialogHeader>
          <DialogTitle className="text-white">
            Attribuer le projet à un artisan
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Sélectionnez un artisan pour le projet "{projectTitle}"
            {projectCategory && ` dans la catégorie ${projectCategory}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Rechercher un artisan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50 pl-10"
                />
              </div>
            </div>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-[#FCDA89]/20 text-white">
                <SelectValue placeholder="Spécialité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes spécialités</SelectItem>
                {uniqueSpecialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-[#FCDA89]/20 text-white">
                <SelectValue placeholder="Disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="occupé">Occupé</SelectItem>
                <SelectItem value="indisponible">Indisponible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des artisans */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FCDA89]" />
              </div>
            ) : filteredArtisans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/70">Aucun artisan trouvé</p>
              </div>
            ) : (
              filteredArtisans.map(artisan => (
                <Card 
                  key={artisan.id} 
                  className={`cursor-pointer transition-all ${
                    selectedArtisan?.id === artisan.id 
                      ? 'bg-[#FCDA89]/20 border-[#FCDA89] ring-2 ring-[#FCDA89]/50' 
                      : 'bg-white/5 border-[#FCDA89]/20 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedArtisan(artisan)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={artisan.avatar} alt={artisan.name} />
                        <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                          {artisan.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white truncate">
                              {artisan.name}
                            </h3>
                            {artisan.verified && (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            )}
                          </div>
                          {selectedArtisan?.id === artisan.id && (
                            <UserCheck className="h-5 w-5 text-[#FCDA89]" />
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <p className="text-white/70">{artisan.speciality}</p>
                          <div className="flex items-center gap-4 text-white/60">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{artisan.rating}</span>
                            </div>
                            <span>{artisan.projectsCompleted} projets</span>
                            <span>{artisan.currentProjects} en cours</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {getAvailabilityBadge(artisan.availability)}
                            <div className="flex items-center gap-1 text-white/60">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{artisan.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="bg-white/5 border-[#FCDA89]/20 text-white hover:bg-white/10"
          >
            Annuler
          </Button>
          <Button
            onClick={handleAssignProject}
            disabled={!selectedArtisan || isAssigning}
            className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Attribution en cours...
              </>
            ) : (
              selectedArtisan ? `Attribuer à ${selectedArtisan.name}` : 'Sélectionner un artisan'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 