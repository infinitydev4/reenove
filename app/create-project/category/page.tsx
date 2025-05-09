"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Briefcase, 
  Paintbrush, 
  Hammer, 
  Wrench, 
  Zap, 
  Construction, 
  Bath, 
  DoorOpen, 
  Trees, 
  Home,
  ArrowRight,
  ChevronRight,
  ArrowLeft
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

// Liste des services par catégorie (à remplacer par des données réelles de la base de données)
const servicesByCategory = {
  plumbing: [
    { id: "plumb-install", name: "Installation de plomberie", description: "Installation de tuyauterie, robinetterie, etc." },
    { id: "plumb-repair", name: "Réparation de fuite", description: "Détection et réparation de fuites d'eau" },
    { id: "plumb-heating", name: "Installation chauffage", description: "Installation et entretien de systèmes de chauffage" },
    { id: "plumb-bathroom", name: "Plomberie salle de bain", description: "Installation de sanitaires et robinetterie" },
  ],
  electricity: [
    { id: "elec-install", name: "Installation électrique", description: "Installation de circuits électriques" },
    { id: "elec-repair", name: "Dépannage électrique", description: "Résolution de pannes électriques" },
    { id: "elec-upgrade", name: "Mise aux normes", description: "Mise en conformité des installations électriques" },
    { id: "elec-automation", name: "Domotique", description: "Installation de systèmes domotiques" },
  ],
  carpentry: [
    { id: "carp-furniture", name: "Fabrication de meubles", description: "Création de meubles sur mesure" },
    { id: "carp-doors", name: "Portes et fenêtres", description: "Installation et réparation de menuiseries" },
    { id: "carp-floor", name: "Parquet/Plancher", description: "Pose et rénovation de parquets" },
    { id: "carp-stairs", name: "Escaliers", description: "Création et rénovation d'escaliers" },
  ],
  painting: [
    { id: "paint-interior", name: "Peinture intérieure", description: "Travaux de peinture pour intérieur" },
    { id: "paint-exterior", name: "Peinture extérieure", description: "Travaux de peinture pour façades" },
    { id: "paint-decorative", name: "Peinture décorative", description: "Effets décoratifs et ornementaux" },
    { id: "paint-wallpaper", name: "Pose de papier peint", description: "Installation de papiers peints et revêtements muraux" },
  ],
  masonry: [
    { id: "masonry-walls", name: "Construction de murs", description: "Édification de murs en briques, pierres ou parpaings" },
    { id: "masonry-concrete", name: "Travaux de béton", description: "Coulage de dalles, fondations, etc." },
    { id: "masonry-tiling", name: "Carrelage", description: "Pose de carrelage au sol et aux murs" },
    { id: "masonry-restoration", name: "Restauration", description: "Restauration de maçonnerie ancienne" },
  ],
  bathroom: [
    { id: "bath-complete", name: "Rénovation complète", description: "Refonte complète de salle de bain" },
    { id: "bath-shower", name: "Installation de douche", description: "Pose de douche à l'italienne ou cabine" },
    { id: "bath-tub", name: "Installation de baignoire", description: "Pose de baignoire et spa" },
    { id: "bath-tiling", name: "Carrelage et faïence", description: "Pose de carrelage et faïence de salle de bain" },
  ],
  doors: [
    { id: "doors-entry", name: "Portes d'entrée", description: "Installation de portes d'entrée" },
    { id: "doors-interior", name: "Portes intérieures", description: "Pose de portes intérieures" },
    { id: "doors-windows", name: "Fenêtres", description: "Installation de fenêtres et baies vitrées" },
    { id: "doors-garage", name: "Portes de garage", description: "Pose de portes de garage" },
  ],
  landscaping: [
    { id: "lands-garden", name: "Aménagement jardin", description: "Création et refonte d'espaces verts" },
    { id: "lands-lawn", name: "Pelouse", description: "Installation et entretien de pelouses" },
    { id: "lands-hedge", name: "Taille de haies", description: "Entretien et taille de haies et arbustes" },
    { id: "lands-irrigation", name: "Système d'irrigation", description: "Installation de systèmes d'arrosage automatique" },
  ],
  renovation: [
    { id: "reno-complete", name: "Rénovation complète", description: "Rénovation totale d'un bien immobilier" },
    { id: "reno-kitchen", name: "Rénovation cuisine", description: "Refonte complète de cuisine" },
    { id: "reno-extension", name: "Extension", description: "Construction d'extensions de maison" },
    { id: "reno-insulation", name: "Isolation", description: "Travaux d'isolation thermique et phonique" },
  ],
  other: [
    { id: "other-consult", name: "Consultation", description: "Conseils et expertise" },
    { id: "other-custom", name: "Projet sur mesure", description: "Projets personnalisés non listés" },
  ],
}

