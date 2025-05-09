"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Check, Search, X, Wrench, Zap, Hammer, Paintbrush, Construction, Bath, DoorOpen, Trees, Home, Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

// Table de correspondance des icônes par catégorie
const categoryIcons: Record<string, React.ElementType> = {
  "Plomberie": Wrench,
  "Électricité": Zap,
  "Menuiserie": Hammer,
  "Peinture": Paintbrush,
  "Maçonnerie": Construction,
  "Salle de bain": Bath,
  "Portes et fenêtres": DoorOpen,
  "Jardinage": Trees,
  "Rénovation": Home,
  "Autre": Briefcase
}

// Fonction pour obtenir l'icône d'une catégorie (avec fallback)
const getCategoryIcon = (categoryName: string, isSelected: boolean = false) => {
  const Icon = categoryIcons[categoryName] || Briefcase
  return <Icon className={`h-5 w-5 ${isSelected ? "text-amber-600 dark:text-amber-400" : "text-primary"}`} />
}

type Service = {
  id: string
  name: string
  description: string | null
  categoryId: string
  icon: string | null
  category: {
    id: string
    name: string
  }
}

type SpecialtiesSelectorProps = {
  selectedSpecialties: Array<{ id: string; name: string }>
  onChange: (specialties: Array<{ id: string; name: string }>) => void
  onPrimaryChange?: (primaryId: string | null) => void
}

