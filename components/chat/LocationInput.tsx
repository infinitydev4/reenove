"use client"

import React, { useEffect, useRef, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin } from "lucide-react"
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
  const [isMobile, setIsMobile] = useState(false)

  // Détecter si l'appareil est mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // Style global pour forcer l'affichage de l'autocomplétion
  useEffect(() => {
    // Injecter un style global pour positionner la liste de suggestions
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
  }, [isMobile])

  // Initialiser l'autocomplétion Google Maps
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places || !inputRef.current) {
      return
    }

    const autocompleteOptions = {
      componentRestrictions: { country: "fr" },
      types: ["address"],
      fields: ["address_components", "formatted_address", "geometry"]
    }

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, autocompleteOptions)
    
    // Optimisations pour mobile
    if (isMobile) {
      // Certaines optimisations pour mobile
      autocomplete.setOptions({
        strictBounds: false
      })
    }

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
      
      // Masquer le clavier sur mobile après la sélection
      if (isMobile && inputRef.current) {
        inputRef.current.blur()
      }
      
      // Mettre à jour les états
      onLocationUpdate(newAddress, newCity, newPostalCode)
      setAddressSelected(true)
    })

    // Nettoyer quand le composant est démonté
    return () => {
      google.maps.event.removeListener(listener)
    }
  }, [address, city, postalCode, onLocationUpdate, isMobile])

  const isConfirmButtonDisabled = !showMap || !addressSelected

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
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="Saisissez votre adresse"
              className="bg-muted/30 border-muted w-full pl-10"
              autoComplete="street-address"
              type="text"
              inputMode="text"
            />
            
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
              <MapPin className="h-4 w-4" />
            </div>
            
            {addressSelected && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
        
        {addressSelected && (
          <>
            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
              <div>
                <Label htmlFor="city" className="text-sm font-medium mb-1 block">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={city}
                  onChange={(e) => onCityChange(e.target.value)}
                  className="bg-muted/30 border-muted"
                  autoComplete="address-level2"
                />
              </div>
              
              <div>
                <Label htmlFor="postalCode" className="text-sm font-medium mb-1 block">Code postal</Label>
                <Input
                  id="postalCode"
                  placeholder="Code postal"
                  maxLength={5}
                  value={postalCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    onPostalCodeChange(value)
                  }}
                  className="bg-muted/30 border-muted"
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
              </div>
            </div>
            
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