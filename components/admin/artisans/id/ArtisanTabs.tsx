import { Briefcase, FileText, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArtisanProjectsTab } from "./tabs/ArtisanProjectsTab"
import { ArtisanDocumentsTab } from "./tabs/ArtisanDocumentsTab"
import { ArtisanHistoryTab } from "./tabs/ArtisanHistoryTab"

type Project = {
  id: string
  title: string
  status: string
  amount: string
  clientName: string
  startDate: string
  endDate?: string
}

type Document = {
  id: string
  name: string
  type: string
  status: string
  uploadDate: string
  expiryDate?: string
  fileUrl?: string
}

type ArtisanTabsProps = {
  artisanId: string
  projects: Project[]
  documents: Document[]
  onDocumentDownload: (document: Document) => void
  onDownloadAllDocuments: () => void
}

export function ArtisanTabs({
  artisanId,
  projects,
  documents,
  onDocumentDownload,
  onDownloadAllDocuments
}: ArtisanTabsProps) {
  return (
    <Tabs defaultValue="projects" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="projects" className="flex items-center gap-1">
          <Briefcase className="h-4 w-4" />
          <span>Projets</span>
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>Documents</span>
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-1">
          <History className="h-4 w-4" />
          <span>Historique</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="projects">
        <ArtisanProjectsTab projects={projects} />
      </TabsContent>
      
      <TabsContent value="documents">
        <ArtisanDocumentsTab 
          documents={documents} 
          artisanId={artisanId}
          onDocumentDownload={onDocumentDownload}
          onDownloadAllDocuments={onDownloadAllDocuments}
        />
      </TabsContent>
      
      <TabsContent value="history">
        <ArtisanHistoryTab />
      </TabsContent>
    </Tabs>
  )
} 