"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "login"
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Rediriger vers la nouvelle page d'inscription si on est sur l'onglet register
  useEffect(() => {
    if (tab === "register") {
      router.push("/register/role")
    }
  }, [tab, router])

  // Login Form Handler
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Erreur d'authentification",
          description: "Identifiants invalides. Veuillez réessayer.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Quelque chose s'est mal passé",
        description: "Veuillez réessayer plus tard.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center h-screen max-w-md py-10">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">ArtiConnect</h1>
          <p className="text-gray-500">Connexion à la plateforme</p>
        </div>

        <div className="w-full space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="exemple@email.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Vous n'avez pas encore de compte ?</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/register/role">
                Créer un compte
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
