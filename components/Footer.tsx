"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"

export function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  // Fonction qui gère le scroll vers les sections
  const scrollToSection = (sectionId: string) => {
    // Si nous ne sommes pas sur la page d'accueil, naviguer d'abord vers la page d'accueil
    if (!isHomePage) {
      router.push(`/#${sectionId}`)
      return
    }

    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start"
      })
    }
  }
  
  return (
    <footer className="bg-[#0E261C] border-t border-white/10 pt-16 pb-8">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/logow.png"
                alt="Renoveo Logo"
                width={140}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-white/70 mb-4">
              Trouvez les meilleurs artisans pour vos projets de rénovation
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-white/60 hover:text-[#FCDA89] transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-[#FCDA89] transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-[#FCDA89] transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-white/60 hover:text-[#FCDA89] transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection("services")} className="text-white/70 hover:text-[#FCDA89] transition-colors text-left">
                  Nos services
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("categories")} className="text-white/70 hover:text-[#FCDA89] transition-colors text-left">
                  Catégories
                </button>
              </li>
              <li>
                <Link href="/create-project-ai" className="text-white/70 hover:text-[#FCDA89] transition-colors">
                  Publier un projet
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">À propos</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-white/70 hover:text-[#FCDA89] transition-colors">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <button onClick={() => scrollToSection("why-reenove")} className="text-white/70 hover:text-[#FCDA89] transition-colors text-left">
                  Pourquoi Reenove
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("how-it-works")} className="text-white/70 hover:text-[#FCDA89] transition-colors text-left">
                  Comment ça marche
                </button>
              </li>
              <li>
                <Link href="/contact" className="text-white/70 hover:text-[#FCDA89] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection("faq")} className="text-white/70 hover:text-[#FCDA89] transition-colors text-left">
                  FAQ
                </button>
              </li>
              <li>
                <Link href="/privacy" className="text-white/70 hover:text-[#FCDA89] transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white/70 hover:text-[#FCDA89] transition-colors">
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-white/10 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Reenove. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
} 