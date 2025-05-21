"use client"

import { useState } from "react"
import { ChevronDown, MessageCircleQuestion } from "lucide-react"
import { cn } from "@/lib/utils"

interface FaqItemProps {
  question: string
  answer: string
}

function FaqItem({ question, answer }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left transition-colors"
      >
        <h3 className="text-base md:text-lg font-medium text-white">{question}</h3>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-[#FCDA89] transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 text-white/70 text-sm md:text-base",
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="whitespace-pre-line">{answer}</p>
      </div>
    </div>
  )
}

export default function FaqSection() {
  const faqs: FaqItemProps[] = [
    {
      question: "Comment trouver un artisan qualifié sur Reenove ?",
      answer: "Vous pouvez rechercher un artisan en fonction de son métier, de sa localisation ou de ses disponibilités. Notre plateforme vous permet de filtrer les résultats selon vos critères et de consulter les avis des clients précédents pour vous aider à faire le meilleur choix."
    },
    {
      question: "Comment fonctionne le système de devis ?",
      answer: "Après avoir créé votre projet, celui-ci est partagé avec les artisans correspondant à vos besoins. Les artisans intéressés vous envoient leurs propositions avec un devis détaillé. Vous pouvez comparer les offres, discuter avec les artisans et accepter le devis qui vous convient le mieux."
    },
    {
      question: "Quels types de projets puis-je créer sur Reenove ?",
      answer: "Reenove vous permet de créer tous types de projets de rénovation et d'amélioration de l'habitat : plomberie, électricité, menuiserie, peinture, maçonnerie, jardinage, décoration intérieure, et bien plus encore. Notre assistant IA peut même vous aider à définir votre projet si vous n'êtes pas sûr des détails techniques."
    },
    {
      question: "Comment Reenove garantit-il la qualité des artisans ?",
      answer: "Tous les artisans présents sur notre plateforme sont vérifiés et doivent fournir des preuves de leurs qualifications et assurances professionnelles. De plus, notre système d'évaluation permet aux clients de noter les artisans après chaque projet, assurant ainsi une transparence totale sur la qualité de leur travail."
    },
    {
      question: "Quels sont les frais d'utilisation de Reenove ?",
      answer: "L'inscription et la recherche d'artisans sur Reenove sont entièrement gratuites pour les particuliers. Les artisans paient une commission uniquement lorsqu'ils obtiennent un projet via notre plateforme, ce qui nous permet de maintenir un service de qualité sans frais pour les clients."
    }
  ]

  return (
    <section id="faq" className="w-full py-20 bg-[#0E261C]">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1 mb-4 rounded-full bg-[#FCDA89]/20 border border-[#FCDA89]/30">
            <MessageCircleQuestion className="h-4 w-4 text-[#FCDA89]" />
            <p className="text-[#FCDA89] text-sm font-medium">Questions fréquentes</p>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Tout ce que vous devez savoir</h2>
          <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Des réponses claires à vos questions sur notre service
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-lg opacity-40"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 hover:shadow-xl hover:shadow-[#FCDA89]/5 transition-all">
              {faqs.map((faq, index) => (
                <FaqItem key={index} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 