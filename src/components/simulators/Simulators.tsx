import { KeyboardEvent, ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ArrowPathIcon, ArrowRightIcon, ChevronDownIcon } from "@heroicons/react/20/solid"
import { BanknotesIcon, CalculatorIcon, ScaleIcon } from "@heroicons/react/24/outline"
import { NumberField, Segmented, Switch } from "./fields"
import { AmortizationChart, AmortizationTable, SERIES, StackedBar } from "./charts"
import {
  DEFAULTS,
  FORMALITIES,
  GUARANTEE_RATE,
  MAX_DEBT_RATIO,
  PropertyKind,
  computeBudget,
  computeLoan,
  computeNotary,
  defaultDownPayment,
} from "../../lib/finance"
import { useTweenedNumber } from "../../lib/hooks"
import { cn, euros, number, percent } from "../../lib/format"

export type TabId = "pret" | "notaire" | "budget"

export const TABS: { id: TabId; label: string; short: string; icon: typeof CalculatorIcon }[] = [
  { id: "pret", label: "Prêt immobilier", short: "Prêt", icon: CalculatorIcon },
  { id: "notaire", label: "Frais de notaire", short: "Notaire", icon: ScaleIcon },
  { id: "budget", label: "Budget total", short: "Budget", icon: BanknotesIcon },
]

type Props = {
  initialPrice?: number
  initialTab?: TabId
  onTabChange?: (tab: TabId) => void
  onPriceChange?: (price: number) => void
}

/**
 * Les trois simulateurs partagent le même projet (prix, apport, durée, taux…) :
 * une valeur changée dans un onglet est reprise dans les autres.
 */
