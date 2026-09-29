import { useMemo, useRef, useState } from "react"
import { ArrowUpRightIcon } from "@heroicons/react/20/solid"
import { LYON, Place, TILE, project } from "../lib/geo"
import { useInView, useSize } from "../lib/hooks"
import { cn, number } from "../lib/format"

/**
 * Carte stylisée, sans bibliothèque : on assemble nous-mêmes les tuiles du Plan IGN
 * (service public, gratuit et sans clé), passées en noir et blanc, puis on dessine
 * par-dessus Lyon, la commune du bien et le trajet à vol d'oiseau.
 */
const tileUrl = (z: number, x: number, y: number) =>
  "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2" +
  `&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`

/**
 * Une tuile de la carte. Le serveur de l'IGN refuse parfois une tuile de façon ponctuelle :
 * on la redemande alors (deux fois au plus), et elle reste invisible tant qu'elle n'est pas
 * chargée, pour ne jamais afficher d'icône d'image cassée.
 */
const Tile = ({ src, left, top }: { src: string; left: number; top: number }) => {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState(false)
  return (
    <img
      src={attempt ? `${src}&essai=${attempt}` : src}
      alt=""
      width={TILE}
      height={TILE}
      loading="lazy"
      decoding="async"
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(false)
        if (attempt < 2) setTimeout(() => setAttempt((n) => n + 1), 800 * (attempt + 1))
      }}
      className={cn("absolute max-w-none select-none transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
      style={{ left, top, width: TILE, height: TILE }}
    />
  )
}

const MapCard = ({ place }: { place: Place }) => {
  const box = useRef<HTMLDivElement>(null)
  const { width, height } = useSize(box)
  const inView = useInView(box, "0px 0px -15% 0px")

  const view = useMemo(() => {
    if (!width || !height) return null
    const property = { lat: place.lat, lon: place.lon }
    const showLyon = place.distanceToLyon >= 4
    let zoom = 13
    if (showLyon) {
      // On choisit le zoom le plus fort qui montre à la fois Lyon et la commune
      for (zoom = 13; zoom > 7; zoom--) {
        const a = project(property.lat, property.lon, zoom)
        const b = project(LYON.lat, LYON.lon, zoom)
        if (Math.abs(a.x - b.x) <= width * 0.55 && Math.abs(a.y - b.y) <= height * 0.45) break
      }
    }
    const p = project(property.lat, property.lon, zoom)
    const l = project(LYON.lat, LYON.lon, zoom)
    const center = showLyon ? { x: (p.x + l.x) / 2, y: (p.y + l.y) / 2 } : p
    // Décalé vers le haut pour laisser la place à l'encart d'informations
    const origin = { x: center.x - width / 2, y: center.y - height / 2 + height * 0.1 }

    const tiles: { x: number; y: number; left: number; top: number }[] = []
    const max = 2 ** zoom
    for (let tx = Math.floor(origin.x / TILE); tx <= Math.floor((origin.x + width) / TILE); tx++) {
      for (let ty = Math.floor(origin.y / TILE); ty <= Math.floor((origin.y + height) / TILE); ty++) {
        if (ty < 0 || ty >= max) continue
        tiles.push({ x: ((tx % max) + max) % max, y: ty, left: tx * TILE - origin.x, top: ty * TILE - origin.y })
      }
    }

    // Rayon d'environ 1,5 km autour du centre de la commune
    const metersPerPixel = (156543.03 * Math.cos((place.lat * Math.PI) / 180)) / max
    return {
      zoom,
      tiles,
      property: { x: p.x - origin.x, y: p.y - origin.y },
      lyon: showLyon ? { x: l.x - origin.x, y: l.y - origin.y } : null,
      zone: Math.max(28, 1500 / metersPerPixel),
    }
  }, [width, height, place])

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.postcode}`)}`

  // Courbe douce de Lyon vers la commune
  const arc = view?.lyon
    ? (() => {
        const { x: x1, y: y1 } = view.lyon
        const { x: x2, y: y2 } = view.property
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2
        const dx = x2 - x1
        const dy = y2 - y1
        const bend = 0.22
        return `M${x1},${y1} Q${mx - dy * bend},${my + dx * bend} ${x2},${y2}`
      })()
    : null

  return (
    <div ref={box} className="relative h-[26rem] overflow-hidden rounded-[2rem] bg-soft ring-1 ring-line/70 md:h-[32rem]">
      {view && (
        <div className={cn("absolute inset-0 transition-transform duration-[1.6s] ease-out-expo", inView ? "scale-100" : "scale-[1.08]")}>
          <div className="map-tiles absolute inset-0">
            {view.tiles.map((t) => (
              <Tile key={`${view.zoom}-${t.x}-${t.y}-${t.left}`} src={tileUrl(view.zoom, t.x, t.y)} left={t.left} top={t.top} />
            ))}
          </div>

          <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            <circle cx={view.property.x} cy={view.property.y} r={view.zone} className="fill-accent/15 stroke-accent/40" strokeWidth={1} />
            {arc && (
              <path
                d={arc}
                fill="none"
                className="stroke-ink/60"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeDasharray="1 7"
                style={{ opacity: inView ? 1 : 0, transition: "opacity 1.2s 0.4s" }}
              />
            )}
          </svg>

          {view.lyon && (
            <div className="absolute" style={{ left: view.lyon.x, top: view.lyon.y }}>
              <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-ink ring-[3px] ring-surface" />
            </div>
          )}

          <div className="absolute" style={{ left: view.property.x, top: view.property.y }}>
            <span className="map-pulse absolute -left-2 -top-2 h-4 w-4 rounded-full" />
            <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-accent ring-[3px] ring-white" />
          </div>
        </div>
      )}

      {/* Encart d'informations */}
      <div className="absolute inset-x-4 bottom-4 flex flex-col gap-4 rounded-3xl bg-surface/80 p-5 shadow-xl ring-1 ring-line/60 backdrop-blur-xl sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-sm sm:p-6">
        <div>
          <p className="text-[13px] text-muted">{[place.postcode, place.context.split(", ").slice(1).join(", ")].filter(Boolean).join(" · ")}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{place.name}</p>
          {place.distanceToLyon >= 4 && (
            <p className="mt-2 text-[15px] text-muted">
              À environ <span className="font-medium text-ink">{number(Math.round(place.distanceToLyon))} km</span> de Lyon, à vol d'oiseau
            </p>
          )}
        </div>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="link-arrow text-sm text-accent-ink">
          Ouvrir dans Google Maps
          <ArrowUpRightIcon className="h-4 w-4" />
        </a>
      </div>

      <p className="absolute right-3 top-3 rounded-full bg-surface/70 px-2 py-0.5 text-[10px] text-muted backdrop-blur">
        Fond de carte ©{" "}
        <a href="https://geoservices.ign.fr/" target="_blank" rel="noreferrer" className="hover:underline">IGN – Plan IGN</a>
      </p>
    </div>
  )
}

export default MapCard
