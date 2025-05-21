import Image from "next/image"
import { Bot, Shield, Clock, Star } from "lucide-react"

export default function WhyReenoveSection() {
  return (
    <section className="w-full py-20 bg-[#0E261C] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#FCDA89]/5 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-[#FCDA89]/5 to-transparent opacity-30"></div>
      
      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Pourquoi Reenove est la solution fiable</h2>
          <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Une plateforme intelligente qui comprend vos besoins et vous connecte aux meilleurs artisans
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div className="order-2 md:order-1">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Assistance IA intelligente</h3>
                  <p className="text-white/70">
                    Nos agents IA analysent rapidement vos projets et les attribuent aux artisans les plus qualifiés pour vos besoins spécifiques.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Artisans vérifiés</h3>
                  <p className="text-white/70">
                    Tous nos artisans sont soigneusement évalués et certifiés pour garantir un travail de qualité et votre sécurité.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Traitement rapide</h3>
                  <p className="text-white/70">
                    Notre système analyse instantanément vos demandes pour vous proposer les solutions adaptées en un temps record.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCDA89]/20 text-[#FCDA89]">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Satisfaction garantie</h3>
                  <p className="text-white/70">
                    Notre système de recommandation basé sur l'IA assure une correspondance optimale entre vos besoins et les compétences des artisans.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl blur-md"></div>
              <div className="relative bg-white/5 backdrop-blur-sm overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src="/images/agent-ai.png"
                  alt="Reenove IA"
                  className="w-full h-auto object-cover"
                  width={550}
                  height={550}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 