"use client"

import { useState, useEffect } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useToast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Save, 
  Trash2, 
  Loader2, 
  Check, 
  AlertCircle,
  PencilLine,
  Filter,
  Search,
  Zap
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { IconPicker } from '@/components/ui/icon-picker'
import { cn } from '@/lib/utils'
import Link from "next/link"
import Image from "next/image"
import ImageUploader from '@/components/admin/ImageUploader'
import { FilterDrawer, FilterGroup } from '@/components/admin/FilterDrawer'

// Types et interfaces
interface Service {
  id: string
  name: string
  description: string | null
  icon: string | null
  categoryId: string
  category: Category
  isActive: boolean
  // Champs Express
  isExpressAvailable?: boolean
  expressPrice?: number | null
  expressDescription?: string | null
  estimatedDuration?: number | null
  isPopular?: boolean
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  icon: string | null
}

// Schéma de validation pour le formulaire de service
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Le nom doit contenir au moins 3 caractères',
  }),
  description: z.string().optional(),
  categoryId: z.string().min(1, {
    message: 'Une catégorie est requise',
  }),
  icon: z.string().optional(),
  // Champs Express
  isExpressAvailable: z.boolean().optional(),
  expressPrice: z.number().min(0, {
    message: 'Le prix doit être positif',
  }).optional(),
  expressDescription: z.string().optional(),
  estimatedDuration: z.number().int().min(15, {
    message: 'La durée doit être d\'au moins 15 minutes',
  }).optional(),
  isPopular: z.boolean().optional(),
})

type ServiceFormValues = z.infer<typeof formSchema>

