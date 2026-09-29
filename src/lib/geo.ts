import type { House } from "./houses"

// Localisation approximative d'un bien, à l'échelle de la commune.
// Les annonces n'ont pas (encore) de champ « ville » : on le devine à partir du titre
// (« Dernier étage – Four ») ou de la description (« Situé à Four… »),
// puis on interroge le service de géocodage public de l'IGN (Géoplateforme).

export type Place = {
  name: string
  postcode: string
  context: string // « 38, Isère, Auvergne-Rhône-Alpes »
  lat: number
  lon: number
  distanceToLyon: number // km, à vol d'oiseau
}

export const LYON = { lat: 45.7578, lon: 4.832 } // place Bellecour

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()

export const distanceKm = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) => {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export const guessLocality = (house: House): string[] => {
  const guesses: string[] = []
  if (house.city) guesses.push(house.city)
  const parts = house.name.split(/\s+[–—-]\s+/)
  if (parts.length > 1) guesses.push(parts[parts.length - 1])
  const inText = house.description.match(
    /situ[ée]e?s?\s+(?:à|a|au cœur de|en plein cœur de|dans le centre de)\s+([A-ZÀ-Ý][\p{L}'’-]+(?:[\s-](?:sur|sous|en|le|la|les|lès|de|du|des|[A-ZÀ-Ý][\p{L}'’-]+))*)/u,
  )
  if (inText) guesses.push(inText[1])
  return [...new Set(guesses.map((g) => g.trim()).filter((g) => g.length > 1 && g.length <= 45))]
}

const search = async (query: string): Promise<Place | null> => {
  const url =
    `https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(query)}` +
    `&type=municipality&limit=5&lat=${LYON.lat}&lon=${LYON.lon}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const match = (data.features ?? []).find((f: any) => normalize(f.properties?.name ?? "") === normalize(query))
  if (!match) return null
  const [lon, lat] = match.geometry.coordinates
  const place: Place = {
    name: match.properties.name,
    postcode: match.properties.postcode ?? "",
    context: match.properties.context ?? "",
    lat,
    lon,
    distanceToLyon: distanceKm(LYON, { lat, lon }),
  }
  // L'agence travaille autour de Lyon : un homonyme à l'autre bout de la France est écarté
  return place.distanceToLyon <= 200 ? place : null
}

export const locate = async (house: House): Promise<Place | null> => {
  for (const guess of guessLocality(house)) {
    const key = `lieu:${normalize(guess)}`
    try {
      const cached = sessionStorage.getItem(key)
      if (cached) return JSON.parse(cached)
    } catch {
      /* pas de cache disponible */
    }
    try {
      const place = await search(guess)
      if (place) {
        try {
          sessionStorage.setItem(key, JSON.stringify(place))
        } catch {
          /* pas de cache disponible */
        }
        return place
      }
    } catch {
      /* service indisponible : on essaie l'indice suivant */
    }
  }
  return null
}

/* ------------------------------------------------------------------ */
/* Tuiles de carte (projection Web Mercator)                           */
/* ------------------------------------------------------------------ */

export const TILE = 256

export const project = (lat: number, lon: number, zoom: number) => {
  const world = TILE * 2 ** zoom
  const sin = Math.sin((lat * Math.PI) / 180)
  return {
    x: ((lon + 180) / 360) * world,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * world,
  }
}
