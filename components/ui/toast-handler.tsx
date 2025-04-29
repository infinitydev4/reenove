"use client"

import { ToastProps } from "./toast"

let toastFn: ((props: ToastProps) => void) | null = null

export const setToastHandler = (fn: (props: ToastProps) => void) => {
  toastFn = fn
}

export const toast = (props: ToastProps) => {
  if (toastFn) {
    toastFn(props)
  } else {
    console.warn("Toast handler not set. Make sure ToastProvider is mounted.")
  }
} 