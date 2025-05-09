"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role } from "@/lib/generated/prisma"
import { 
  HomeIcon, 
  PlusCircle, 
  Bell, 
  Wrench, 
  MessageSquare,
  LayoutGrid
} from "lucide-react"
import { useTheme } from "next-themes"

export default function BottomNavbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  // Pour éviter les erreurs d'hydratation, on n'affiche rien côté serveur
  useEffect(() => {
    setMounted(true)
  }, [])

  // Si pas encore monté (côté serveur), on retourne null pour éviter les erreurs d'hydratation
  if (!mounted) return null
  
  // Ne pas afficher la barre de navigation sur les pages d'authentification, d'inscription, ou autre que la page d'accueil
  if (pathname?.includes("/auth") || pathname?.includes("/register") || pathname !== "/") {
    return null
  }

  // On récupère le rôle de l'utilisateur seulement une fois monté côté client
  const isArtisan = status === "authenticated" && session?.user?.role === Role.ARTISAN
  const isLoggedIn = status === "authenticated"
  const isDarkTheme = theme === "dark"

  // Déterminer les liens en fonction du rôle et de l'état de connexion
  const getActionLink = () => {
    if (!isLoggedIn) return "/auth?tab=login"
    if (isArtisan) return "/artisan/projects"
    return "/create-project/category"
  }

  const getMessagesLink = () => {
    if (!isLoggedIn) return "/auth?tab=login"
    if (isArtisan) return "/artisan/messages"
    return "/client/messages"
  }

  const getNotificationsLink = () => {
    if (!isLoggedIn) return "/auth?tab=login"
    if (isArtisan) return "/artisan/notifications"
    return "/client/notifications"
  }

  const getDashboardLink = () => {
    if (!isLoggedIn) return "/auth?tab=login"
    if (isArtisan) return "/artisan"
    return "/client"
  }
  
  // Classes pour les éléments de navigation avec design neumorphique
  const getNavItemClasses = (isActive: boolean) => {
    return cn(
      // Base classes
      "flex flex-col items-center justify-center rounded-lg transition-all duration-300 py-1.5 px-3",
      // Neumorphic styles basés sur le thème
      isDarkTheme
        ? isActive
          ? "bg-gray-850 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5),_inset_-1px_-1px_2px_rgba(255,255,255,0.03)]"
          : "hover:bg-gray-850/80 hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3),_inset_-1px_-1px_2px_rgba(255,255,255,0.02)]"
        : isActive
          ? "bg-gray-50 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.03),_inset_-1px_-1px_2px_rgba(255,255,255,0.8)]"
          : "hover:bg-gray-50/80 hover:shadow-[inset_1px_1px_2px_rgba(0,0,0,0.02),_inset_-1px_-1px_2px_rgba(255,255,255,0.5)]",
      // Text color based on active state and theme
      isActive
        ? "text-yellow-400"
        : isDarkTheme
          ? "text-gray-400 hover:text-gray-200"
          : "text-gray-500 hover:text-gray-700"
    )
  }

  return (
    <>
      {/* Espace pour éviter que le contenu ne soit caché sous la barre */}
      <div className="h-16 md:hidden" aria-hidden="true"></div>
      
      {/* Barre de navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Bulle centrale - positionnée en dehors du conteneur principal pour qu'elle soit au premier plan */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
          <Link
            href={getActionLink()}
            className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full",
              "transition-all duration-300 active:scale-95",
              isDarkTheme
                ? "bg-gradient-to-br from-yellow-500 to-amber-600 shadow-[3px_3px_8px_rgba(0,0,0,0.25),_-2px_-2px_6px_rgba(255,255,255,0.05)]"
                : "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[3px_3px_10px_rgba(0,0,0,0.1),_-3px_-3px_10px_rgba(255,255,255,0.8)]"
            )}
          >
            {isArtisan ? (
              <Wrench className="h-6 w-6 text-white" />
            ) : (
              <PlusCircle className="h-6 w-6 text-white" />
            )}
          </Link>
        </div>

        {/* Conteneur principal */}
        <div className={cn(
          "py-2 backdrop-blur-xl h-16",
          isDarkTheme 
            ? "bg-[#121212]/85 border-t border-gray-800/80 shadow-[0_-5px_20px_rgba(0,0,0,0.25)]" 
            : "bg-[#f8f9fa]/85 border-t border-gray-200/80 shadow-[0_-5px_20px_rgba(0,0,0,0.07)]"
        )}>
          <div className="max-w-sm mx-auto h-full flex items-center justify-between px-4">
            {/* Accueil */}
            <Link 
              href="/" 
              className={getNavItemClasses(true)}
            >
              <HomeIcon className="h-5 w-5 mb-1" />
              <span className="text-[11px] font-medium">Accueil</span>
            </Link>
            
            {/* Messages */}
            <Link 
              href={getMessagesLink()} 
              className={getNavItemClasses(false)}
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-[11px] font-medium">Messages</span>
            </Link>
            
            {/* Espace pour la bulle centrale */}
            <div className="w-14"></div>
            
            {/* Notifications */}
            <Link 
              href={getNotificationsLink()} 
              className={getNavItemClasses(false)}
            >
              <Bell className="h-5 w-5 mb-1" />
              <span className="text-[11px] font-medium">Alertes</span>
            </Link>
            
            {/* Tableau de bord */}
            <Link 
              href={getDashboardLink()} 
              className={getNavItemClasses(false)}
            >
              <LayoutGrid className="h-5 w-5 mb-1" />
              <span className="text-[11px] font-medium">Tableau</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
} 