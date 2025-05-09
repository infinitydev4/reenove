import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Wrench, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminMobileBottomNav() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Utilisateurs", href: "/admin/users", icon: Users },
    { name: "Artisans", href: "/admin/artisans", icon: Wrench },
    { name: "Projets", href: "/admin/projets", icon: FileText },
    { name: "Paramètres", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="md:hidden fixed bottom-4 left-4 right-4 z-20 bg-white dark:bg-black/95 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-800 p-3">
      <nav className="flex justify-between">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-lg",
              pathname === item.href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
} 