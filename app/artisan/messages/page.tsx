"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Search, Filter, User, Phone, Video, MoreVertical, Send, Plus, AlertCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

interface Contact {
  name: string
  avatar: string
  status: string
}

interface LastMessage {
  content: string
  timestamp: string
  isRead: boolean
}

interface Conversation {
  id: string
  contact: Contact
  lastMessage: LastMessage
  unreadCount: number
  projectTitle: string
}

export default function ArtisanMessagesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les conversations depuis l'API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/artisan/messages')
        const data = await response.json()
        
        if (data.success) {
          setConversations(data.conversations)
          // Sélectionner la première conversation par défaut
          if (data.conversations.length > 0) {
            setSelectedConversation(data.conversations[0].id)
          }
        } else {
          setError(data.error || "Erreur lors du chargement des conversations")
        }
      } catch (err) {
        console.error("Erreur lors du chargement des conversations:", err)
        setError("Erreur lors du chargement des conversations")
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [])

  // Filtrer les conversations selon le terme de recherche
  const filteredConversations = conversations.filter(conv =>
    conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Conversation active
  const activeConversation = conversations.find(conv => conv.id === selectedConversation)

  // Affichage du loading
  if (loading) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-[#FCDA89]" />
              Messages
            </h1>
            <p className="text-sm text-white/70">Communiquez avec vos clients</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCDA89] mx-auto mb-2"></div>
            <p>Chargement des conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-[#FCDA89]" />
              Messages
            </h1>
            <p className="text-sm text-white/70">Communiquez avec vos clients</p>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/70">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-[#FCDA89]" />
            Messages
          </h1>
          <p className="text-sm text-white/70">Communiquez avec vos clients</p>
        </div>
        
        <Button className="bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C] font-medium">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
          <Input
            placeholder="Rechercher une conversation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0E261C] border-[#FCDA89]/30 text-white placeholder:text-white/70"
          />
        </div>
        <Button variant="outline" size="sm" className="bg-[#0E261C] border-[#FCDA89]/30 text-white hover:bg-[#FCDA89]/10">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Interface de chat */}
      <div className="flex-1 min-h-0">
        <Card className="h-full flex flex-col bg-[#0E261C] border-[#FCDA89]/30 text-white">
          <CardContent className="p-0 overflow-hidden flex-1">
            <Tabs defaultValue="all" className="h-full flex flex-col">
              <div className="px-3 pt-2">
                <TabsList className="w-full grid grid-cols-3 h-8 mb-2 p-0.5 bg-[#0E261C] border border-[#FCDA89]/30">
                  <TabsTrigger value="all" className="text-xs py-1 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
                    Toutes
                    {filteredConversations.length > 0 && (
                      <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5 bg-[#FCDA89]/20 text-[#FCDA89]">
                        {filteredConversations.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs py-1 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
                    Non lues
                    <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5 bg-[#FCDA89]/20 text-[#FCDA89]">
                      0
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="important" className="text-xs py-1 data-[state=active]:bg-[#FCDA89] data-[state=active]:text-[#0E261C] text-white">
                    Importantes
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-hidden flex min-h-0">
                <TabsContent value="all" className="flex-1 mt-0 flex min-h-0">
                  <div className="w-80 border-r border-[#FCDA89]/30 overflow-hidden flex flex-col">
                    {/* Liste des conversations */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {filteredConversations.length > 0 ? (
                        filteredConversations.map((conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedConversation === conversation.id 
                                ? 'bg-[#FCDA89]/20 border border-[#FCDA89]/30' 
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={conversation.contact.avatar} alt={conversation.contact.name} />
                                  <AvatarFallback className="bg-[#FCDA89]/20 text-white text-sm">
                                    {conversation.contact.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0E261C] ${
                                  conversation.contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                                }`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-sm text-white truncate">{conversation.contact.name}</h4>
                                  <span className="text-xs text-white/70">{conversation.lastMessage.timestamp}</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-white/70 truncate">{conversation.lastMessage.content}</p>
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="default" className="ml-2 px-1.5 py-0 rounded-full text-[10px] h-4 bg-[#FCDA89] text-[#0E261C]">
                                      {conversation.unreadCount}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-xs text-[#FCDA89] mt-1 truncate">
                                  Projet: {conversation.projectTitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/70">
                          <MessageCircle className="h-8 w-8 mb-2 text-[#FCDA89]" />
                          <p className="text-sm">Aucune conversation</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Zone de chat */}
                  <div className="flex-1 flex flex-col min-h-0">
                    {activeConversation ? (
                      <>
                        {/* En-tête de conversation */}
                        <div className="p-4 border-b border-[#FCDA89]/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={activeConversation.contact.avatar} alt={activeConversation.contact.name} />
                                <AvatarFallback className="bg-[#FCDA89]/20 text-white text-sm">
                                  {activeConversation.contact.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-white">{activeConversation.contact.name}</h3>
                                <p className="text-xs text-white/70">
                                  Projet: {activeConversation.projectTitle}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                                <Video className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-[#FCDA89] hover:bg-[#FCDA89]/10">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto">
                          <div className="space-y-4">
                            {/* Message du client */}
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={activeConversation.contact.avatar} alt={activeConversation.contact.name} />
                                <AvatarFallback className="bg-[#FCDA89]/20 text-white text-sm">
                                  {activeConversation.contact.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-white/10 rounded-lg p-3 max-w-xs">
                                  <p className="text-sm text-white">{activeConversation.lastMessage.content}</p>
                                </div>
                                <p className="text-xs text-white/70 mt-1">{activeConversation.lastMessage.timestamp}</p>
                              </div>
                            </div>

                            {/* Message d'exemple de réponse */}
                            <div className="flex items-start gap-3 justify-end">
                              <div className="flex-1 flex justify-end">
                                <div className="bg-[#FCDA89] rounded-lg p-3 max-w-xs">
                                  <p className="text-sm text-[#0E261C]">
                                    Bonjour, je vous remercie pour votre demande. Je suis disponible pour discuter de votre projet.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Zone de saisie */}
                        <div className="p-4 border-t border-[#FCDA89]/30">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Tapez votre message..."
                              className="flex-1 bg-transparent border-white/20 text-white placeholder:text-white/70"
                            />
                            <Button size="sm" className="bg-[#FCDA89] hover:bg-[#FCDA89]/80 text-[#0E261C]">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center text-white/70">
                          <MessageCircle className="h-12 w-12 mb-4 text-[#FCDA89] mx-auto" />
                          <h3 className="font-medium mb-2">Sélectionnez une conversation</h3>
                          <p className="text-sm">Choisissez une conversation pour commencer à discuter</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="unread" className="flex-1 mt-0 flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <MessageCircle className="h-12 w-12 mb-4 text-[#FCDA89] mx-auto" />
                    <h3 className="font-medium mb-2">Aucun message non lu</h3>
                    <p className="text-sm">Tous vos messages ont été lus</p>
                  </div>
                </TabsContent>

                <TabsContent value="important" className="flex-1 mt-0 flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <MessageCircle className="h-12 w-12 mb-4 text-[#FCDA89] mx-auto" />
                    <h3 className="font-medium mb-2">Aucun message important</h3>
                    <p className="text-sm">Marquez vos messages importants ici</p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 