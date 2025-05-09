import { BadgeCheck, Clock, CheckSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type ArtisanProfileCardProps = {
  artisan: {
    name: string
    avatar: string
    speciality: string
    status: string
    availability: string
    verified: boolean
    verificationStatus: "PENDING" | "VERIFIED" | "REJECTED"
  }
  onUpdateVerification: (status: string) => void
  isUpdating: boolean
}

export function ArtisanProfileCard({ artisan, onUpdateVerification, isUpdating }: ArtisanProfileCardProps) {
  // Fonction pour le statut de l'artisan
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif":
        return <Badge className="bg-green-500">Actif</Badge>
      case "inactif":
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Inactif</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  // Fonction pour la disponibilité de l'artisan
  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "disponible":
        return <Badge className="bg-green-500">Disponible</Badge>
      case "occupé":
        return <Badge className="bg-amber-500">Occupé</Badge>
      case "indisponible":
        return <Badge variant="outline" className="border-red-500 text-red-500">Indisponible</Badge>
      default:
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-primary"></div>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <Avatar className="h-24 w-24 mt-2 border-2 border-primary/20">
            <AvatarImage src={artisan?.avatar} alt={artisan?.name} />
            <AvatarFallback className="text-2xl">{artisan?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold">{artisan?.name}</h2>
              {artisan?.verified && (
                <BadgeCheck className="h-5 w-5 ml-1 text-blue-500" />
              )}
            </div>
            <p className="text-muted-foreground">{artisan?.speciality}</p>
          </div>
          
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex-1 flex justify-between px-4 py-2">
                <span>Statut</span>
                <span>{getStatusBadge(artisan?.status || "")}</span>
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex-1 flex justify-between px-4 py-2">
                <span>Disponibilité</span>
                <span>{getAvailabilityBadge(artisan?.availability || "")}</span>
              </Badge>
            </div>
          </div>
          
          {/* Section de vérification */}
          <div className="border-t pt-4 w-full">
            <div className="text-sm font-medium mb-2">Statut de vérification</div>
            <Select 
              value={artisan?.verificationStatus}
              onValueChange={(value) => onUpdateVerification(value)}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Statut de vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERIFIED">
                  <div className="flex items-center">
                    <BadgeCheck className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Vérifié</span>
                  </div>
                </SelectItem>
                <SelectItem value="REJECTED">
                  <div className="flex items-center">
                    <CheckSquare className="h-4 w-4 mr-2 text-red-500" />
                    <span>Rejeté</span>
                  </div>
                </SelectItem>
                <SelectItem value="PENDING">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-amber-500" />
                    <span>En attente</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 