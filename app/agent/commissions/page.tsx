"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ChevronRight, 
  Filter, 
  Search, 
  Download, 
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  BarChart2,
  Banknote,
  CalendarClock,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CommissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [periodTab, setPeriodTab] = useState("month")

  // Graphique factice des commissions mensuelles
  const commissionsByMonth = [
    { month: "Janvier", amount: 950 },
    { month: "Février", amount: 1100 },
    { month: "Mars", amount: 1450 },
    { month: "Avril", amount: 1250 },
    { month: "Mai", amount: 1450 }, // en cours
  ]

  // Max value pour le chart
  const maxCommission = Math.max(...commissionsByMonth.map(m => m.amount))

  // Données fictives des commissions
  const allCommissions = [
    {
      id: "COM-2345",
      source: "Projet #P-456 - Rénovation salle de bain",
      type: "project", // type: project, referral, affiliate
      amount: "350,00 €",
      date: "12/05/2024",
      status: "pending",
      statusLabel: "En attente"
    },
    {
      id: "COM-2341",
      source: "Parrainage artisan - Jean Martin",
      type: "artisan",
      amount: "250,00 €",
      date: "10/05/2024",
      status: "paid",
      statusLabel: "Payée",
      paymentDate: "15/05/2024"
    },
    {
      id: "COM-2339",
      source: "Commission filleul - Sophie Dubois",
      type: "affiliate",
      amount: "120,00 €",
      date: "09/05/2024",
      status: "paid",
      statusLabel: "Payée",
      paymentDate: "15/05/2024"
    },
    {
      id: "COM-2338",
      source: "Projet #P-432 - Installation électrique",
      type: "project",
      amount: "290,00 €",
      date: "08/05/2024",
      status: "paid",
      statusLabel: "Payée",
      paymentDate: "15/05/2024"
    },
    {
      id: "COM-2335",
      source: "Projet #P-430 - Pose parquet",
      type: "project",
      amount: "320,00 €",
      date: "05/05/2024",
      status: "declined",
      statusLabel: "Refusée",
      reason: "Projet annulé"
    },
    {
      id: "COM-2330",
      source: "Commission filleul - Thomas Leroy",
      type: "affiliate",
      amount: "75,00 €",
      date: "02/05/2024",
      status: "paid",
      statusLabel: "Payée",
      paymentDate: "15/04/2024"
    },
    {
      id: "COM-2325",
      source: "Projet #P-422 - Peinture intérieure",
      type: "project",
      amount: "210,00 €",
      date: "28/04/2024",
      status: "paid",
      statusLabel: "Payée",
      paymentDate: "15/04/2024"
    },
  ]

  // Filtrer les commissions en fonction de la recherche et du statut
  const filteredCommissions = allCommissions.filter(commission => {
    const matchesSearch = 
      searchQuery === "" || 
      commission.source.toLowerCase().includes(searchQuery.toLowerCase()) || 
      commission.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "declined":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return ""
    }
  }

  // Fonction pour obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />
      case "pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />
      case "declined":
        return <Clock className="h-3.5 w-3.5 mr-1 opacity-50" />
      default:
        return null
    }
  }

  // Statistiques des commissions
  const commissionStats = {
    totalPending: {
      month: "350,00 €",
      quarter: "850,00 €",
      year: "2 150,00 €"
    },
    totalPaid: {
      month: "1 045,00 €", 
      quarter: "3 245,00 €",
      year: "10 420,00 €"
    },
    nextPayment: {
      date: "31/05/2024",
      amount: "1 450,00 €"
    },
    breakdown: {
      projects: 60,
      artisans: 25,
      affiliates: 15
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Commissions</h1>
          <p className="text-muted-foreground">Suivez toutes vos commissions et revenus</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relevé mensuel
          </Button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="flex justify-end">
        <Tabs 
          defaultValue="month" 
          value={periodTab}
          onValueChange={setPeriodTab}
          className="w-[400px]"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="month">Mois</TabsTrigger>
            <TabsTrigger value="quarter">Trimestre</TabsTrigger>
            <TabsTrigger value="year">Année</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-yellow-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{commissionStats.totalPending[periodTab as keyof typeof commissionStats.totalPending]}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Commissions en attente</span>
            <span className="text-xs flex items-center text-yellow-500 mt-1">
              <Clock className="h-3 w-3 mr-1" />
              En traitement
            </span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{commissionStats.totalPaid[periodTab as keyof typeof commissionStats.totalPaid]}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Commissions payées</span>
            <span className="text-xs flex items-center text-green-500 mt-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Versées
            </span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{commissionStats.nextPayment.amount}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Prochain paiement</span>
            <span className="text-xs flex items-center text-blue-500 mt-1">
              <CalendarClock className="h-3 w-3 mr-1" />
              Prévu le {commissionStats.nextPayment.date}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Graphique et répartition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des commissions</CardTitle>
            <CardDescription>
              Répartition de vos commissions sur les derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-end justify-between gap-2">
              {commissionsByMonth.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-full">
                  <div 
                    className={`w-full rounded-t-sm ${idx === commissionsByMonth.length - 1 ? 'bg-primary' : 'bg-primary/60'}`}
                    style={{ height: `${(item.amount / maxCommission) * 200}px` }}
                  ></div>
                  <div className="text-xs text-muted-foreground">{item.month}</div>
                  <div className="text-xs font-medium">{item.amount} €</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition</CardTitle>
            <CardDescription>
              Sources de vos commissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2 text-blue-500" />
                  Projets
                </span>
                <span className="font-medium">{commissionStats.breakdown.projects}%</span>
              </div>
              <Progress value={commissionStats.breakdown.projects} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <Banknote className="h-4 w-4 mr-2 text-green-500" />
                  Artisans
                </span>
                <span className="font-medium">{commissionStats.breakdown.artisans}%</span>
              </div>
              <Progress value={commissionStats.breakdown.artisans} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-yellow-500" />
                  Filleuls
                </span>
                <span className="font-medium">{commissionStats.breakdown.affiliates}%</span>
              </div>
              <Progress value={commissionStats.breakdown.affiliates} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des commissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Historique des commissions</CardTitle>
          <CardDescription>
            Détail de toutes vos commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par source ou ID..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Statut" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">Payées</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="declined">Refusées</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full divide-y">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">ID</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Source</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Montant</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Statut</th>
                    <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCommissions.length > 0 ? (
                    filteredCommissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-sm">{commission.id}</td>
                        <td className="px-4 py-4 text-sm font-medium">{commission.source}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{commission.date}</td>
                        <td className="px-4 py-4 text-sm font-medium">{commission.amount}</td>
                        <td className="px-4 py-4 text-sm">
                          <Badge variant="outline" className={getStatusBadgeStyle(commission.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(commission.status)}
                              {commission.statusLabel}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            asChild
                          >
                            <Link href={`/agent/commissions/${commission.id}`}>
                              Détails
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        Aucune commission ne correspond à votre recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>Les commissions sont payées mensuellement, avec un minimum de 50 € pour déclencher un paiement.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 