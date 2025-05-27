"use client"

import { useState, useEffect } from "react"
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
    <Card className="overflow-hidden bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
      <div className={`h-1 ${color}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium text-white">{title}</CardTitle>
          <Icon className="h-4 w-4 text-white/70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="flex items-center mt-1">
          <span className={`text-xs font-medium flex items-center ${trendColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            {trendValue}
          </span>
          <span className="text-xs text-white/70 ml-2">{description}</span>
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
              <div className="text-xs text-white/70 mt-2 text-center">{item.label}</div>
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
          className="text-[#FCDA89]"
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
              className="fill-[#FCDA89]"
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
  const [statsData, setStatsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les statistiques depuis l'API
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/admin/statistics')
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des statistiques')
        }
        const data = await response.json()
        setStatsData(data)
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Données KPI depuis l'API ou par défaut
  const kpiData: StatCardProps[] = statsData?.kpi ? statsData.kpi.map((item: any) => ({
    ...item,
    icon: item.icon === "Users" ? Users :
          item.icon === "Wrench" ? Wrench :
          item.icon === "FileText" ? FileText :
          item.icon === "TrendingUp" ? TrendingUp :
          DollarSign
  })) : [
    { 
      title: "Utilisateurs", 
      value: "0", 
      icon: Users, 
      trend: "up", 
      trendValue: "0%", 
      description: "vs mois précédent",
      color: "bg-blue-500"
    },
    { 
      title: "Artisans", 
      value: "0", 
      icon: Wrench, 
      trend: "up", 
      trendValue: "0%", 
      description: "vs mois précédent",
      color: "bg-purple-500"
    },
    { 
      title: "Projets", 
      value: "0", 
      icon: FileText, 
      trend: "up", 
      trendValue: "0%", 
      description: "vs mois précédent",
      color: "bg-amber-500"
    },
    { 
      title: "Taux conversion", 
      value: "24.8%", 
      icon: TrendingUp, 
      trend: "up", 
      trendValue: "+2.5%", 
      description: "vs mois précédent",
      color: "bg-green-500"
    }
  ]
  
  const projectsData: ChartDataItem[] = statsData?.projectsLast7Days || [
    { label: "Lun", value: 0, color: "bg-blue-500" },
    { label: "Mar", value: 0, color: "bg-blue-500" },
    { label: "Mer", value: 0, color: "bg-blue-500" },
    { label: "Jeu", value: 0, color: "bg-blue-500" },
    { label: "Ven", value: 0, color: "bg-blue-500" },
    { label: "Sam", value: 0, color: "bg-blue-500" },
    { label: "Dim", value: 0, color: "bg-blue-500" }
  ]
  
  const usersData: number[] = [10, 15, 12, 18, 24, 30, 28]
  
  const projectStatusData: ChartDataItem[] = statsData?.projectsByStatus || [
    { label: "Publiés", value: 0, color: "bg-blue-500" },
    { label: "En attente", value: 0, color: "bg-yellow-500" },
    { label: "Attribués", value: 0, color: "bg-purple-500" },
    { label: "En cours", value: 0, color: "bg-amber-500" },
    { label: "Terminés", value: 0, color: "bg-green-500" },
    { label: "Annulés", value: 0, color: "bg-red-500" }
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Statistiques</h1>
          <p className="text-white/70">
            Analyse des performances de la plateforme
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
            <Filter className="h-4 w-4" />
          </Button>
          <Select value={period} onValueChange={(value: PeriodType) => setPeriod(value)}>
            <SelectTrigger className="w-[150px] bg-white/5 border-[#FCDA89]/20 text-white">
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
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-5 bg-white/5 border-[#FCDA89]/20">
          <TabsTrigger value="apercu" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Aperçu</TabsTrigger>
          <TabsTrigger value="projets" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Projets</TabsTrigger>
          <TabsTrigger value="utilisateurs" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Utilisateurs</TabsTrigger>
          <TabsTrigger value="artisans" className="data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Artisans</TabsTrigger>
          <TabsTrigger value="finances" className="hidden lg:inline-flex data-[state=active]:bg-[#FCDA89]/20 data-[state=active]:text-[#FCDA89] text-white/70">Finances</TabsTrigger>
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
            <Card className="lg:col-span-2 bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Projets par jour</CardTitle>
                <CardDescription className="text-white/70">Nombre de nouveaux projets</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={projectsData} height={200} />
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Statut des projets</CardTitle>
                <CardDescription className="text-white/70">Distribution par statut</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={projectStatusData} height={200} />
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Top catégories</CardTitle>
                <CardDescription className="text-white/70">Les plus demandées</CardDescription>
              </CardHeader>
              <CardContent className="pb-0">
                <div className="space-y-4">
                  {topCategories.map((category, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white">{category.name}</span>
                        <span className="text-sm text-white/70">{category.count}</span>
                      </div>
                      <Progress value={category.percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Nouveaux utilisateurs</CardTitle>
                <CardDescription className="text-white/70">Tendance sur 7 jours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col justify-center">
                  <SimpleTrendLine data={usersData} height={100} />
                  <div className="flex justify-between text-xs text-white/70 mt-4">
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
            
          </div>
        </TabsContent>
        
        <TabsContent value="projets" className="space-y-4">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Statistiques des projets</CardTitle>
              <CardDescription className="text-white/70">Analyse détaillée de tous les projets</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Contenu détaillé des statistiques de projets à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="utilisateurs" className="space-y-4">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Statistiques des utilisateurs</CardTitle>
              <CardDescription className="text-white/70">Analyse détaillée des utilisateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Contenu détaillé des statistiques d&apos;utilisateurs à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="artisans" className="space-y-4">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Statistiques des artisans</CardTitle>
              <CardDescription className="text-white/70">Analyse détaillée des artisans</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Contenu détaillé des statistiques d&apos;artisans à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="finances" className="space-y-4">
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Statistiques financières</CardTitle>
              <CardDescription className="text-white/70">Analyse détaillée des finances</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-white/70">Contenu détaillé des statistiques financières à venir</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 