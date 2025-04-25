"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { 
  Home,
  FileText, 
  MessageSquare, 
  User, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Settings,
  Heart
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
import { cn } from "@/lib/utils"
import { Role } from "@/lib/generated/prisma"

const sidebarNavItems = [
  {
    title: "Tableau de bord",
    href: "/client",
    icon: Home,
  },
  {
    title: "Mes projets",
    href: "/client/projets",
    icon: FileText,
  },
  {
    title: "Messages",
    href: "/client/messages",
    icon: MessageSquare,
  },
  {
    title: "Favoris",
    href: "/client/favoris",
    icon: Heart,
  },
  {
    title: "Mon profil",
    href: "/client/profil",
    icon: User,
  },
  {
    title: "Paramètres",
    href: "/client/parametres",
    icon: Settings,
  },
]

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Protection de l'accès à l'espace client
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== Role.USER) {
      window.location.href = "/"
    } else if (status === "unauthenticated") {
      window.location.href = "/auth"
    }
  }, [status, session])

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar pour mobile - s'affiche comme un drawer */}
      <div 
        className={`
          fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 lg:hidden
          ${isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setIsSidebarOpen(false)}
      />
      
      <div 
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r bg-background transition-transform duration-300 lg:static lg:z-0
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span>ArtiConnect</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Fermer le menu</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-4 px-6 py-4 border-b">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{session?.user?.name || "Client"}</span>
            <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
          </div>
        </div>
        
        <nav className="flex-1 overflow-auto p-2">
          <ul className="space-y-1">
            {sidebarNavItems.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                  {item.href === '/client/messages' && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">3</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500" 
            onClick={() => window.location.href = "/api/auth/signout"}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header pour mobile */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          <h1 className="font-semibold text-lg">Espace Client</h1>
          
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Contenu */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 