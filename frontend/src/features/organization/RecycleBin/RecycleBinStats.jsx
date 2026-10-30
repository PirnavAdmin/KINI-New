import { Building2, GraduationCap, Users, UserCircle2 } from 'lucide-react'
import KPI from '@/components/common/KPI'

const ICONS = {
  students: GraduationCap,
  mentors: Users,
  employees: Building2,
  users: UserCircle2,
}
const ACCENTS = { students: 'blue', mentors: 'purple', employees: 'teal', users: 'orange' }

// Deleted-record counts, rendered with the global KPI card.
export default function RecycleBinStats({ stats = [] }) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <KPI
          key={stat.key}
          label={stat.label}
          value={stat.value ?? '-'}
          description="Deleted"
          icon={ICONS[stat.key] || Users}
          accent={ACCENTS[stat.key] ?? 'blue'}
          loading={stat.loading || !stat.loaded}
        />
      ))}
    </div>
  )
}
