import { RefObject, useEffect, useRef, useState, useSyncExternalStore } from "react"

/* ------------------------------------------------------------------ */
/* Défilement de la page                                               */
/* ------------------------------------------------------------------ */

// Un seul écouteur de défilement pour tout le site
let lastY = typeof window !== "undefined" ? window.scrollY : 0
let headerHidden = false
const scrollListeners = new Set<() => void>()
let ticking = false

const onScroll = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    ticking = false
    const y = Math.max(0, window.scrollY)
    const delta = y - lastY
    if (y < 120) headerHidden = false
    else if (delta > 6) headerHidden = true
    else if (delta < -6) headerHidden = false
    if (Math.abs(delta) > 6 || y < 120) lastY = y
    scrollListeners.forEach((listener) => listener())
  })
}

const subscribeScroll = (listener: () => void) => {
  if (scrollListeners.size === 0) window.addEventListener("scroll", onScroll, { passive: true })
  scrollListeners.add(listener)
  return () => {
    scrollListeners.delete(listener)
    if (scrollListeners.size === 0) window.removeEventListener("scroll", onScroll)
  }
}

/** Vrai quand la page a défilé de plus de `threshold` pixels */
export const useScrolled = (threshold = 8) =>
  useSyncExternalStore(subscribeScroll, () => window.scrollY > threshold)

/** Vrai quand on descend dans la page (l'en-tête se range), faux quand on remonte */
export const useHeaderHidden = () => useSyncExternalStore(subscribeScroll, () => headerHidden)

/**
 * Écrit la progression du défilement (0 → 1) dans une variable CSS de l'élément,
 * sans re-dessiner React : idéal pour les effets liés au défilement.
 */
export const useScrollProgress = (
  ref: RefObject<HTMLElement | null>,
  progress: (rect: DOMRect, viewport: number) => number,
  variable = "--p",
) => {
  const compute = useRef(progress)
  compute.current = progress

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const value = compute.current(el.getBoundingClientRect(), window.innerHeight)
      el.style.setProperty(variable, Math.min(1, Math.max(0, value)).toFixed(4))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [ref, variable])
}

/* ------------------------------------------------------------------ */
/* Visibilité à l'écran                                                */
/* ------------------------------------------------------------------ */

/** Devient vrai (une fois pour toutes) quand l'élément entre à l'écran */
export const useInView = (ref: RefObject<Element | null>, rootMargin = "0px 0px -12% 0px") => {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    if (!("IntersectionObserver" in window)) {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, inView])
  return inView
}

/** Identifiant de la section actuellement visible (pour surligner le lien correspondant) */
export const useActiveSection = (ids: string[]) => {
  const [active, setActive] = useState<string | null>(null)
  const key = ids.join(",")
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!elements.length) return
    const visible = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting))
        const first = ids.find((id) => visible.get(id))
        setActive(first ?? null)
      },
      { rootMargin: "-35% 0px -60% 0px" },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return active
}

/* ------------------------------------------------------------------ */
/* Divers                                                              */
/* ------------------------------------------------------------------ */

/** Largeur et hauteur d'un élément, mises à jour quand il change de taille */
export const useSize = (ref: RefObject<Element | null>) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return size
}

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Fait « défiler » un nombre vers sa nouvelle valeur au lieu de sauter */
export const useTweenedNumber = (value: number, duration = 500) => {
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  const shownRef = useRef(value)
  shownRef.current = shown

  useEffect(() => {
    if (reducedMotion() || !Number.isFinite(value)) {
      setShown(value)
      return
    }
    from.current = shownRef.current
    const start = performance.now()
    let frame = requestAnimationFrame(function step(now) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      setShown(from.current + (value - from.current) * eased)
      if (t < 1) frame = requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return shown
}

/** Titre de l'onglet du navigateur */
export const useTitle = (title?: string) => {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = `${title} — ImmoFrançais`
    return () => {
      document.title = previous
    }
  }, [title])
}

export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (listener) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    },
    () => window.matchMedia(query).matches,
  )
