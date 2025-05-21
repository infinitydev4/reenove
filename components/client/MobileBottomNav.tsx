import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Mail, 
  FileText,
  Heart,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

export function ClientMobileBottomNav() {
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: "/client", icon: LayoutDashboard },
    { name: "Mes projets", href: "/client/projets", icon: FileText },
    { name: "Messages", href: "/client/messages", icon: Mail, count: "3" },
    { name: "Favoris", href: "/client/favoris", icon: Heart },
    { name: "Paramètres", href: "/client/parametres", icon: Settings },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 md:hidden z-20 bg-[#0E261C]/95 rounded-xl shadow-lg border border-white/10 p-2 backdrop-blur-sm text-white">
      <div className="flex items-center justify-around">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors",
              pathname === item.href ? "text-[#FCDA89]" : "text-white/80 hover:text-white"
            )}
          >
            <div className="relative">
              <item.icon className="h-5 w-5 mb-1" />
              {item.count && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FCDA89] text-[10px] font-bold text-[#0E261C]">
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