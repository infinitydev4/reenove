"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/Footer"
import BottomNavbar from "@/components/bottom-navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowRight, 
  Clock, 
  Euro, 
  Star, 
  Zap, 
  Search, 
  X,
  Sparkles,
  Shield,
  CheckCircle2,
  ImageIcon,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

// Forcer le rendu dynamique
export const dynamic = 'force-dynamic'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const categoriesRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    fetchExpressServices()
  }, [])

  // Vérifier le scroll des catégories
  useEffect(() => {
    const checkScroll = () => {
      if (categoriesRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoriesRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }
    
    checkScroll()
    categoriesRef.current?.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    
    return () => {
      categoriesRef.current?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [servicesByCategory])

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = 200
      categoriesRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const fetchExpressServices = async () => {
    try {
      const response = await fetch('/api/express/services', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement')
      
      const data = await response.json()
      setServices(data.services || [])
      setServicesByCategory(data.servicesByCategory || [])
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    router.push(`/reenove-express/booking/${serviceId}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '~1h'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) return `${hours}h`
    return `${hours}h${remainingMinutes}`
  }

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

  // Filtrer les services
  const filteredServices = services.filter(service => {
    const matchesSearch = !searchTerm || 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.expressDescription?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || service.category.id === activeCategory
    
    return matchesSearch && matchesCategory
  })

  // Services populaires
  const popularServices = filteredServices.filter(s => s.isPopular).slice(0, 6)

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#0E261C]">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#FCDA89]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#FCDA89] border-t-transparent animate-spin"></div>
              <Zap className="absolute inset-0 m-auto w-6 h-6 text-[#FCDA89]" />
            </div>
            <p className="text-white/70">Chargement des services...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-[#0E261C]">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={fetchExpressServices} className="bg-[#FCDA89] text-[#0E261C]">
              Réessayer
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0E261C]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section - Compact */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#FCDA89]/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FCDA89]/10 border border-[#FCDA89]/20 mb-6">
                <Zap className="w-4 h-4 text-[#FCDA89]" />
                <span className="text-[#FCDA89] text-sm font-medium">Intervention rapide • Prix fixe</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Reenove <span className="text-[#FCDA89]">Express</span>
              </h1>
              
              <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
                Réservez en 2 minutes, recevez une confirmation immédiate
              </p>

              {/* Avantages en ligne */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <div className="p-1.5 rounded-full bg-[#FCDA89]/10">
                    <Clock className="w-4 h-4 text-[#FCDA89]" />
                  </div>
                  <span className="text-sm">Intervention 24-48h</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="p-1.5 rounded-full bg-[#FCDA89]/10">
                    <Euro className="w-4 h-4 text-[#FCDA89]" />
                  </div>
                  <span className="text-sm">Prix tout compris</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <div className="p-1.5 rounded-full bg-[#FCDA89]/10">
                    <Shield className="w-4 h-4 text-[#FCDA89]" />
                  </div>
                  <span className="text-sm">Artisans vérifiés</span>
                </div>
              </div>

              {/* Barre de recherche */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-10 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-2xl focus:border-[#FCDA89]/50 focus:ring-[#FCDA89]/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-white/40" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Navigation - Sticky */}
        <section className="sticky top-[73px] z-30 bg-[#0E261C]/95 backdrop-blur-md border-y border-white/5 py-4">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="relative">
              {/* Scroll buttons */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollCategories('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[#0E261C] border border-white/10 shadow-lg hover:bg-white/5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
              )}
              {canScrollRight && (
                <button
                  onClick={() => scrollCategories('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-[#0E261C] border border-white/10 shadow-lg hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              )}
              
              {/* Categories scroll container */}
              <div 
                ref={categoriesRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide px-8 md:px-0 md:justify-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  onClick={() => setActiveCategory('all')}
                  className={cn(
                    "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                    activeCategory === 'all'
                      ? "bg-[#FCDA89] text-[#0E261C]"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Tous
                  </span>
                </button>
                
                {servicesByCategory.map((cat) => (
                  <button
                    key={cat.category.id}
                    onClick={() => setActiveCategory(cat.category.id)}
                    className={cn(
                      "flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                      activeCategory === cat.category.id
                        ? "bg-[#FCDA89] text-[#0E261C]"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{getEmojiFromIcon(cat.category.icon)}</span>
                      {cat.category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results info */}
        {(searchTerm || activeCategory !== 'all') && (
          <div className="container px-4 md:px-6 mx-auto py-4">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">
                {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
                {searchTerm && <span className="text-white/40"> pour &quot;{searchTerm}&quot;</span>}
              </p>
              {(searchTerm || activeCategory !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setActiveCategory('all') }}
                  className="text-[#FCDA89] text-sm hover:underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        )}

        {/* Popular Services - Only show if no filter and has popular */}
        {!searchTerm && activeCategory === 'all' && popularServices.length > 0 && (
          <section className="py-8 md:py-12">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-orange-500/10">
                  <Star className="w-5 h-5 text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Les plus demandés</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularServices.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    onSelect={handleServiceSelect}
                    formatPrice={formatPrice}
                    formatDuration={formatDuration}
                    isPopular
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Services Grid */}
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6 mx-auto">
            {!searchTerm && activeCategory === 'all' && popularServices.length > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-[#FCDA89]/10">
                  <Zap className="w-5 h-5 text-[#FCDA89]" />
                </div>
                <h2 className="text-xl font-bold text-white">Tous les services</h2>
              </div>
            )}
            
            {filteredServices.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Search className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun service trouvé</h3>
                <p className="text-white/60 mb-6">
                  Essayez avec d&apos;autres termes ou explorez nos catégories
                </p>
                <Button 
                  onClick={() => { setSearchTerm(''); setActiveCategory('all') }}
                  className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90"
                >
                  Voir tous les services
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredServices
                  .filter(s => searchTerm || activeCategory !== 'all' || !s.isPopular)
                  .map((service) => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      onSelect={handleServiceSelect}
                      formatPrice={formatPrice}
                      formatDuration={formatDuration}
                    />
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FCDA89]/5 via-transparent to-[#FCDA89]/5"></div>
          
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4">
                <CheckCircle2 className="w-4 h-4 text-[#FCDA89]" />
                <span className="text-white/70 text-sm">Projet sur mesure</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Besoin d&apos;un devis personnalisé ?
              </h2>
              <p className="text-white/60 mb-8">
                Notre IA analyse votre projet et vous propose les meilleurs artisans
              </p>
              
              <Button 
                className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold px-8 py-6 text-lg rounded-xl"
                asChild
              >
                <Link href="/create-project-ai">
                  Demander un devis gratuit
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <BottomNavbar />
    </div>
  )
}

// Service Card Component
interface ServiceCardProps {
  service: ExpressService
  onSelect: (id: string) => void
  formatPrice: (price: number) => string
  formatDuration: (minutes?: number) => string
  isPopular?: boolean
}

function ServiceCard({ service, onSelect, formatPrice, formatDuration, isPopular }: ServiceCardProps) {
  return (
    <div
      onClick={() => onSelect(service.id)}
      className={cn(
        "group relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-300",
        "hover:bg-white/10 hover:border-[#FCDA89]/30 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#FCDA89]/5"
      )}
    >
      {/* Image */}
      <div className="relative h-36 overflow-hidden">
        {service.icon ? (
          <>
            <Image
              src={service.icon}
              alt={service.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E261C] via-transparent to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-white/20" />
          </div>
        )}
        
        {/* Badge populaire */}
        {(isPopular || service.isPopular) && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Populaire
            </Badge>
          </div>
        )}
        
        {/* Prix overlay */}
        <div className="absolute bottom-3 right-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#0E261C]/90 backdrop-blur-sm border border-white/10">
            <span className="text-lg font-bold text-[#FCDA89]">{formatPrice(service.price)}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 group-hover:text-[#FCDA89] transition-colors line-clamp-1">
          {service.name}
        </h3>
        
        {service.expressDescription && (
          <p className="text-sm text-white/50 mb-3 line-clamp-2">
            {service.expressDescription}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/40 text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDuration(service.estimatedDuration)}</span>
          </div>
          
          <div className="flex items-center gap-1 text-[#FCDA89] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Réserver
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
