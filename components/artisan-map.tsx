"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface ArtisanMapProps {
  coordinates: {
    lat: number
    lng: number
  }
  name: string
}

export default function ArtisanMap({ coordinates, name }: ArtisanMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Cette fonction simule l'affichage d'une carte
    // Dans une application réelle, vous utiliseriez une bibliothèque comme Leaflet ou Google Maps
    if (mapRef.current) {
      const mapContainer = mapRef.current

      // Créer un élément de carte simulé
      mapContainer.innerHTML = `
        <div class="relative w-full h-full bg-gray-200 overflow-hidden">
          <div class="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800&query=map+of+Lyon+France')] bg-cover bg-center"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="flex flex-col items-center">
              <div class="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div class="mt-1 px-2 py-1 bg-background rounded-md shadow-md text-xs font-medium">
                ${name}
              </div>
            </div>
          </div>
          <div class="absolute bottom-2 right-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs">
            Lat: ${coordinates.lat.toFixed(6)}, Lng: ${coordinates.lng.toFixed(6)}
          </div>
        </div>
      `
    }
  }, [coordinates, name])

  return (
    <div className="relative h-64 w-full">
      <div ref={mapRef} className="h-full w-full"></div>
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Zone d&apos;intervention: Lyon et sa périphérie (jusqu&apos;à 50km)</span>
        </div>
      </div>
    </div>
  )
}
