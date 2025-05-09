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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-black/95 dark:to-black/90 p-4 overflow-hidden relative">
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-400/10 dark:bg-blue-800/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-purple-400/10 dark:bg-purple-800/10 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] right-[20%] w-72 h-72 bg-green-400/10 dark:bg-green-800/10 rounded-full blur-3xl"></div>
      </div>

      {/* Logo en haut de la page */}
      <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Reenove Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain block dark:hidden"
          />
          <Image
            src="/logow.png"
            alt="Reenove Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain hidden dark:block"
          />
        </Link>
      </div>
      
      <div className="w-full max-w-5xl space-y-8 z-10 relative mt-16 md:mt-20">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Rejoignez Reenove</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sélectionnez le rôle qui correspond à vos besoins pour personnaliser votre expérience.
          </p>
        </div>

        <div className="grid gap-8 md:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto px-4">
          {/* Carte Client */}
          <Card 
            className={cn(
              "relative overflow-hidden cursor-pointer max-w-xs mx-auto w-full backdrop-blur-sm transition-all duration-300 ease-in-out",
              "bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/60",
              "border border-gray-100 dark:border-gray-800",
              "shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,30,0.2)]",
              "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,1)] dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,30,0.3)]",
              selectedRole === "client" && "border-blue-400/30 dark:border-blue-500/30 shadow-blue-500/5 dark:shadow-blue-500/5"
            )}
            onClick={() => handleRoleSelect("client")}
          >
            {selectedRole === "client" && (
              <div className="absolute top-0 right-0 m-2">
                <div className="bg-blue-500 rounded-full flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 shadow-inner shadow-blue-600/50">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-1 sm:pb-2 pt-4 sm:pt-6 px-3 sm:px-4">
              <div className={cn(
                "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                "bg-blue-50 dark:bg-blue-900/20",
                "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(30,30,30,0.2)]"
              )}>
                <User className="h-6 w-6 sm:h-7 sm:w-7 text-blue-500 dark:text-blue-400" />
              </div>
              <CardTitle className="text-base sm:text-lg mt-1 sm:mt-2 font-semibold">Client</CardTitle>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 dark:via-blue-500 to-transparent mx-auto mt-1 sm:mt-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-2 sm:space-y-4 pb-4 sm:pb-6 px-3 sm:px-5">
              <CardDescription className="min-h-[40px] sm:min-h-[50px] text-xs sm:text-sm">
                Trouvez les meilleurs artisans pour vos projets.
              </CardDescription>
              {/* Commenté à la demande de l'utilisateur
              <ul className="text-[10px] sm:text-xs space-y-1.5 sm:space-y-2.5 text-left mt-1 sm:mt-2">
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span>Publiez vos projets en quelques clics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span>Comparez les devis des artisans</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 dark:text-blue-400" />
                  </div>
                  <span>Suivez l&apos;avancement en temps réel</span>
                </li>
              </ul>
              */}
            </CardContent>
          </Card>

          {/* Carte Artisan */}
          <Card 
            className={cn(
              "relative overflow-hidden cursor-pointer max-w-xs mx-auto w-full backdrop-blur-sm transition-all duration-300 ease-in-out",
              "bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/60",
              "border border-gray-100 dark:border-gray-800",
              "shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,30,0.2)]",
              "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,1)] dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,30,0.3)]",
              selectedRole === "artisan" && "border-green-400/30 dark:border-green-500/30 shadow-green-500/5 dark:shadow-green-500/5"
            )}
            onClick={() => handleRoleSelect("artisan")}
          >
            {selectedRole === "artisan" && (
              <div className="absolute top-0 right-0 m-2">
                <div className="bg-green-500 rounded-full flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 shadow-inner shadow-green-600/50">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-1 sm:pb-2 pt-4 sm:pt-6 px-3 sm:px-4">
              <div className={cn(
                "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                "bg-green-50 dark:bg-green-900/20",
                "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(30,30,30,0.2)]"
              )}>
                <Wrench className="h-6 w-6 sm:h-7 sm:w-7 text-green-500 dark:text-green-400" />
              </div>
              <CardTitle className="text-base sm:text-lg mt-1 sm:mt-2 font-semibold">Artisan</CardTitle>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 dark:via-green-500 to-transparent mx-auto mt-1 sm:mt-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-2 sm:space-y-4 pb-4 sm:pb-6 px-3 sm:px-5">
              <CardDescription className="min-h-[40px] sm:min-h-[50px] text-xs sm:text-sm">
                Développez votre activité avec des clients qualifiés.
              </CardDescription>
              {/* Commenté à la demande de l'utilisateur
              <ul className="text-[10px] sm:text-xs space-y-1.5 sm:space-y-2.5 text-left mt-1 sm:mt-2">
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 dark:text-green-400" />
                  </div>
                  <span>Valorisez votre expertise professionnelle</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 dark:text-green-400" />
                  </div>
                  <span>Accédez à des projets ciblés</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500 dark:text-green-400" />
                  </div>
                  <span>Gérez facilement vos interventions</span>
                </li>
              </ul>
              */}
            </CardContent>
          </Card>

          {/* Carte Agent */}
          <Card 
            className={cn(
              "relative overflow-hidden cursor-pointer max-w-xs mx-auto w-full backdrop-blur-sm transition-all duration-300 ease-in-out",
              "bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black/60",
              "border border-gray-100 dark:border-gray-800",
              "shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,30,0.2)]",
              "hover:shadow-[8px_8px_16px_rgba(0,0,0,0.07),-8px_-8px_16px_rgba(255,255,255,1)] dark:hover:shadow-[8px_8px_16px_rgba(0,0,0,0.4),-8px_-8px_16px_rgba(30,30,30,0.3)]",
              selectedRole === "agent" && "border-purple-400/30 dark:border-purple-500/30 shadow-purple-500/5 dark:shadow-purple-500/5"
            )}
            onClick={() => handleRoleSelect("agent")}
          >
            {selectedRole === "agent" && (
              <div className="absolute top-0 right-0 m-2">
                <div className="bg-purple-500 rounded-full flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 shadow-inner shadow-purple-600/50">
                  <BadgeCheck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
              </div>
            )}
            <CardHeader className="text-center pb-1 sm:pb-2 pt-4 sm:pt-6 px-3 sm:px-4">
              <div className={cn(
                "mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2 sm:mb-3",
                "bg-purple-50 dark:bg-purple-900/20",
                "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(30,30,30,0.2)]"
              )}>
                <BadgeCheck className="h-6 w-6 sm:h-7 sm:w-7 text-purple-500 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base sm:text-lg mt-1 sm:mt-2 font-semibold">Agent</CardTitle>
              <div className="w-12 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-400 dark:via-purple-500 to-transparent mx-auto mt-1 sm:mt-2"></div>
            </CardHeader>
            <CardContent className="text-center space-y-2 sm:space-y-4 pb-4 sm:pb-6 px-3 sm:px-5">
              <CardDescription className="min-h-[40px] sm:min-h-[50px] text-xs sm:text-sm">
                Connectez clients et artisans efficacement.
              </CardDescription>
              {/* Commenté à la demande de l'utilisateur
              <ul className="text-[10px] sm:text-xs space-y-1.5 sm:space-y-2.5 text-left mt-1 sm:mt-2">
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-500 dark:text-purple-400" />
                  </div>
                  <span>Pilotez plusieurs projets simultanément</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-500 dark:text-purple-400" />
                  </div>
                  <span>Optimisez la gestion multi-clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-0.5 mt-0.5 flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-500 dark:text-purple-400" />
                  </div>
                  <span>Visualisez vos données analytiques</span>
                </li>
              </ul>
              */}
            </CardContent>
          </Card>
        </div>

        {/* Boutons pour desktop */}
        <div className="hidden md:flex justify-center gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="bg-white/80 dark:bg-black/50 border-gray-100 dark:border-gray-800 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)] hover:shadow-[6px_6px_10px_rgba(0,0,0,0.07),-6px_-6px_10px_rgba(255,255,255,1)] dark:hover:shadow-[6px_6px_10px_rgba(0,0,0,0.4),-6px_-6px_10px_rgba(30,30,30,0.3)] transition-all"
          >
            Retour
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className={cn(
              "min-w-[120px] flex items-center gap-2 transition-all",
              "bg-gray-900 hover:bg-gray-800 dark:bg-gray-50 dark:hover:bg-white dark:text-gray-900",
              "shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)]",
              "hover:shadow-[6px_6px_10px_rgba(0,0,0,0.07),-6px_-6px_10px_rgba(255,255,255,1)] dark:hover:shadow-[6px_6px_10px_rgba(0,0,0,0.4),-6px_-6px_10px_rgba(30,30,30,0.3)]",
              !selectedRole && "opacity-70"
            )}
          >
            Continuer
            {selectedRole && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Barre de navigation fixe en bas pour mobile */}
        <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.3)] py-3 px-4">
          <div className="flex justify-between items-center w-full gap-4 max-w-md mx-auto">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex-1 flex items-center justify-center gap-2 bg-white/90 dark:bg-black/60 border-gray-100 dark:border-gray-800 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)]"
              size="sm"
            >
              Retour
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedRole}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 transition-all",
                "bg-gray-900 hover:bg-gray-800 dark:bg-gray-50 dark:hover:bg-white dark:text-gray-900",
                "shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)]",
                !selectedRole && "opacity-70"
              )}
              size="sm"
            >
              Continuer
              {selectedRole && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6 pb-20 md:pb-0">
          Vous avez déjà un compte ? <Link href="/auth?tab=login" className="text-primary font-medium hover:underline">Se connecter</Link>
        </div>
      </div>
    </div>
  )
} 