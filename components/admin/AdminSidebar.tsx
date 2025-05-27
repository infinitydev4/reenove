import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  X,
  Wrench,
  ShieldAlert,
  Briefcase,
  FileText,
  BarChart3
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

export function AdminSidebar({ isOpen, closeSidebar }: AdminSidebarProps) {
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
    { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Artisans", href: "/admin/artisans", icon: Wrench },
    { name: "Projets", href: "/admin/projets", icon: FileText },
    { name: "Services", href: "/admin/services", icon: Briefcase },
    { name: "Statistiques", href: "/admin/stats", icon: BarChart3 },
    { name: "Paramètres", href: "/admin/parametres", icon: Settings },
  ]

  return (
    <>
      {/* Overlay pour fermer la sidebar sur mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-20 bottom-20 md:top-24 md:bottom-8 left-4 z-40 w-64 bg-[#0E261C]/95",
          "rounded-xl shadow-lg border border-[#FCDA89]/20 backdrop-blur-sm",
          "transform transition-transform duration-300 ease-in-out overflow-hidden",
          isOpen ? "translate-x-0" : "-translate-x-[calc(100%+16px)] md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header mobile uniquement */}
          <div className="flex justify-between items-center md:hidden mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeSidebar} 
              className="h-8 w-8 text-[#FCDA89] hover:bg-[#FCDA89]/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Profil utilisateur */}
          <div className="flex items-center gap-3 mb-6 px-2">
            <Avatar className="h-10 w-10 ring-2 ring-[#FCDA89]/20">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                {getInitials(session?.user?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate text-white">{session?.user?.name}</p>
              <p className="text-xs text-[#FCDA89]/70 truncate">{session?.user?.email}</p>
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
                    ? "bg-[#FCDA89]/20 text-[#FCDA89] font-medium"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                onClick={closeSidebar}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="space-y-1 pt-2 border-t border-[#FCDA89]/20">
            <Link
              href="/aide"
              className="flex items-center px-3 py-2.5 text-sm rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              onClick={closeSidebar}
            >
              <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Aide et support</span>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2.5 h-auto font-normal text-sm rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              onClick={() => signOut({ callbackUrl: "/" })}
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