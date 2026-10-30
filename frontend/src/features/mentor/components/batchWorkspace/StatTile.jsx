import KPI from '@/components/common/KPI'

// Batch-workspace stat tile, rendered with the global KPI card.
const ACCENTS = { purple: 'purple', emerald: 'green', amber: 'orange', rose: 'red', blue: 'blue' }

export default function StatTile({ label, value, icon, color = 'purple' }) {
  return <KPI label={label} value={value} icon={icon} accent={ACCENTS[color] ?? 'purple'} />
}
