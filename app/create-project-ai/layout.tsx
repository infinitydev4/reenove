"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import Navbar from "@/components/navbar"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export default function CreateProjectAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { theme } = useTheme()
  
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0E261C] overflow-hidden">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      
      {/* Navbar fixe en haut sur desktop uniquement */}
      <div className="hidden md:block flex-shrink-0">
        <Navbar />
      </div>
      
      {/* Contenu principal qui prend tout l'espace restant */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
} 