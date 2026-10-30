export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'halfYearly', label: 'Half-Yearly' },
  { value: 'annual', label: 'Annual' },
]

export const CYCLE_LABELS = {
  monthly: '/month',
  quarterly: '/quarter',
  halfYearly: '/6 mo',
  annual: '/year',
}

const CYCLE_PRICE_KEYS = {
  monthly: 'monthlyPrice',
  quarterly: 'quarterlyPrice',
  halfYearly: 'halfYearlyPrice',
  annual: 'annualPrice',
}

const CYCLE_MONTHLY_MULTIPLIERS = {
  monthly: 1,
  quarterly: 3,
  halfYearly: 6,
  annual: 12,
}

export const cyclePrice = (plan, cycle) => {
  const explicit = plan?.[CYCLE_PRICE_KEYS[cycle]]
  if (explicit !== undefined && explicit !== null && explicit !== '') {
    const parsed = Number(explicit)
    if (Number.isFinite(parsed)) return parsed
  }
  const monthly = Number(plan?.monthlyPrice)
  return Number.isFinite(monthly) ? monthly * CYCLE_MONTHLY_MULTIPLIERS[cycle] : 0
}
