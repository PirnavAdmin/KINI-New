import KPI from '@/components/common/KPI'

// Assessment summary card, rendered with the global KPI card. Legacy hex
// colours map onto the shared accent palette; `delay` is accepted for compatibility.
const ACCENTS = {
  '#2563eb': 'blue',
  '#0f55f7': 'blue',
  '#06b6a8': 'teal',
  '#ef4444': 'red',
  '#ec4899': 'red',
  '#f59e0b': 'orange',
  '#94a3b8': 'navy',
  '#8b5cf6': 'purple',
  '#10b981': 'green',
}

// eslint-disable-next-line no-unused-vars
export default function SummaryCard({ icon, label, value, sublabel, color = '#2563EB', delay = 0 }) {
  return (
    <KPI
      label={label}
      value={value}
      description={sublabel}
      icon={icon}
      accent={ACCENTS[String(color).toLowerCase()] ?? color}
    />
  )
}
