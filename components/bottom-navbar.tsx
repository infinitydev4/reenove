"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react"

export default function BottomNavbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Pour éviter les erreurs d'hydratation, on n'affiche rien côté serveur
  useEffect(() => {
    setMounted(true)
  }, [])

  // Si pas encore monté (côté serveur), on retourne null pour éviter les erreurs d'hydratation
  if (!mounted) return null
  
  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full h-16 bg-[#0E261C] border-t border-white/10 md:hidden">
      <div className="grid h-full grid-cols-5 mx-auto">
        <Link
          href="/"
          className="flex flex-col items-center justify-center"
        >
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
              isActive("/") ? "bg-white/10 text-[#FCDA89]" : "text-white/70 hover:text-white"
            }`}
          >
            <Home className="w-5 h-5" />
          </div>
          <span className={`text-xs mt-1 ${isActive("/") ? "text-[#FCDA89]" : "text-white/70"}`}>
            Accueil
          </span>
        </Link>
        
        <Link
          href="/search"
          className="flex flex-col items-center justify-center"
        >
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
              isActive("/search") ? "bg-white/10 text-[#FCDA89]" : "text-white/70 hover:text-white"
            }`}
          >
            <Search className="w-5 h-5" />
          </div>
          <span className={`text-xs mt-1 ${isActive("/search") ? "text-[#FCDA89]" : "text-white/70"}`}>
            Recherche
          </span>
        </Link>
        
        <Link
          href="/create-project"
          className="flex flex-col items-center justify-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FCDA89] rounded-full -mt-5 border-4 border-[#0E261C]">
            <PlusCircle className="w-6 h-6 text-[#0E261C]" />
          </div>
          <span className="text-xs mt-1 text-[#FCDA89]">
            Projet
          </span>
        </Link>
        
        <Link
          href="/messages"
          className="flex flex-col items-center justify-center"
        >
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
              isActive("/messages") ? "bg-white/10 text-[#FCDA89]" : "text-white/70 hover:text-white"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
          </div>
          <span className={`text-xs mt-1 ${isActive("/messages") ? "text-[#FCDA89]" : "text-white/70"}`}>
            Messages
          </span>
        </Link>
        
          <Link
          href="/profile"
          className="flex flex-col items-center justify-center"
        >
          <div
            className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
              isActive("/profile") ? "bg-white/10 text-[#FCDA89]" : "text-white/70 hover:text-white"
            }`}
          >
            <User className="w-5 h-5" />
            </div>
          <span className={`text-xs mt-1 ${isActive("/profile") ? "text-[#FCDA89]" : "text-white/70"}`}>
            Profil
          </span>
          </Link>
      </div>
    </div>
  )
} 