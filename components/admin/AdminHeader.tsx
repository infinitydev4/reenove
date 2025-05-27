import Link from "next/link"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { Menu, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/ui/notifications/NotificationDropdown"

interface AdminHeaderProps {
  toggleSidebar: () => void
}

export function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const { data: session } = useSession()

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <header className="fixed top-4 left-4 right-4 z-20 flex items-center justify-between p-3 bg-[#0E261C]/95 rounded-xl shadow-lg backdrop-blur-sm border border-[#FCDA89]/20">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="md:hidden text-[#FCDA89] hover:bg-[#FCDA89]/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link href="/admin" className="flex items-center">
          <Image src="/logow.png" width={110} height={32} alt="Reenove Logo" />
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          asChild
          className="text-[#FCDA89] hover:bg-[#FCDA89]/10"
        >
          <Link href="/" aria-label="Retour à l'accueil">
            <Home className="h-5 w-5" />
            <span className="sr-only">Retour à l'accueil</span>
          </Link>
        </Button>
        <NotificationDropdown />
        <Avatar className="h-8 w-8 ring-2 ring-[#FCDA89]/20 transition-all hover:ring-[#FCDA89]/40">
          <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
          <AvatarFallback className="bg-[#FCDA89] text-[#0E261C] font-semibold">
            {getInitials(session?.user?.name || "")}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
} 