"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import IntelligentChatContainer from "@/components/chat/IntelligentChatContainer"

export default function AIProjectCreationPage() {
  const router = useRouter()

  // Fonction pour sauvegarder le projet SANS redirection automatique
  const saveProjectOnly = async (projectData: any) => {
    try {
      // Enregistrer le projet dans la base de données
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })
      
      if (!response.ok) {
        throw new Error("Erreur lors de la création du projet")
      }
      
      // PAS de redirection automatique - c'est géré dans IntelligentChatContainer
      console.log("✅ Projet sauvegardé avec succès - redirection manuelle uniquement")
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du projet:", error)
      throw error
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header uniquement sur desktop */}
      <div className="hidden md:block flex-shrink-0 px-4 py-4">
        <PageHeader
          title="Créez votre projet avec notre assistant IA intelligent"
          description="Notre assistant autonome s'adapte à vos réponses pour créer le devis parfait"
        />
      </div>
      
      {/* Chat container qui prend tout l'espace restant */}
      <div className="flex-1 overflow-hidden">
        <IntelligentChatContainer onSaveProject={saveProjectOnly} />
      </div>
    </div>
  )
} 