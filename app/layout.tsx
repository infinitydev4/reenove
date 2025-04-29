import type { Metadata, Viewport } from "next"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { ToastProvider } from "@/components/ui/toast"
import Navbar from "@/components/navbar"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Renoveo - Trouvez les meilleurs artisans pour vos projets",
  description: "Renoveo vous connecte avec des artisans qualifiés et vérifiés pour tous vos projets de rénovation et d'amélioration de l'habitat.",
  keywords: "renoveo, artisans, rénovation, travaux, maison, qualité, habitat, construction"
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            storageKey="renoveo-theme"
          >
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
