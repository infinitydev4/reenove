"use client"

import { PropsWithChildren, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NotificationProvider } from "@/lib/contexts/NotificationContext"
import { AgentHeader } from "@/components/agent/AgentHeader"
import { AgentSidebar } from "@/components/agent/AgentSidebar"
import { MobileBottomNav } from "@/components/agent/MobileBottomNav"

// Type simplifié pour le statut d'onboarding de l'agent
interface AgentOnboardingStatus {
  profile: boolean;
  commissionRules: boolean;
  bankDetails: boolean;
}

export default function AgentDashboardLayout({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<AgentOnboardingStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/agent/onboarding/progress")
        if (response.ok) {
          const data = await response.json()
          setOnboardingStatus(data.progress)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut d'onboarding:", error)
        // En cas d'erreur ou si l'API n'existe pas encore, on initialise un statut par défaut
        setOnboardingStatus({
          profile: false,
          commissionRules: false,
          bankDetails: false
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      checkOnboardingStatus()
    }
  }, [session])

  // Vérifier si toutes les étapes d'onboarding obligatoires sont complétées
  const isOnboardingComplete = 
    onboardingStatus?.profile && 
    onboardingStatus?.commissionRules && 
    onboardingStatus?.bankDetails

  // Composant d'alerte pour l'onboarding incomplet
  const OnboardingAlert = () => {
    if (isLoading || isOnboardingComplete) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Profil incomplet</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <p>Votre profil agent n&apos;est pas complètement configuré.</p>
          <Button 
            variant="default" 
            className="mt-2 w-full sm:w-auto"
            onClick={() => router.push('/onboarding/agent')}
          >
            Compléter mon profil
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <NotificationProvider>
      <div className="h-screen overflow-hidden bg-gray-50 dark:bg-black/95 flex flex-col">
        {/* Header flottant */}
        <AgentHeader toggleSidebar={() => setSidebarOpen(true)} />

        {/* Sidebar flottante */}
        <AgentSidebar 
          isOpen={sidebarOpen} 
          closeSidebar={() => setSidebarOpen(false)} 
        />

        {/* Contenu principal avec scroll */}
        <main className="flex-1 mt-20 md:mt-24 md:ml-72 relative">
          <div className="absolute inset-0 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-screen-2xl mx-auto mb-4">
              <OnboardingAlert />
              {children}
            </div>
          </div>
        </main>

        {/* Navigation mobile en bas de page */}
        <MobileBottomNav />
      </div>
    </NotificationProvider>
  )
} 