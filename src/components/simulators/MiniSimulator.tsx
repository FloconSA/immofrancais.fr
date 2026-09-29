import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import { NumberField, Segmented } from "./fields"
import { DEFAULTS, computeBudget, defaultDownPayment } from "../../lib/finance"
import { useTweenedNumber } from "../../lib/hooks"
import { euros, number } from "../../lib/format"

/** Aperçu du simulateur sur l'accueil : trois réglages, trois résultats */
const MiniSimulator = ({ initialPrice }: { initialPrice?: number }) => {
  const [price, setPrice] = useState(initialPrice || DEFAULTS.price)
  const [downPayment, setDownPayment] = useState(defaultDownPayment(initialPrice || DEFAULTS.price))
  const [years, setYears] = useState(DEFAULTS.years)
  const [touched, setTouched] = useState(false)

  // Dès que l'annonce à la une est chargée, on part de son prix
  useEffect(() => {
    if (initialPrice && !touched) {
      setPrice(initialPrice)
      setDownPayment(defaultDownPayment(initialPrice))
    }
  }, [initialPrice, touched])

  const budget = useMemo(
    () => computeBudget({ price, kind: "ancien", firstTime: false, downPayment, works: 0, bankFees: DEFAULTS.bankFees, years, rate: DEFAULTS.rate, insurance: DEFAULTS.insurance }),
    [price, downPayment, years],
  )
  const monthly = useTweenedNumber(budget.loan.monthly)

  return (
    <div className="card overflow-hidden shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)]">
      <div className="grid gap-7 p-6 sm:p-8">
        <NumberField
          label="Prix du bien"
          value={price}
          onChange={(v) => { setTouched(true); setPrice(v) }}
          min={50_000}
          max={1_000_000}
          inputMax={20_000_000}
          step={5_000}
          suffix="€"
        />
        <NumberField
          label="Apport"
          value={downPayment}
          onChange={(v) => { setTouched(true); setDownPayment(v) }}
          min={0}
          max={Math.max(50_000, Math.round(price * 0.5))}
          inputMax={20_000_000}
          step={1_000}
          suffix="€"
        />
        <Segmented
          label="Durée"
          value={years}
          onChange={(v) => { setTouched(true); setYears(v) }}
          options={[15, 20, 25].map((y) => ({ value: y, label: `${y} ans` }))}
        />
      </div>
      <div className="border-t border-line bg-soft/60 p-6 sm:p-8">
        <p className="text-[15px] text-muted">Mensualité estimée</p>
        <p className="mt-1 text-5xl font-semibold tracking-[-0.04em]" aria-live="polite">
          {euros(monthly)}
          <span className="ml-2 text-lg font-medium tracking-tight text-muted">/ mois</span>
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-[15px]">
          <div>
            <dt className="text-muted">Frais de notaire</dt>
            <dd className="mt-0.5 font-semibold">{euros(budget.notary.total)}</dd>
          </div>
          <div>
            <dt className="text-muted">Budget total</dt>
            <dd className="mt-0.5 font-semibold">{euros(budget.total)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[13px] text-muted">
            Taux indicatif {number(DEFAULTS.rate, 2)} %, assurance comprise.
          </p>
          <Link to={`/simulateurs?onglet=budget&prix=${Math.round(price)}`} viewTransition className="link-arrow text-accent-ink">
            Simulation complète
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MiniSimulator
