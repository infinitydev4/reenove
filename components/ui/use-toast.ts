// Hooks for controlling the toast with sonner
import { toast as sonnerToast } from "sonner"

export type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

export type ToastActionElement = React.ReactElement<HTMLButtonElement>

// Fonction compatible avec l'ancien format de toast
export function toast(props: ToastProps) {
  const { title, description, variant, duration } = props
  
  if (variant === "destructive") {
    return sonnerToast.error(title, {
      description,
      duration: duration || 3000
    })
  }
  
  return sonnerToast(title, {
    description,
    duration: duration || 3000
  })
}

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss
  }
} 