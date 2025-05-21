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
    <div className="min-h-screen h-screen flex flex-col bg-[#0E261C] overflow-hidden">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      <div className="md:block hidden">
        <Navbar />
      </div>
      
     <main className="flex-1 flex flex-col h-full w-full overflow-hidden">
          <div className="md:max-w-5xl md:mx-auto md:w-full w-full h-full flex flex-col">
            {children}
          </div>
      </main>
    </div>
  )
} 