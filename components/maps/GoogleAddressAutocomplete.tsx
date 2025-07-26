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
  console.log('🚨 GOOGLE MAPS - COMPOSANT RENDU avec value:', value)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  
  // SOLUTION: Utiliser des refs pour stabiliser les callbacks
  const onChangeRef = useRef(onChange)
  const onPlaceSelectRef = useRef(onPlaceSelect)
  
  // Mettre à jour les refs sans déclencher de re-render
  onChangeRef.current = onChange
  onPlaceSelectRef.current = onPlaceSelect
  
  const [isFocused, setIsFocused] = useState(false)
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  })

  console.log('🚨 GOOGLE MAPS - isLoaded:', isLoaded)

  // Initialiser l'autocomplétion lorsque l'API est chargée
  useEffect(() => {
    console.log('🚨 GOOGLE MAPS - useEffect initialisation, isLoaded:', isLoaded, 'inputRef:', !!inputRef.current)
    
    if (!isLoaded || !inputRef.current) {
      console.log('🚨 GOOGLE MAPS - Conditions non remplies pour initialisation')
      return
    }
    
    console.log('🚨 GOOGLE MAPS - Initialisation Google Places Autocomplete')
    
    // Créer l'instance d'autocomplétion
    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'fr' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      })
      
      console.log('🚨 GOOGLE MAPS - Autocomplete créé avec succès')
    } catch (error) {
      console.error('🚨 GOOGLE MAPS - Erreur création autocomplete:', error)
      return
    }
    
    // Écouter la sélection d'un lieu
    const placeChangedCallback = () => {
      if (!autocompleteRef.current) return
      
      const place = autocompleteRef.current.getPlace()
      
      if (place && place.formatted_address) {
        console.log('🚨 GOOGLE MAPS - Place sélectionnée:', place.formatted_address)
        console.log('🚨 GOOGLE MAPS - Ancienne valeur input:', inputRef.current?.value)
        
        // FORCER la mise à jour avec plusieurs méthodes
        if (inputRef.current) {
          console.log('🚨 GOOGLE MAPS - Début mise à jour forcée')
          
          // Méthode 1: Setter natif
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set
          
          if (nativeInputValueSetter) {
            console.log('🚨 GOOGLE MAPS - Utilisation setter natif')
            nativeInputValueSetter.call(inputRef.current, place.formatted_address)
          }
          
          // Méthode 2: Propriété directe (fallback)
          inputRef.current.value = place.formatted_address
          
          console.log('🚨 GOOGLE MAPS - Valeur après setter:', inputRef.current.value)
          
          // Méthode 3: Événements multiples pour forcer React
          const inputEvent = new Event('input', { bubbles: true })
          const changeEvent = new Event('change', { bubbles: true })
          
          console.log('🚨 GOOGLE MAPS - Déclenchement événements')
          inputRef.current.dispatchEvent(inputEvent)
          inputRef.current.dispatchEvent(changeEvent)
          
          // Méthode 4: Simuler une vraie saisie utilisateur
          inputRef.current.focus()
          inputRef.current.select()
          
          console.log('🚨 GOOGLE MAPS - Événements déclenchés')
        }
        
        console.log('🚨 GOOGLE MAPS - Appel onChange avec:', place.formatted_address)
        
        // FORCER React à mettre à jour en dernier
        setTimeout(() => {
          console.log('🚨 GOOGLE MAPS - setTimeout onChange avec:', place.formatted_address)
          if (place.formatted_address) {
            onChangeRef.current(place.formatted_address)
          }
        }, 0)
        
        // Appeler le callback si fourni
        if (onPlaceSelectRef.current) {
          console.log('🚨 GOOGLE MAPS - Appel onPlaceSelect')
          onPlaceSelectRef.current(place)
        }
        
        console.log('🚨 GOOGLE MAPS - Fin du processus de sélection')
      } else {
        console.log('🚨 GOOGLE MAPS - Pas de place ou formatted_address valide')
      }
    }
    
    // Ajouter le listener
    if (autocompleteRef.current) {
      console.log('🚨 GOOGLE MAPS - Ajout du listener place_changed')
      
      const listener = autocompleteRef.current.addListener('place_changed', placeChangedCallback)
      
      console.log('🚨 GOOGLE MAPS - Listener ajouté avec succès:', !!listener)
      
      // Nettoyage
      return () => {
        console.log('🚨 GOOGLE MAPS - Nettoyage du listener')
        if (window.google && listener) {
          window.google.maps.event.removeListener(listener)
        }
      }
    } else {
      console.log('🚨 GOOGLE MAPS - ERREUR: autocompleteRef.current est null !')
    }
  }, [isLoaded])

  // Synchroniser la valeur externe avec l'input DOM
  useEffect(() => {
    console.log('🚨 GOOGLE MAPS - Sync value effect, inputRef:', !!inputRef.current, 'value:', value)
    if (inputRef.current && inputRef.current.value !== value) {
      console.log('🚨 GOOGLE MAPS - Mise à jour DOM value:', inputRef.current.value, '->', value)
      inputRef.current.value = value
    }
  }, [value])

  // Gérer la saisie manuelle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    console.log('🚨 GOOGLE MAPS - Saisie manuelle:', newValue)
    onChangeRef.current(newValue)
  }

  console.log('🚨 GOOGLE MAPS - RENDU du composant Input, isLoaded:', isLoaded, 'disabled:', disabled || !isLoaded)

  return (
    <div className="relative">
      <MapPin className={cn(
        "absolute left-3 top-3 h-4 w-4",
        isFocused ? "text-primary" : "text-muted-foreground"
      )} />
      <Input 
        ref={inputRef}
        type="text" 
        defaultValue={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        disabled={disabled || !isLoaded}
        onFocus={() => {
          console.log('🚨 GOOGLE MAPS - Input FOCUS')
          setIsFocused(true)
        }}
        onBlur={() => {
          console.log('🚨 GOOGLE MAPS - Input BLUR')
          setIsFocused(false)
        }}
        onClick={() => {
          console.log('🚨 GOOGLE MAPS - Input CLICK')
        }}
        onKeyDown={(e) => {
          console.log('🚨 GOOGLE MAPS - Input KEYDOWN:', e.key)
        }}
      />
    </div>
  )
} 