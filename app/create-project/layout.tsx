"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { CheckCircle, Circle } from "lucide-react"

interface StepProps {
  href: string
  label: string
  index: number
  isActive: boolean
  isCompleted: boolean
}

const projectSteps = [
  { path: "/create-project/category", label: "Catégorie" },
  { path: "/create-project/details", label: "Détails" },
  { path: "/create-project/budget", label: "Budget" },
  { path: "/create-project/location", label: "Localisation" },
  { path: "/create-project/date", label: "Planification" },
  { path: "/create-project/review", label: "Récapitulatif" },
]

function Step({ href, label, index, isActive, isCompleted }: StepProps) {
  return (
    <Link
      href={href}
      className={`flex items-center ${
        isActive || isCompleted 
          ? "text-primary" 
          : "text-muted-foreground cursor-not-allowed"
      }`}
      onClick={(e) => {
        if (!isActive && !isCompleted) {
          e.preventDefault()
        }
      }}
    >
      <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-current">
        {isCompleted ? (
          <CheckCircle className="h-4 w-4 text-primary" />
        ) : (
          <span className="text-sm">{index}</span>
        )}
      </div>
      <span className="ml-2 text-sm font-medium">{label}</span>
      {index < projectSteps.length && (
        <span className="mx-2 text-muted-foreground">→</span>
      )}
    </Link>
  )
}

export default function CreateProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const currentStepIndex = projectSteps.findIndex(step => 
    pathname.startsWith(step.path)
  )
  
  // Ignorer la page de succès pour l'étape active
  const isSuccessPage = pathname.includes("/success")
  const activeStepIndex = isSuccessPage ? -1 : currentStepIndex
  
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container my-8">
        {!isSuccessPage && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Créer un projet</h1>
            <div className="flex flex-nowrap overflow-auto pb-4 md:flex-wrap">
              {projectSteps.map((step, index) => (
                <Step
                  key={step.path}
                  href={step.path}
                  label={step.label}
                  index={index + 1}
                  isActive={index === activeStepIndex}
                  isCompleted={index < activeStepIndex}
                />
              ))}
            </div>
          </div>
        )}
        <Card className="p-6">
          {children}
        </Card>
      </div>
    </div>
  )
} 