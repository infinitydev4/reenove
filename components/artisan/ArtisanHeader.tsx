import Link from "next/link"
import { useSession } from "next-auth/react"
import { Menu, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/ui/notifications/NotificationDropdown"

interface ArtisanHeaderProps {
  toggleSidebar: () => void
}

export function ArtisanHeader({ toggleSidebar }: ArtisanHeaderProps) {
  const { data: session } = useSession()

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl shadow-md backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/" className="flex items-center">
          <Home className="h-5 w-5 text-primary mr-2" />
          <span className="font-semibold">Reenove</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <Avatar className="h-8 w-8 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
          <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
} 