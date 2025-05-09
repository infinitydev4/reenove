import { Building, ExternalLink, Mail, MapPin, UserCircle, Pencil, Badge as BadgeIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ArtisanDetailsCardProps = {
  artisan: {
    email: string
    phone: string
    address: string
    city?: string
    postalCode?: string
    siret?: string
  }
}

export function ArtisanDetailsCard({ artisan }: ArtisanDetailsCardProps) {
  return (
    <Card className="lg:col-span-2 overflow-hidden relative">
      <div className="h-1.5 bg-primary/70"></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center">
            <UserCircle className="mr-2 h-6 w-6 text-primary" />
            Informations personnelles
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 absolute top-4 right-4">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          Coordonnées et informations détaillées
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colonne gauche */}
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Contact
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Email</span>
                  <span className="text-sm font-medium break-all">{artisan?.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Téléphone</span>
                  <span className="text-sm font-medium">{artisan?.phone}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                <Building className="h-4 w-4 mr-2" />
                Entreprise
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Nom</span>
                  <span className="text-sm font-medium">SARL {artisan?.email?.split('@')[0]}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">SIRET</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium tracking-wide font-mono">{artisan?.siret || "Non renseigné"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Colonne droite */}
          <div className="space-y-5">
            <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md relative">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Adresse
                </h3>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 absolute top-3 right-3 text-primary hover:text-primary-focus hover:bg-primary/10"
                  title="Voir sur la carte"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Rue</span>
                  <span className="text-sm font-medium">{artisan?.address}</span>
                </div>
                <div className="flex flex-row gap-3">
                  <div className="flex flex-col flex-1">
                    <span className="text-xs text-muted-foreground">Code postal</span>
                    <span className="text-sm font-medium">{artisan?.postalCode || "Non renseigné"}</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-xs text-muted-foreground">Ville</span>
                    <span className="text-sm font-medium">{artisan?.city || "Non renseignée"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 transform transition-transform hover:scale-[1.01] hover:shadow-md">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
                <BadgeIcon className="h-4 w-4 mr-2" />
                Certifications
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Assurance</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Valide jusqu&apos;au 15/01/2024</span>
                    <Badge className="ml-2 bg-green-500 text-[10px] py-0 px-2">Active</Badge>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Qualifications</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] border-primary text-primary">RGE</Badge>
                    <Badge variant="outline" className="text-[10px] border-primary text-primary">Qualibat</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 