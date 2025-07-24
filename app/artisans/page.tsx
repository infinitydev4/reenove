"use client"

import { useState, useEffect } from "react"
import { Search, Filter, SlidersHorizontal, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import ArtisanCard from "@/components/artisan-card"
import Navbar from "@/components/navbar"

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

export default function ArtisansPage() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navbar />
      <div className="bg-white dark:bg-gray-950 border-b sticky top-0 z-10">
        <div className="container py-4 px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom, métier ou localisation..."
                className="w-full pl-9 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="popular">Populaires</TabsTrigger>
              <TabsTrigger value="recent">Récents</TabsTrigger>
              <TabsTrigger value="nearby">À proximité</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container py-8 px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Artisans disponibles</h1>
            <p className="text-muted-foreground">Trouvez le professionnel idéal pour votre projet</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">
              <Filter className="h-3 w-3 mr-1" />
              France
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {loading ? "..." : `${artisans.length} artisan${artisans.length > 1 ? 's' : ''}`}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : artisans.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="flex flex-col items-center gap-4">
              <Users className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Aucun artisan pour le moment</h3>
                <p className="text-muted-foreground">
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
                >
                  Effacer la recherche
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artisans.map((artisan) => (
                <ArtisanCard
                  key={artisan.id}
                  name={artisan.name}
                  profession={artisan.profession}
                  rating={artisan.rating}
                  reviews={artisan.reviews}
                  image={artisan.image}
                  location={artisan.city}
                />
              ))}
            </div>

            {artisans.length >= 50 && (
              <div className="flex justify-center mt-8">
                <Button variant="outline">Charger plus d&apos;artisans</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
