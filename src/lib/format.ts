const eurosFormat = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

export const euros = (n: number) => eurosFormat.format(Math.round(n || 0))

export const number = (n: number, digits = 0) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(n || 0)

export const percent = (ratio: number, digits = 1) =>
  new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(ratio || 0)

// 12 900 → « 13 k€ », pour les graduations des graphiques
export const compactEuros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(n) + " €"

export const plural = (count: number, word: string, pluralWord = `${word}s`) =>
  `${number(count, 2)} ${count > 1 ? pluralWord : word}`

// Assemble des classes CSS en ignorant les valeurs vides
export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ")

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
