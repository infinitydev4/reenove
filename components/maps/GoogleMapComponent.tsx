"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, Marker, useJsApiLoader, Libraries } from "@react-google-maps/api"
import { Plus, Minus, Maximize, Map as MapIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Définir les bibliothèques à charger comme une constante en dehors du composant
// pour éviter de recréer ce tableau à chaque rendu
const libraries: Libraries = ['places']

interface GoogleMapComponentProps {
  address: string
  city: string
  postalCode: string
  className?: string
  mapHeight?: string
}

const defaultCenter = { lat: 46.603354, lng: 1.888334 } // Centre de la France par défaut

export default function GoogleMapComponent({ 
  address, 
  city, 
  postalCode, 
  className = "", 
  mapHeight = "300px" 
}: GoogleMapComponentProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [mapRef, setMapRef] = useState<any>(null)
  const [mapType, setMapType] = useState<string>("roadmap")
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  })

  // Géocodage de l'adresse
  useEffect(() => {
    if (!isLoaded || !address || !city || !postalCode) return

    const fullAddress = `${address}, ${postalCode} ${city}, France`
    
    // Utiliser l'API de géocodage pour obtenir les coordonnées
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === "OK" && results && results[0] && results[0].geometry && results[0].geometry.location) {
          const location = results[0].geometry.location
          setCoordinates({
            lat: location.lat(),
            lng: location.lng()
          })
          
          // Centrer la carte sur la nouvelle position
          if (mapRef) {
            mapRef.panTo({
              lat: location.lat(),
              lng: location.lng()
            })
          }
        } else {
          console.error("Géocodage impossible pour cette adresse:", fullAddress)
        }
      })
    }
  }, [isLoaded, address, city, postalCode, mapRef])

  const onLoad = useCallback((map: any) => {
    setMapRef(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMapRef(null)
  }, [])

  // Fonctions pour contrôler le zoom
  const handleZoomIn = () => {
    if (mapRef) {
      mapRef.setZoom((mapRef.getZoom() || 5) + 1)
    }
  }

  const handleZoomOut = () => {
    if (mapRef) {
      mapRef.setZoom((mapRef.getZoom() || 5) - 1)
    }
  }

  // Fonction pour alterner entre les types de carte
  const toggleMapType = () => {
    if (mapRef && window.google) {
      if (mapType === "roadmap") {
        setMapType("satellite")
        mapRef.setMapTypeId("satellite")
      } else {
        setMapType("roadmap")
        mapRef.setMapTypeId("roadmap")
      }
    }
  }

  // Fonction pour centrer sur le marqueur
  const centerOnMarker = () => {
    if (mapRef && coordinates) {
      mapRef.panTo(coordinates)
      mapRef.setZoom(15)
    }
  }

  if (!isLoaded) return (
    <div 
      className={`bg-slate-100/50 rounded-md flex items-center justify-center ${className}`}
      style={{ height: mapHeight }}
    >
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-5 w-5 text-primary animate-spin" />
        <p className="text-xs text-muted-foreground">Chargement de la carte...</p>
      </div>
    </div>
  )

  return (
    <div className={`rounded-lg overflow-hidden border relative ${className}`} style={{ height: mapHeight }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={coordinates || defaultCenter}
        zoom={coordinates ? 15 : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          mapTypeId: mapType,
        }}
      >
        {coordinates && <Marker position={coordinates} />}
      </GoogleMap>
      
      {/* Contrôles personnalisés */}
      <div className="absolute top-2 right-2 flex flex-col gap-1">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomIn();
          }} 
          type="button"
          className="h-7 w-7 bg-white/90 hover:bg-white border shadow-sm"
        >
          <Plus className="h-4 w-4 text-gray-700" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomOut();
          }}
          type="button" 
          className="h-7 w-7 bg-white/90 hover:bg-white border shadow-sm"
        >
          <Minus className="h-4 w-4 text-gray-700" />
        </Button>
      </div>
      
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            centerOnMarker();
          }}
          type="button"
          className="h-7 w-7 bg-white/90 hover:bg-white border shadow-sm"
          disabled={!coordinates}
        >
          <Maximize className="h-4 w-4 text-gray-700" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMapType();
          }}
          type="button"
          className="h-7 w-7 bg-white/90 hover:bg-white border shadow-sm"
        >
          <MapIcon className="h-4 w-4 text-gray-700" />
        </Button>
      </div>
      
      {/* Coordonnées en bas de carte */}
      {coordinates && (
        <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[8px] md:text-xs text-gray-700 font-mono">
          {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </div>
      )}
    </div>
  )
} 