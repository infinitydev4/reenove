import Link from "next/link"
import { Bot, Sparkles, Bolt } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ServicesSection() {
  return (
    <section className="w-full py-20 bg-[#0E261C]">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Nos Services Premium</h2>
          <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Des solutions adaptées à tous vos besoins de rénovation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FCDA89]/20 to-[#FCDA89]/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-[#FCDA89]/5 h-full flex flex-col">
              <div className="h-14 w-14 bg-[#FCDA89]/20 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="h-7 w-7 text-[#FCDA89]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Publier un projet</h3>
              <p className="text-white/70 mb-6 flex-grow">
                Publiez votre projet de rénovation et recevez des devis personnalisés d'artisans qualifiés.
              </p>
              <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-medium rounded-xl" asChild>
                <Link href="/create-project-ai">Essayer maintenant</Link>
              </Button>
            </div>
          </div>
          
          {/* <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#FCDA89]/20 to-[#FCDA89]/50 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-[#FCDA89]/5 h-full flex flex-col">
              <div className="h-14 w-14 bg-[#FCDA89]/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="h-7 w-7 text-[#FCDA89]" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Service sur mesure</h3>
              <p className="text-white/70 mb-6 flex-grow">
                Créez un projet personnalisé selon vos besoins spécifiques et recevez des devis adaptés.
              </p>
              <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-medium rounded-xl" asChild>
                <Link href="/create-project">Créer un projet</Link>
              </Button>
            </div>
          </div> */}
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 transition-all hover:shadow-xl hover:shadow-white/5 h-full flex flex-col">
              <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Bolt className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Reenove Express</h3>
              <p className="text-white/70 mb-6 flex-grow">
                Solutions rapides et efficaces pour vos projets urgents avec prise en charge prioritaire.
              </p>
              <Button className="bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl" variant="outline" disabled>
                Bientôt disponible
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 