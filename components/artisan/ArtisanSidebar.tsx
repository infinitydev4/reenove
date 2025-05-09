import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Mail, 
  Calendar, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  X,
  Briefcase
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ArtisanSidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

export function ArtisanSidebar({ isOpen, closeSidebar }: ArtisanSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const navigation = [
    { name: "Tableau de bord", href: "/artisan", icon: LayoutDashboard },
    { name: "Projets", href: "/artisan/projets", icon: Briefcase },
    { name: "Messages", href: "/artisan/messages", icon: Mail, count: "5" },
    { name: "Rendez-vous", href: "/artisan/rendez-vous", icon: Calendar },
    { name: "Paramètres", href: "/artisan/parametres", icon: Settings },
  ]

  return (
    <>
      {/* Overlay pour fermer la sidebar sur mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-800/50 z-30 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-20 bottom-20 md:top-24 md:bottom-8 left-4 z-40 w-64 bg-white dark:bg-black/95",
          "rounded-xl shadow-lg border border-gray-100 dark:border-gray-800",
          "transform transition-transform duration-300 ease-in-out overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+16px)] md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header mobile uniquement */}
          <div className="flex justify-between items-center md:hidden mb-4">
            <Button variant="ghost" size="icon" onClick={closeSidebar} className="h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 mb-6 flex-1 overflow-y-auto scrollbar-hide">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                )}
                onClick={closeSidebar}
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

          {/* Footer */}
          <div className="space-y-1 pt-2 border-t">
            <Link
              href="/aide"
              className="flex items-center px-3 py-2.5 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              onClick={closeSidebar}
            >
              <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Aide et support</span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2.5 h-auto font-normal text-sm rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
} 