"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { User, Wrench, BadgeCheck, Mail, Lock, UserCircle, Building2, Phone } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { signIn } from "next-auth/react"

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role")
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirection si aucun rôle n'a été sélectionné
  useEffect(() => {
    if (!role || !["client", "artisan", "agent"].includes(role)) {
      router.push("/register/role")
    }
  }, [role, router])

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    company: "",
    phone: "",
    acceptTerms: false
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation de base
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    if (!formData.acceptTerms) {
      toast({
        title: "Erreur",
        description: "Vous devez accepter les conditions d'utilisation",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
          phone: formData.phone,
          role: role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Une erreur s'est produite lors de l'inscription")
      }

      // Inscription réussie - redirection vers la page de succès
      if (role === "artisan") {
        // Connecter l'utilisateur
        try {
          // Utiliser signIn pour connecter l'utilisateur directement
          const result = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
          });
          
          if (result?.ok) {
            // Rediriger vers le profil artisan (première étape de l'onboarding)
            toast({
              title: "Inscription réussie",
              description: "Veuillez compléter votre profil professionnel pour continuer.",
            });
            router.push("/onboarding/artisan/profile");
          } else {
            // En cas d'échec de connexion, rediriger vers la page de succès
            toast({
              title: "Inscription réussie",
              description: "Votre compte a été créé. Vous pouvez maintenant vous connecter.",
            });
            router.push("/auth/success");
          }
        } catch (error) {
          console.error("Erreur lors de la connexion automatique:", error);
          router.push("/auth/success");
        }
      } else {
        // Pour les autres rôles, comportement inchangé
        router.push("/auth/success");
      }
      
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Une erreur s'est produite lors de l'inscription",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Informations spécifiques par rôle
  const getRoleInfo = () => {
    switch(role) {
      case "client":
        return {
          title: "Complétez votre profil client",
          icon: <User className="h-8 w-8 text-blue-600" />,
          color: "bg-blue-100"
        }
      case "artisan":
        return {
          title: "Complétez votre profil artisan",
          icon: <Wrench className="h-8 w-8 text-green-600" />,
          color: "bg-green-100"
        }
      case "agent":
        return {
          title: "Complétez votre profil agent",
          icon: <BadgeCheck className="h-8 w-8 text-purple-600" />,
          color: "bg-purple-100"
        }
      default:
        return {
          title: "Complétez votre inscription",
          icon: <User className="h-8 w-8 text-gray-600" />,
          color: "bg-gray-100"
        }
    }
  }

  const roleInfo = getRoleInfo()

  if (!role || !["client", "artisan", "agent"].includes(role)) {
    return null // Évite le flash de contenu avant la redirection
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg border-t-4 border-t-primary">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full ${roleInfo.color} flex items-center justify-center mb-2`}>
              {roleInfo.icon}
            </div>
            <CardTitle className="text-2xl">{roleInfo.title}</CardTitle>
            <CardDescription>
              Renseignez vos informations pour finaliser votre inscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="pl-10"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="********" 
                      className="pl-10"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="********" 
                      className="pl-10"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Jean" 
                      className="pl-10"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Dupont" 
                      className="pl-10"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              
              {(role === "artisan" || role === "agent") && (
                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l&apos;entreprise</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Nom de votre entreprise" 
                      className="pl-10"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="06 12 34 56 78" 
                    className="pl-10"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="acceptTerms" 
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
                  }
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  J&apos;accepte les <Link href="/terms" className="text-primary hover:underline">conditions d&apos;utilisation</Link> et la <Link href="/privacy" className="text-primary hover:underline">politique de confidentialité</Link>
                </label>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/role")}
                  disabled={isSubmitting}
                >
                  Retour
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création en cours..." : "Créer mon compte"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ? <Link href="/auth?tab=login" className="text-primary font-medium hover:underline">Se connecter</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 