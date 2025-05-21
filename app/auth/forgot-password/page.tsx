"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Check, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Cette partie sera à remplacer par un vrai appel API
      // Simulation d'un appel réseau
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      toast({
        title: "Email envoyé",
        description: "Si un compte existe avec cette adresse, vous recevrez un email pour réinitialiser votre mot de passe.",
      })
      
      setIsSubmitted(true)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E261C] p-4 overflow-hidden relative">
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Logo en haut de la page */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
        <Link href="/">
          <Image
            src="/logow.png"
            alt="Reenove Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Bouton de retour */}
        <div className="mb-6">
          <Link
            href="/auth?tab=login"
            className="inline-flex items-center text-sm font-medium text-[#FCDA89] hover:text-[#FCDA89]/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
        
        {/* Card avec effet glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl blur-md opacity-75"></div>
          <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Mot de passe oublié</h1>
                <div className="w-16 h-1 bg-[#FCDA89] mx-auto mb-4"></div>
                <p className="text-white/70 text-sm">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
                </p>
              </div>
              
              {isSubmitted ? (
                <div className="bg-[#FCDA89]/10 border border-[#FCDA89]/30 rounded-lg p-4 text-white">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-[#FCDA89] mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-[#FCDA89]">Email envoyé</h3>
                      <p className="mt-1 text-sm text-white/80">
                        Si un compte existe avec l'adresse <span className="font-medium">{email}</span>, 
                        vous recevrez un email contenant un lien pour réinitialiser votre mot de passe.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemple@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#FCDA89]/50 focus:ring-[#FCDA89]/20"
                      autoComplete="email"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold rounded-xl" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le lien de réinitialisation"
                    )}
                  </Button>
                </form>
              )}

              {/* Texte de sécurité */}
              <div className="pt-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Check className="h-4 w-4 text-[#FCDA89]" />
                    <span>Lien valide pendant 24 heures</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-white/60">
                    <Check className="h-4 w-4 text-[#FCDA89]" />
                    <span>Processus sécurisé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Liens en bas */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/60">
            Vous vous souvenez de votre mot de passe ? {" "}
            <Link href="/auth?tab=login" className="text-[#FCDA89] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 