"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Building2, Info, Loader2, MapPin, Phone, User, Calendar, Ruler } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OnboardingLayout } from "../components/OnboardingLayout"
import { Slider } from "@/components/ui/slider"
import InterventionRadiusMap from "@/components/maps/InterventionRadiusMap"
import GoogleAddressAutocomplete from "@/components/maps/GoogleAddressAutocomplete"
import { useOnboarding } from "../context/OnboardingContext"

// Schéma de validation du formulaire
const locationFormSchema = z.object({
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(5, "Code postal requis"),
  interventionRadius: z.coerce.number().min(5, "Rayon minimum de 5 km").max(200, "Rayon maximum de 200 km"),
})

type LocationFormValues = z.infer<typeof locationFormSchema>

export default function ArtisanLocationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const { 
    isLoading, 
    isSaving, 
    setIsSaving, 
    updateProgress, 
    currentUserData, 
    silentMode, 
    setSilentMode 
  } = useOnboarding()
  const dataFetchedRef = useRef(false)

  // Initialiser le formulaire
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      address: "",
      city: "",
      postalCode: "",
      interventionRadius: 50, // valeur par défaut
    },
  })

  // Effect pour remplir le formulaire avec les données existantes
  useEffect(() => {
    if (!dataFetchedRef.current && currentUserData && !isLoading) {
      // Remplir le formulaire avec les données existantes
      form.reset({
        address: currentUserData.address || "",
        city: currentUserData.city || "",
        postalCode: currentUserData.postalCode || "",
        interventionRadius: currentUserData.interventionRadius || 50,
      }, { keepDefaultValues: false })
      
      dataFetchedRef.current = true
    }
  }, [form, currentUserData, isLoading])

  // Soumission du formulaire
  const onSubmit = useCallback(async (data: LocationFormValues) => {
    try {
      setIsSaving(true)
      
      // Activer le mode silencieux pour éviter les notifications en cascade
      setSilentMode(true)
      
      // Enregistrer le profil
      const response = await fetch("/api/artisan/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(data),
        cache: "no-store"
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de la localisation")
      }

      // Mettre à jour la progression
      await updateProgress("location")
      
      // Rediriger vers l'étape suivante
      router.push("/onboarding/artisan/specialties")
    } catch (error) {
      console.error("Erreur:", error)
      setSilentMode(false)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre localisation.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      // On garde le mode silencieux actif
    }
  }, [updateProgress, toast, router, setIsSaving, setSilentMode])

  // Values dérivées du formulaire pour l'affichage de la carte
  const address = form.watch("address")
  const city = form.watch("city")
  const postalCode = form.watch("postalCode")
  const interventionRadius = form.watch("interventionRadius")

  // Fonction pour gérer la sélection d'une adresse avec l'autocomplétion
  const handlePlaceSelect = useCallback((place: google.maps.places.PlaceResult) => {
    if (!place.address_components) return
    
    // Extraire le code postal et la ville
    let newPostalCode = ""
    let newCity = ""
    
    for (const component of place.address_components) {
      const types = component.types
      
      if (types.includes('postal_code')) {
        newPostalCode = component.long_name
      } else if (types.includes('locality')) {
        newCity = component.long_name
      }
    }
    
    // Mettre à jour les champs
    if (newPostalCode) form.setValue("postalCode", newPostalCode)
    if (newCity) form.setValue("city", newCity)
  }, [form])

  return (
    <OnboardingLayout 
      currentStep="location"
      title="Localisation professionnelle"
      description="Indiquez l'adresse de votre entreprise et votre zone d'intervention"
      isLastStep={false}
    >
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Form {...form}>
          <form id="onboarding-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Adresse professionnelle</CardTitle>
                <CardDescription>L&apos;adresse de votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <GoogleAddressAutocomplete
                          value={field.value}
                          onChange={field.onChange}
                          onPlaceSelect={handlePlaceSelect}
                          placeholder="Saisissez votre adresse"
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="Code postal" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Zone d&apos;intervention</CardTitle>
                <CardDescription>Définissez votre rayon d&apos;intervention autour de votre adresse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="interventionRadius"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rayon d&apos;intervention</FormLabel>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <Slider
                              value={[field.value]}
                              min={5}
                              max={200}
                              step={5}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="flex-1"
                            />
                            <div className="ml-3 w-14 text-right font-medium">
                              {field.value} km
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground px-1">
                            <span>5 km</span>
                            <span>100 km</span>
                            <span>200 km</span>
                          </div>
                        </div>
                      </div>
                      <FormDescription>
                        Distance maximale jusqu&apos;à laquelle vous acceptez d&apos;intervenir
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {address && city && postalCode && (
                  <div className="mt-4">
                    <InterventionRadiusMap
                      address={address}
                      city={city}
                      postalCode={postalCode}
                      radius={interventionRadius}
                      mapHeight="250px"
                      className="w-full mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Boutons de navigation (visibles uniquement sur écrans > sm) */}
            <div className="flex justify-end space-x-4 mt-8 hidden md:flex">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/onboarding/artisan/profile")}
                className="mr-2"
              >
                Retour
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : "Continuer"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </OnboardingLayout>
  )
} 