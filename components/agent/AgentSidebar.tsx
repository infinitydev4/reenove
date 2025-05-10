import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Mail, 
  Calendar, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  X,
  Users,
  BarChart,
  CreditCard,
  UserPlus,
  Building,
  FileSpreadsheet,
  Link2,
  FileText,
  HelpCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AgentSidebarProps {
  isOpen: boolean
  closeSidebar: () => void
}

export function AgentSidebar({ isOpen, closeSidebar }: AgentSidebarProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const isActive = (path: string) => {
    if (path === "/agent" && pathname === "/agent") {
      return true
    }
    return pathname?.startsWith(path) && path !== "/agent"
  }

  // Navigation items
  const navItems = [
    {
      title: "Tableau de bord",
      href: "/agent",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />
    },
    {
      title: "Filleuls",
      href: "/agent/filleuls",
      icon: <Users className="mr-2 h-4 w-4" />
    },
    {
      title: "Artisans",
      href: "/agent/artisans",
      icon: <Building className="mr-2 h-4 w-4" />
    },
    {
      title: "Projets",
      href: "/agent/projets",
      icon: <FileText className="mr-2 h-4 w-4" />
    },
    {
      title: "Commissions",
      href: "/agent/commissions",
      icon: <FileSpreadsheet className="mr-2 h-4 w-4" />
    },
    {
      title: "Parrainage",
      href: "/agent/parrainage",
      icon: <Link2 className="mr-2 h-4 w-4" />
    },
  ]

  // Utility links
  const utilityLinks = [
    {
      title: "Paramètres",
      href: "/agent/parametres",
      icon: <Settings className="mr-2 h-4 w-4" />
    },
    {
      title: "Aide",
      href: "/agent/help",
      icon: <HelpCircle className="mr-2 h-4 w-4" />
    }
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
            <ScrollArea className="flex-1 px-2">
              <div className="space-y-1">
                {navItems.map((item, i) => (
                  <Button
                    key={i}
                    asChild
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={item.href}>
                      {item.icon}
                      {item.title}
                    </Link>
                  </Button>
                ))}
              </div>

              <div className="py-6">
                <h2 className="relative px-7 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Support
                </h2>
              </div>

              <div className="space-y-1">
                {utilityLinks.map((item, i) => (
                  <Button
                    key={i}
                    asChild
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link href={item.href}>
                      {item.icon}
                      {item.title}
                    </Link>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </nav>

          {/* Footer */}
          <div className="space-y-1 pt-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start px-3 py-2.5 h-auto font-normal text-sm rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
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