"use client"

import React, { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Info } from "lucide-react"
import GoogleMapComponent from "@/components/maps/GoogleMapComponent"

interface LocationInputProps {
  address: string
  city: string
  postalCode: string
  showMap: boolean
  onAddressChange: (address: string) => void
  onCityChange: (city: string) => void
  onPostalCodeChange: (postalCode: string) => void
  onLocationUpdate: (address: string, city: string, postalCode: string) => void
  onSubmit: () => void
}

export default function LocationInput({
  address,
  city,
  postalCode,
  showMap,
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  onLocationUpdate,
  onSubmit
}: LocationInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [addressSelected, setAddressSelected] = useState(false)
  const [manualEntry, setManualEntry] = useState(false)

  // Vérifier si les champs sont valides
  const isAddressValid = address.trim().length > 0
  const isCityValid = city.trim().length > 0
  const isPostalCodeValid = postalCode.trim().length === 5 && /^\d{5}$/.test(postalCode)
  
  // Activer le bouton si les champs sont valides
  const isFormValid = isAddressValid && isCityValid && isPostalCodeValid

  // Style global pour forcer l'affichage de l'autocomplétion au-dessus du champ et du libellé
  useEffect(() => {
    // Injecter un style global pour positionner la liste de suggestions au-dessus
    const styleElement = document.createElement('style')
    styleElement.textContent = `
      .pac-container {
        z-index: 9999;
        transform: translateY(-150%);
        margin-bottom: 10px;
        box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 -2px 4px -1px rgba(0, 0, 0, 0.06);
      }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Initialiser l'autocomplétion Google Maps
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places || !inputRef.current || manualEntry) {
      return
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "fr" },
      types: ["address"],
      fields: ["address_components", "formatted_address", "geometry"]
    })

    // Écouter les événements de changement de place
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()
      
      let newAddress = address
      let newCity = city
      let newPostalCode = postalCode
      
      if (place.formatted_address) {
        newAddress = place.formatted_address
      }
      
      if (place.address_components) {
        place.address_components.forEach(component => {
          if (component.types.includes("postal_code")) {
            newPostalCode = component.long_name
          }
          
          if (component.types.includes("locality")) {
            newCity = component.long_name
          }
        })
      }
      
      // Mettre à jour les états
      onLocationUpdate(newAddress, newCity, newPostalCode)
      setAddressSelected(true)
    })

    // Nettoyer quand le composant est démonté
    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [address, city, postalCode, onLocationUpdate, manualEntry])

  // Afficher les champs supplémentaires lorsque l'utilisateur commence à taper manuellement
  useEffect(() => {
    if (address.trim().length > 0 && !addressSelected && !manualEntry) {
      setManualEntry(true)
    }
  }, [address, addressSelected, manualEntry])

  // Mettre à jour l'adresse, la ville et le code postal manuellement
  const handleManualAddressUpdate = (newAddress: string) => {
    onAddressChange(newAddress)
    onLocationUpdate(newAddress, city, postalCode)
  }

  const handleManualCityUpdate = (newCity: string) => {
    onCityChange(newCity)
    onLocationUpdate(address, newCity, postalCode)
  }

  const handleManualPostalCodeUpdate = (newPostalCode: string) => {
    const value = newPostalCode.replace(/\D/g, '')
    onPostalCodeChange(value)
    onLocationUpdate(address, city, value)
    
    // Mettre à jour le showMap si tous les champs sont valides
    if (address.trim().length > 0 && city.trim().length > 0 && value.length === 5) {
      setAddressSelected(true)
    }
  }

  // Bouton activé si les champs sont valides (via API ou saisie manuelle)
  const isConfirmButtonDisabled = !(isFormValid && (showMap || manualEntry))

  return (
    <div className="p-3 border-t">
      <div className="grid gap-3">
        <div>
          <Label htmlFor="address" className="text-sm font-medium mb-1 block">Adresse complète</Label>
          <div className="relative">
            <Input
              ref={inputRef}
              id="address"
              value={address}
              onChange={(e) => handleManualAddressUpdate(e.target.value)}
              placeholder="Saisissez votre adresse"
              className="bg-muted/30 border-muted w-full"
            />
            
            {addressSelected && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
        
        {(addressSelected || manualEntry || address.trim().length > 0) && (
          <>
            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
              <div>
                <Label htmlFor="city" className="text-sm font-medium mb-1 block">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => handleManualCityUpdate(e.target.value)}
                  className="bg-muted/30 border-muted"
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode" className="text-sm font-medium mb-1 block">Code postal</Label>
                <Input
                  id="postalCode"
                  placeholder="Code postal"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => handleManualPostalCodeUpdate(e.target.value)}
                  className="bg-muted/30 border-muted"
                />
              </div>
            </div>
            
            {manualEntry && !showMap && (
              <div className="bg-[#0E261C] border border-[#FCDA89]/20 rounded-md p-2 text-xs text-white/80 flex items-start gap-2">
                <Info className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                <span>Remplissez tous les champs pour continuer. Le code postal doit contenir 5 chiffres.</span>
              </div>
            )}
            
            {showMap && (
              <div className="mt-2 animate-fadeIn">
                <div className="rounded-lg overflow-hidden h-[200px] md:h-[250px]">
                  <GoogleMapComponent
                    address={address}
                    city={city}
                    postalCode={postalCode}
                    mapHeight="100%"
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        <Button
          onClick={onSubmit}
          disabled={isConfirmButtonDisabled}
          className={`mt-1 transition-all duration-300 ${!isConfirmButtonDisabled 
            ? "bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" 
            : "bg-muted/50 text-muted-foreground"}`}
        >
          Confirmer cette adresse
        </Button>
      </div>
    </div>
  )
} 