export default function AdminServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Recherche et filtres
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string | null>>({
    expressStatus: null,
    activeStatus: null,
    category: null,
  })
  
  // Gestion de l'image
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalServices, setTotalServices] = useState(0)
  const itemsPerPage = 10

  // Initialisation du formulaire
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      icon: '',
      isExpressAvailable: false,
      expressPrice: undefined,
      expressDescription: '',
      estimatedDuration: undefined,
      isPopular: false,
    },
  })

  // Récupération des catégories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories')
      
      const data = await response.json()
      setCategories(data || [])
      return data
    } catch (err) {
      console.error('Erreur:', err)
      return []
    }
  }

  // Récupération des services avec pagination
  const fetchServices = async (categoryId?: string, page: number = 1, search?: string, filters?: Record<string, string | null>) => {
    setLoading(true)
    try {
      // Construire l'URL avec les paramètres de pagination
      let url = '/api/admin/services?'
      
      // Paramètres de pagination
      url += `page=${page}&limit=${itemsPerPage}&`
      
      // Filtre de catégorie
      const categoryFilter = filters?.category || categoryId
      if (categoryFilter && categoryFilter !== "all") {
        url += `categoryId=${categoryFilter}&`
      }
      
      // Recherche
      if (search && search.trim()) {
        url += `search=${encodeURIComponent(search.trim())}&`
      }
      
      // Filtre Express
      if (filters?.expressStatus) {
        url += `expressOnly=${filters.expressStatus === 'express'}&`
      }
      
      // Filtre statut actif
      if (filters?.activeStatus) {
        url += `isActive=${filters.activeStatus === 'active'}&`
      }
      
      // Nettoyer l'URL
      url = url.replace(/&$/, '')
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Erreur lors du chargement des services')
      
      const data = await response.json()
      
      // Mettre à jour les services et le nombre total
      setServices(data.services || [])
      setTotalServices(data.total || 0)
      setCurrentPage(page)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  // Chargement initial
  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchServices(selectedCategory, currentPage, searchQuery, selectedFilters)
    ]);
  }, [])

  // Mise à jour des services lorsque les filtres changent
  useEffect(() => {
    fetchServices(selectedCategory, 1, searchQuery, selectedFilters) // Reset to page 1 when filters change
  }, [selectedCategory, searchQuery, selectedFilters])

  // Debounce pour la recherche
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== "") {
        fetchServices(selectedCategory, 1, searchQuery, selectedFilters)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Réinitialisation du formulaire lors de l'édition
  useEffect(() => {
    if (editingService) {
      form.reset({
        name: editingService.name,
        description: editingService.description || '',
        categoryId: editingService.categoryId,
        icon: editingService.icon || '',
        isExpressAvailable: editingService.isExpressAvailable || false,
        expressPrice: editingService.expressPrice || undefined,
        expressDescription: editingService.expressDescription || '',
        estimatedDuration: editingService.estimatedDuration || undefined,
        isPopular: editingService.isPopular || false,
      })
      setCurrentImageUrl(editingService.icon || null)
      setFormOpen(true)
    } else {
      setCurrentImageUrl(null)
    }
  }, [editingService, form])

  // Soumission du formulaire
  const onSubmit = async (values: ServiceFormValues) => {
    try {
      setSubmitting(true)
      
      const url = editingService 
        ? `/api/admin/services/${editingService.id}` 
        : '/api/admin/services'
      
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Une erreur est survenue')
      }
      
      const result = await response.json()
      
      toast({
        title: "Succès",
        description: editingService
          ? "Service mis à jour avec succès"
          : "Service créé avec succès",
      })
      
      form.reset({
        name: '',
        description: '',
        categoryId: '',
        icon: '',
        isExpressAvailable: false,
        expressPrice: undefined,
        expressDescription: '',
        estimatedDuration: undefined,
        isPopular: false,
      })
      
      setCurrentImageUrl(null)
      setEditingService(null)
      setFormOpen(false)
      fetchServices(selectedCategory, currentPage, searchQuery, selectedFilters)
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        variant: 'destructive',
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Gestion des actions
  const handleEditService = (service: Service) => {
    setEditingService(service)
  }

  const handleCancelEdit = () => {
    setEditingService(null)
    setCurrentImageUrl(null)
    form.reset({
      name: '',
      description: '',
      categoryId: '',
      icon: '',
      isExpressAvailable: false,
      expressPrice: undefined,
      expressDescription: '',
      estimatedDuration: undefined,
      isPopular: false,
    })
    setFormOpen(false)
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return
    
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Une erreur est survenue')
      }
      
      toast({
        title: "Succès",
        description: "Service supprimé avec succès",
      })
      
      fetchServices(selectedCategory, currentPage, searchQuery, selectedFilters)
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        variant: 'destructive',
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      })
    }
  }

  // Gestionnaires de pagination
  const handleNextPage = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchServices(selectedCategory, nextPage, searchQuery, selectedFilters)
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      setCurrentPage(prevPage)
      fetchServices(selectedCategory, prevPage, searchQuery, selectedFilters)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchServices(selectedCategory, page, searchQuery, selectedFilters)
  }

  // Gestion de l'image
  const handleImageUploaded = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl)
    form.setValue('icon', imageUrl)
  }

  const handleImageRemoved = () => {
    setCurrentImageUrl(null)
    form.setValue('icon', '')
  }

  // Gestion des filtres
  const handleFilterChange = (groupId: string, value: string | null) => {
    setSelectedFilters(prev => ({
      ...prev,
      [groupId]: value
    }))
    setCurrentPage(1) // Reset à la page 1 lors du changement de filtre
  }

  const handleResetFilters = () => {
    setSelectedFilters({
      expressStatus: null,
      activeStatus: null,
      category: null,
    })
    setSearchQuery("")
    setSelectedCategory("all")
    setCurrentPage(1)
  }

  // Configuration des filtres
  const filterGroups: FilterGroup[] = [
    {
      id: 'expressStatus',
      title: 'Services Express',
      options: [
        { id: 'express', label: 'Services Express', value: 'express' },
        { id: 'standard', label: 'Services Standard', value: 'standard' },
      ]
    },
    {
      id: 'activeStatus',
      title: 'Statut',
      options: [
        { id: 'active', label: 'Services Actifs', value: 'active' },
        { id: 'inactive', label: 'Services Inactifs', value: 'inactive' },
      ]
    },
    {
      id: 'category',
      title: 'Catégorie',
      options: categories.map(category => ({
        id: category.id,
        label: category.name,
        value: category.id
      }))
    }
  ]

  // Calcul des pages à afficher
  const totalPages = Math.ceil(totalServices / itemsPerPage)
  const pageNumbers = []
  
  // Logique pour afficher un nombre limité de pages avec ellipsis
  let startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, startPage + 4)
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gestion des services</h1>
          <p className="text-white/70">
            Créez et gérez les services proposés aux artisans et clients.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Link href="/admin/categories">
            <Button variant="outline" className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
              Gérer les catégories
            </Button>
          </Link>
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold" onClick={() => {
                setEditingService(null);
                form.reset({
                  name: '',
                  description: '',
                  categoryId: '',
                  icon: '',
                  isExpressAvailable: false,
                  expressPrice: undefined,
                  expressDescription: '',
                  estimatedDuration: undefined,
                  isPopular: false,
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un service
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0E261C] border-[#FCDA89]/20 max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingService ? 'Modifier un service' : 'Ajouter un service'}
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  {editingService 
                    ? 'Modifiez les informations du service'
                    : 'Ajoutez un nouveau service à votre catalogue'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nom du service</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: Installation de plomberie" 
                    className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-white">Catégorie</Label>
                  <Select 
                    onValueChange={(value) => form.setValue('categoryId', value)}
                    defaultValue={form.getValues('categoryId')}
                  >
                    <SelectTrigger className="bg-white/5 border-[#FCDA89]/20 text-white">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0E261C] border-[#FCDA89]/20">
                      <SelectItem value="all" className="text-white hover:bg-white/10">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="text-white hover:bg-white/10">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-400">{form.formState.errors.categoryId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description du service"
                    className="resize-none h-20 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                    {...form.register('description')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="icon" className="text-white">Icône</Label>
                  <IconPicker
                    value={form.getValues('icon') || ''}
                    onChange={(value) => form.setValue('icon', value)}
                  />
                </div>

                {/* Upload d'image */}
                <ImageUploader
                  label="Image du service"
                  currentImageUrl={currentImageUrl}
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  endpoint="/api/admin/services/upload-image"
                  entityId={editingService?.id}
                  acceptedTypes={["image/jpeg", "image/jpg", "image/png", "image/webp"]}
                  maxSizeMB={5}
                  disabled={submitting}
                />

                {/* Section Reenove Express */}
                <div className="border-t border-[#FCDA89]/20 pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-medium">Configuration Reenove Express</h3>
                    <Badge variant="outline" className="text-xs bg-[#FCDA89]/10 text-[#FCDA89] border-[#FCDA89]/30">
                      Premium
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isExpressAvailable"
                      checked={form.watch('isExpressAvailable')}
                      onCheckedChange={(checked) => form.setValue('isExpressAvailable', checked === true)}
                      className="border-[#FCDA89]/20 data-[state=checked]:bg-[#FCDA89] data-[state=checked]:text-[#0E261C]"
                    />
                    <Label htmlFor="isExpressAvailable" className="text-white">
                      Disponible en Express (prix fixe)
                    </Label>
                  </div>

                  {form.watch('isExpressAvailable') && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expressPrice" className="text-white">Prix Express (€)</Label>
                          <Input
                            id="expressPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Ex: 89.99"
                            className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                            {...form.register('expressPrice', { valueAsNumber: true })}
                          />
                          {form.formState.errors.expressPrice && (
                            <p className="text-sm text-red-400">{form.formState.errors.expressPrice.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="estimatedDuration" className="text-white">Durée estimée (min)</Label>
                          <Input
                            id="estimatedDuration"
                            type="number"
                            min="15"
                            step="15"
                            placeholder="Ex: 60"
                            className="bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                            {...form.register('estimatedDuration', { valueAsNumber: true })}
                          />
                          {form.formState.errors.estimatedDuration && (
                            <p className="text-sm text-red-400">{form.formState.errors.estimatedDuration.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expressDescription" className="text-white">Description Express</Label>
                        <Textarea
                          id="expressDescription"
                          placeholder="Description spécifique pour le service Express (ex: Diagnostic rapide en 30 minutes)"
                          className="resize-none h-20 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                          {...form.register('expressDescription')}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isPopular"
                          checked={form.watch('isPopular')}
                          onCheckedChange={(checked) => form.setValue('isPopular', checked === true)}
                          className="border-[#FCDA89]/20 data-[state=checked]:bg-[#FCDA89] data-[state=checked]:text-[#0E261C]"
                        />
                        <Label htmlFor="isPopular" className="text-white">
                          Service populaire (mis en avant)
                        </Label>
                      </div>
                    </>
                  )}
                </div>
                
                <DialogFooter className="pt-4">
                  <Button variant="outline" type="button" onClick={handleCancelEdit} className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingService ? 'Mise à jour...' : 'Création...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {editingService ? 'Mettre à jour' : 'Créer'}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Notification de succès */}
      {success && (
        <div className="p-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md text-sm flex items-center">
          <Check className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Notification d'erreur */}
      {error && (
        <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <Card className="bg-white/5 border-[#FCDA89]/20">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Rechercher par nom, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-[#FCDA89]/20 text-white placeholder:text-white/50"
                />
              </div>
            </div>
            
            {/* Filtres */}
            <div className="flex items-center gap-2">
              <FilterDrawer
                title="Filtrer les services"
                description="Utilisez les filtres pour affiner votre recherche"
                side="right"
                trigger={
                  <Button variant="outline" className="bg-white/5 border-[#FCDA89]/20 text-white hover:bg-[#FCDA89]/10">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtres
                    {Object.values(selectedFilters).some(v => v) && (
                      <Badge className="ml-2 bg-[#FCDA89] text-[#0E261C] text-xs">
                        {Object.values(selectedFilters).filter(v => v).length}
                      </Badge>
                    )}
                  </Button>
                }
                filterGroups={filterGroups}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
              
              {/* Bouton reset rapide */}
              {(searchQuery || Object.values(selectedFilters).some(v => v)) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  Effacer tout
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
        <CardHeader>
          <div>
            <CardTitle className="text-white">Liste des services</CardTitle>
            <CardDescription className="text-white/70">
              {totalServices} service{totalServices > 1 ? 's' : ''} trouvé{totalServices > 1 ? 's' : ''}
              {searchQuery && ` pour "${searchQuery}"`}
              {Object.values(selectedFilters).some(v => v) && ` avec filtres actifs`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-[#FCDA89]" />
            </div>
          ) : services.length > 0 ? (
            <>
              <Table>
                              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Image</TableHead>
                  <TableHead className="text-white/70">Nom</TableHead>
                  <TableHead className="text-white/70">Catégorie</TableHead>
                  <TableHead className="text-white/70">Description</TableHead>
                  <TableHead className="text-white/70">Statut</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
                          {service.icon && service.icon.startsWith('http') ? (
                            <Image
                              src={service.icon}
                              alt={`Image de ${service.name}`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="text-white/50 text-sm">
                              {service.icon || 'N/A'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{service.name}</span>
                          {service.isExpressAvailable && (
                            <Badge className="bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30 text-xs px-1.5 py-0.5">
                              <Zap className="h-3 w-3 mr-1" />
                              Express
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-[#FCDA89]/20 text-[#FCDA89] border-[#FCDA89]/30">
                          {service.category.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-white">
                        {service.description || <span className="text-white/50 italic">Aucune description</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={service.isActive ? "default" : "secondary"} className={service.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}>
                          {service.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditService(service)}
                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </Button>
                  
                  {startPage > 1 && (
                    <>
                      <Button
                        variant={currentPage === 1 ? "default" : "outline"}
                        size="sm"
                        className={currentPage === 1 ? "bg-[#FCDA89] text-[#0E261C]" : "bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"}
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </Button>
                      {startPage > 2 && <span className="mx-1 text-white/70">...</span>}
                    </>
                  )}
                  
                  {pageNumbers.map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className={currentPage === page ? "bg-[#FCDA89] text-[#0E261C]" : "bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                  
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && <span className="mx-1 text-white/70">...</span>}
                      <Button
                        variant={currentPage === totalPages ? "default" : "outline"}
                        size="sm"
                        className={currentPage === totalPages ? "bg-[#FCDA89] text-[#0E261C]" : "bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"}
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/5 border-[#FCDA89]/20 text-[#FCDA89] hover:bg-[#FCDA89]/10"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
              
              <div className="mt-4 text-sm text-white/70 text-center">
                Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, totalServices)} sur {totalServices} services
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-white/70">
              <p>Aucun service trouvé</p>
              {selectedCategory && (
                <p className="text-sm mt-2">Essayez de sélectionner une autre catégorie ou créez un nouveau service</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 