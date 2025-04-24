"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ThumbsUp } from "lucide-react"

interface Review {
  id: string
  name: string
  avatar: string
  rating: number
  date: string
  comment: string
  project: string
  helpful: number
}

interface ArtisanReviewCardProps {
  review: Review
}

export default function ArtisanReviewCard({ review }: ArtisanReviewCardProps) {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful)
  const [hasVoted, setHasVoted] = useState(false)

  const handleHelpfulClick = () => {
    if (!hasVoted) {
      setHelpfulCount(helpfulCount + 1)
      setHasVoted(true)
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} />
            <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-medium">{review.name}</h3>
              <span className="text-sm text-muted-foreground">{review.date}</span>
            </div>

            <div className="flex items-center my-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">Projet: {review.project}</span>
            </div>

            <p className="text-sm mt-2">{review.comment}</p>

            <div className="flex items-center justify-end mt-3">
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs ${hasVoted ? "text-primary" : "text-muted-foreground"}`}
                onClick={handleHelpfulClick}
                disabled={hasVoted}
              >
                <ThumbsUp className={`h-3.5 w-3.5 mr-1 ${hasVoted ? "fill-primary" : ""}`} />
                Utile ({helpfulCount})
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
