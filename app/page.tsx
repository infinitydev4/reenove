import Navbar from "@/components/navbar"
import { Footer } from "@/components/Footer"
import BottomNavbar from "@/components/bottom-navbar"
import { Metadata } from "next"

// Import des composants de la page d'accueil
import HeroSection from "@/components/home/HeroSection"
import ServicesSection from "@/components/home/ServicesSection"
import CategoriesSection from "@/components/home/CategoriesSection"
import ArtisansSection from "@/components/home/ArtisansSection"
import WhyReenoveSection from "@/components/home/WhyReenoveSection"
import HowItWorksSection from "@/components/home/HowItWorksSection"
import Testimonials from "@/components/home/Testimonials"
import FaqSection from "@/components/home/FaqSection"
import CtaSection from "@/components/home/CtaSection"
import { CookieBanner } from "@/components/CookieBanner"

export const metadata: Metadata = {
  title: "Reenove | Trouvez l'artisan idéal pour vos projets de rénovation",
  description: "Reenove connecte particuliers et artisans qualifiés pour tous vos projets de rénovation. Publiez votre projet et recevez des devis personnalisés d'artisans vérifiés. Notre IA vous aide à trouver le professionnel parfait pour vos besoins.",
  keywords: "artisans, rénovation, travaux, devis, projet, plombier, électricien, menuisier, peintre, maçon, plateforme artisans",
  openGraph: {
    title: "Reenove | La plateforme d'artisans N°1 en France",
    description: "Publiez votre projet de rénovation et trouvez les meilleurs artisans qualifiés dans votre région",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reenove - Plateforme d'artisans",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <HeroSection />
      <ServicesSection />
      <CategoriesSection />
      {/* <ArtisansSection /> */}
      <WhyReenoveSection />
      <HowItWorksSection />
      <Testimonials />
      <FaqSection />
      <CtaSection />
      
      <Footer />
      <CookieBanner />
      <BottomNavbar />
    </div>
  )
}
