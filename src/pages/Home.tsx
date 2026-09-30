import { CSSProperties, useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import HouseCard, { HouseCardSkeleton } from "../components/HouseCard"
import Reveal, { RisingWords } from "../components/Reveal"
import Contact from "../components/Contact"
import MiniSimulator from "../components/simulators/MiniSimulator"
import { useHouses } from "../lib/houses"
import { useMediaQuery, useScrollProgress } from "../lib/hooks"
import { cn, plural } from "../lib/format"
import paysageAv1 from "../assets/lyon-paysage-av1.mp4"
import paysageH264 from "../assets/lyon-paysage-h264.mp4"
import portraitAv1 from "../assets/lyon-portrait-av1.mp4"
import portraitH264 from "../assets/lyon-portrait-h264.mp4"

const Home = () => {
  const { houses, loading, error } = useHouses()
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

const Hero = ({ count }: { count?: number }) => {
  const ref = useRef<HTMLElement>(null)
  // 0 en haut de page, 1 quand la section est sortie de l'écran
  useScrollProgress(ref, (rect) => -rect.top / rect.height)

  return (
    <section ref={ref} className="hero relative h-[100svh] min-h-[600px] overflow-hidden bg-neutral-950 text-white">
      <div className="hero-media absolute inset-0">
        <div className="hero-zoom absolute inset-0">
          {/* Première image de la vidéo : affichée tout de suite, la vidéo prend le relais sans raccord visible */}
          <picture className="absolute inset-0">
            <source media="(orientation: portrait)" srcSet="/lyon-portrait-720.webp 720w, /lyon-portrait-1080.webp 1080w" sizes="100vw" />
            <img
              src="/lyon-paysage-1920.webp"
              srcSet="/lyon-paysage-1280.webp 1280w, /lyon-paysage-1920.webp 1920w"
              sizes="100vw"
              alt="Lyon vue du ciel, au-dessus de la basilique de Fourvière"
              width={1920}
              height={1080}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </picture>
          <HeroVideo />
        </div>
      </div>
      <div className="hero-shade absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      {/* Bandeau sombre sous le menu : la vidéo passe sur des toits très clairs */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/45 to-transparent" />

      <div className="hero-content container-page relative flex h-full flex-col justify-end pb-20 sm:pb-28">
        <p className="rise inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium ring-1 ring-inset ring-white/20 backdrop-blur-md" style={{ "--delay": "100ms" } as CSSProperties}>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Réseau immobilier 100 % digital · Lyon
        </p>
        <h1 className="mt-7 max-w-5xl text-[clamp(3.1rem,9.5vw,8.75rem)] font-semibold leading-[0.9] tracking-[-0.05em]">
          <RisingWords text="L'immobilier," delay={200} />
          <br />
          <span className="serif-accent tracking-[-0.02em]">
            <RisingWords text="en toute clarté." delay={340} />
          </span>
        </h1>
        <p className="rise mt-8 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl" style={{ "--delay": "650ms" } as CSSProperties}>
          Des biens présentés sans détour autour de Lyon, et des simulateurs pour chiffrer votre projet en quelques secondes.
        </p>
        <div className="rise mt-10 flex flex-wrap gap-3" style={{ "--delay": "800ms" } as CSSProperties}>
          <Link to="/housing" viewTransition className="btn-light btn-lg">
            Voir les biens
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <Link to="/simulateurs" viewTransition className="btn-glass btn-lg">
            Simuler mon achat
          </Link>
        </div>
      </div>

      <div className="rise absolute bottom-8 right-8 hidden items-center gap-4 text-[13px] text-white/70 sm:flex" style={{ "--delay": "1200ms" } as CSSProperties}>
        {count !== undefined && <span>{plural(count, "bien disponible", "biens disponibles")}</span>}
        <span className="scroll-cue relative block h-10 w-px overflow-hidden bg-white/25" />
      </div>
    </section>
  )
}

// Survol de Lyon (vidéo Pexels, libre de droits) qui tourne en boucle : la fin se fond dans le début.
// Un cadrage pour ordinateur et un pour téléphone, chacun en AV1 (plus léger) et en H.264 (appareils plus anciens).
const HERO_VIDEOS = {
  paysage: [
    { src: paysageAv1, type: 'video/mp4; codecs="av01.0.08M.08"' },
    { src: paysageH264, type: "video/mp4" },
  ],
  portrait: [
    { src: portraitAv1, type: 'video/mp4; codecs="av01.0.08M.08"' },
    { src: portraitH264, type: "video/mp4" },
  ],
}

const HeroVideo = () => {
  const portrait = useMediaQuery("(orientation: portrait)")
  const [allowed, setAllowed] = useState(false)

  // Téléchargée une fois la page chargée, pour ne pas ralentir l'affichage.
  // Jamais si l'appareil demande moins d'animations ou d'économiser les données : la photo reste.
  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (saveData || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const start = () => setAllowed(true)
    if (document.readyState === "complete") {
      start()
      return
    }
    window.addEventListener("load", start, { once: true })
    return () => window.removeEventListener("load", start)
  }, [])

  if (!allowed) return null
  // Nouvelle vidéo si le téléphone pivote (ou si la fenêtre change de forme)
  const format = portrait ? "portrait" : "paysage"
  return <LoopVideo key={format} sources={HERO_VIDEOS[format]} />
}

const LoopVideo = ({ sources }: { sources: { src: string; type: string }[] }) => {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  // Lecture seulement quand le haut de la page est à l'écran
  useEffect(() => {
    const video = ref.current
    if (!video) return
    video.muted = true
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
      className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-1000", playing ? "opacity-100" : "opacity-0")}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
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
