import { useMemo } from 'react'
import { Star, Users2, CalendarCheck, BookOpen, CalendarDays, Video, TrendingUp } from 'lucide-react'
import KPI from '@/components/common/KPI'

/**
 * MentorSummaryCards — compact analytics strip (Section 2 of the Mentors page).
 * Computes 8 live insights from the current employee rows and renders each as
 * a global KPI card (icon, value, description, trend chip).
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
        icon: Star, accent: 'orange', progress: Math.round((topRated.rating / 5) * 100), delta: 0.2,
      },
      {
        key: 'students', label: 'Most Students', value: mostStudents.studentsAssigned, sub: mostStudents.name,
        icon: Users2, accent: 'blue', progress: Math.min(100, mostStudents.studentsAssigned), delta: 8,
      },
      {
        key: 'attendance', label: 'Highest Attendance', value: `${highestAttendance.attendancePercentage}%`, sub: highestAttendance.name,
        icon: CalendarCheck, accent: 'teal', progress: highestAttendance.attendancePercentage, delta: 2,
      },
      {
        key: 'courses', label: 'Most Courses', value: mostCourses.assignedCourses?.length ?? 0, sub: mostCourses.name,
        icon: BookOpen, accent: 'purple', progress: Math.round(((mostCourses.assignedCourses?.length ?? 0) / 5) * 100), delta: 1,
      },
      {
        key: 'batch', label: 'Most Active Batch', value: mostStudents.currentBatch || '—', sub: `${mostStudents.studentsAssigned} students`,
        icon: CalendarDays, accent: 'red', progress: 88, delta: 5,
      },
      {
        key: 'sessions', label: 'Upcoming Sessions', value: upcoming, sub: 'next 30 days',
        icon: Video, accent: 'green', progress: Math.min(100, Math.round((upcoming / 10) * 100)), delta: 3,
      },
      {
        key: 'completion', label: 'Average Completion', value: `${avgCompletion}%`, sub: 'course completion',
        icon: TrendingUp, accent: 'red', progress: avgCompletion, delta: 4,
      },
      {
        key: 'rating', label: 'Average Rating', value: avgRating.toFixed(2), sub: 'across all mentors',
        icon: Star, accent: 'navy', progress: Math.round((avgRating / 5) * 100), delta: 0.1,
      },
    ]
  }, [employees])

  if (!cards.length) return null

  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
      {cards.map((card) => (
        <KPI
          key={card.key}
          label={card.label}
          value={card.value}
          description={card.sub}
          icon={card.icon}
          accent={card.accent}
          trend={card.delta ? `${card.delta}%` : undefined}
          trendType={card.delta > 0 ? 'positive' : card.delta < 0 ? 'negative' : 'neutral'}
        />
      ))}
    </div>
  )
}
