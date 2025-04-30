"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Hammer, Loader2, Check, Wrench, Search, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

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

type SelectedSpecialty = {
  id: string
  name: string
  isPrimary: boolean
  categoryId: string
  categoryName: string
}

export default function ArtisanSpecialtiesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedSpecialty[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [primarySpecialty, setPrimarySpecialty] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [hasFetchedData, setHasFetchedData] = useState(false)

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan/specialties")
      return
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "ARTISAN") {
        router.push("/")
        toast({
          title: "Accès refusé",
          description: "Cette section est réservée aux artisans.",
          variant: "destructive"
        })
        return
      }

      // Éviter de charger les données plusieurs fois
      if (hasFetchedData) return;

      // Charger les services et les spécialités déjà sélectionnées
      const fetchData = async () => {
        try {
          setIsLoading(true);
          setFetchError(null);
          
          // Récupérer tous les services disponibles
          const servicesResponse = await fetch("/api/services")
          if (!servicesResponse.ok) {
            throw new Error("Erreur lors de la récupération des services")
          }
          const servicesData = await servicesResponse.json()
          setServices(servicesData)

          // Récupérer les spécialités déjà sélectionnées par l'artisan
          const specialtiesResponse = await fetch("/api/artisan/specialties")
          if (specialtiesResponse.ok) {
            const specialtiesData = await specialtiesResponse.json()
            
            // Formater les données pour correspondre à notre structure
            const formattedSpecialties = specialtiesData.map((specialty: any) => ({
              id: specialty.serviceId,
              name: specialty.service.name,
              isPrimary: specialty.isPrimary,
              categoryId: specialty.service.categoryId,
              categoryName: specialty.service.category.name
            }))
            
            setSelectedServices(formattedSpecialties)
            
            // Définir la spécialité principale si elle existe
            const primary = formattedSpecialties.find((s: SelectedSpecialty) => s.isPrimary)
            if (primary) {
              setPrimarySpecialty(primary.id)
            }
          }
          
          // Marquer que les données ont été chargées
          setHasFetchedData(true);
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error)
          setFetchError("Impossible de charger les services disponibles.")
          toast({
            title: "Erreur",
            description: "Impossible de charger les services disponibles.",
            variant: "destructive"
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [status, router, toast, session?.user, hasFetchedData])

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

  const toggleService = (service: Service) => {
    // Vérifier si le service est déjà sélectionné
    const index = selectedServices.findIndex(s => s.id === service.id)
    
    if (index >= 0) {
      // Si le service est déjà sélectionné, le retirer
      const newSelected = [...selectedServices]
      newSelected.splice(index, 1)
      setSelectedServices(newSelected)
      
      // Si c'était la spécialité principale, réinitialiser
      if (primarySpecialty === service.id) {
        setPrimarySpecialty(null)
      }
    } else {
      // Sinon, l'ajouter
      const newSpecialty: SelectedSpecialty = {
        id: service.id,
        name: service.name,
        isPrimary: false,
        categoryId: service.categoryId,
        categoryName: service.category.name
      }
      
      setSelectedServices([...selectedServices, newSpecialty])
      
      // Si aucune spécialité principale n'est définie, définir celle-ci comme principale
      if (!primarySpecialty) {
        setPrimarySpecialty(service.id)
      }
    }
  }

  const setPrimaryService = (serviceId: string) => {
    setPrimarySpecialty(serviceId)
  }

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Sélection requise",
        description: "Veuillez sélectionner au moins une spécialité.",
        variant: "destructive"
      })
      return
    }

    if (!primarySpecialty) {
      toast({
        title: "Spécialité principale requise",
        description: "Veuillez sélectionner une spécialité principale.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      
      // Préparer les données pour l'envoi
      const specialtiesData = selectedServices.map(service => ({
        serviceId: service.id,
        isPrimary: service.id === primarySpecialty
      }))
      
      const response = await fetch("/api/artisan/specialties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ specialties: specialtiesData }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement des spécialités")
      }

      toast({
        title: "Spécialités enregistrées",
        description: "Vos spécialités ont été enregistrées avec succès.",
      })

      // Passer à l'étape suivante
      router.push("/onboarding/artisan/documents")
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de vos spécialités.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement des services disponibles...</p>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 max-w-lg text-center">
          <Wrench className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Erreur de chargement</h2>
          <p className="text-red-600 dark:text-red-300 mb-4">{fetchError}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 max-w-lg text-center">
          <Wrench className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">Aucun service disponible</h2>
          <p className="text-yellow-600 dark:text-yellow-300 mb-4">
            Aucun service n&apos;est actuellement disponible dans notre base de données. 
            Veuillez contacter l&apos;administrateur.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-7xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Vos spécialités</h1>
          <p className="text-muted-foreground max-w-md">
            Sélectionnez vos domaines d&apos;expertise pour être visible auprès des clients recherchant vos services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Liste des services disponibles */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Services disponibles</CardTitle>
              <CardDescription>
                Sélectionnez les services que vous proposez
              </CardDescription>
              <div className="mt-2 space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Rechercher un service..."
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
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px] pr-4">
                {filteredServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun service ne correspond à votre recherche
                  </div>
                ) : (
                  <div className="space-y-4">
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
                                const isSelected = selectedServices.some(s => s.id === service.id)
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
                                              setPrimaryService(service.id)
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
            </CardContent>
          </Card>

          {/* Services sélectionnés */}
          <Card className="h-full flex flex-col min-w-0">
            <CardHeader>
              <CardTitle>Vos spécialités</CardTitle>
              <CardDescription>
                {selectedServices.length} sélectionnée{selectedServices.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              {selectedServices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center h-full justify-center">
                  <Hammer className="h-8 w-8 mb-2 text-muted-foreground/50" />
                  <p>Aucune spécialité sélectionnée</p>
                  <p className="text-xs mt-1">
                    Cliquez sur les services dans la liste pour les ajouter
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-2">
                    {/* Spécialité principale */}
                    {primarySpecialty && (
                      <>
                        <h3 className="font-medium text-sm">Spécialité principale</h3>
                        {selectedServices
                          .filter(service => service.id === primarySpecialty)
                          .map(service => (
                            <div
                              key={`selected-primary-${service.id}`}
                              className="p-3 rounded-md border border-primary bg-primary/5 flex items-center justify-between gap-2 flex-wrap"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate">{service.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {service.categoryName}
                                </div>
                              </div>
                              <Badge variant="default" className="ml-auto whitespace-nowrap flex-shrink-0">Principal</Badge>
                            </div>
                          ))}
                        
                        <Separator className="my-3" />
                      </>
                    )}

                    {/* Spécialités secondaires */}
                    {selectedServices.some(service => service.id !== primarySpecialty) && (
                      <h3 className="font-medium text-sm">Spécialités secondaires</h3>
                    )}
                    
                    {selectedServices
                      .filter(service => service.id !== primarySpecialty)
                      .map(service => (
                        <div
                          key={`selected-secondary-${service.id}`}
                          className="p-3 rounded-md border flex items-center justify-between group gap-2 flex-wrap"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{service.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {service.categoryName}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2 flex-shrink-0 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={() => toggleService({ id: service.id } as Service)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-500"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap"
                              onClick={() => setPrimaryService(service.id)}
                            >
                              Principal
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4 px-6 mt-auto">
              <Button variant="outline" onClick={() => router.push("/onboarding/artisan/profile")}>
                Retour
              </Button>
              <Button onClick={handleSave} disabled={isSaving || selectedServices.length === 0}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Continuer"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 