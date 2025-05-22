import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "sonner"
import Navbar from "@/components/navbar"
import BottomNavbar from "@/components/bottom-navbar"
import { CookieBanner } from "@/components/CookieBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reenove - Trouvez les meilleurs artisans pour vos projets",
  description: "Reenove vous connecte avec des artisans qualifiés et vérifiés pour tous vos projets de rénovation et d'amélioration de l'habitat.",
  keywords: "Reenove, artisans, rénovation, travaux, maison, qualité, habitat, construction",
  manifest: "/manifest.json",
  applicationName: "Reenove",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reenove"
  },
  formatDetection: {
    telephone: true
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0E261C" },
    { media: "(prefers-color-scheme: dark)", color: "#0E261C" }
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-startup-image" href="/splash/splash.png" />
        <style>{`
          :root {
            --primary-color: #FCDA89;
            --background-color: #0E261C;
            --text-color: #FFFFFF;
          }
        `}</style>
      </head>
      <body className={`${inter.className} flex flex-col min-h-[100dvh] touch-manipulation bg-[#0E261C] text-white`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
          <AuthProvider>
            <Toaster richColors position="top-center" closeButton />
            <main className="flex-1 flex flex-col relative h-full w-full">
              {children}
            </main>
          </AuthProvider>
          </ThemeProvider>
      </body>
    </html>
  )
}
