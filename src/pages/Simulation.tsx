import { useSearchParams } from "react-router"
import Simulators, { TABS, TabId } from "../components/simulators/Simulators"
import Reveal, { RisingWords } from "../components/Reveal"
import { usePageMeta } from "../lib/hooks"
import { clamp } from "../lib/format"

const Simulation = () => {
  const [params, setParams] = useSearchParams()
  const tabParam = params.get("onglet")
  const initialTab = TABS.some((t) => t.id === tabParam) ? (tabParam as TabId) : "pret"
  // Valeurs lues dans l'adresse, ramenées dans les bornes des champs (un lien modifié à la main
  // ne doit pas afficher de résultat absurde)
  const read = (key: string) => {
    const raw = params.get(key)
    const value = raw === null || raw.trim() === "" ? NaN : Number(raw)
    return Number.isFinite(value) ? value : undefined
  }
  const prix = read("prix")
  const apport = read("apport")
  const duree = read("duree")
  const initialPrice = prix !== undefined && prix > 0 ? clamp(Math.round(prix), 30_000, 20_000_000) : undefined
  const initialDownPayment = apport !== undefined ? clamp(Math.round(apport), 0, 10_000_000) : undefined
  const initialYears = duree !== undefined && [10, 15, 20, 25].includes(duree) ? duree : undefined
  usePageMeta({
    title: "Simulateurs immobiliers : prêt, frais de notaire, budget",
    description: "Calculez gratuitement vos mensualités de prêt immobilier, vos frais de notaire et le budget total de votre achat, en quelques secondes.",
  })

  // L'onglet ouvert, le prix, l'apport et la durée sont gardés dans l'adresse : un lien partagé rouvre la même simulation
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
          initialDownPayment={initialDownPayment}
          initialYears={initialYears}
          onTabChange={(tab) => updateParam("onglet", tab)}
          onParamChange={(param, value) => updateParam(param, String(Math.round(value)))}
        />
      </Reveal>

      <p className="mt-10 max-w-3xl text-[13px] leading-relaxed text-muted">
        Ces simulations sont des estimations indicatives, sans valeur contractuelle. Les frais de notaire suivent le barème réglementé
        et les droits de mutation en vigueur : taux départemental de 5 %, appliqué notamment dans la Métropole de Lyon, le Rhône,
        l'Ain, l'Isère et la Loire jusqu'au 31 mars 2028, et 4,5 % pour un premier achat de résidence principale.
        Le taux d'endettement de 35 % est la limite recommandée par le Haut Conseil de stabilité financière.
      </p>
    </div>
  )
}

export default Simulation
