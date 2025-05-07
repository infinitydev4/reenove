"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { X } from "lucide-react"
import { cva, VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { registerToast } from "./toast-handler"

const ToastVariants = cva(
  "pointer-events-auto relative w-full max-w-md rounded-lg border p-4 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-gray-950 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-50",
        destructive: "destructive border-red-500/50 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-900/30 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps extends VariantProps<typeof ToastVariants> {
  title?: string
  description?: string
  action?: React.ReactNode
  duration?: number
}

interface ToastContextType {
  toast: (props: ToastProps) => void
  dismiss: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function Toast({
  title,
  description,
  action,
  variant,
  ...props
}: ToastProps) {
  return (
    <div
      className={cn(ToastVariants({ variant }))}
      {...props}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
      {action}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastState, setToastState] = useState<ToastProps | null>(null)
  const [visible, setVisible] = useState(false)
  let timeout: NodeJS.Timeout | null = null

  const showToast = (props: ToastProps) => {
    if (timeout) clearTimeout(timeout)
    setToastState(props)
    setVisible(true)

    timeout = setTimeout(() => {
      setVisible(false)
      setTimeout(() => setToastState(null), 300) // Time for animation to complete
    }, props.duration || 3000)
  }

  const dismissToast = () => {
    if (timeout) clearTimeout(timeout)
    setVisible(false)
    setTimeout(() => setToastState(null), 300)
  }

  // Enregistrer la fonction globale toast
  useEffect(() => {
    registerToast(showToast)
  }, [])

  return (
    <ToastContext.Provider
      value={{
        toast: showToast,
        dismiss: dismissToast,
      }}
    >
      {children}
      {toastState && (
        <div className="fixed bottom-4 right-4 z-50 flex max-w-md flex-col gap-2 pointer-events-auto">
          <div className={cn("transition-all duration-300", visible ? "opacity-100" : "opacity-0")}>
            <Toast {...toastState} action={
              <button
                onClick={dismissToast}
                className="absolute top-2 right-2 rounded-md p-1 text-gray-500 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            } />
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { toast } from "./toast-handler" 