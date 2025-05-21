"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "login"
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState("")
  const [formValues, setFormValues] = useState({
    email: "",
    password: ""
  })
  const { toast } = useToast()

  // Rediriger vers la nouvelle page d'inscription si on est sur l'onglet register
  useEffect(() => {
    if (tab === "register") {
      router.push("/register/role")
    }
  }, [tab, router])

  // Vérifier s'il y a une erreur dans les paramètres de l'URL
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setFormError("Une erreur s'est produite. Veuillez réessayer.")
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormValues(prev => ({ ...prev, [name]: value }))
    setFormError("") // Réinitialise l'erreur quand l'utilisateur modifie le formulaire
  }

  // Login Form Handler
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setFormError("")

    // Validation côté client
    if (!formValues.email || !formValues.password) {
      setFormError("Veuillez remplir tous les champs")
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: formValues.email,
        password: formValues.password,
        redirect: false,
      })

      if (result?.error) {
        console.error("Erreur de connexion:", result.error)
        setFormError(result.error)
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        })
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Erreur de connexion inattendue:", error)
      setFormError("Une erreur inattendue s'est produite. Veuillez réessayer.")
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
        <div className="absolute top-[40%] right-[20%] w-72 h-72 bg-[#FCDA89]/5 rounded-full blur-3xl"></div>
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
      
      <div className="relative z-10 w-full max-w-md">
        {/* Card avec effet glassmorphism */}
        <div className="relative group">
          <div className="absolute -inset-1  rounded-2xl blur-md opacity-75"></div>
          <div className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-2xl overflow-hidden p-6 sm:p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Bienvenue</h1>
                <div className="w-16 h-1 bg-[#FCDA89] mx-auto mb-4"></div>
                <p className="text-white/70 text-sm">Connectez-vous à votre compte Renoveo</p>
              </div>
              
              {formError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-sm text-white">
                  {formError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="exemple@email.com"
                    required
                    disabled={isLoading}
                    value={formValues.email}
                    onChange={handleInputChange}
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#FCDA89]/50 focus:ring-[#FCDA89]/20",
                      formError ? "border-red-500/50" : ""
                    )}
                    autoComplete="email"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-white">Mot de passe</Label>
                    <Link href="/auth/forgot-password" className="text-xs text-[#FCDA89] hover:underline">
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    value={formValues.password}
                    onChange={handleInputChange}
                    className={cn(
                      "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#FCDA89]/50 focus:ring-[#FCDA89]/20",
                      formError ? "border-red-500/50" : ""
                    )}
                    autoComplete="current-password"
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
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0E261C]/70 px-2 text-white/50 backdrop-blur-sm">
                    ou
                  </span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl flex items-center justify-center"
                asChild
              >
                <Link href="/register/role">
                  Créer un compte
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
