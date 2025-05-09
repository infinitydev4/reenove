import { ArrowLeft, Download, FileText, ShieldCheck, Award, User, CreditCard, FileDigit } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Document = {
  id: string
  name: string
  type: string
  status: string
  uploadDate: string
  expiryDate?: string
  fileUrl?: string
}

type ArtisanDocumentsTabProps = {
  documents: Document[]
  artisanId: string
  onDocumentDownload: (document: Document) => void
  onDownloadAllDocuments: () => void
}

export function ArtisanDocumentsTab({ 
  documents, 
  artisanId, 
  onDocumentDownload, 
  onDownloadAllDocuments 
}: ArtisanDocumentsTabProps) {
  const router = useRouter()

  // Fonction pour le statut du document
  const getDocumentStatusBadge = (status: string, expiryDate?: string) => {
    let badge;
    
    switch (status) {
      case "valid":
        badge = <Badge className="bg-green-500">Valide</Badge>
        break;
      case "expired":
        badge = <Badge className="bg-red-500">Expiré</Badge>
        break;
      case "pending":
        badge = <Badge className="bg-amber-500">En attente</Badge>
        break;
      default:
        badge = <Badge variant="outline">Inconnu</Badge>
    }
    
    // Si le document a une date d'expiration, ajouter un tooltip
    if (expiryDate) {
      return (
        <div className="group relative flex items-center">
          {badge}
          <div className="absolute bottom-full left-0 mb-2 hidden w-48 rounded-md bg-gray-900 p-2 text-xs text-white group-hover:block z-50">
            {status === "valid" 
              ? `Valide jusqu'au ${expiryDate}` 
              : status === "expired" 
                ? `Expiré depuis le ${expiryDate}` 
                : `Date d'expiration: ${expiryDate}`
            }
          </div>
        </div>
      )
    }
    
    return badge;
  }

  // Fonction pour obtenir le nom et l'icône appropriés pour chaque type de document
  const getDocumentTypeInfo = (type: string) => {
    switch (type.toUpperCase()) {
      case "KBIS":
        return { 
          label: "Extrait KBIS", 
          icon: <FileText className="h-4 w-4 mr-2 text-blue-600" /> 
        }
      case "INSURANCE":
        return { 
          label: "Assurance décennale", 
          icon: <ShieldCheck className="h-4 w-4 mr-2 text-green-600" /> 
        }
      case "QUALIFICATION":
        return { 
          label: "Certification professionnelle", 
          icon: <Award className="h-4 w-4 mr-2 text-amber-600" /> 
        }
      case "ID":
        return { 
          label: "Pièce d'identité", 
          icon: <User className="h-4 w-4 mr-2 text-red-600" /> 
        }
      case "RIB":
        return { 
          label: "Relevé d'identité bancaire", 
          icon: <CreditCard className="h-4 w-4 mr-2 text-purple-600" /> 
        }
      case "LEGAL":
        return { 
          label: "Document légal", 
          icon: <FileDigit className="h-4 w-4 mr-2 text-blue-600" /> 
        }
      default:
        return { 
          label: type || "Document", 
          icon: <FileText className="h-4 w-4 mr-2 text-gray-600" /> 
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Documents administratifs</CardTitle>
            <CardDescription>
              Pièces justificatives et documents légaux
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push("/admin/artisans")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date d&apos;ajout</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="h-12 w-12 text-muted-foreground/40" />
                      <div className="text-center">
                        <p className="text-base font-medium">Aucun document disponible</p>
                        <p className="text-sm mt-1">Cet artisan n&apos;a pas encore téléchargé de documents.</p>
                      </div>
                      <div className="mt-2 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 text-sm px-4 py-2 rounded-md max-w-md text-center">
                        Les documents obligatoires (KBIS, attestation d&apos;assurance) doivent être téléchargés 
                        pendant le processus d&apos;onboarding de l&apos;artisan.
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center">
                      {getDocumentTypeInfo(doc.type).icon}
                      <span>{doc.name}</span>
                    </TableCell>
                    <TableCell>{getDocumentTypeInfo(doc.type).label}</TableCell>
                    <TableCell>{doc.uploadDate}</TableCell>
                    <TableCell>{doc.expiryDate || "N/A"}</TableCell>
                    <TableCell>{getDocumentStatusBadge(doc.status, doc.expiryDate)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDocumentDownload(doc)}
                        title={`Télécharger ${doc.name}`}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {documents.length > 0 ? (
          <>
            <Button 
              variant="outline" 
              onClick={onDownloadAllDocuments}
              className="flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger tout
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Gérer les documents
            </Button>
          </>
        ) : (
          <div className="w-full">
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              Gérer les documents
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
} 