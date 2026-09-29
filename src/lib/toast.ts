import { useSyncExternalStore } from "react"

// Petites notifications en bas de l'écran (« Lien copié », « Message envoyé »…)

export type Toast = { id: number; message: string; tone: "success" | "error" | "info" }

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

export const dismissToast = (id: number) => {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export const toast = (message: string, tone: Toast["tone"] = "info") => {
  const id = nextId++
  toasts = [...toasts.slice(-2), { id, message, tone }]
  emit()
  setTimeout(() => dismissToast(id), tone === "error" ? 6000 : 3500)
}

export const useToasts = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => toasts,
  )
