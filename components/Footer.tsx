import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-4 md:py-0 dark:border-gray-800">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 md:h-16">
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">© 2024 Reenove. Tous droits réservés.</p>
        <nav className="flex flex-wrap justify-center gap-2 md:gap-6">
          <Link href="/about" className="text-xs md:text-sm font-medium px-1">
            À propos
          </Link>
          <Link href="/terms" className="text-xs md:text-sm font-medium px-1">
            Conditions
          </Link>
          <Link href="/privacy" className="text-xs md:text-sm font-medium px-1">
            Confidentialité
          </Link>
          <Link href="/contact" className="text-xs md:text-sm font-medium px-1">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  )
} 