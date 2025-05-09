// Gestionnaire global de toast
import { toast as sonnerToast } from 'sonner'
import { ToastProps } from './use-toast'

let toastFunction: (props: ToastProps) => void = (props) => {
  // Convertir props en appel sonner
  const { title, description, variant, duration } = props
  if (variant === 'destructive') {
    sonnerToast.error(title, {
      description,
      duration: duration || 3000
    })
  } else {
    sonnerToast(title, {
      description,
      duration: duration || 3000
    })
  }
}

export function registerToast(fn: (props: ToastProps) => void) {
  toastFunction = fn
}

export function toast(props: ToastProps) {
  toastFunction(props)
  return ""
} 