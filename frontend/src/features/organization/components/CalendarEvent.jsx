// ================================================================
// CalendarEvent — A single event badge inside a calendar day cell
// TODO: Replace with API integration
// ================================================================

import { useNavigate } from 'react-router-dom'
import { getWebinarStatusStyle } from '../data/webinarMockData'

const STATUS_COLORS = {
  Upcoming: 'border-l-blue-500 bg-blue-50 dark:bg-blue-500/10',
  'Live Now': 'border-l-green-500 bg-green-50 dark:bg-green-500/10',
  Completed: 'border-l-slate-400 bg-slate-50 dark:bg-slate-500/10',
  Cancelled: 'border-l-red-500 bg-red-50 dark:bg-red-500/10',
  Draft: 'border-l-amber-500 bg-amber-50 dark:bg-amber-500/10',
}

export default function CalendarEvent({ event, compact }) {
  const navigate = useNavigate()
  const style = getWebinarStatusStyle(event.status)
  const colorClass = STATUS_COLORS[event.status] || STATUS_COLORS.Upcoming

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/organization/webinars/${event.id}`)
        }}
        className={`w-full truncate rounded px-1 py-0.5 text-[9px] font-semibold text-left transition-all hover:opacity-80 ${colorClass}`}
        title={event.title}
      >
        {event.startTime} {event.title}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => navigate(`/organization/webinars/${event.id}`)}
      className={`group flex items-center gap-2 rounded-lg border-l-4 p-2 text-left transition-all hover:shadow-md ${colorClass}`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
          {event.title}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          {event.startTime} &middot; {event.duration}
        </p>
      </div>
      <span className={`inline-flex h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
    </button>
  )
}
