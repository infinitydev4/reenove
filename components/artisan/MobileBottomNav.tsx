import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Mail, 
  Calendar, 
  Settings, 
  Briefcase
} from "lucide-react"
import { cn } from "@/lib/utils"

export function MobileBottomNav() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/artisan", icon: LayoutDashboard },
    { name: "Projets", href: "/artisan/projets", icon: Briefcase },
    { name: "Messages", href: "/artisan/messages", icon: Mail, count: "5" },
    { name: "Rendez-vous", href: "/artisan/rendez-vous", icon: Calendar },
    { name: "Paramètres", href: "/artisan/parametres", icon: Settings },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-20 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
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
              {item.count && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px]">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
} 