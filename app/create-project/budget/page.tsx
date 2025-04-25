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

  useEffect(() => {
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
        title="Budget de votre projet"
        description="Indiquez votre budget pour permettre aux artisans de vous faire des propositions adaptées"
        className="mb-8"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="space-y-4">
          <Label className="text-lg font-medium">Type de budget</Label>
          <RadioGroup 
            value={budgetType} 
            onValueChange={setBudgetType} 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className={`border-2 cursor-pointer ${budgetType === "fixed" ? "border-primary" : "border-border"}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Euro className="h-8 w-8 text-primary" />
                  <Label htmlFor="fixed" className="text-lg font-medium">Budget fixe</Label>
                  <p className="text-sm text-muted-foreground">Vous connaissez le montant exact de votre budget</p>
                  <RadioGroupItem value="fixed" id="fixed" className="sr-only" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border-2 cursor-pointer ${budgetType === "range" ? "border-primary" : "border-border"}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="flex">
                    <ChevronDown className="h-8 w-8 text-primary" />
                    <ChevronUp className="h-8 w-8 text-primary" />
                  </div>
                  <Label htmlFor="range" className="text-lg font-medium">Fourchette</Label>
                  <p className="text-sm text-muted-foreground">Vous avez une fourchette de budget min-max</p>
                  <RadioGroupItem value="range" id="range" className="sr-only" />
                </div>
              </CardContent>
            </Card>
            
            <Card className={`border-2 cursor-pointer ${budgetType === "hourly" ? "border-primary" : "border-border"}`}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Clock className="h-8 w-8 text-primary" />
                  <Label htmlFor="hourly" className="text-lg font-medium">Taux horaire</Label>
                  <p className="text-sm text-muted-foreground">Vous préférez payer à l'heure</p>
                  <RadioGroupItem value="hourly" id="hourly" className="sr-only" />
                </div>
              </CardContent>
            </Card>
          </RadioGroup>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          {budgetType === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="budget-fixed" className="text-lg font-medium">
                Montant du budget
              </Label>
              <div className="relative">
                <Input
                  id="budget-fixed"
                  type="text"
                  placeholder="Entrez votre budget"
                  value={budget}
                  onChange={(e) => setBudget(formatBudget(e.target.value))}
                  className="pl-8 pr-12 text-lg"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">EUR</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Le budget est indicatif et vous aidera à recevoir des devis adaptés
              </p>
            </div>
          )}

          {budgetType === "range" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget-min" className="text-lg font-medium">
                  Budget minimum
                </Label>
                <div className="relative">
                  <Input
                    id="budget-min"
                    type="text"
                    placeholder="Montant minimum"
                    value={budget}
                    onChange={(e) => setBudget(formatBudget(e.target.value))}
                    className="pl-8 pr-12 text-lg"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">EUR</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-max" className="text-lg font-medium">
                  Budget maximum
                </Label>
                <div className="relative">
                  <Input
                    id="budget-max"
                    type="text"
                    placeholder="Montant maximum"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(formatBudget(e.target.value))}
                    className="pl-8 pr-12 text-lg"
                  />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground">EUR</span>
                  </div>
                </div>
              </div>
              
              {Number(budget) > 0 && Number(budgetMax) > 0 && (
                <p className="text-sm">
                  Votre fourchette de budget: <span className="font-medium">{Number(budget).toLocaleString('fr-FR')} € - {Number(budgetMax).toLocaleString('fr-FR')} €</span>
                </p>
              )}
            </div>
          )}

          {budgetType === "hourly" && (
            <div className="space-y-2">
              <Label htmlFor="budget-hourly" className="text-lg font-medium">
                Taux horaire
              </Label>
              <div className="relative">
                <Input
                  id="budget-hourly"
                  type="text"
                  placeholder="Taux horaire"
                  value={budget}
                  onChange={(e) => setBudget(formatBudget(e.target.value))}
                  className="pl-8 pr-12 text-lg"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                  <span className="text-muted-foreground">/h</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Indiquez le taux horaire que vous êtes prêt à payer
              </p>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
            <CardContent className="p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Conseil :</strong> Définir un budget réaliste augmente vos chances de recevoir des devis pertinents et compétitifs.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-between pt-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/create-project/details")}
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