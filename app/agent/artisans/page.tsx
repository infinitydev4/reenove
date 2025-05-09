"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ChevronRight, 
  Filter, 
  Search, 
  UserPlus, 
  Download, 
  Mail,
  Building,
  Star,
  CheckCircle,
  Clock
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

export default function ArtisansPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Données fictives des artisans parrainés
  const allArtisans = [
    {
      id: "A-2345",
      name: "Jean Martin",
      email: "jean.martin@exemple.com",
      company: "Martin Rénovation",
      image: "",
      joinDate: "12/05/2024",
      specialty: "Plomberie",
      status: "active",
      statusLabel: "Actif",
      commissions: "450 €",
      projects: 5,
      rating: 4.8
    },
    {
      id: "A-2341",
      name: "Sophie Durand",
      email: "sophie.durand@exemple.com",
      company: "SDurand Électricité",
      image: "",
      joinDate: "10/05/2024",
      specialty: "Électricité",
      status: "active",
      statusLabel: "Actif",
      commissions: "320 €",
      projects: 3,
      rating: 4.5
    },
    {
      id: "A-2339",
      name: "Thomas Bernard",
      email: "thomas.bernard@exemple.com",
      company: "Peinture Bernard",
      image: "",
      joinDate: "09/05/2024",
      specialty: "Peinture",
      status: "pending",
      statusLabel: "En attente",
      commissions: "0 €",
      projects: 0,
      rating: 0
    },
    {
      id: "A-2338",
      name: "Marie Leclerc",
      email: "marie.leclerc@exemple.com",
      company: "Leclerc Menuiserie",
      image: "",
      joinDate: "08/05/2024",
      specialty: "Menuiserie",
      status: "active",
      statusLabel: "Actif",
      commissions: "180 €",
      projects: 2,
      rating: 4.2
    },
    {
      id: "A-2335",
      name: "Pierre Dubois",
      email: "pierre.dubois@exemple.com",
      company: "Dubois Construction",
      image: "",
      joinDate: "05/05/2024",
      specialty: "Maçonnerie",
      status: "inactive",
      statusLabel: "Inactif",
      commissions: "75 €",
      projects: 1,
      rating: 3.5
    },
  ]

  // Filtrer les artisans en fonction de la recherche et du statut
  const filteredArtisans = allArtisans.filter(artisan => {
    const matchesSearch = 
      searchQuery === "" || 
      artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      artisan.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artisan.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || artisan.status === statusFilter
    
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
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />
      case "pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />
      case "inactive":
        return <CheckCircle className="h-3.5 w-3.5 mr-1 opacity-50" />
      default:
        return null
    }
  }

  // Statistiques des artisans
  const artisanStats = {
    total: allArtisans.length,
    active: allArtisans.filter(r => r.status === "active").length,
    inactive: allArtisans.filter(r => r.status === "inactive").length,
    pending: allArtisans.filter(r => r.status === "pending").length,
    totalCommissions: "1 025 €"
  }

  // Fonction pour afficher les étoiles de notation
  const renderRating = (rating: number) => {
    if (rating === 0) return "Non évalué"
    
    return (
      <div className="flex items-center">
        <span className="mr-1">{rating}</span>
        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Artisans parrainés</h1>
          <p className="text-muted-foreground">Gérez les artisans que vous avez parrainés</p>
        </div>

        <Button asChild>
          <Link href="/agent/artisans/invite">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un artisan
          </Link>
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{artisanStats.total}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Total artisans</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{artisanStats.active}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Artisans actifs</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">{artisanStats.pending}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">En attente</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{artisanStats.totalCommissions}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Commissions générées</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des artisans</CardTitle>
          <CardDescription>
            Consultez et gérez tous les artisans que vous avez parrainés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, email, entreprise ou spécialité..."
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
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Artisan</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Spécialité</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Date d&apos;inscription</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Projets</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Évaluation</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Statut</th>
                    <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredArtisans.length > 0 ? (
                    filteredArtisans.map((artisan) => (
                      <tr key={artisan.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-sm">{artisan.id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={artisan.image} alt={artisan.name} />
                              <AvatarFallback>{artisan.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{artisan.name}</p>
                              <p className="text-xs text-muted-foreground">{artisan.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">{artisan.specialty}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{artisan.joinDate}</td>
                        <td className="px-4 py-4 text-sm">{artisan.projects}</td>
                        <td className="px-4 py-4 text-sm">{renderRating(artisan.rating)}</td>
                        <td className="px-4 py-4 text-sm">
                          <Badge variant="outline" className={getStatusBadgeStyle(artisan.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(artisan.status)}
                              {artisan.statusLabel}
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
                              <Link href={`/agent/artisans/${artisan.id}`}>
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
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        Aucun artisan ne correspond à votre recherche
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Comment ça marche ?</CardTitle>
          <CardDescription>
            Fonctionnement du parrainage d&apos;artisans
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <UserPlus className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">1. Invitation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Invitez un artisan via votre lien de parrainage ou en lui envoyant une invitation directe.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <Building className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">2. Inscription</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                L&apos;artisan s&apos;inscrit sur la plateforme et complète son profil professionnel.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">3. Commission</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Recevez une commission fixe après que l&apos;artisan ait complété son premier projet.
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-primary/5 p-4 text-sm">
            <p className="font-medium mb-1">Bonus de performance</p>
            <p className="text-muted-foreground">
              Recevez un pourcentage supplémentaire sur tous les projets réalisés par les artisans que vous avez parrainés pendant la première année.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="ml-auto">
            <Link href="/agent/parrainage/rules">
              Voir les règles complètes
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 