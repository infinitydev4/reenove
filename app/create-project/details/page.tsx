"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, ArrowRight, Save } from "lucide-react"
import { PageHeader } from "@/components/page-header"
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
  service: string
  description: string
  propertyType: string
}

export default function DetailsPage() {
  const router = useRouter()
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem("projectDetails")
    if (savedData) {
      const { title, description } = JSON.parse(savedData)
      setProjectTitle(title || "")
      setProjectDescription(description || "")
    }
  }, [])

  useEffect(() => {
    // Valider le formulaire
    setIsFormValid(projectTitle.trim().length > 0 && projectDescription.trim().length >= 10)
  }, [projectTitle, projectDescription])

  const saveAndContinue = () => {
    if (!isFormValid) return
    
    // Récupérer les détails existants pour ne pas perdre les données de catégorie et service
    const existingData = localStorage.getItem("projectDetails")
    let details = {}
    
    if (existingData) {
      try {
        details = JSON.parse(existingData)
        console.log("Données existantes récupérées:", details)
      } catch (error) {
        console.error("Erreur lors de la récupération des données existantes:", error)
      }
    }
    
    // Récupérer les informations des photos
    // Note: Nous supposons ici que le composant UploadForm stocke ses données dans le DOM
    // En pratique, il faudrait adapter le composant UploadForm pour qu'il expose ses données
    // via un état React ou utiliser un état dans ce composant pour gérer les photos
    
    // Mettre à jour avec les nouvelles informations
    details = {
      ...details, // Conserver les données existantes (notamment catégorie et service)
      title: projectTitle,
      description: projectDescription,
      // Les photos seraient ajoutées ici dans une implémentation complète
    }
    
    console.log("Données à sauvegarder:", details)
    
    // Sauvegarder les données
    localStorage.setItem("projectDetails", JSON.stringify(details))
    
    // Naviguer vers l'étape suivante
    router.push("/create-project/budget")
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
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Détails de votre projet"
        description="Décrivez précisément votre projet pour obtenir les meilleures propositions d'artisans"
        className="mb-8"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <h3 className="text-lg font-medium">
            Photos du projet
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ajoutez jusqu'à 6 photos pour mieux illustrer votre projet et aider les artisans à comprendre vos besoins.
          </p>
          <UploadForm maxFiles={6} />
          <p className="text-sm text-muted-foreground mt-2">
            Les photos doivent être au format JPG, JPEG ou PNG et ne pas dépasser 5Mo chacune.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label htmlFor="title" className="text-lg font-medium">
            Titre du projet
          </label>
          <Input
            id="title"
            placeholder="Ex: Rénovation de salle de bain"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full p-3 text-base"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label htmlFor="description" className="text-lg font-medium">
            Description détaillée
          </label>
          <Textarea
            id="description"
            placeholder="Décrivez votre projet en détail : dimensions, matériaux souhaités, préférences particulières..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full min-h-[200px] p-3 text-base"
          />
          <p className="text-sm text-muted-foreground">
            {projectDescription.length < 10
              ? `Minimum 10 caractères (${projectDescription.length}/10)`
              : `${projectDescription.length} caractères`}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-between pt-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/create-project/category")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <Button
            onClick={saveAndContinue}
            disabled={!isFormValid}
            className="flex items-center gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
} 