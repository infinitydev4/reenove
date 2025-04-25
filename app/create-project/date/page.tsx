"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function DatePage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [urgency, setUrgency] = useState("NORMAL")
  const [timeFrame, setTimeFrame] = useState("flexible")
  const [isFormValid, setIsFormValid] = useState(false)

  // Dates minimales (aujourd'hui + 2 jours pour laisser le temps aux artisans de répondre)
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 2)

  useEffect(() => {
    // Récupérer les données sauvegardées si elles existent
    const savedData = localStorage.getItem("projectDate")
    if (savedData) {
      const { startDate, endDate, urgency, timeFrame } = JSON.parse(savedData)
      if (startDate) setStartDate(new Date(startDate))
      if (endDate) setEndDate(new Date(endDate))
      setUrgency(urgency || "NORMAL")
      setTimeFrame(timeFrame || "flexible")
    }
  }, [])

  useEffect(() => {
    // Valider le formulaire
    let valid = true
    
    // Si timeFrame est "specific", on a besoin d'une date de début et de fin
    if (timeFrame === "specific") {
      valid = !!startDate && !!endDate && startDate <= endDate
    } else {
      // Pour "flexible" et "asap", on a juste besoin d'une date de début
      valid = !!startDate
    }
    
    setIsFormValid(valid)
  }, [startDate, endDate, timeFrame])

  const saveAndContinue = () => {
    if (!isFormValid) return
    
    // Sauvegarder les données
    localStorage.setItem(
      "projectDate",
      JSON.stringify({
        startDate,
        endDate,
        urgency,
        timeFrame,
        preferredTime: "any" // Valeur par défaut pour le moment
      })
    )
    
    // Naviguer vers l'étape suivante (révision)
    router.push("/create-project/review")
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Planification du projet</h1>
        <p className="text-muted-foreground mt-2">
          Indiquez quand vous souhaitez réaliser votre projet
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <div className="space-y-3 mb-6">
            <Label htmlFor="timeFrame" className="text-lg">
              Cadre temporel
            </Label>
            <RadioGroup
              value={timeFrame}
              onValueChange={setTimeFrame}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <Card className={`cursor-pointer border-2 transition-all ${
                timeFrame === "flexible" ? "border-primary" : "border-border"
              }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CalendarIcon className="h-10 w-10 mb-4 text-primary" />
                    <Label htmlFor="flexible" className="text-lg font-medium mb-2">
                      Flexible
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Date de début souhaitée, planning flexible
                    </p>
                    <RadioGroupItem
                      value="flexible"
                      id="flexible"
                      className="sr-only"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                timeFrame === "specific" ? "border-primary" : "border-border"
              }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CalendarIcon className="h-10 w-10 mb-4 text-primary" />
                    <Label htmlFor="specific" className="text-lg font-medium mb-2">
                      Dates précises
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Période définie avec dates de début et fin
                    </p>
                    <RadioGroupItem
                      value="specific"
                      id="specific"
                      className="sr-only"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={`cursor-pointer border-2 transition-all ${
                timeFrame === "asap" ? "border-primary" : "border-border"
              }`}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <CalendarIcon className="h-10 w-10 mb-4 text-primary" />
                    <Label htmlFor="asap" className="text-lg font-medium mb-2">
                      Dès que possible
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      À partir de la date sélectionnée
                    </p>
                    <RadioGroupItem
                      value="asap"
                      id="asap"
                      className="sr-only"
                    />
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="space-y-3">
            <Label className="text-lg">
              {timeFrame === "specific" 
                ? "Date de début" 
                : timeFrame === "asap" 
                  ? "À partir de" 
                  : "Date souhaitée"}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP", { locale: fr })
                  ) : (
                    <span>Sélectionnez une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < minDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {timeFrame === "specific" && (
            <div className="space-y-3">
              <Label className="text-lg">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionnez une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date: Date): boolean => 
                      Boolean(date < minDate || (startDate && date < startDate))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {startDate && endDate && startDate > endDate && (
                <p className="text-sm text-destructive">
                  La date de fin doit être postérieure à la date de début
                </p>
              )}
            </div>
          )}

          <div className="space-y-3 pt-4">
            <Label htmlFor="urgency" className="text-lg">Niveau d'urgence</Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="urgency" className="w-full">
                <SelectValue placeholder="Sélectionnez le niveau d'urgence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Faible - Pas pressé (dans les 30 jours)</SelectItem>
                <SelectItem value="SOON">Moyen - Besoin assez rapide (dans les 15 jours)</SelectItem>
                <SelectItem value="URGENT">Urgent - Le plus tôt possible (dans les 7 jours)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <strong>Conseil :</strong> Les artisans ont généralement besoin de quelques jours pour étudier votre demande et planifier leur intervention. 
              Plus vous êtes flexible sur les dates, plus vous aurez de chances de recevoir des propositions.
            </p>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-between pt-6"
        >
          <Button
            variant="outline"
            onClick={() => router.push("/create-project/location")}
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