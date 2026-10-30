// ================================================================
// CalendarDay — A single day cell in the webinar calendar grid
// Shows date number and associated event badges
// TODO: Replace with API integration
// ================================================================

import CalendarEvent from './CalendarEvent'

export default function CalendarDay({ date, day, isToday, isCurrentMonth, events, onDayClick }) {
  const dayOfWeek = new Date(date.getFullYear(), date.getMonth(), day).getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  if (!isCurrentMonth) {
    return (
      <div className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50 p-1.5 dark:border-slate-800 dark:bg-slate-900/30 sm:min-h-[120px]" />
    )
  }

  return (
    <div
      onClick={() => onDayClick?.(date)}
      className={`group relative min-h-[100px] cursor-pointer border-b border-r border-slate-100 p-1.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40 sm:min-h-[120px] ${
        isToday ? 'bg-[#0f55f7]/5 dark:bg-[#0f55f7]/10' : 'bg-white dark:bg-slate-900'
      }`}
    >
      {/* Day number */}
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            isToday
              ? 'bg-[#0f55f7] text-white'
              : isWeekend
                ? 'text-slate-400'
                : 'text-slate-700 dark:text-slate-300'
          }`}
        >
          {day}
        </span>
        {events.length > 3 && (
          <span className="text-[9px] font-semibold text-[#0f55f7]">
            +{events.length - 3}
          </span>
        )}
      </div>

      {/* Event badges */}
      <div className="space-y-0.5">
        {events.slice(0, 3).map((event) => (
          <CalendarEvent key={event.id} event={event} compact />
        ))}
      </div>

      {/* Today indicator dot for mobile */}
      {isToday && events.length === 0 && (
        <div className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#0f55f7]" />
      )}
    </div>
  )
}
