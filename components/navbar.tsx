"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { PenToolIcon as Tool } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Role } from "@/lib/generated/prisma"

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Tool className="h-5 w-5" />
          <span>ArtiConnect</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link 
            href="/artisans" 
            className={`text-sm font-medium ${pathname === "/artisans" ? "text-primary" : ""}`}
          >
            Artisans
          </Link>
          <Link 
            href="/projects" 
            className={`text-sm font-medium ${pathname === "/projects" ? "text-primary" : ""}`}
          >
            Projets
          </Link>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 rounded-full">
                  <span className="font-medium">
                    {session?.user?.name || "Mon compte"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profil</Link>
                </DropdownMenuItem>
                {session?.user?.role === Role.ARTISAN && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Tableau de bord</Link>
                  </DropdownMenuItem>
                )}
                {session?.user?.role === Role.AGENT && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Administration</Link>
                  </DropdownMenuItem>
                )}
                {session?.user?.role === Role.ADMIN && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Administration</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-500 cursor-pointer"
                >
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link 
                href="/auth" 
                className={`text-sm font-medium ${pathname === "/auth" && !pathname.includes("register") ? "text-primary" : ""}`}
              >
                Connexion
              </Link>
              <Button asChild size="sm">
                <Link href="/auth?tab=register">Inscription</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
} 