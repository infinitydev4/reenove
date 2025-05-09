import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Menu, Home, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/ui/notifications/NotificationDropdown"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface ArtisanHeaderProps {
  toggleSidebar: () => void
}

export function ArtisanHeader({ toggleSidebar }: ArtisanHeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Pour éviter les erreurs d'hydratation, on attend que le composant soit monté
  useEffect(() => {
    setMounted(true)
  }, [])

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between p-3 bg-white dark:bg-black/95 rounded-xl shadow-md backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center">
          {mounted && (
            <>
              {theme === "dark" ? (
                <Image src="/logow.png" width={110} height={32} alt="Reenove Logo" />
              ) : (
                <Image src="/logo.png" width={110} height={32} alt="Reenove Logo" />
              )}
            </>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Changer de thème" 
          onClick={toggleTheme}
        >
          {mounted && theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-slate-700" />
          )}
          <span className="sr-only">Changer de thème</span>
        </Button>
        <NotificationDropdown />
        <Avatar className="h-8 w-8 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
          <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
} 