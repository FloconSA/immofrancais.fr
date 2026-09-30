import { MouseEvent, ReactNode, useEffect, useRef, useState } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/20/solid"
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/outline"
import Gallery, { Lightbox } from "../components/Gallery"
import EnergyScale from "../components/EnergyScale"
import MapCard from "../components/MapCard"
import Contact from "../components/Contact"
import Reveal from "../components/Reveal"
import Simulators from "../components/simulators/Simulators"
import NotFound from "./NotFound"
import { House, heroHints, paragraphs, useHouse } from "../lib/houses"
import { Place, locate } from "../lib/geo"
import { useActiveSection, useHeaderHidden, usePageMeta, useScrollProgress } from "../lib/hooks"
import { toast } from "../lib/toast"
import { cn, euros, number } from "../lib/format"

// Description affichée par Google sous le lien de l'annonce : type, surface, prix, puis première vraie phrase
// du texte (la première ligne est souvent un simple titre, sans point final)
const summary = (house: House) => {
  const facts = [house.type, house.surface && `${number(house.surface, 2)} m²`, house.price && euros(house.price)].filter(Boolean).join(" · ")
  const blocks = paragraphs(house.description)
  const sentence = blocks.find((block) => /[.!?…]$/.test(block)) ?? blocks[0]
  const text = [facts, sentence].filter(Boolean).join(". ").replace(/\s+/g, " ")
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "").replace(/[\s,.;:–-]+$/, "")}…` : text
}

const HouseDetails = () => {
  const { id } = useParams()
  const { house, notFound, error } = useHouse(id)
  const [photo, setPhoto] = useState<number | null>(null)
  const [place, setPlace] = useState<Place | null>(null)

  usePageMeta({ title: house?.name, description: house && summary(house) })

  useEffect(() => {
    setPlace(null)
    if (!house) return
    let alive = true
    locate(house).then((found) => alive && setPlace(found))
    return () => {
      alive = false
    }
  }, [house])

  if (notFound) return <NotFound title="Annonce introuvable" text="Ce bien n'est plus en ligne, ou le lien est incomplet." />
  if (error) return <NotFound title="Chargement impossible" text="L'annonce n'a pas pu être chargée. Réessayez dans quelques instants." />
  if (!house) return <DetailsSkeleton />

  const pricePerSqm = house.surface ? house.price / house.surface : 0
  const location = place ? `${place.name}, ${place.context.split(", ")[1] ?? ""}`.replace(/, $/, "") : null
  const breakPhoto = house.photos[1] ?? null

  const sections = [
    { id: "description", label: "Description" },
    { id: "details", label: "Détails" },
    { id: "energie", label: "Énergie" },
    ...(place ? [{ id: "quartier", label: "Localisation" }] : []),
    { id: "financement", label: "Financement" },
  ]

  return (
    <article>
      {/* En-tête de la fiche */}
      <header className="container-page pt-24 md:pt-28">
        <Link to="/housing" viewTransition className="link-arrow rise text-sm text-muted">
          <ArrowLeftIcon className="h-4 w-4 !transform-none" />
          Tous les biens
        </Link>
        <div className="mt-6 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <p className="eyebrow rise" style={{ ["--delay" as string]: "60ms" }}>
              {house.type}
              {location && <span className="text-muted"> · {location}</span>}
            </p>
            <h1 className="display-1 rise mt-4 max-w-4xl" style={{ ["--delay" as string]: "120ms" }}>{house.name}</h1>
          </div>
          <div className="rise shrink-0 md:text-right" style={{ ["--delay" as string]: "200ms" }}>
            <p className="text-4xl font-semibold tracking-[-0.03em] md:text-5xl">{euros(house.price)}</p>
            {pricePerSqm > 0 && <p className="mt-1 text-muted">soit {euros(pricePerSqm)} / m²</p>}
          </div>
        </div>
      </header>

      <div id="photos" className="container-page mt-10 md:mt-12">
        <Gallery house={house} heroHint={heroHints.get(house.id)} onOpen={setPhoto} />
      </div>

      <LocalNav house={house} sections={sections} />

      {/* Chiffres clés */}
      <div className="container-page">
        <dl className="grid grid-cols-2 border-b border-line md:grid-cols-4">
          {[
            { value: number(house.surface, 2), unit: "m²", label: "Surface habitable" },
            { value: number(house.rooms), label: house.rooms > 1 ? "Pièces" : "Pièce" },
            { value: number(house.bedrooms), label: house.bedrooms > 1 ? "Chambres" : "Chambre" },
            { value: pricePerSqm ? number(Math.round(pricePerSqm)) : "—", unit: "€/m²", label: "Prix au m²" },
          ].map((fact, i) => (
            <Reveal key={fact.label} delay={i * 70} className={cn("py-8 md:py-12", i % 2 === 1 && "border-l border-line pl-6", i >= 2 && "border-t border-line md:border-t-0", i >= 1 && "md:border-l md:pl-8")}>
              <dt className="text-[13px] text-muted">{fact.label}</dt>
              <dd className="mt-2 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                {fact.value}
                {fact.unit && <span className="ml-1.5 text-xl font-medium tracking-tight text-muted">{fact.unit}</span>}
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <Section id="description" eyebrow="Description" title="Le bien">
        <Description house={house} />
      </Section>

      {breakPhoto && <PhotoBreak house={house} index={1} onOpen={() => setPhoto(1)} />}

      <Section id="details" eyebrow="Détails" title="Caractéristiques">
        {house.caracteristics.length > 0 && (
          <dl className="border-t border-line">
            {house.caracteristics.map((line) => {
              const { label, value } = splitLine(line)
              return (
                <Reveal key={line} className="grid gap-1 border-b border-line py-4 sm:grid-cols-2 sm:gap-6">
                  {label ? <dt className="text-muted">{label}</dt> : null}
                  <dd className={cn("font-medium", !label && "sm:col-span-2")}>{value}</dd>
                </Reveal>
              )
            })}
          </dl>
        )}
        {house.facilities.length > 0 && (
          <Reveal className="mt-12">
            <h3 className="text-lg font-medium">Aménagements</h3>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {house.facilities.map((facility) => (
                <li key={facility} className="chip bg-soft py-2 pl-2 pr-4 text-[15px] text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {facility}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </Section>

      <Section id="energie" eyebrow="Énergie" title="Bilan énergétique">
        <div className="grid gap-4 lg:grid-cols-2">
          <Reveal><EnergyScale kind="DPE" value={house.DPE} /></Reveal>
          <Reveal delay={100}><EnergyScale kind="GES" value={house.GES} /></Reveal>
        </div>
      </Section>

      {place && (
        <Section id="quartier" eyebrow="Localisation" title={place.name}>
          <Reveal><MapCard place={place} /></Reveal>
          <p className="mt-4 text-[13px] text-muted">Localisation approximative, à l'échelle de la commune. L'adresse exacte est communiquée lors de la visite.</p>
        </Section>
      )}

      <section id="financement" className="container-page scroll-mt-32 py-20 md:py-28">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Financement</p>
          <h2 className="display-2 mt-4">
            Combien coûte <span className="serif-accent">ce bien ?</span>
          </h2>
          <p className="mt-4 text-lg text-muted">Le simulateur part du prix de l'annonce. Ajustez l'apport, la durée ou le taux.</p>
        </Reveal>
        <Reveal delay={120} className="mt-12">
          <Simulators initialPrice={house.price} initialTab="budget" />
        </Reveal>
      </section>

      <div className="border-t border-line">
        <Contact
          title={
            <>
              Ce bien vous <span className="serif-accent">intéresse ?</span>
            </>
          }
          defaultMessage={`Bonjour, je suis intéressé(e) par le bien « ${house.name} » (${euros(house.price)}). Pourriez-vous me recontacter ?`}
        />
      </div>

      <Lightbox photos={house.photos} title={house.name} index={photo} onClose={() => setPhoto(null)} />
    </article>
  )
}

/* ------------------------------------------------------------------ */
/* Barre fixe : nom, prix, raccourcis vers les sections                */
/* ------------------------------------------------------------------ */

const scrollToSection = (event: MouseEvent, id: string) => {
  event.preventDefault()
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

const LocalNav = ({ house, sections }: { house: House; sections: { id: string; label: string }[] }) => {
  const headerHidden = useHeaderHidden()
  const active = useActiveSection(sections.map((s) => s.id))

  const share = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: house.name, text: `${house.name} – ${euros(house.price)}`, url })
      } catch {
        /* partage annulé */
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      toast("Lien de l'annonce copié", "success")
    } catch {
      toast("Copiez l'adresse de la page pour partager l'annonce", "info")
    }
  }

  return (
    <div
      className="sticky z-40 mt-10 border-y border-line/70 bg-canvas/80 backdrop-blur-xl backdrop-saturate-150 transition-[top] duration-500 ease-out-expo md:mt-12"
      style={{ top: headerHidden ? 0 : 64 }}
    >
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-3">
          <p className="hidden truncate font-medium tracking-tight sm:block lg:max-w-[16rem]">{house.name}</p>
          <p className="shrink-0 font-semibold tracking-tight sm:font-normal sm:text-muted">{euros(house.price)}</p>
        </div>
        <nav className="no-scrollbar hidden items-center gap-1 overflow-x-auto text-sm lg:flex" aria-label="Sections de l'annonce">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => scrollToSection(e, s.id)}
              className={cn("whitespace-nowrap rounded-full px-3 py-1.5 transition-colors", active === s.id ? "bg-ink/[0.07] text-ink" : "text-muted hover:text-ink")}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={share} className="grid h-9 w-9 place-items-center rounded-full tint-hover" aria-label="Partager l'annonce" title="Partager">
            <ArrowUpOnSquareIcon className="h-5 w-5" />
          </button>
          <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="btn-primary btn-sm">
            Contacter
          </a>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mise en page « magazine »                                           */
/* ------------------------------------------------------------------ */

const Section = ({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) => (
  <section id={id} className="container-page scroll-mt-32 py-20 md:py-28">
    <div className="grid gap-10 md:grid-cols-12">
      <Reveal className="md:col-span-4">
        <div className="md:sticky md:top-40">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-3 mt-3">{title}</h2>
        </div>
      </Reveal>
      <div className="md:col-span-8">{children}</div>
    </div>
  </section>
)

const Description = ({ house }: { house: House }) => {
  const all = paragraphs(house.description)
  // Une première ligne courte sans ponctuation est un simple rappel du titre : on la saute
  const body = all.length > 1 && all[0].length < 90 && !/[.!?…]$/.test(all[0]) ? all.slice(1) : all
  if (!body.length) return <p className="text-muted">Description à venir.</p>
  const [lead, ...rest] = body

  return (
    <div>
      <Reveal as="p" className="font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-[1.2] tracking-[-0.01em] text-ink">
        {lead}
      </Reveal>
      <div className="mt-10 grid gap-6 text-[17px] leading-relaxed text-muted">
        {rest.map((text, i) => {
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
          if (lines.length === 1 && text.length < 60 && text.endsWith(":")) {
            return <h3 key={i} className="mt-4 text-lg font-medium text-ink">{text.replace(/\s*:$/, "")}</h3>
          }
          if (lines.length > 1) {
            return (
              <ul key={i} className="grid gap-3">
                {lines.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span className="mt-[0.7em] h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            )
          }
          return <p key={i}>{text}</p>
        })}
      </div>
    </div>
  )
}

// « Charge de copropriété : 1431 Euros » → libellé + valeur, montants mis en forme
const splitLine = (line: string) => {
  const match = line.match(/^(.{2,60}?)\s*:\s*(.+)$/)
  if (!match) return { label: null, value: line }
  const value = match[2].replace(/^(\d[\d\s.]*)\s*(?:euros?|€)(.*)$/i, (_, n: string, rest: string) => `${euros(Number(n.replace(/[\s.]/g, "")))}${rest}`)
  return { label: match[1], value }
}

const PhotoBreak = ({ house, index, onOpen }: { house: House; index: number; onOpen: () => void }) => {
  const ref = useRef<HTMLButtonElement>(null)
  useScrollProgress(ref, (rect, vh) => (vh - rect.top) / (vh + rect.height))
  const photo = house.photos[index]
  return (
    <button ref={ref} type="button" onClick={onOpen} className="parallax relative block h-[60vh] w-full overflow-hidden bg-soft md:h-[85vh]" aria-label="Agrandir la photo">
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </button>
  )
}

const DetailsSkeleton = () => (
  <div className="container-page pt-24 md:pt-28" aria-busy="true" aria-label="Chargement de l'annonce">
    <div className="skeleton h-4 w-28 rounded-full" />
    <div className="skeleton mt-8 h-3 w-48 rounded-full" />
    <div className="skeleton mt-5 h-14 w-2/3 rounded-2xl" />
    <div className="skeleton mt-12 h-[min(72vh,44rem)] rounded-[2rem]" />
  </div>
)

export default HouseDetails
