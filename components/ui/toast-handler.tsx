"use client"

import { ToastProps } from "./toast"

// Instance globale pour la fonction toast
let toastFn: ((props: ToastProps) => void) | null = null

// Pour enregistrer la fonction toast depuis le contexte
export const registerToast = (fn: (props: ToastProps) => void) => {
  toastFn = fn
}

// Fonction simple pour appeler toast depuis n'importe où
export const toast = (props: ToastProps) => {
  if (toastFn) {
    toastFn(props)
  } else {
    console.warn("Toast n'est pas initialisé. Assurez-vous d'utiliser ToastProvider.")
  }
} 