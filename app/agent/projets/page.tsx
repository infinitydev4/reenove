"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ChevronRight, 
  Filter, 
  Search, 
  Download, 
  Mail,
  BarChart3,
  CheckCircle,
  Clock,
  FileText,
  FileCheck,
  FileClock,
  FileX,
  UserPlus,
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

export default function ProjetsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Données fictives des projets
  const allProjects = [
    {
      id: "P-4521",
      title: "Rénovation salle de bain",
      client: {
        name: "Marie Dupont",
        email: "marie.dupont@example.com",
        image: "",
      },
      artisan: {
        name: "Jean Martin",
        company: "Martin Rénovation",
        image: "",
      },
      category: "Plomberie",
      startDate: "15/06/2024",
      budget: "4 500 €",
      status: "in_progress",
      statusLabel: "En cours",
      commission: "225 €",
    },
    {
      id: "P-4520",
      title: "Installation électrique",
      client: {
        name: "Thomas Bernard",
        email: "thomas.bernard@example.com",
        image: "",
      },
      artisan: {
        name: "Sophie Durand",
        company: "SDurand Électricité",
        image: "",
      },
      category: "Électricité",
      startDate: "10/06/2024",
      budget: "3 800 €",
      status: "pending",
      statusLabel: "En attente",
      commission: "190 €",
    },
    {
      id: "P-4518",
      title: "Peinture intérieure",
      client: {
        name: "Lucas Leroy",
        email: "lucas.leroy@example.com",
        image: "",
      },
      artisan: {
        name: "Pierre Dubois",
        company: "Dubois Peinture",
        image: "",
      },
      category: "Peinture",
      startDate: "05/06/2024",
      budget: "2 400 €",
      status: "completed",
      statusLabel: "Terminé",
      commission: "120 €",
    },
    {
      id: "P-4517",
      title: "Pose de parquet",
      client: {
        name: "Julie Martin",
        email: "julie.martin@example.com",
        image: "",
      },
      artisan: {
        name: "Thomas Bernard",
        company: "Bernard Menuiserie",
        image: "",
      },
      category: "Menuiserie",
      startDate: "01/06/2024",
      budget: "3 200 €",
      status: "completed",
      statusLabel: "Terminé",
      commission: "160 €",
    },
    {
      id: "P-4516",
      title: "Isolation des combles",
      client: {
        name: "Sophie Moreau",
        email: "sophie.moreau@example.com",
        image: "",
      },
      artisan: null,
      category: "Isolation",
      startDate: "28/05/2024",
      budget: "5 200 €",
      status: "cancelled",
      statusLabel: "Annulé",
      commission: "0 €",
    },
  ]

  // Filtrer les projets en fonction de la recherche et du statut
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = 
      searchQuery === "" || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      project.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.artisan?.name && project.artisan.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800"
      case "in_progress":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
      case "pending":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
      case "cancelled":
        return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
      default:
        return ""
    }
  }

  // Fonction pour obtenir l'icône selon le statut
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FileCheck className="h-3.5 w-3.5 mr-1" />
      case "in_progress":
        return <FileClock className="h-3.5 w-3.5 mr-1" />
      case "pending":
        return <Clock className="h-3.5 w-3.5 mr-1" />
      case "cancelled":
        return <FileX className="h-3.5 w-3.5 mr-1" />
      default:
        return null
    }
  }

  // Statistiques des projets
  const projectStats = {
    total: allProjects.length,
    completed: allProjects.filter(p => p.status === "completed").length,
    in_progress: allProjects.filter(p => p.status === "in_progress").length,
    pending: allProjects.filter(p => p.status === "pending").length,
    totalCommissions: "695 €"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Projets apportés</h1>
          <p className="text-muted-foreground">Suivez les projets que vous avez apportés sur la plateforme</p>
        </div>

        <Button asChild>
          <Link href="/agent/projets/invite">
            <UserPlus className="h-4 w-4 mr-2" />
            Inviter un client
          </Link>
        </Button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">{projectStats.total}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Total projets</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-600 dark:text-green-400">{projectStats.completed}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Projets terminés</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-amber-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">{projectStats.in_progress}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">En cours</span>
          </CardContent>
        </Card>
        
        <Card className="border shadow-sm overflow-hidden">
          <div className="h-1 bg-purple-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">{projectStats.totalCommissions}</span>
            <span className="text-xs text-muted-foreground mt-2 text-center">Commissions générées</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des projets</CardTitle>
          <CardDescription>
            Consultez et suivez tous les projets que vous avez apportés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par titre, client, artisan ou catégorie..."
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
                  <SelectItem value="completed">Terminés</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancelled">Annulés</SelectItem>
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
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Projet</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Client</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Artisan</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Budget</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Commission</th>
                    <th className="px-4 py-3.5 text-left text-sm font-semibold">Statut</th>
                    <th className="px-4 py-3.5 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-4 text-sm">{project.id}</td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium">{project.title}</p>
                          <p className="text-xs text-muted-foreground">{project.category}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={project.client.image} alt={project.client.name} />
                              <AvatarFallback>{project.client.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{project.client.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {project.artisan ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={project.artisan.image} alt={project.artisan.name} />
                                <AvatarFallback>{project.artisan.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{project.artisan.name}</p>
                                <p className="text-xs text-muted-foreground">{project.artisan.company}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Non assigné</p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{project.startDate}</td>
                        <td className="px-4 py-4 text-sm font-medium">{project.budget}</td>
                        <td className="px-4 py-4 text-sm font-medium">{project.commission}</td>
                        <td className="px-4 py-4 text-sm">
                          <Badge variant="outline" className={getStatusBadgeStyle(project.status)}>
                            <span className="flex items-center">
                              {getStatusIcon(project.status)}
                              {project.statusLabel}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-sm text-right">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            asChild
                          >
                            <Link href={`/agent/projets/${project.id}`}>
                              Voir
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                        Aucun projet ne correspond à votre recherche
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
            Comprendre le système de commission sur les projets
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
                Invitez un client à publier un projet via votre lien de parrainage ou en l&apos;ajoutant directement.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-medium">2. Réalisation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Le projet est attribué à un artisan qui le réalise selon les spécifications du client.
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
                Recevez une commission de 5% sur le montant total du projet une fois celui-ci terminé.
              </p>
            </div>
          </div>
          
          <div className="rounded-lg bg-primary/5 p-4 text-sm">
            <p className="font-medium mb-1">Bonus de performance</p>
            <p className="text-muted-foreground">
              Invitez plus de clients pour augmenter votre taux de commission jusqu&apos;à 7% sur les projets de grande envergure.
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