import { useSearchParams } from "react-router"
import Simulators, { TABS, TabId } from "../components/simulators/Simulators"
import Reveal, { RisingWords } from "../components/Reveal"
import { usePageMeta } from "../lib/hooks"

const Simulation = () => {
  const [params, setParams] = useSearchParams()
  const tabParam = params.get("onglet")
  const initialTab = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "pret"
  const initialPrice = Number(params.get("prix")) || undefined
  usePageMeta({
    title: "Simulateurs immobiliers : prêt, frais de notaire, budget",
    description: "Calculez gratuitement vos mensualités de prêt immobilier, vos frais de notaire et le budget total de votre achat, en quelques secondes.",
  })

  // L'onglet ouvert et le prix sont gardés dans l'adresse : un lien partagé rouvre la même simulation
  const updateParam = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(key, value)
        return next
      },
      { replace: true, preventScrollReset: true },
    )

  return (
    <div className="container-page pb-24 pt-32 md:pb-36 md:pt-40">
      <header className="max-w-3xl">
        <p className="eyebrow rise">Simulateurs</p>
        <h1 className="display-1 mt-5">
          <RisingWords text="Chiffrez votre" delay={80} />
          <span className="serif-accent">
            <RisingWords text="projet." delay={220} />
          </span>
        </h1>
        <p className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted" style={{ ["--delay" as string]: "300ms" }}>
          Prêt, frais de notaire et budget global : les trois onglets partagent vos réglages, pour une vue complète de votre achat.
        </p>
      </header>

      <Reveal delay={200} className="mt-14">
        <Simulators
          initialTab={initialTab}
          initialPrice={initialPrice}
          onTabChange={(tab) => updateParam("onglet", tab)}
          onPriceChange={(price) => updateParam("prix", String(Math.round(price)))}
        />
      </Reveal>

      <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-muted">
        Ces simulations sont des estimations indicatives, sans valeur contractuelle. Les frais de notaire suivent le barème réglementé
        et les droits de mutation en vigueur (taux départemental de 5 %, 4,5 % pour un premier achat de résidence principale).
        Le taux d'endettement de 35 % est la limite recommandée par le Haut Conseil de stabilité financière.
      </p>
    </div>
  )
}

export default Simulation
