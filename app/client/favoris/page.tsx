"use client"

import { useState } from "react"
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
  specialites: string[]
  rating: number
  reviews: number
  location: string
  description: string
  distance?: string
  disponible: boolean
  favorisDepuis?: string
}

export default function FavorisPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [artisanToRemove, setArtisanToRemove] = useState<Artisan | null>(null)

  // Données fictives des artisans favoris
  const artisans: Artisan[] = [
    {
      id: "a1",
      name: "Martin Dupont",
      avatar: "/placeholder.svg?height=48&width=48",
      specialites: ["Plomberie", "Sanitaire"],
      rating: 4.8,
      reviews: 45,
      location: "Lyon 6ème",
      description: "Artisan plombier spécialisé dans la rénovation de salles de bain et l'installation de sanitaires.",
      distance: "5 km",
      disponible: true,
      favorisDepuis: "Il y a 3 mois"
    },
    {
      id: "a2",
      name: "Sophie Martin",
      avatar: "/placeholder.svg?height=48&width=48",
      specialites: ["Peinture", "Décoration"],
      rating: 4.7,
      reviews: 38,
      location: "Lyon 3ème",
      description: "Artisane peintre avec plus de 10 ans d'expérience, spécialisée dans les finitions et la décoration d'intérieur.",
      distance: "3.2 km",
      disponible: true,
      favorisDepuis: "Il y a 2 semaines"
    },
    {
      id: "a3",
      name: "Jean Durand",
      avatar: "/placeholder.svg?height=48&width=48",
      specialites: ["Menuiserie", "Cuisines"],
      rating: 4.9,
      reviews: 27,
      location: "Villeurbanne",
      description: "Artisan cuisiniste et menuisier spécialisé dans l'installation et la conception de cuisines, placards et dressing sur mesure.",
      distance: "7.5 km",
      disponible: false,
      favorisDepuis: "Il y a 6 mois"
    },
    {
      id: "a4",
      name: "Émilie Petit",
      avatar: "/placeholder.svg?height=48&width=48",
      specialites: ["Électricité", "Domotique"],
      rating: 4.6,
      reviews: 32,
      location: "Lyon 7ème",
      description: "Électricienne certifiée spécialisée dans la mise aux normes électriques et l'installation de systèmes domotiques.",
      distance: "2.8 km",
      disponible: true,
      favorisDepuis: "Il y a 1 mois"
    },
  ]

  // Obtenir toutes les spécialités uniques pour le filtre
  const allSpecialities = Array.from(
    new Set(artisans.flatMap(artisan => artisan.specialites))
  ).sort()

  // Filtrer les artisans en fonction des critères
  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = 
      artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.specialites.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = 
      categoryFilter === "all" ||
      artisan.specialites.some(spec => spec === categoryFilter)
    
    return matchesSearch && matchesCategory
  })

  const handleRemoveFavorite = (artisan: Artisan) => {
    setArtisanToRemove(artisan)
    setShowRemoveDialog(true)
  }

  const confirmRemoveFavorite = () => {
    if (artisanToRemove) {
      // Ici, implémenter la logique de suppression d'un favori
      toast.success(`${artisanToRemove.name} a été retiré de vos favoris`)
      setShowRemoveDialog(false)
      setArtisanToRemove(null)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-10 mb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Artisans favoris
        </h1>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un artisan, une spécialité..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={categoryFilter} 
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrer par spécialité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les spécialités</SelectItem>
            {allSpecialities.map(spec => (
              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des favoris */}
      {filteredArtisans.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtisans.map((artisan) => (
            <Card key={artisan.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={artisan.avatar} alt={artisan.name} />
                    <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sm">{artisan.name}</h3>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {artisan.specialites.map((spec, index) => (
                            <Badge key={index} variant="outline" className="text-xs py-0">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRemoveFavorite(artisan)} className="text-red-500">
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
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{artisan.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({artisan.reviews} avis)
                  </span>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{artisan.location}</span>
                    {artisan.distance && (
                      <span className="ml-1">• {artisan.distance}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {artisan.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant={artisan.disponible ? "default" : "outline"} className="text-xs">
                    {artisan.disponible ? "Disponible" : "Indisponible"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Ajouté {artisan.favorisDepuis}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/client/artisans/${artisan.id}`}>
                      Voir profil
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
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
          <div className="bg-muted rounded-full p-3 mb-3">
            <Heart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun favori trouvé</h3>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            {searchTerm || categoryFilter !== "all"
              ? "Aucun artisan ne correspond à vos critères de recherche. Essayez de modifier vos filtres."
              : "Vous n'avez pas encore ajouté d'artisans à vos favoris. Parcourez notre annuaire pour trouver des professionnels."}
          </p>
          <Button asChild>
            <Link href="/client/artisans">
              Découvrir des artisans
            </Link>
          </Button>
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer des favoris</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir retirer {artisanToRemove?.name} de vos favoris ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmRemoveFavorite}>
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 