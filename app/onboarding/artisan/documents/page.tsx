"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FileText, FileWarning, Upload, Loader2, ArrowLeft, ArrowRight, Shield } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { DocumentsUploader } from "@/components/documents/DocumentsUploader"
import { OnboardingLayout } from "../components/OnboardingLayout"
import { useOnboarding } from "../context/OnboardingContext"

export default function ArtisanDocumentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const { isLoading, isSaving, setIsSaving, updateProgress, silentMode, setSilentMode } = useOnboarding()
  const [documents, setDocuments] = useState<{ id: string; name: string; type: string; url: string }[]>([])

  // Charger les documents existants
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Récupérer les documents existants
        const documentsResponse = await fetch("/api/artisan/documents", { cache: 'no-store' })
        if (documentsResponse.ok) {
          const documentsData = await documentsResponse.json()
          setDocuments(documentsData)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des documents:", error)
      }
    }

    if (session?.user) {
      fetchDocuments()
    }
  }, [session?.user])

  const handleDocumentUpload = (newDocument: { id: string; name: string; type: string; url: string }) => {
    setDocuments(prev => {
      // Remplacer le document du même type s'il existe déjà
      const exists = prev.findIndex(doc => doc.type === newDocument.type)
      if (exists >= 0) {
        const updated = [...prev]
        updated[exists] = newDocument
        return updated
      }
      // Sinon ajouter le nouveau document
      return [...prev, newDocument]
    })
  }

  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      // Vérifier qu'au moins deux documents ont été téléchargés 
      // et que les documents obligatoires (KBIS et assurance) sont présents
      const hasKbis = documents.some(doc => doc.type === "KBIS")
      const hasInsurance = documents.some(doc => doc.type === "INSURANCE")
      
      if (!hasKbis || !hasInsurance) {
        toast({
          title: "Documents manquants",
          description: "Veuillez télécharger au moins votre KBIS et votre attestation d'assurance.",
          variant: "destructive",
        })
        return
      }
      
      // Activer le mode silencieux pour les notifications
      setSilentMode(true)
      
      // Mettre à jour la progression
      await updateProgress("documents")
      
      // Rediriger vers l'étape suivante
      router.push("/onboarding/artisan/confirmation")
    } catch (error) {
      console.error("Erreur:", error)
      setSilentMode(false)
      toast({
        title: "Erreur",
        description: "Impossible de valider vos documents.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      // On garde le mode silencieux actif
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Chargement de vos informations...</p>
      </div>
    )
  }

  // Vérifier les documents obligatoires
  const hasKbis = documents.some(doc => doc.type === "KBIS")
  const hasInsurance = documents.some(doc => doc.type === "INSURANCE")
  const canContinue = hasKbis && hasInsurance

  return (
    <OnboardingLayout 
      currentStep="documents"
      title="Documents requis"
      description="Téléchargez les documents légaux nécessaires pour valider votre inscription."
    >
      <Card className="w-full border shadow-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-6">
            
            <div className="grid gap-6">
              {/* Document KBIS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-100 rounded-full">
                    <FileText className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Extrait KBIS <span className="text-red-500">*</span></h3>
                  </div>
                </div>
                <div className="pl-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Document officiel de l&apos;existence légale de votre entreprise.
                  </p>
                  <DocumentsUploader
                    documentType="KBIS"
                    existingDocument={documents.find(doc => doc.type === "KBIS")}
                    onUploadSuccess={handleDocumentUpload}
                    onDelete={handleDocumentDelete}
                  />
                </div>
              </div>

              {/* Document Assurance */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 rounded-full">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Attestation d&apos;assurance <span className="text-red-500">*</span></h3>
                  </div>
                </div>
                <div className="pl-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Attestation de responsabilité civile et professionnelle.
                  </p>
                  <DocumentsUploader 
                    documentType="INSURANCE"
                    existingDocument={documents.find(doc => doc.type === "INSURANCE")}
                    onUploadSuccess={handleDocumentUpload}
                    onDelete={handleDocumentDelete}
                  />
                </div>
              </div>

              {/* Document Qualification - optionnel */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100 rounded-full">
                    <Upload className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Qualifications professionnelles</h3>
                  </div>
                </div>
                <div className="pl-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Certifications, diplômes ou attestations professionnelles.
                  </p>
                  <DocumentsUploader 
                    documentType="QUALIFICATION"
                    existingDocument={documents.find(doc => doc.type === "QUALIFICATION")}
                    onUploadSuccess={handleDocumentUpload}
                    onDelete={handleDocumentDelete}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        
        {/* Footer avec boutons fixes pour mobile */}
        <CardFooter className="flex justify-between pt-4 border-t bg-slate-50/80 p-4 hidden sm:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/onboarding/artisan/specialties")}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving || !canContinue}
            size="sm"
            className="gap-1"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <span>Continuer</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
} 