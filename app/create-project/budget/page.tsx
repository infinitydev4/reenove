"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Euro, ChevronUp, ChevronDown, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"

export default function BudgetPage() {
  const router = useRouter()
  const [budgetType, setBudgetType] = useState<string>("fixed")
  const [budget, setBudget] = useState<string>("")
  const [budgetMax, setBudgetMax] = useState<string>("")
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem("projectBudget")
    if (savedData) {
      try {
        const { budgetType, budget, budgetMax } = JSON.parse(savedData)
        setBudgetType(budgetType || "fixed")
        setBudget(budget?.toString() || "")
        setBudgetMax(budgetMax?.toString() || "")
      } catch (error) {
        console.error("Erreur lors de la récupération du budget:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Valider le formulaire selon le type de budget
    if (budgetType === "fixed" || budgetType === "hourly") {
      setIsFormValid(!!budget && !isNaN(Number(budget)) && Number(budget) > 0)
    } else if (budgetType === "range") {
      const budgetValue = Number(budget)
      const budgetMaxValue = Number(budgetMax)
      setIsFormValid(
        !!budget && 
        !!budgetMax && 
        !isNaN(budgetValue) && 
        !isNaN(budgetMaxValue) && 
        budgetValue > 0 && 
        budgetMaxValue > budgetValue
      )
    }
  }, [budgetType, budget, budgetMax])

  const saveAndContinue = () => {
    if (!isFormValid) return

    setIsSubmitting(true)

    try {
      // Sauvegarder les données
      localStorage.setItem(
        "projectBudget",
        JSON.stringify({
          budgetType,
          budget: Number(budget),
          budgetMax: budgetType === "range" ? Number(budgetMax) : null,
        })
      )

      // Naviguer vers l'étape suivante
      router.push("/create-project/location")
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du budget:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatBudget = (value: string) => {
    // Supprimer les caractères non numériques sauf le point
    return value.replace(/[^\d.]/g, "")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3
      },
    },
    exit: { opacity: 0 }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    }
  }

  return (
    <form id="project-form" onSubmit={(e) => { e.preventDefault(); saveAndContinue(); }}>
      <div className="space-y-2 md:space-y-6">
        <PageHeader
          title="Budget de votre projet"
          description="Indiquez votre budget pour des propositions adaptées"
          className="mb-2 md:mb-6"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-2 md:space-y-6"
        >
          <motion.div variants={itemVariants} className="space-y-1.5 md:space-y-4">
            <Label className="text-xs md:text-lg font-medium">Type de budget</Label>
            <RadioGroup 
              value={budgetType} 
              onValueChange={setBudgetType} 
              className="grid grid-cols-3 md:grid-cols-3 gap-1.5 md:gap-4"
            >
              <Card className={`border-2 cursor-pointer ${budgetType === "fixed" ? "border-primary" : "border-border"}`}>
                <CardContent className="py-2 px-1 md:pt-6 md:px-4 md:pb-4">
                  <div className="flex flex-col items-center text-center space-y-0.5 md:space-y-2">
                    <Euro className="h-4 w-4 md:h-8 md:w-8 text-primary" />
                    <Label htmlFor="fixed" className="text-xs md:text-lg font-medium">Budget fixe</Label>
                    <p className="text-[9px] md:text-sm text-muted-foreground leading-tight">Budget exact</p>
                    <RadioGroupItem value="fixed" id="fixed" className="sr-only" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 cursor-pointer ${budgetType === "range" ? "border-primary" : "border-border"}`}>
                <CardContent className="py-2 px-1 md:pt-6 md:px-4 md:pb-4">
                  <div className="flex flex-col items-center text-center space-y-0.5 md:space-y-2">
                    <div className="flex">
                      <ChevronDown className="h-4 w-4 md:h-8 md:w-8 text-primary" />
                      <ChevronUp className="h-4 w-4 md:h-8 md:w-8 text-primary" />
                    </div>
                    <Label htmlFor="range" className="text-xs md:text-lg font-medium">Fourchette</Label>
                    <p className="text-[9px] md:text-sm text-muted-foreground leading-tight">Min-max</p>
                    <RadioGroupItem value="range" id="range" className="sr-only" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className={`border-2 cursor-pointer ${budgetType === "hourly" ? "border-primary" : "border-border"}`}>
                <CardContent className="py-2 px-1 md:pt-6 md:px-4 md:pb-4">
                  <div className="flex flex-col items-center text-center space-y-0.5 md:space-y-2">
                    <Clock className="h-4 w-4 md:h-8 md:w-8 text-primary" />
                    <Label htmlFor="hourly" className="text-xs md:text-lg font-medium">Taux horaire</Label>
                    <p className="text-[9px] md:text-sm text-muted-foreground leading-tight">À l&apos;heure</p>
                    <RadioGroupItem value="hourly" id="hourly" className="sr-only" />
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 md:space-y-4">
            {budgetType === "fixed" && (
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="budget-fixed" className="text-xs md:text-lg font-medium">
                  Montant
                </Label>
                <div className="relative">
                  <Input
                    id="budget-fixed"
                    type="text"
                    placeholder="Entrez votre budget"
                    value={budget}
                    onChange={(e) => setBudget(formatBudget(e.target.value))}
                    className="pl-6 pr-9 md:pl-8 md:pr-12 text-sm md:text-lg py-1 md:py-2"
                  />
                  <div className="absolute inset-y-0 left-1.5 md:left-3 flex items-center pointer-events-none">
                    <Euro className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </div>
                  <div className="absolute inset-y-0 right-1.5 md:right-3 flex items-center pointer-events-none">
                    <span className="text-[9px] md:text-sm text-muted-foreground">EUR</span>
                  </div>
                </div>
                <p className="text-[9px] md:text-xs text-muted-foreground">
                  Le budget aide à recevoir des devis adaptés
                </p>
              </div>
            )}

            {budgetType === "range" && (
              <div className="space-y-1.5 md:space-y-4">
                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="budget-min" className="text-xs md:text-lg font-medium">
                    Budget minimum
                  </Label>
                  <div className="relative">
                    <Input
                      id="budget-min"
                      type="text"
                      placeholder="Montant minimum"
                      value={budget}
                      onChange={(e) => setBudget(formatBudget(e.target.value))}
                      className="pl-6 pr-9 md:pl-8 md:pr-12 text-sm md:text-lg py-1 md:py-2"
                    />
                    <div className="absolute inset-y-0 left-1.5 md:left-3 flex items-center pointer-events-none">
                      <Euro className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-y-0 right-1.5 md:right-3 flex items-center pointer-events-none">
                      <span className="text-[9px] md:text-sm text-muted-foreground">EUR</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 md:space-y-2">
                  <Label htmlFor="budget-max" className="text-xs md:text-lg font-medium">
                    Budget maximum
                  </Label>
                  <div className="relative">
                    <Input
                      id="budget-max"
                      type="text"
                      placeholder="Montant maximum"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(formatBudget(e.target.value))}
                      className="pl-6 pr-9 md:pl-8 md:pr-12 text-sm md:text-lg py-1 md:py-2"
                    />
                    <div className="absolute inset-y-0 left-1.5 md:left-3 flex items-center pointer-events-none">
                      <Euro className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </div>
                    <div className="absolute inset-y-0 right-1.5 md:right-3 flex items-center pointer-events-none">
                      <span className="text-[9px] md:text-sm text-muted-foreground">EUR</span>
                    </div>
                  </div>
                </div>
                
                {Number(budget) > 0 && Number(budgetMax) > 0 && (
                  <p className="text-[9px] md:text-sm">
                    Fourchette: <span className="font-medium">{Number(budget).toLocaleString('fr-FR')} € - {Number(budgetMax).toLocaleString('fr-FR')} €</span>
                  </p>
                )}
              </div>
            )}

            {budgetType === "hourly" && (
              <div className="space-y-1 md:space-y-2">
                <Label htmlFor="budget-hourly" className="text-xs md:text-lg font-medium">
                  Taux horaire
                </Label>
                <div className="relative">
                  <Input
                    id="budget-hourly"
                    type="text"
                    placeholder="Taux horaire"
                    value={budget}
                    onChange={(e) => setBudget(formatBudget(e.target.value))}
                    className="pl-6 pr-9 md:pl-8 md:pr-12 text-sm md:text-lg py-1 md:py-2"
                  />
                  <div className="absolute inset-y-0 left-1.5 md:left-3 flex items-center pointer-events-none">
                    <Euro className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </div>
                  <div className="absolute inset-y-0 right-1.5 md:right-3 flex items-center pointer-events-none">
                    <span className="text-[9px] md:text-sm text-muted-foreground">/h</span>
                  </div>
                </div>
                <p className="text-[9px] md:text-xs text-muted-foreground">
                  Indiquez le taux horaire souhaité
                </p>
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="pt-1 md:pt-4">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
              <CardContent className="p-1.5 md:p-4">
                <p className="text-[9px] md:text-sm text-blue-800 dark:text-blue-300">
                  <strong>Conseil :</strong> Un budget réaliste augmente vos chances de recevoir des devis pertinents.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-between pt-2 md:pt-6 hidden sm:flex"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/create-project/details")}
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
      </div>
    </form>
  )
} 