"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Star, MoveUp, MoveDown, Loader2, AlertCircle, MessageSquareQuote, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface Testimonial {
  id: string
  firstName: string
  lastName: string
  companyName: string | null
  role: string | null
  rating: number
  comment: string
  avatarUrl: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function TemoignagesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    role: "",
    rating: 5,
    comment: "",
    avatarUrl: "",
    isActive: true,
    order: 0
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/admin/testimonials")
      if (response.ok) {
        const data = await response.json()
        setTestimonials(data)
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des témoignages")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const url = editingTestimonial 
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : "/api/admin/testimonials"
      
      const response = await fetch(url, {
        method: editingTestimonial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingTestimonial ? "Témoignage modifié avec succès" : "Témoignage créé avec succès")
        setIsDialogOpen(false)
        resetForm()
        fetchTestimonials()
      } else {
        toast.error("Erreur lors de l'enregistrement")
      }
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const openDeleteDialog = (id: string) => {
    setTestimonialToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!testimonialToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialToDelete}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Témoignage supprimé avec succès")
        setTestimonials(prev => prev.filter(t => t.id !== testimonialToDelete))
        setDeleteDialogOpen(false)
      } else {
        toast.error("Erreur lors de la suppression")
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setIsDeleting(false)
      setTestimonialToDelete(null)
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormData({
      firstName: testimonial.firstName,
      lastName: testimonial.lastName,
      companyName: testimonial.companyName || "",
      role: testimonial.role || "",
      rating: testimonial.rating,
      comment: testimonial.comment,
      avatarUrl: testimonial.avatarUrl || "",
      isActive: testimonial.isActive,
      order: testimonial.order
    })
    setIsDialogOpen(true)
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    try {
      const response = await fetch(`/api/admin/testimonials/${id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction })
      })

      if (response.ok) {
        fetchTestimonials()
      }
    } catch (error) {
      toast.error("Erreur lors du réordonnancement")
    }
  }

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file) // Changé de 'image' à 'file'

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'upload')
      }

      const data = await response.json()
      setFormData({ ...formData, avatarUrl: data.fileUrl }) // Changé de imageUrl à fileUrl
      toast.success("Image uploadée avec succès")
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'upload de l'image")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB")
        return
      }
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5MB")
        return
      }
      handleImageUpload(file)
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      companyName: "",
      role: "",
      rating: 5,
      comment: "",
      avatarUrl: "",
      isActive: true,
      order: 0
    })
    setEditingTestimonial(null)
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FCDA89]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Témoignages</h1>
          <p className="text-white/70">
            Gérez les avis clients affichés sur la page d'accueil
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un témoignage
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0E261C] border-[#FCDA89]/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingTestimonial ? "Modifier" : "Ajouter"} un témoignage
              </DialogTitle>
              <DialogDescription className="text-white/70">
                Remplissez les informations du témoignage client
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName" className="text-white">Entreprise</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-white">Fonction</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white">Note *</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-all hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-white/70">({formData.rating}/5)</span>
                </div>
              </div>

              <div>
                <Label htmlFor="comment" className="text-white">Commentaire *</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  className="bg-white/5 border-[#FCDA89]/20 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-white">Logo/Avatar</Label>
                
                {/* Aperçu de l'image actuelle */}
                {formData.avatarUrl && (
                  <div className="mb-3 p-3 bg-white/5 border border-[#FCDA89]/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-white/10">
                        <Image
                          src={formData.avatarUrl}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white/70">Image actuelle</div>
                        <div className="text-xs text-white/50 truncate max-w-xs">
                          {formData.avatarUrl}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: "" })}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Zone de drag & drop */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                    dragOver
                      ? 'border-[#FCDA89] bg-[#FCDA89]/10'
                      : 'border-[#FCDA89]/20 hover:border-[#FCDA89]/40 bg-white/5'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center gap-3 text-center">
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="h-10 w-10 text-[#FCDA89] animate-spin" />
                        <div>
                          <div className="text-white font-medium">Upload en cours...</div>
                          <div className="text-sm text-white/70">Veuillez patienter</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-12 w-12 rounded-full bg-[#FCDA89]/10 flex items-center justify-center">
                          {formData.avatarUrl ? (
                            <Upload className="h-6 w-6 text-[#FCDA89]" />
                          ) : (
                            <ImageIcon className="h-6 w-6 text-[#FCDA89]" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {formData.avatarUrl ? 'Remplacer l\'image' : 'Ajouter une image'}
                          </div>
                          <div className="text-sm text-white/70">
                            Glissez-déposez ou cliquez pour sélectionner
                          </div>
                          <div className="text-xs text-white/50 mt-1">
                            PNG, JPG, WEBP • Max 5MB
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order" className="text-white">Ordre d'affichage</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="bg-white/5 border-[#FCDA89]/20 text-white"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive" className="text-white">Actif</Label>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                  className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>{editingTestimonial ? "Modifier" : "Créer"}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-blue-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-blue-400">{testimonials.length}</span>
            <span className="text-xs text-white/70 mt-2 text-center">Total</span>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-green-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-green-400">{testimonials.filter(t => t.isActive).length}</span>
            <span className="text-xs text-white/70 mt-2 text-center">Actifs</span>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-[#FCDA89]/20 shadow-lg overflow-hidden backdrop-blur-sm">
          <div className="h-1 bg-gray-500"></div>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-400">{testimonials.filter(t => !t.isActive).length}</span>
            <span className="text-xs text-white/70 mt-2 text-center">Inactifs</span>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/5 border-[#FCDA89]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Liste des témoignages</CardTitle>
          <CardDescription className="text-white/70">
            {testimonials.length} témoignage(s) au total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquareQuote className="h-12 w-12 text-white/50 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun témoignage</h3>
              <p className="text-white/70 text-center mb-4">
                Commencez par ajouter votre premier témoignage client
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#FCDA89] hover:bg-[#FCDA89]/90 text-[#0E261C] font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un témoignage
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white/70">Client</TableHead>
                  <TableHead className="text-white/70">Entreprise</TableHead>
                  <TableHead className="text-white/70">Note</TableHead>
                  <TableHead className="text-white/70">Commentaire</TableHead>
                  <TableHead className="text-white/70">Statut</TableHead>
                  <TableHead className="text-white/70">Ordre</TableHead>
                  <TableHead className="text-right text-white/70">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {testimonial.avatarUrl ? (
                          <img 
                            src={testimonial.avatarUrl} 
                            alt={`${testimonial.firstName} ${testimonial.lastName}`}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#FCDA89]/20"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#FCDA89]/20 flex items-center justify-center">
                            <span className="text-sm font-semibold text-[#FCDA89]">
                              {testimonial.firstName[0]}{testimonial.lastName[0]}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">
                            {testimonial.firstName} {testimonial.lastName}
                          </div>
                          {testimonial.role && (
                            <div className="text-xs text-white/70">
                              {testimonial.role}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{testimonial.companyName || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-white/70">
                      {testimonial.comment}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={testimonial.isActive ? "default" : "secondary"}
                        className={testimonial.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : ""}
                      >
                        {testimonial.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{testimonial.order}</span>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => handleReorder(testimonial.id, "up")}
                          >
                            <MoveUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 p-0 text-white/70 hover:text-white hover:bg-white/10"
                            onClick={() => handleReorder(testimonial.id, "down")}
                          >
                            <MoveDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                          onClick={() => handleEdit(testimonial)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 w-9 p-0 text-red-400 border-white/10 bg-white/5 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => openDeleteDialog(testimonial.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0E261C] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Êtes-vous sûr de vouloir supprimer ce témoignage ?</DialogTitle>
            <DialogDescription className="text-white/70">
              Cette action est irréversible. Le témoignage sera définitivement supprimé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={isDeleting}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>Supprimer</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

