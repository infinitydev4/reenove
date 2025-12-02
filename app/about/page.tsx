import { Metadata } from "next"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/Footer"
import BottomNavbar from "@/components/bottom-navbar"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  ArrowRight, 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Shield, 
  Zap, 
  Award,
  Building2,
  Handshake,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Bot
} from "lucide-react"

export const metadata: Metadata = {
  title: "À propos de Reenove | Notre mission et nos valeurs",
  description: "Découvrez Reenove, la plateforme innovante qui connecte particuliers et artisans qualifiés. Notre mission : révolutionner la rénovation grâce à l'IA et des artisans vérifiés.",
  keywords: "Reenove, à propos, mission, vision, valeurs, équipe, artisans qualifiés, rénovation, IA, plateforme",
  openGraph: {
    title: "À propos de Reenove | La révolution de la rénovation",
    description: "Reenove connecte particuliers et artisans qualifiés grâce à l'intelligence artificielle. Découvrez notre histoire et nos valeurs.",
    images: [
      {
        url: "/images/og-about.png",
        width: 1200,
        height: 630,
        alt: "Reenove - À propos",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "À propos de Reenove",
    description: "La plateforme qui révolutionne la rénovation en France",
  },
  alternates: {
    canonical: "https://reenove.fr/about",
  },
}

// Schema.org JSON-LD pour le SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Reenove",
  description: "Plateforme de mise en relation entre particuliers et artisans qualifiés",
  url: "https://reenove.fr",
  logo: "https://reenove.fr/logo.png",
  foundingDate: "2024",
  founders: [
    {
      "@type": "Person",
      name: "Équipe Reenove"
    }
  ],
  sameAs: [
    "https://www.linkedin.com/company/reenove",
    "https://twitter.com/reenove",
    "https://www.instagram.com/reenove"
  ]
}

const stats = [
  { value: "500+", label: "Artisans vérifiés", icon: Users },
  { value: "10K+", label: "Projets réalisés", icon: Building2 },
  { value: "98%", label: "Clients satisfaits", icon: Heart },
  { value: "24h", label: "Temps de réponse moyen", icon: Zap },
]

const values = [
  {
    icon: Shield,
    title: "Confiance",
    description: "Tous nos artisans sont rigoureusement vérifiés. Assurances, qualifications et références sont contrôlées pour votre tranquillité."
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "Notre IA analyse vos besoins pour vous proposer les artisans les plus adaptés. La technologie au service de vos projets."
  },
  {
    icon: Handshake,
    title: "Transparence",
    description: "Des devis clairs, des prix justes. Pas de mauvaises surprises, uniquement des engagements tenus."
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Nous sélectionnons les meilleurs artisans et accompagnons chaque projet jusqu'à votre entière satisfaction."
  },
]

const timeline = [
  {
    year: "2024",
    title: "Naissance de Reenove",
    description: "L'idée naît d'un constat simple : trouver un bon artisan est trop compliqué."
  },
  {
    year: "2024",
    title: "Lancement de l'IA",
    description: "Notre assistant intelligent révolutionne la création de devis et le matching artisan-client."
  },
  {
    year: "2025",
    title: "Expansion nationale",
    description: "Reenove s'étend dans toute la France avec un réseau d'artisans qualifiés."
  },
]

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative w-full min-h-[70vh] flex items-center overflow-hidden bg-[#0E261C]">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#FCDA89]/10 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#FCDA89]/5 via-transparent to-transparent"></div>
              
              {/* Animated gradient orbs */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FCDA89]/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#FCDA89]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(252,218,137,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(252,218,137,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            
            <div className="container relative z-10 px-4 md:px-6 py-20 mx-auto">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-[#FCDA89]/10 border border-[#FCDA89]/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#FCDA89]" />
                  <span className="text-[#FCDA89] text-sm font-medium">Notre histoire</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Nous réinventons la
                  <span className="relative inline-block ml-3">
                    <span className="text-[#FCDA89]">rénovation</span>
                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C50 4 150 4 198 10" stroke="#FCDA89" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                </h1>
                
                <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Reenove connecte les particuliers aux meilleurs artisans grâce à l&apos;intelligence artificielle. 
                  Une approche moderne pour des projets réussis.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold px-8 py-6 text-lg rounded-xl" asChild>
                    <Link href="/create-project-ai">
                      <Bot className="mr-2 h-5 w-5" />
                      Démarrer un projet
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-[#FCDA89]/30 bg-[#FCDA89]/10 hover:bg-[#FCDA89]/20 text-[#FCDA89] px-8 py-6 text-lg rounded-xl font-semibold" asChild>
                    <Link href="/contact">
                      Nous contacter
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 1440 100" fill="none" className="w-full">
                <path d="M0 50L48 45.7C96 41.3 192 32.7 288 30.8C384 29 480 34 576 41.2C672 48.3 768 57.7 864 55.8C960 54 1056 41 1152 36.7C1248 32.3 1344 36.7 1392 38.8L1440 41V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="#0A1210"/>
              </svg>
            </div>
          </section>

          {/* Stats Section */}
          <section className="w-full py-16 bg-[#0A1210] relative overflow-hidden">
            <div className="container px-4 md:px-6 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-[#FCDA89]/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FCDA89]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 rounded-xl bg-[#FCDA89]/10 text-[#FCDA89] group-hover:bg-[#FCDA89]/20 transition-colors">
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="text-3xl md:text-4xl font-bold text-[#FCDA89] mb-1">{stat.value}</div>
                      <div className="text-sm text-white/60">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="w-full py-20 bg-[#0E261C] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#FCDA89]/5 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-[#FCDA89]/5 to-transparent opacity-30"></div>
            
            <div className="container px-4 md:px-6 relative z-10 mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                {/* Mission */}
                <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-10 hover:bg-white/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FCDA89]/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-[#FCDA89]/10 text-[#FCDA89]">
                      <Target className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Notre Mission</h2>
                  </div>
                  
                  <p className="text-white/70 text-lg leading-relaxed mb-6">
                    Simplifier la rénovation pour tous. Nous croyons que chaque projet mérite les meilleurs artisans, 
                    et que la technologie peut rendre ce processus plus simple, plus rapide et plus fiable.
                  </p>
                  
                  <ul className="space-y-3">
                    {["Connecter les bons artisans aux bons projets", "Garantir qualité et transparence", "Accompagner de A à Z"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/80">
                        <CheckCircle2 className="w-5 h-5 text-[#FCDA89] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Vision */}
                <div className="group relative bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-10 hover:bg-white/10 transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FCDA89]/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-[#FCDA89]/10 text-[#FCDA89]">
                      <Eye className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Notre Vision</h2>
                  </div>
                  
                  <p className="text-white/70 text-lg leading-relaxed mb-6">
                    Devenir la référence de la rénovation en France. Un écosystème où artisans et particuliers 
                    collaborent en toute confiance pour donner vie à des projets exceptionnels.
                  </p>
                  
                  <ul className="space-y-3">
                    {["Leader de la rénovation digitale", "Réseau national d'artisans d'excellence", "Innovation continue au service de tous"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/80">
                        <TrendingUp className="w-5 h-5 text-[#FCDA89] flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="w-full py-20 bg-[#0A1210] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(252,218,137,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(252,218,137,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
            
            <div className="container px-4 md:px-6 relative z-10 mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nos Valeurs</h2>
                <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
                <p className="text-white/70 max-w-2xl mx-auto text-lg">
                  Les principes qui guident chacune de nos actions et façonnent l&apos;expérience Reenove
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {values.map((value, index) => (
                  <div 
                    key={index}
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FCDA89]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-4">
                        <div className="inline-flex p-3 rounded-xl bg-[#FCDA89]/10 text-[#FCDA89] group-hover:bg-[#FCDA89]/20 transition-colors">
                          <value.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="w-full py-20 bg-[#0E261C] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FCDA89]/5 to-transparent opacity-50"></div>
            
            <div className="container px-4 md:px-6 relative z-10 mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Notre Parcours</h2>
                <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
                <p className="text-white/70 max-w-2xl mx-auto text-lg">
                  Les étapes clés qui ont façonné Reenove
                </p>
              </div>
              
              <div className="max-w-3xl mx-auto">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#FCDA89] via-[#FCDA89]/50 to-transparent"></div>
                  
                  {timeline.map((item, index) => (
                    <div 
                      key={index}
                      className={`relative flex items-center gap-8 mb-12 ${
                        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-8 md:left-1/2 w-4 h-4 -translate-x-1/2 rounded-full bg-[#FCDA89] ring-4 ring-[#0E261C] z-10"></div>
                      
                      {/* Content */}
                      <div className={`ml-16 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300">
                          <span className="inline-block px-3 py-1 text-sm font-medium text-[#FCDA89] bg-[#FCDA89]/10 rounded-full mb-3">
                            {item.year}
                          </span>
                          <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                          <p className="text-white/60">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-20 bg-[#0A1210] relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="container px-4 md:px-6 relative z-10 mx-auto">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Prêt à transformer votre projet en réalité ?
                </h2>
                <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                  Rejoignez les milliers de particuliers qui font confiance à Reenove pour leurs projets de rénovation.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold px-8 py-6 text-lg rounded-xl" asChild>
                    <Link href="/create-project-ai">
                      <Bot className="mr-2 h-5 w-5" />
                      Obtenir un devis gratuit
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-[#FCDA89]/30 bg-[#FCDA89]/10 hover:bg-[#FCDA89]/20 text-[#FCDA89] px-8 py-6 text-lg rounded-xl font-semibold" asChild>
                    <Link href="/artisans">
                      Découvrir nos artisans
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
        <BottomNavbar />
      </div>
    </>
  )
}

