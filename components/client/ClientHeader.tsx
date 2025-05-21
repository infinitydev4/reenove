import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Menu, Home, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/ui/notifications/NotificationDropdown"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ClientHeaderProps {
  toggleSidebar: () => void
}

export function ClientHeader({ toggleSidebar }: ClientHeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Pour éviter les erreurs d'hydratation, on attend que le composant soit monté
  useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = (name: string) => {
    if (!name) return "C"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between p-3 bg-[#0E261C]/95 backdrop-blur-sm rounded-xl shadow-md border border-white/10 text-white">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden text-white hover:bg-white/10">
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center">
          <Image src="/logow.png" width={110} height={32} alt="Reenove Logo" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Changer de thème" 
          onClick={toggleTheme}
          className="text-white hover:bg-white/10"
        >
          <Sun className="h-5 w-5 text-[#FCDA89]" />
          <span className="sr-only">Changer de thème</span>
        </Button>
        <NotificationDropdown />
        <Avatar className="h-8 w-8 ring-2 ring-[#FCDA89]/30 transition-all hover:ring-[#FCDA89]/50">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
          <AvatarFallback className="bg-[#FCDA89]/20 text-white">{getInitials(session?.user?.name || "")}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
} 