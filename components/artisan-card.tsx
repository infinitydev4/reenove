import Link from "next/link"
import Image from "next/image"
import { MapPin, Star } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ArtisanCardProps {
  name: string
  profession: string
  rating: number
  reviews: number
  image: string
  location: string
}

export default function ArtisanCard({ name, profession, rating, reviews, image, location }: ArtisanCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square relative">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{name}</h3>
            <p className="text-gray-500">{profession}</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
            <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
            <span className="text-sm text-yellow-500 font-medium">{rating}</span>
          </div>
        </div>
        <div className="flex items-center mt-2 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {location}
        </div>
        <p className="text-sm text-gray-500 mt-1">{reviews} avis</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button variant="outline" className="w-full" asChild>
          <Link href={`/artisans/${name.toLowerCase().replace(/\s+/g, "-")}`}>Profil</Link>
        </Button>
        <Button className="w-full" asChild>
          <Link href={`/contact/${name.toLowerCase().replace(/\s+/g, "-")}`}>Contacter</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
