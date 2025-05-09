import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export function ArtisanLoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Skeleton className="h-8 w-48" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg lg:col-span-2" />
      </div>
      
      <Skeleton className="h-[350px] rounded-lg w-full" />
      
      <div>
        <Skeleton className="h-10 w-64 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
          <Skeleton className="h-36 rounded-lg" />
        </div>
      </div>
      
      <div>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-[400px] rounded-lg w-full" />
      </div>
    </div>
  )
} 