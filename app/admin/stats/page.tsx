"use client"

import { useState } from "react"
import {
  BarChart3,
  TrendingUp,
  Users,
  Wrench,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  StatCardProps,
  ChartDataItem,
  SimpleBarChartProps,
  SimpleTrendLineProps,
  CategoryItem,
  ActivityItem,
  PeriodType,
  TabType
} from "@/types/statistiques"

// Composant pour les statistiques KPI
const StatCard = ({ title, value, icon, trend, trendValue, description, color }: StatCardProps) => {
  const Icon = icon
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500"
  const TrendIcon = trend === "up" ? ArrowUp : ArrowDown
  
  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${color}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          <span className={`text-xs font-medium flex items-center ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {trendValue}
          </span>
          <span className="text-xs text-muted-foreground ml-2">{description}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Création d'un graphique à barres simple
const SimpleBarChart = ({ data, height = 200 }: SimpleBarChartProps) => {
  const maxValue = Math.max(...data.map(item => item.value))
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end h-full justify-between">
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * 100
          return (
            <div key={index} className="flex flex-col items-center w-full">
              <div 
                className={`w-full max-w-[30px] mx-auto rounded-t-sm ${item.color}`} 
                style={{ height: `${barHeight}%` }}
              ></div>
              <div className="text-xs text-muted-foreground mt-2 text-center">{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Composant de ligne de tendance simple
const SimpleTrendLine = ({ data, height = 80 }: SimpleTrendLineProps) => {
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - (value / Math.max(...data)) * 100
    return `${x},${y}`
  }).join(" ")
  
  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
        />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - (value / Math.max(...data)) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              className="fill-primary"
            />
          )
        })}
      </svg>
    </div>
  )
}

export default function StatisticsPage() {
  const [period, setPeriod] = useState<PeriodType>("month")
  const [tab, setTab] = useState<TabType>("apercu")
  
  // Données fictives pour démonstration
  const kpiData: StatCardProps[] = [
    { 
      title: "Utilisateurs", 
      value: "587", 
      icon: Users, 
      trend: "up", 
      trendValue: "12%", 
      description: "vs mois précédent",
      color: "bg-blue-500"
    },
    { 
      title: "Artisans", 
      value: "146", 
      icon: Wrench, 
      trend: "up", 
      trendValue: "8%", 
      description: "vs mois précédent",
      color: "bg-purple-500"
    },
    { 
      title: "Projets", 
      value: "329", 
      icon: FileText, 
      trend: "up", 
      trendValue: "20%", 
      description: "vs mois précédent",
      color: "bg-amber-500"
    },
    { 
      title: "Chiffre d'affaires", 
      value: "24 850 €", 
      icon: DollarSign, 
      trend: "up", 
      trendValue: "15%", 
      description: "vs mois précédent",
      color: "bg-green-500"
    }
  ]
  
  const projectsData: ChartDataItem[] = [
    { label: "Lun", value: 12, color: "bg-blue-500" },
    { label: "Mar", value: 18, color: "bg-blue-500" },
    { label: "Mer", value: 15, color: "bg-blue-500" },
    { label: "Jeu", value: 22, color: "bg-blue-500" },
    { label: "Ven", value: 28, color: "bg-blue-500" },
    { label: "Sam", value: 14, color: "bg-blue-500" },
    { label: "Dim", value: 8, color: "bg-blue-500" }
  ]
  
  const usersData: number[] = [10, 15, 12, 18, 24, 30, 28]
  
  const projectStatusData: ChartDataItem[] = [
    { label: "Publiés", value: 95, color: "bg-blue-500" },
    { label: "En attente", value: 45, color: "bg-yellow-500" },
    { label: "Attribués", value: 75, color: "bg-purple-500" },
    { label: "En cours", value: 60, color: "bg-amber-500" },
    { label: "Terminés", value: 40, color: "bg-green-500" },
    { label: "Annulés", value: 15, color: "bg-red-500" }
  ]
  
  const topCategories: CategoryItem[] = [
    { name: "Plomberie", count: 87, percentage: 85 },
    { name: "Électricité", count: 74, percentage: 72 },
    { name: "Rénovation", count: 63, percentage: 61 },
    { name: "Peinture", count: 52, percentage: 50 },
    { name: "Menuiserie", count: 45, percentage: 44 }
  ]
  
  const recentActivity: ActivityItem[] = [
    { 
      id: 1, 
      type: "new_user", 
      title: "Nouvel utilisateur inscrit", 
      description: "Jean Dupont a rejoint la plateforme", 
      time: "Il y a 10 minutes" 
    },
    { 
      id: 2, 
      type: "new_project", 
      title: "Nouveau projet publié", 
      description: "Rénovation salle de bain - Budget 5000€", 
      time: "Il y a 25 minutes" 
    },
    { 
      id: 3, 
      type: "project_assigned", 
      title: "Projet attribué", 
      description: "Électricité appartement attribué à Martin Électrique", 
      time: "Il y a 1 heure" 
    },
    { 
      id: 4, 
      type: "project_completed", 
      title: "Projet terminé", 
      description: "Installation cuisine terminée et validée", 
      time: "Il y a 3 heures" 
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Statistiques</h1>
          <p className="text-muted-foreground">
            Analyse des performances de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
          <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Aujourd&apos;hui</SelectItem>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem> 
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs 
        defaultValue="apercu" 
        value={tab} 
        onValueChange={(value) => setTab(value as TabType)} 
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="projets">Projets</TabsTrigger>
          <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
          <TabsTrigger value="artisans">Artisans</TabsTrigger>
          <TabsTrigger value="finances" className="hidden lg:inline-flex">Finances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apercu" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpiData.map((kpi, index) => (
              <StatCard key={index} {...kpi} />
            ))}
          </div>
          
          {/* Charts & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Projets par jour</CardTitle>
                <CardDescription>Nombre de nouveaux projets</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={projectsData} height={200} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Statut des projets</CardTitle>
                <CardDescription>Distribution par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={projectStatusData} height={200} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Top catégories</CardTitle>
                <CardDescription>Les plus demandées</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{category.name}</span>
                        <span className="text-sm text-muted-foreground">{category.count}</span>
                      </div>
                      <Progress value={category.percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
                <CardDescription>Tendance sur 7 jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col justify-center">
                  <SimpleTrendLine data={usersData} height={100} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-4">
                    <span>Lun</span>
                    <span>Mar</span>
                    <span>Mer</span>
                    <span>Jeu</span>
                    <span>Ven</span>
                    <span>Sam</span>
                    <span>Dim</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Activité récente</CardTitle>
                <CardDescription>Dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <div className={`rounded-full p-2 shrink-0 ${
                        activity.type === "new_user" ? "bg-blue-100 text-blue-600" :
                        activity.type === "new_project" ? "bg-purple-100 text-purple-600" :
                        activity.type === "project_assigned" ? "bg-amber-100 text-amber-600" :
                        "bg-green-100 text-green-600"
                      }`}>
                        {activity.type === "new_user" ? <Users className="h-4 w-4" /> :
                         activity.type === "new_project" ? <FileText className="h-4 w-4" /> :
                         activity.type === "project_assigned" ? <Wrench className="h-4 w-4" /> :
                         <CheckCircle className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{activity.title}</div>
                        <div className="text-sm text-muted-foreground">{activity.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="outline" size="sm" className="w-full">Voir toutes les activités</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="projets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des projets</CardTitle>
              <CardDescription>Analyse détaillée de tous les projets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contenu détaillé des statistiques de projets à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="utilisateurs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des utilisateurs</CardTitle>
              <CardDescription>Analyse détaillée des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contenu détaillé des statistiques d&apos;utilisateurs à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="artisans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des artisans</CardTitle>
              <CardDescription>Analyse détaillée des artisans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contenu détaillé des statistiques d&apos;artisans à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Statistiques financières</CardTitle>
              <CardDescription>Analyse détaillée des finances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Contenu détaillé des statistiques financières à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 