"use client"

import { useState, useEffect } from "react"

// Type pour les consentements de cookie
export type CookieConsent = {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

// Consentement par défaut (seuls les cookies nécessaires sont activés)
export const defaultConsent: CookieConsent = {
  necessary: true, // Toujours true car nécessaire
  functional: false,
  analytics: false,
  marketing: false
}

/**
 * Hook personnalisé pour gérer le consentement aux cookies
 * @returns Objet contenant l'état du consentement et les fonctions pour le modifier
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [isLoaded, setIsLoaded] = useState(false)

  // Charger le consentement depuis localStorage au chargement
  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem('cookieConsent')
      if (storedConsent) {
        setConsent(JSON.parse(storedConsent))
      }
    } catch (error) {
      console.error("Erreur lors du chargement du consentement aux cookies:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sauvegarder le consentement dans localStorage
  const saveConsent = (newConsent: CookieConsent) => {
    try {
      localStorage.setItem('cookieConsent', JSON.stringify(newConsent))
      setConsent(newConsent)
      
      // Appliquer les consentements (à compléter selon les scripts à activer/désactiver)
      applyConsent(newConsent)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du consentement aux cookies:", error)
    }
  }

  // Accepter tous les cookies
  const acceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    }
    saveConsent(fullConsent)
    return fullConsent
  }

  // Accepter uniquement les cookies nécessaires
  const acceptNecessaryOnly = () => {
    saveConsent(defaultConsent)
    return defaultConsent
  }

  // Mettre à jour une catégorie spécifique de consentement
  const updateCategory = (category: keyof CookieConsent, value: boolean) => {
    const updatedConsent = {
      ...consent,
      [category]: value
    }
    saveConsent(updatedConsent)
    return updatedConsent
  }

  // Réinitialiser les préférences (revenir à l'état par défaut)
  const resetConsent = () => {
    localStorage.removeItem('cookieConsent')
    setConsent(defaultConsent)
    return defaultConsent
  }

  // Vérifier si le consentement a été donné
  const hasConsented = () => {
    return localStorage.getItem('cookieConsent') !== null
  }

  // Appliquer les consentements (activer/désactiver les scripts)
  const applyConsent = (consentConfig: CookieConsent) => {
    // Google Analytics
    if (consentConfig.analytics) {
      enableAnalytics()
    } else {
      disableAnalytics()
    }

    // Cookies marketing
    if (consentConfig.marketing) {
      enableMarketing()
    } else {
      disableMarketing()
    }

    // D'autres scripts peuvent être ajoutés ici
  }

  // Activer Google Analytics
  const enableAnalytics = () => {
    // Code pour activer Google Analytics
    // Par exemple:
    // window.gtag('consent', 'update', {
    //   'analytics_storage': 'granted'
    // });
  }

  // Désactiver Google Analytics
  const disableAnalytics = () => {
    // Code pour désactiver Google Analytics
    // Par exemple:
    // window.gtag('consent', 'update', {
    //   'analytics_storage': 'denied'
    // });
  }

  // Activer les cookies marketing
  const enableMarketing = () => {
    // Code pour activer les cookies marketing
    // Par exemple pour Facebook Pixel:
    // window.fbq('consent', 'grant');
  }

  // Désactiver les cookies marketing
  const disableMarketing = () => {
    // Code pour désactiver les cookies marketing
    // Par exemple pour Facebook Pixel:
    // window.fbq('consent', 'revoke');
  }

  return {
    consent,
    isLoaded,
    saveConsent,
    acceptAll,
    acceptNecessaryOnly,
    updateCategory,
    resetConsent,
    hasConsented
  }
} 