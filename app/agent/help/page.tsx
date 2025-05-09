"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Search, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  PlayCircle, 
  Mail, 
  Phone, 
  MessageSquare,
  FileText,
  ExternalLink,
  Users,
  Building,
  BarChart3,
  Percent,
  Inbox
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const faqItems = [
    {
      question: "Comment fonctionne le système de commissions ?",
      answer: "En tant qu'agent d'affiliation, vous gagnez des commissions de plusieurs façons : sur les projets apportés (5%), sur les artisans parrainés (commission fixe + % sur leurs premiers projets), et sur l'activité de vos filleuls (2% des commissions générées par vos filleuls). Les commissions sont versées mensuellement sur votre compte bancaire, avec un minimum de 50€ pour déclencher un paiement.",
      category: "commissions"
    },
    {
      question: "Comment inviter un filleul ou un artisan ?",
      answer: "Vous pouvez inviter des filleuls ou des artisans de deux façons : en utilisant votre lien de parrainage personnel (disponible dans votre espace \"Parrainage\") ou en envoyant une invitation directe par email depuis les sections \"Filleuls\" ou \"Artisans\" de votre tableau de bord. Chaque inscription validée via votre lien vous est automatiquement attribuée.",
      category: "parrainage"
    },
    {
      question: "Quand mes commissions sont-elles payées ?",
      answer: "Les commissions sont calculées à la fin de chaque mois et versées avant le 15 du mois suivant, à condition que le montant total dépasse 50€. Si ce seuil n'est pas atteint, les commissions sont reportées au mois suivant. Vous pouvez suivre vos commissions en attente et payées dans la section \"Commissions\" de votre tableau de bord.",
      category: "commissions"
    },
    {
      question: "Comment puis-je augmenter mon taux de commission ?",
      answer: "Vous pouvez augmenter votre taux de commission grâce au programme de bonus de performance. En atteignant des objectifs trimestriels (nombre de filleuls, d'artisans ou de projets apportés), votre taux de commission standard peut augmenter jusqu'à 7%. Consultez la section \"Parrainage\" pour voir vos objectifs actuels et votre progression.",
      category: "commissions"
    },
    {
      question: "Un filleul peut-il avoir plusieurs parrains ?",
      answer: "Non, chaque utilisateur ne peut être lié qu'à un seul agent d'affiliation. C'est le premier lien de parrainage utilisé qui est pris en compte. Cependant, vous pouvez parrainer des filleuls qui à leur tour peuvent parrainer d'autres personnes, ce qui vous permet de bénéficier de commissions multi-niveaux.",
      category: "parrainage"
    },
    {
      question: "Comment suivre l'activité de mes filleuls ?",
      answer: "Dans la section \"Filleuls\" de votre tableau de bord, vous pouvez voir la liste complète de vos filleuls avec leur statut, la date d'inscription, et les commissions générées. En cliquant sur un filleul spécifique, vous accédez à son profil détaillé qui montre son activité, ses propres filleuls et les commissions générées.",
      category: "filleuls"
    },
    {
      question: "Mes informations personnelles sont-elles visibles par mes filleuls ?",
      answer: "Vos filleuls peuvent voir votre nom et votre statut d'agent, mais vos coordonnées et informations bancaires restent strictement confidentielles. Vous pouvez ajuster vos paramètres de confidentialité dans la section \"Paramètres\" de votre compte pour contrôler les informations visibles par vos filleuls et les artisans.",
      category: "compte"
    },
    {
      question: "Comment ajouter mon RIB pour recevoir mes commissions ?",
      answer: "Vous pouvez ajouter ou modifier vos coordonnées bancaires dans la section \"Paramètres\" > onglet \"Profil\" > \"Informations bancaires\". Vos informations bancaires sont sécurisées et utilisées uniquement pour le versement de vos commissions. Notez que votre RIB doit être validé par notre équipe avant tout premier paiement.",
      category: "compte"
    }
  ]

  const videoTutorials = [
    {
      id: "tuto-1",
      title: "Découvrir l'espace agent",
      duration: "4:32",
      thumbnail: "/placeholder.svg?height=180&width=320",
      category: "débutant"
    },
    {
      id: "tuto-2",
      title: "Comment inviter des filleuls",
      duration: "3:15",
      thumbnail: "/placeholder.svg?height=180&width=320",
      category: "parrainage"
    },
    {
      id: "tuto-3",
      title: "Comprendre le système de commissions",
      duration: "5:48",
      thumbnail: "/placeholder.svg?height=180&width=320",
      category: "commissions"
    },
    {
      id: "tuto-4",
      title: "Maximiser vos revenus d'affiliation",
      duration: "6:22",
      thumbnail: "/placeholder.svg?height=180&width=320",
      category: "avancé"
    },
    {
      id: "tuto-5",
      title: "Suivre les performances de vos filleuls",
      duration: "4:10",
      thumbnail: "/placeholder.svg?height=180&width=320",
      category: "filleuls"
    },
    {
      id: "tuto-6",
      title: "Parrainer des artisans efficacement",
      duration: "3:40",
      thumbnail: "/placeholder.svg?height=180&width=320",
      category: "artisans"
    }
  ]

  const helpTopics = [
    {
      title: "Commissions et paiements",
      icon: <Percent className="h-5 w-5 text-green-500" />,
      description: "Comprendre le système de commissions et les paiements",
      link: "#commissions"
    },
    {
      title: "Parrainage",
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Comment inviter et gérer vos filleuls",
      link: "#parrainage"
    },
    {
      title: "Artisans",
      icon: <Building className="h-5 w-5 text-amber-500" />,
      description: "Parrainer et suivre les artisans",
      link: "#artisans"
    },
    {
      title: "Projets",
      icon: <FileText className="h-5 w-5 text-purple-500" />,
      description: "Gérer les projets que vous apportez",
      link: "#projets"
    },
    {
      title: "Statistiques",
      icon: <BarChart3 className="h-5 w-5 text-indigo-500" />,
      description: "Comprendre vos statistiques et performances",
      link: "#statistiques"
    },
    {
      title: "Compte",
      icon: <Inbox className="h-5 w-5 text-red-500" />,
      description: "Gérer votre compte et vos paramètres",
      link: "#compte"
    }
  ]

  // Fonction pour filtrer les questions de la FAQ
  const filteredFaqItems = searchQuery ? 
    faqItems.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ) : 
    faqItems

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Centre d&apos;aide
          </h1>
          <p className="text-muted-foreground">Tout ce que vous devez savoir sur votre espace agent</p>
        </div>
        
        <Link href="/agent">
          <Button variant="outline" size="sm">
            Retour au tableau de bord
          </Button>
        </Link>
      </div>
      
      {/* Zone de recherche */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 pb-6">
          <div className="max-w-xl mx-auto">
            <h2 className="text-lg font-medium text-center mb-2">Comment pouvons-nous vous aider ?</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-9" 
                placeholder="Recherchez dans notre base de connaissances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sujets d'aide populaires */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpTopics.map((topic, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-muted rounded-full p-2 h-10 w-10 flex items-center justify-center flex-shrink-0">
                    {topic.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.description}</p>
                    <Link href={topic.link} className="text-sm text-primary flex items-center">
                      En savoir plus <ChevronRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Contenu principal */}
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="w-full max-w-md h-10 grid grid-cols-3">
          <TabsTrigger value="faq" className="flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 md:mr-1.5" />
            <span className="hidden md:inline">FAQ</span>
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-1.5">
            <PlayCircle className="h-3.5 w-3.5 md:mr-1.5" />
            <span className="hidden md:inline">Tutoriels</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 md:mr-1.5" />
            <span className="hidden md:inline">Contact</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Onglet FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Questions fréquentes</CardTitle>
              <CardDescription>
                Retrouvez les réponses aux questions les plus fréquemment posées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqItems.length > 0 ? (
                  filteredFaqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start">
                          <span>{item.question}</span>
                          <Badge variant="outline" className="ml-2 font-normal text-xs capitalize">{item.category}</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun résultat trouvé pour votre recherche</p>
                    <p className="text-sm text-muted-foreground mt-1">Essayez avec des termes différents ou contactez notre support</p>
                  </div>
                )}
              </Accordion>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Ressources supplémentaires</CardTitle>
              <CardDescription>
                Documentation et guides pour aller plus loin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Guide de démarrage</h3>
                    <p className="text-sm text-muted-foreground mb-2">Guide complet pour bien débuter en tant qu&apos;agent d&apos;affiliation</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="#">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Télécharger le PDF
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Règles d&apos;affiliation</h3>
                    <p className="text-sm text-muted-foreground mb-2">Conditions détaillées du programme d&apos;affiliation</p>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/agent/parrainage/rules">
                        <ChevronRight className="mr-2 h-3.5 w-3.5" />
                        Consulter
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Tutoriels */}
        <TabsContent value="tutorials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vidéos tutorielles</CardTitle>
              <CardDescription>
                Apprenez à optimiser votre activité d&apos;agent d&apos;affiliation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoTutorials.map((video, index) => (
                  <div key={index} className="rounded-lg border overflow-hidden flex flex-col">
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center hover:bg-black/40 transition-colors">
                        <PlayCircle className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-medium mb-1">{video.title}</h3>
                      <Badge className="w-fit capitalize text-xs">{video.category}</Badge>
                      <div className="mt-auto pt-3">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`#video-${video.id}`}>
                            Regarder
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Webinaires à venir</CardTitle>
              <CardDescription>
                Inscrivez-vous à nos prochains webinaires interactifs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-lg text-center md:text-left w-full md:w-auto">
                    <p className="text-xl font-bold text-primary">15</p>
                    <p className="text-sm font-medium">Juin</p>
                    <p className="text-xs text-muted-foreground">14:00</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Stratégies avancées de parrainage</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Découvrez comment optimiser votre réseau d&apos;affiliation et multiplier vos commissions.</p>
                    <div className="flex flex-wrap gap-3">
                      <Button size="sm">S&apos;inscrire</Button>
                      <Button variant="outline" size="sm">En savoir plus</Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start gap-4 p-4 border rounded-lg">
                  <div className="bg-primary/10 p-3 rounded-lg text-center md:text-left w-full md:w-auto">
                    <p className="text-xl font-bold text-primary">22</p>
                    <p className="text-sm font-medium">Juin</p>
                    <p className="text-xs text-muted-foreground">11:00</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Nouveautés de la plateforme</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">Présentation des nouvelles fonctionnalités et opportunités pour les agents d&apos;affiliation.</p>
                    <div className="flex flex-wrap gap-3">
                      <Button size="sm">S&apos;inscrire</Button>
                      <Button variant="outline" size="sm">En savoir plus</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Onglet Contact */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Notre équipe de support vous répond sous 24h ouvrées
                </p>
                <Button className="w-full" asChild>
                  <Link href="mailto:agents@reenove.fr">
                    agents@reenove.fr
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Téléphone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Disponible du lundi au vendredi, de 9h à 18h
                </p>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="tel:+33123456789">
                    01 23 45 67 89
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Chat en direct
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Chattez avec un conseiller en temps réel
                </p>
                <Button className="w-full" variant="secondary">
                  Démarrer un chat
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Nous contacter</CardTitle>
              <CardDescription>
                Envoyez-nous un message et nous vous répondrons dans les meilleurs délais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" placeholder="Votre nom" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Votre email" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <select id="subject" className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Sélectionnez un sujet</option>
                    <option value="commission">Question sur les commissions</option>
                    <option value="account">Problème de compte</option>
                    <option value="technical">Problème technique</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea 
                    id="message" 
                    placeholder="Décrivez votre problème ou votre question en détail..."
                    className="w-full min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  ></textarea>
                </div>
                
                <Button type="submit" className="w-full md:w-auto">
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Pied de page */}
      <div className="mt-8 pt-6 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Besoin d&apos;une aide immédiate ? Appelez notre ligne directe au 01 23 45 67 89
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/agent">
                Retour au tableau de bord
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                Accueil Reenove
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 