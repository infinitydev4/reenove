"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Wrench, BadgeCheck, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function RoleSelectionPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"client" | "artisan" | "agent" | null>(null)

  const handleRoleSelect = (role: "client" | "artisan" | "agent") => {
    setSelectedRole(role)
  }

  const handleContinue = () => {
    if (selectedRole) {
      // Dans une application réelle, vous stockeriez ce choix et redirigeriez vers l'étape suivante
      router.push(`/register/complete?role=${selectedRole}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E261C] p-4 overflow-hidden relative">
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] right-[20%] w-72 h-72 bg-[#FCDA89]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Logo en haut de la page */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
        <Link href="/">
          <Image
            src="/logow.png"
            alt="Renoveo Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>
      
      <div className="w-full max-w-5xl space-y-8 z-10 relative mt-16 md:mt-20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-white">Rejoignez Renoveo</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Sélectionnez le rôle qui correspond à vos besoins pour personnaliser votre expérience.
          </p>
        </div>

        <div className="grid gap-8 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto px-4">
          {/* Carte Client */}
          <Card 
            className={cn(
              "relative overflow-hidden cursor-pointer max-w-xs mx-auto w-full backdrop-blur-sm transition-all duration-300 ease-in-out",
              "bg-white/5 hover:bg-white/10",
              "border border-white/10",
              "shadow-lg hover:shadow-xl",
              selectedRole === "client" && "border-[#FCDA89]/50 shadow-[#FCDA89]/5"
            )}
            onClick={() => handleRoleSelect("client")}
          >
            {selectedRole === "client" && (
              <div className="absolute top-0 right-0 m-2">
                <div className="bg-[#FCDA89] rounded-full flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 shadow-inner shadow-[#FCDA89]/50">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-[#0E261C]" />
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-1 sm:pb-2 pt-4 sm:pt-6 px-3 sm:px-4">
              <div className={cn(
                "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                "bg-[#FCDA89]/20",
                "shadow-inner"
              )}>
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-[#FCDA89]" />
              </div>
              <CardTitle className="text-base sm:text-lg mt-1 sm:mt-2 font-semibold text-white">Client</CardTitle>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-[#FCDA89] to-transparent mx-auto mt-1 sm:mt-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-2 sm:space-y-4 pb-4 sm:pb-6 px-3 sm:px-5">
              <CardDescription className="min-h-[40px] sm:min-h-[50px] text-xs sm:text-sm text-white/70">
                Trouvez les meilleurs artisans pour vos projets.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Carte Artisan */}
          <Card 
            className={cn(
              "relative overflow-hidden cursor-pointer max-w-xs mx-auto w-full backdrop-blur-sm transition-all duration-300 ease-in-out",
              "bg-white/5 hover:bg-white/10",
              "border border-white/10",
              "shadow-lg hover:shadow-xl",
              selectedRole === "artisan" && "border-[#FCDA89]/50 shadow-[#FCDA89]/5"
            )}
            onClick={() => handleRoleSelect("artisan")}
          >
            {selectedRole === "artisan" && (
              <div className="absolute top-0 right-0 m-2">
                <div className="bg-[#FCDA89] rounded-full flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 shadow-inner shadow-[#FCDA89]/50">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-[#0E261C]" />
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-1 sm:pb-2 pt-4 sm:pt-6 px-3 sm:px-4">
              <div className={cn(
                "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                "bg-[#FCDA89]/20",
                "shadow-inner"
              )}>
                <Wrench className="h-6 w-6 sm:h-7 sm:w-7 text-[#FCDA89]" />
              </div>
              <CardTitle className="text-base sm:text-lg mt-1 sm:mt-2 font-semibold text-white">Artisan</CardTitle>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-[#FCDA89] to-transparent mx-auto mt-1 sm:mt-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-2 sm:space-y-4 pb-4 sm:pb-6 px-3 sm:px-5">
              <CardDescription className="min-h-[40px] sm:min-h-[50px] text-xs sm:text-sm text-white/70">
                Développez votre activité avec des clients qualifiés.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Carte Agent */}
          <Card 
            className={cn(
              "relative overflow-hidden cursor-pointer max-w-xs mx-auto w-full backdrop-blur-sm transition-all duration-300 ease-in-out",
              "bg-white/5 hover:bg-white/10",
              "border border-white/10",
              "shadow-lg hover:shadow-xl",
              selectedRole === "agent" && "border-[#FCDA89]/50 shadow-[#FCDA89]/5"
            )}
            onClick={() => handleRoleSelect("agent")}
          >
            {selectedRole === "agent" && (
              <div className="absolute top-0 right-0 m-2">
                <div className="bg-[#FCDA89] rounded-full flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 shadow-inner shadow-[#FCDA89]/50">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-[#0E261C]" />
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-1 sm:pb-2 pt-4 sm:pt-6 px-3 sm:px-4">
              <div className={cn(
                "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                "bg-[#FCDA89]/20",
                "shadow-inner"
              )}>
                <BadgeCheck className="h-6 w-6 sm:h-7 sm:w-7 text-[#FCDA89]" />
              </div>
              <CardTitle className="text-base sm:text-lg mt-1 sm:mt-2 font-semibold text-white">Agent</CardTitle>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-[#FCDA89] to-transparent mx-auto mt-1 sm:mt-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-2 sm:space-y-4 pb-4 sm:pb-6 px-3 sm:px-5">
              <CardDescription className="min-h-[40px] sm:min-h-[50px] text-xs sm:text-sm text-white/70">
                Connectez clients et artisans efficacement.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Boutons pour desktop */}
        <div className="hidden md:flex justify-center gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all"
          >
            Retour
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className={cn(
              "min-w-[120px] flex items-center gap-2 transition-all",
              "bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold",
              !selectedRole && "opacity-70"
            )}
          >
            Continuer
            {selectedRole && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Barre de navigation fixe en bas pour mobile */}
        <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 bg-[#0E261C]/95 backdrop-blur-md border-t border-white/10 py-3 px-4">
          <div className="flex justify-between items-center w-full gap-4 max-w-md mx-auto">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10"
              size="sm"
            >
              Retour
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedRole}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 transition-all",
                "bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold",
                !selectedRole && "opacity-70"
              )}
              size="sm"
            >
              Continuer
              {selectedRole && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-white/70 mt-6 pb-20 md:pb-0">
          Vous avez déjà un compte ? <Link href="/auth?tab=login" className="text-[#FCDA89] font-medium hover:underline">Se connecter</Link>
        </div>
      </div>
    </div>
  )
} 