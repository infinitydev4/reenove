"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, User, MapPin, Clipboard, Loader2, Zap, ImageIcon, Ruler, Building, Home, SquareAsterisk } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import Image from "next/image"

import { Message, ProjectState } from "./ChatContainer"
import { ProjectDetails } from "./ProjectDetailsForm"

interface ChatMessagesProps {
  messages: Message[]
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  projectState: ProjectState
  handleCategorySelect: (categoryId: string) => void
  handleServiceSelect: (serviceId: string) => void
  handleProjectAccept: () => void
}

export default function ChatMessages({
  messages,
  isLoading,
  messagesEndRef,
  projectState,
  handleCategorySelect,
  handleServiceSelect,
  handleProjectAccept
}: ChatMessagesProps) {
  // Rendu des messages
  const renderMessage = (message: Message) => {
    switch (message.type) {
      case "user":
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              {message.content}
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )
      
      case "bot":
        return (
          <div className="flex items-start gap-2.5 self-start">
            <div className="bg-[#0E261C] p-1.5 rounded-full border-[0.5px] border-[#FCDA89]/20 self-start">
              <Bot className="h-4 w-4 text-[#FCDA89]" />
            </div>
            <div className="bg-card p-3 rounded-xl rounded-bl-sm max-w-[85%] shadow-sm border border-muted">
              <div className="space-y-2">
                <div>{message.content}</div>
                
                {message.options && (
                  <div className="grid gap-2 mt-3">
                    {message.options.map(option => (
                      <Button
                        key={option.id}
                        variant="outline"
                        className="justify-start text-left h-auto py-2 px-3 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => {
                          if (projectState.step === "category" && !projectState.category) {
                            handleCategorySelect(option.value)
                          } else {
                            handleServiceSelect(option.value)
                          }
                        }}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      
      case "system":
        return (
          <div className="flex items-start gap-3 self-center mx-auto">
            <div className="bg-muted/80 text-muted-foreground p-2.5 rounded-xl max-w-[80%] shadow-sm text-center text-sm">
              {message.content}
            </div>
          </div>
        )
      
      case "location":
        // Extraction des données de localisation pour la carte
        const address = message.location?.address || "";
        const city = message.location?.city || "";
        const postalCode = message.location?.postalCode || "";
        const encodedAddress = encodeURIComponent(`${address}, ${postalCode} ${city}`);
        const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${encodedAddress}&key=YOUR_API_KEY`;
        
        // URL de secours qui fonctionne sans clé API
        const fallbackMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=-0.1,51.5,-0.09,51.51&layer=mapnik&marker=${encodedAddress}`;
        
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="h-4 w-4 text-[#FCDA89]" />
                <span className="font-medium">Ma localisation</span>
              </div>
              <p className="mb-3">{message.content}</p>
              
              {/* Affichage de la carte */}
              <div className="w-full h-40 relative rounded-md overflow-hidden border border-white/10 mt-2">
                <iframe 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(`${address}, ${postalCode} ${city}`)}&layer=mapnik&marker=true`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  style={{ filter: "grayscale(0.5) contrast(1.2) brightness(0.8)" }}
                />
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-xs text-[#FCDA89]/80">
                  <Building className="h-3.5 w-3.5" />
                  <span>{city}, {postalCode}</span>
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#FCDA89] underline hover:text-[#FCDA89]/80"
                >
                  Voir sur Google Maps
                </a>
              </div>
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )
      
      case "photos":
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                <span className="font-medium">Photos de mon projet</span>
              </div>
              {message.photos && message.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {message.photos.map((photoUrl, index) => (
                    <div 
                      key={index} 
                      className="relative aspect-square rounded-md overflow-hidden border border-white/20"
                    >
                      <Image
                        src={photoUrl}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune photo</p>
              )}
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )
      
      case "details":
        // Extraire les détails du projet
        const details = message.projectDetails as ProjectDetails || {} as ProjectDetails;
        const surface = details.surface || "";
        const floor = details.floor || "0";
        const floorDisplay = floor === "0" ? "RDC" : `${floor}${floor === "1" ? "er" : "ème"} étage`;
        const hasElevator = details.hasElevator || false;
        const condition = details.condition || "bon";
        const propertyType = details.propertyType || "apartment";
        
        // Convertir le type de propriété et la condition en texte lisible
        const propertyTypeMap: Record<string, { name: string, icon: JSX.Element }> = {
          apartment: { name: "Appartement", icon: <Building className="h-5 w-5" /> },
          house: { name: "Maison", icon: <Home className="h-5 w-5" /> },
          commercial: { name: "Local commercial", icon: <div className="flex items-center justify-center font-bold h-5 w-5">C</div> }
        };
        
        const conditionMap: Record<string, { name: string, icon: string }> = {
          neuf: { name: "Neuf", icon: "✨" },
          bon: { name: "Bon état", icon: "👍" },
          vetuste: { name: "Vétuste", icon: "🔧" },
          demolir: { name: "À démolir", icon: "🏚️" }
        };
        
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Clipboard className="h-4 w-4 text-[#FCDA89]" />
                <span className="font-medium">Détails du bien</span>
              </div>
              
              {/* Carte détails */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-2 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                    <Ruler className="h-4 w-4 text-[#FCDA89]" />
                    <div>
                      <p className="text-xs text-white/60">Surface</p>
                      <p className="text-sm font-medium">{surface} m²</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                    <Building className="h-4 w-4 text-[#FCDA89]" />
                    <div>
                      <p className="text-xs text-white/60">Étage</p>
                      <p className="text-sm font-medium">{floorDisplay}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Type de propriété */}
              <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/10 mb-3">
                <div className="bg-[#FCDA89]/20 p-2 rounded-full">
                  {propertyTypeMap[propertyType]?.icon || <Home className="h-5 w-5 text-[#FCDA89]" />}
                </div>
                <div>
                  <p className="text-xs text-white/60">Type de propriété</p>
                  <p className="text-sm font-medium">{propertyTypeMap[propertyType]?.name || propertyType}</p>
                </div>
              </div>
              
              {/* État */}
              <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div className="bg-[#FCDA89]/20 p-2 rounded-full">
                  <span className="text-xl">{conditionMap[condition]?.icon || "🔍"}</span>
                </div>
                <div>
                  <p className="text-xs text-white/60">État actuel</p>
                  <p className="text-sm font-medium">{conditionMap[condition]?.name || condition}</p>
                </div>
                {hasElevator && (
                  <div className="ml-auto bg-[#FCDA89]/10 px-2 py-1 rounded text-xs text-[#FCDA89]">
                    Avec ascenseur
                  </div>
                )}
              </div>
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )
      
      case "selection":
        return (
          <div className="flex items-start gap-2.5 self-end">
            <div className="bg-[#0e261c] text-primary-foreground p-3 rounded-xl rounded-br-sm max-w-[85%] shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clipboard className="h-4 w-4" />
                <span className="font-medium">Sélection</span>
              </div>
              <p>{message.content}</p>
            </div>
            <div className="bg-primary/10 p-1.5 rounded-full self-start">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        )
      
      case "summary":
        // Calculer le pourcentage du prix (pour la jauge)
        const minPrice = message.estimatedPrice?.min || 0
        const maxPrice = message.estimatedPrice?.max || 0
        const avgPrice = (minPrice + maxPrice) / 2
        const priceRange = maxPrice - minPrice
        // Calculer la position de l'indicateur (largeur) en pourcentage
        const gaugePosition = 50 // Position centrée par défaut
        
        // Formater les prix avec séparateur de milliers
        const formatPrice = (price: number) => {
          return new Intl.NumberFormat('fr-FR').format(price)
        }
        
        return (
          <div className="flex items-start gap-2.5 self-start w-full">
            <div className="bg-[#0E261C] p-1.5 rounded-full border-[0.5px] border-[#FCDA89]/20 self-start">
              <Bot className="h-4 w-4 text-[#FCDA89]" />
            </div>
            <div className="bg-card p-4 rounded-xl rounded-bl-sm shadow-md border border-[#FCDA89]/20 flex-1 max-w-[90%]">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-black flex items-center">
                  <svg className="h-5 w-5 mr-2 text-[#FCDA89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Devis estimatif - {projectState.title}
                </h3>
                
                <div className="bg-gradient-to-r from-[#0E261C]/80 to-[#0E261C]/95 p-3 rounded-lg border border-[#FCDA89]/10">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <h4 className="text-xs text-[#FCDA89]/80 mb-1">Localisation</h4>
                      <p className="text-xs text-white">{projectState.location?.address}</p>
                      <p className="text-xs text-white">{projectState.location?.postalCode} {projectState.location?.city}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-xs text-[#FCDA89]/80 mb-1">Service</h4>
                      <p className="text-xs text-white">{projectState.category?.name}</p>
                      <p className="text-xs text-white">{projectState.service?.name}</p>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-black/20 rounded-lg mb-3">
                    <h4 className="text-xs text-[#FCDA89]/80 mb-1">Description du projet</h4>
                    <p className="text-xs text-white/90">{projectState.details}</p>
                  </div>
                  
                  {message.estimatedPrice && (
                    <div className="p-3 bg-gradient-to-r from-[#FCDA89]/90 to-amber-400/90 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sm text-[#0E261C]">Estimation budgétaire</h4>
                        <div className="text-xs font-bold text-[#0E261C] bg-white/30 px-2 py-1 rounded-full">
                          {message.estimatedPrice && `${formatPrice(message.estimatedPrice.min)}€ - ${formatPrice(message.estimatedPrice.max)}€`}
                        </div>
                      </div>
                      
                      <div className="mb-1">
                        <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#0E261C]/70 rounded-full flex items-center justify-center"
                            style={{ width: `${gaugePosition}%` }}
                          >
                            <div className="h-full w-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDBoMTAwdjEwSDB6IiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjIiIHRyYW5zZm9ybT0icm90YXRlKDQ1KSIvPjwvc3ZnPg==')]"></div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <span className="text-[10px] text-[#0E261C]/70">{formatPrice(minPrice)}€</span>
                          <span className="text-[10px] text-[#0E261C]/70">{formatPrice(maxPrice)}€</span>
                        </div>
                      </div>
                      
                      <p className="text-[#0E261C] text-xs mt-2 bg-white/30 p-1.5 rounded text-center">
                        Cette estimation inclut main d'œuvre et matériaux standard
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-medium"
                  onClick={handleProjectAccept}
                >
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Prendre en charge ce projet
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex-1 h-full overflow-y-auto p-3 space-y-3 md:space-y-4 scrollbar-thin">
      <AnimatePresence>
        {messages.map(message => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col"
          >
            {renderMessage(message)}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-start gap-2.5 self-start">
          <div className="bg-[#0E261C] p-1.5 rounded-full border-[0.5px] border-[#FCDA89]/20">
            <Bot className="h-4 w-4 text-[#FCDA89]" />
          </div>
          <div className="bg-card p-3 rounded-xl rounded-bl-sm shadow-sm border flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Génération en cours...</span>
          </div>
        </div>
      )}
      
      {/* Référence pour faire défiler vers le bas */}
      <div ref={messagesEndRef} />
    </div>
  )
} 