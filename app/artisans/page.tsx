import { Search, Filter, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ArtisanCard from "@/components/artisan-card"

export default function ArtisansPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="bg-white dark:bg-gray-950 border-b sticky top-0 z-10">
        <div className="container py-4 px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom, métier ou localisation..."
                className="w-full pl-9 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres avancés
            </Button>
          </div>

          <Tabs defaultValue="all" className="mt-4">
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
              Lyon et alentours
            </Badge>
            <Badge variant="outline" className="rounded-full">
              8 artisans
            </Badge>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ArtisanCard
            name="Thomas Dubois"
            profession="Menuisier"
            rating={4.9}
            reviews={124}
            image="/focused-craftsman.png"
            location="Lyon"
          />
          <ArtisanCard
            name="Marie Laurent"
            profession="Électricienne"
            rating={4.8}
            reviews={98}
            image="/empowered-electrician.png"
            location="Paris"
          />
          <ArtisanCard
            name="Jean Moreau"
            profession="Plombier"
            rating={4.7}
            reviews={156}
            image="/confident-plumber.png"
            location="Marseille"
          />
          <ArtisanCard
            name="Sophie Blanc"
            profession="Peintre"
            rating={4.6}
            reviews={87}
            image="/placeholder.svg?height=300&width=300&query=professional painter woman portrait"
            location="Bordeaux"
          />
          <ArtisanCard
            name="Pierre Martin"
            profession="Maçon"
            rating={4.8}
            reviews={112}
            image="/placeholder.svg?height=300&width=300&query=professional mason portrait"
            location="Toulouse"
          />
          <ArtisanCard
            name="Lucie Petit"
            profession="Décoratrice"
            rating={4.9}
            reviews={76}
            image="/placeholder.svg?height=300&width=300&query=professional interior designer woman portrait"
            location="Nice"
          />
          <ArtisanCard
            name="Antoine Leroy"
            profession="Jardinier"
            rating={4.7}
            reviews={93}
            image="/placeholder.svg?height=300&width=300&query=professional gardener portrait"
            location="Nantes"
          />
          <ArtisanCard
            name="Camille Roux"
            profession="Carreleur"
            rating={4.6}
            reviews={68}
            image="/placeholder.svg?height=300&width=300&query=professional tile setter portrait"
            location="Strasbourg"
          />
        </div>

        <div className="flex justify-center mt-8">
          <Button variant="outline">Charger plus d'artisans</Button>
        </div>
      </div>
    </div>
  )
}
