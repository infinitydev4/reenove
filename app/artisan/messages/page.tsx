"use client"

import React, { useState } from "react"
import {
  MessageSquare,
  Search,
  Filter,
  ChevronLeft,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Image,
  Smile
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Contact, Message, Conversation, ConversationMessage } from "@/types/message"

export default function ArtisanMessagesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showConversationList, setShowConversationList] = useState(true)

  // Données fictives pour les conversations
  const conversations: Conversation[] = [
    {
      id: "conv-1",
      contact: {
        id: "user-1",
        name: "Lucie Petit",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "online"
      },
      lastMessage: {
        content: "Bonjour, je souhaiterais des précisions sur le devis que vous m'avez envoyé pour la rénovation de ma salle de bain.",
        time: "09:45",
        date: "Aujourd'hui",
        isRead: false,
        isSent: false
      },
      project: "Rénovation salle de bain",
      unreadCount: 2
    },
    {
      id: "conv-2",
      contact: {
        id: "user-2",
        name: "Thomas Leroy",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "offline"
      },
      lastMessage: {
        content: "Merci pour votre intervention rapide. Le problème est bien résolu, je vous recommanderai à mes amis.",
        time: "18:20",
        date: "Hier",
        isRead: true,
        isSent: false
      },
      project: "Réparation plomberie",
      unreadCount: 0
    },
    {
      id: "conv-3",
      contact: {
        id: "user-3",
        name: "Marie Dubois",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "offline"
      },
      lastMessage: {
        content: "Quand pourriez-vous passer pour établir un devis pour l'installation de la cuisine ?",
        time: "14:15",
        date: "Hier",
        isRead: true,
        isSent: false
      },
      project: "Installation cuisine",
      unreadCount: 0
    },
    {
      id: "conv-4",
      contact: {
        id: "user-4",
        name: "Martin Bernard",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "offline"
      },
      lastMessage: {
        content: "J'ai validé le devis pour l'isolation des combles. Quand pouvez-vous commencer les travaux ?",
        time: "10:30",
        date: "12/05/2024",
        isRead: true,
        isSent: false
      },
      project: "Isolation combles",
      unreadCount: 0
    },
    {
      id: "conv-5",
      contact: {
        id: "user-5",
        name: "Sophie Martin",
        avatar: "/placeholder.svg?height=40&width=40",
        status: "online"
      },
      lastMessage: {
        content: "Nous avons bien reçu votre offre pour la terrasse. Nous aimerions discuter de quelques modifications.",
        time: "16:45",
        date: "11/05/2024",
        isRead: false,
        isSent: false
      },
      project: "Construction terrasse",
      unreadCount: 1
    }
  ]

  // Messages de la conversation sélectionnée
  const conversationMessages: ConversationMessage[] = [
    {
      id: "msg-1",
      content: "Bonjour, je souhaiterais des précisions sur le devis que vous m'avez envoyé pour la rénovation de ma salle de bain.",
      time: "09:45",
      date: "Aujourd'hui",
      isSent: false,
      sender: "user-1"
    },
    {
      id: "msg-2",
      content: "Je trouve le montant un peu élevé pour le carrelage. Pourriez-vous me détailler ce poste ?",
      time: "09:46",
      date: "Aujourd'hui",
      isSent: false,
      sender: "user-1"
    },
    {
      id: "msg-3",
      content: "Bonjour Mme Petit, bien sûr. Le carrelage que nous avons sélectionné est un grès cérame de haute qualité, résistant à l'eau et antidérapant, ce qui explique son prix.",
      time: "10:15",
      date: "Aujourd'hui",
      isSent: true,
      sender: "artisan"
    },
    {
      id: "msg-4",
      content: "Si vous le souhaitez, je peux vous proposer d'autres alternatives moins coûteuses tout en gardant une bonne qualité.",
      time: "10:16",
      date: "Aujourd'hui",
      isSent: true,
      sender: "artisan"
    }
  ]

  // Filtrer les conversations en fonction du terme de recherche
  const filteredConversations = conversations.filter(
    conv => 
      conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Trier les conversations: non lues d'abord, puis par date
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1
    return 0
  })

  // Gérer l'envoi d'un nouveau message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    console.log("Message envoyé:", newMessage)
    setNewMessage("")
  }

  // Sélectionner une conversation au clic
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    setShowConversationList(false) // Masquer la liste sur mobile lors de la sélection
  }

  // Revenir à la liste des conversations
  const handleBackToList = () => {
    setShowConversationList(true)
  }

  // Afficher la liste des conversations
  const ConversationList = ({ conversations = sortedConversations }: { conversations?: Conversation[] }) => (
    <div className="space-y-2">
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <div 
            key={conv.id} 
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              selectedConversation?.id === conv.id 
                ? "bg-primary/10" 
                : "hover:bg-muted"
            }`}
            onClick={() => handleSelectConversation(conv)}
          >
            <div className="flex gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conv.contact.avatar} alt={conv.contact.name} />
                  <AvatarFallback>{conv.contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {conv.contact.status === "online" && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm truncate">{conv.contact.name}</span>
                  <div className="flex items-center gap-1">
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 rounded-full h-4">
                        {conv.unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{conv.lastMessage.time}</span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-1">
                  {conv.project}
                </div>
                
                <p className={`text-xs ${conv.unreadCount > 0 ? "font-medium" : "text-muted-foreground"} line-clamp-1`}>
                  {conv.lastMessage.isSent && "Vous: "}{conv.lastMessage.content}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">Aucune conversation trouvée</p>
        </div>
      )}
    </div>
  )

  // Afficher le contenu d'une conversation
  const ConversationView = () => {
    if (!selectedConversation) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6">
          <div className="bg-muted rounded-full p-3 mb-4">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-medium mb-2">Sélectionnez une conversation</h3>
          <p className="text-muted-foreground text-xs max-w-sm">
            Choisissez une conversation dans la liste pour afficher les messages.
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col h-full">
        {/* Header de la conversation */}
        <div className="py-2 px-3 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={handleBackToList}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedConversation.contact.avatar} alt={selectedConversation.contact.name} />
              <AvatarFallback>{selectedConversation.contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium text-sm truncate">{selectedConversation.contact.name}</div>
              <div className="text-xs text-muted-foreground truncate">{selectedConversation.project}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Phone className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Video className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {conversationMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg py-2 px-3 ${
                  msg.isSent 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className={`text-xs mt-1 text-right ${
                  msg.isSent ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Formulaire d'envoi de message */}
        <div className="p-2 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Input
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-8 h-9 text-sm"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6">
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button type="submit" size="icon" className="h-8 w-8" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec titre et bouton nouveau */}
      <div className="flex justify-between items-center h-10 mb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Messages
        </h1>
        <Button size="sm" className="h-8 px-3 py-0">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nouveau
        </Button>
      </div>

      {/* Barre de recherche et filtre */}
      <div className="flex mb-3 h-9">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-9 pr-12 rounded-r-none h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0 rounded-l-none border-l-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Conteneur principal avec carte de conversation et chat */}
      <div className="flex-1 min-h-0">
        {/* Vue liste des conversations */}
        {showConversationList ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="py-2 px-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-sm">Conversations</CardTitle>
                  <CardDescription className="text-xs">
                    {sortedConversations.length} contact{sortedConversations.length > 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 overflow-y-auto flex-1 min-h-0">
              <Tabs defaultValue="all" className="h-full flex flex-col">
                <TabsList className="w-full grid grid-cols-2 h-8 mb-2 p-0.5">
                  <TabsTrigger value="all" className="text-xs py-1">Tous</TabsTrigger>
                  <TabsTrigger value="unread" className="relative text-xs py-1">
                    Non lus
                    {sortedConversations.filter(c => c.unreadCount > 0).length > 0 && (
                      <Badge variant="default" className="ml-1 px-1 py-0 rounded-full text-[8px] h-3.5">
                        {sortedConversations.filter(c => c.unreadCount > 0).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0 flex-1 min-h-0 overflow-auto">
                  <ConversationList />
                </TabsContent>
                
                <TabsContent value="unread" className="mt-0 flex-1 min-h-0 overflow-auto">
                  <ConversationList 
                    conversations={sortedConversations.filter(c => c.unreadCount > 0)} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          /* Vue de la conversation */
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
              <ConversationView />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 