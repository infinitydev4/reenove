"use client"

import React, { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Mail, Lock, User as UserIcon, Calendar, CheckCircle, ChevronDown, ArrowUpRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ProjectState } from "./ChatContainer"

interface ProjectSummaryProps {
  projectState: ProjectState
  onSaveProject: () => Promise<void>
}

export default function ProjectSummary({ projectState, onSaveProject }: ProjectSummaryProps) {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [activeTab, setActiveTab] = useState("signup")
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProjectDetails, setShowProjectDetails] = useState(false)

  // Formater les prix avec séparateur de milliers
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price)
  }

  // Fonction pour obtenir le CSRF token
  const getCsrfToken = async () => {
    try {
      const response = await fetch("/api/auth/csrf")
      if (!response.ok) {
        console.error("Erreur lors de la récupération du CSRF token:", response.status)
        return null
      }
      
      const data = await response.json()
      return data.csrfToken
    } catch (error) {
      console.error("Erreur lors de la récupération du CSRF token:", error)
      return null
    }
  }

  // Fonction pour connecter l'utilisateur
  const signIn = async ({ email, password }: { email: string, password: string }) => {
    // Récupération du CSRF token
    const csrfToken = await getCsrfToken()
    if (!csrfToken) {
      throw new Error("Impossible de récupérer le jeton de sécurité")
    }
    
    const response = await fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        redirect: false,
        csrfToken
      }),
    })
    
    if (!response.ok) {
      throw new Error("Erreur lors de la connexion")
    }
    
    try {
      return await response.json()
    } catch (error) {
      console.error("Erreur parsing JSON dans signIn:", error)
      // Retourner un objet vide en cas d'échec de parsing
      return {}
    }
  }

  // Fonction pour gérer la soumission du formulaire
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    
    try {
      if (activeTab === "signup") {
        // Vérifier que les mots de passe correspondent
        if (formData.password !== formData.confirmPassword) {
          setFormError("Les mots de passe ne correspondent pas")
          setIsSubmitting(false)
          return
        }
        
        // Séparer le nom complet en prénom et nom si possible
        let firstName = formData.name;
        let lastName = "";
        
        // Diviser le nom complet en prénom et nom s'il contient un espace
        const nameParts = formData.name.trim().split(/\s+/);
        if (nameParts.length > 1) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(" ");
        }
        
        // Enregistrer l'utilisateur
        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName,
            lastName: lastName || firstName, // Si pas de nom, utiliser le prénom comme nom
            email: formData.email,
            password: formData.password,
            role: "USER"
          }),
        })
        
        if (!registerResponse.ok) {
          // Gérer les différents types d'erreurs
          if (registerResponse.status === 409) {
            throw new Error("Cet email est déjà utilisé. Veuillez vous connecter avec cet email ou utiliser un email différent.")
          }
          
          // Tenter de récupérer l'erreur au format JSON, mais avec un fallback en cas d'échec
          let errorMessage = "Erreur lors de l'inscription"
          try {
            const errorData = await registerResponse.json()
            errorMessage = errorData.error || errorMessage
          } catch (parseError) {
            console.error("Erreur de parsing JSON:", parseError)
          }
          
          throw new Error(errorMessage)
        }
        
        // Inscription réussie, tenter de connecter l'utilisateur
        let signInSuccess = false
        try {
          await signIn({ email: formData.email, password: formData.password })
          signInSuccess = true
        } catch (signInError) {
          console.error("Erreur lors de la connexion après inscription:", signInError)
          // Continuer malgré l'erreur de connexion, car l'inscription a réussi
        }
        
        // Si la connexion a échoué, informer l'utilisateur mais continuer
        if (!signInSuccess) {
          console.log("Inscription réussie mais connexion automatique échouée. Continuons quand même.")
        }
      } else {
        // Se connecter (onglet login)
        try {
          await signIn({ email: formData.email, password: formData.password })
        } catch (loginError: any) {
          // Afficher l'erreur mais ne pas arrêter le processus
          console.error("Erreur de connexion:", loginError)
          
          if (loginError.message.includes("jeton de sécurité")) {
            setFormError("Vous semblez déjà connecté avec un autre compte. Veuillez vous déconnecter d'abord.")
            setIsSubmitting(false)
            return
          }
          
          setFormError(loginError.message || "Erreur lors de la connexion")
          setIsSubmitting(false)
          return
        }
      }
      
      // Tenter de sauvegarder le projet même si la connexion a échoué
      try {
        await onSaveProject()
        
        // Envoyer l'email de demande de devis après la sauvegarde du projet
        try {
          await fetch("/api/projects/quote-request-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              projectData: {
                title: projectState.title,
                description: projectState.details,
                service: projectState.service?.name || "",
                category: projectState.category?.name || "",
                location: projectState.location?.address || "",
                city: projectState.location?.city || "",
                postalCode: projectState.location?.postalCode || "",
                                 estimatedPrice: projectState.estimatedPrice
              }
            })
          })
        } catch (emailError) {
          // Log l'erreur email mais ne pas faire échouer le processus
          console.error("Erreur lors de l'envoi de l'email de demande de devis:", emailError)
        }
      } catch (saveError) {
        console.error("Erreur lors de la sauvegarde du projet:", saveError)
        setFormError("Votre compte a été créé mais le projet n'a pas pu être sauvegardé. Veuillez vous connecter pour réessayer.")
        setIsSubmitting(false)
        return
      }
      
      // Si tout s'est bien passé, la redirection sera gérée par le parent (bouton manuel)
      console.log("✅ Inscription et sauvegarde réussies - redirection gérée manuellement")
    } catch (error: any) {
      console.error("Erreur:", error)
      setFormError(error.message || "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-full">
      {/* En-tête du drawer */}
      <div className="sticky top-0 z-10 bg-[#0E261C] border-b border-[#FCDA89]/20 mb-4">
        <div className="py-3 px-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg bg-gradient-to-r from-[#FCDA89] to-amber-400 text-transparent bg-clip-text flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-[#FCDA89]" />
            Finaliser votre projet
          </h2>
          
          <button 
            onClick={() => setShowProjectDetails(!showProjectDetails)}
            className="flex items-center gap-1 text-xs text-[#FCDA89] hover:text-[#FCDA89]/80 transition-colors"
          >
            {showProjectDetails ? "Masquer détails" : "Voir détails"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showProjectDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>
        
        {/* Détails du projet (collapsible) */}
        {showProjectDetails && (
          <div className="px-4 pb-3 animate-fadeIn">
            <div className="p-3 bg-black/20 rounded-lg border border-[#FCDA89]/20">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-white">{projectState.title}</h3>
                {projectState.estimatedPrice && (
                  <div className="px-2 py-1 bg-[#FCDA89]/20 rounded-full text-[#FCDA89] text-xs font-medium">
                    {formatPrice(projectState.estimatedPrice.min)}€ - {formatPrice(projectState.estimatedPrice.max)}€
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div className="flex flex-col">
                  <span className="text-[#FCDA89]/70">Localisation</span>
                  <span className="text-white/80">{projectState.location?.postalCode} {projectState.location?.city}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[#FCDA89]/70">Service</span>
                  <span className="text-white/80">{projectState.service?.name}</span>
                </div>
              </div>
              
              <p className="text-xs text-white/70 border-t border-white/10 pt-2 mt-1">
                {projectState.details}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-32 overflow-y-auto">
        <div className="mx-auto max-w-md">
          {/* Avantages */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 p-2 bg-[#FCDA89]/10 rounded-md border border-[#FCDA89]/20">
              <div className="p-1 rounded-full bg-[#FCDA89]/20">
                <svg className="h-3.5 w-3.5 text-[#FCDA89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-xs text-white">Artisans vérifiés</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#FCDA89]/10 rounded-md border border-[#FCDA89]/20">
              <div className="p-1 rounded-full bg-[#FCDA89]/20">
                <Calendar className="h-3.5 w-3.5 text-[#FCDA89]" />
              </div>
              <span className="text-xs text-white">Intervention sous 48h</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#FCDA89]/10 rounded-md border border-[#FCDA89]/20">
              <div className="p-1 rounded-full bg-[#FCDA89]/20">
                <svg className="h-3.5 w-3.5 text-[#FCDA89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <span className="text-xs text-white">Garantie qualité</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-[#FCDA89]/10 rounded-md border border-[#FCDA89]/20">
              <div className="p-1 rounded-full bg-[#FCDA89]/20">
                <svg className="h-3.5 w-3.5 text-[#FCDA89]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className="text-xs text-white">Prix négociés</span>
            </div>
          </div>
          
          {/* Étapes de finalisation */}
          <div className="mb-5 p-3 bg-[#FCDA89]/10 rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2 flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1.5 text-[#FCDA89]" />
              3 étapes simples
            </h3>
            <ol className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <div className="bg-[#FCDA89]/30 text-[#FCDA89] w-5 h-5 rounded-full flex items-center justify-center font-medium">1</div>
                <span className="text-white/80">Créez votre compte en 30 secondes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-[#FCDA89]/30 text-[#FCDA89] w-5 h-5 rounded-full flex items-center justify-center font-medium">2</div>
                <span className="text-white/80">Recevez des devis personnalisés</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="bg-[#FCDA89]/30 text-[#FCDA89] w-5 h-5 rounded-full flex items-center justify-center font-medium">3</div>
                <span className="text-white/80">Choisissez l'artisan qui vous convient</span>
              </li>
            </ol>
          </div>
          
          {/* Formulaire d'inscription */}
          <div className="bg-[#0E261C]/60 border border-[#FCDA89]/10 rounded-lg p-4 shadow-lg">
            <Tabs defaultValue="signup" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-3 w-full grid grid-cols-2">
                <TabsTrigger value="signup" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">S'inscrire</TabsTrigger>
                <TabsTrigger value="login" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">Se connecter</TabsTrigger>
              </TabsList>
              
              {formError && (
                <div className="bg-destructive/10 text-destructive p-2.5 rounded mb-3 text-xs font-medium">
                  {formError}
                </div>
              )}
              
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <TabsContent value="signup" className="space-y-3 mt-0">
                  <div>
                    <Label htmlFor="name" className="text-xs text-white mb-1 block">Nom complet</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="name"
                        className="pl-8 h-9 text-sm bg-muted/30 border-muted"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-xs text-white mb-1 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-8 h-9 text-sm bg-muted/30 border-muted"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password" className="text-xs text-white mb-1 block">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        className="pl-8 h-9 text-sm bg-muted/30 border-muted"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmPassword" className="text-xs text-white mb-1 block">Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="pl-8 h-9 text-sm bg-muted/30 border-muted"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="login" className="space-y-3 mt-0">
                  <div>
                    <Label htmlFor="login-email" className="text-xs text-white mb-1 block">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        className="pl-8 h-9 text-sm bg-muted/30 border-muted"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="login-password" className="text-xs text-white mb-1 block">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        className="pl-8 h-9 text-sm bg-muted/30 border-muted"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
                
                {/* Bouton flottant */}
                <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#0E261C] to-[#0E261C]/95">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90 transition-all duration-300 flex items-center justify-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{activeTab === "signup" ? "Création en cours..." : "Connexion en cours..."}</span>
                      </>
                    ) : (
                      <>
                        <span>{activeTab === "signup" ? "Créer votre compte" : "Se connecter"}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-[10px] text-center text-muted-foreground pt-1">
                    En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
                  </p>
                </div>
                
                {/* Bouton original - masqué, mais gardé pour soumettre le formulaire */}
                <div className="opacity-0 h-0 overflow-hidden">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    Soumettre
                  </Button>
                </div>
              </form>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
} 