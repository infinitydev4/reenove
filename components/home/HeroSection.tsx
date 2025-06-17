"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Vérifier au chargement
    checkIfMobile()
    
    // Ajouter un écouteur pour les changements de taille
    window.addEventListener("resize", checkIfMobile)
    
    // Nettoyer l'écouteur
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  return (
    <section id="hero" className="relative w-full h-[90vh] overflow-hidden">
      {/* Image de fond assombrie sur les côtés */}
      <div className="absolute inset-0 z-0">
        <Image
          src={isMobile ? "/images/hero-bg-mobile.png" : "/images/slide.png"} 
          alt="Artisan au travail"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E261C] via-transparent to-[#0E261C] opacity-80"></div>
        <div className="absolute inset-0 bg-[#0E261C]/50"></div>
      </div>
      
      <div className="container relative z-10 h-full px-4 md:px-6 flex items-center justify-center">
        <div className="max-w-2xl text-center">
          <div className="inline-block px-4 py-1 mb-4 rounded-full bg-[#FCDA89]/20 border border-[#FCDA89]/30">
            <p className="text-[#FCDA89] text-sm font-medium">La plateforme d'artisans N°1 en France</p>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
            Trouvez l&apos;artisan <span className="text-[#FCDA89]">idéal</span> pour votre projet
          </h1>
          <p className="text-xl text-white/80 mb-8 mx-auto max-w-lg">
            Connectez-vous avec des professionnels qualifiés pour tous vos besoins de rénovation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold px-6 py-6 text-lg rounded-xl flex items-center gap-2" asChild>
              <Link href="/create-project-ai">
                <Bot className="h-5 w-5" />
                Demander un devis gratuit
              </Link>
            </Button>
            {/* <Button variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20 text-white px-6 py-6 text-lg rounded-xl" asChild>
              <Link href="#artisans">
              Rejoignez notre réseau d'artisans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button> */}
          </div>
        </div>
      </div>
    </section>
  )
} 