import { CSSProperties, useRef } from "react"
import { Link } from "react-router"
import { ArrowRightIcon, MapPinIcon } from "@heroicons/react/20/solid"
import HouseCard, { HouseCardSkeleton } from "../components/HouseCard"
import Reveal, { RisingWords } from "../components/Reveal"
import Contact from "../components/Contact"
import MiniSimulator from "../components/simulators/MiniSimulator"
import { useHouses } from "../lib/houses"
import { usePageMeta, useScrollProgress } from "../lib/hooks"
import { plural } from "../lib/format"

const Home = () => {
  const { houses, loading, error } = useHouses()
  // Mêmes textes que dans index.html
  usePageMeta({
    title: "ImmoFrançais — L'immobilier à Lyon, en toute clarté",
    description: "ImmoFrançais, réseau immobilier 100 % digital basé à Lyon : biens à vendre et simulateurs de prêt, de frais de notaire et de budget.",
  })
  const [featured, ...others] = houses ?? []

  return (
    <>
      <Hero count={houses?.length} />

      {/* Biens du moment */}
      <section className="container-page py-24 md:py-36" aria-labelledby="selection">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Sélection</p>
            <h2 id="selection" className="display-2 mt-4">
              Nos biens <span className="serif-accent">du moment.</span>
            </h2>
          </div>
          <Link to="/housing" viewTransition className="link-arrow">
            Tous les biens
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-14 md:mt-20">
          {loading && <HouseCardSkeleton featured />}
          {error && (
            <p className="rounded-3xl bg-soft p-8 text-muted">
              Les annonces n'ont pas pu être chargées pour le moment. Rechargez la page dans quelques instants.
            </p>
          )}
          {houses && houses.length === 0 && (
            <p className="rounded-3xl bg-soft p-8 text-muted">
              Aucun bien en vente pour le moment. De nouvelles annonces arrivent bientôt.
            </p>
          )}
          {featured && (
            <Reveal>
              <HouseCard house={featured} featured priority />
            </Reveal>
          )}
          {others.length > 0 && (
            <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {others.slice(0, 3).map((house, i) => (
                <Reveal key={house.id} delay={i * 90}>
                  <HouseCard house={house} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <Statement />

      {/* Simulateurs */}
      <section className="bg-soft py-24 md:py-36" aria-labelledby="simulateurs">
        <div className="container-page grid items-center gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="eyebrow">Simulateurs</p>
            <h2 id="simulateurs" className="display-2 mt-4">
              Votre projet, chiffré <span className="serif-accent">en temps réel.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Mensualités, frais de notaire, budget global : faites bouger les curseurs, les montants se recalculent instantanément.
            </p>
            <div className="mt-10 flex flex-col divide-y divide-line border-y border-line">
              {[
                { tab: "pret", label: "Simulateur de prêt" },
                { tab: "notaire", label: "Frais de notaire" },
                { tab: "budget", label: "Budget total" },
              ].map((item) => (
                <Link key={item.tab} to={`/simulateurs?onglet=${item.tab}`} viewTransition className="link-arrow justify-between py-4 text-lg">
                  {item.label}
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
            <MiniSimulator initialPrice={featured?.price} />
          </Reveal>
        </div>
      </section>

      <Contact />
    </>
  )
}

// Photo d'accueil (Pexels, libre de droits), déclinée en plusieurs tailles et deux cadrages :
// le navigateur télécharge la plus adaptée à l'écran, pour une image toujours nette.
const HERO_PHOTO = {
  alt: "Lyon en automne : les façades colorées des quais de Saône et la passerelle Saint-Vincent",
  place: "Lyon · Quais de Saône",
  // Largeurs disponibles. Le WebP ne sert qu'aux navigateurs anciens (sans AVIF) : pas de version géante pour eux.
  paysage: { avif: [1280, 1920, 2560, 3840, 5760], webp: [1280, 1920, 2560] },
  portrait: { avif: [720, 1080, 1440, 2160], webp: [720, 1080, 1440] },
}
const heroSrcSet = (format: "paysage" | "portrait", ext: "avif" | "webp") =>
  HERO_PHOTO[format][ext].map((w) => `/accueil/lyon-${format}-${w}.${ext} ${w}w`).join(", ")
// Largeur affichée : l'image déborde un peu de son cadre (léger zoom), d'où plus de 100vw
const PAYSAGE_SIZES = "112vw"
const PORTRAIT_SIZES = "(orientation: portrait) 120vw"

const Hero = ({ count }: { count?: number }) => {
  const photo = useRef<HTMLDivElement>(null)
  // La photo s'élargit jusqu'aux bords de l'écran pendant que son haut monte vers le haut de l'écran
  useScrollProgress(photo, (rect, vh) => 1 - rect.top / (vh * 0.55))
  // Léger décalage de la photo dans son cadre tant qu'elle est visible
  useScrollProgress(photo, (rect, vh) => (vh - rect.top) / (vh + rect.height), "--q")

  return (
    <section className="pt-28 md:pt-36" aria-label="Accueil">
      <div className="container-page">
        <p className="rise inline-flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink/80 ring-1 ring-inset ring-line" style={{ "--delay": "60ms" } as CSSProperties}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Réseau immobilier 100 % digital · Lyon
        </p>
        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1 className="text-[clamp(3.1rem,8.4vw,8rem)] font-semibold leading-[0.9] tracking-[-0.05em] lg:col-span-8">
            <RisingWords text="L'immobilier," delay={140} />
            <br />
            <span className="serif-accent tracking-[-0.02em]">
              <RisingWords text="en toute clarté." delay={280} />
            </span>
          </h1>
          <div className="rise lg:col-span-4 lg:pb-2" style={{ "--delay": "520ms" } as CSSProperties}>
            <p className="max-w-md text-lg leading-relaxed text-muted">
              Des biens présentés sans détour autour de Lyon, et des simulateurs pour chiffrer votre projet en quelques secondes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/housing" viewTransition className="btn-primary btn-md sm:btn-lg">
                Voir les biens
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link to="/simulateurs" viewTransition className="btn-outline btn-md sm:btn-lg">
                Simuler mon achat
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div ref={photo} className="hero-photo relative mt-12 h-[62svh] sm:h-[72svh] md:mt-16 lg:h-[min(84svh,58rem)]">
        <div className="hero-curtain absolute inset-0 overflow-hidden bg-soft">
          <picture>
            <source media="(orientation: portrait)" type="image/avif" srcSet={heroSrcSet("portrait", "avif")} sizes={PORTRAIT_SIZES} />
            <source media="(orientation: portrait)" type="image/webp" srcSet={heroSrcSet("portrait", "webp")} sizes={PORTRAIT_SIZES} />
            <source type="image/avif" srcSet={heroSrcSet("paysage", "avif")} sizes={PAYSAGE_SIZES} />
            <img
              src="/accueil/lyon-paysage-1920.webp"
              srcSet={heroSrcSet("paysage", "webp")}
              sizes={PAYSAGE_SIZES}
              alt={HERO_PHOTO.alt}
              width={3840}
              height={2560}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
          {/* Voile très léger, seulement en bas, pour lire les étiquettes */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="container-page absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 pb-5 text-white sm:pb-7">
            <p className="chip bg-white/15 px-3.5 py-1.5 ring-1 ring-inset ring-white/25 backdrop-blur-md sm:ml-6">
              <MapPinIcon className="h-4 w-4" />
              {HERO_PHOTO.place}
            </p>
            {count !== undefined && count > 0 && (
              <Link to="/housing" viewTransition className="chip hidden bg-white/15 px-3.5 py-1.5 ring-1 ring-inset ring-white/25 backdrop-blur-md transition-colors hover:bg-white/25 sm:mr-6 sm:inline-flex">
                {plural(count, "bien disponible", "biens disponibles")}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// Phrase qui s'éclaire mot à mot pendant le défilement
const STATEMENT: { text: string; accent?: boolean }[] = [
  { text: "Acheter un bien, c'est choisir une façon de vivre. Nous vous aidons à la voir" },
  { text: "clairement", accent: true },
  { text: ": des photos soignées, des chiffres transparents, et un interlocuteur de la première visite jusqu'à la signature." },
]

const Statement = () => {
  const ref = useRef<HTMLElement>(null)
  useScrollProgress(ref, (rect, vh) => (vh * 0.85 - rect.top) / (vh * 0.35 + rect.height))

  const words = STATEMENT.flatMap((part) => part.text.split(" ").map((word) => ({ word, accent: part.accent })))
  return (
    <section ref={ref} className="statement container-page py-24 md:py-40" style={{ "--n": words.length } as CSSProperties}>
      <p className="max-w-6xl text-[clamp(1.9rem,4.4vw,3.9rem)] font-medium leading-[1.1] tracking-[-0.035em]">
        {words.map(({ word, accent }, i) => (
          <span key={i} className={accent ? "w serif-accent text-accent-ink" : "w"} style={{ "--i": i } as CSSProperties}>
            {word}
            {/* espace insécable avant « : » pour qu'il ne passe jamais seul à la ligne */}
            {words[i + 1]?.word === ":" ? " " : " "}
          </span>
        ))}
      </p>
    </section>
  )
}

export default Home
