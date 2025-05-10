"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Role } from "@/lib/generated/prisma"
import { 
  Home as HomeIcon, 
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

  // Déterminer les liens en fonction du rôle et de l'état de connexion
  const getActionLink = () => {
    if (!isLoggedIn) return "/auth?tab=login"
    if (isArtisan) return "/artisan/projets"
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

  const navigation = [
    { name: "Accueil", href: "/", icon: HomeIcon },
    { name: "Messages", href: getMessagesLink(), icon: MessageSquare },
    { name: isArtisan ? "Projets" : "Créer", href: getActionLink(), icon: isArtisan ? Wrench : PlusCircle },
    { name: "Alertes", href: getNotificationsLink(), icon: Bell },
    { name: "Tableau", href: getDashboardLink(), icon: LayoutGrid },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-20 bg-white dark:bg-black/95 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="flex items-center justify-around">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5 mb-1" />
            </div>
            <span className="text-[10px]">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
} 