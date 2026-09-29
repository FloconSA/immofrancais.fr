import { useRef } from "react"
import { Link, useViewTransitionState } from "react-router"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import { House, heroHints, paragraphs, preloadHero } from "../lib/houses"
import { cn, euros, number, plural } from "../lib/format"

type Props = { house: House; featured?: boolean; priority?: boolean }

export const houseFacts = (house: House) =>
  [
    house.surface ? `${number(house.surface, 2)} m²` : null,
    house.rooms ? plural(house.rooms, "pièce") : null,
    house.bedrooms ? plural(house.bedrooms, "chambre") : null,
  ].filter(Boolean) as string[]

/** Premier vrai paragraphe de la description (on saute une éventuelle ligne-titre) */
export const leadParagraph = (house: House) => {
  const all = paragraphs(house.description)
  const first = all[0] ?? ""
  return first.length < 90 && !/[.!?…]$/.test(first) && all[1] ? all[1] : first
}

const HouseCard = ({ house, featured, priority }: Props) => {
  const to = `/housing/${house.id}`
  const transitioning = useViewTransitionState(to)
  const img = useRef<HTMLImageElement>(null)
  const photo = house.photos[0]

  const onIntent = () => preloadHero(house)
  const onClick = () => {
    if (img.current?.currentSrc) heroHints.set(house.id, img.current.currentSrc)
  }

  const image = (
    <div
      className={cn("relative overflow-hidden rounded-[1.75rem] bg-soft", featured ? "aspect-[4/3] md:aspect-auto md:h-full md:min-h-[26rem]" : "aspect-[4/3]")}
      style={{ viewTransitionName: transitioning ? "house-hero" : undefined }}
    >
      {photo && (
        <img
          ref={img}
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          alt={house.name}
          width={photo.width}
          height={photo.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.04]"
        />
      )}
      {house.photos.length > 1 && (
        <span className="chip absolute bottom-4 left-4 bg-black/35 text-white backdrop-blur-md">
          {house.photos.length} photos
        </span>
      )}
    </div>
  )

  if (featured) {
    return (
      <Link
        to={to}
        viewTransition
        onClick={onClick}
        onPointerEnter={onIntent}
        onFocus={onIntent}
        onTouchStart={onIntent}
        className="group grid gap-6 md:grid-cols-12 md:gap-10"
      >
        <div className="md:col-span-7">{image}</div>
        <div className="flex flex-col justify-center md:col-span-5 md:py-6">
          <p className="eyebrow">À la une</p>
          <h3 className="display-3 mt-4">{house.name}</h3>
          <p className="mt-2 text-lg text-muted">{house.type}</p>
          <p className="mt-6 line-clamp-4 leading-relaxed text-muted">{leadParagraph(house)}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {houseFacts(house).map((fact) => (
              <span key={fact} className="chip bg-soft text-ink">{fact}</span>
            ))}
            {house.DPE && <span className="chip bg-soft text-ink">DPE {house.DPE}</span>}
          </div>
          <div className="mt-8 flex items-end justify-between gap-4 border-t border-line pt-6">
            <p className="text-3xl font-semibold tracking-tight">{euros(house.price)}</p>
            <span className="link-arrow text-accent-ink">
              Découvrir
              <ArrowRightIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={to}
      viewTransition
      onClick={onClick}
      onPointerEnter={onIntent}
      onFocus={onIntent}
      onTouchStart={onIntent}
      className="group block"
    >
      {image}
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-medium tracking-tight">{house.name}</h3>
          <p className="mt-0.5 truncate text-[15px] text-muted">{house.type}</p>
        </div>
        <p className="whitespace-nowrap text-lg font-medium tracking-tight">{euros(house.price)}</p>
      </div>
      <p className="mt-3 text-sm text-muted">{[...houseFacts(house), house.DPE && `DPE ${house.DPE}`].filter(Boolean).join(" · ")}</p>
    </Link>
  )
}

export const HouseCardSkeleton = ({ featured }: { featured?: boolean }) =>
  featured ? (
    <div className="grid gap-6 md:grid-cols-12 md:gap-10" aria-hidden="true">
      <div className="skeleton aspect-[4/3] rounded-[1.75rem] md:col-span-7" />
      <div className="flex flex-col justify-center gap-4 md:col-span-5">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton h-10 w-3/4 rounded-xl" />
        <div className="skeleton h-5 w-1/2 rounded-full" />
        <div className="skeleton mt-4 h-24 w-full rounded-xl" />
      </div>
    </div>
  ) : (
    <div aria-hidden="true">
      <div className="skeleton aspect-[4/3] rounded-[1.75rem]" />
      <div className="skeleton mt-5 h-5 w-2/3 rounded-full" />
      <div className="skeleton mt-2 h-4 w-1/2 rounded-full" />
    </div>
  )

export default HouseCard
