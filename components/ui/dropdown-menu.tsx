"use client"

import * as React from "react"
import { 
  ChevronRight,
  Check,
  Circle 
} from "lucide-react"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  className?: string
}

interface DropdownMenuItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  asChild?: boolean
}

interface DropdownMenuLabelProps {
  children: React.ReactNode
  className?: string
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child as React.ReactElement<DropdownMenuTriggerProps>, {
              onClick: () => setOpen(!open),
            })
          }
          if (child.type === DropdownMenuContent) {
            return open ? child : null
          }
        }
        return child
      })}
    </div>
  )
}

export function DropdownMenuTrigger({ children, asChild, ...props }: DropdownMenuTriggerProps & React.HTMLAttributes<HTMLDivElement>) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ...props })
  }
  
  return (
    <div 
      role="button" 
      className="inline-flex items-center justify-center"
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuContent({ 
  children, 
  align = "center",
  className = "",
  ...props 
}: DropdownMenuContentProps & React.HTMLAttributes<HTMLDivElement>) {
  const alignClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0"
  }

  return (
    <div 
      className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md animate-in fade-in-80 ${alignClasses[align]} ${className}`}
      {...props}
    >
      <div className="p-1">
        {children}
      </div>
    </div>
  )
}

export function DropdownMenuItem({ 
  children, 
  className = "",
  asChild,
  ...props 
}: DropdownMenuItemProps & React.HTMLAttributes<HTMLDivElement>) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { 
      className: `relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${className}`,
      ...props 
    })
  }
  
  return (
    <div 
      role="menuitem"
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ 
  children, 
  className = "",
  ...props 
}: DropdownMenuLabelProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={`px-2 py-1.5 text-sm font-semibold ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-200" />
}

export function DropdownMenuCheckboxItem({ children, checked, ...props }: { children: React.ReactNode, checked?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      role="menuitemcheckbox"
      className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100"
      data-state={checked ? "checked" : "unchecked"}
      aria-checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        {checked ? <Check className="h-4 w-4" /> : null}
      </span>
      {children}
    </div>
  )
}

export function DropdownMenuRadioGroup({ children, value, onValueChange }: { children: React.ReactNode, value?: string, onValueChange?: (value: string) => void }) {
  return <div role="radiogroup">{children}</div>
}

export function DropdownMenuRadioItem({ children, value, ...props }: { children: React.ReactNode, value: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      role="menuitemradio"
      className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100"
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <Circle className="h-2 w-2" />
      </span>
      {children}
    </div>
  )
} 