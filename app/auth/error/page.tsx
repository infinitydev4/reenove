"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle } from "lucide-react"

// Définition des messages d'erreur personnalisés
const errorMessages: Record<string, string> = {
  "CredentialsSignin": "Identifiants invalides. Veuillez vérifier votre email et mot de passe.",
  "Veuillez fournir un email et un mot de passe": "Veuillez fournir un email et un mot de passe.",
  "Aucun compte trouvé avec cet email": "Aucun compte n'est associé à cet email.",
  "Mot de passe incorrect": "Le mot de passe saisi est incorrect.",
  "Méthode d'authentification non valide": "Méthode d'authentification non valide.",
  "OAuthAccountNotLinked": "Ce compte est déjà lié à une autre méthode de connexion.",
  "default": "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
}

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("Une erreur s'est produite")
  
  useEffect(() => {
    const error = searchParams.get("error")
    
    if (error && errorMessages[error]) {
      setErrorMessage(errorMessages[error])
    } else {
      setErrorMessage(errorMessages.default)
    }
  }, [searchParams])
  
  return (
    <div className="container flex flex-col items-center justify-center h-screen max-w-md py-10">
      <div className="w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Erreur d&apos;authentification</h1>
          <p className="text-gray-500">Un problème est survenu lors de la connexion</p>
        </div>
        
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Échec de connexion</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-4">
          <Button asChild>
            <Link href="/auth">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la page de connexion
            </Link>
          </Button>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              Besoin d&apos;aide ? <Link href="/contact" className="text-primary hover:underline">Contactez-nous</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 