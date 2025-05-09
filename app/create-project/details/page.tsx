"use client"

import { useState, useEffect, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Upload, X, ImageIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"
import { UploadForm } from "@/components/project/upload-form"

// Services fictifs (normalement récupérés depuis la base de données en fonction de la catégorie)
const services = {
  plumbing: [
    { id: "plumb-install", name: "Installation de plomberie" },
    { id: "plumb-repair", name: "Réparation de fuite" },
    { id: "plumb-heating", name: "Installation chauffage" },
    { id: "plumb-bathroom", name: "Plomberie salle de bain" },
  ],
  electricity: [
    { id: "elec-install", name: "Installation électrique" },
    { id: "elec-repair", name: "Dépannage électrique" },
    { id: "elec-upgrade", name: "Mise aux normes" },
    { id: "elec-automation", name: "Domotique" },
  ],
  carpentry: [
    { id: "carp-furniture", name: "Fabrication de meubles" },
    { id: "carp-doors", name: "Portes et fenêtres" },
    { id: "carp-floor", name: "Parquet/Plancher" },
    { id: "carp-stairs", name: "Escaliers" },
  ],
  // Autres catégories avec leurs services respectifs...
}

// Type pour le formulaire
interface ProjectDetails {
  title: string
  description: string
  photos: string[]
}

export default function DetailsPage() {
  const router = useRouter()
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectPhotos, setProjectPhotos] = useState<string[]>([])
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem("projectDetails")
    if (savedData) {
      try {
        const details: ProjectDetails = JSON.parse(savedData)
        setProjectTitle(details.title || "")
        setProjectDescription(details.description || "")
        setProjectPhotos(details.photos || [])
      } catch (error) {
        console.error("Erreur lors du chargement des détails:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Valider le formulaire
    setIsFormValid(
      projectTitle.trim().length >= 3 && 
      projectDescription.trim().length >= 10
    )
  }, [projectTitle, projectDescription])

  const handleUploadComplete = (urls: string[]) => {
    setProjectPhotos(urls)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    saveAndContinue()
  }

  const saveAndContinue = () => {
    if (!isFormValid) return
    
    setIsSubmitting(true)
    
    try {
      // Récupérer les détails existants pour ne pas perdre les données de catégorie et service
      const existingData = localStorage.getItem("projectDetails")
      let details = {}
      
      if (existingData) {
        try {
          details = JSON.parse(existingData)
        } catch (error) {
          console.error("Erreur lors de la récupération des données existantes:", error)
        }
      }
      
      // Mettre à jour avec les nouvelles informations
      details = {
        ...details, // Conserver les données existantes (notamment catégorie et service)
        title: projectTitle,
        description: projectDescription,
        photos: projectPhotos, // Ajouter les URLs des photos téléchargées
      }
      
      // Sauvegarder les données
      localStorage.setItem("projectDetails", JSON.stringify(details))
      
      toast.success("Les détails de votre projet ont été enregistrés avec succès.")
      
      // Naviguer vers l'étape suivante
      router.push("/create-project/budget")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des détails:", error)
      toast.error("Une erreur s'est produite lors de la sauvegarde des détails.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="space-y-3 md:space-y-6">
      <PageHeader
        title="Détails de votre projet"
        description="Décrivez votre projet pour obtenir les meilleures propositions"
        className="mb-3 md:mb-6"
      />

      <form id="project-form" onSubmit={handleSubmit}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3 md:space-y-6"
        >
          <motion.div variants={itemVariants} className="space-y-1.5 md:space-y-2">
            <h3 className="text-sm md:text-lg font-medium">
              Photos du projet
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Ajoutez jusqu&apos;à 6 photos pour illustrer votre projet.
            </p>
            <UploadForm 
              maxFiles={6} 
              onUploadComplete={handleUploadComplete}
            />
            <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
              Formats: JPG, PNG (max 5Mo)
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1.5 md:space-y-2">
            <label htmlFor="title" className="text-sm md:text-lg font-medium">
              Titre du projet
            </label>
            <Input
              id="title"
              placeholder="Ex: Rénovation de salle de bain"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full p-2 text-sm"
            />
            {projectTitle && projectTitle.length < 3 && (
              <p className="text-[10px] md:text-xs text-destructive">Le titre doit comporter au moins 3 caractères</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-1.5 md:space-y-2">
            <label htmlFor="description" className="text-sm md:text-lg font-medium">
              Description détaillée
            </label>
            <Textarea
              id="description"
              placeholder="Décrivez votre projet: dimensions, matériaux souhaités..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full min-h-[80px] md:min-h-[200px] p-2 text-sm"
            />
            <p className={`text-[10px] md:text-xs ${
              projectDescription.length < 10 ? "text-destructive" : "text-muted-foreground"
            }`}>
              {projectDescription.length < 10
                ? `Minimum 10 caractères (${projectDescription.length}/10)`
                : `${projectDescription.length} caractères`}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-between pt-3 md:pt-6 hidden sm:flex"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/create-project/category")}
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              Précédent
            </Button>
            
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2"
              size="sm"
            >
              {isSubmitting ? "Enregistrement..." : "Suivant"}
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  )
} 