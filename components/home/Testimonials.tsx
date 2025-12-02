"use client"

import { useEffect, useState } from "react"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

interface Testimonial {
  id: string
  firstName: string
  lastName: string
  companyName: string | null
  role: string | null
  rating: number
  comment: string
  avatarUrl: string | null
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des témoignages:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="w-full py-20 bg-[#0E261C] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#FCDA89]/5 to-transparent opacity-50"></div>
        <div className="container px-4 md:px-6 relative z-10 mx-auto">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-white/10 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-white/10 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="h-32 bg-white/10 rounded mb-4 animate-pulse"></div>
                <div className="h-6 w-32 bg-white/10 rounded mb-2 animate-pulse"></div>
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <section className="w-full py-20 bg-[#0E261C] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#FCDA89]/5 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-t from-[#FCDA89]/5 to-transparent opacity-30"></div>
      
      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ce que nos clients disent de nous
          </h2>
          <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients satisfaits qui ont fait confiance à Reenove pour leurs projets de rénovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-16 h-16 text-[#FCDA89]" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4 relative z-10">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star 
                    key={i} 
                    className="w-5 h-5 fill-[#FCDA89] text-[#FCDA89]" 
                  />
                ))}
                {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                  <Star 
                    key={`empty-${i}`} 
                    className="w-5 h-5 text-white/30" 
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-white/80 mb-6 italic relative z-10 min-h-[80px]">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                {testimonial.avatarUrl ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#FCDA89]/20">
                    <Image 
                      src={testimonial.avatarUrl} 
                      alt={`${testimonial.firstName} ${testimonial.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#FCDA89]/20 flex items-center justify-center ring-2 ring-[#FCDA89]/20">
                    <span className="text-lg font-semibold text-[#FCDA89]">
                      {testimonial.firstName[0]}{testimonial.lastName[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">
                    {testimonial.firstName} {testimonial.lastName}
                  </p>
                  {testimonial.role && testimonial.companyName ? (
                    <p className="text-sm text-white/70">
                      {testimonial.role} • {testimonial.companyName}
                    </p>
                  ) : testimonial.role ? (
                    <p className="text-sm text-white/70">
                      {testimonial.role}
                    </p>
                  ) : testimonial.companyName ? (
                    <p className="text-sm text-white/70">
                      {testimonial.companyName}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

