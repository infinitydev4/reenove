"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ArrowRightCircle, User2, Inbox, UserCircle, HomeIcon, Wrench, LogOut, Settings, LayoutDashboard, ShieldQuestion, PlusCircle, Sun, Moon, Users } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Role } from "@/lib/generated/prisma"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  const getInitials = (name: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.map((n) => n[0]).join("");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="Reenove Logo"
              width={140}
              height={40}
              className="h-6 w-auto object-contain block dark:hidden"
            />
            <Image
              src="/logow.png"
              alt="Reenove Logo"
              width={140}
              height={40}
              className="h-6 w-auto object-contain hidden dark:block"
            />
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {/* <Link
              href="/artisans"
              className={`transition-colors hover:text-foreground/80 ${
                pathname?.startsWith("/artisans")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Artisans
            </Link>
            <Link
              href="/projets"
              className={`transition-colors hover:text-foreground/80 ${
                pathname?.startsWith("/projets")
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              Projets
            </Link> */}
            {/* Liens supplémentaires si nécessaire */}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Reenove Logo"
                width={110}
                height={30}
                className="h-5 w-auto object-contain block dark:hidden"
              />
              <Image
                src="/logow.png"
                alt="Reenove Logo"
                width={110}
                height={30}
                className="h-5 w-auto object-contain hidden dark:block"
              />
            </Link>
          </div>
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Recherche ou autre contenu */}
          </div>
          <nav className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Changer de thème" 
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
              ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-700" />
              )}
              <span className="sr-only">Changer de thème</span>
            </Button>

            <Link href="/create-project/category">
              <Button variant="outline" className="mr-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Publier un projet</span>
                <span className="sm:hidden">Publier</span>
              </Button>
            </Link>
            
            {status === "authenticated" ? (
              <>
                {session?.user?.role === Role.USER && (
                  <Button 
                    variant="ghost" 
                    className="mr-2"
                    onClick={() => router.push("/client")}
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Espace Client</span>
                  </Button>
                )}
                
                {session?.user?.role === Role.ARTISAN && (
                  <Button 
                    variant="ghost" 
                    className="mr-2"
                    onClick={() => router.push("/artisan")}
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Espace Artisan</span>
                  </Button>
                )}
                
                {session?.user?.role === Role.AGENT && (
                  <Button 
                    variant="ghost" 
                    className="mr-2"
                    onClick={() => router.push("/agent")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Espace Agent</span>
                  </Button>
                )}
                
                {session?.user?.role === Role.ADMIN && (
                  <Button 
                    variant="ghost" 
                    className="mr-2"
                    onClick={() => router.push("/admin")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="hidden md:inline">Administration</span>
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session?.user?.image || ""}
                          alt={session?.user?.name || ""}
                        />
                        <AvatarFallback>
                          {getInitials(session?.user?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => router.push("/profile")}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    
                    {session?.user?.role === Role.USER && (
                      <DropdownMenuItem
                        onClick={() => router.push("/client")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                      </DropdownMenuItem>
                    )}
                    
                    {session?.user?.role === Role.ARTISAN && (
                      <DropdownMenuItem
                        onClick={() => router.push("/artisan")}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                      </DropdownMenuItem>
                    )}
                    
                    {session?.user?.role === Role.AGENT && (
                      <DropdownMenuItem
                        onClick={() => router.push("/agent")}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Tableau de bord</span>
                      </DropdownMenuItem>
                    )}
                    
                    {session?.user?.role === Role.ADMIN && (
                      <DropdownMenuItem
                        onClick={() => router.push("/admin")}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Administration</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth?tab=login">
                  <Button variant="ghost">
                    <User2 className="h-4 w-4" />
                  </Button>
                </Link>
                {/* <Link href="/register/role">
                  <Button>
                    <ArrowRightCircle className="mr-2 h-4 w-4" />
                    <span>Inscription</span>
                  </Button>
                </Link> */}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 