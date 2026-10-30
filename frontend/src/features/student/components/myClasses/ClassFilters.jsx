import { Search, RotateCcw, CalendarRange } from 'lucide-react'

const fieldBase = 'h-9 rounded-xl border border-slate-200/80 bg-white px-3 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0f55f7]/40 focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100'

export default function ClassFilters({
  filters,
  courses = [],
  mentors = [],
  onChange,
  onReset,
}) {
  const update = (key, value) => onChange?.({ ...filters, [key]: value })

  return (
    <div className="rounded-[20px] border border-white/70 bg-white/85 p-3 shadow-[0_6px_14px_rgba(15,23,42,0.035)] ring-1 ring-slate-900/[0.03] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/75">
      <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-[2.25fr_repeat(4,minmax(0,1fr))_auto]">
        <label className="relative block min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => update('search', event.target.value)}
            placeholder="Search by class title..."
            className={`${fieldBase} w-full pl-10`}
          />
        </label>

        <select
          value={filters.course}
          onChange={(event) => update('course', event.target.value)}
          className={`${fieldBase} w-full`}
          aria-label="Filter by course"
        >
          <option value="all">All Courses</option>
          {courses.map((course) => (
            <option
              key={typeof course === 'string' ? course : course.value}
              value={typeof course === 'string' ? course : course.value}
            >
              {typeof course === 'string' ? course : course.label}
            </option>
          ))}
        </select>

        <select
          value={filters.mentor}
          onChange={(event) => update('mentor', event.target.value)}
          className={`${fieldBase} w-full`}
          aria-label="Filter by mentor"
        >
          <option value="all">All Mentors</option>
          {mentors.map((mentor) => (
            <option
              key={typeof mentor === 'string' ? mentor : mentor.value}
              value={typeof mentor === 'string' ? mentor : mentor.value}
            >
              {typeof mentor === 'string' ? mentor : mentor.label}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(event) => update('status', event.target.value)}
          className={`${fieldBase} w-full`}
          aria-label="Filter by status"
        >
          <option value="all">Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
          <option value="missed">Missed</option>
        </select>

        <label className="relative block min-w-0">
          <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={filters.date}
            onChange={(event) => update('date', event.target.value)}
            className={`${fieldBase} w-full pl-10`}
            aria-label="Filter by date"
          />
        </label>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-xs font-semibold text-slate-600 transition-all hover:border-[#0f55f7]/25 hover:bg-[#0f55f7]/5 hover:text-[#0f55f7] dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </div>
  )
}
