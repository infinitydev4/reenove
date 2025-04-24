import Link from "next/link"
import { Hammer, Wrench, Zap, Paintbrush, Shovel } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CategoryCardProps {
  icon: string
  title: string
  count: number
}

export default function CategoryCard({ icon, title, count }: CategoryCardProps) {
  const getIcon = (): JSX.Element => {
    switch (icon) {
      case "hammer":
        return <Hammer className="h-6 w-6" />
      case "wrench":
        return <Wrench className="h-6 w-6" />
      case "zap":
        return <Zap className="h-6 w-6" />
      case "paintbrush":
        return <Paintbrush className="h-6 w-6" />
      case "brick-wall":
        return (
          <div className="h-6 w-6 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-current rounded-sm" />
            ))}
          </div>
        )
      case "garden":
        return <Shovel className="h-6 w-6" />
      default:
        return <Hammer className="h-6 w-6" />
    }
  }

  return (
    <Link href={`/categories/${title.toLowerCase()}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
            {getIcon()}
          </div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">{count} artisans</p>
        </CardContent>
      </Card>
    </Link>
  )
}
