import { CSSProperties, KeyboardEvent, ReactNode, useId, useLayoutEffect, useRef, useState } from "react"
import { clamp, cn, number } from "../../lib/format"

/* ------------------------------------------------------------------ */
/* Champ numérique + curseur                                           */
/* ------------------------------------------------------------------ */

type NumberFieldProps = {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number // borne du curseur
  inputMax?: number // borne de la saisie au clavier (peut dépasser le curseur)
  step: number
  suffix: string
  decimals?: number
  hint?: ReactNode
}

const parse = (text: string) => Number(text.replace(/[\s  €%]/g, "").replace(",", "."))

export const NumberField = ({ label, value, onChange, min, max, inputMax, step, suffix, decimals = 0, hint }: NumberFieldProps) => {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const fill = ((clamp(value, min, max) - min) / (max - min)) * 100

  const commit = () => {
    setDraft(null)
    onChange(clamp(Number.isFinite(value) ? value : min, min, inputMax ?? max))
  }

  const shown = draft ?? number(value, decimals)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="min-w-0 text-[15px] text-muted">{label}</label>
        <div className="flex shrink-0 items-baseline gap-1 whitespace-nowrap rounded-lg px-1 transition-colors focus-within:bg-soft">
          <input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            value={shown}
            // Le champ prend exactement la largeur du nombre affiché
            style={{ width: `calc(${Math.max(2, shown.length)}ch + 6px)` }}
            onFocus={(e) => {
              setDraft(String(Number(value.toFixed(decimals))).replace(".", ","))
              requestAnimationFrame(() => e.target.select())
            }}
            onChange={(e) => {
              setDraft(e.target.value)
              const parsed = parse(e.target.value)
              if (Number.isFinite(parsed)) onChange(parsed)
            }}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            className="tabular min-w-0 bg-transparent text-right text-lg font-medium tracking-tight outline-none"
          />
          <span className="text-[15px] text-muted">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value, min, max)}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="range mt-2"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      {hint && <p className="mt-1 text-[13px] text-muted">{hint}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Choix entre plusieurs options (pastille qui glisse)                 */
/* ------------------------------------------------------------------ */

type SegmentedProps<T extends string | number> = {
  label?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  size?: "sm" | "md"
  className?: string
}

export const Segmented = <T extends string | number>({ label, value, options, onChange, size = "md", className }: SegmentedProps<T>) => {
  const container = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)
  const index = options.findIndex((o) => o.value === value)

  useLayoutEffect(() => {
    const measure = () => {
      const button = container.current?.querySelectorAll<HTMLButtonElement>("[data-option]")[index]
      if (button) setIndicator({ left: button.offsetLeft, width: button.offsetWidth })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (container.current) observer.observe(container.current)
    return () => observer.disconnect()
  }, [index, options.length])

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length
    onChange(options[next].value)
    container.current?.querySelectorAll<HTMLButtonElement>("[data-option]")[next]?.focus()
  }

  return (
    <div className={className}>
      {label && <p className="mb-2 text-[15px] text-muted">{label}</p>}
      <div ref={container} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="relative inline-flex max-w-full rounded-full bg-soft p-1 ring-1 ring-inset ring-line/60">
        {indicator && (
          <span
            aria-hidden="true"
            className="absolute bottom-1 top-1 rounded-full bg-surface shadow-sm ring-1 ring-line/60 transition-[left,width] duration-500 ease-out-expo"
            style={{ left: indicator.left, width: indicator.width }}
          />
        )}
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            tabIndex={option.value === value ? 0 : -1}
            data-option
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 whitespace-nowrap rounded-full font-medium transition-colors",
              size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2 text-sm",
              option.value === value ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Interrupteur oui / non                                              */
/* ------------------------------------------------------------------ */

export const Switch = ({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-start justify-between gap-6">
    <span>
      <span className="block text-[15px]">{label}</span>
      {hint && <span className="mt-0.5 block text-[13px] text-muted">{hint}</span>}
    </span>
    <span className="relative mt-0.5 inline-flex shrink-0">
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="h-7 w-12 rounded-full bg-line transition-colors duration-300 peer-checked:bg-accent peer-focus-visible:ring-4 peer-focus-visible:ring-accent/25" />
      <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-out-expo peer-checked:translate-x-5" />
    </span>
  </label>
)
