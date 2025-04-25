"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  FileClock, 
  Download, 
  ChevronRight, 
  Plus, 
  Filter, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function DevisPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Données fictives des devis
  const allQuotes = [
    {
      id: "DEV-2345",
      client: "Sophie Martin",
      project: "Rénovation salle de bain",
      amount: "3 450 €",
      date: "12/05/2024",
      status: "pending",
      statusLabel: "En attente"
    },
    {
      id: "DEV-2341",
      client: "Jean Dupont",
      project: "Installation électrique cuisine",
      amount: "1 250 €",
      date: "10/05/2024",
      status: "pending",
      statusLabel: "En attente"
    },
    {
      id: "DEV-2339",
      client: "Marie Lefebvre",
      project: "Pose parquet salon",
      amount: "2 800 €",
      date: "09/05/2024",
      status: "pending",
      statusLabel: "En attente"
    },
    {
      id: "DEV-2338",
      client: "Thomas Leroy",
      project: "Peinture chambre principale",
      amount: "850 €",
      date: "08/05/2024",
      status: "accepted",
      statusLabel: "Accepté"
    },
    {
      id: "DEV-2335",
      client: "Julie Moreau",
      project: "Installation dressing",
      amount: "1 950 €",
      date: "05/05/2024",
      status: "accepted",
      statusLabel: "Accepté"
    },
    {
      id: "DEV-2330",
      client: "Michel Bernard",
      project: "Réparation terrasse bois",
      amount: "780 €",
      date: "02/05/2024",
      status: "completed",
      statusLabel: "Terminé"
    },
    {
      id: "DEV-2329",
      client: "Emma Petit",
      project: "Rénovation cuisine",
      amount: "4 200 €",
      date: "30/04/2024",
      status: "rejected",
      statusLabel: "Refusé"
    },
  ]

  // Filtrer les devis en fonction de la recherche et du statut
  const filteredQuotes = allQuotes.filter(quote => {
    const matchesSearch = 
      searchQuery === "" || 
      quote.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
      quote.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "accepted":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      case "completed":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
      case "rejected":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return ""
    }
  }

  // Fonction pour obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />
      case "accepted":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />
      case "completed":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />
      case "rejected":
        return <AlertCircle className="h-3.5 w-3.5 mr-1" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Devis</h1>
          <p className="text-muted-foreground">Gérez vos devis et factures</p>
        </div>

        <Button asChild>
          <Link href="/artisan/devis/create">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau devis
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Tous les devis</CardTitle>
          <CardDescription>
            Consultez et gérez tous vos devis clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par client, projet ou numéro..."
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
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="accepted">Acceptés</SelectItem>
                  <SelectItem value="completed">Terminés</SelectItem>
                  <SelectItem value="rejected">Refusés</SelectItem>
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
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Client</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Projet</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Montant</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Statut</th>
                    <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQuotes.length > 0 ? (
                    filteredQuotes.map((quote) => (
                      <tr key={quote.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-sm">{quote.id}</td>
                        <td className="px-4 py-4 text-sm font-medium">{quote.client}</td>
                        <td className="px-4 py-4 text-sm">{quote.project}</td>
                        <td className="px-4 py-4 text-sm font-medium">{quote.amount}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{quote.date}</td>
                        <td className="px-4 py-4 text-sm">
                          <Badge variant="outline" className={getStatusBadgeStyle(quote.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(quote.status)}
                              {quote.statusLabel}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/artisan/devis/${quote.id}`}>
                                Voir
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        Aucun devis ne correspond à votre recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 