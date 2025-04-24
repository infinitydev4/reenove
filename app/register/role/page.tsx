"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Wrench, BadgeCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Quel type de compte souhaitez-vous créer ?</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choisissez le type de compte qui correspond le mieux à vos besoins sur notre plateforme.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Carte Client */}
          <Card 
            className={cn(
              "relative overflow-hidden transition-all duration-300 ease-in-out border-2 hover:shadow-lg cursor-pointer", 
              selectedRole === "client" 
                ? "border-primary ring-2 ring-primary ring-opacity-50 transform scale-[1.02]" 
                : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            )}
            onClick={() => handleRoleSelect("client")}
          >
            <div className={cn(
              "absolute top-0 right-0 w-0 h-0 border-t-[50px] border-r-[50px] border-t-transparent transition-colors duration-300",
              selectedRole === "client" ? "border-r-primary" : "border-r-transparent"
            )}></div>
            {selectedRole === "client" && (
              <div className="absolute top-1 right-1 text-white">
                <BadgeCheck className="h-5 w-5" />
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
              <CardTitle className="text-xl">Client</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3 pb-6">
              <CardDescription className="min-h-[80px]">
                Idéal pour les particuliers ou entreprises à la recherche d'artisans qualifiés pour réaliser vos projets.
              </CardDescription>
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Publiez des demandes de travaux</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Recevez des devis personnalisés</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Évaluez les prestations réalisées</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Carte Artisan */}
          <Card 
            className={cn(
              "relative overflow-hidden transition-all duration-300 ease-in-out border-2 hover:shadow-lg cursor-pointer", 
              selectedRole === "artisan" 
                ? "border-primary ring-2 ring-primary ring-opacity-50 transform scale-[1.02]" 
                : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            )}
            onClick={() => handleRoleSelect("artisan")}
          >
            <div className={cn(
              "absolute top-0 right-0 w-0 h-0 border-t-[50px] border-r-[50px] border-t-transparent transition-colors duration-300",
              selectedRole === "artisan" ? "border-r-primary" : "border-r-transparent"
            )}></div>
            {selectedRole === "artisan" && (
              <div className="absolute top-1 right-1 text-white">
                <BadgeCheck className="h-5 w-5" />
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-2">
                <Wrench className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
              <CardTitle className="text-xl">Artisan</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3 pb-6">
              <CardDescription className="min-h-[80px]">
                Parfait pour les professionnels du bâtiment et de la rénovation souhaitant développer leur clientèle.
              </CardDescription>
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Créez votre profil professionnel</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Recevez des demandes qualifiées</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Gérez vos projets et facturations</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Carte Agent */}
          <Card 
            className={cn(
              "relative overflow-hidden transition-all duration-300 ease-in-out border-2 hover:shadow-lg cursor-pointer", 
              selectedRole === "agent" 
                ? "border-primary ring-2 ring-primary ring-opacity-50 transform scale-[1.02]" 
                : "border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            )}
            onClick={() => handleRoleSelect("agent")}
          >
            <div className={cn(
              "absolute top-0 right-0 w-0 h-0 border-t-[50px] border-r-[50px] border-t-transparent transition-colors duration-300",
              selectedRole === "agent" ? "border-r-primary" : "border-r-transparent"
            )}></div>
            {selectedRole === "agent" && (
              <div className="absolute top-1 right-1 text-white">
                <BadgeCheck className="h-5 w-5" />
              </div>
            )}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                <BadgeCheck className="h-8 w-8 text-purple-600 dark:text-purple-300" />
              </div>
              <CardTitle className="text-xl">Agent</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3 pb-6">
              <CardDescription className="min-h-[80px]">
                Pour les intermédiaires qui souhaitent mettre en relation clients et artisans et suivre les projets.
              </CardDescription>
              <ul className="text-sm space-y-2 text-left">
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Gérez plusieurs clients</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Coordonnez des projets multiples</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 mt-0.5">•</span>
                  <span>Accédez à des outils d'analyse</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center gap-4 pt-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Retour
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedRole}
            className="min-w-[120px]"
          >
            Continuer
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Vous avez déjà un compte ? <Link href="/auth?tab=login" className="text-primary font-medium hover:underline">Se connecter</Link>
        </div>
      </div>
    </div>
  )
} 