"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, TrendingUp, Users, CreditCard, UserPlus, Building, Link2, BarChart3, CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  AgentDashboardStats, 
  Commission, 
  Goal,
  Referral
} from "@/types/agent"

export default function AgentDashboardPage() {
  const [periodTab, setPeriodTab] = useState<"month" | "quarter" | "year">("month")

  // Données factices pour le tableau de bord
  const stats: AgentDashboardStats = {
    totalCommissions: {
      month: "1 250 €",
      quarter: "3 760 €",
      year: "12 450 €",
      percentChange: "+15%"
    },
    activeAffiliates: {
      month: 12,
      quarter: 18,
      year: 24,
      percentChange: "+8%"
    },
    projectsReferred: {
      month: 8,
      quarter: 22,
      year: 64,
      percentChange: "+12%"
    },
    artisansReferred: {
      month: 3,
      quarter: 7,
      year: 15,
      percentChange: "+5%"
    }
  }

  // Données factices pour les dernières commissions
  const recentCommissions: Commission[] = [
    {
      id: "COM-2345",
      source: "Projet rénovation",
      amount: "350 €",
      date: "12/05/2024",
      status: "paid",
      statusLabel: "Payée",
      type: "project"  
    },
    {
      id: "COM-2341",
      source: "Parrainage artisan",
      amount: "250 €",
      date: "10/05/2024",
      status: "pending",
      statusLabel: "En attente",
      type: "artisan"
    },
    {
      id: "COM-2339",
      source: "Commission filleul",
      amount: "120 €",
      date: "09/05/2024",
      status: "paid",
      statusLabel: "Payée",
      type: "affiliate"
    },
    {
      id: "COM-2338",
      source: "Projet installation",
      amount: "290 €",
      date: "08/05/2024",
      status: "paid",
      statusLabel: "Payée",
      type: "project"
    }
  ]
  
  // Données factices pour la progression des objectifs
  const goals: Goal[] = [
    {
      id: "COM-2345",
      title: "Commissions mensuelles",
      target: 1500,
      current: 1250,
      percentComplete: 83,
      deadline: "31/05/2024",
      reward: "1 500 €",
      type: "commissions"       
    },
    {
      id: "COM-2341",
      title: "Nouveaux filleuls",
      target: 10,
      current: 7,
      percentComplete: 70,
      deadline: "31/05/2024",
      reward: "10 €",
      type: "affiliates"
    },
    {
      id: "COM-2339",
      title: "Artisans parrainés",
      target: 5,
      current: 3,
      percentComplete: 60,
      deadline: "31/05/2024",
      reward: "5 €",
      type: "artisans"
    }
  ]
  
  // Données factices pour les derniers filleuls
  const recentAffiliates: Partial<Referral>[] = [
    {
      name: "Sophie Dubois",
      email: "sophie.dubois@example.com",
      joinDate: "12/05/2024",
      image: "",
      status: "active",
      statusLabel: "Actif",
      id: "F-001",
      commissions: "",
      referrals: 0
    },
    {
      name: "Pierre Martin",
      email: "pierre.martin@example.com",
      joinDate: "10/05/2024",
      image: "",
      status: "active",
      statusLabel: "Actif",
      id: "F-002",
      commissions: "",
      referrals: 0
    },
    {
      name: "Marie Lefèvre",
      email: "marie.lefevre@example.com",
      joinDate: "05/05/2024",
      image: "",
      status: "inactive",
      statusLabel: "Inactif",
      id: "F-003",
      commissions: "",
      referrals: 0
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue dans votre espace agent d&apos;affiliation</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline">
            <Link href="/agent/parrainage">
              <Link2 className="h-4 w-4 mr-2" />
              Lien de parrainage
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

      {/* Cartes des statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCommissions[periodTab]}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Commissions</span>
            <span className="text-xs text-green-500 mt-1">{stats.totalCommissions.percentChange} vs période précédente</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.activeAffiliates[periodTab]}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Filleuls actifs</span>
            <span className="text-xs text-green-500 mt-1">{stats.activeAffiliates.percentChange} vs période précédente</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">{stats.projectsReferred[periodTab]}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Projets apportés</span>
            <span className="text-xs text-green-500 mt-1">{stats.projectsReferred.percentChange} vs période précédente</span>
          </CardContent>
        </Card>

        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.artisansReferred[periodTab]}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Artisans parrainés</span>
            <span className="text-xs text-green-500 mt-1">{stats.artisansReferred.percentChange} vs période précédente</span>
          </CardContent>
        </Card>
      </div>

      {/* Sélecteur de période */}
      <div className="flex justify-end">
        <Tabs 
          defaultValue="month" 
          value={periodTab}
          onValueChange={(value) => setPeriodTab(value as "month" | "quarter" | "year")}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">Mois</TabsTrigger>
            <TabsTrigger value="quarter">Trimestre</TabsTrigger>
            <TabsTrigger value="year">Année</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne de gauche */}
        <div className="md:col-span-2 space-y-6">
          {/* Commissions récentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Commissions récentes</CardTitle>
              <CardDescription>
                Vos dernières commissions générées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">ID</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Source</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Montant</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Date</th>
                        <th className="px-4 py-3.5 text-left text-sm font-semibold">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {recentCommissions.map((commission) => (
                        <tr key={commission.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-4 text-sm">{commission.id}</td>
                          <td className="px-4 py-4 text-sm font-medium">{commission.source}</td>
                          <td className="px-4 py-4 text-sm font-medium">{commission.amount}</td>
                          <td className="px-4 py-4 text-sm text-muted-foreground">{commission.date}</td>
                          <td className="px-4 py-4 text-sm">
                            <Badge variant="outline" className={commission.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"}>
                              {commission.statusLabel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/agent/commissions">
                  Voir toutes les commissions
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Progrès vers les objectifs */}
          <Card>
            <CardHeader>
              <CardTitle>Objectifs du mois</CardTitle>
              <CardDescription>
                Suivi de votre progression vers les objectifs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{goal.title}</span>
                    <span>
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                  <Progress value={goal.percentComplete} className="h-2" />
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/agent/objectifs">
                  Gérer mes objectifs
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Colonne de droite */}
        <div className="space-y-6">
          {/* Carte pour le lien de parrainage */}
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Lien de parrainage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Partagez votre lien unique pour parrainer de nouveaux utilisateurs et artisans
              </p>
              <div className="flex items-center p-2 rounded-lg bg-background">
                <code className="text-xs truncate flex-1">
                  https://reenove.com/r/agent2345
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                <strong>15 clics</strong> ce mois-ci
              </p>
            </CardFooter>
          </Card>

          {/* Derniers filleuls */}
          <Card>
            <CardHeader>
              <CardTitle>Derniers filleuls</CardTitle>
              <CardDescription>
                Vos filleuls les plus récents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAffiliates.map((affiliate, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={affiliate.image} alt={affiliate.name || ""} />
                    <AvatarFallback>{affiliate.name ? affiliate.name.split(" ").map(n => n[0]).join("") : ""}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{affiliate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{affiliate.email}</p>
                  </div>
                  <Badge variant="outline" className={affiliate.status === "active" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800" : "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800"}>
                    {affiliate.statusLabel}
                  </Badge>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/agent/filleuls">
                  Voir tous les filleuls
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Prochains paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Prochains paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center p-3 rounded-lg bg-muted mb-4">
                <CalendarClock className="h-8 w-8 mr-3 text-primary" />
                <div>
                  <p className="font-medium">1 450,00 €</p>
                  <p className="text-sm text-muted-foreground">Prévu le 31/05/2024</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Les commissions sont versées mensuellement, sous réserve d'atteindre un minimum de 50 €.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 