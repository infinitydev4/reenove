"use client"

import { useEffect, useRef, useState } from "react"
import { useJsApiLoader } from "@react-google-maps/api"
import { Input } from "@/components/ui/input"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

// Bibliothèques à charger
const libraries: any = ['places']

interface GoogleAddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export default function GoogleAddressAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  className,
  placeholder = "Saisissez votre adresse...",
  disabled = false
}: GoogleAddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  })

  // Initialiser l'autocomplétion lorsque l'API est chargée
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return
    
    // Créer l'autocomplétion
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'fr' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    })
    
    // Écouter les événements de sélection de lieu
    if (!autocompleteRef.current) return
    
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      if (!autocompleteRef.current) return
      
      const place = autocompleteRef.current.getPlace()
      
      if (place && place.formatted_address) {
        onChange(place.formatted_address)
        
        // Extraire le code postal et la ville
        if (onPlaceSelect && place.address_components) {
          onPlaceSelect(place)
        }
      }
    })
    
    // Nettoyage
    return () => {
      if (window.google && listener) {
        window.google.maps.event.removeListener(listener)
      }
    }
  }, [isLoaded, onChange, onPlaceSelect])
  
  // Fonction pour extraire les composants d'adresse
  const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components || []
    const result: Record<string, string> = {}
    
    for (const component of addressComponents) {
      const types = component.types
      
      if (types.includes('postal_code')) {
        result.postalCode = component.long_name
      } else if (types.includes('locality')) {
        result.city = component.long_name
      } else if (types.includes('route')) {
        result.route = component.long_name
      } else if (types.includes('street_number')) {
        result.streetNumber = component.long_name
      }
    }
    
    return result
  }

  return (
    <div className="relative">
      <MapPin className={cn(
        "absolute left-3 top-3 h-4 w-4",
        isFocused ? "text-primary" : "text-muted-foreground"
      )} />
      <Input 
        ref={inputRef}
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        disabled={disabled || !isLoaded}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </div>
  )
} 