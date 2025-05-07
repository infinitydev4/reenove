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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

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
    <div className="container flex flex-col items-center justify-center h-screen max-w-md py-10">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reenove</h1>
          <p className="text-gray-500">Connexion à la plateforme</p>
        </div>

        <div className="w-full space-y-6">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

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
                value={formValues.email}
                onChange={handleInputChange}
                className={formError ? "border-red-500" : ""}
                autoComplete="email"
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
                value={formValues.password}
                onChange={handleInputChange}
                className={formError ? "border-red-500" : ""}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou
              </span>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Vous n&apos;avez pas encore de compte ?</p>
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