// Catégories fictives (à remplacer par des données réelles de la base de données)
const categories = [
  { id: "plumbing", name: "Plomberie", icon: Wrench, description: "Installation, réparation et entretien de systèmes de plomberie" },
  { id: "electricity", name: "Électricité", icon: Zap, description: "Installation et dépannage électrique" },
  { id: "carpentry", name: "Menuiserie", icon: Hammer, description: "Fabrication et installation de mobilier et structures en bois" },
  { id: "painting", name: "Peinture", icon: Paintbrush, description: "Travaux de peinture intérieure et extérieure" },
  { id: "masonry", name: "Maçonnerie", icon: Construction, description: "Construction et rénovation de structures en pierre, brique ou béton" },
  { id: "bathroom", name: "Salle de bain", icon: Bath, description: "Rénovation et installation de salles de bain" },
  { id: "doors", name: "Portes et fenêtres", icon: DoorOpen, description: "Installation et réparation de portes et fenêtres" },
  { id: "landscaping", name: "Jardinage", icon: Trees, description: "Aménagement paysager et entretien d'espaces verts" },
  { id: "renovation", name: "Rénovation générale", icon: Home, description: "Rénovation complète ou partielle de bâtiments" },
  { id: "other", name: "Autre", icon: Briefcase, description: "Autres types de travaux non listés" },
]

