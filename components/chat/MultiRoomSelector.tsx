"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

interface Option {
  id: string
  label: string
  value: string
}

interface MultiRoomSelectorProps {
  options: Option[]
  onSelectionChange: (selectedValues: string[]) => void
}

export default function MultiRoomSelector({ options, onSelectionChange }: MultiRoomSelectorProps) {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([])

  const toggleRoom = (roomValue: string) => {
    setSelectedRooms(prev => {
      const newSelection = prev.includes(roomValue)
        ? prev.filter(room => room !== roomValue)
        : [...prev, roomValue]
      
      return newSelection
    })
  }

  const handleConfirm = () => {
    if (selectedRooms.length > 0) {
      onSelectionChange(selectedRooms)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Sélectionnez une ou plusieurs pièces :
      </div>
      
      {/* Grille des options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {options.map(option => {
          const isSelected = selectedRooms.includes(option.value)
          return (
            <Button
              key={option.id}
              variant={isSelected ? "default" : "outline"}
              className={`justify-start text-left h-auto py-2 px-3 transition-all ${
                isSelected 
                  ? "bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" 
                  : "hover:bg-primary/10 hover:text-primary"
              }`}
              onClick={() => toggleRoom(option.value)}
            >
              <div className="flex items-center gap-2 w-full">
                <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                  isSelected 
                    ? "bg-[#0E261C] border-[#0E261C]" 
                    : "border-muted-foreground"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-[#FCDA89]" />}
                </div>
                <span className="flex-1">{option.label}</span>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Bouton de confirmation */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="text-sm text-muted-foreground">
          {selectedRooms.length === 0 
            ? "Aucune pièce sélectionnée" 
            : `${selectedRooms.length} pièce(s) sélectionnée(s)`
          }
        </div>
        <Button 
          onClick={handleConfirm}
          disabled={selectedRooms.length === 0}
          className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C]"
        >
          Confirmer la sélection
        </Button>
      </div>

      {/* Aperçu des sélections */}
      {selectedRooms.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Pièces sélectionnées : {selectedRooms.join(', ')}
        </div>
      )}
    </div>
  )
} 