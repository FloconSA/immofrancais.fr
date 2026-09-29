import { useMemo, useRef, useState } from "react"
import type { LoanYear } from "../../lib/finance"
import { useSize } from "../../lib/hooks"
import { compactEuros, cn, euros, percent } from "../../lib/format"

export const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"]

/* ------------------------------------------------------------------ */
/* Barre de répartition + légende chiffrée                             */
/* ------------------------------------------------------------------ */

export type Segment = { label: string; value: number; color: string; detail?: string }

export const StackedBar = ({ segments, label }: { segments: Segment[]; label: string }) => {
  const visible = segments.filter((s) => s.value > 0)
  const total = visible.reduce((sum, s) => sum + s.value, 0) || 1
  return (
    <div>
      {/* Chaque part est séparée de la suivante par un petit espace, pas par un trait */}
      <div className="flex h-3 w-full gap-[2px]" role="img" aria-label={`${label} : ${visible.map((s) => `${s.label} ${euros(s.value)}`).join(", ")}`}>
        {visible.map((s, i) => (
          <div
            key={s.label}
            title={`${s.label} : ${euros(s.value)}`}
            className={cn("h-full min-w-[3px] transition-[flex-grow] duration-700 ease-out-expo", i === 0 && "rounded-l", i === visible.length - 1 && "rounded-r")}
            style={{ flexGrow: s.value, flexBasis: 0, background: s.color }}
          />
        ))}
      </div>
      <dl className="mt-5 grid gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-baseline justify-between gap-4 text-[15px]">
            <dt className="flex min-w-0 items-baseline gap-2.5">
              <span className="h-2.5 w-2.5 shrink-0 translate-y-[-1px] rounded-sm" style={{ background: s.color }} aria-hidden="true" />
              <span className="min-w-0">
                {s.label}
                {s.detail && <span className="block text-[13px] text-muted">{s.detail}</span>}
              </span>
            </dt>
            <dd className="tabular shrink-0 text-right">
              <span className="font-medium">{euros(s.value)}</span>
              <span className="ml-2 inline-block w-14 text-[13px] text-muted">{percent(s.value / total)}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Remboursement année par année : capital et intérêts                 */
/* ------------------------------------------------------------------ */

const niceStep = (max: number) => {
  const raw = max / 4
  const power = 10 ** Math.floor(Math.log10(raw || 1))
  const n = raw / power
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * power
}

export const AmortizationChart = ({ schedule }: { schedule: LoanYear[] }) => {
  const box = useRef<HTMLDivElement>(null)
  const { width } = useSize(box)
  const [hover, setHover] = useState<number | null>(null)

  const height = 220
  const pad = { top: 12, right: 4, bottom: 28, left: 52 }
  const plotW = Math.max(0, width - pad.left - pad.right)
  const plotH = height - pad.top - pad.bottom

  const { max, ticks } = useMemo(() => {
    const top = Math.max(1, ...schedule.map((y) => y.principal + y.interest))
    const step = niceStep(top)
    const max = Math.ceil(top / step) * step
    return { max, ticks: Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step) }
  }, [schedule])

  const band = schedule.length ? plotW / schedule.length : 0
  const barW = Math.min(24, Math.max(3, band * 0.62))
  const y = (v: number) => pad.top + plotH - (v / max) * plotH
  const labelEvery = schedule.length > 15 ? 5 : schedule.length > 8 ? 2 : 1
  const active = hover !== null ? schedule[hover] : null

  // Rectangle arrondi seulement en haut (le bas reste posé sur l'axe)
  const topRounded = (x: number, top: number, w: number, h: number, r: number) => {
    const rr = Math.min(r, w / 2, h)
    return `M${x},${top + h} V${top + rr} Q${x},${top} ${x + rr},${top} H${x + w - rr} Q${x + w},${top} ${x + w},${top + rr} V${top + h} Z`
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[0] }} />Capital remboursé</span>
        <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: SERIES[1] }} />Intérêts</span>
      </div>
      <div ref={box} className="relative" onPointerLeave={() => setHover(null)}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label="Remboursement annuel : la part des intérêts diminue chaque année au profit du capital."
            onPointerMove={(e) => {
              const x = e.clientX - e.currentTarget.getBoundingClientRect().left - pad.left
              const i = Math.floor(x / band)
              setHover(i >= 0 && i < schedule.length ? i : null)
            }}
          >
            {ticks.map((t) => (
              <g key={t}>
                <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} style={{ stroke: "rgb(var(--line))" }} strokeWidth={1} />
                <text x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="tabular fill-muted text-[11px]">
                  {compactEuros(t)}
                </text>
              </g>
            ))}
            {schedule.map((row, i) => {
              const x = pad.left + i * band + (band - barW) / 2
              const principalTop = y(row.principal)
              const interestTop = y(row.principal + row.interest)
              const gap = 2
              const interestH = Math.max(0, principalTop - interestTop - gap)
              return (
                <g key={row.year} opacity={hover === null || hover === i ? 1 : 0.35} className="transition-opacity duration-200">
                  <rect x={x} y={principalTop} width={barW} height={Math.max(0, pad.top + plotH - principalTop)} style={{ fill: SERIES[0] }} />
                  {interestH > 0.5 && <path d={topRounded(x, interestTop, barW, interestH, 4)} style={{ fill: SERIES[1] }} />}
                  {(row.year === 1 || row.year % labelEvery === 0) && (
                    <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="tabular fill-muted text-[11px]">
                      {row.year === 1 ? "An 1" : row.year}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
        {active && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-52 rounded-2xl bg-surface p-3.5 text-[13px] shadow-xl ring-1 ring-line"
            style={{
              left: Math.min(Math.max(0, pad.left + hover! * band + band / 2 - 104), Math.max(0, width - 208)),
            }}
          >
            <p className="font-medium">Année {active.year}</p>
            <dl className="mt-2 grid gap-1">
              <Row color={SERIES[0]} label="Capital" value={euros(active.principal)} />
              <Row color={SERIES[1]} label="Intérêts" value={euros(active.interest)} />
              <div className="mt-1 flex justify-between border-t border-line pt-1.5 text-muted">
                <dt>Reste dû</dt>
                <dd className="tabular">{euros(active.remaining)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}

const Row = ({ color, label, value }: { color: string; label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="flex items-center gap-2 text-muted">
      <span className="h-2 w-2 rounded-sm" style={{ background: color }} />
      {label}
    </dt>
    <dd className="tabular font-medium">{value}</dd>
  </div>
)

/* ------------------------------------------------------------------ */
/* Tableau d'amortissement (même données que le graphique)             */
/* ------------------------------------------------------------------ */

export const AmortizationTable = ({ schedule }: { schedule: LoanYear[] }) => (
  <div className="max-h-80 overflow-auto rounded-2xl ring-1 ring-line">
    <table className="tabular w-full text-right text-[13px]">
      <thead className="sticky top-0 bg-surface text-muted">
        <tr className="border-b border-line">
          <th className="px-3 py-2.5 text-left font-medium">Année</th>
          <th className="px-3 py-2.5 font-medium">Capital</th>
          <th className="px-3 py-2.5 font-medium">Intérêts</th>
          <th className="px-3 py-2.5 font-medium">Assurance</th>
          <th className="px-3 py-2.5 font-medium">Reste dû</th>
        </tr>
      </thead>
      <tbody>
        {schedule.map((row) => (
          <tr key={row.year} className="border-b border-line/60 last:border-0">
            <td className="px-3 py-2 text-left">{row.year}</td>
            <td className="px-3 py-2">{euros(row.principal)}</td>
            <td className="px-3 py-2">{euros(row.interest)}</td>
            <td className="px-3 py-2">{euros(row.insurance)}</td>
            <td className="px-3 py-2">{euros(row.remaining)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
