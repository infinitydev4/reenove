// Hooks for controlling the toast
import { useContext, createContext } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToasterToast = ToastProps & {
  id: string
  action?: React.ReactNode
}

type ToastActionElement = React.ReactElement<HTMLButtonElement>

type ToastContextType = {
  toast: (props: ToastProps) => void
  dismiss: (toastId?: string) => void
  toasts: ToasterToast[]
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  
  if (context === null) {
    const dummyFunction = () => {} 
    return {
      toast: (props: ToastProps) => {
        console.warn("Toast provider not found. Make sure your app is wrapped in the ToastProvider.")
        return ""
      },
      dismiss: dummyFunction,
      toasts: []
    }
  }
  
  return context
} 