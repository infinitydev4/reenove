"use client"

import { PropsWithChildren, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Mail, 
  FileClock, 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  LifeBuoy, 
  LogOut, 
  Menu, 
  X,
  Home,
  AlertTriangle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { NotificationProvider } from "@/lib/contexts/NotificationContext"
import { NotificationDropdown } from "@/components/ui/notifications/NotificationDropdown"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ArtisanDashboardLayout({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<{
    profile: boolean;
    specialties: boolean;
    documents: boolean;
    assessment: boolean;
    confirmation: boolean;
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch("/api/artisan/onboarding/progress")
        if (response.ok) {
          const data = await response.json()
          setOnboardingStatus(data.progress)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du statut d'onboarding:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      checkOnboardingStatus()
    }
  }, [session])

  const getInitials = (name: string) => {
    if (!name) return "A"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  const navigation = [
    { name: "Tableau de bord", href: "/artisan", icon: LayoutDashboard },
    { name: "Messages", href: "/artisan/messages", icon: Mail, count: "5" },
    { name: "Devis", href: "/artisan/devis", icon: FileClock, count: "3" },
    { name: "Rendez-vous", href: "/artisan/rendez-vous", icon: Calendar },
    { name: "Clients", href: "/artisan/clients", icon: Users },
    { name: "Statistiques", href: "/artisan/statistiques", icon: BarChart3 },
    { name: "Paramètres", href: "/artisan/parametres", icon: Settings },
  ]

  // Vérifier si toutes les étapes d'onboarding obligatoires sont complétées
  const isOnboardingComplete = 
    onboardingStatus?.profile && 
    onboardingStatus?.specialties && 
    onboardingStatus?.documents

  // Composant d'alerte pour l'onboarding incomplet
  const OnboardingAlert = () => {
    if (isLoading || isOnboardingComplete) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Profil incomplet</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <p>Votre profil artisan n&apos;est pas complètement configuré.</p>
          <Button 
            variant="default" 
            className="mt-2 w-full sm:w-auto"
            onClick={() => router.push('/onboarding/artisan')}
          >
            Compléter mon profil
          </Button>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar pour mobile */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b">
          <Link href="/" className="flex items-center">
            <Home className="h-6 w-6 text-primary mr-2" />
            <span className="font-semibold">Reenove</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-gray-800/50 z-40 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar mobile */}
        <div 
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 flex justify-between items-center border-b">
            <Link href="/" className="flex items-center">
              <Home className="h-6 w-6 text-primary mr-2" />
              <span className="font-semibold">Reenove</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col p-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1 mb-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    pathname === item.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {item.count && (
                    <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <Separator className="my-4" />

            <div className="mt-auto space-y-1">
              <Link
                href="/aide"
                className="flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Aide et support</span>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start px-3 py-2 h-auto font-normal text-sm rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                onClick={() => {
                  // Ajouter la logique de déconnexion ici
                  setSidebarOpen(false)
                }}
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow border-r bg-white dark:bg-gray-900">
            <div className="p-4 flex items-center border-b">
              <Link href="/" className="flex items-center">
                <Home className="h-6 w-6 text-primary mr-2" />
                <span className="font-semibold">Reenove</span>
              </Link>
            </div>

            <div className="flex flex-col flex-1 p-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1 mb-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                    {item.count && (
                      <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto space-y-1">
                <Link
                  href="/aide"
                  className="flex items-center px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-muted transition-colors"
                >
                  <LifeBuoy className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>Aide et support</span>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto font-normal text-sm rounded-md text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content avec header */}
        <div className="md:pl-64 flex-1 flex flex-col">
          {/* Header pour desktop */}
          <header className="hidden md:flex h-16 items-center px-6 bg-white dark:bg-gray-900 border-b">
            <div className="ml-auto flex items-center gap-4">
              <NotificationDropdown />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                  <AvatarFallback>{getInitials(session?.user?.name || "")}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Artisan</p>
                </div>
              </div>
            </div>
          </header>
          
          <main className="p-4 md:p-8 flex-1">
            <OnboardingAlert />
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  )
} 