export function SpecialtiesSelector({ 
  selectedSpecialties, 
  onChange,
  onPrimaryChange
}: SpecialtiesSelectorProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [primarySpecialty, setPrimarySpecialty] = useState<string | null>(null)

  // Charger les services disponibles
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/services")
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des services")
        }
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error("Erreur lors du chargement des services:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les services disponibles.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [toast]) // Uniquement la dépendance toast pour éviter les re-rendus inutiles

  // Effet séparé pour gérer la spécialité principale
  useEffect(() => {
    // Définir une spécialité principale si on a des spécialités sélectionnées mais pas encore de principale
    if (selectedSpecialties.length > 0 && !primarySpecialty) {
      setPrimarySpecialty(selectedSpecialties[0].id)
    } else if (selectedSpecialties.length === 0 && primarySpecialty) {
      // Réinitialiser la spécialité principale si plus aucune spécialité n'est sélectionnée
      setPrimarySpecialty(null)
    }
  }, [selectedSpecialties, primarySpecialty])

  // Lorsque la spécialité principale change, informer le composant parent
  useEffect(() => {
    if (onPrimaryChange) {
      onPrimaryChange(primarySpecialty);
    }
  }, [primarySpecialty, onPrimaryChange]);

  // Filtrer les services en fonction de la recherche et de la catégorie sélectionnée
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory ? service.categoryId === selectedCategory : true
    
    return matchesSearch && matchesCategory
  })

  // Extraire les catégories uniques pour le filtre - memoized pour éviter les recalculs inutiles
  const uniqueCategories = useMemo(() => {
    return Array.from(
      new Map(services.map(service => [service.category.id, service.category])).values()
    ).sort((a, b) => a.name.localeCompare(b.name))
  }, [services])

  // Vérifier si un service est sélectionné
  const isServiceSelected = useCallback((serviceId: string) => {
    return selectedSpecialties.some(specialty => specialty.id === serviceId)
  }, [selectedSpecialties])

  // Ajouter ou supprimer une spécialité
  const toggleService = useCallback((service: Service) => {
    if (isServiceSelected(service.id)) {
      // Supprimer la spécialité
      const updatedSpecialties = selectedSpecialties.filter(
        specialty => specialty.id !== service.id
      )
      onChange(updatedSpecialties)
      
      // Si c'était la spécialité principale, réinitialiser ou définir une nouvelle
      if (primarySpecialty === service.id && updatedSpecialties.length > 0) {
        setPrimarySpecialty(updatedSpecialties[0].id)
      } else if (updatedSpecialties.length === 0) {
        setPrimarySpecialty(null)
      }
    } else {
      // Ajouter la spécialité
      const updatedSpecialties = [
        ...selectedSpecialties,
        { id: service.id, name: service.name }
      ]
      onChange(updatedSpecialties)
      
      // Si aucune spécialité principale n'est définie, définir celle-ci
      if (!primarySpecialty) {
        setPrimarySpecialty(service.id)
      }
    }
  }, [selectedSpecialties, onChange, primarySpecialty, isServiceSelected])

  if (loading) {
    return <div className="py-4 text-center text-muted-foreground">Chargement des spécialités...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        {/* Barre de recherche et filtres */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une spécialité..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Affichage des catégories en cards avec icônes */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 my-4">
            <div 
              className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all 
                ${!selectedCategory 
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-md" 
                  : "border-gray-200 hover:border-amber-400/70 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"}`}
              onClick={() => setSelectedCategory(null)}
            >
              <div className={`p-2 rounded-lg mr-2 ${!selectedCategory ? "bg-amber-100 dark:bg-amber-800/30" : "bg-primary/10"}`}>
                <Briefcase className={`h-4 w-4 ${!selectedCategory ? "text-amber-600 dark:text-amber-400" : "text-primary"}`} />
              </div>
              <span className="text-sm font-medium">Toutes</span>
            </div>
            
            {uniqueCategories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center p-3 rounded-md border-2 cursor-pointer transition-all
                  ${selectedCategory === category.id 
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shadow-md" 
                    : "border-gray-200 hover:border-amber-400/70 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className={`p-2 rounded-lg mr-2 ${selectedCategory === category.id ? "bg-amber-100 dark:bg-amber-800/30" : "bg-primary/10"}`}>
                  {getCategoryIcon(category.name, selectedCategory === category.id)}
                </div>
                <span className="text-sm font-medium truncate">{category.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Spécialités sélectionnées */}
        {selectedSpecialties.length > 0 && (
          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <h3 className="text-sm font-medium">Spécialités sélectionnées ({selectedSpecialties.length})</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSpecialties.map(specialty => {
                const isPrimary = primarySpecialty === specialty.id
                return (
                  <Badge 
                    key={specialty.id}
                    variant={isPrimary ? "default" : "secondary"}
                    className={`flex items-center gap-1 py-1.5 pl-2 pr-1 ${
                      isPrimary 
                        ? "bg-amber-500 hover:bg-amber-600 text-white border-none" 
                        : "bg-background dark:bg-background border"
                    }`}
                  >
                    {isPrimary && <Check className="h-3 w-3" />}
                    <span className={`mr-1 ${isPrimary ? "text-white" : "text-primary"}`}>{specialty.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={() => {
                        const service = services.find(s => s.id === specialty.id)
                        if (service) toggleService(service)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Liste des services disponibles */}
      <ScrollArea className="h-[350px]">
        {filteredServices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun service ne correspond à votre recherche
          </div>
        ) : (
          <div className="space-y-6">
            {uniqueCategories
              .filter(category => 
                !selectedCategory || category.id === selectedCategory
              )
              .map(category => {
                const categoryServices = filteredServices.filter(
                  service => service.categoryId === category.id
                )
                
                if (categoryServices.length === 0) return null
                
                return (
                  <div key={`category-${category.id}`} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-lg">
                        {getCategoryIcon(category.name)}
                      </div>
                      <h3 className="font-medium text-sm">{category.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryServices.map(service => {
                        const isSelected = isServiceSelected(service.id)
                        const isPrimary = primarySpecialty === service.id
                        
                        return (
                          <div
                            key={`service-${service.id}`}
                            className={`p-3 rounded-md border flex items-start gap-3 cursor-pointer transition-colors ${
                              isSelected
                                ? isPrimary
                                  ? "border-amber-500 bg-amber-50/70 dark:bg-amber-900/20"
                                  : "border-primary/30 bg-primary/5"
                                : "hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                            onClick={() => toggleService(service)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleService(service)}
                              className="mt-1"
                            />
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="font-medium text-sm truncate max-w-[250px]">{service.name}</div>
                                {isSelected && (
                                  <Button
                                    variant={isPrimary ? "default" : "outline"}
                                    size="sm"
                                    className={`h-7 text-xs whitespace-nowrap ${isPrimary 
                                      ? "bg-amber-500 hover:bg-amber-600 text-white border-none" 
                                      : ""}`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setPrimarySpecialty(service.id)
                                    }}
                                  >
                                    {isPrimary ? (
                                      <>
                                        <Check className="h-3 w-3 mr-1" />
                                        Principal
                                      </>
                                    ) : (
                                      "Définir principal"
                                    )}
                                  </Button>
                                )}
                              </div>
                              {service.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {service.description}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 