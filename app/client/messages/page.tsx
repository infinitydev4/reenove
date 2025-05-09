"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Mail, 
  Search, 
  ArrowLeft, 
  Send, 
  MoreHorizontal, 
  Clock, 
  LayoutList,
  Check,
  CheckCheck,
  Filter
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  recipient: {
    id: string
    name: string
    avatar: string
  }
  lastMessage: {
    content: string
    timestamp: string
    isRead: boolean
    isFromMe: boolean
  }
  projectTitle?: string
  messages: Message[]
}

interface Message {
  id: string
  content: string
  timestamp: string
  isFromMe: boolean
  status: "sending" | "sent" | "delivered" | "read"
}

export default function ClientMessagesPage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "conv-1",
      recipient: {
        id: "artisan-1",
        name: "Martin Dupont",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      lastMessage: {
        content: "Bonjour, pouvez-vous me donner plus d&apos;informations sur votre projet ?",
        timestamp: "10:32",
        isRead: false,
        isFromMe: false,
      },
      projectTitle: "Rénovation salle de bain",
      messages: [
        {
          id: "msg-1",
          content: "Bonjour, je suis intéressé par votre projet de rénovation.",
          timestamp: "Hier, 09:15",
          isFromMe: false,
          status: "read",
        },
        {
          id: "msg-2",
          content: "Bonjour ! Oui, j&apos;aimerais rénover ma salle de bain.",
          timestamp: "Hier, 09:20",
          isFromMe: true,
          status: "read",
        },
        {
          id: "msg-3",
          content: "Pouvez-vous me préciser vos besoins ? S&apos;agit-il d&apos;une rénovation complète ou partielle ?",
          timestamp: "Hier, 09:25",
          isFromMe: false,
          status: "read",
        },
        {
          id: "msg-4",
          content: "Je souhaite une rénovation complète. Changer la baignoire pour une douche à l&apos;italienne, refaire le carrelage et installer un nouveau meuble vasque.",
          timestamp: "Hier, 09:30",
          isFromMe: true,
          status: "read",
        },
        {
          id: "msg-5",
          content: "Bonjour, pouvez-vous me donner plus d&apos;informations sur votre projet ?",
          timestamp: "10:32",
          isFromMe: false,
          status: "read",
        },
      ],
    },
    {
      id: "conv-2",
      recipient: {
        id: "artisan-2",
        name: "Sophie Martin",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      lastMessage: {
        content: "Merci pour les informations. Je vous envoie mon devis demain.",
        timestamp: "Hier",
        isRead: true,
        isFromMe: false,
      },
      projectTitle: "Peinture salon",
      messages: [
        {
          id: "msg-1",
          content: "Bonjour, je suis intéressée par votre projet de peinture.",
          timestamp: "Il y a 2 jours, 15:10",
          isFromMe: false,
          status: "read",
        },
        {
          id: "msg-2",
          content: "Bonjour ! Je souhaite repeindre mon salon.",
          timestamp: "Il y a 2 jours, 15:20",
          isFromMe: true,
          status: "read",
        },
        {
          id: "msg-3",
          content: "Quelle est la surface à peindre ? Et avez-vous déjà choisi les couleurs ?",
          timestamp: "Il y a 2 jours, 15:25",
          isFromMe: false,
          status: "read",
        },
        {
          id: "msg-4",
          content: "La pièce fait environ 25m². Je souhaite un blanc cassé pour les murs et conserver le plafond blanc.",
          timestamp: "Il y a 2 jours, 16:00",
          isFromMe: true,
          status: "read",
        },
        {
          id: "msg-5",
          content: "Merci pour les informations. Je vous envoie mon devis demain.",
          timestamp: "Hier, 10:15",
          isFromMe: false,
          status: "read",
        },
      ],
    },
    {
      id: "conv-3",
      recipient: {
        id: "artisan-3",
        name: "Jean Durand",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      lastMessage: {
        content: "Je suis disponible lundi à 14h pour visiter votre cuisine. Cela vous convient-il ?",
        timestamp: "20/05",
        isRead: true,
        isFromMe: false,
      },
      projectTitle: "Installation cuisine",
      messages: [
        {
          id: "msg-1",
          content: "Bonjour, j&apos;ai vu votre demande concernant une installation de cuisine.",
          timestamp: "20/05, 09:00",
          isFromMe: false,
          status: "read",
        },
        {
          id: "msg-2",
          content: "Bonjour ! Effectivement, je cherche quelqu&apos;un pour installer ma nouvelle cuisine.",
          timestamp: "20/05, 09:15",
          isFromMe: true,
          status: "read",
        },
        {
          id: "msg-3",
          content: "Je suis disponible lundi à 14h pour visiter votre cuisine. Cela vous convient-il ?",
          timestamp: "20/05, 10:20",
          isFromMe: false,
          status: "read",
        },
      ],
    },
  ])

  // Tri des conversations par dernier message non lu puis par date
  const sortedConversations = [...conversations].sort((a, b) => {
    if (!a.lastMessage.isRead && b.lastMessage.isRead) return -1
    if (a.lastMessage.isRead && !b.lastMessage.isRead) return 1
    return 0
  })

  // Scroll automatique vers le bas quand un nouveau message est ajouté
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedConversation?.messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    // Ajouter le message à la conversation sélectionnée
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          content: newMessage,
          timestamp: "À l&apos;instant",
          isFromMe: true,
          status: "sent"
        }
        
        return {
          ...conv,
          lastMessage: {
            content: newMessage,
            timestamp: "À l&apos;instant",
            isRead: true,
            isFromMe: true
          },
          messages: [...conv.messages, newMsg]
        }
      }
      return conv
    })
    
    setConversations(updatedConversations)
    setSelectedConversation(updatedConversations.find(c => c.id === selectedConversation.id) || null)
    setNewMessage("")
  }

  const handleSelectConversation = (conv: Conversation) => {
    // Marquer les messages comme lus
    const updatedConversations = conversations.map(c => {
      if (c.id === conv.id && !c.lastMessage.isRead && !c.lastMessage.isFromMe) {
        return { ...c, lastMessage: { ...c.lastMessage, isRead: true } }
      }
      return c
    })
    setConversations(updatedConversations)
    setSelectedConversation(conv)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  const ConversationList = ({ conversations = sortedConversations }: { conversations?: Conversation[] }) => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un message..."
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-8">
            <TabsTrigger value="all" className="text-xs">Toutes</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Non lues</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto">
        {conversations.length > 0 ? (
          <div className="divide-y">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "hover:bg-muted/50 transition-colors cursor-pointer p-3",
                  selectedConversation?.id === conv.id && "bg-muted"
                )}
                onClick={() => handleSelectConversation(conv)}
              >
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.recipient.avatar} alt={conv.recipient.name} />
                    <AvatarFallback>{conv.recipient.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className="font-medium text-sm truncate">{conv.recipient.name}</p>
                      <p className="text-xs text-muted-foreground shrink-0">{conv.lastMessage.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {conv.projectTitle && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 truncate max-w-[100px]">
                          {conv.projectTitle}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground truncate max-w-[210px]">
                        {conv.lastMessage.isFromMe && "Vous: "}
                        {conv.lastMessage.content}
                      </p>
                      {!conv.lastMessage.isRead && !conv.lastMessage.isFromMe && (
                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <Mail className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-base font-medium">Aucune conversation</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Vous n&apos;avez pas encore de conversations avec des artisans.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const ConversationView = () => {
    if (!selectedConversation) return null

    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-3 border-b flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToList} className="md:hidden h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={selectedConversation.recipient.avatar} alt={selectedConversation.recipient.name} />
            <AvatarFallback>{selectedConversation.recipient.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium text-sm truncate">{selectedConversation.recipient.name}</p>
            {selectedConversation.projectTitle && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                {selectedConversation.projectTitle}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {selectedConversation.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex flex-col max-w-[75%] text-sm",
                message.isFromMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "px-3 py-2 rounded-lg",
                  message.isFromMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p>{message.content}</p>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <p>{message.timestamp}</p>
                {message.isFromMe && (
                  <>
                    {message.status === "sending" && (
                      <Clock className="h-3 w-3" />
                    )}
                    {message.status === "sent" && (
                      <Check className="h-3 w-3" />
                    )}
                    {message.status === "delivered" && (
                      <CheckCheck className="h-3 w-3" />
                    )}
                    {message.status === "read" && (
                      <CheckCheck className="h-3 w-3 text-blue-500" />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2">
          <Input
            type="text"
            placeholder="Écrivez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center h-10 mb-3">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Messages
        </h1>
        <Button size="sm" variant="outline" asChild className="h-8">
          <Link href="/client/projets">
            <LayoutList className="h-4 w-4 mr-2" />
            Mes projets
          </Link>
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden">
        <div className="flex h-full">
          <div className={cn(
            "border-r w-full md:w-80 lg:w-96 flex-shrink-0",
            selectedConversation ? "hidden md:block" : "block"
          )}>
            <ConversationList />
          </div>
          <div className={cn(
            "flex-1",
            selectedConversation ? "block" : "hidden md:block"
          )}>
            {selectedConversation ? (
              <ConversationView />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Mail className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">Sélectionnez une conversation</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Choisissez une conversation dans la liste ou commencez une nouvelle discussion.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
} 