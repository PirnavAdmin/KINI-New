import { Armchair, BookOpen, ClipboardList, Users, UsersRound, Video } from 'lucide-react'
import KPI from '@/components/common/KPI'

/* Six batch-workspace KPIs, rendered with the global KPI card. Each card
   opens its workspace tab when onSelect is provided. Pure presentation. */
export default function BatchMetrics({ batch, assessmentsCount = 0, onSelect }) {
  const cards = [
    ['Course', batch.courseName || '—', BookOpen, 'green', 'overview'],
    ['Students', batch.enrolledStudents ?? 0, Users, 'blue', 'students'],
    ['Capacity', batch.capacity ?? 0, UsersRound, 'orange', 'students'],
    ['Available Seats', batch.availableSeats ?? 0, Armchair, 'purple', 'students'],
    ['Live Classes', batch.liveClasses ?? 0, Video, 'cyan', 'live-classes'],
    ['Assessments', assessmentsCount, ClipboardList, 'red', 'assessments'],
  ]
  return (
    <div className="mv17-bm grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {cards.map(([label, value, icon, accent, tab]) => (
        <KPI key={label} label={label} value={value} icon={icon} accent={accent} onClick={onSelect ? () => onSelect(tab) : undefined} />
      ))}
    </div>
  )
}
