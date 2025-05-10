"use client"

import { useState, useCallback, useEffect, useMemo, useRef } from "react"
import { GoogleMap, Circle, Marker, useJsApiLoader, Libraries } from "@react-google-maps/api"
import { Loader2, Map as MapIcon, Maximize, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// Bibliothèques à charger
const libraries: Libraries = ['places']

interface InterventionRadiusMapProps {
  address: string
  city: string
  postalCode: string
  radius: number // en km
  className?: string
  mapHeight?: string
  onRadiusChange?: (newRadius: number) => void
}

const defaultCenter = { lat: 46.603354, lng: 1.888334 } // Centre de la France par défaut

export default function InterventionRadiusMap({
  address, 
  city, 
  postalCode, 
  radius,
  onRadiusChange,
  className = "", 
  mapHeight = "300px" 
}: InterventionRadiusMapProps) {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [mapRef, setMapRef] = useState<any>(null)
  const [mapType, setMapType] = useState<string>("roadmap")
  const circleRef = useRef<google.maps.Circle | null>(null)
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  })

  // Convertir le rayon en mètres pour l'API Google Maps
  const radiusInMeters = useMemo(() => radius * 1000, [radius])

  // Ajuster automatiquement le zoom quand le rayon change
  useEffect(() => {
    if (mapRef && coordinates) {
      const zoomLevel = getZoomLevelForRadius(radiusInMeters)
      mapRef.setZoom(zoomLevel)
      
      // Effacer tous les anciens overlays de la carte
      if (window.google && window.google.maps) {
        mapRef.overlayMapTypes.clear();
      }
    }
  }, [radiusInMeters, mapRef, coordinates])

  // Géocodage de l'adresse
  useEffect(() => {
    if (!isLoaded || !address || !city || !postalCode) return

    const fullAddress = `${address}, ${postalCode} ${city}, France`
    
    // Effacer le cercle existant lorsque l'adresse change
    if (circleRef.current) {
      circleRef.current.setMap(null)
      circleRef.current = null
    }
    
    // Utiliser l'API de géocodage pour obtenir les coordonnées
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode(
        { address: fullAddress }, 
        (
          results: google.maps.GeocoderResult[] | null, 
          status: google.maps.GeocoderStatus
        ) => {
          if (status === "OK" && results && results[0] && results[0].geometry && results[0].geometry.location) {
            const location = results[0].geometry.location
            setCoordinates({
              lat: location.lat(),
              lng: location.lng()
            })
            
            // Centrer la carte sur la nouvelle position et ajuster le zoom selon le rayon
            if (mapRef) {
              mapRef.panTo({
                lat: location.lat(),
                lng: location.lng()
              })
              
              const zoomLevel = getZoomLevelForRadius(radiusInMeters)
              mapRef.setZoom(zoomLevel)
              
              // Recréer immédiatement le cercle
              if (!circleRef.current && window.google && window.google.maps) {
                circleRef.current = new window.google.maps.Circle({
                  map: mapRef,
                  center: {
                    lat: location.lat(),
                    lng: location.lng()
                  },
                  radius: radiusInMeters,
                  strokeColor: "#F59E0B", // Couleur jaune/ambre pour le contour
                  strokeOpacity: 0.8,
                  strokeWeight: radius > 100 ? 3 : 2,
                  fillColor: "#F59E0B", // Couleur jaune/ambre pour le remplissage
                  fillOpacity: Math.max(0.08, 0.2 - (radius / 1000)),
                  clickable: false,
                  draggable: false,
                  editable: false,
                  visible: true,
                  zIndex: 1
                });
              }
            }
          } else {
            console.error("Géocodage impossible pour cette adresse:", fullAddress)
          }
        }
      )
    }
  }, [isLoaded, address, city, postalCode, mapRef, radiusInMeters, radius])

  // Calculer le niveau de zoom approprié pour afficher tout le rayon
  const getZoomLevelForRadius = (radiusInMeters: number) => {
    // Logarithme inverse pour déterminer le zoom en fonction du rayon
    // Plus le rayon est grand, plus on dézoom pour avoir une vue d'ensemble
    const earthCircumference = 40075000; // circonférence de la terre en mètres
    const zoomLevel = Math.log2(earthCircumference / (radiusInMeters * 2 * Math.PI)) - 0.5;
    
    // Limiter entre 6 (vue plus large) et 13 (vue plus proche)
    // Rayon plus grand = zoom plus petit
    return Math.min(Math.max(Math.floor(zoomLevel), 6), 13);
  }

  const onLoad = useCallback((map: any) => {
    setMapRef(map)
  }, [])

  const onUnmount = useCallback(() => {
    if (circleRef.current) {
      circleRef.current.setMap(null)
      circleRef.current = null
    }
    setMapRef(null)
  }, [])

  // Mettre à jour le cercle lorsque les coordonnées ou le rayon changent
  useEffect(() => {
    if (!isLoaded || !coordinates || !mapRef) return
    
    // Si le cercle existe déjà, on met à jour ses propriétés
    if (circleRef.current) {
      circleRef.current.setCenter(coordinates)
      circleRef.current.setRadius(radiusInMeters)
      circleRef.current.setOptions({
        strokeWeight: radius > 100 ? 3 : 2,
        fillOpacity: Math.max(0.08, 0.2 - (radius / 1000))
      })
    } 
    // Sinon, on crée un nouveau cercle
    else if (window.google && window.google.maps) {
      circleRef.current = new window.google.maps.Circle({
        map: mapRef,
        center: coordinates,
        radius: radiusInMeters,
        strokeColor: "#F59E0B", // Couleur jaune/ambre pour le contour
        strokeOpacity: 0.8,
        strokeWeight: radius > 100 ? 3 : 2,
        fillColor: "#F59E0B", // Couleur jaune/ambre pour le remplissage
        fillOpacity: Math.max(0.08, 0.2 - (radius / 1000)),
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        zIndex: 1
      });
    }
  }, [isLoaded, coordinates, radiusInMeters, mapRef, radius]);

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

  // Fonction pour centrer sur le marqueur et ajuster le zoom pour le rayon
  const centerOnRadius = () => {
    if (mapRef && coordinates) {
      mapRef.panTo(coordinates)
      const zoomLevel = getZoomLevelForRadius(radiusInMeters)
      mapRef.setZoom(zoomLevel)
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
        zoom={coordinates ? getZoomLevelForRadius(radiusInMeters) : 5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          mapTypeId: mapType,
        }}
      >
        {coordinates && (
          <Marker position={coordinates} />
        )}
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
            centerOnRadius();
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
      
      {/* Indication du rayon en bas de carte */}
      <div className="absolute bottom-2 left-2 bg-gray-800/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white font-medium shadow-sm">
        {radius} km
      </div>
    </div>
  )
} 