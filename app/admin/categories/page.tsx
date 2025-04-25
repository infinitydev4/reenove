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
  RefreshCw,
  AlertCircle,
  PencilLine
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { IconPicker } from '@/components/ui/icon-picker'
import { cn } from '@/lib/utils'

// Données statiques de démonstration (celles actuellement utilisées dans l'application)
const staticCategories = [
  { id: "plumbing", name: "Plomberie", icon: "Wrench", description: "Installation, réparation et entretien de systèmes de plomberie" },
  { id: "electricity", name: "Électricité", icon: "Zap", description: "Installation et dépannage électrique" },
  { id: "carpentry", name: "Menuiserie", icon: "Hammer", description: "Fabrication et installation de mobilier et structures en bois" },
  { id: "painting", name: "Peinture", icon: "Paintbrush", description: "Travaux de peinture intérieure et extérieure" },
  { id: "masonry", name: "Maçonnerie", icon: "Construction", description: "Construction et rénovation de structures en pierre, brique ou béton" },
  { id: "bathroom", name: "Salle de bain", icon: "Bath", description: "Rénovation et installation de salles de bain" },
  { id: "doors", name: "Portes et fenêtres", icon: "DoorOpen", description: "Installation et réparation de portes et fenêtres" },
  { id: "landscaping", name: "Jardinage", icon: "Trees", description: "Aménagement paysager et entretien d'espaces verts" },
  { id: "renovation", name: "Rénovation générale", icon: "Home", description: "Rénovation complète ou partielle de bâtiments" },
  { id: "other", name: "Autre", icon: "Briefcase", description: "Autres types de travaux non listés" },
]

// Définir une interface pour les services
interface Service {
  id: string;
  name: string;
  description: string;
}

const staticServices: Record<string, Service[]> = {
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
  // autres services...
}

// Définition du schéma de validation pour le formulaire
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Le nom doit contenir au moins 3 caractères',
  }),
  icon: z.string().min(1, {
    message: 'Une icône est requise',
  }),
})

type CategoryFormValues = z.infer<typeof formSchema>

interface Category {
  id: string
  name: string
  icon: string
  createdAt: string
  updatedAt: string
}

export default function AdminCategoriesPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [services, setServices] = useState<Record<string, Service[]>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  // Initialisation du formulaire
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  })

  // Fonction pour récupérer les catégories de la BDD
  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories')
      
      const data = await response.json()
      setCategories(data.data || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour récupérer les services d'une catégorie
  const fetchServicesByCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/services?categoryId=${categoryId}`)
      if (!response.ok) throw new Error('Erreur lors du chargement des services')
      
      const data = await response.json()
      setServices(prev => ({ ...prev, [categoryId]: data.services || [] }))
      return data.services || []
    } catch (err: any) {
      console.error('Erreur de chargement des services:', err)
      return []
    }
  }

  // Fonction pour importer toutes les données statiques à la BDD
  const importStaticData = async () => {
    setImporting(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Importer les catégories
      const response = await fetch('/api/admin/categories/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: staticCategories,
          services: staticServices
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'importation')
      }
      
      const data = await response.json()
      setSuccess(data.message || 'Importation réussie')
      
      // Rafraîchir les catégories
      await fetchCategories()
      setImportDialogOpen(false)
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'importation')
    } finally {
      setImporting(false)
    }
  }

  // Charger les catégories au chargement de la page
  useEffect(() => {
    fetchCategories()
  }, [])

  // Charger les services lorsqu'une catégorie est sélectionnée
  useEffect(() => {
    if (selectedCategory) {
      fetchServicesByCategory(selectedCategory)
    }
  }, [selectedCategory])

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        icon: editingCategory.icon,
      })
    }
  }, [editingCategory, form])

  // Soumission du formulaire
  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setSubmitting(true)
      
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
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
        description: editingCategory
          ? "Catégorie mise à jour avec succès"
          : "Catégorie créée avec succès",
      })
      
      form.reset({
        name: '',
        icon: '',
      })
      
      setEditingCategory(null)
      fetchCategories()
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

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    form.reset({
      name: '',
      icon: '',
    })
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Une erreur est survenue')
      }
      
      toast({
        title: "Succès",
        description: "Catégorie supprimée avec succès",
      })
      
      fetchCategories()
    } catch (error: any) {
      console.error('Erreur:', error)
      toast({
        variant: 'destructive',
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestion des catégories et services</h1>
          <p className="text-muted-foreground">
            Créez et gérez les catégories et services proposés aux artisans et clients.
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Importer les données statiques
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer les données statiques</DialogTitle>
                <DialogDescription>
                  Cette action va créer toutes les catégories et services actuellement codés en dur dans l'application. Cette opération est irréversible.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <h3 className="font-medium mb-2">Données à importer:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Catégories ({staticCategories.length})</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {staticCategories.slice(0, 8).map(cat => (
                        <Badge key={cat.id} variant="outline">{cat.name}</Badge>
                      ))}
                      {staticCategories.length > 8 && <Badge variant="outline">+{staticCategories.length - 8}</Badge>}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Services (par catégorie)</p>
                    <div className="mt-1 text-sm text-gray-500">
                      {Object.keys(staticServices).map(catId => (
                        <div key={catId} className="mb-1">
                          {catId}: {staticServices[catId as keyof typeof staticServices].length} services
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportDialogOpen(false)} disabled={importing}>
                  Annuler
                </Button>
                <Button onClick={importStaticData} disabled={importing}>
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importation...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Importer
                    </>
                  )}
                </Button>
              </DialogFooter>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une catégorie
          </Button>
        </div>
      </div>

      {/* Notification de succès */}
      {success && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm flex items-center">
          <Check className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {/* Notification d'erreur */}
      {error && !importing && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Liste des catégories */}
        <Card>
          <CardHeader>
            <CardTitle>Catégories</CardTitle>
            <CardDescription>
              Liste des catégories disponibles pour les projets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Icône</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date de création</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center justify-center bg-muted w-10 h-10 rounded-full">
                          <span className="text-xl">{category.icon}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditCategory(category)}
                            className={cn(
                              "h-8 w-8",
                              editingCategory?.id === category.id && "bg-primary/10"
                            )}
                          >
                            <PencilLine className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>Aucune catégorie trouvée</p>
                <p className="text-sm mt-2">Importez les données statiques ou créez des catégories manuellement</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des services pour la catégorie sélectionnée */}
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              {selectedCategory 
                ? `Services associés à la catégorie: ${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}` 
                : "Sélectionnez une catégorie pour voir ses services"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedCategory ? (
              <div className="text-center py-10 text-muted-foreground">
                <p>Sélectionnez une catégorie</p>
              </div>
            ) : services[selectedCategory] ? (
              services[selectedCategory].length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services[selectedCategory].map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{service.description}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Modifier</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p>Aucun service trouvé pour cette catégorie</p>
                </div>
              )
            ) : (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </CardContent>
          {selectedCategory && (
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un service
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
} 