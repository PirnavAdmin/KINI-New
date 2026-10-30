import { BookOpen, CalendarDays, Plane, Users } from 'lucide-react'
import { HrKpis } from './portal/HrPortalKit'

export default function HrCalendarSummary({ value, loading }) {
  const values = value ?? {}
  return <HrKpis columns={5} items={[
    ['Events This Month', 'eventsThisMonth', CalendarDays, 'purple'],
    ['Classes Scheduled', 'classesScheduled', BookOpen, 'green'],
    ['Meetings', 'meetings', Users, 'blue'],
    ['Holidays', 'holidays', Plane, 'blue'],
    ['Leave Events', 'leaveEvents', Plane, 'blue'],
  ].map(([label, key, icon, tone]) => ({ label, key, icon, tone,
    value: loading ? '...' : values[key] ?? '—',
    sub: !loading && values[key] == null ? 'Unavailable' : undefined,
  }))} />
}
