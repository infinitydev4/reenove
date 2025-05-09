"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ChevronRight, 
  Plus, 
  Filter, 
  Search, 
  UserPlus, 
  UserCheck, 
  Download, 
  Mail,
  ArrowUpDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FilleulsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Données fictives des filleuls
  const allReferrals = [
    {
      id: "F-2345",
      name: "Sophie Martin",
      email: "sophie.martin@example.com",
      image: "",
      joinDate: "12/05/2024",
      status: "active",
      statusLabel: "Actif",
      commissions: "350 €",
      referrals: 2
    },
    {
      id: "F-2341",
      name: "Jean Dupont",
      email: "jean.dupont@example.com",
      image: "",
      joinDate: "10/05/2024",
      status: "active",
      statusLabel: "Actif",
      commissions: "150 €",
      referrals: 0
    },
    {
      id: "F-2339",
      name: "Marie Lefebvre",
      email: "marie.lefebvre@example.com",
      image: "",
      joinDate: "09/05/2024",
      status: "active",
      statusLabel: "Actif",
      commissions: "280 €",
      referrals: 1
    },
    {
      id: "F-2338",
      name: "Thomas Leroy",
      email: "thomas.leroy@example.com",
      image: "",
      joinDate: "08/05/2024",
      status: "inactive",
      statusLabel: "Inactif",
      commissions: "0 €",
      referrals: 0
    },
    {
      id: "F-2335",
      name: "Julie Moreau",
      email: "julie.moreau@example.com",
      image: "",
      joinDate: "05/05/2024",
      status: "pending",
      statusLabel: "En attente",
      commissions: "0 €",
      referrals: 0
    },
    {
      id: "F-2330",
      name: "Michel Bernard",
      email: "michel.bernard@example.com",
      image: "",
      joinDate: "02/05/2024",
      status: "inactive",
      statusLabel: "Inactif",
      commissions: "75 €",
      referrals: 0
    },
  ]

  // Filtrer les filleuls en fonction de la recherche et du statut
  const filteredReferrals = allReferrals.filter(referral => {
    const matchesSearch = 
      searchQuery === "" || 
      referral.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      referral.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || referral.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "inactive":
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800"
      default:
        return ""
    }
  }

  // Fonction pour obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <UserCheck className="h-3.5 w-3.5 mr-1" />
      case "pending":
        return <UserPlus className="h-3.5 w-3.5 mr-1" />
      case "inactive":
        return <UserCheck className="h-3.5 w-3.5 mr-1 opacity-50" />
      default:
        return null
    }
  }

  // Statistiques des filleuls
  const referralStats = {
    total: allReferrals.length,
    active: allReferrals.filter(r => r.status === "active").length,
    inactive: allReferrals.filter(r => r.status === "inactive").length,
    pending: allReferrals.filter(r => r.status === "pending").length,
    totalCommissions: "855 €"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Mes filleuls</h1>
          <p className="text-muted-foreground">Gérez votre réseau d&apos;affiliation</p>
        </div>

        <Button asChild>
          <Link href="/agent/filleuls/invite">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un filleul
          </Link>
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{referralStats.total}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Total filleuls</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{referralStats.active}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Filleuls actifs</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">{referralStats.pending}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">En attente</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{referralStats.totalCommissions}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Commissions générées</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des filleuls</CardTitle>
          <CardDescription>
            Consultez et gérez tous vos filleuls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, email ou ID..."
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
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
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
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Filleul</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Date d&apos;inscription</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Commissions</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Filleuls</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Statut</th>
                    <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredReferrals.length > 0 ? (
                    filteredReferrals.map((referral) => (
                      <tr key={referral.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-sm">{referral.id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={referral.image} alt={referral.name} />
                              <AvatarFallback>{referral.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{referral.name}</p>
                              <p className="text-xs text-muted-foreground">{referral.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{referral.joinDate}</td>
                        <td className="px-4 py-4 text-sm font-medium">{referral.commissions}</td>
                        <td className="px-4 py-4 text-sm">{referral.referrals}</td>
                        <td className="px-4 py-4 text-sm">
                          <Badge variant="outline" className={getStatusBadgeStyle(referral.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(referral.status)}
                              {referral.statusLabel}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="h-8 w-8 p-0"
                            >
                              <Mail className="h-4 w-4" />
                              <span className="sr-only">Contacter</span>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              asChild
                            >
                              <Link href={`/agent/filleuls/${referral.id}`}>
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
                        Aucun filleul ne correspond à votre recherche
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