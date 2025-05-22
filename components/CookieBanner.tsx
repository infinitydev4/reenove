"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, ShieldCheck, Settings, Check } from "lucide-react"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useCookieConsent, CookieConsent } from "@/lib/hooks/useCookieConsent"

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const {
    consent,
    isLoaded,
    acceptAll,
    acceptNecessaryOnly,
    updateCategory,
    hasConsented,
    saveConsent
  } = useCookieConsent()
  
  // Vérifier si le consentement existe au chargement
  useEffect(() => {
    if (isLoaded && !hasConsented()) {
      // Afficher la bannière après un court délai pour une meilleure expérience utilisateur
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, hasConsented])
  
  // Accepter tous les cookies
  const handleAcceptAll = () => {
    acceptAll()
    setShowBanner(false)
    setShowSettings(false)
  }
  
  // Accepter uniquement les cookies nécessaires
  const handleAcceptNecessary = () => {
    acceptNecessaryOnly()
    setShowBanner(false)
    setShowSettings(false)
  }
  
  // Sauvegarder les préférences personnalisées
  const handleSavePreferences = () => {
    saveConsent(consent)
    setShowBanner(false)
    setShowSettings(false)
  }
  
  // Mettre à jour les préférences individuelles
  const handleUpdateConsent = (key: keyof CookieConsent, value: boolean) => {
    updateCategory(key, value)
  }

  if (!isLoaded) {
    return null
  }

  if (!showBanner && hasConsented()) {
    return (
      <div className="fixed bottom-24 right-2 z-50">
        <button 
          onClick={() => setShowSettings(true)} 
          className="bg-[#FCDA89] text-white p-3 rounded-full shadow-lg hover:bg-[#FCDA89]/10 transition-colors"
          aria-label="Paramètres des cookies"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Bannière principale */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E261C] border-t border-[#FCDA89]/20 shadow-lg p-4 md:p-6 animate-slide-up">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#FCDA89]" />
                  <h3 className="text-white text-lg font-medium">Confidentialité et cookies</h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-3">
                  Nous utilisons des cookies pour améliorer votre expérience, personnaliser le contenu et analyser le trafic. 
                  Vous pouvez choisir les cookies que vous acceptez et modifier vos préférences à tout moment.
                </p>
                <Link 
                  href="/privacy" 
                  className="text-[#FCDA89] text-sm hover:underline inline-flex items-center"
                >
                  En savoir plus sur notre politique de confidentialité
                </Link>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 md:min-w-[300px] justify-end">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-[#0E261C] hover:bg-white/10 hover:text-white"
                  onClick={() => setShowSettings(true)}
                >
                  Personnaliser
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/20 text-[#0E261C] hover:bg-white/10 hover:text-white"
                  onClick={handleAcceptNecessary}
                >
                  Refuser
                </Button>
                <Button 
                  className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90 font-medium"
                  onClick={handleAcceptAll}
                >
                  Tout accepter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal des paramètres */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[600px] bg-[#0E261C] border-[#FCDA89]/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#FCDA89]" />
              Paramètres de confidentialité
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="mt-4">
            <TabsList className="bg-white/10 text-white">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
                Tous les cookies
              </TabsTrigger>
              <TabsTrigger value="details" className="data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C]">
                Détails
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4 text-white/80">
              <p className="mb-4">
                Les cookies sont de petits fichiers texte stockés sur votre appareil qui nous aident à améliorer votre expérience sur notre site.
                Vous pouvez choisir quels types de cookies vous acceptez.
              </p>
              <p className="mb-8">
                Pour plus d'informations sur les cookies et vos droits, consultez notre <Link href="/privacy" className="text-[#FCDA89] hover:underline">politique de confidentialité</Link>.
              </p>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-[#0E261C] hover:bg-white/10 hover:text-[#0E261C]"
                  onClick={handleAcceptNecessary}
                >
                  Uniquement nécessaires
                </Button>
                <Button 
                  className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90 font-medium"
                  onClick={handleAcceptAll}
                >
                  Accepter tous
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="bg-white/5 p-4 rounded-md border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#FCDA89]" />
                    <h4 className="font-medium text-white">Cookies nécessaires</h4>
                  </div>
                  <Switch 
                    checked={consent.necessary} 
                    disabled={true} // Toujours activé car nécessaire
                    className="data-[state=checked]:bg-[#FCDA89]"
                  />
                </div>
                <p className="text-sm text-white/70">
                  Ces cookies sont essentiels au fonctionnement du site et ne peuvent pas être désactivés.
                  Ils permettent les fonctionnalités de base comme la navigation et l'accès aux zones sécurisées.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-md border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-row items-center gap-2">
                    <Label htmlFor="functional" className="font-medium text-white flex items-center gap-2 cursor-pointer">
                      <div className="h-4 w-4 border border-white/30 rounded-sm flex items-center justify-center">
                        {consent.functional && <Check className="h-3 w-3 text-[#FCDA89]" />}
                      </div>
                      Cookies fonctionnels
                    </Label>
                  </div>
                  <Switch 
                    id="functional"
                    checked={consent.functional} 
                    onCheckedChange={(checked) => handleUpdateConsent('functional', checked)}
                    className="data-[state=checked]:bg-[#FCDA89]"
                  />
                </div>
                <p className="text-sm text-white/70">
                  Ces cookies permettent des fonctionnalités avancées comme les préférences de langue,
                  la mémorisation de vos choix et la personnalisation de l'interface.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-md border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-row items-center gap-2">
                    <Label htmlFor="analytics" className="font-medium text-white flex items-center gap-2 cursor-pointer">
                      <div className="h-4 w-4 border border-white/30 rounded-sm flex items-center justify-center">
                        {consent.analytics && <Check className="h-3 w-3 text-[#FCDA89]" />}
                      </div>
                      Cookies analytiques
                    </Label>
                  </div>
                  <Switch 
                    id="analytics"
                    checked={consent.analytics} 
                    onCheckedChange={(checked) => handleUpdateConsent('analytics', checked)}
                    className="data-[state=checked]:bg-[#FCDA89]"
                  />
                </div>
                <p className="text-sm text-white/70">
                  Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site
                  en collectant des informations anonymes. Ils nous aident à améliorer notre site.
                </p>
              </div>
              
              <div className="bg-white/5 p-4 rounded-md border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-row items-center gap-2">
                    <Label htmlFor="marketing" className="font-medium text-white flex items-center gap-2 cursor-pointer">
                      <div className="h-4 w-4 border border-white/30 rounded-sm flex items-center justify-center">
                        {consent.marketing && <Check className="h-3 w-3 text-[#FCDA89]" />}
                      </div>
                      Cookies marketing
                    </Label>
                  </div>
                  <Switch 
                    id="marketing"
                    checked={consent.marketing} 
                    onCheckedChange={(checked) => handleUpdateConsent('marketing', checked)}
                    className="data-[state=checked]:bg-[#FCDA89]"
                  />
                </div>
                <p className="text-sm text-white/70">
                  Ces cookies sont utilisés pour suivre les visiteurs sur les sites web. Ils sont conçus
                  pour afficher des publicités pertinentes et engageantes pour l'utilisateur.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <div className="flex justify-between w-full flex-col-reverse sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="border-white/20 text-[#0E261C] hover:bg-white/10 hover:text-[#0E261C]"
                onClick={() => setShowSettings(false)}
              >
                Annuler
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="border-white/20 text-[#0E261C] hover:bg-white/10 hover:text-[#0E261C]"
                  onClick={handleAcceptNecessary}
                >
                  Refuser tout
                </Button>
                <Button 
                  onClick={handleSavePreferences}
                  className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90 font-medium"
                >
                  Sauvegarder mes choix
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 