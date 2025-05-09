import { FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Project = {
  id: string
  title: string
  status: string
  amount: string
  clientName: string
  startDate: string
  endDate?: string
}

type ArtisanProjectsTabProps = {
  projects: Project[]
}

export function ArtisanProjectsTab({ projects }: ArtisanProjectsTabProps) {
  // Fonction pour le statut du projet
  const getProjectStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Terminé</Badge>
      case "in_progress":
        return <Badge className="bg-blue-500">En cours</Badge>
      case "pending":
        return <Badge className="bg-amber-500">À venir</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projets de l&apos;artisan</CardTitle>
        <CardDescription>
          Liste des projets en cours et terminés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projet</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Aucun projet trouvé pour cet artisan
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>{project.startDate}</TableCell>
                    <TableCell>{project.amount}</TableCell>
                    <TableCell>{getProjectStatusBadge(project.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Voir tous les projets
        </Button>
      </CardFooter>
    </Card>
  )
} 