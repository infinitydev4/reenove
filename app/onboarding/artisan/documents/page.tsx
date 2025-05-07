"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { FileText, FileWarning, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { DocumentsUploader } from "@/components/documents/DocumentsUploader"
import { OnboardingLayout } from "../components/OnboardingLayout"

export default function ArtisanDocumentsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [documents, setDocuments] = useState<{ id: string; name: string; type: string; url: string }[]>([])
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Vérifier si l'utilisateur est connecté et est bien un artisan
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?tab=login&redirect=/onboarding/artisan/documents")
      return
    }

    if (status === "authenticated" && session?.user) {
      if (session.user.role !== "ARTISAN") {
        router.push("/")
        toast({
          title: "Accès refusé",
          description: "Cette section est réservée aux artisans.",
          variant: "destructive"
        })
        return
      }

      // Récupérer l'état d'avancement de l'onboarding et les documents
      const fetchData = async () => {
        try {
          setIsLoading(true)
          
          // Récupérer l'état d'avancement de l'onboarding
          const progressResponse = await fetch("/api/artisan/onboarding/progress", { cache: 'no-store' })
          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            
            // Transformer les données de progression en tableau d'étapes complétées
            const completed: string[] = []
            if (progressData?.progress?.profile) completed.push("profile")
            if (progressData?.progress?.specialties) completed.push("specialties")
            if (progressData?.progress?.documents) completed.push("documents")
            if (progressData?.progress?.confirmation) completed.push("confirmation")
            
            setCompletedSteps(completed)
            
            // Si l'étape des spécialités n'est pas complétée, rediriger vers cette étape
            if (progressData?.progress && !progressData.progress.specialties) {
              router.push("/onboarding/artisan/specialties")
              return
            }
          }
          
          // Récupérer les documents existants
          const documentsResponse = await fetch("/api/artisan/documents", { cache: 'no-store' })
          if (documentsResponse.ok) {
            const documentsData = await documentsResponse.json()
            setDocuments(documentsData)
          }
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchData()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, session?.user?.id])

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

  const updateOnboardingProgress = async () => {
    try {
      const response = await fetch("/api/artisan/onboarding/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ step: "documents" }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de la progression");
      }

      // Récupérer les étapes complétées mises à jour
      const data = await response.json();
      
      // Vérifier le format de la réponse
      if (data.success) {
        // Charger à nouveau la progression depuis l'API pour obtenir les données à jour
        const progressResponse = await fetch("/api/artisan/onboarding/progress");
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          
          // Mettre à jour les étapes complétées
          const completed: string[] = [];
          if (progressData.progress.profile) completed.push("profile");
          if (progressData.progress.specialties) completed.push("specialties");
          if (progressData.progress.documents) completed.push("documents");
          if (progressData.progress.confirmation) completed.push("confirmation");
          
          setCompletedSteps(completed);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre progression.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      
      // Vérifier qu'au moins deux documents ont été téléchargés 
      // et que les documents obligatoires (KBIS et assurance) sont présents
      const hasKbis = documents.some(doc => doc.type === "KBIS");
      const hasInsurance = documents.some(doc => doc.type === "INSURANCE");
      
      if (!hasKbis || !hasInsurance) {
        toast({
          title: "Documents manquants",
          description: "Veuillez télécharger au moins votre KBIS et votre attestation d'assurance.",
          variant: "destructive",
        });
        return;
      }
      
      // Mettre à jour la progression
      const progressUpdated = await updateOnboardingProgress();
      
      toast({
        title: "Documents validés",
        description: "Vos documents ont été validés avec succès.",
      });
      
      if (progressUpdated) {
        // Rediriger vers l'étape suivante
        router.push("/onboarding/artisan/confirmation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de valider vos documents.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      completedSteps={completedSteps}
      title="Documents requis"
      description="Téléchargez les documents légaux nécessaires pour valider votre inscription."
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Documents administratifs</CardTitle>
          <CardDescription>
            Veuillez fournir les documents suivants au format PDF, JPG ou PNG.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Document KBIS */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Extrait KBIS <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Document officiel prouvant l&apos;existence légale de votre entreprise.
                  </p>
                </div>
              </div>
              <DocumentsUploader
                documentType="KBIS"
                existingDocument={documents.find(doc => doc.type === "KBIS")}
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
              />
            </div>

            {/* Document Assurance */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <FileWarning className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Attestation d&apos;assurance <span className="text-red-500">*</span></h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Attestation de responsabilité civile et professionnelle.
                  </p>
                </div>
              </div>
              <DocumentsUploader 
                documentType="INSURANCE"
                existingDocument={documents.find(doc => doc.type === "INSURANCE")}
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
              />
            </div>

            {/* Document Qualification - optionnel */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Upload className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium">Qualifications professionnelles (optionnel)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Certifications, diplômes ou attestations professionnelles.
                  </p>
                </div>
              </div>
              <DocumentsUploader 
                documentType="QUALIFICATION"
                existingDocument={documents.find(doc => doc.type === "QUALIFICATION")}
                onUploadSuccess={handleDocumentUpload}
                onDelete={handleDocumentDelete}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/onboarding/artisan/specialties")}
          >
            Retour
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || !canContinue}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Continuer"
            )}
          </Button>
        </CardFooter>
      </Card>
    </OnboardingLayout>
  )
} 