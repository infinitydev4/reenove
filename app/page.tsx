import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Star, PenToolIcon as Tool, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ArtisanCard from "@/components/artisan-card"
import CategoryCard from "@/components/category-card"
import { ImageGallery } from "@/components/image-gallery"
import Navbar from "@/components/navbar"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Trouvez l'artisan idéal pour votre projet
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Connectez-vous avec des professionnels qualifiés pour tous vos besoins de rénovation, construction
                    et décoration.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Plombier, électricien, menuisier..."
                      className="w-full pl-9 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm"
                    />
                  </div>
                  <Button>
                    Rechercher
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
                <Image
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069"
                  alt="Artisan travaillant sur un projet"
                  className="w-full h-auto rounded-xl object-cover"
                  width={550}
                  height={550}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Catégories populaires</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Découvrez nos artisans par catégorie de métier
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              <CategoryCard icon="hammer" title="Menuiserie" count={42} />
              <CategoryCard icon="wrench" title="Plomberie" count={38} />
              <CategoryCard icon="zap" title="Électricité" count={56} />
              <CategoryCard icon="paintbrush" title="Peinture" count={29} />
              <CategoryCard icon="brick-wall" title="Maçonnerie" count={31} />
              <CategoryCard icon="garden" title="Jardinage" count={24} />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Artisans à la une</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Nos professionnels les mieux notés et les plus demandés
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              <ArtisanCard
                name="Thomas Dubois"
                profession="Menuisier"
                rating={4.9}
                reviews={124}
                image="https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=2532"
                location="Lyon"
              />
              <ArtisanCard
                name="Marie Laurent"
                profession="Électricienne"
                rating={4.8}
                reviews={98}
                image="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=2070"
                location="Paris"
              />
              <ArtisanCard
                name="Jean Moreau"
                profession="Plombier"
                rating={4.7}
                reviews={156}
                image="https://images.unsplash.com/photo-1564223288351-a96bae6ff3ee?q=80&w=3132"
                location="Marseille"
              />
            </div>
            <div className="flex justify-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/artisans">
                  Voir tous les artisans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="mx-auto w-full max-w-[500px] lg:max-w-none order-2 lg:order-1">
                <Image
                  src="https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=2532"
                  alt="Client consultant des profils d'artisans"
                  className="w-full h-auto rounded-xl object-cover"
                  width={550}
                  height={550}
                />
              </div>
              <div className="flex flex-col justify-center space-y-4 order-1 lg:order-2">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Comment ça marche</h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                    Trouvez et engagez des artisans qualifiés en quelques étapes simples
                  </p>
                </div>
                <ul className="grid gap-4">
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Recherchez</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Trouvez des artisans par métier, localisation ou disponibilité
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Comparez</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Consultez les profils, avis et réalisations des artisans
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Star className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Contactez</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        Discutez directement avec les artisans et obtenez des devis
                      </p>
                    </div>
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild>
                    <Link href="/register/role">
                      Commencer maintenant
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8">
              Découvrez nos réalisations
            </h1>
            <p className="text-center text-gray-600 mb-12">
              Des projets de rénovation réussis pour vous inspirer
            </p>
            <ImageGallery />
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-16">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 ArtiConnect. Tous droits réservés.</p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/about" className="text-sm font-medium">
              À propos
            </Link>
            <Link href="/terms" className="text-sm font-medium">
              Conditions
            </Link>
            <Link href="/privacy" className="text-sm font-medium">
              Confidentialité
            </Link>
            <Link href="/contact" className="text-sm font-medium">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
