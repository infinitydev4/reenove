"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  Users, 
  Settings, 
  LayoutDashboard, 
  Wrench, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Bell,
  Search
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Role } from "@/lib/generated/prisma"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Artisans",
    href: "/admin/artisans",
    icon: Wrench,
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: Settings,
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
  // Redirection si pas connecté ou pas admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== Role.ADMIN && session?.user?.role !== Role.AGENT) {
      window.location.href = "/"
    }
  }, [session, status])

  // Détection mobile pour sidebar auto-fermée
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Protection basique
  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>
  }
  
  if (status === "unauthenticated" || (session?.user?.role !== Role.ADMIN && session?.user?.role !== Role.AGENT)) {
    return <div className="flex items-center justify-center h-screen">Accès refusé</div>
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 lg:static",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        {/* Logo et Fermeture Mobile */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            {isSidebarOpen && <span className="font-bold text-xl">AdminPanel</span>}
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          )}
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:flex hidden"
            >
              <ChevronDown 
                className={cn(
                  "h-5 w-5 transition-transform", 
                  isSidebarOpen ? "rotate-180" : "rotate-0"
                )} 
              />
            </Button>
          )}
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 overflow-auto py-6 px-4">
          <nav className="flex flex-col gap-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  pathname === item.href ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : "",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                {isSidebarOpen && <span>{item.title}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Profil utilisateur */}
        <div className="mt-auto p-4 border-t">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {isSidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-800 px-6">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 py-2 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/auth/signout"}
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 