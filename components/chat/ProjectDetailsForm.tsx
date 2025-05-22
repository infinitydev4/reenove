"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { ArrowRight, Ruler, Building, Home, Check, Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export interface ProjectDetails {
  surface: string
  floor: string
  hasElevator: boolean
  condition: string
  propertyType: string
}

interface ProjectDetailsFormProps {
  onSubmit: (details: ProjectDetails) => void
  initialValues?: Partial<ProjectDetails>
}

export default function ProjectDetailsForm({ onSubmit, initialValues }: ProjectDetailsFormProps) {
  const [details, setDetails] = useState<ProjectDetails>({
    surface: initialValues?.surface || "",
    floor: initialValues?.floor || "0",
    hasElevator: initialValues?.hasElevator || false,
    condition: initialValues?.condition || "bon",
    propertyType: initialValues?.propertyType || "apartment"
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectDetails, string>>>({})
  
  const handleChange = (field: keyof ProjectDetails, value: string | boolean) => {
    setDetails(prev => ({ ...prev, [field]: value }))
    
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectDetails, string>> = {}
    
    if (!details.surface.trim()) {
      newErrors.surface = "La surface est requise"
    } else if (isNaN(Number(details.surface)) || Number(details.surface) <= 0) {
      newErrors.surface = "La surface doit être un nombre valide"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(details)
    }
  }
  
  // Gestionnaire de clic pour les options ascenseur
  const handleElevatorClick = (value: boolean) => {
    handleChange("hasElevator", value)
  }
  
  // Gestionnaire de clic pour les options type de propriété
  const handlePropertyTypeClick = (value: string) => {
    handleChange("propertyType", value)
  }
  
  // Gestionnaire de clic pour les options condition
  const handleConditionClick = (value: string) => {
    handleChange("condition", value)
  }
  
  // Définition des types de propriété
  const propertyTypes = [
    { id: 'apartment', label: 'Appartement', icon: <Building className="h-5 w-5" /> },
    { id: 'house', label: 'Maison', icon: <Home className="h-5 w-5" /> },
    { id: 'commercial', label: 'Commercial', icon: <div className="flex items-center justify-center font-bold h-5 w-5">C</div> }
  ]
  
  // Définition des états du bien
  const conditionTypes = [
    { id: 'neuf', label: 'Neuf', icon: '✨' },
    { id: 'bon', label: 'Bon état', icon: '👍' },
    { id: 'vetuste', label: 'Vétuste', icon: '🔧' },
    { id: 'demolir', label: 'À démolir', icon: '🏚️' }
  ]
  
  return (
    <div className="border-t border-[#FCDA89]/20 bg-gradient-to-b from-[#0E261C] to-[#0A1210] py-2 max-h-[75vh] md:max-h-none overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-3 p-2 max-w-xl mx-auto md:p-3 md:space-y-5">
        <div className="flex items-center gap-2 bg-[#FCDA89]/10 p-2 rounded-lg border border-[#FCDA89]/20">
          <Info className="h-4 w-4 text-[#FCDA89] flex-shrink-0" />
          <p className="text-xs md:text-sm text-white">
            Merci de nous fournir quelques détails sur votre logement pour mieux vous accompagner.
          </p>
        </div>
        
        <div className="space-y-3 md:space-y-5 bg-[#0A1210]/60 p-3 rounded-lg border border-white/5">
          {/* Surface et Étage côte à côte */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {/* Surface */}
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="surface" className="flex items-center gap-1.5 text-white font-medium text-xs md:text-sm h-6 md:h-7">
                <div className="bg-[#FCDA89]/20 p-1 md:p-1.5 rounded">
                  <Ruler className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#FCDA89]" />
                </div>
                Surface <span className="text-[#FCDA89]">*</span>
              </Label>
              <div className="relative h-9 md:h-10">
                <Input
                  id="surface"
                  type="number"
                  value={details.surface}
                  onChange={e => handleChange("surface", e.target.value)}
                  className="pr-8 bg-white/5 border-white/10 text-white focus:border-[#FCDA89]/50 focus:ring-1 focus:ring-[#FCDA89]/30 h-9 md:h-10 text-sm"
                  placeholder="Ex: 45"
                  min="1"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 text-xs md:text-sm">
                  m²
                </span>
              </div>
              {errors.surface && (
                <p className="text-xs md:text-sm text-red-400 bg-red-500/10 p-1.5 rounded border border-red-500/20">
                  {errors.surface}
                </p>
              )}
            </div>
            
            {/* Étage */}
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="floor" className="flex items-center gap-1.5 text-white font-medium text-xs md:text-sm h-6 md:h-7">
                <div className="bg-[#FCDA89]/20 p-1 md:p-1.5 rounded">
                  <Building className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#FCDA89]" />
                </div>
                Étage
              </Label>
              <Select 
                value={details.floor} 
                onValueChange={value => handleChange("floor", value)}
              >
                <SelectTrigger 
                  id="floor" 
                  className="bg-white/5 border-white/10 text-white focus:border-[#FCDA89]/50 focus:ring-1 focus:ring-[#FCDA89]/30 h-9 md:h-10 text-sm"
                >
                  <SelectValue placeholder="Sélectionner l'étage" />
                </SelectTrigger>
                <SelectContent className="bg-[#0E261C] border-white/10 text-white text-sm">
                  <SelectItem value="0">Rez-de-chaussée</SelectItem>
                  <SelectItem value="1">1er étage</SelectItem>
                  <SelectItem value="2">2ème étage</SelectItem>
                  <SelectItem value="3">3ème étage</SelectItem>
                  <SelectItem value="4">4ème étage</SelectItem>
                  <SelectItem value="5">5ème étage ou plus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Ascenseur */}
          <div className="space-y-1 md:space-y-2">
            <Label className="flex items-center gap-1.5 text-white font-medium text-xs md:text-sm h-6 md:h-7">
              <div className="bg-[#FCDA89]/20 p-1 md:p-1.5 rounded">
                <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#FCDA89]" />
              </div>
              Ascenseur
            </Label>
            <div className="flex items-center">
              <div className="flex gap-2 md:gap-4 w-full">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md cursor-pointer transition-colors border h-9 md:h-10 text-xs md:text-sm ${details.hasElevator ? 'bg-[#FCDA89]/20 border-[#FCDA89]/40 text-[#FCDA89]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                  onClick={() => handleElevatorClick(true)}
                >
                  <span>Oui</span>
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md cursor-pointer transition-colors border h-9 md:h-10 text-xs md:text-sm ${!details.hasElevator ? 'bg-[#FCDA89]/20 border-[#FCDA89]/40 text-[#FCDA89]' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'}`}
                  onClick={() => handleElevatorClick(false)}
                >
                  <span>Non</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Type de propriété */}
          <div className="space-y-1 md:space-y-3">
            <Label className="flex items-center gap-1.5 text-white font-medium text-xs md:text-sm h-6 md:h-7">
              <div className="bg-[#FCDA89]/20 p-1 md:p-1.5 rounded">
                <Home className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#FCDA89]" />
              </div>
              Type de propriété
            </Label>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              {propertyTypes.map(property => (
                <button
                  key={property.id}
                  type="button"
                  className={`flex flex-col items-center justify-center px-1 py-2 md:px-2 md:py-3 rounded-md cursor-pointer transition-all duration-200 ${details.propertyType === property.id ? 'bg-[#FCDA89]/20 border-[#FCDA89]/40' : 'bg-white/5 border-white/10 hover:bg-white/10'} border h-[70px] md:h-[90px]`}
                  onClick={() => handlePropertyTypeClick(property.id)}
                >
                  <div className={`mb-1 md:mb-2 p-1.5 md:p-2 rounded-full ${details.propertyType === property.id ? 'bg-[#FCDA89]/30' : 'bg-white/10'}`}>
                    <div className={`${details.propertyType === property.id ? 'text-[#FCDA89]' : 'text-white/70'}`}>
                      {property.icon}
                    </div>
                  </div>
                  <span className={`text-xs md:text-sm ${details.propertyType === property.id ? 'text-[#FCDA89]' : 'text-white/70'}`}>
                    {property.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          {/* État actuel */}
          <div className="space-y-1 md:space-y-3">
            <Label className="flex items-center gap-1.5 text-white font-medium text-xs md:text-sm h-6 md:h-7">
              <div className="bg-[#FCDA89]/20 p-1 md:p-1.5 rounded">
                <svg className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#FCDA89]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              État actuel du bien
            </Label>
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {conditionTypes.map(condition => (
                <button
                  key={condition.id}
                  type="button"
                  className={`flex items-center gap-2 md:gap-3 p-2 md:p-4 rounded-md cursor-pointer transition-all duration-200 ${details.condition === condition.id ? 'bg-[#FCDA89]/20 border-[#FCDA89]/40' : 'bg-white/5 border-white/10 hover:bg-white/10'} border min-h-[50px] md:min-h-[60px]`}
                  onClick={() => handleConditionClick(condition.id)}
                >
                  <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full ${details.condition === condition.id ? 'bg-[#FCDA89]/30' : 'bg-white/10'}`}>
                    <span className="text-base md:text-lg">{condition.icon}</span>
                  </div>
                  <span className={`text-xs md:text-sm font-medium ${details.condition === condition.id ? 'text-[#FCDA89]' : 'text-white/80'}`}>
                    {condition.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 pt-2 pb-2 bg-gradient-to-t from-[#0A1210] to-transparent">
          <Button 
            type="submit" 
            className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold py-2 md:py-3 text-sm shadow-[0_0_15px_rgba(252,218,137,0.3)]"
          >
            Continuer
            <ArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
} 