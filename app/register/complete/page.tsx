"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { User, Wrench, BadgeCheck, Mail, Lock, UserCircle, Building2, Phone, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role")
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

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

  const handleFocus = (fieldName: string) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  // Informations spécifiques par rôle
  const getRoleInfo = () => {
    switch(role) {
      case "client":
        return {
          title: "Créez votre profil client",
          icon: <User className="h-8 w-8 text-blue-500" />,
          color: "bg-blue-500/10 dark:bg-blue-500/20",
          gradient: "from-blue-400 to-blue-600 dark:from-blue-600 dark:to-blue-800",
          shadow: "shadow-blue-500/5 dark:shadow-blue-500/10",
          border: "border-blue-400/30 dark:border-blue-500/30",
          highlight: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-500 dark:text-blue-400"
        }
      case "artisan":
        return {
          title: "Créer votre profil artisan",
          icon: <Wrench className="h-8 w-8 text-green-500" />,
          color: "bg-green-500/10 dark:bg-green-500/20",
          gradient: "from-green-400 to-green-600 dark:from-green-600 dark:to-green-800",
          shadow: "shadow-green-500/5 dark:shadow-green-500/10",
          border: "border-green-400/30 dark:border-green-500/30",
          highlight: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-500 dark:text-green-400"
        }
      case "agent":
        return {
          title: "Créer votre profil agent",
          icon: <BadgeCheck className="h-8 w-8 text-purple-500" />,
          color: "bg-purple-500/10 dark:bg-purple-500/20",
          gradient: "from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800",
          shadow: "shadow-purple-500/5 dark:shadow-purple-500/10",
          border: "border-purple-400/30 dark:border-purple-500/30",
          highlight: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-500 dark:text-purple-400"
        }
      default:
        return {
          title: "Complétez votre inscription",
          icon: <User className="h-8 w-8 text-gray-500" />,
          color: "bg-gray-500/10 dark:bg-gray-500/20",
          gradient: "from-gray-400 to-gray-600 dark:from-gray-600 dark:to-gray-800",
          shadow: "shadow-gray-500/5 dark:shadow-gray-500/10",
          border: "border-gray-400/30 dark:border-gray-500/30",
          highlight: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-500 dark:text-gray-400"
        }
    }
  }

  const roleInfo = getRoleInfo()

  if (!role || !["client", "artisan", "agent"].includes(role)) {
    return null // Évite le flash de contenu avant la redirection
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-black/95 dark:to-black/90 p-3 overflow-hidden relative">
      {/* Éléments décoratifs d'arrière-plan */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className={`absolute top-[10%] left-[5%] w-64 h-64 ${roleInfo.color} rounded-full blur-3xl opacity-20`}></div>
        <div className={`absolute bottom-[20%] right-[10%] w-80 h-80 ${roleInfo.color} rounded-full blur-3xl opacity-20`}></div>
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
      
      <div className="w-full max-w-2xl z-10 relative pb-20 md:pb-0 mt-16 md:mt-20">
        <Card className={cn(
          "border border-gray-100 dark:border-gray-800 overflow-hidden",
          "shadow-[6px_6px_12px_rgba(0,0,0,0.05),-6px_-6px_12px_rgba(255,255,255,0.9)] dark:shadow-[6px_6px_12px_rgba(0,0,0,0.3),-6px_-6px_12px_rgba(30,30,30,0.2)]",
          "bg-white/80 dark:bg-black/50 backdrop-blur-sm",
          roleInfo.border
        )}>
          <CardHeader className="space-y-1 flex flex-col items-center p-4 pb-2 md:p-6 md:pb-3">
            <div className={cn(
              "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-2",
              roleInfo.highlight,
              "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(30,30,30,0.2)]"
            )}>
              <div className={roleInfo.text}>
                {roleInfo.icon}
              </div>
            </div>
            <CardTitle className="text-xl md:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
              {roleInfo.title}
            </CardTitle>
            <div className={`w-12 h-0.5 bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent mx-auto mt-1 mb-1`}></div>
            <CardDescription className="text-center text-xs md:text-sm">
              Renseignez vos informations pour finaliser votre inscription
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2 md:p-6 md:pt-3">
            <form id="registration-form" onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs md:text-sm mb-0.5">Email</Label>
                <div className="relative">
                  <Mail className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                    focusedField === "email" 
                      ? roleInfo.text
                      : "text-muted-foreground"
                  }`} />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="votre@email.com" 
                    className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs md:text-sm mb-0.5">Mot de passe</Label>
                  <div className="relative">
                    <Lock className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                      focusedField === "password" 
                        ? roleInfo.text
                        : "text-muted-foreground"
                    }`} />
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="********" 
                      className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleFocus("password")}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs md:text-sm mb-0.5">Confirmer</Label>
                  <div className="relative">
                    <Lock className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                      focusedField === "confirmPassword" 
                        ? roleInfo.text
                        : "text-muted-foreground"
                    }`} />
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      placeholder="********" 
                      className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => handleFocus("confirmPassword")}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs md:text-sm mb-0.5">Prénom</Label>
                  <div className="relative">
                    <UserCircle className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                      focusedField === "firstName" 
                        ? roleInfo.text
                        : "text-muted-foreground"
                    }`} />
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Jean" 
                      className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => handleFocus("firstName")}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs md:text-sm mb-0.5">Nom</Label>
                  <div className="relative">
                    <UserCircle className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                      focusedField === "lastName" 
                        ? roleInfo.text
                        : "text-muted-foreground"
                    }`} />
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Dupont" 
                      className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => handleFocus("lastName")}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {(role === "artisan" || role === "agent") && (
                  <div className="space-y-1.5">
                    <Label htmlFor="company" className="text-xs md:text-sm mb-0.5">Entreprise</Label>
                    <div className="relative">
                      <Building2 className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                        focusedField === "company" 
                          ? roleInfo.text
                          : "text-muted-foreground"
                      }`} />
                      <Input 
                        id="company" 
                        name="company" 
                        placeholder="Nom de l'entreprise" 
                        className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                        value={formData.company}
                        onChange={handleChange}
                        onFocus={() => handleFocus("company")}
                        onBlur={handleBlur}
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs md:text-sm mb-0.5">Téléphone</Label>
                  <div className="relative">
                    <Phone className={`absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-colors ${
                      focusedField === "phone" 
                        ? roleInfo.text
                        : "text-muted-foreground"
                    }`} />
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="06 12 34 56 78" 
                      className="pl-8 h-8 text-xs md:text-sm md:h-10 md:pl-10 bg-white/50 dark:bg-black/30 border-gray-200 dark:border-gray-800"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus("phone")}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox 
                  id="acceptTerms" 
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
                  }
                  className={cn(
                    "h-3.5 w-3.5 md:h-4 md:w-4 bg-white/80 dark:bg-black/50 border-gray-200 dark:border-gray-700 transition-colors",
                    formData.acceptTerms && `data-[state=checked]:${roleInfo.text.replace('text-', 'text-')} data-[state=checked]:bg-${roleInfo.text.replace('text-', '')} data-[state=checked]:border-${roleInfo.text.replace('text-', '')}`
                  )}
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-xs md:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  J&apos;accepte les <Link href="/terms" className="text-primary hover:underline">conditions d&apos;utilisation</Link>
                </label>
              </div>
              
              {/* Boutons pour desktop, cachés sur mobile */}
              <div className="hidden md:flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/register/role")}
                  disabled={isSubmitting}
                  className="bg-white/80 dark:bg-black/50 border-gray-100 dark:border-gray-800 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)] hover:shadow-[6px_6px_10px_rgba(0,0,0,0.07),-6px_-6px_10px_rgba(255,255,255,1)] dark:hover:shadow-[6px_6px_10px_rgba(0,0,0,0.4),-6px_-6px_10px_rgba(30,30,30,0.3)] transition-all"
                >
                  Retour
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={cn(
                    "transition-all",
                    "bg-gray-900 hover:bg-gray-800 dark:bg-gray-50 dark:hover:bg-white dark:text-gray-900",
                    "shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)]",
                    "hover:shadow-[6px_6px_10px_rgba(0,0,0,0.07),-6px_-6px_10px_rgba(255,255,255,1)] dark:hover:shadow-[6px_6px_10px_rgba(0,0,0,0.4),-6px_-6px_10px_rgba(30,30,30,0.3)]",
                  )}
                >
                  {isSubmitting ? "Création en cours..." : "Créer mon compte"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-800 p-3 md:p-6">
            <p className="text-xs md:text-sm text-muted-foreground">
              Vous avez déjà un compte ? <Link href="/auth?tab=login" className="text-primary font-medium hover:underline">Se connecter</Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Barre de navigation fixe en bas pour mobile */}
      <div className="fixed md:hidden bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.3)] py-2 px-4">
        <div className="flex justify-between items-center w-full gap-3 max-w-md mx-auto">
          <Button 
            variant="outline" 
            onClick={() => router.push("/register/role")}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1 bg-white/90 dark:bg-black/60 border-gray-100 dark:border-gray-800 shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)] h-8 text-xs"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour
          </Button>
          <Button 
            onClick={() => {
              const form = document.getElementById('registration-form') as HTMLFormElement | null;
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            disabled={isSubmitting}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 transition-all h-8 text-xs",
              "bg-gray-900 hover:bg-gray-800 dark:bg-gray-50 dark:hover:bg-white dark:text-gray-900",
              "shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,0.9)] dark:shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(30,30,30,0.2)]",
              isSubmitting && "opacity-70"
            )}
          >
            {isSubmitting ? "Création..." : "Créer mon compte"}
          </Button>
        </div>
      </div>
    </div>
  )
} 