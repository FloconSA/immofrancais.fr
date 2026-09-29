import { useEffect, useRef, useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Squares2X2Icon } from "@heroicons/react/20/solid"
import { HERO_SIZES, House, Photo } from "../lib/houses"
import { cn } from "../lib/format"

type Props = { house: House; heroHint?: string; onOpen: (index: number) => void }

/** Mosaïque de photos (ordinateur) et carrousel à faire glisser (téléphone) */
const Gallery = ({ house, heroHint, onOpen }: Props) => {
  const photos = house.photos
  if (!photos.length) return <div className="aspect-[16/9] rounded-[2rem] bg-soft" />

  const tiles = photos.slice(0, 5)
  const layout = LAYOUTS[Math.min(tiles.length, 5)]

  return (
    <>
      {/* Ordinateur */}
      <div className={cn("hidden h-[min(72vh,44rem)] gap-2 overflow-hidden rounded-[2rem] md:grid", layout.grid)}>
        {tiles.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(i)}
            className={cn("group relative overflow-hidden bg-soft", layout.tiles[i])}
            style={i === 0 ? { viewTransitionName: "house-hero" } : undefined}
            aria-label={`Agrandir la photo ${i + 1}`}
          >
            <GalleryImage photo={photo} hint={i === 0 ? heroHint : undefined} sizes={i === 0 ? HERO_SIZES : "25vw"} priority={i === 0} alt={i === 0 ? house.name : ""} />
            <span className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />
            {i === tiles.length - 1 && photos.length > 1 && (
              <span className="chip absolute bottom-5 right-5 bg-white/85 text-neutral-900 shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                <Squares2X2Icon className="h-4 w-4" />
                Voir les {photos.length} photos
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Téléphone */}
      <MobileCarousel house={house} heroHint={heroHint} onOpen={onOpen} />
    </>
  )
}

// Disposition de la mosaïque selon le nombre de photos
const LAYOUTS: Record<number, { grid: string; tiles: string[] }> = {
  1: { grid: "grid-cols-1", tiles: [""] },
  2: { grid: "grid-cols-2", tiles: ["", ""] },
  3: { grid: "grid-cols-4 grid-rows-2", tiles: ["col-span-2 row-span-2", "col-span-2", "col-span-2"] },
  4: { grid: "grid-cols-4 grid-rows-2", tiles: ["col-span-2 row-span-2", "col-span-2", "", ""] },
  5: { grid: "grid-cols-4 grid-rows-2", tiles: ["col-span-2 row-span-2", "", "", "", ""] },
}

const MobileCarousel = ({ house, heroHint, onOpen }: Props) => {
  const track = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  return (
    <div className="relative -mx-5 sm:-mx-8 md:hidden">
      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget
          const slide = el.firstElementChild as HTMLElement | null
          if (slide) setIndex(Math.round(el.scrollLeft / (slide.offsetWidth + 8)))
        }}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-5 px-5 sm:scroll-px-8 sm:px-8"
      >
        {house.photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => onOpen(i)}
            className="relative aspect-[4/3] w-[88%] shrink-0 snap-start overflow-hidden rounded-3xl bg-soft"
            style={i === 0 ? { viewTransitionName: "house-hero" } : undefined}
            aria-label={`Agrandir la photo ${i + 1}`}
          >
            <GalleryImage photo={photo} hint={i === 0 ? heroHint : undefined} sizes="90vw" priority={i === 0} alt={i === 0 ? house.name : ""} />
          </button>
        ))}
      </div>
      <span className="chip tabular pointer-events-none absolute bottom-4 right-8 bg-black/45 text-white backdrop-blur-md">
        {index + 1} / {house.photos.length}
      </span>
    </div>
  )
}

/**
 * Photo en deux couches : dessous, la version déjà chargée par la carte cliquée
 * (affichée instantanément pendant l'animation), dessus la haute définition.
 */
const GalleryImage = ({ photo, hint, sizes, priority, alt }: { photo: Photo; hint?: string; sizes: string; priority?: boolean; alt: string }) => {
  const [loaded, setLoaded] = useState(false)
  const img = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth) setLoaded(true)
  }, [])
  return (
    <>
      {hint && <img src={hint} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
      <img
        ref={img}
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={sizes}
        alt={alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-out-expo group-hover:scale-[1.03]",
          hint && !loaded ? "opacity-0" : "opacity-100",
        )}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Visionneuse plein écran                                             */
/* ------------------------------------------------------------------ */

type LightboxProps = { photos: Photo[]; title: string; index: number | null; onClose: () => void }

export const Lightbox = ({ photos, title, index, onClose }: LightboxProps) => {
  const dialog = useRef<HTMLDialogElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const open = index !== null

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open && !el.open) {
      el.showModal()
      setCurrent(index)
      requestAnimationFrame(() => track.current?.scrollTo({ left: index * track.current.clientWidth, behavior: "instant" as ScrollBehavior }))
    }
    if (!open && el.open) el.close()
  }, [open, index])

  const go = (target: number) => {
    const el = track.current
    if (!el) return
    const next = (target + photos.length) % photos.length
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" })
  }

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(current + 1)
        if (e.key === "ArrowLeft") go(current - 1)
      }}
      className="sheet"
      aria-label={`Photos : ${title}`}
    >
      <div className="relative flex h-full flex-col bg-neutral-950 text-white">
        <div className="flex h-16 shrink-0 items-center justify-between gap-4 px-5 sm:px-8">
          <p className="tabular text-sm text-white/70">
            {current + 1} / {photos.length}
            <span className="ml-3 hidden text-white sm:inline">{title}</span>
          </p>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20" aria-label="Fermer">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div
          ref={track}
          onScroll={(e) => setCurrent(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
        >
          {photos.map((photo, i) => (
            <div key={photo.src} onClick={(e) => e.target === e.currentTarget && onClose()} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-2 pb-4 sm:px-20 sm:pb-8">
              <img
                src={photo.src}
                srcSet={photo.srcSet}
                sizes="100vw"
                alt={`${title} – photo ${i + 1}`}
                loading={index !== null && Math.abs(i - index) <= 1 ? "eager" : "lazy"}
                decoding="async"
                className="max-h-full max-w-full select-none rounded-xl object-contain"
              />
            </div>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(current - 1)} className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 sm:grid" aria-label="Photo précédente">
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => go(current + 1)} className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 sm:grid" aria-label="Photo suivante">
              <ChevronRightIcon className="h-6 w-6" />
            </button>
            <div className="no-scrollbar hidden shrink-0 justify-center gap-2 overflow-x-auto px-8 pb-6 sm:flex">
              {photos.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => go(i)}
                  className={cn("h-14 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300", i === current ? "opacity-100 ring-2 ring-white" : "opacity-40 hover:opacity-80")}
                  aria-label={`Aller à la photo ${i + 1}`}
                  aria-current={i === current}
                >
                  <img src={photo.placeholder} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </dialog>
  )
}

export default Gallery
