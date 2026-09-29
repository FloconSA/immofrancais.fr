import { useEffect, useState } from "react"
import { API_URL } from "../constants"

export type Photo = {
  /** Version « large » (1000 px), utilisée par défaut */
  src: string
  /** Toutes les tailles disponibles : le navigateur choisit la plus adaptée à l'écran */
  srcSet: string
  /** Photo originale, pour le plein écran */
  full: string
  /** Toute petite version, pour patienter pendant le chargement */
  placeholder: string
  width: number
  height: number
}

export type House = {
  id: string
  name: string
  type: string
  price: number
  rooms: number
  bedrooms: number
  surface: number
  description: string
  caracteristics: string[]
  facilities: string[]
  DPE?: string
  GES?: string
  city?: string
  photos: Photo[]
}

const absolute = (url?: string) => (!url ? "" : /^https?:\/\//.test(url) ? url : `${API_URL}${url}`)

// Strapi génère des versions réduites de chaque photo (thumbnail, small, medium, large).
export const toPhoto = (pic: any): Photo => {
  const formats = pic?.formats ?? {}
  const candidates = (["small", "medium", "large"] as const)
    .filter((key) => formats[key]?.url && formats[key]?.width)
    .map((key) => `${absolute(formats[key].url)} ${formats[key].width}w`)
  if (pic?.url && pic?.width) candidates.push(`${absolute(pic.url)} ${pic.width}w`)
  return {
    src: absolute(formats.large?.url ?? pic?.url),
    srcSet: candidates.join(", "),
    full: absolute(pic?.url),
    placeholder: absolute(formats.thumbnail?.url ?? formats.small?.url ?? pic?.url),
    width: pic?.width ?? 4,
    height: pic?.height ?? 3,
  }
}

const lines = (text?: string) =>
  (text ?? "").split("\n").map((line) => line.trim()).filter(Boolean)

const letter = (value?: string) => value?.trim().toUpperCase().match(/^[A-G]$/)?.[0]

export const parseHouse = (house: any): House => ({
  id: house.documentId,
  name: house.name ?? "",
  type: house.type ?? "",
  price: Number(house.price) || 0,
  rooms: Number(house.rooms) || 0,
  bedrooms: Number(house.bedrooms) || 0,
  surface: Number(house.surface) || 0,
  description: house.description ?? "",
  caracteristics: lines(house.caracteristics),
  facilities: lines(house.facilities),
  DPE: letter(house.DPE),
  GES: letter(house.GES),
  // Champ facultatif : si une « ville » est ajoutée un jour dans Strapi, elle sera utilisée pour la carte
  city: house.city ?? house.ville ?? undefined,
  photos: (house.images ?? [])
    .filter((pic: any) => !pic?.mime || pic.mime.startsWith("image/"))
    .map(toPhoto),
})

/* ------------------------------------------------------------------ */
/* Chargement des annonces : une seule requête, gardée en mémoire      */
/* ------------------------------------------------------------------ */

// Même adresse que le préchargement déclaré dans index.html
const HOUSES_URL = `${API_URL}/api/houses?sort=id:desc&populate=*`

let request: Promise<House[]> | null = null
let snapshot: House[] | undefined

export const loadHouses = () => {
  request ??= fetch(HOUSES_URL)
    .then((res) => {
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      return res.json()
    })
    .then((data) => (snapshot = (data.data ?? []).map(parseHouse)))
    .catch((error) => {
      request = null
      throw error
    })
  return request
}

export const useHouses = () => {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ houses?: House[]; error?: unknown }>(() => ({ houses: snapshot }))

  useEffect(() => {
    if (snapshot) {
      setState({ houses: snapshot })
      return
    }
    let alive = true
    setState({})
    loadHouses().then(
      (houses) => alive && setState({ houses }),
      (error) => alive && setState({ error }),
    )
    return () => {
      alive = false
    }
  }, [attempt])

  return {
    houses: state.houses,
    error: state.error,
    loading: !state.houses && !state.error,
    retry: () => setAttempt((n) => n + 1),
  }
}

export const useHouse = (id?: string) => {
  const cached = () => snapshot?.find((house) => house.id === id)
  const [state, setState] = useState<{ house?: House; notFound?: boolean; error?: unknown }>(() => ({ house: cached() }))

  useEffect(() => {
    const found = cached()
    if (found) {
      setState({ house: found })
      return
    }
    let alive = true
    setState({})
    ;(async () => {
      try {
        const list = await loadHouses().catch(() => undefined)
        let house = list?.find((h) => h.id === id)
        if (!house) {
          const res = await fetch(`${API_URL}/api/houses/${encodeURIComponent(id ?? "")}?populate=*`)
          if (res.status === 404) {
            if (alive) setState({ notFound: true })
            return
          }
          if (!res.ok) throw new Error(`Erreur ${res.status}`)
          house = parseHouse((await res.json()).data)
        }
        if (alive) setState({ house })
      } catch (error) {
        if (alive) setState({ error })
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  return state
}

/* ------------------------------------------------------------------ */
/* Transition carte → fiche                                            */
/* ------------------------------------------------------------------ */

// Photo déjà affichée par la carte cliquée : la fiche l'affiche immédiatement
// pendant l'animation, le temps que la version haute définition arrive.
export const heroHints = new Map<string, string>()

export const HERO_SIZES = "(min-width: 768px) 50vw, 100vw"

// Télécharge à l'avance la grande photo de la fiche (au survol d'une carte)
const preloaded = new Set<string>()
export const preloadHero = (house: House) => {
  const photo = house.photos[0]
  if (!photo || preloaded.has(house.id)) return
  preloaded.add(house.id)
  const img = new Image()
  img.sizes = HERO_SIZES
  img.srcset = photo.srcSet
  img.src = photo.src
}

// Découpe la description en paragraphes
export const paragraphs = (text: string) =>
  text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
