"use client"

import { PropsWithChildren, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

import { NotificationProvider } from "@/lib/contexts/NotificationContext"
import { ClientHeader } from "@/components/client/ClientHeader"
import { ClientSidebar } from "@/components/client/ClientSidebar"
import { ClientMobileBottomNav } from "@/components/client/MobileBottomNav"
import { Role } from "@/lib/generated/prisma"

export default function ClientDashboardLayout({ children }: PropsWithChildren) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Protection de l'accès à l'espace client
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsLoading(true)
        if (status === "authenticated" && session?.user?.role !== Role.USER) {
          router.push("/")
        } else if (status === "unauthenticated") {
          router.push("/auth?redirect=/client")
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAccess()
  }, [status, session, router])

  // Afficher un état de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0E261C]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <div className="h-screen overflow-hidden bg-[#0E261C] text-white flex flex-col">
        {/* Header flottant */}
        <ClientHeader toggleSidebar={() => setSidebarOpen(true)} />

        {/* Sidebar flottante */}
        <ClientSidebar 
          isOpen={sidebarOpen} 
          closeSidebar={() => setSidebarOpen(false)} 
        />

        {/* Contenu principal avec scroll */}
        <main className="flex-1 mt-20 md:mt-24 md:ml-72 relative">
          <div className="absolute inset-0 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-screen-2xl mx-auto mb-4">
              {children}
            </div>
          </div>
        </main>

        {/* Navigation mobile en bas de page */}
        <ClientMobileBottomNav />
      </div>
    </NotificationProvider>
  )
} 