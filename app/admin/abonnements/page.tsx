"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Eye, Users, CreditCard, CheckCircle, XCircle, Star, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useForm } from "react-hook-form"

interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  type: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  price: number
  stripeProductId: string | null
  stripePriceId: string | null
  features: string[]
  maxProjects: number | null
  maxRadius: number | null
  commissionRate: number | null
  isActive: boolean
  isPopular: boolean
  subscribersCount: number
  createdAt: string
  updatedAt: string
}

type PlanFormValues = {
  name: string
  description?: string
  type: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'
  price: number
  features?: string
  maxProjects?: number
  maxRadius?: number
  commissionRate?: number
  isActive: boolean
  isPopular: boolean
}

export default function AdminAbonnementsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PlanFormValues>({
    defaultValues: {
      type: 'BASIC',
      price: 0,
      features: '',
      isActive: true,
      isPopular: false,
    }
  })

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/admin/subscription-plans')
      if (!response.ok) throw new Error('Erreur lors du chargement')
      
      const data = await response.json()
      setPlans(data.plans)
    } catch (error) {
      console.error('❌ Erreur:', error)
      toast.error("Impossible de charger les plans d'abonnement")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: PlanFormValues) => {
    setIsSubmitting(true)
    try {
      // Transformer les features string en array
      const formattedData = {
        ...data,
        features: data.features ? data.features.split('\n').filter((f: string) => f.trim()) : []
      }
      
      const response = await fetch('/api/admin/subscription-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }

      toast.success("Plan d'abonnement créé avec succès")

      setIsCreateModalOpen(false)
      reset()
      fetchPlans()
      
    } catch (error: any) {
      console.error('❌ Erreur:', error)
      toast.error(error.message || "Erreur lors de la création du plan")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BASIC':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'PREMIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'ENTERPRISE':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getTotalSubscribers = () => {
    return plans.reduce((total, plan) => total + plan.subscribersCount, 0)
  }

  const getTotalRevenue = () => {
    return plans.reduce((total, plan) => total + (plan.price * plan.subscribersCount), 0)
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89] mx-auto mb-4"></div>
          <p className="text-white/70">Chargement des plans d&apos;abonnement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre et bouton d'action */}
      <div className="flex justify-between items-center h-10 mb-4">
        <h1 className="text-lg font-bold flex items-center gap-2 text-white">
          <CreditCard className="h-5 w-5 text-[#FCDA89]" />
          Plans d&apos;abonnement
        </h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold h-8">
              <Plus className="h-4 w-4 mr-1.5" />
              Nouveau plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-[#0E261C] border-[#FCDA89]/20">
            <DialogHeader>
              <DialogTitle className="text-white">Créer un nouveau plan d&apos;abonnement</DialogTitle>
              <DialogDescription className="text-white/70">
                Créez un nouveau plan d&apos;abonnement qui sera synchronisé avec Stripe
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nom du plan *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                    placeholder="Plan Basic, Premium..."
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-white">Type de plan *</Label>
                  <Select onValueChange={(value: any) => setValue('type', value)} defaultValue="BASIC">
                    <SelectTrigger className="bg-white/5 border-[#FCDA89]/20 text-white">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                  placeholder="Description du plan d'abonnement..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">Prix mensuel (€) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                    placeholder="29.99"
                  />
                  {errors.price && (
                    <p className="text-red-400 text-sm">{errors.price.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxProjects" className="text-white">Projets max</Label>
                  <Input
                    id="maxProjects"
                    type="number"
                    {...register("maxProjects", { valueAsNumber: true })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRadius" className="text-white">Rayon max (km)</Label>
                  <Input
                    id="maxRadius"
                    type="number"
                    {...register("maxRadius", { valueAsNumber: true })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                    placeholder="50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate" className="text-white">Taux de commission (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  {...register("commissionRate", { valueAsNumber: true })}
                  className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                  placeholder="5.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="features" className="text-white">Caractéristiques (une par ligne)</Label>
                <Textarea
                  id="features"
                  {...register("features")}
                  className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                  placeholder={`Accès aux projets\nSupport prioritaire\nAnalytics avancés`}
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                    defaultChecked={true}
                  />
                  <Label htmlFor="isActive" className="text-white">Plan actif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPopular"
                    onCheckedChange={(checked) => setValue('isPopular', checked)}
                  />
                  <Label htmlFor="isPopular" className="text-white">Plan populaire</Label>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
                >
                  {isSubmitting ? "Création..." : "Créer le plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Total Plans</p>
                <p className="text-2xl font-bold text-white">{plans.length}</p>
              </div>
              <div className="p-2 bg-[#FCDA89]/20 rounded">
                <CreditCard className="h-5 w-5 text-[#FCDA89]" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Abonnés</p>
                <p className="text-2xl font-bold text-white">{getTotalSubscribers()}</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Revenus/mois</p>
                <p className="text-2xl font-bold text-white">{getTotalRevenue().toFixed(2)}€</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded">
                <Euro className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Plans Actifs</p>
                <p className="text-2xl font-bold text-white">
                  {plans.filter(p => p.isActive).length}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des plans */}
      <div className="flex-1 overflow-hidden">
        {plans.length === 0 ? (
          <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm h-full flex items-center justify-center">
            <CardContent className="text-center">
              <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Aucun plan d&apos;abonnement</h3>
              <p className="text-white/70 mb-4">Créez votre premier plan d&apos;abonnement pour commencer.</p>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm relative">
                {plan.isPopular && (
                  <div className="absolute -top-2 left-4">
                    <Badge className="bg-[#FCDA89] text-[#0E261C] font-semibold">
                      <Star className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                    <Badge className={getTypeColor(plan.type)}>
                      {plan.type}
                    </Badge>
                  </div>
                  {plan.description && (
                    <CardDescription className="text-white/70">
                      {plan.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {plan.price}€
                      <span className="text-lg font-normal text-white/70">/mois</span>
                    </div>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium text-white text-sm">Caractéristiques :</p>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="text-white/70 text-sm flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-400 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-white/50 text-sm">
                            +{plan.features.length - 3} autres...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-white/70 text-xs">Abonnés</p>
                      <p className="font-semibold text-white">{plan.subscribersCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white/70 text-xs">Statut</p>
                      <div className="flex items-center justify-center">
                        {plan.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 