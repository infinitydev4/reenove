"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Building2, Info, Loader2, MapPin, Phone, User, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Schéma de validation du formulaire
const profileFormSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  siret: z.string().min(14, "Le numéro SIRET doit contenir 14 chiffres").max(14, "Le numéro SIRET doit contenir 14 chiffres"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(5, "Code postal requis"),
  yearsOfExperience: z.coerce.number().min(0, "L'expérience ne peut pas être négative"),
  preferredRadius: z.coerce.number().min(1, "Le rayon d'intervention doit être d'au moins 1 km"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ArtisanProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Initialiser le formulaire
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      companyName: "",
      siret: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      yearsOfExperience: 0,
      preferredRadius: 50,
    },
  })

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan/profile")
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

      // Charger les données existantes si disponibles
      const fetchProfile = async () => {
        try {
          const response = await fetch("/api/artisan/profile")
          if (response.ok) {
            const profileData = await response.json()
            
            // Remplir le formulaire avec les données existantes
            form.reset({
              companyName: profileData.companyName || "",
              siret: profileData.siret || "",
              phone: session.user.phone || "",
              address: session.user.address || "",
              city: session.user.city || "",
              postalCode: session.user.postalCode || "",
              yearsOfExperience: profileData.yearsOfExperience || 0,
              preferredRadius: profileData.preferredRadius || 50,
            })
          }
        } catch (error) {
          console.error("Erreur lors du chargement du profil:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchProfile()
    }
  }, [status, router, toast, session?.user?.id, form])

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSaving(true)
      
      const response = await fetch("/api/artisan/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement du profil")
      }

      toast({
        title: "Profil enregistré",
        description: "Vos informations de profil ont été enregistrées avec succès.",
      })

      // Passer à l'étape suivante
      router.push("/onboarding/artisan/specialties")
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement de votre profil.",
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
        <p className="text-muted-foreground">Chargement de vos informations...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Informations de profil</h1>
          <p className="text-muted-foreground max-w-md">
            Complétez vos informations d&apos;entreprise et personnelles pour être visible sur notre plateforme.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profil professionnel</CardTitle>
            <CardDescription>
              Ces informations seront visibles par vos clients potentiels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-md p-4">
                    <div className="flex">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">Informations entreprise</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          Ces informations seront vérifiées lors de la validation de votre compte.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de l&apos;entreprise</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Nom de votre entreprise" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="siret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro SIRET</FormLabel>
                        <FormControl>
                          <Input placeholder="14 chiffres" {...field} />
                        </FormControl>
                        <FormDescription>
                          Saisissez les 14 chiffres sans espaces.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Téléphone professionnel" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Années d&apos;expérience</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input type="number" min="0" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-md p-4">
                    <div className="flex">
                      <MapPin className="h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-300">Zone d&apos;intervention</h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          Définissez votre adresse principale et votre rayon d&apos;intervention.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse de l'entreprise" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredRadius"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rayon d&apos;intervention (km)</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value.toString()}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un rayon d'intervention" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 km</SelectItem>
                              <SelectItem value="25">25 km</SelectItem>
                              <SelectItem value="50">50 km</SelectItem>
                              <SelectItem value="100">100 km</SelectItem>
                              <SelectItem value="200">200 km et plus</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormDescription>
                          Distance maximale à laquelle vous êtes prêt à vous déplacer pour vos clients.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/onboarding/artisan")}
                  >
                    Retour
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Continuer"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 