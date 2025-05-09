import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-1 md:space-y-2", className)}>
      <h1 className="text-xl md:text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
} 