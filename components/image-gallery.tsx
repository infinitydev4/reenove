"use client"

import Image from "next/image"

const images = [
  {
    src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070",
    alt: "Rénovation moderne d'une cuisine",
    width: 800,
    height: 600,
  },
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2032",
    alt: "Salon rénové avec style contemporain",
    width: 800,
    height: 600,
  },
  {
    src: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=2027",
    alt: "Salle de bain design",
    width: 800,
    height: 600,
  },
  {
    src: "https://images.unsplash.com/photo-1618219740975-d40978bb7378?q=80&w=2027",
    alt: "Chambre moderne",
    width: 800,
    height: 600,
  },
]

export function ImageGallery() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {images.map((image, index) => (
        <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ))}
    </div>
  )
} 