"use client"

import * as React from "react"
import { 
  Check, 
  ChevronsUpDown, 
  Home, 
  Wrench, 
  Zap, 
  Hammer, 
  Paintbrush, 
  HardHat, 
  Bath, 
  DoorOpen, 
  Trees, 
  Briefcase,
  Search
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Hammer: <Hammer className="h-4 w-4" />,
  Paintbrush: <Paintbrush className="h-4 w-4" />,
  Construction: <HardHat className="h-4 w-4" />,
  Bath: <Bath className="h-4 w-4" />,
  DoorOpen: <DoorOpen className="h-4 w-4" />,
  Trees: <Trees className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
}

const icons = Object.keys(iconMap).map((name) => ({
  value: name,
  label: name,
  icon: iconMap[name],
}))

export interface IconPickerProps {
  value?: string
  onChange?: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)

  const selectedIcon = React.useMemo(() => {
    return icons.find((icon) => icon.value === value)
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedIcon ? (
            <div className="flex items-center gap-2">
              {selectedIcon.icon}
              <span>{selectedIcon.label}</span>
            </div>
          ) : (
            <span>Sélectionner une icône</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Rechercher une icône..." />
          <CommandEmpty>Aucune icône trouvée.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {icons.map((icon) => (
              <CommandItem
                key={icon.value}
                value={icon.value}
                onSelect={(currentValue: string) => {
                  onChange?.(currentValue)
                  setOpen(false)
                }}
              >
                <div className="flex items-center gap-2">
                  {icon.icon}
                  <span>{icon.label}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === icon.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 