import Link from "next/link"
import { ArrowLeft, MessageSquare, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"

type ArtisanHeaderProps = {
  artisanName: string
}

export function ArtisanHeader({ artisanName }: ArtisanHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center gap-2">
        <Link href="/admin/artisans">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold tracking-tight">
          {artisanName ? `${artisanName}` : "Détails de l'artisan"}
        </h1>
      </div>
      
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          Message
        </Button>
        <Button variant="outline" size="sm">
          <Phone className="mr-2 h-4 w-4" />
          Appeler
        </Button>
        <Button size="sm">
          <User className="mr-2 h-4 w-4" />
          Éditer
        </Button>
      </div>
    </div>
  )
} 