"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function LocationPage() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [locationType, setLocationType] = useState("onsite")
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem("projectLocation")
    if (savedData) {
      const { address, city, postalCode, locationType } = JSON.parse(savedData)
      setAddress(address || "")
      setCity(city || "")
      setPostalCode(postalCode || "")
      setLocationType(locationType || "onsite")
    }
  }, [])

  useEffect(() => {
    // Valider le formulaire
    let valid = true
    
    if (locationType === "onsite") {
      valid = 
        address.trim().length > 0 && 
        city.trim().length > 0 && 
        postalCode.trim().length === 5 && 
        /^\d{5}$/.test(postalCode)
    }
    
    setIsFormValid(valid)
  }, [address, city, postalCode, locationType])

  const saveAndContinue = () => {
    if (!isFormValid) return
    
    // Sauvegarder les données
    localStorage.setItem(
      "projectLocation",
      JSON.stringify({
        address,
        city,
        postalCode,
        locationType
      })
    )
    
    // Naviguer vers l'étape suivante
    router.push("/create-project/date")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Localisation du projet</h1>
        <p className="text-muted-foreground mt-2">
          Indiquez où se déroulera votre projet pour trouver des artisans à proximité
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <RadioGroup
            defaultValue={locationType}
            value={locationType}
            onValueChange={setLocationType}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <Card className={`cursor-pointer border-2 transition-all ${
              locationType === "onsite" ? "border-primary" : "border-border"
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <MapPin className="h-10 w-10 mb-4 text-primary" />
                  <Label htmlFor="onsite" className="text-lg font-medium mb-2">
                    Sur place
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    L'artisan se déplacera à l'adresse indiquée
                  </p>
                  <RadioGroupItem
                    value="onsite"
                    id="onsite"
                    className="sr-only"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`cursor-pointer border-2 transition-all ${
              locationType === "remote" ? "border-primary" : "border-border"
            }`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <MapPin className="h-10 w-10 mb-4 text-primary" />
                  <Label htmlFor="remote" className="text-lg font-medium mb-2">
                    À distance
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Travail réalisable à distance (conseils, plans, etc.)
                  </p>
                  <RadioGroupItem
                    value="remote"
                    id="remote"
                    className="sr-only"
                  />
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </motion.div>

        {locationType === "onsite" && (
          <motion.div
            variants={itemVariants}
            className="grid gap-6 p-6 border rounded-lg"
          >
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="Numéro et nom de rue"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
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
                />
                {postalCode && !/^\d{5}$/.test(postalCode) && (
                  <p className="text-sm text-destructive">Le code postal doit contenir 5 chiffres</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-between pt-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/create-project/budget")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <Button
            onClick={saveAndContinue}
            disabled={!isFormValid}
            className="flex items-center gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
} 