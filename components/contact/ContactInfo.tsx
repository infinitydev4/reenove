import Link from "next/link"
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"

export default function ContactInfo() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Informations de contact</h2>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Adresse</h3>
              <p className="text-white/70">
                123 Boulevard des Artisans<br />
                13000 Marseille, France
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Téléphone</h3>
              <p className="text-white/70">
                <Link href="tel:+33455667788" className="hover:text-[#FCDA89] transition-colors">
                  +33 4 55 66 77 88
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Email</h3>
              <p className="text-white/70">
                <Link href="mailto:contact@reenove.fr" className="hover:text-[#FCDA89] transition-colors">
                  contact@reenove.fr
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Horaires</h3>
              <p className="text-white/70">
                Lundi - Vendredi: 9h00 - 18h00<br />
                Samedi: 10h00 - 15h00<br />
                Dimanche: Fermé
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Suivez-nous</h2>
        
        <div className="flex gap-4">
          <Link
            href="https://facebook.com/reenove"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white hover:bg-[#FCDA89]/20 hover:text-[#FCDA89] transition-colors"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </Link>
          
          <Link
            href="https://twitter.com/reenove"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white hover:bg-[#FCDA89]/20 hover:text-[#FCDA89] transition-colors"
            aria-label="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </Link>
          
          <Link
            href="https://instagram.com/reenove"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white hover:bg-[#FCDA89]/20 hover:text-[#FCDA89] transition-colors"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" />
          </Link>
          
          <Link
            href="https://linkedin.com/company/reenove"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white hover:bg-[#FCDA89]/20 hover:text-[#FCDA89] transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-3">Assistance prioritaire</h3>
        <p className="text-white/70 mb-4">
          Besoin d'une aide urgente ? Notre équipe de support prioritaire est disponible pour vous aider.
        </p>
        <Link
          href="/assistance-urgente"
          className="inline-flex items-center text-[#FCDA89] hover:underline"
        >
          Contacter l'assistance prioritaire
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </Link>
      </div>
    </div>
  )
} 