"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Role } from "@/lib/generated/prisma"
import { useEffect, useState } from "react"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"
  const userRole = session?.user?.role as Role | undefined || ""
  const isHomePage = pathname === "/"
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const getUserDashboardLink = () => {
    switch(userRole) {
      case "USER":
        return "/client";
      case "ARTISAN":
        return "/artisan";
      case "AGENT":
        return "/agent";
      case "ADMIN":
        return "/admin";
      default:
        return "/dashboard";
    }
  }

  // Fonction pour fermer le drawer
  const closeDrawer = () => {
    setIsSheetOpen(false);
  };

  // Fonction qui gère le scroll vers les sections
  const scrollToSection = (sectionId: string, closeDrawer?: () => void) => {
    // Si nous ne sommes pas sur la page d'accueil, naviguer d'abord vers la page d'accueil
    if (!isHomePage) {
      router.push(`/#${sectionId}`);
      if (closeDrawer) closeDrawer();
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      if (closeDrawer) closeDrawer();
    }
  };

  // Initialiser le scrolling quand on arrive depuis un lien externe avec un hash
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }, 500);
    }
  }, [isHomePage]);

  return (
    <header className="w-full py-4 border-b border-white/10 bg-[#0E261C]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center">
            <Image
              src="/logow.png"
            alt="Renoveo Logo"
              width={140}
              height={40}
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/"
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              isActive("/")
                ? "text-[#FCDA89] font-medium"
                : "text-white/80 hover:text-[#FCDA89]"
            }`}
          >
            Accueil
          </Link>
          <button
            onClick={() => scrollToSection("services")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors text-white/80 hover:text-[#FCDA89]`}
          >
            Services
          </button>
          <button
            onClick={() => scrollToSection("why-reenove")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors text-white/80 hover:text-[#FCDA89]`}
          >
            Reenove
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors text-white/80 hover:text-[#FCDA89]`}
          >
            Comment ça marche
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className={`px-3 py-2 text-sm rounded-lg transition-colors text-white/80 hover:text-[#FCDA89]`}
          >
            FAQ
          </button>
          <Link
            href="/contact"
            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
              isActive("/contact")
                ? "text-[#FCDA89] font-medium"
                : "text-white/80 hover:text-[#FCDA89]"
            }`}
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              // Menu utilisateur connecté
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 gap-2">
                    <User className="h-4 w-4" />
                    {session?.user?.name || "Compte"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <Link href={getUserDashboardLink()} className="flex w-full">
                      {userRole === "USER" ? "Espace Client" :
                       userRole === "ARTISAN" ? "Espace Artisan" : 
                       userRole === "AGENT" ? "Espace Agent" : 
                       userRole === "ADMIN" ? "Espace Admin" : 
                       "Mon Tableau de bord"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <Link href="/profile" className="flex w-full">Mon Profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="hover:bg-white/10 focus:bg-white/10 text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Boutons pour les utilisateurs non connectés
              <>
                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10" asChild>
                  <Link href="/auth?tab=login">Connexion</Link>
                </Button>
                <Button className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90" asChild>
                  <Link href="/register/role">Inscription</Link>
                  </Button>
              </>
                )}
          </div>
                
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
                  <Button 
                variant="outline"
                size="icon"
                className="md:hidden border-white/20 bg-white/5 hover:bg-white/10 text-white"
              >
                <Menu className="h-5 w-5 text-white" />
                <span className="sr-only">Menu</span>
                  </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#0E261C] border-white/10" side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive("/")
                      ? "text-[#FCDA89] font-medium bg-white/5"
                      : "text-white/80 hover:text-[#FCDA89] hover:bg-white/5"
                  }`}
                  onClick={closeDrawer}
                >
                  Accueil
                </Link>
                <button
                  onClick={() => scrollToSection("services", closeDrawer)}
                  className="px-3 py-2 text-sm rounded-lg text-left text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                >
                  Services
                </button>
                <button
                  onClick={() => scrollToSection("categories", closeDrawer)}
                  className="px-3 py-2 text-sm rounded-lg text-left text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                >
                  Catégories
                </button>
                <button
                  onClick={() => scrollToSection("why-reenove", closeDrawer)}
                  className="px-3 py-2 text-sm rounded-lg text-left text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                >
                  Reenove
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works", closeDrawer)}
                  className="px-3 py-2 text-sm rounded-lg text-left text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                >
                  Comment ça marche
                </button>
                <button
                  onClick={() => scrollToSection("faq", closeDrawer)}
                  className="px-3 py-2 text-sm rounded-lg text-left text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                >
                  FAQ
                </button>
                <Link
                  href="/contact"
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive("/contact")
                      ? "text-[#FCDA89] font-medium bg-white/5"
                      : "text-white/80 hover:text-[#FCDA89] hover:bg-white/5"
                  }`}
                  onClick={closeDrawer}
                >
                  Contact
                </Link>
                <hr className="border-white/10 my-2" />
                
                {isAuthenticated ? (
                  // Menu utilisateur connecté (version mobile)
                  <>
                    <Link
                      href={getUserDashboardLink()}
                      className="px-3 py-2 text-sm rounded-lg text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                      onClick={closeDrawer}
                    >
                      {userRole === "USER" ? "Espace Client" :
                       userRole === "ARTISAN" ? "Espace Artisan" : 
                       userRole === "AGENT" ? "Espace Agent" : 
                       userRole === "ADMIN" ? "Espace Admin" : 
                       "Mon Tableau de bord"}
                    </Link>
                    <Link
                      href="/profile"
                      className="px-3 py-2 text-sm rounded-lg text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                      onClick={closeDrawer}
                    >
                      Mon Profil
                    </Link>
                    <button
                      onClick={() => {
                        closeDrawer();
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
              </>
            ) : (
                  // Liens pour les utilisateurs non connectés (version mobile)
                  <>
                    <Link
                      href="/auth?tab=login"
                      className="px-3 py-2 text-sm rounded-lg text-white/80 hover:text-[#FCDA89] hover:bg-white/5 transition-colors"
                      onClick={closeDrawer}
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/register/role"
                      className="px-3 py-2 text-sm rounded-lg text-[#FCDA89] font-medium bg-white/5 hover:bg-white/10 transition-colors"
                      onClick={closeDrawer}
                    >
                      Inscription
                </Link>
              </>
            )}
          </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 