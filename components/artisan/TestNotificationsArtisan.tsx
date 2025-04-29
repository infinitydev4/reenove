"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from '@/components/ui/toast'
import { Loader2, CheckCircle, AlertCircle, Info, AlertTriangle, Send } from 'lucide-react'

export function TestNotificationsArtisan() {
  const [title, setTitle] = useState("Nouveau message client")
  const [message, setMessage] = useState("Vous avez reçu un nouveau message concernant votre devis.")
  const [type, setType] = useState<'success' | 'info' | 'warning' | 'error'>('info')
  const [isLoading, setIsLoading] = useState(false)

  const sendNotification = async () => {
    if (!title || !message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/notifications/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          type,
          link: '/artisan/messages'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Notification envoyée avec succès",
          variant: "default"
        })
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-title">Titre</Label>
            <Input
              id="notification-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de la notification"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notification-message">Message</Label>
            <Input
              id="notification-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message de la notification"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Type de notification</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as 'success' | 'info' | 'warning' | 'error')}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="success" id="notification-success" />
                <Label htmlFor="notification-success" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Succès
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="info" id="notification-info" />
                <Label htmlFor="notification-info" className="flex items-center gap-1">
                  <Info className="h-4 w-4 text-blue-500" />
                  Information
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warning" id="notification-warning" />
                <Label htmlFor="notification-warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Avertissement
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="error" id="notification-error" />
                <Label htmlFor="notification-error" className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Erreur
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            onClick={sendNotification} 
            disabled={isLoading || !title || !message}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Envoyer la notification
              </>
            )}
          </Button>
        </div>
        
        <div>
          <Card className="p-4 h-full flex flex-col">
            <div className="text-sm font-medium text-muted-foreground mb-2">Aperçu de la notification</div>
            <div className="border rounded-lg p-4 flex-1 bg-card">
              <div className="flex items-start gap-3 mb-4">
                <div className="mt-0.5">
                  {getTypeIcon()}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{title || "Titre de la notification"}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message || "Message de la notification"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    À l'instant
                  </p>
                </div>
              </div>
              <div className="text-xs text-primary hover:underline cursor-pointer">
                Voir les détails
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 