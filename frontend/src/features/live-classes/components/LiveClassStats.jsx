import { CalendarClock, CheckCircle2, CircleSlash, Clock3, PlayCircle, ShieldCheck, TimerReset, Video } from 'lucide-react'
import { MetricCard } from './LiveClassPrimitives'
import { formatMinutes } from '../utils/dateUtils'

const PRIMARY_METRICS = [
  ['totalClasses', 'Total Classes', 'All scheduled sessions', Video, 'primary'],
  ['todayClasses', "Today's Classes", 'Sessions happening today', CalendarClock, 'secondary'],
  ['upcoming', 'Upcoming', 'Scheduled ahead', TimerReset, 'warning'],
  ['liveNow', 'Live Now', 'Running right now', PlayCircle, 'danger'],
]

const ANALYTICS_METRICS = [
  ['completed', 'Completed', CheckCircle2, 'success', (dashboard) => dashboard.completed, 0],
  ['cancelled', 'Cancelled', CircleSlash, 'warning', (dashboard) => dashboard.cancelled, 0],
  ['attendanceRate', 'Attendance %', ShieldCheck, 'primary', (dashboard) => `${dashboard.attendanceRate ?? 0}%`, '0%'],
  ['averageDuration', 'Avg. Duration', Clock3, 'neutral', (dashboard) => formatMinutes(dashboard.averageDuration ?? 0), formatMinutes(0)],
]

export function LiveClassPrimaryStats({ dashboard, loading }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {loading
        ? PRIMARY_METRICS.map(([key, label, , Icon, tone]) => <MetricCard key={key} loading icon={Icon} label={label} tone={tone} />)
        : PRIMARY_METRICS.map(([key, label, hint, Icon, tone]) => (
            <MetricCard key={key} icon={Icon} label={label} value={dashboard?.[key] ?? 0} hint={hint} tone={tone} />
          ))}
    </div>
  )
}

export function LiveClassAnalyticsStats({ dashboard, loading }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
      {loading
        ? ANALYTICS_METRICS.map(([key, label, Icon, tone]) => <MetricCard key={key} loading icon={Icon} label={label} tone={tone} />)
        : ANALYTICS_METRICS.map(([key, label, Icon, tone, getValue, fallbackValue]) => (
            <MetricCard key={key} compact icon={Icon} label={label} value={dashboard ? getValue(dashboard) : fallbackValue} tone={tone} />
          ))}
    </div>
  )
}
