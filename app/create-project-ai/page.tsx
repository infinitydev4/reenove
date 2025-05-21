"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import ChatContainer from "@/components/chat/ChatContainer"

export default function AIProjectCreationPage() {
  const router = useRouter()

  // Fonction pour sauvegarder le projet et rediriger
  const saveProjectAndRedirect = async (projectData: any) => {
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
      
      // Rediriger vers le tableau de bord
      router.push("/dashboard")
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du projet:", error)
      throw error
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <div className="md:block hidden md:max-w-5xl md:w-full md:mx-auto">
        <PageHeader
          title="Créez votre projet avec notre assistant IA"
          description="Notre assistant intelligent vous guide étape par étape pour créer votre projet"
          className="mb-4 mt-4"
        />
      </div>
      
      <div className="flex-1 h-full overflow-hidden w-full md:mb-4">
        <ChatContainer onSaveProject={saveProjectAndRedirect} />
      </div>
    </div>
  )
} 