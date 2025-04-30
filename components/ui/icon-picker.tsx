"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { iconCategories, recommendedCategoryIcons, getIconByName } from "@/lib/data/icons"

export interface IconPickerProps {
  value?: string
  onChange?: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Récupérer l'icône sélectionnée
  const IconComponent = value ? getIconByName(value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? (
            <div className="flex items-center gap-2">
              {React.createElement(IconComponent || getIconByName("HelpCircle"), { className: "h-4 w-4" })}
              <span>{value}</span>
            </div>
          ) : (
            <span>Sélectionner une icône</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Rechercher une icône..." 
              className="border-0 focus:ring-0 h-9 px-0" 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </div>
          <CommandEmpty>Aucune icône trouvée.</CommandEmpty>
          <CommandList className="max-h-[300px] overflow-auto">
            {/* Icônes recommandées */}
            <CommandGroup heading="Recommandées">
              <div className="grid grid-cols-5 gap-1 p-2">
                {recommendedCategoryIcons.map((iconName) => {
                  const IconComponent = getIconByName(iconName);
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={() => {
                        onChange?.(iconName);
                        setOpen(false);
                      }}
                      className="px-2 py-1 cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground"
                    >
                      <div className="flex flex-col items-center gap-1">
                        {React.createElement(IconComponent, { className: "h-5 w-5" })}
                        {value === iconName && (
                          <Check className="h-3 w-3 absolute bottom-1 right-1 text-green-500" />
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </div>
            </CommandGroup>
            
            <CommandSeparator />
            
            {/* Catégories d'icônes */}
            {iconCategories.map((category) => {
              // Filtrer par la recherche si une requête est présente
              const filteredIcons = searchQuery
                ? category.icons.filter(icon => 
                    icon.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : category.icons;
                
              if (filteredIcons.length === 0) return null;
              
              return (
                <CommandGroup key={category.name} heading={category.name}>
                  <div className="grid grid-cols-5 gap-1 p-2">
                    {filteredIcons.map((iconName) => {
                      const IconComponent = getIconByName(iconName);
                      return (
                        <CommandItem
                          key={iconName}
                          value={iconName}
                          onSelect={() => {
                            onChange?.(iconName);
                            setOpen(false);
                          }}
                          className="px-2 py-1 cursor-pointer aria-selected:bg-primary aria-selected:text-primary-foreground"
                        >
                          <div className="flex flex-col items-center gap-1">
                            {React.createElement(IconComponent, { className: "h-5 w-5" })}
                            {value === iconName && (
                              <Check className="h-3 w-3 absolute bottom-1 right-1 text-green-500" />
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </div>
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 