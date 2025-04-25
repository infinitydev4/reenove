import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')     // Remplace les espaces par des tirets
    .replace(/[^\w-]+/g, '')  // Supprime les caractères non-alphanumériques
    .replace(/--+/g, '-')     // Remplace les tirets multiples par un seul
    .replace(/^-+/, '')       // Supprime les tirets au début
    .replace(/-+$/, '');      // Supprime les tirets à la fin
}
