import Image from "next/image"
import Link from "next/link"
import { MapPin, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ArtisanCardProps {
  name: string
  profession: string
  rating: number
  reviews: number
  image: string
  location: string
  className?: string
}

export default function ArtisanCard({
  name,
  profession,
  rating,
  reviews,
  image,
  location,
  className
}: ArtisanCardProps) {
  return (
    <div className={cn(
      "relative group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-[#FCDA89]/5",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0E261C] via-transparent to-transparent opacity-70"></div>
      
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#0E261C] to-transparent">
        <div className="flex items-center text-white/80 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1 text-[#FCDA89]" />
          <span>{location}</span>
          <div className="ml-auto flex items-center">
            <Star className="h-4 w-4 mr-1 text-[#FCDA89] fill-[#FCDA89]" />
            <span>{rating}</span>
            <span className="ml-1 text-white/60">({reviews})</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
        <p className="text-[#FCDA89] font-medium mb-4">{profession}</p>
        
        <Button variant="gold" size="sm" className="w-full rounded-lg" asChild>
          <Link href={`/artisans/${name.toLowerCase().replace(/\s+/g, "-")}`}>
            Voir le profil
          </Link>
        </Button>
      </div>
    </div>
  )
}
