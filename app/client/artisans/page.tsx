"use client"

import { useState, useEffect } from "react"
import { Search, Filter, SlidersHorizontal, Users, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Artisan {
  id: string
  name: string
  firstName: string
  lastName: string
  profession: string
  specialties: string[]
  city: string
  rating: number
  reviews: number
  image: string
  verified: boolean
}

export default function ClientArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  // Charger les artisans depuis l'API
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        const params = new URLSearchParams()
        if (searchQuery) params.append('search', searchQuery)
        
        const response = await fetch(`/api/artisans?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setArtisans(data.artisans || [])
        } else {
          console.error('Erreur lors du chargement des artisans')
          setArtisans([])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des artisans:', error)
        setArtisans([])
      } finally {
        setLoading(false)
      }
    }

    fetchArtisans()
  }, [searchQuery])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl text-white">Découvrir les artisans</h1>
        <p className="text-white/70 text-sm">Trouvez le professionnel idéal pour votre projet</p>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
          <Input
            type="search"
            placeholder="Rechercher par nom, métier ou localisation..."
            className="w-full pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres avancés
        </Button>
      </div>

      {/* Tabs de filtre */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full max-w-md bg-white/10 text-white">
          <TabsTrigger value="all" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Tous</TabsTrigger>
          <TabsTrigger value="popular" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Populaires</TabsTrigger>
          <TabsTrigger value="verified" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Vérifiés</TabsTrigger>
          <TabsTrigger value="nearby" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">À proximité</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Statistiques */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full border-[#FCDA89]/30 text-[#FCDA89]">
            <Filter className="h-3 w-3 mr-1" />
            France
          </Badge>
          <Badge variant="outline" className="rounded-full border-[#FCDA89]/30 text-[#FCDA89]">
            {loading ? "..." : `${artisans.length} artisan${artisans.length > 1 ? 's' : ''}`}
          </Badge>
        </div>
      </div>

      {/* Liste des artisans */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
        </div>
      ) : artisans.length === 0 ? (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-white/30" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Aucun artisan pour le moment</h3>
              <p className="text-white/70">
                {searchQuery 
                  ? `Aucun artisan trouvé pour "${searchQuery}"` 
                  : "Les artisans ne sont pas encore disponibles sur la plateforme."
                }
              </p>
            </div>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="mt-4 border-white/20 text-white hover:bg-white/10"
              >
                Effacer la recherche
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <Card key={artisan.id} className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={artisan.image} alt={artisan.name} />
                      <AvatarFallback className="bg-[#FCDA89]/20 text-[#FCDA89]">
                        {artisan.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{artisan.name}</h3>
                        {artisan.verified && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/70 text-sm">{artisan.profession}</p>
                      <p className="text-white/50 text-xs">{artisan.city}</p>
                    </div>
                  </div>
                  
                  {artisan.specialties.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {artisan.specialties.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-white/5 border-white/20 text-white/80">
                            {specialty}
                          </Badge>
                        ))}
                        {artisan.specialties.length > 2 && (
                          <Badge variant="outline" className="text-xs bg-white/5 border-white/20 text-white/80">
                            +{artisan.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[#FCDA89] text-[#FCDA89]" />
                      <span className="text-sm font-medium">{artisan.rating}</span>
                      <span className="text-xs text-white/70">
                        ({artisan.reviews} avis)
                      </span>
                    </div>
                    
                    <Button size="sm" className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90">
                      Contacter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {artisans.length >= 50 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Charger plus d&apos;artisans
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
} 