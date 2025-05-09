"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NotificationProvider } from "@/lib/contexts/NotificationContext"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminMobileBottomNav } from "@/components/admin/AdminMobileBottomNav"
import { Role } from "@/lib/generated/prisma"

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Redirection si pas connecté ou pas admin
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== Role.ADMIN && session?.user?.role !== Role.AGENT) {
      router.push("/auth?tab=login&redirect=/admin")
      return
    }
    
    setIsLoading(false)
  }, [session, status, router])
  
  // Protection basique
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Vous devez être connecté en tant qu&apos;administrateur pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <div className="h-screen overflow-hidden bg-gray-50 dark:bg-black/95 flex flex-col">
        {/* Header flottant */}
        <AdminHeader toggleSidebar={() => setSidebarOpen(true)} />

        {/* Sidebar flottante */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          closeSidebar={() => setSidebarOpen(false)} 
        />

        {/* Contenu principal avec scroll */}
        <main className="flex-1 mt-20 md:mt-24 md:ml-72 relative">
          <div className="absolute inset-0 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-screen-2xl mx-auto">
              {children}
            </div>
          </div>
        </main>

        {/* Navigation mobile en bas de page */}
        <AdminMobileBottomNav />
      </div>
    </NotificationProvider>
  )
} 