const Simulators = ({ initialPrice, initialTab = "pret", onTabChange, onPriceChange }: Props) => {
  const startPrice = initialPrice && initialPrice > 0 ? initialPrice : DEFAULTS.price
  const [tab, setTab] = useState<TabId>(initialTab)
  const [price, setPriceState] = useState(startPrice)
  const [kind, setKind] = useState<PropertyKind>("ancien")
  const [firstTime, setFirstTime] = useState(false)
  const [downPayment, setDownPayment] = useState(defaultDownPayment(startPrice))
  const [works, setWorks] = useState(0)
  const [bankFees, setBankFees] = useState(DEFAULTS.bankFees)
  const [years, setYears] = useState(DEFAULTS.years)
  const [rate, setRate] = useState(DEFAULTS.rate)
  const [insurance, setInsurance] = useState(DEFAULTS.insurance)
  const [income, setIncome] = useState(0)
  // Montant du prêt saisi à la main (sinon : calculé depuis le budget)
  const [loanOverride, setLoanOverride] = useState<number | null>(null)

  const setPrice = (value: number) => {
    setPriceState(value)
    onPriceChange?.(value)
  }

  const budget = useMemo(
    () => computeBudget({ price, kind, firstTime, downPayment, works, bankFees, years, rate, insurance }),
    [price, kind, firstTime, downPayment, works, bankFees, years, rate, insurance],
  )
  const loanAmount = loanOverride ?? Math.round(budget.loanAmount)
  const loan = useMemo(() => computeLoan({ amount: loanAmount, years, rate, insurance }), [loanAmount, years, rate, insurance])

  const selectTab = (id: TabId) => {
    setTab(id)
    onTabChange?.(id)
  }

  const shared = { price, setPrice, kind, setKind, firstTime, setFirstTime }

  return (
    <div>
      <Tabs value={tab} onChange={selectTab} />
      <div key={tab} id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="tab-panel mt-8 grid gap-6 lg:grid-cols-12">
        {tab === "pret" && (
          <>
            <Inputs>
              <NumberField
                label="Montant emprunté"
                value={loanAmount}
                onChange={setLoanOverride}
                min={10_000}
                max={1_500_000}
                inputMax={10_000_000}
                step={1_000}
                suffix="€"
                hint={
                  loanOverride === null ? (
                    "Calculé à partir de l'onglet Budget total."
                  ) : (
                    <button type="button" onClick={() => setLoanOverride(null)} className="inline-flex items-center gap-1 font-medium text-accent-ink hover:underline">
                      <ArrowPathIcon className="h-3.5 w-3.5" />
                      Reprendre le montant du budget ({euros(budget.loanAmount)})
                    </button>
                  )
                }
              />
              <LoanTerms {...{ years, setYears, rate, setRate, insurance, setInsurance }} />
              <NumberField
                label="Revenus nets du foyer"
                value={income}
                onChange={setIncome}
                min={0}
                max={15_000}
                inputMax={200_000}
                step={100}
                suffix="€ / mois"
                hint="Facultatif : pour calculer votre taux d'endettement."
              />
            </Inputs>
            <Results>
              <HeroFigure label="Mensualité, assurance comprise" value={loan.monthly} suffix="/ mois" />
              <p className="mt-2 text-[15px] text-muted">
                dont {euros(loan.insuranceMonthly)} d'assurance · {number(loan.months)} mensualités
              </p>
              <Stats
                items={[
                  { label: "Coût des intérêts", value: euros(loan.interest) },
                  { label: "Coût de l'assurance", value: euros(loan.insuranceTotal) },
                  { label: "Coût total du crédit", value: euros(loan.cost) },
                ]}
              />
              {income > 0 && <DebtRatio ratio={loan.monthly / income} income={income} />}
              <div className="mt-8 border-t border-line pt-8">
                <p className="mb-5 font-medium">Répartition de vos remboursements</p>
                <AmortizationChart schedule={loan.schedule} />
                <Disclosure label="Voir le tableau d'amortissement">
                  <AmortizationTable schedule={loan.schedule} />
                </Disclosure>
              </div>
            </Results>
          </>
        )}

        {tab === "notaire" && (
          <>
            <Inputs>
              <PropertyInputs {...shared} />
            </Inputs>
            <Results>
              <HeroFigure label="Frais de notaire estimés" value={budget.notary.total} />
              <p className="mt-2 text-[15px] text-muted">
                soit {percent(budget.notary.ratio)} du prix du bien
              </p>
              <div className="mt-8 border-t border-line pt-8">
                <StackedBar
                  label="Composition des frais de notaire"
                  segments={[
                    { label: "Droits de mutation", detail: `Impôts reversés à l'État et aux collectivités (${number(budget.notary.dutiesRate, 2)} %)`, value: budget.notary.duties, color: SERIES[0] },
                    { label: "Émoluments du notaire", detail: "Rémunération réglementée, TVA comprise", value: budget.notary.emoluments, color: SERIES[1] },
                    { label: "Débours et formalités", detail: `Documents, cadastre, sécurité immobilière (forfait ≈ ${euros(FORMALITIES)})`, value: budget.notary.formalities + budget.notary.securityContribution, color: SERIES[2] },
                  ]}
                />
              </div>
              <Note>
                Environ 7 à 8 % du prix dans l'ancien, 2 à 3 % dans le neuf. Seul le notaire peut établir le montant exact.
              </Note>
            </Results>
          </>
        )}

        {tab === "budget" && (
          <>
            <Inputs>
              <PropertyInputs {...shared} />
              <NumberField label="Apport personnel" value={downPayment} onChange={setDownPayment} min={0} max={Math.max(100_000, Math.round(price * 0.5))} inputMax={10_000_000} step={1_000} suffix="€" />
              <NumberField label="Travaux" value={works} onChange={setWorks} min={0} max={200_000} inputMax={5_000_000} step={1_000} suffix="€" />
              <NumberField label="Frais de dossier bancaire" value={bankFees} onChange={setBankFees} min={0} max={3_000} step={50} suffix="€" />
              <LoanTerms {...{ years, setYears, rate, setRate, insurance, setInsurance }} />
            </Inputs>
            <Results>
              <HeroFigure label="Budget total de l'opération" value={budget.total} />
              <p className="mt-2 text-[15px] text-muted">
                dont {euros(budget.total - price)} de frais en plus du prix
              </p>
              <div className="mt-8 border-t border-line pt-8">
                <StackedBar
                  label="Composition du budget"
                  segments={[
                    { label: "Prix du bien", value: price, color: SERIES[0] },
                    { label: "Frais de notaire", value: budget.notary.total, color: SERIES[1] },
                    { label: "Travaux", value: works, color: SERIES[2] },
                    { label: "Frais bancaires", detail: `Dossier et garantie du prêt (≈ ${number(GUARANTEE_RATE * 100)} % du prêt)`, value: bankFees + budget.guarantee, color: SERIES[3] },
                  ]}
                />
              </div>
              <Stats
                items={[
                  { label: "Apport", value: euros(downPayment) },
                  { label: "Montant à emprunter", value: euros(budget.loanAmount) },
                  { label: "Mensualité estimée", value: `${euros(budget.loan.monthly)} / mois` },
                ]}
              />
              <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-soft p-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[15px]">
                  <span className="text-muted">Revenus nets conseillés</span>
                  <span className="mt-0.5 block text-xl font-semibold tracking-tight">{euros(budget.incomeNeeded)} / mois</span>
                  <span className="text-[13px] text-muted">pour rester sous {percent(MAX_DEBT_RATIO, 0)} d'endettement</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoanOverride(null)
                    selectTab("pret")
                  }}
                  className="btn-primary btn-md"
                >
                  Détail du prêt
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            </Results>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Onglets                                                             */
/* ------------------------------------------------------------------ */

const Tabs = ({ value, onChange }: { value: TabId; onChange: (tab: TabId) => void }) => {
  const list = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)
  const index = TABS.findIndex((t) => t.id === value)

  useLayoutEffect(() => {
    const measure = () => {
      const el = list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (list.current) observer.observe(list.current)
    return () => observer.disconnect()
  }, [index])

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    const next = (index + moves[event.key] + TABS.length) % TABS.length
    onChange(TABS[next].id)
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus()
  }

  return (
    <div>
      <div ref={list} role="tablist" aria-label="Simulateurs" onKeyDown={onKeyDown} className="relative flex w-full rounded-full bg-soft p-1.5 ring-1 ring-inset ring-line/60 sm:inline-flex sm:w-auto">
        {indicator && (
          <span
            aria-hidden="true"
            className="absolute bottom-1.5 top-1.5 rounded-full bg-ink transition-[left,width] duration-500 ease-out-expo"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
        {TABS.map((t) => {
          const selected = t.id === value
          return (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              className={cn(
                "relative z-10 inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-medium transition-colors duration-300 sm:flex-none sm:px-5",
                selected ? "text-canvas" : "text-muted hover:text-ink",
              )}
            >
              <t.icon className="h-[18px] w-[18px]" />
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Blocs communs                                                       */
/* ------------------------------------------------------------------ */

const Inputs = ({ children }: { children: ReactNode }) => (
  <div className="card grid content-start gap-7 p-6 sm:p-8 lg:col-span-5">{children}</div>
)

const Results = ({ children }: { children: ReactNode }) => (
  <div className="card p-6 sm:p-8 lg:col-span-7">{children}</div>
)

type PropertyProps = {
  price: number
  setPrice: (v: number) => void
  kind: PropertyKind
  setKind: (v: PropertyKind) => void
  firstTime: boolean
  setFirstTime: (v: boolean) => void
}

const PropertyInputs = ({ price, setPrice, kind, setKind, firstTime, setFirstTime }: PropertyProps) => (
  <>
    <NumberField label="Prix du bien" value={price} onChange={setPrice} min={30_000} max={1_500_000} inputMax={20_000_000} step={5_000} suffix="€" />
    <Segmented
      label="Type de bien"
      value={kind}
      onChange={setKind}
      options={[
        { value: "ancien", label: "Ancien" },
        { value: "neuf", label: "Neuf" },
      ]}
    />
    {kind === "ancien" && (
      <Switch
        label="Premier achat de résidence principale"
        hint="Droits départementaux à 4,5 % au lieu de 5 %."
        checked={firstTime}
        onChange={setFirstTime}
      />
    )}
  </>
)

type TermsProps = {
  years: number
  setYears: (v: number) => void
  rate: number
  setRate: (v: number) => void
  insurance: number
  setInsurance: (v: number) => void
}

const LoanTerms = ({ years, setYears, rate, setRate, insurance, setInsurance }: TermsProps) => (
  <>
    <Segmented
      label="Durée du prêt"
      value={years}
      onChange={setYears}
      options={[10, 15, 20, 25].map((y) => ({ value: y, label: `${y} ans` }))}
    />
    <NumberField label="Taux du crédit" value={rate} onChange={setRate} min={0} max={7} inputMax={20} step={0.05} decimals={2} suffix="%" hint="Taux indicatif, à ajuster selon votre banque." />
    <NumberField label="Assurance emprunteur" value={insurance} onChange={setInsurance} min={0} max={1} inputMax={3} step={0.01} decimals={2} suffix="% / an" />
  </>
)

/** Le grand chiffre principal, qui « roule » quand il change */
export const HeroFigure = ({ label, value, suffix }: { label: string; value: number; suffix?: string }) => {
  const shown = useTweenedNumber(value)
  return (
    <div>
      <p className="text-[15px] text-muted">{label}</p>
      <p className="mt-2 text-[clamp(2.75rem,6vw,4rem)] font-semibold leading-none tracking-[-0.04em]" aria-live="polite">
        {euros(shown)}
        {suffix && <span className="ml-2 text-xl font-medium tracking-tight text-muted">{suffix}</span>}
      </p>
    </div>
  )
}

const Stats = ({ items }: { items: { label: string; value: string }[] }) => (
  <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
    {items.map((item) => (
      <div key={item.label} className="rounded-2xl bg-soft p-4">
        <dt className="text-[13px] text-muted">{item.label}</dt>
        <dd className="mt-1 text-lg font-semibold tracking-tight">{item.value}</dd>
      </div>
    ))}
  </dl>
)

const DebtRatio = ({ ratio, income }: { ratio: number; income: number }) => {
  const level = ratio <= 0.33 ? "good" : ratio <= MAX_DEBT_RATIO ? "warning" : "critical"
  const colors = { good: "#0ca30c", warning: "#fab219", critical: "#d03b3b" }
  const labels = {
    good: "Sous le seuil de 35 % appliqué par les banques",
    warning: "Proche du seuil de 35 % appliqué par les banques",
    critical: "Au-dessus du seuil de 35 % appliqué par les banques",
  }
  return (
    <div className="mt-6 rounded-2xl bg-soft p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] text-muted">Taux d'endettement</p>
        <p className="text-xl font-semibold tracking-tight">{percent(ratio)}</p>
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-line">
        <div className="h-full rounded-full transition-[width] duration-700 ease-out-expo" style={{ width: `${Math.min(100, ratio * 200)}%`, background: colors[level] }} />
        {/* Repère des 35 % (l'échelle va de 0 à 50 %) */}
        <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink" style={{ left: `${MAX_DEBT_RATIO * 200}%` }} aria-hidden="true" />
      </div>
      <p className="mt-3 flex items-center gap-2 text-[13px]">
        <span className="h-2 w-2 rounded-full" style={{ background: colors[level] }} aria-hidden="true" />
        {labels[level]} · {euros(income * MAX_DEBT_RATIO)} / mois au maximum
      </p>
    </div>
  )
}

const Disclosure = ({ label, children }: { label: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-6">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink">
        {label}
        <ChevronDownIcon className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && <div className="tab-panel mt-4">{children}</div>}
    </div>
  )
}

const Note = ({ children }: { children: ReactNode }) => <p className="mt-8 text-[13px] leading-relaxed text-muted">{children}</p>

export default Simulators
