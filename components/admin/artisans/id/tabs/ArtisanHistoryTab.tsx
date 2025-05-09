import { ClipboardList } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ActivityItem = {
  id: number
  title: string
  date: string
  time: string
  description: string
}

export function ArtisanHistoryTab() {
  // Données fictives pour l'historique
  const activities: ActivityItem[] = [
    {
      id: 1,
      title: "Mise à jour du profil",
      date: "15/04/2023",
      time: "14:30",
      description: "L'artisan a mis à jour ses informations de contact"
    },
    {
      id: 2,
      title: "Nouveau projet",
      date: "10/04/2023",
      time: "09:15",
      description: "Ajout du projet \"Installation électrique\""
    },
    {
      id: 3,
      title: "Document expiré",
      date: "05/04/2023",
      time: "00:00",
      description: "L'assurance professionnelle a expiré"
    },
    {
      id: 4,
      title: "Projet terminé",
      date: "28/03/2023",
      time: "17:45",
      description: "Le projet \"Rénovation salle de bain\" a été marqué comme terminé"
    },
    {
      id: 5,
      title: "Nouvelle évaluation",
      date: "28/03/2023",
      time: "18:10",
      description: "L'artisan a reçu une évaluation 5/5 pour le projet \"Rénovation salle de bain\""
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des activités</CardTitle>
        <CardDescription>
          Journal des actions et modifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="border-l-2 border-muted pl-4 py-3 hover:border-primary transition-colors">
              <div className="flex items-center">
                <div className="text-sm font-medium">{activity.title}</div>
                <div className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {activity.date} à {activity.time}
                </div>
              </div>
              <div className="text-sm mt-1 text-muted-foreground">{activity.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline">
          <ClipboardList className="mr-2 h-4 w-4" />
          Historique complet
        </Button>
      </CardFooter>
    </Card>
  )
} 