"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select"

export default function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }
  
  const handleSelectChange = (value: string) => {
    setFormState(prev => ({ ...prev, subject: value }))
    if (errors.subject) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.subject
        return newErrors
      })
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formState.name.trim()) {
      newErrors.name = "Le nom est requis"
    }
    
    if (!formState.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = "Format d'email invalide"
    }
    
    if (!formState.subject) {
      newErrors.subject = "Le sujet est requis"
    }
    
    if (!formState.message.trim()) {
      newErrors.message = "Le message est requis"
    } else if (formState.message.trim().length < 10) {
      newErrors.message = "Le message doit contenir au moins 10 caractères"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    // Simuler un envoi d'API
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitSuccess(true)
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
      
      // Réinitialiser le statut après 5 secondes
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Erreur lors de l'envoi du formulaire:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>
      
      {submitSuccess ? (
        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <p className="text-white font-medium">
            Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
              Nom complet *
            </label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Votre nom complet"
              className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
              Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              className={`bg-white/5 border-white/10 text-white placeholder:text-white/40 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-white/70 mb-2">
              Sujet *
            </label>
            <Select value={formState.subject} onValueChange={handleSelectChange}>
              <SelectTrigger 
                id="subject" 
                className={`bg-white/5 border-white/10 text-white ${!formState.subject ? 'text-white/40' : ''} ${errors.subject ? 'border-red-500' : ''}`}
              >
                <SelectValue placeholder="Sélectionnez un sujet" />
              </SelectTrigger>
              <SelectContent className="bg-[#0E261C] border-white/10">
                <SelectItem value="question-generale">Question générale</SelectItem>
                <SelectItem value="assistance-technique">Assistance technique</SelectItem>
                <SelectItem value="devenir-artisan">Devenir artisan</SelectItem>
                <SelectItem value="partenariat">Partenariat</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">
              Message *
            </label>
            <Textarea
              id="message"
              name="message"
              value={formState.message}
              onChange={handleChange}
              placeholder="Détaillez votre demande ici..."
              className={`min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-white/40 ${errors.message ? 'border-red-500' : ''}`}
            />
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
          </div>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-bold py-3 rounded-xl flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                Envoyer le message
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  )
} 