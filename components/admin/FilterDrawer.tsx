import React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}

interface FilterDrawerProps {
  title: string;
  description: string;
  side: "left" | "right" | "top" | "bottom";
  trigger: React.ReactNode;
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, string | null>;
  onFilterChange: (groupId: string, value: string | null) => void;
  onResetFilters: () => void;
  className?: string;
  isMobile?: boolean;
}

export function FilterDrawer({
  title,
  description,
  side,
  trigger,
  filterGroups,
  selectedFilters,
  onFilterChange,
  onResetFilters,
  className = "",
  isMobile = false,
}: FilterDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side={side}
        className={`${
          side === "bottom"
            ? "h-[85vh] rounded-t-xl"
            : "md:max-w-sm h-full"
        } overflow-auto ${className}`}
      >
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            {description}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {filterGroups.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-medium mb-2">{group.title}</h3>
              <div className="space-y-2">
                {group.options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between py-2"
                  >
                    <Label
                      htmlFor={`${group.id}-${option.id}${isMobile ? "-mobile" : ""}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                    <Switch
                      id={`${group.id}-${option.id}${isMobile ? "-mobile" : ""}`}
                      checked={selectedFilters[group.id] === option.value}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onFilterChange(group.id, option.value);
                        } else if (selectedFilters[group.id] === option.value) {
                          // Si le switch actuel est désactivé, réinitialiser le filtre
                          onFilterChange(group.id, null);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex flex-col pt-4 mt-4 border-t">
          <SheetClose asChild>
            <Button variant="default">Appliquer tous</Button>
          </SheetClose>
          <Button 
            variant="outline"
            onClick={onResetFilters}
            className=""
          >
            Réinitialiser tous les filtres
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 