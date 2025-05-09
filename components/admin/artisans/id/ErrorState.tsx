import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ErrorStateProps = {
  message: string
  onRetry?: () => void
}

export function ArtisanErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="space-y-6">
      <Link href="/admin/artisans">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
        </Button>
      </Link>
      
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-40 flex-col gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <p className="text-red-600 dark:text-red-400 font-medium text-lg text-center">{message}</p>
            {onRetry && (
              <Button onClick={onRetry} className="mt-2">
                Réessayer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 