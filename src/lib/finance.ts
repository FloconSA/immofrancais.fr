/* Calculs des simulateurs. Ce sont des estimations indicatives, pas des offres.
   Les montants présentés comme les parts d'un total sont arrondis à l'euro avant d'être additionnés :
   les chiffres affichés retombent toujours exactement sur le total affiché. */

/* ------------------------------------------------------------------ */
/* Prêt immobilier                                                     */
/* ------------------------------------------------------------------ */

export type LoanInput = {
  amount: number // montant emprunté (€)
  years: number // durée (années)
  rate: number // taux nominal annuel (%)
  insurance: number // assurance emprunteur (% du capital par an)
}

export type LoanYear = { year: number; principal: number; interest: number; insurance: number; remaining: number }

export const monthlyPayment = (amount: number, years: number, rate: number) => {
  const months = Math.round(years * 12)
  if (months <= 0 || amount <= 0) return 0
  const r = rate / 100 / 12
  return r === 0 ? amount / months : (amount * r) / (1 - Math.pow(1 + r, -months))
}

export const computeLoan = ({ amount, years, rate, insurance }: LoanInput) => {
  const months = Math.round(years * 12)
  const payment = monthlyPayment(amount, years, rate)
  const insuranceMonthly = amount > 0 ? (amount * insurance) / 100 / 12 : 0
  const r = rate / 100 / 12

  // Tableau d'amortissement, regroupé par année. Chaque colonne est arrondie sur son cumul plutôt que
  // ligne par ligne : les lignes additionnées donnent exactement le montant emprunté et les coûts affichés.
  const schedule: LoanYear[] = []
  const start = Math.round(amount)
  let remaining = amount
  let paidPrincipal = 0
  let paidInterest = 0
  let shown = { principal: 0, interest: 0, insurance: 0 }
  for (let month = 0; month < months; month += 12) {
    const end = Math.min(month + 12, months)
    for (let m = month; m < end; m++) {
      const interest = remaining * r
      const principal = payment - interest
      paidPrincipal += principal
      paidInterest += interest
      remaining -= principal
    }
    const cumulated = {
      principal: Math.min(start, Math.round(paidPrincipal)),
      interest: Math.max(0, Math.round(paidInterest)),
      insurance: Math.round(insuranceMonthly * end),
    }
    schedule.push({
      year: month / 12 + 1,
      principal: cumulated.principal - shown.principal,
      interest: cumulated.interest - shown.interest,
      insurance: cumulated.insurance - shown.insurance,
      remaining: start - cumulated.principal,
    })
    shown = cumulated
  }

  return {
    months,
    payment, // hors assurance
    insuranceMonthly,
    monthly: payment + insuranceMonthly, // assurance comprise
    interest: shown.interest,
    insuranceTotal: shown.insurance,
    cost: shown.interest + shown.insurance, // coût du crédit, hors frais de dossier et de garantie
    schedule,
  }
}

// Règle du Haut Conseil de stabilité financière : mensualités ≤ 35 % des revenus nets
export const MAX_DEBT_RATIO = 0.35

/* ------------------------------------------------------------------ */
/* Frais de notaire                                                    */
/* ------------------------------------------------------------------ */

export type PropertyKind = "ancien" | "neuf"

export type NotaryInput = { price: number; kind: PropertyKind; firstTime: boolean }

// Émoluments proportionnels du notaire (barème réglementé, hors taxes)
const BRACKETS: [limit: number, rate: number][] = [
  [6_500, 3.87],
  [17_000, 1.596],
  [60_000, 1.064],
  [Infinity, 0.799],
]

export const notaryEmoluments = (price: number) => {
  let total = 0
  let floor = 0
  for (const [limit, rate] of BRACKETS) {
    if (price <= floor) break
    total += ((Math.min(price, limit) - floor) * rate) / 100
    floor = limit
  }
  return total
}

// Débours et frais de formalités : forfait moyen constaté
export const FORMALITIES = 1_200

export const computeNotary = ({ price, kind, firstTime }: NotaryInput) => {
  // Ancien : taxe départementale 5 % (4,5 % pour un premier achat de résidence principale)
  //          + taxe communale 1,2 % + frais d'assiette 2,37 % de la taxe départementale
  // Neuf :   taxe de publicité foncière 0,7 % + frais d'assiette 2,14 %
  const departmental = kind === "neuf" ? 0.7 : firstTime ? 4.5 : 5
  const communal = kind === "neuf" ? 0 : 1.2
  const collection = kind === "neuf" ? 2.14 : 2.37
  const dutiesRate = departmental + communal + (departmental * collection) / 100

  // Chaque part est arrondie à l'euro, comme sur un décompte de notaire, puis additionnée
  const duties = Math.round((price * dutiesRate) / 100)
  const emoluments = Math.round(notaryEmoluments(price) * 1.2) // TVA 20 %
  const securityContribution = price > 0 ? Math.round(Math.max(15, price * 0.001)) : 0 // 0,1 %, minimum 15 €
  const formalities = price > 0 ? FORMALITIES : 0
  const total = duties + emoluments + securityContribution + formalities

  return {
    dutiesRate,
    duties,
    emoluments,
    securityContribution,
    formalities,
    total,
    ratio: price > 0 ? total / price : 0,
  }
}

/* ------------------------------------------------------------------ */
/* Budget total                                                        */
/* ------------------------------------------------------------------ */

export type BudgetInput = NotaryInput & {
  downPayment: number // apport
  works: number // travaux
  bankFees: number // frais de dossier
  years: number
  rate: number
  insurance: number
}

// Caution (type Crédit Logement) : 1 % du montant emprunté, estimation moyenne
export const GUARANTEE_RATE = 0.01

export const computeBudget = (input: BudgetInput) => {
  const notary = computeNotary(input)
  // Ce que l'apport ne couvre pas. S'il couvre tout, il n'y a pas de prêt, donc ni frais de dossier ni garantie.
  const uncovered = input.price + notary.total + input.works - input.downPayment
  const bankFees = uncovered > 0 ? input.bankFees : 0
  // La garantie est elle-même empruntée : prêt = (reste à financer + frais de dossier) ÷ 0,99,
  // pour qu'elle fasse bien 1 % du prêt final
  const guarantee = uncovered > 0 ? Math.round(((uncovered + bankFees) * GUARANTEE_RATE) / (1 - GUARANTEE_RATE)) : 0
  const total = input.price + notary.total + input.works + bankFees + guarantee
  const loanAmount = Math.max(0, total - input.downPayment)
  const loan = computeLoan({ amount: loanAmount, years: input.years, rate: input.rate, insurance: input.insurance })
  return {
    notary,
    bankFees,
    guarantee,
    total,
    loanAmount,
    loan,
    // Revenus nets mensuels conseillés pour rester sous 35 % d'endettement
    incomeNeeded: loan.monthly / MAX_DEBT_RATIO,
  }
}

// Valeurs de départ des simulateurs (taux : moyenne sur 20 ans de l'Observatoire Crédit Logement/CSA,
// 3,39 % en septembre 2026)
export const DEFAULTS = {
  price: 250_000,
  years: 20,
  rate: 3.4,
  insurance: 0.3,
  bankFees: 1_000,
}

export const defaultDownPayment = (price: number) => Math.round((price * 0.1) / 1000) * 1000
