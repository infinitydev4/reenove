"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Heart, 
  Search, 
  Star, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Filter,
  ChevronRight,
  MoreHorizontal,
  Trash2
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Artisan {
  id: string
  name: string
  avatar: string
  specialities: string[]
  rating: number
  reviews: number
  location: string
  description: string
  distance?: string
  disponible: boolean
  favorisDepuis?: string
  favoriteId: string
  addedAt: Date
}

export default function FavorisPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [artisanToRemove, setArtisanToRemove] = useState<Artisan | null>(null)
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [removingFavorite, setRemovingFavorite] = useState(false)

  // Vérifier l'authentification
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/client/favoris")
      return
    }
  }, [status, router])

  // Charger les favoris depuis l'API
  useEffect(() => {
    const fetchFavorites = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/client/favorites')
          if (response.ok) {
            const data = await response.json()
            setArtisans(data.favorites || [])
          } else {
            console.error('Erreur lors du chargement des favoris')
            setArtisans([])
          }
        } catch (error) {
          console.error('Erreur lors du chargement des favoris:', error)
          setArtisans([])
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchFavorites()
  }, [session?.user])

  // Obtenir toutes les spécialités uniques pour le filtre
  const allSpecialities = Array.from(
    new Set(artisans.flatMap(artisan => artisan.specialities))
  ).sort()

  // Filtrer les artisans en fonction des critères
  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = 
      artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.specialities.some((spec: string) => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = 
      categoryFilter === "all" ||
      artisan.specialities.some((spec: string) => spec === categoryFilter)
    
    return matchesSearch && matchesCategory
  })

  const handleRemoveFavorite = (artisan: Artisan) => {
    setArtisanToRemove(artisan)
    setShowRemoveDialog(true)
  }

  const confirmRemoveFavorite = async () => {
    if (artisanToRemove && !removingFavorite) {
      setRemovingFavorite(true)
      
      try {
        const response = await fetch(`/api/client/favorites?favoriteId=${artisanToRemove.favoriteId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Supprimer de l'état local
          setArtisans(prev => prev.filter(a => a.id !== artisanToRemove.id))
          toast.success(`${artisanToRemove.name} a été retiré de vos favoris`)
        } else {
          const error = await response.json()
          toast.error(error.message || 'Erreur lors de la suppression')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du favori:', error)
        toast.error('Erreur lors de la suppression du favori')
      } finally {
        setRemovingFavorite(false)
        setShowRemoveDialog(false)
        setArtisanToRemove(null)
      }
    }
  }

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-10 mb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-[#FCDA89]" />
          Artisans favoris
          {!loading && artisans.length > 0 && (
            <Badge variant="outline" className="ml-2 border-[#FCDA89]/30 text-[#FCDA89]">
              {artisans.length}
            </Badge>
          )}
        </h1>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
          <Input
            type="search"
            placeholder="Rechercher un artisan, une spécialité..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={categoryFilter} 
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-full md:w-[200px] bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filtrer par spécialité" />
          </SelectTrigger>
          <SelectContent className="bg-[#0E261C] border-white/10 text-white">
            <SelectItem value="all" className="focus:bg-white/10 focus:text-white">Toutes les spécialités</SelectItem>
            {allSpecialities.map(spec => (
              <SelectItem key={spec} value={spec} className="focus:bg-white/10 focus:text-white">{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des favoris */}
      {filteredArtisans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtisans.map((artisan) => (
            <Card key={artisan.id} className="overflow-hidden bg-white/5 border-white/10 text-white">
              <CardContent className="p-4">
                <div className="flex gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={artisan.avatar} alt={artisan.name} />
                    <AvatarFallback className="bg-[#FCDA89]/20">{artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">{artisan.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {artisan.specialities.map((spec: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs py-0 border-[#FCDA89]/30 bg-[#FCDA89]/10 text-[#FCDA89]">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0E261C] border-white/10 text-white">
                          <DropdownMenuItem onClick={() => handleRemoveFavorite(artisan)} className="text-red-400 hover:bg-red-900/30 hover:text-red-300 focus:bg-red-900/30 focus:text-red-300">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Retirer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-[#FCDA89] text-[#FCDA89]" />
                    <span className="ml-1 text-sm font-medium">{artisan.rating}</span>
                  </div>
                  <span className="text-xs text-white/70">
                    ({artisan.reviews} avis)
                  </span>
                  <Separator orientation="vertical" className="h-3 bg-white/20" />
                  <div className="flex items-center text-xs text-white/70">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{artisan.location}</span>
                    {artisan.distance && (
                      <span className="ml-1">• {artisan.distance}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-white/70 mb-3 line-clamp-2">
                  {artisan.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant={artisan.disponible ? "default" : "outline"} className={artisan.disponible ? "bg-[#FCDA89] text-[#0E261C]" : "text-white/70 border-white/20"}>
                    {artisan.disponible ? "Disponible" : "Indisponible"}
                  </Badge>
                  <span className="text-xs text-white/70">
                    Ajouté {artisan.favorisDepuis}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
                    <Link href={`/artisans/${artisan.id}`}>
                      Voir profil
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white" asChild>
                    <Link href={`/client/messages?artisan=${artisan.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
          <div className="bg-white/10 rounded-full p-3 mb-3">
            <Heart className="h-6 w-6 text-[#FCDA89]" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun favori trouvé</h3>
          <p className="text-white/70 text-sm max-w-md mb-6">
            {searchTerm || categoryFilter !== "all"
              ? "Aucun artisan ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              : "Vous n'avez pas encore ajouté d'artisans à vos favoris. Parcourez notre annuaire pour trouver des professionnels."}
          </p>
          <Button asChild className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
            <Link href="/client/artisans">
              Découvrir des artisans
            </Link>
          </Button>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent className="bg-[#0E261C] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Retirer des favoris</DialogTitle>
            <DialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir retirer {artisanToRemove?.name} de vos favoris ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setShowRemoveDialog(false)} 
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              disabled={removingFavorite}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmRemoveFavorite} 
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={removingFavorite}
            >
              {removingFavorite ? "Suppression..." : "Retirer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 