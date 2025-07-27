"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Clock, Euro, Star, Zap, ChevronDown, ChevronUp, ImageIcon, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpressService {
  id: string
  name: string
  description?: string
  expressDescription?: string
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

interface ServicesByCategory {
  category: {
    id: string
    name: string
    icon?: string
    slug: string
  }
  services: ExpressService[]
}

export default function ReenoveExpressPage() {
  const router = useRouter()
  const [services, setServices] = useState<ExpressService[]>([])
  const [servicesByCategory, setServicesByCategory] = useState<ServicesByCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchExpressServices()
  }, [])

  const fetchExpressServices = async () => {
    try {
      const response = await fetch('/api/express/services')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des services Express')
      }
      
      const data = await response.json()
      setServices(data.services || [])
      setServicesByCategory(data.servicesByCategory || [])
      
      // Expand categories with popular services by default
      const categoriesWithPopular = data.servicesByCategory
        .filter((cat: ServicesByCategory) => 
          cat.services.some(service => service.isPopular)
        )
        .map((cat: ServicesByCategory) => cat.category.id)
      
      setExpandedCategories(new Set(categoriesWithPopular))
      
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleServiceSelect = (serviceId: string) => {
    router.push(`/reenove-express/booking/${serviceId}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Durée variable'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`
  }

  // Mapping des noms d'icônes Lucide vers des emojis
  const getEmojiFromIcon = (iconName?: string) => {
    const iconMap: Record<string, string> = {
      'Bath': '🛁',
      'Hammer': '🔨', 
      'DoorOpen': '🚪',
      'Wrench': '🔧',
      'Zap': '⚡',
      'Paintbrush': '🎨',
      'Construction': '🏗️',
      'Trees': '🌳',
      'Home': '🏠',
      'Briefcase': '💼'
    }
    return iconMap[iconName || ''] || '🔧'
  }

  // Obtenir la liste unique des catégories
  const categories = Array.from(
    new Set(services.map(service => service.category.id))
  ).map(categoryId => {
    const service = services.find(s => s.category.id === categoryId)
    return service?.category
  }).filter((category): category is NonNullable<typeof category> => Boolean(category))



  // Filtrer les services basés sur le terme de recherche et la catégorie
  const filteredServices = services.filter(service => {
    // Filtre par terme de recherche
    const matchesSearch = !searchTerm || (() => {
      const searchLower = searchTerm.toLowerCase()
      return (
        service.name.toLowerCase().includes(searchLower) ||
        (service.description && service.description.toLowerCase().includes(searchLower)) ||
        (service.expressDescription && service.expressDescription.toLowerCase().includes(searchLower)) ||
        service.category.name.toLowerCase().includes(searchLower)
      )
    })()

    // Filtre par catégorie
    const matchesCategory = selectedCategory === 'all' || service.category.id === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Filtrer les services par catégorie avec recherche
  const filteredServicesByCategory = servicesByCategory.map(categoryGroup => ({
    ...categoryGroup,
    services: categoryGroup.services.filter(service => {
      // Filtre par terme de recherche
      const matchesSearch = !searchTerm || (() => {
        const searchLower = searchTerm.toLowerCase()
        return (
          service.name.toLowerCase().includes(searchLower) ||
          (service.description && service.description.toLowerCase().includes(searchLower)) ||
          (service.expressDescription && service.expressDescription.toLowerCase().includes(searchLower))
        )
      })()

      // Filtre par catégorie
      const matchesCategory = selectedCategory === 'all' || service.category.id === selectedCategory

      return matchesSearch && matchesCategory
    })
  })).filter(categoryGroup => categoryGroup.services.length > 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89] mx-auto mb-4"></div>
          <p className="text-white/70">Chargement des services Express...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchExpressServices} variant="outline" className="border-[#FCDA89]/30 text-[#FCDA89]">
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E261C] to-[#1a3d2e]">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FCDA89]/20 border border-[#FCDA89]/30 mb-6">
            <Zap className="h-4 w-4 text-[#FCDA89]" />
            <span className="text-[#FCDA89] text-sm font-medium">Service Express</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Reenove <span className="text-[#FCDA89]">Express</span>
          </h1>
          
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Interventions rapides à prix fixe. Réservez en ligne et recevez une confirmation immédiate.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="h-5 w-5 text-[#FCDA89]" />
              <span>Intervention rapide</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Euro className="h-5 w-5 text-[#FCDA89]" />
              <span>Prix fixe transparent</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Star className="h-5 w-5 text-[#FCDA89]" />
              <span>Artisans qualifiés</span>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="max-w-2xl mx-auto mt-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50" />
                  <Input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-[#FCDA89]/30 text-white placeholder:text-white/50 focus:border-[#FCDA89] focus:ring-[#FCDA89] rounded-xl h-12"
                  />
                </div>
              </div>

              {/* Sélecteur de catégorie */}
              <div className="md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-[#FCDA89]/30 text-white h-12 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-white/50" />
                      <SelectValue placeholder="Toutes les catégories" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0E261C] border-[#FCDA89]/20 rounded-xl">
                    <SelectItem value="all" className="text-white hover:bg-white/10 focus:bg-white/10">
                      Toutes les catégories
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id} 
                        className="text-white hover:bg-white/10 focus:bg-white/10"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getEmojiFromIcon(category.icon)}</span>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Indicateur de résultats */}
            {(searchTerm || selectedCategory !== 'all') && (
              <div className="text-center">
                <p className="text-white/60 text-sm">
                  {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} 
                  {searchTerm && ` pour "${searchTerm}"`}
                  {selectedCategory !== 'all' && (
                    <>
                      {' '}dans{' '}
                      <span className="text-[#FCDA89]">
                        {categories.find(cat => cat.id === selectedCategory)?.name}
                      </span>
                    </>
                  )}
                </p>
                
                {/* Bouton pour réinitialiser les filtres */}
                {(searchTerm || selectedCategory !== 'all') && (
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                    }}
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Effacer tous les filtres
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services populaires */}
      {filteredServices.some(service => service.isPopular) && (
        <section className="py-12 px-4">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              🔥 Services les plus demandés
                          {(searchTerm || selectedCategory !== 'all') && (
              <span className="text-base font-normal text-white/70 block mt-2">
                {searchTerm && `Résultats pour "${searchTerm}"`}
                {searchTerm && selectedCategory !== 'all' && ' - '}
                {selectedCategory !== 'all' && (
                  <span className="text-[#FCDA89]">
                    {categories.find(cat => cat.id === selectedCategory)?.name}
                  </span>
                )}
              </span>
            )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {filteredServices
                .filter(service => service.isPopular)
                .map((service) => (
                  <Card 
                    key={service.id} 
                    className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                        Populaire
                      </Badge>
                    </div>
                    
                    {/* Image du service */}
                    {service.icon ? (
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={service.icon}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    ) : (
                      <div className="h-48 w-full bg-white/5 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-white/30" />
                      </div>
                    )}
                    
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg group-hover:text-[#FCDA89] transition-colors">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        {service.expressDescription || service.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-[#FCDA89]">
                          {formatPrice(service.price)}
                        </div>
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <Clock className="h-4 w-4" />
                          {formatDuration(service.estimatedDuration)}
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold group-hover:scale-105 transition-transform"
                      >
                        Réserver maintenant
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Tous les services par catégorie */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Tous nos services Express
            {(searchTerm || selectedCategory !== 'all') && (
              <span className="text-base font-normal text-white/70 block mt-2">
                {filteredServicesByCategory.length} catégorie{filteredServicesByCategory.length > 1 ? 's' : ''} avec des résultats
                {searchTerm && ` pour "${searchTerm}"`}
                {selectedCategory !== 'all' && (
                  <>
                    {' '}dans{' '}
                    <span className="text-[#FCDA89]">
                      {categories.find(cat => cat.id === selectedCategory)?.name}
                    </span>
                  </>
                )}
              </span>
            )}
          </h2>
          
          {filteredServicesByCategory.length === 0 && searchTerm ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun service trouvé</h3>
                             <p className="text-white/70 mb-4">
                 Aucun service ne correspond à votre recherche &quot;{searchTerm}&quot;
               </p>
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
                className="border-[#FCDA89]/30 text-[#FCDA89]"
              >
                Effacer la recherche
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
                            {filteredServicesByCategory.map((categoryGroup) => (
                <Card key={categoryGroup.category.id} className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
                    <CardHeader 
                      className="cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => toggleCategory(categoryGroup.category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getEmojiFromIcon(categoryGroup.category.icon)}
                          </div>
                          <div>
                            <CardTitle className="text-white">
                              {categoryGroup.category.name}
                            </CardTitle>
                            <CardDescription className="text-white/70">
                              {categoryGroup.services.length} service{categoryGroup.services.length > 1 ? 's' : ''} disponible{categoryGroup.services.length > 1 ? 's' : ''}
                            </CardDescription>
                          </div>
                        </div>
                        {expandedCategories.has(categoryGroup.category.id) ? (
                          <ChevronUp className="h-5 w-5 text-white/70" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-white/70" />
                        )}
                      </div>
                    </CardHeader>
                
                {expandedCategories.has(categoryGroup.category.id) && (
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryGroup.services.map((service) => (
                        <Card 
                          key={service.id}
                          className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group overflow-hidden"
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          {/* Image du service */}
                          {service.icon ? (
                            <div className="relative h-32 w-full overflow-hidden">
                              <Image
                                src={service.icon}
                                alt={service.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                          ) : (
                            <div className="h-32 w-full bg-white/5 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-white/30" />
                            </div>
                          )}
                          
                          <CardHeader className="pb-3">
                            <CardTitle className="text-white text-base group-hover:text-[#FCDA89] transition-colors">
                              {service.name}
                            </CardTitle>
                            {service.expressDescription && (
                              <CardDescription className="text-white/60 text-sm">
                                {service.expressDescription}
                              </CardDescription>
                            )}
                          </CardHeader>
                          
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="text-lg font-bold text-[#FCDA89]">
                                {formatPrice(service.price)}
                              </div>
                              <div className="flex items-center gap-1 text-white/60 text-xs">
                                <Clock className="h-3 w-3" />
                                {formatDuration(service.estimatedDuration)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Besoin d&apos;un service personnalisé ?
          </h2>
          <p className="text-white/70 mb-8">
            Pour des projets sur mesure, demandez un devis gratuit
          </p>
          <Button 
            variant="outline" 
            className="border-[#FCDA89]/30 bg-[#FCDA89]/10 hover:bg-[#FCDA89]/20 text-[#FCDA89] px-8 py-3"
            asChild
          >
            <Link href="/create-project-ai">
              Demander un devis personnalisé
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
} 