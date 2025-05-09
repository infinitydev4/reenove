"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/page-header"
import GoogleMapComponent from "@/components/maps/GoogleMapComponent"

export default function LocationPage() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem("projectLocation")
    if (savedData) {
      const { address, city, postalCode } = JSON.parse(savedData)
      setAddress(address || "")
      setCity(city || "")
      setPostalCode(postalCode || "")
      
      // Si nous avons déjà toutes les données, afficher la carte
      if (address && city && postalCode) {
        setShowMap(true)
      }
    }
  }, [])

  useEffect(() => {
    // Valider le formulaire
    const valid = 
        address.trim().length > 0 && 
        city.trim().length > 0 && 
        postalCode.trim().length === 5 && 
        /^\d{5}$/.test(postalCode)
    
    setIsFormValid(valid)
    
    // Afficher la carte seulement si nous avons toutes les données nécessaires
    setShowMap(valid)
  }, [address, city, postalCode])

  const saveAndContinue = () => {
    if (!isFormValid) return
    
    setIsSubmitting(true)
    
    try {
    // Sauvegarder les données
    localStorage.setItem(
      "projectLocation",
      JSON.stringify({
        address,
        city,
        postalCode,
          locationType: "onsite" // Toujours sur place
      })
    )
    
    // Naviguer vers l'étape suivante
    router.push("/create-project/date")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la localisation:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      },
    },
    exit: { opacity: 0 }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    }
  }

  return (
    <form id="project-form" onSubmit={(e) => { 
      e.preventDefault(); 
      // Vérifier que la soumission vient du bouton Suivant
      const submitter = (e.nativeEvent as any).submitter;
      if (submitter && submitter.id === "submit-button") {
        saveAndContinue();
      }
    }}>
      <div className="space-y-2 md:space-y-6">
        <PageHeader
          title="Localisation du projet"
          description="Indiquez où se déroulera votre projet"
          className="mb-2 md:mb-6"
        />

      <motion.div
        variants={containerVariants}
        initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-2 md:space-y-6"
      >
          <motion.div variants={itemVariants} className="mb-1 md:mb-3">
            <Card className="border-primary">
              <CardContent className="py-2 md:py-4 px-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 md:h-8 md:w-8 text-primary shrink-0" />
                  <div>
                    <Label className="text-sm md:text-lg font-medium">Sur place</Label>
                    <p className="text-[9px] md:text-sm text-muted-foreground">
                    L&apos;artisan se déplacera à l&apos;adresse indiquée
                  </p>
                </div>
                </div>
              </CardContent>
            </Card>
        </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid gap-2 md:gap-6 p-2 md:p-6 border rounded-lg"
          >
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="address" className="text-xs md:text-base font-medium">Adresse</Label>
              <Input
                id="address"
                placeholder="Numéro et nom de rue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="text-sm py-1 md:py-2"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="city" className="text-xs md:text-base font-medium">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-sm py-1 md:py-2"
                />
              </div>
              
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="postalCode" className="text-xs md:text-base font-medium">Code postal</Label>
                <Input
                  id="postalCode"
                  placeholder="Code postal"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => {
                    // Accepter uniquement les chiffres
                    const value = e.target.value.replace(/\D/g, '')
                    setPostalCode(value)
                  }}
                  className="text-sm py-1 md:py-2"
                />
                {postalCode && !/^\d{5}$/.test(postalCode) && (
                  <p className="text-[9px] md:text-xs text-destructive">Le code postal doit contenir 5 chiffres</p>
                )}
              </div>
            </div>
            
            {/* Google Map pour visualiser l'adresse */}
            {showMap && (
              <div className="mt-2 md:mt-4">
                <Label className="text-xs md:text-base font-medium mb-1 md:mb-2 block">Visualisation sur la carte</Label>
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  onMouseDown={(e) => e.stopPropagation()}
                  className="map-container"
                >
                  <GoogleMapComponent 
                    address={address}
                    city={city}
                    postalCode={postalCode}
                    mapHeight="200px"
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </motion.div>

        <motion.div
          variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-between pt-2 md:pt-6 hidden sm:flex"
        >
          <Button
              type="button"
            variant="outline"
            onClick={() => router.push("/create-project/budget")}
            className="flex items-center gap-2"
              size="sm"
          >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            Précédent
          </Button>
          
          <Button
              type="submit"
              id="submit-button"
              disabled={!isFormValid || isSubmitting}
            className="flex items-center gap-2"
              size="sm"
          >
              {isSubmitting ? "Enregistrement..." : "Suivant"}
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
    </form>
  )
} 