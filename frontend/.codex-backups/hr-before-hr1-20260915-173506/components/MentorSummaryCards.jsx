import { useMemo } from 'react'
import { Star, Users2, CalendarCheck, BookOpen, CalendarDays, Video, TrendingUp } from 'lucide-react'
import { HRProgressBar, HRDelta } from '@features/hr/components/hrPrimitives'

/**
 * MentorSummaryCards — compact analytics strip (Section 2 of the Mentors page).
 * Computes 8 live insights from the current employee rows and renders each as
 * an icon + value + mini progress bar + trend chip, reusing HR primitives.
 */
export default function MentorSummaryCards({ employees = [] }) {
  const cards = useMemo(() => {
    if (!employees.length) return []
    const byKey = (fn) => employees.reduce((best, e) => (fn(e) > fn(best) ? e : best))

    const topRated = byKey((e) => e.rating)
    const mostStudents = byKey((e) => e.studentsAssigned || 0)
    const highestAttendance = byKey((e) => e.attendancePercentage || 0)
    const mostCourses = byKey((e) => e.assignedCourses?.length || 0)
    const upcoming = employees.reduce((sum, e) => sum + (e.upcomingSessions || 0), 0)
    const avgCompletion = Math.round(employees.reduce((sum, e) => sum + (e.courseCompletion || 0), 0) / employees.length)
    const avgRating = employees.reduce((sum, e) => sum + e.rating, 0) / employees.length

    return [
      {
        key: 'top', label: 'Top Rated Mentor', value: topRated.name, sub: `${topRated.rating.toFixed(1)} / 5 rating`,
        icon: Star, color: '#F59E0B', progress: Math.round((topRated.rating / 5) * 100), delta: 0.2,
      },
      {
        key: 'students', label: 'Most Students', value: mostStudents.studentsAssigned, sub: mostStudents.name,
        icon: Users2, color: '#0f55f7', progress: Math.min(100, mostStudents.studentsAssigned), delta: 8,
      },
      {
        key: 'attendance', label: 'Highest Attendance', value: `${highestAttendance.attendancePercentage}%`, sub: highestAttendance.name,
        icon: CalendarCheck, color: '#06b6a8', progress: highestAttendance.attendancePercentage, delta: 2,
      },
      {
        key: 'courses', label: 'Most Courses', value: mostCourses.assignedCourses?.length ?? 0, sub: mostCourses.name,
        icon: BookOpen, color: '#8b5cf6', progress: Math.round(((mostCourses.assignedCourses?.length ?? 0) / 5) * 100), delta: 1,
      },
      {
        key: 'batch', label: 'Most Active Batch', value: mostStudents.currentBatch || '—', sub: `${mostStudents.studentsAssigned} students`,
        icon: CalendarDays, color: '#EC4899', progress: 88, delta: 5,
      },
      {
        key: 'sessions', label: 'Upcoming Sessions', value: upcoming, sub: 'next 30 days',
        icon: Video, color: '#10b981', progress: Math.min(100, Math.round((upcoming / 10) * 100)), delta: 3,
      },
      {
        key: 'completion', label: 'Average Completion', value: `${avgCompletion}%`, sub: 'course completion',
        icon: TrendingUp, color: '#EF4444', progress: avgCompletion, delta: 4,
      },
      {
        key: 'rating', label: 'Average Rating', value: avgRating.toFixed(2), sub: 'across all mentors',
        icon: Star, color: '#6366f1', progress: Math.round((avgRating / 5) * 100), delta: 0.1,
      },
    ]
  }, [employees])

  if (!cards.length) return null

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${card.color}14`, color: card.color }}
            >
              <card.icon className="h-4 w-4" />
            </span>
            <HRDelta value={card.delta} />
          </div>
          <p className="mt-2 truncate text-lg font-bold leading-none text-slate-900 dark:text-white">{card.value}</p>
          <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-400">{card.label}</p>
          {card.sub && <p className="truncate text-[10px] text-slate-400">{card.sub}</p>}
          <div className="mt-2">
            <HRProgressBar value={card.progress} color={card.color} height="h-1" />
          </div>
        </div>
      ))}
    </div>
  )
}
