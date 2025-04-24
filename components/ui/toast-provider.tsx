"use client"

import { ReactNode, createContext, useContext, useState, useCallback, useEffect } from "react"
import { X } from "lucide-react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  visible: boolean
}

type ToastContextType = {
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) =>
      toasts.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    )

    setTimeout(() => {
      setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
    }, 300) // Transition time
  }, [])

  const toast = useCallback(
    ({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9)
      
      setToasts((toasts) => [
        ...toasts,
        { id, title, description, variant, duration, visible: true },
      ])

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id)
        }, duration)
      }

      return id
    },
    [dismiss]
  )

  useEffect(() => {
    return () => {
      toasts.forEach((toast) => {
        if (toast.visible) {
          dismiss(toast.id)
        }
      })
    }
  }, [dismiss, toasts])

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="fixed top-0 right-0 z-50 flex flex-col p-4 gap-2 max-w-md w-full">
      {toasts.map(
        (toast) =>
          toast.visible && (
            <div
              key={toast.id}
              className={`p-4 rounded-md shadow-lg text-white transform transition-all duration-300 ${
                toast.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              } ${
                toast.variant === "destructive"
                  ? "bg-red-600"
                  : "bg-slate-800"
              }`}
            >
              <div className="flex justify-between items-start">
                {toast.title && <h3 className="font-medium">{toast.title}</h3>}
                <button
                  onClick={() => dismiss(toast.id)}
                  className="ml-auto -mr-1 text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {toast.description && (
                <div className="mt-1 text-sm text-white/90">{toast.description}</div>
              )}
            </div>
          )
      )}
    </div>
  )
} 