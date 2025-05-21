import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ArtisanCard from "@/components/artisan-card"

export default function ArtisansSection() {
  return (
    <section className="w-full py-20 bg-[#0E261C]/90">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Artisans à la une</h2>
          <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Nos professionnels les mieux notés et les plus demandés
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <ArtisanCard
            name="Thomas Dubois"
            profession="Menuisier"
            rating={4.9}
            reviews={124}
            image="/images/menuisier.png"
            location="Marseille"
          />
          <ArtisanCard
            name="Marie Laurent"
            profession="Électricien"
            rating={4.8}
            reviews={98}
            image="/images/electricien.png"
            location="Marseille"
          />
          <ArtisanCard
            name="Jean Moreau"
            profession="Plombier"
            rating={4.7}
            reviews={156}
            image="/images/plombier.png"
            location="Marseille"
          />
        </div>
        
        <div className="flex justify-center mt-10">
          <Button variant="outline" className="bg-[#0A1210] text-[#FCDA89] hover:bg-[#FCDA89]/10 font-medium rounded-xl px-6 py-3" asChild>
            <Link href="/artisans">
              Voir tous les artisans<ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
} 