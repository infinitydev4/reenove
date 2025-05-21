import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CtaSection() {
  return (
    <section 
      id="publier-projet"
      className="w-full py-20 bg-[#0E261C] relative overflow-hidden" 
      aria-labelledby="cta-heading"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#FCDA89]/10 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 opacity-50"></div>
      
      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1 mb-4 rounded-full bg-[#FCDA89]/20 border border-[#FCDA89]/30">
            <FileText className="h-4 w-4 text-[#FCDA89]" />
            <p className="text-[#FCDA89] text-sm font-medium">Prêt à commencer ?</p>
          </div>
          
          <h2 
            id="cta-heading" 
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            Publiez votre projet de rénovation et trouvez les meilleurs artisans
          </h2>
          
          <p className="text-lg text-white/70 mb-10 mx-auto max-w-2xl">
            Décrivez vos besoins, recevez des devis personnalisés et choisissez le professionnel idéal pour réaliser vos travaux de rénovation, d'aménagement ou de décoration.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold px-8 py-6 text-lg rounded-xl"
              asChild
            >
              <Link href="/create-project-ai">
                Publier un projet
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="border border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-6 text-lg rounded-xl"
              asChild
            >
              <Link href="/contact">
               Nous contacter
              </Link>
            </Button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-white/50">
            <p>Plus de <span className="text-[#FCDA89]">5000+</span> projets publiés</p>
            <p>Plus de <span className="text-[#FCDA89]">1200+</span> artisans certifiés</p>
            <p>Plus de <span className="text-[#FCDA89]">98%</span> de clients satisfaits</p>
          </div>
        </div>
      </div>
    </section>
  )
} 