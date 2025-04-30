"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simuler un chargement
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              href="/auth"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Réinitialiser votre mot de passe</CardTitle>
              <CardDescription>
                Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-300">E-mail envoyé</AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    Nous avons envoyé un lien de réinitialisation à {email}. Veuillez vérifier votre boîte de réception.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="exemple@email.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le lien de réinitialisation"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Check className="h-4 w-4 text-green-500" />
                <span>Lien valide pendant 24 heures</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Check className="h-4 w-4 text-green-500" />
                <span>Processus sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-6 border-t bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 Reenove. Tous droits réservés.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link
              href="/about"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              À propos
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Confidentialité
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
