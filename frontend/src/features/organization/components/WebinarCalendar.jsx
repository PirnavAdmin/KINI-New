// ================================================================
// WebinarCalendar — Full monthly calendar grid with event badges
// TODO: Replace with API integration when backend is ready
// ================================================================

import { useMemo } from 'react'
import CalendarDay from './CalendarDay'
import CalendarToolbar from './CalendarToolbar'
import { getWebinarsByMonth } from '../utils/webinarHelpers'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function WebinarCalendar({ currentYear, currentMonth, onPrev, onNext, onToday, onDayClick }) {
  const eventsByDate = useMemo(() => {
    const events = getWebinarsByMonth(currentYear, currentMonth + 1)
    const map = {}
    events.forEach((ev) => {
      if (ev.date) {
        if (!map[ev.date]) map[ev.date] = []
        map[ev.date].push(ev)
      }
    })
    return map
  }, [currentYear, currentMonth])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startOffset = firstDay.getDay() // 0 = Sun
    const totalDays = lastDay.getDate()

    // Pad blank days from previous month
    const days = []
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null, isCurrentMonth: false })
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push({ day: d, isCurrentMonth: true })
    }
    // Pad remaining to fill last row
    while (days.length % 7 !== 0) {
      days.push({ day: null, isCurrentMonth: false })
    }
    return days
  }, [currentYear, currentMonth])

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-4">
      <CalendarToolbar
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />

      {/* Day headers */}
      <div className="grid grid-cols-7 rounded-t-xl border border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="inline sm:hidden">{label.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 overflow-hidden">
        {calendarDays.map((cell, index) => {
          if (!cell.day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[100px] border-b border-r border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30 sm:min-h-[120px]"
              />
            )
          }

          const dateObj = new Date(currentYear, currentMonth, cell.day)
          const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`
          const isToday = dateKey === todayStr
          const events = eventsByDate[dateKey] || []

          return (
            <CalendarDay
              key={dateKey}
              date={dateObj}
              day={cell.day}
              isToday={isToday}
              isCurrentMonth={cell.isCurrentMonth}
              events={events}
              onDayClick={onDayClick}
            />
          )
        })}
      </div>
    </div>
  )
}
