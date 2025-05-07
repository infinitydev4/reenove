"use client"

import { useState, useEffect } from "react"
import { Check, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"

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

  // Mettre à jour la sélection principale et notifier le parent
  const updatePrimarySpecialty = (id: string | null) => {
    setPrimarySpecialty(id)
    if (onPrimaryChange) {
      onPrimaryChange(id)
    }
  }

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
        
        // Définir une spécialité principale si on a déjà des spécialités sélectionnées
        if (selectedSpecialties.length > 0 && !primarySpecialty) {
          updatePrimarySpecialty(selectedSpecialties[0].id)
        }
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
  }, [toast])

  // Filtrer les services en fonction de la recherche et de la catégorie sélectionnée
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory ? service.categoryId === selectedCategory : true
    
    return matchesSearch && matchesCategory
  })

  // Extraire les catégories uniques pour le filtre
  const uniqueCategories = Array.from(
    new Map(services.map(service => [service.category.id, service.category])).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  // Vérifier si un service est sélectionné
  const isServiceSelected = (serviceId: string) => {
    return selectedSpecialties.some(specialty => specialty.id === serviceId)
  }

  // Ajouter ou supprimer une spécialité
  const toggleService = (service: Service) => {
    if (isServiceSelected(service.id)) {
      // Supprimer la spécialité
      const updatedSpecialties = selectedSpecialties.filter(
        specialty => specialty.id !== service.id
      )
      onChange(updatedSpecialties)
      
      // Si c'était la spécialité principale, réinitialiser ou définir une nouvelle
      if (primarySpecialty === service.id) {
        if (updatedSpecialties.length > 0) {
          updatePrimarySpecialty(updatedSpecialties[0].id)
        } else {
          updatePrimarySpecialty(null)
        }
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
        updatePrimarySpecialty(service.id)
      }
    }
  }

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
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Toutes les catégories
            </Badge>
            {uniqueCategories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Badge>
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
                    className="flex items-center gap-1 py-1.5 pl-2 pr-1 bg-background dark:bg-background border"
                  >
                    {isPrimary && <Check className="h-3 w-3" />}
                    <span className="mr-1">{specialty.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation(); // Empêcher la propagation de l'événement
                        // Supprimer directement sans chercher dans les services
                        const updatedSpecialties = selectedSpecialties.filter(
                          s => s.id !== specialty.id
                        );
                        onChange(updatedSpecialties);
                        
                        // Si c'était la spécialité principale, mettre à jour
                        if (primarySpecialty === specialty.id) {
                          if (updatedSpecialties.length > 0) {
                            updatePrimarySpecialty(updatedSpecialties[0].id);
                          } else {
                            updatePrimarySpecialty(null);
                          }
                        }
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
      <ScrollArea className="h-[350px] pr-4">
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
                    <h3 className="font-medium text-sm text-muted-foreground">
                      {category.name}
                    </h3>
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
                                  ? "border-primary/70 bg-primary/5"
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
                                    className="h-7 text-xs whitespace-nowrap"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updatePrimarySpecialty(service.id)
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