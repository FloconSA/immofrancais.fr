import { useSyncExternalStore } from "react"

export type Theme = "light" | "dark"

// Apparence par défaut : ivoire (claire) pour tout le monde, quel que soit le réglage de l'appareil.
// Le choix fait avec le bouton soleil / lune est retenu sous cette clé (lue aussi dans index.html).
const STORAGE_KEY = "apparence"
const THEME_COLORS: Record<Theme, string> = { light: "#F8F5EF", dark: "#13213A" }

const listeners = new Set<() => void>()

export const currentTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light"

const apply = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme])
  listeners.forEach((listener) => listener())
}

/**
 * Change de thème. Avec `origin` (position du bouton), le nouveau thème
 * se dévoile en cercle depuis le bouton, sur les navigateurs qui le permettent.
 */
export const setTheme = (theme: Theme, origin?: { x: number; y: number }) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* navigation privée : le choix ne sera simplement pas retenu */
  }

  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (!doc.startViewTransition || reduced || !origin) {
    apply(theme)
    return
  }

  const root = document.documentElement
  root.classList.add("theme-transition")
  const transition = doc.startViewTransition(() => apply(theme))
  const radius = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y))
  transition.ready
    .then(() => {
      const keyframes = { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] }
      const timing = { duration: 650, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      root.animate(keyframes, { ...timing, pseudoElement: "::view-transition-new(root)" })
      root.animate(keyframes, { ...timing, pseudoElement: "::view-transition-new(site-header)" })
    })
    .catch(() => {})
  transition.finished.finally(() => root.classList.remove("theme-transition"))
}

export const useTheme = () =>
  useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    currentTheme,
  )