export default function CategoryPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [showServiceSelection, setShowServiceSelection] = useState(false)
  
  useEffect(() => {
    // Récupérer les données depuis le localStorage si elles existent
    const savedProjectDetails = localStorage.getItem("projectDetails")
    if (savedProjectDetails) {
      const details = JSON.parse(savedProjectDetails)
      if (details.service) {
        setSelectedService(details.service)
      }
    }
    
    const savedCategory = localStorage.getItem("selectedCategory")
    if (savedCategory) {
      setSelectedCategory(savedCategory)
      setShowServiceSelection(true)
    }
  }, [])
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setSelectedService(null)
    setShowServiceSelection(true)
    // Sauvegarder la sélection dans le localStorage
    localStorage.setItem("selectedCategory", value)
  }

  const handleServiceChange = (value: string) => {
    setSelectedService(value)
  }
  
  const handleNextStep = () => {
    if (selectedCategory && selectedService) {
      // Sauvegarder les sélections
      localStorage.setItem("selectedCategory", selectedCategory)
      
      // Trouver le nom du service sélectionné
      let serviceName = ""
      const services = servicesByCategory[selectedCategory as keyof typeof servicesByCategory] || []
      const selectedServiceObj = services.find(s => s.id === selectedService)
      if (selectedServiceObj) {
        serviceName = selectedServiceObj.name
      }
      
      // Trouver le nom de la catégorie sélectionnée
      let categoryName = ""
      const selectedCategoryObj = categories.find(c => c.id === selectedCategory)
      if (selectedCategoryObj) {
        categoryName = selectedCategoryObj.name
      }
      
      // Sauvegarder les détails du projet
      const existingDetails = localStorage.getItem("projectDetails")
      const details = existingDetails ? JSON.parse(existingDetails) : {}
      
      // Mettre à jour les détails avec les noms ET les IDs
      details.service = serviceName
      details.serviceId = selectedService // Ajouter l'ID du service
      details.category = categoryName
      details.categoryId = selectedCategory // Ajouter l'ID de la catégorie
      
      // S'assurer que les clés sont bien présentes même avec des valeurs vides
      if (!details.title) details.title = "";
      if (!details.description) details.description = "";
      
      localStorage.setItem("projectDetails", JSON.stringify(details))
      
      // Naviguer vers l'étape suivante
      router.push("/create-project/details")
    }
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (category) {
      const IconComponent = category.icon
      return <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-primary" />
    }
    return null
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.name : ""
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    },
    exit: { opacity: 0 }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
  }

  return (
    <form id="project-form" onSubmit={(e) => { e.preventDefault(); if (selectedService) handleNextStep(); }}>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!showServiceSelection ? (
            // Vue sélection de catégorie
            <motion.div 
              key="categories" 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4 md:space-y-6"
            >
              <motion.div variants={itemVariants} className="space-y-2 md:space-y-3">
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Sélectionnez une catégorie</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  Choisissez la catégorie qui correspond le mieux à votre projet
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <RadioGroup 
                  value={selectedCategory || ""} 
                  onValueChange={handleCategoryChange}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                >
                  {categories.map((category) => (
                    <div key={category.id}>
                      <RadioGroupItem
                        value={category.id}
                        id={category.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={category.id}
                        className="flex flex-col h-full p-3 md:p-5 border-2 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02] 
                          peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 
                          transition-all duration-200 shadow-sm hover:shadow"
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="bg-primary/10 p-2 md:p-3 rounded-lg">
                            <category.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <h3 className="font-medium text-base md:text-lg">{category.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </motion.div>
            </motion.div>
          ) : (
            // Vue sélection de service
            <motion.div 
              key="services"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4 md:space-y-6"
            >
              <motion.div variants={itemVariants}>
                <button 
                  type="button"
                  onClick={() => setShowServiceSelection(false)}
                  className="flex items-center text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors group mb-4"
                >
                  <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                  Retour aux catégories
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-2 md:p-3 rounded-lg">
                    {getCategoryIcon(selectedCategory || "")}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                      Choisissez un service
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Sélectionnez le type de service dont vous avez besoin
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="border p-3 md:p-4 rounded-md bg-amber-50 dark:bg-amber-950/20 border-amber-200 mb-4">
                  <p className="text-amber-800 dark:text-amber-400 text-xs md:text-sm font-medium">
                    <strong>Catégorie sélectionnée:</strong> {getCategoryName(selectedCategory || "")}
                  </p>
                  {selectedCategory && (
                    <p className="text-amber-800 dark:text-amber-400 text-xs md:text-sm mt-1">
                      <strong>Services disponibles:</strong> {servicesByCategory[selectedCategory as keyof typeof servicesByCategory]?.length || 0}
                    </p>
                  )}
                </div>
              </motion.div>

              {selectedCategory && (
                <motion.div variants={itemVariants}>
                  <RadioGroup 
                    value={selectedService || ""} 
                    onValueChange={handleServiceChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
                  >
                    {selectedCategory && servicesByCategory[selectedCategory as keyof typeof servicesByCategory] ? (
                      servicesByCategory[selectedCategory as keyof typeof servicesByCategory].map((service) => (
                        <div key={service.id}>
                          <RadioGroupItem
                            value={service.id}
                            id={service.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={service.id}
                            className="flex h-full p-3 md:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/[0.02]
                              peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 
                              transition-all duration-200 shadow-sm hover:shadow"
                          >
                            <div className="space-y-1">
                              <h3 className="font-medium text-foreground text-sm md:text-base">{service.name}</h3>
                              <p className="text-xs md:text-sm text-muted-foreground">{service.description}</p>
                            </div>
                          </Label>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 p-4 md:p-6 border rounded-md bg-gray-50 dark:bg-gray-800/50 text-center">
                        <p className="text-foreground text-sm">Aucun service disponible pour cette catégorie</p>
                      </div>
                    )}
                  </RadioGroup>
                </motion.div>
              )}

              <motion.div
                variants={itemVariants}
                className="pt-4 md:pt-6 flex flex-col sm:flex-row gap-3 sm:justify-between hidden sm:flex"
              >              
                <Button
                  type="submit"
                  disabled={!selectedService}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 py-5 md:py-6 px-6 md:px-8 rounded-xl text-sm md:text-base"
                  size="lg"
                >
                  Continuer
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
} 