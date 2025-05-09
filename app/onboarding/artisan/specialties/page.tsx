"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { SpecialtiesSelector } from "@/components/specialties/SpecialtiesSelector"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { OnboardingLayout } from "../components/OnboardingLayout"
import { useOnboarding } from "../context/OnboardingContext"

export default function ArtisanSpecialtiesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const { 
    isLoading, 
    isSaving, 
    setIsSaving, 
    completedSteps, 
    updateProgress, 
    silentMode, 
    setSilentMode 
  } = useOnboarding()
  
  const [selectedSpecialties, setSelectedSpecialties] = useState<Array<{ id: string, name: string }>>([])
  const [primarySpecialtyId, setPrimarySpecialtyId] = useState<string | null>(null)

  // Charger les services disponibles
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Récupérer les spécialités sélectionnées
        const specialtiesResponse = await fetch("/api/artisan/specialties", { cache: 'no-store' })
        if (specialtiesResponse.ok) {
          const specialtiesData = await specialtiesResponse.json()
          
          if (Array.isArray(specialtiesData) && specialtiesData.length > 0) {
            // Transformer les données pour le format attendu par le sélecteur
            const formattedSpecialties = specialtiesData.map(specialty => ({
              id: specialty.serviceId || specialty.id,
              name: specialty.service?.name || specialty.name || "Service"
            }))
            
            setSelectedSpecialties(formattedSpecialties)
            
            // Définir la spécialité principale
            const primarySpecialty = specialtiesData.find(s => s.isPrimary)
            if (primarySpecialty) {
              setPrimarySpecialtyId(primarySpecialty.serviceId || primarySpecialty.id)
            } else if (formattedSpecialties.length > 0) {
              setPrimarySpecialtyId(formattedSpecialties[0].id)
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      }
    }

    if (status === "authenticated" && session?.user) {
      fetchServices()
    }
  }, [status, session?.user])

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      // Vérifier qu'au moins une spécialité est sélectionnée
      if (selectedSpecialties.length === 0) {
        toast({
          title: "Sélection requise",
          description: "Veuillez sélectionner au moins une spécialité.",
          variant: "destructive"
        })
        return
      }
      
      // Vérifier qu'une spécialité principale est sélectionnée
      let primaryId = primarySpecialtyId
      if (!primaryId && selectedSpecialties.length > 0) {
        // Par défaut, utiliser la première spécialité comme principale
        primaryId = selectedSpecialties[0].id
        setPrimarySpecialtyId(primaryId)
      }
      
      // Vérifier si les IDs de spécialités sont valides (pas de valeurs comme 'other-cleaning')
      const validSpecialties = selectedSpecialties.filter(
        specialty => !specialty.id.startsWith('other-')
      )
      
      if (validSpecialties.length === 0) {
        toast({
          title: "Sélection invalide",
          description: "Aucune spécialité valide sélectionnée. Veuillez choisir des spécialités existantes.",
          variant: "destructive"
        })
        return
      }
      
      // Si la spécialité principale n'est pas valide, en choisir une nouvelle
      let finalPrimaryId = primaryId
      if (primaryId && primaryId.startsWith('other-')) {
        finalPrimaryId = validSpecialties[0].id
      }
      
      // Activer le mode silencieux pour éviter les notifications redondantes
      setSilentMode(true)
      
      // Enregistrer les spécialités valides uniquement
      const response = await fetch("/api/artisan/specialties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          specialties: validSpecialties.map(specialty => ({
            serviceId: specialty.id,
            isPrimary: specialty.id === finalPrimaryId
          }))
        }),
      })
      
      if (!response.ok) {
        // Si la réponse contient un message d'erreur, l'afficher
        const errorData = await response.json()
        console.error("Réponse d'erreur:", errorData)
        if (errorData.error) {
          throw new Error(errorData.error)
        }
        throw new Error("Erreur lors de l'enregistrement des spécialités")
      }
      
      // Mettre à jour la progression
      await updateProgress("specialties")
      
      // Rediriger vers l'étape suivante
      router.push("/onboarding/artisan/documents")
    } catch (error) {
      console.error("Erreur:", error)
      setSilentMode(false)
      toast({
        title: "Erreur",
        description: typeof error === 'object' && error !== null && 'message' in error 
          ? (error as Error).message
          : "Impossible d'enregistrer vos spécialités.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      // On garde le mode silencieux actif
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
    <OnboardingLayout 
      currentStep="specialties"
      title="Vos spécialités"
      description="Sélectionnez les domaines dans lesquels vous offrez vos services."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Compétences et services</CardTitle>
          <CardDescription>
            Sélectionnez toutes les spécialités que vous proposez à vos clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="specialties">Spécialités (sélectionnez au moins une)</Label>
              <div className="mt-2">
                <SpecialtiesSelector
                  selectedSpecialties={selectedSpecialties}
                  onChange={setSelectedSpecialties}
                  onPrimaryChange={setPrimarySpecialtyId}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-4 hidden md:flex">
          <Button
            variant="outline"
            onClick={() => router.push("/onboarding/artisan/location")}
          >
            Retour
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || selectedSpecialties.length === 0}>
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
    </OnboardingLayout>
  )
} 