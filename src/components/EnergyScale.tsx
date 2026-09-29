import { cn } from "../lib/format"

const LETTERS = ["A", "B", "C", "D", "E", "F", "G"]

// Couleurs officielles des étiquettes (texte foncé sur les teintes claires)
const SCALES = {
  DPE: {
    title: "Performance énergétique",
    subtitle: "DPE · consommation",
    colors: ["bg-DPE-A", "bg-DPE-B", "bg-DPE-C", "bg-DPE-D", "bg-DPE-E", "bg-DPE-F", "bg-DPE-G"],
    darkText: ["B", "C", "D", "E", "F"],
    best: "Très économe",
    worst: "Très énergivore",
  },
  GES: {
    title: "Émissions de gaz à effet de serre",
    subtitle: "GES · climat",
    colors: ["bg-GES-A", "bg-GES-B", "bg-GES-C", "bg-GES-D", "bg-GES-E", "bg-GES-F", "bg-GES-G"],
    darkText: ["A", "B", "C"],
    best: "Faibles émissions",
    worst: "Fortes émissions",
  },
}

const EnergyScale = ({ kind, value }: { kind: "DPE" | "GES"; value?: string }) => {
  const scale = SCALES[kind]
  return (
    <div className="card p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">{scale.title}</p>
          <p className="mt-0.5 text-[13px] text-muted">{scale.subtitle}</p>
        </div>
        <p className="text-right">
          <span className="block text-[13px] text-muted">Classe</span>
          <span className="text-4xl font-semibold leading-none tracking-tight">{value ?? "—"}</span>
        </p>
      </div>
      <div className="mt-8 flex items-end gap-1" role="img" aria-label={`${kind} : classe ${value ?? "non renseignée"}, sur une échelle de A à G`}>
        {LETTERS.map((letter, i) => {
          const active = letter === value
          return (
            <div
              key={letter}
              className={cn(
                "grid flex-1 place-items-center font-semibold transition-all duration-500",
                scale.colors[i],
                scale.darkText.includes(letter) ? "text-neutral-900" : "text-white",
                active ? "h-14 rounded-xl text-xl shadow-lg ring-4 ring-surface" : "h-8 text-[13px] opacity-80",
                !active && i === 0 && "rounded-l-lg",
                !active && i === LETTERS.length - 1 && "rounded-r-lg",
                value && !active && "opacity-40",
              )}
            >
              {letter}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex justify-between text-[12px] text-muted">
        <span>{scale.best}</span>
        <span>{scale.worst}</span>
      </div>
    </div>
  )
}

export default EnergyScale
