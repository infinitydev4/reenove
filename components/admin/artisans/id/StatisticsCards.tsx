import { CheckCircle, CircleDollarSign, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

type StatisticsCardsProps = {
  stats: {
    projectsCompleted: number
    currentProjects: number
    totalEarnings: string
  }
}

export function StatisticsCards({ stats }: StatisticsCardsProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span className="w-7 h-1 bg-primary rounded-full mr-2"></span>
        Statistiques
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Projets terminés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats?.projectsCompleted || 0}
              <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
            </div>
            <Progress 
              value={Math.min((stats?.projectsCompleted || 0) * 10, 100)} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.projectsCompleted || 0} projets terminés avec succès
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-blue-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Projets en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats?.currentProjects || 0}
              <Clock className="ml-2 h-5 w-5 text-blue-500" />
            </div>
            <Progress 
              value={Math.min((stats?.currentProjects || 0) * 33, 100)} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.currentProjects || 0} projets actuellement en cours
            </p>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden">
          <div className="h-1 bg-green-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d&apos;affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {stats?.totalEarnings}
              <CircleDollarSign className="ml-2 h-5 w-5 text-green-500" />
            </div>
            <Progress 
              value={70} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              +15% par rapport à la période précédente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 