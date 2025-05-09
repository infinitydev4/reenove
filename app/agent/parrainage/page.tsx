"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  CheckCircle,
  Copy,
  ClipboardCheck,
  UserPlus,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  ArrowRight,
  MessageSquare,
  ChevronRight
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function ParrainagePage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("Bonjour,\n\nJe vous invite à rejoindre Reenove, une plateforme qui met en relation des artisans qualifiés avec des clients pour des projets de rénovation. Vous pouvez vous inscrire avec mon lien de parrainage ci-dessous.\n\nCordialement.")

  const referralLink = "https://reenove.com/r/agent2345"

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    // Logique d'invitation par email
    alert(`Invitation envoyée à ${inviteEmail}`)
    setInviteEmail("")
  }

  // Données fictives pour les règles de commission
  const commissionRules = [
    {
      type: "Projet apporté",
      description: "Commission sur chaque projet que vous amenez sur la plateforme",
      commission: "5% du montant total",
      condition: "Projet complété"
    },
    {
      type: "Artisan parrainé",
      description: "Lorsqu'un artisan s'inscrit avec votre lien et complète son profil",
      commission: "50 € par artisan",
      condition: "Après 1er projet terminé"
    },
    {
      type: "Filleul client",
      description: "Lorsqu'un client s'inscrit avec votre lien et crée un projet",
      commission: "30 € par client",
      condition: "Après signature d'un devis"
    },
    {
      type: "Commission filleul",
      description: "Pourcentage sur les commissions générées par vos filleuls",
      commission: "10% de leurs commissions",
      condition: "Pendant 2 ans"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Programme de parrainage</h1>
          <p className="text-muted-foreground">Parrainez des artisans et clients et gagnez des commissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline">
            <Link href="/agent/parrainage/stats">
              <MessageSquare className="h-4 w-4 mr-2" />
              Statistiques
            </Link>
          </Button>
          <Button asChild>
            <Link href="/agent/filleuls/invite">
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un filleul
            </Link>
          </Button>
        </div>
      </div>

      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="link">Lien de parrainage</TabsTrigger>
          <TabsTrigger value="invite">Invitation par email</TabsTrigger>
          <TabsTrigger value="rules">Règles de commission</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Comment ça marche ?</CardTitle>
                <CardDescription>
                  Parrainez des artisans et des clients pour gagner des commissions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
                    <div className="mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Link2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">1. Partagez votre lien</h3>
                    <p className="text-sm text-muted-foreground">Diffusez votre lien de parrainage à votre réseau</p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
                    <div className="mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserPlus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">2. Inscriptions</h3>
                    <p className="text-sm text-muted-foreground">Vos filleuls s&apos;inscrivent via votre lien</p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted">
                    <div className="mb-3 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">3. Commissions</h3>
                    <p className="text-sm text-muted-foreground">Recevez des commissions à chaque conversion</p>
                  </div>
                </div>

                <Alert className="mt-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Programme multi-niveaux</AlertTitle>
                  <AlertDescription>
                    Gagnez également sur les performances de vos filleuls avec notre programme à plusieurs niveaux. Plus votre réseau s&apos;agrandit, plus vos gains augmentent.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" asChild>
                  <Link href="/agent/parrainage/rules">
                    En savoir plus
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Link2 className="h-5 w-5 mr-2" />
                  Votre lien de parrainage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center p-2 rounded-lg bg-background">
                  <code className="text-xs truncate flex-1">
                    {referralLink}
                  </code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                    {copied ? <ClipboardCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <div className="flex justify-center space-x-3 pt-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-muted-foreground flex flex-col gap-2 w-full">
                  <div className="flex justify-between">
                    <span>Clics ce mois</span>
                    <span className="font-medium">124</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inscriptions</span>
                    <span className="font-medium">17</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de conversion</span>
                    <span className="font-medium">13.7%</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>
                Les dernières activités de parrainage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Détail</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">12/05/2024</TableCell>
                    <TableCell>Artisan</TableCell>
                    <TableCell>Pierre Dubois</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
                        En attente
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">--</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">10/05/2024</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Marie Lefèvre</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                        Validé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">30,00 €</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">08/05/2024</TableCell>
                    <TableCell>Projet</TableCell>
                    <TableCell>Rénovation cuisine</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                        Validé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">175,00 €</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">05/05/2024</TableCell>
                    <TableCell>Filleul</TableCell>
                    <TableCell>Commission sur Thomas</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                        Validé
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">12,50 €</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="ml-auto">
                <Link href="/agent/parrainage/history">
                  Voir tout l&apos;historique
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="link" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Votre lien de parrainage personnalisé</CardTitle>
              <CardDescription>
                Partagez ce lien pour parrainer des artisans et des clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center p-3 rounded-lg bg-muted">
                <code className="text-sm truncate flex-1">
                  {referralLink}
                </code>
                <Button variant="outline" size="sm" className="ml-2" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <ClipboardCheck className="h-4 w-4 text-green-500 mr-2" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Partagez sur les réseaux sociaux</h3>
                <div className="flex flex-wrap gap-3">
                  <Button className="flex items-center gap-2" variant="outline">
                    <Facebook className="h-4 w-4 text-blue-600" />
                    Partager sur Facebook
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <Twitter className="h-4 w-4 text-blue-400" />
                    Partager sur Twitter
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <Linkedin className="h-4 w-4 text-blue-700" />
                    Partager sur LinkedIn
                  </Button>
                  <Button className="flex items-center gap-2" variant="outline">
                    <Mail className="h-4 w-4" />
                    Envoyer par email
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personnalisez votre lien</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Switch id="branded-page" />
                    <Label htmlFor="branded-page">Page d&apos;atterrissage personnalisée</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Les visiteurs verront une page de destination avec votre nom et votre profil
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Statistiques du lien</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Clics totaux</p>
                    <p className="text-xl font-bold">743</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inscriptions</p>
                    <p className="text-xl font-bold">89</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de conversion</p>
                    <p className="text-xl font-bold">12%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Commissions générées</p>
                    <p className="text-xl font-bold">3 250 €</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invite" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inviter par email</CardTitle>
              <CardDescription>
                Envoyez des invitations personnalisées à vos contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    type="email" 
                    id="email" 
                    placeholder="Email de votre contact" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message personnalisé</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Message à envoyer" 
                    rows={5}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">Envoyer l&apos;invitation</Button>
              </form>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Invitations en masse</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Vous pouvez également envoyer plusieurs invitations simultanément en important vos contacts
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0 0-14h-1"></path><path d="M9 14h2"></path><path d="M9 12a2 2 0 0 1 2-2c2 0 3 2 3 3"></path><path d="M3 3h5v5"></path><path d="M3 8V3h5"></path></svg>
                    Importer depuis Gmail
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    Importer depuis Outlook
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    Importer un CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Règles de commission</CardTitle>
              <CardDescription>
                Comment fonctionnent les commissions et comment vous êtes rémunéré
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Conditions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionRules.map((rule, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{rule.type}</TableCell>
                      <TableCell>{rule.description}</TableCell>
                      <TableCell>{rule.commission}</TableCell>
                      <TableCell>{rule.condition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Paiements mensuels</AlertTitle>
                <AlertDescription>
                  Les commissions sont cumulées et payées mensuellement dès que le montant total dépasse 50 €. Vous recevez un virement bancaire ou un paiement sur votre compte PayPal (selon votre choix).
                </AlertDescription>
              </Alert>

              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Programme multi-niveaux</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Notre programme d&apos;affiliation fonctionne sur plusieurs niveaux. Lorsque vos filleuls parrainent à leur tour des personnes, vous recevez également une commission.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="font-medium">Niveau 1</p>
                    <p className="text-sm text-muted-foreground">Vos filleuls directs</p>
                    <p className="text-xl font-bold mt-1">100%</p>
                    <p className="text-sm text-muted-foreground">de la commission standard</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="font-medium">Niveau 2</p>
                    <p className="text-sm text-muted-foreground">Filleuls de vos filleuls</p>
                    <p className="text-xl font-bold mt-1">10%</p>
                    <p className="text-sm text-muted-foreground">de leurs commissions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="font-medium">Niveau 3</p>
                    <p className="text-sm text-muted-foreground">Troisième niveau</p>
                    <p className="text-xl font-bold mt-1">5%</p>
                    <p className="text-sm text-muted-foreground">de leurs commissions</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="ml-auto">
                <Link href="/agent/parrainage/faq">
                  FAQ parrainage
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 