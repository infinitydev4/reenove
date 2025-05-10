"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react"
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
import { PageHeader } from "@/components/page-header"

export default function DatePage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [urgency, setUrgency] = useState("NORMAL")
  const [timeFrame, setTimeFrame] = useState("flexible")
  const [isFormValid, setIsFormValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  // Dates minimales (aujourd'hui + 2 jours pour laisser le temps aux artisans de répondre)
  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() + 2)

  useEffect(() => {
    // Animation d'entrée
    setIsVisible(true)
    
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
    
    setIsSubmitting(true)
    
    try {
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
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la date:", error)
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

  // Gestionnaires pour les dates qui ferment le popover après sélection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    setStartDateOpen(false);
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    setEndDateOpen(false);
  }

  return (
    <form id="project-form" onSubmit={(e) => { e.preventDefault(); saveAndContinue(); }}>
      <div className="space-y-2 md:space-y-6">
        <PageHeader
          title="Planification du projet"
          description="Indiquez quand vous souhaitez réaliser votre projet"
          className="mb-2 md:mb-6"
        />

      <motion.div
        variants={containerVariants}
        initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="space-y-2 md:space-y-6"
      >
        <motion.div variants={itemVariants}>
            <div className="space-y-1.5 mb-2 md:mb-6">
              <Label htmlFor="timeFrame" className="text-xs md:text-lg font-medium">
              Cadre temporel
            </Label>
            <RadioGroup
              value={timeFrame}
              onValueChange={setTimeFrame}
                className="grid grid-cols-3 md:grid-cols-3 gap-1.5 md:gap-4"
            >
              <Card className={`cursor-pointer border-2 transition-all ${
                timeFrame === "flexible" ? "border-primary" : "border-border"
              }`}>
                  <CardContent className="py-2 px-1 md:pt-6 md:px-4">
                    <div className="flex flex-col items-center text-center space-y-0.5 md:space-y-2">
                      <CalendarIcon className="h-4 w-4 md:h-10 md:w-10 text-primary" />
                      <Label htmlFor="flexible" className="text-[10px] md:text-lg font-medium">
                      Flexible
                    </Label>
                      <p className="text-[9px] md:text-sm text-muted-foreground leading-tight">
                        Date souhaitée
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
                  <CardContent className="py-2 px-1 md:pt-6 md:px-4">
                    <div className="flex flex-col items-center text-center space-y-0.5 md:space-y-2">
                      <CalendarIcon className="h-4 w-4 md:h-10 md:w-10 text-primary" />
                      <Label htmlFor="specific" className="text-[10px] md:text-lg font-medium">
                        Précises
                    </Label>
                      <p className="text-[9px] md:text-sm text-muted-foreground leading-tight">
                        Début et fin
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
                  <CardContent className="py-2 px-1 md:pt-6 md:px-4">
                    <div className="flex flex-col items-center text-center space-y-0.5 md:space-y-2">
                      <CalendarIcon className="h-4 w-4 md:h-10 md:w-10 text-primary" />
                      <Label htmlFor="asap" className="text-[10px] md:text-lg font-medium">
                      Dès que possible
                    </Label>
                      <p className="text-[9px] md:text-sm text-muted-foreground leading-tight">
                        Au plus tôt
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

          <motion.div variants={itemVariants} className="space-y-2 md:space-y-4">
            <div className="space-y-1 md:space-y-3">
              <Label className="text-xs md:text-lg font-medium">
              {timeFrame === "specific" 
                ? "Date de début" 
                : timeFrame === "asap" 
                  ? "À partir de" 
                  : "Date souhaitée"}
            </Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                      "w-full justify-start text-left font-normal text-[10px] md:text-sm py-1 h-8 md:h-10",
                    !startDate && "text-muted-foreground"
                  )}
                >
                    <CalendarIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
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
                  onSelect={handleStartDateSelect}
                  disabled={(date) => date < minDate}
                  initialFocus
                  locale={fr}
                  classNames={{
                    caption_label: "text-sm font-medium",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-xs font-normal text-muted-foreground w-9 rounded-md",
                    row: "flex w-full mt-2",
                    cell: "text-center text-sm relative p-0 [&:has([aria-selected])]:bg-accent h-9 w-9 rounded-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {timeFrame === "specific" && (
              <div className="space-y-1 md:space-y-3">
                <Label className="text-xs md:text-lg font-medium">Date de fin</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal text-[10px] md:text-sm py-1 h-8 md:h-10",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                      <CalendarIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
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
                    onSelect={handleEndDateSelect}
                    disabled={(date: Date): boolean => 
                      Boolean(date < minDate || (startDate && date < startDate))
                    }
                    initialFocus
                    locale={fr}
                    classNames={{
                      caption_label: "text-sm font-medium",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-xs font-normal text-muted-foreground w-9 rounded-md",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm relative p-0 [&:has([aria-selected])]:bg-accent h-9 w-9 rounded-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                    }}
                  />
                </PopoverContent>
              </Popover>
              {startDate && endDate && startDate > endDate && (
                  <p className="text-[9px] md:text-xs text-destructive flex items-center">
                    <AlertCircle className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                    La date de fin doit être après le début
                </p>
              )}
            </div>
          )}

            <div className="space-y-1 md:space-y-3 pt-1 md:pt-4">
              <Label htmlFor="urgency" className="text-xs md:text-lg font-medium">Niveau d&apos;urgence</Label>
            <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger id="urgency" className="w-full text-[10px] md:text-sm h-8 md:h-10">
                <SelectValue placeholder="Sélectionnez le niveau d&apos;urgence" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="NORMAL" className="text-[10px] md:text-sm">Faible - Pas pressé (30 jours)</SelectItem>
                  <SelectItem value="SOON" className="text-[10px] md:text-sm">Moyen - Assez rapide (15 jours)</SelectItem>
                  <SelectItem value="URGENT" className="text-[10px] md:text-sm">Urgent - Au plus tôt (7 jours)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800 p-1.5 md:p-4">
              <p className="text-[9px] md:text-sm text-amber-800 dark:text-amber-300">
                <strong>Conseil :</strong> Les artisans ont besoin de quelques jours pour étudier votre demande. Plus vous êtes flexible, plus vous recevrez de propositions.
            </p>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-between pt-2 md:pt-6 hidden sm:flex"
        >
          <Button
              type="button"
            variant="outline"
            onClick={() => router.push("/create-project/location")}
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