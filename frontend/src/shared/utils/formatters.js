const isFiniteNumber = (value) => Number.isFinite(Number(value))

export const coalesceNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const formatNumber = (value, fallback = '0', locale = 'en-US') => {
  const numericValue = coalesceNumber(value, Number.NaN)
  if (!Number.isFinite(numericValue)) return fallback
  return numericValue.toLocaleString(locale)
}

export const formatCurrency = (value, currency = 'INR', locale = 'en-IN') => {
  const numericValue = coalesceNumber(value, Number.NaN)
  if (!Number.isFinite(numericValue)) return `${currency === 'INR' ? '₹' : ''}0`

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(numericValue)
  } catch {
    const prefix = currency === 'INR' ? '₹' : `${currency} `
    return `${prefix}${numericValue.toLocaleString(locale)}`
  }
}

export const formatPercent = (value, fallback = '0%') => {
  const numericValue = coalesceNumber(value, Number.NaN)
  if (!Number.isFinite(numericValue)) return fallback
  return `${numericValue.toLocaleString('en-US')}%`
}

export const isNumericValue = isFiniteNumber
