"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RegistrationSuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Compte à rebours pour redirection automatique
    const timer = setTimeout(() => {
      router.push("/auth?tab=login")
    }, 5000)

    // Mise à jour du compte à rebours chaque seconde
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-lg text-center">
        <Card className="shadow-lg border-t-4 border-t-green-500">
          <CardHeader className="pb-3">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-300" />
            </div>
            <CardTitle className="text-2xl font-bold">Inscription réussie !</CardTitle>
            <CardDescription className="text-lg">
              Votre compte a été créé avec succès
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6 space-y-4">
            <p>
              Vous allez être redirigé vers la page de connexion dans <span className="font-bold">{countdown}</span> secondes.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Un email de confirmation a été envoyé à votre adresse email.</p>
              <p>Veuillez vérifier votre boîte de réception et confirmer votre compte pour accéder à toutes les fonctionnalités.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 pt-2 border-t">
            <Button variant="outline" asChild>
              <Link href="/">
                Accueil
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth?tab=login">
                Se connecter
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 