"use client"

import React, { FormEvent, ChangeEvent } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  onSend: (message?: string) => void
  disabled?: boolean
}

export default function ChatInput({ value, onChange, onSend, disabled }: ChatInputProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSend()
  }

  return (
    <div className="p-3 border-t sticky bottom-0 bg-background z-10">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2"
      >
        <Input
          value={value}
          onChange={onChange}
          placeholder="Écrivez votre message..."
          disabled={disabled}
          className="flex-1 bg-muted/30 border-muted focus-visible:ring-primary/30"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          className="bg-[#FCDA89] text-[#0E261C] hover:bg-[#FCDA89]/90"
          disabled={!value.trim() || disabled}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
} 