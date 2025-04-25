"use client"

import { PropsWithChildren, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Mail, 
  FileClock, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  LifeBuoy, 
  LogOut, 
  Menu, 
  X,
  Home
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export default function ArtisanDashboardLayout({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const navigation = [
    { name: "Tableau de bord", href: "/artisan", icon: LayoutDashboard },
    { name: "Messages", href: "/artisan/messages", icon: Mail, count: "5" },
    { name: "Devis", href: "/artisan/devis", icon: FileClock, count: "3" },
    { name: "Rendez-vous", href: "/artisan/rendez-vous", icon: Calendar },
    { name: "Clients", href: "/artisan/clients", icon: Users },
    { name: "Statistiques", href: "/artisan/statistiques", icon: BarChart3 },
    { name: "Paramètres", href: "/artisan/parametres", icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar pour mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
        <Link href="/" className="flex items-center">
          <Home className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold">ArtiConnect</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <Link href="/" className="flex items-center">
            <Home className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold">ArtiConnect</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col p-4">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>

          <nav className="space-y-1 mb-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
                {item.count && (
                  <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <Separator className="my-4" />

          <div className="mt-auto space-y-1">
            <Link
              href="/aide"
              className="flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Aide et support</span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2 h-auto font-normal text-sm rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
              onClick={() => {
                // Ajouter la logique de déconnexion ici
                setSidebarOpen(false)
              }}
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-white dark:bg-gray-900">
          <div className="p-4 flex items-center border-b">
            <Link href="/" className="flex items-center">
              <Home className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold">ArtiConnect</span>
            </Link>
          </div>

          <div className="flex flex-col flex-1 p-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1 mb-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {item.count && (
                    <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-1">
              <Link
                href="/aide"
                className="flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-muted transition-colors"
              >
                <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Aide et support</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto font-normal text-sm rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex-1">
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
} 