import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Download,
  ExternalLink,
  Heart,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Share2,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import ArtisanGallery from "@/components/artisan-gallery"
import ArtisanReviewCard from "@/components/artisan-review-card"
import ArtisanContactForm from "@/components/artisan-contact-form"
import ArtisanMap from "@/components/artisan-map"

export default function ArtisanProfilePage({ params }: { params: { slug: string } }) {
  // Dans une application réelle, vous récupéreriez les données de l'artisan à partir d'une API ou d'une base de données
  const artisan = {
    id: "thomas-dubois",
    name: "Thomas Dubois",
    profession: "Menuisier",
    rating: 4.9,
    reviews: 124,
    image: "/focused-craftsman.png",
    location: "Lyon, France",
    description:
      "Menuisier professionnel avec plus de 15 ans d'expérience. Spécialisé dans la création de meubles sur mesure, l'aménagement intérieur et la rénovation de mobilier ancien. Je travaille avec passion et précision pour donner vie à vos projets et transformer vos espaces.",
    shortDescription: "Artisan menuisier spécialisé dans le mobilier sur mesure et l'aménagement intérieur.",
    services: [
      "Création de meubles sur mesure",
      "Aménagement d'intérieur",
      "Pose de parquet et terrasse",
      "Rénovation de mobilier ancien",
      "Installation de cuisine et dressing",
      "Escaliers et garde-corps",
    ],
    certifications: ["CAP Menuisier", "Brevet Professionnel Menuisier", "Certification Qualibat"],
    experience: "15+ ans",
    projectsCompleted: 120,
    responseTime: "Généralement en 24h",
    availability: "Disponible dans 2 semaines",
    languages: ["Français", "Anglais"],
    serviceArea: "Lyon et sa périphérie (jusqu'à 50km)",
    portfolio: [
      {
        id: "p1",
        title: "Bibliothèque sur mesure",
        description: "Bibliothèque en chêne massif avec échelle coulissante",
        image: "/custom-library-ladder.png",
        category: "Meubles",
      },
      {
        id: "p2",
        title: "Cuisine intégrée",
        description: "Cuisine complète avec îlot central en bois et pierre",
        image: "/sleek-wooden-kitchen.png",
        category: "Cuisines",
      },
      {
        id: "p3",
        title: "Escalier hélicoïdal",
        description: "Escalier en bois et métal avec design contemporain",
        image: "/modern-spiral-wood.png",
        category: "Escaliers",
      },
      {
        id: "p4",
        title: "Terrasse en bois exotique",
        description: "Terrasse en ipé avec garde-corps en verre",
        image: "/modern-deck-glass-railing.png",
        category: "Extérieur",
      },
      {
        id: "p5",
        title: "Dressing sur mesure",
        description: "Dressing complet avec portes coulissantes et éclairage intégré",
        image: "/illuminated-custom-wardrobe.png",
        category: "Aménagement",
      },
      {
        id: "p6",
        title: "Table de salle à manger",
        description: "Table en noyer massif avec piètement en métal",
        image: "/placeholder.svg?height=600&width=800&query=handmade wooden dining table with metal legs",
        category: "Meubles",
      },
    ],
    testimonials: [
      {
        id: "t1",
        name: "Claire Dupont",
        avatar: "/placeholder.svg?height=100&width=100&query=woman portrait professional",
        rating: 5,
        date: "15/03/2024",
        comment:
          "Thomas a réalisé une magnifique bibliothèque sur mesure pour notre salon. Travail impeccable et dans les délais. Sa créativité et son savoir-faire ont dépassé nos attentes. Je recommande vivement !",
        project: "Bibliothèque sur mesure",
        helpful: 12,
      },
      {
        id: "t2",
        name: "Marc Lefebvre",
        avatar: "/placeholder.svg?height=100&width=100&query=man portrait professional",
        rating: 5,
        date: "02/02/2024",
        comment:
          "Très satisfait de la rénovation de notre escalier. Thomas est un vrai professionnel, minutieux et à l'écoute. Il a su transformer notre vieil escalier en une pièce maîtresse de notre maison. Communication parfaite tout au long du projet.",
        project: "Rénovation d'escalier",
        helpful: 8,
      },
      {
        id: "t3",
        name: "Sophie Martin",
        avatar: "/placeholder.svg?height=100&width=100&query=woman portrait professional blonde",
        rating: 4,
        date: "18/01/2024",
        comment:
          "Excellent travail pour notre dressing sur mesure. Thomas a parfaitement compris nos besoins et a proposé des solutions ingénieuses pour optimiser l'espace. Seul petit bémol sur le délai un peu plus long que prévu, mais le résultat en valait la peine.",
        project: "Dressing sur mesure",
        helpful: 5,
      },
      {
        id: "t4",
        name: "Jean Moreau",
        avatar: "/placeholder.svg?height=100&width=100&query=older man portrait professional",
        rating: 5,
        date: "05/12/2023",
        comment:
          "Thomas a fabriqué une table de salle à manger exceptionnelle pour notre famille. Son attention aux détails et la qualité de son travail sont remarquables. Un artisan passionné qui mérite d'être connu !",
        project: "Table sur mesure",
        helpful: 9,
      },
    ],
    ratingBreakdown: {
      5: 98,
      4: 20,
      3: 4,
      2: 1,
      1: 1,
    },
    socialProfiles: {
      instagram: "thomas.dubois.menuiserie",
      facebook: "ThomasDuboisMenuiserie",
      website: "www.thomasdubois-menuiserie.fr",
    },
    coordinates: {
      lat: 45.764043,
      lng: 4.835659,
    },
  }

  // Calculer le pourcentage pour chaque note
  const totalReviews = artisan.reviews
  const ratingPercentages = {
    5: (artisan.ratingBreakdown[5] / totalReviews) * 100,
    4: (artisan.ratingBreakdown[4] / totalReviews) * 100,
    3: (artisan.ratingBreakdown[3] / totalReviews) * 100,
    2: (artisan.ratingBreakdown[2] / totalReviews) * 100,
    1: (artisan.ratingBreakdown[1] / totalReviews) * 100,
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec image de couverture */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="container relative z-10 h-full flex items-end pb-4">
          <Link
            href="/artisans"
            className="absolute top-4 left-4 inline-flex items-center justify-center rounded-full bg-background/90 backdrop-blur-sm p-2 text-sm font-medium text-foreground shadow-sm hover:bg-background/70 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only md:not-sr-only md:ml-2">Retour</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="relative -mb-12 md:-mb-16">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl">
                <AvatarImage src={artisan.image || "/placeholder.svg"} alt={artisan.name} />
                <AvatarFallback>
                  {artisan.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 rounded-full bg-green-500 p-1 border-2 border-background">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="pb-2 md:pb-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge variant="secondary" className="font-normal">
                  <Clock className="mr-1 h-3 w-3" />
                  {artisan.availability}
                </Badge>
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-normal">
                  <MapPin className="mr-1 h-3 w-3" />
                  {artisan.location}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-sm">{artisan.name}</h1>
            </div>
          </div>

          <div className="ml-auto flex gap-2 self-start mt-4 md:self-end md:mb-2">
            <Button size="icon" variant="outline" className="rounded-full bg-background/80 backdrop-blur-sm">
              <Heart className="h-4 w-4" />
              <span className="sr-only">Favoris</span>
            </Button>
            <Button size="icon" variant="outline" className="rounded-full bg-background/80 backdrop-blur-sm">
              <Share2 className="h-4 w-4" />
              <span className="sr-only">Partager</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container px-4 md:px-6 pt-16 pb-12">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {/* Colonne de gauche - Informations de l'artisan */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{artisan.profession}</h2>
                    <p className="text-sm text-muted-foreground">{artisan.shortDescription}</p>
                  </div>

                  <div className="flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(artisan.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-medium">{artisan.rating}</span>
                    <span className="ml-1 text-muted-foreground">({artisan.reviews} avis)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button className="w-full">
                      <Phone className="mr-2 h-4 w-4" />
                      Appeler
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Disponibilité</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{artisan.availability}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Répond {artisan.responseTime}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Expérience</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{artisan.experience}</p>
                        <p className="text-xs text-muted-foreground">Années d&apos;expérience</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold">{artisan.projectsCompleted}+</p>
                        <p className="text-xs text-muted-foreground">Projets réalisés</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {artisan.certifications.map((cert, index) => (
                        <Badge key={index} variant="secondary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Langues parlées</h3>
                    <div className="flex flex-wrap gap-2">
                      {artisan.languages.map((lang, index) => (
                        <Badge key={index} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Zone d&apos;intervention</h3>
                    <p className="text-sm">{artisan.serviceArea}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Réseaux sociaux</h3>
                    <div className="flex gap-3">
                      <Button variant="outline" size="icon" asChild>
                        <a
                          href={`https://instagram.com/${artisan.socialProfiles.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-instagram"
                          >
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                          </svg>
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a
                          href={`https://facebook.com/${artisan.socialProfiles.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-facebook"
                          >
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                          </svg>
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={`https://${artisan.socialProfiles.website}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ArtisanMap coordinates={artisan.coordinates} name={artisan.name} />
              </CardContent>
            </Card>
          </div>

          {/* Colonne de droite - Onglets avec contenu détaillé */}
          <div className="md:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="about">À propos</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              {/* Onglet À propos */}
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">À propos de {artisan.name}</h2>
                    <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{artisan.description}</p>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-medium mb-4">Services proposés</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {artisan.services.map((service, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm">{service}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Informations importantes</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Les tarifs sont établis sur devis après étude de votre projet. Un acompte de 30% est demandé
                            à la commande. Garantie décennale et assurance professionnelle.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-medium mb-4">Documents</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                            <Download className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Catalogue des réalisations</p>
                            <p className="text-xs text-muted-foreground">PDF, 4.2 MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                            <Download className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Grille tarifaire indicative</p>
                            <p className="text-xs text-muted-foreground">PDF, 1.8 MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Portfolio */}
              <TabsContent value="portfolio">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Portfolio de réalisations</h2>
                      <Badge variant="outline" className="font-normal">
                        {artisan.portfolio.length} projets
                      </Badge>
                    </div>

                    <ArtisanGallery projects={artisan.portfolio} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Avis */}
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-semibold">Avis clients</h2>
                        <div className="flex items-center mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(artisan.rating) ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 font-medium">{artisan.rating}</span>
                          <span className="ml-1 text-muted-foreground">({artisan.reviews} avis)</span>
                        </div>
                      </div>

                      <div className="w-full md:w-64 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2">
                            <div className="flex items-center w-8">
                              <span className="text-sm">{rating}</span>
                              <Star className="h-3.5 w-3.5 ml-1 fill-yellow-500 text-yellow-500" />
                            </div>
                            <Progress value={ratingPercentages[rating as keyof typeof ratingPercentages]} className="h-2" />
                            <span className="text-xs text-muted-foreground w-8">{artisan.ratingBreakdown[rating as keyof typeof artisan.ratingBreakdown]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {artisan.testimonials.map((testimonial) => (
                        <ArtisanReviewCard key={testimonial.id} review={testimonial} />
                      ))}
                    </div>

                    <div className="mt-6 text-center">
                      <Button variant="outline">Voir tous les avis</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Onglet Contact */}
              <TabsContent value="contact">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Contacter {artisan.name}</h2>

                    <ArtisanContactForm artisanName={artisan.name} />

                    <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Délai de réponse</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {artisan.name} répond généralement dans les 24 heures. Pour les demandes urgentes, nous vous
                            recommandons de l&apos;appeler directement.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Barre d'action fixe sur mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 md:hidden z-10">
        <div className="flex gap-2">
          <Button className="flex-1">
            <Phone className="mr-2 h-4 w-4" />
            Appeler
          </Button>
          <Button variant="outline" className="flex-1">
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button variant="secondary" size="icon">
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
