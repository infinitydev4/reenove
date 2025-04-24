"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Project {
  id: string
  title: string
  description: string
  image: string
  category: string
}

interface ArtisanGalleryProps {
  projects: Project[]
}

export default function ArtisanGallery({ projects }: ArtisanGalleryProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Extraire les catégories uniques
  const categories = Array.from(new Set(projects.map((project) => project.category)))

  // Filtrer les projets selon la catégorie active
  const filteredProjects = activeFilter ? projects.filter((project) => project.category === activeFilter) : projects

  // Trouver l'index du projet sélectionné dans la liste filtrée
  const selectedIndex = selectedProject ? filteredProjects.findIndex((p) => p.id === selectedProject.id) : -1

  // Navigation dans la galerie
  const showPrevious = () => {
    if (selectedIndex > 0) {
      setSelectedProject(filteredProjects[selectedIndex - 1])
    } else {
      setSelectedProject(filteredProjects[filteredProjects.length - 1])
    }
  }

  const showNext = () => {
    if (selectedIndex < filteredProjects.length - 1) {
      setSelectedProject(filteredProjects[selectedIndex + 1])
    } else {
      setSelectedProject(filteredProjects[0])
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtres de catégories */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={activeFilter === null ? "default" : "outline"} size="sm" onClick={() => setActiveFilter(null)}>
          Tous
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={activeFilter === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Grille de projets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group relative aspect-square overflow-hidden rounded-md cursor-pointer"
            onClick={() => setSelectedProject(project)}
          >
            <Image
              src={project.image || "/placeholder.svg"}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <Badge className="self-start mb-1">{project.category}</Badge>
              <h3 className="text-white font-medium">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de visualisation */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="relative aspect-video md:aspect-[16/9] w-full">
            {selectedProject && (
              <Image
                src={selectedProject.image || "/placeholder.svg"}
                alt={selectedProject.title}
                fill
                className="object-cover"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={() => setSelectedProject(null)}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {selectedProject && (
                <>
                  <Badge className="mb-2">{selectedProject.category}</Badge>
                  <h2 className="text-xl font-bold text-white">{selectedProject.title}</h2>
                  <p className="text-white/80 text-sm mt-1">{selectedProject.description}</p>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={showPrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={showNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
