import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HowItWorksSection() {
  return (
    <section className="w-full py-20 bg-[#0E261C] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FCDA89]/5 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-[#FCDA89]/5 to-transparent opacity-30"></div>
      
      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FCDA89]/30 to-white/20 rounded-2xl blur-md"></div>
              <div className="relative bg-white/5 backdrop-blur-sm overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/img-ccm.png"
                  alt="Application Renoveo"
                  className="w-full h-auto object-cover"
                  width={550}
                  height={550}
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-6 order-1 lg:order-2">
            <div>
              <h2 className="text-3xl font-bold text-white mb-3">Comment ça marche</h2>
              <div className="w-20 h-1 bg-[#FCDA89] mb-6"></div>
              <p className="text-white/70 max-w-xl mb-8">
                Trouvez et engagez des artisans qualifiés en quelques étapes simples
              </p>
            </div>
            
            <ul className="grid gap-6">
              <li className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Search className="h-6 w-6" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-white">Recherchez</h3>
                  <p className="text-white/70">
                    Trouvez des artisans par métier, localisation ou disponibilité
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Users className="h-6 w-6" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-white">Comparez</h3>
                  <p className="text-white/70">
                    Consultez les profils, avis et réalisations des artisans
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Star className="h-6 w-6" />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-xl font-bold text-white">Contactez</h3>
                  <p className="text-white/70">
                    Discutez directement avec les artisans et obtenez des devis
                  </p>
                </div>
              </li>
            </ul>
            
            <div className="mt-6 text-center lg:text-left">
              <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold px-6 py-3 text-lg rounded-xl" asChild>
                <Link href="/register/role">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 