"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Building2, Info, Loader2, Phone, User, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OnboardingLayout } from "../components/OnboardingLayout"
import { useOnboarding } from "../context/OnboardingContext"

// Schéma de validation du formulaire
const profileFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  siret: z.string().min(14, "Le numéro SIRET doit contenir 14 chiffres").max(14, "Le numéro SIRET doit contenir 14 chiffres"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  yearsOfExperience: z.coerce.number().min(0, "L'expérience ne peut pas être négative"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ArtisanProfilePage() {
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
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      siret: "",
      phone: "",
      yearsOfExperience: 0,
    },
  })

  // Effect pour remplir le formulaire avec les données existantes
  useEffect(() => {
    if (!dataFetchedRef.current && currentUserData && !isLoading) {
      // Récupérer les informations de l'utilisateur à partir de la session
      const userData = {
        phone: session?.user?.phone || "",
      }
      
      // Extraire prénom et nom depuis le nom complet si disponible
      let firstName = "", lastName = "";
      if (session?.user?.name) {
        const nameParts = session.user.name.split(" ");
        if (nameParts.length > 0) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ");
        }
      }
      
      // Remplir le formulaire avec les données existantes
      form.reset({
        firstName: currentUserData.firstName || firstName || "",
        lastName: currentUserData.lastName || lastName || "",
        companyName: currentUserData.companyName || "",
        siret: currentUserData.siret || "",
        phone: currentUserData.phone || userData.phone || "",
        yearsOfExperience: currentUserData.yearsOfExperience || 0,
      }, { keepDefaultValues: false })
      
      dataFetchedRef.current = true
    }
  }, [form, currentUserData, isLoading, session])

  // Soumission du formulaire
  const onSubmit = useCallback(async (data: ProfileFormValues) => {
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
        throw new Error("Erreur lors de l'enregistrement du profil")
      }

      // Mettre à jour la progression
      await updateProgress("profile")
      
      // Rediriger vers l'étape suivante
      router.push("/onboarding/artisan/location")
    } catch (error) {
      console.error("Erreur:", error)
      setSilentMode(false)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre profil.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      // On garde le mode silencieux actif
    }
  }, [updateProgress, toast, router, setIsSaving, setSilentMode])

  return (
    <OnboardingLayout 
      currentStep="profile" 
      title="Informations de votre entreprise"
      description="Complétez vos informations professionnelles pour permettre aux clients de vous contacter"
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
                <CardTitle className="text-xl">Informations de l&apos;entreprise</CardTitle>
                <CardDescription>Vos informations d&apos;identification professionnelle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Prénom" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input className="pl-10" placeholder="Nom" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                          <Input className="pl-10" placeholder="Nom de votre entreprise" {...field} />
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
                        <div className="relative">
                          <Info className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-10" 
                            placeholder="14 chiffres" 
                            maxLength={14}
                            {...field} 
                            onChange={(e) => {
                              // Permettre uniquement les chiffres
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Le numéro SIRET à 14 chiffres de votre entreprise
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de téléphone</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-10" 
                            placeholder="Téléphone" 
                            {...field} 
                            onChange={(e) => {
                              // Permettre uniquement les chiffres et +
                              const value = e.target.value.replace(/[^\d+]/g, '');
                              field.onChange(value);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Informations professionnelles</CardTitle>
                <CardDescription>Détails sur votre expérience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Années d&apos;expérience</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            className="pl-10" 
                            type="number" 
                            min="0" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Boutons de navigation (visibles uniquement sur écrans > sm) */}
            <div className="flex justify-end space-x-4 mt-8 hidden md:flex">
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