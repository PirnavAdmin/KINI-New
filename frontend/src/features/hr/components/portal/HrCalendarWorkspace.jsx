import { useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import {
  AlertTriangle, BookOpen, CalendarDays, ChevronLeft, ChevronRight, Clock3, Download, ExternalLink, MapPin, PanelLeft,
  Pencil, Plane, Plus, RefreshCw, Search, Star, Trash2, UserRound, Users, Video, X,
} from 'lucide-react'
import { displayText } from '@features/hr/services/hrDashboardData'
import { hrField } from '@features/hr/services/hrApi'
import {
  addDays, agendaDays, atMinutes, dayKey, isAllDayLane, layoutDay, monthOf, onDay, rangeLabel, sameDay, shiftAnchor,
  snapMinutes, startOfDay, viewDays, VIEWS,
} from '@features/hr/services/hrCalendarView'
import './hr-calendar-workspace.css'

/* ──────────────────────────────────────────────────────────────────────
   HR Calendar workspace: a compact toolbar, a collapsible sidebar (mini
   calendar, calendar toggles, upcoming), and Day / Week / Month / Agenda
   views. Events are the normalized rows HrApiModule loads from the HR
   calendar APIs; creating, editing and deleting go back through
   HrApiModule's existing forms and requests. Generated sources (classes,
   holidays, leaves) are read-only here, as they are in the API.
   ────────────────────────────────────────────────────────────────────── */

const CALENDARS = [
  { key: 'meetings', label: 'Meetings', icon: Users, tone: 'blue' },
  { key: 'classes', label: 'Classes', icon: BookOpen, tone: 'purple' },
  { key: 'holidays', label: 'Holidays', icon: CalendarDays, tone: 'red' },
  { key: 'leaves', label: 'Leave Events', icon: Plane, tone: 'orange' },
  { key: 'performance', label: 'Performance Reviews', icon: Star, tone: 'green' },
  { key: 'unknown', label: 'Other Events', icon: CalendarDays, tone: 'navy' },
]
const calendarOf = (event) => CALENDARS.find((item) => item.key === event.type) ?? CALENDARS[CALENDARS.length - 1]
const VIEW_LABELS = { day: 'Day', week: 'Week', month: 'Month', agenda: 'Agenda' }
const HOUR_PX = 44
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const time = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const hourLabel = (hour) => (hour === 0 ? '' : new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric' }))
const titleOf = (event) => displayText(event.title) || 'Untitled event'
const timeRange = (event) => {
  if (event.allDay) {
    const last = startOfDay(event.end)
    return sameDay(event.start, last) ? 'All day' : `All day · until ${last.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
  }
  return sameDay(event.start, event.end) || event.end.getTime() === event.start.getTime()
    ? `${time(event.start)} – ${time(event.end)}`
    : `${event.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${time(event.start)} – ${event.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${time(event.end)}`
}
const timezone = (() => {
  try { return new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value ?? '' } catch { return '' }
})()
const editableEvent = (event) => event.source === 'events' && event.id != null

/** A small month grid for jumping to a date; dots mark days with events. */
function MiniCalendar({ anchor, today, eventDays, onPick }) {
  const [shown, setMonth] = useState(() => monthOf(anchor))
  // Follow the selected date when it moves to another month (adjusted during render).
  const [anchorMonth, setAnchorMonth] = useState(() => dayKey(monthOf(anchor)))
  if (anchorMonth !== dayKey(monthOf(anchor))) {
    setAnchorMonth(dayKey(monthOf(anchor)))
    setMonth(monthOf(anchor))
  }
  const days = viewDays('month', shown)
  return (
    <section className="hcw-mini" aria-label="Mini calendar">
      <header>
        <b>{shown.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b>
        <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(shown.getFullYear(), shown.getMonth() - 1, 1))}><ChevronLeft aria-hidden="true" /></button>
        <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(shown.getFullYear(), shown.getMonth() + 1, 1))}><ChevronRight aria-hidden="true" /></button>
      </header>
      <div className="hcw-mini__grid" role="grid">
        {WEEKDAYS.map((day) => <span key={day} className="hcw-mini__head" aria-hidden="true">{day[0]}</span>)}
        {days.map((day) => (
          <button
            key={dayKey(day)}
            type="button"
            className={`${day.getMonth() === shown.getMonth() ? '' : 'is-out'}${sameDay(day, today) ? ' is-today' : ''}${sameDay(day, anchor) ? ' is-selected' : ''}`}
            aria-label={day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            aria-current={sameDay(day, anchor) ? 'date' : undefined}
            onClick={() => onPick(day)}
          >
            {day.getDate()}
            {eventDays.has(dayKey(day)) && <i aria-hidden="true" />}
          </button>
        ))}
      </div>
    </section>
  )
}

/** One event chip, used in the all-day lane, the month grid and lists. */
function EventChip({ event, onOpen, compact = false }) {
  const calendar = calendarOf(event)
  return (
    <button type="button" className={`hcw-chip is-${calendar.tone}${compact ? ' is-compact' : ''}`} onClick={(click) => { click.stopPropagation(); onOpen(event) }} title={`${titleOf(event)} · ${timeRange(event)}`}>
      {!event.allDay && !isAllDayLane(event) && <span className="hcw-chip__time">{time(event.start)}</span>}
      <span className="hcw-chip__title">{titleOf(event)}</span>
    </button>
  )
}

/** Day and Week: the all-day lane and the hourly grid with click/drag-to-create. */
function TimeGrid({ days, events, today, canAdd, onCreate, onOpen, onPickDay }) {
  const scroller = useRef(null)
  const [drag, setDrag] = useState(null)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60000); return () => window.clearInterval(timer) }, [])
  // Open at 7 AM, or an hour before the first timed event of the visible days.
  const firstHour = useMemo(() => {
    const starts = days.flatMap((day) => layoutDay(events, day).map((item) => item.top))
    return Math.max(0, Math.min(7 * 60, starts.length ? Math.min(...starts) - 60 : 7 * 60))
  }, [days, events])
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = (firstHour / 60) * HOUR_PX }, [firstHour])
  const allDay = days.map((day) => events.filter((event) => isAllDayLane(event) && onDay(event, day)))
  const minutesAt = (clientY, column) => {
    const rect = column.getBoundingClientRect()
    return ((clientY - rect.top) / HOUR_PX) * 60
  }
  const begin = (day) => (pointer) => {
    if (!canAdd || pointer.button !== 0 || pointer.target.closest('.hcw-event')) return
    const minutes = snapMinutes(minutesAt(pointer.clientY, pointer.currentTarget) - 7.5)
    pointer.currentTarget.setPointerCapture?.(pointer.pointerId)
    setDrag({ day, from: minutes, to: minutes + 15, moved: false })
  }
  const move = (pointer) => {
    if (!drag) return
    const minutes = snapMinutes(minutesAt(pointer.clientY, pointer.currentTarget))
    setDrag((current) => (current ? { ...current, to: Math.max(minutes, current.from + 15), moved: current.moved || Math.abs(minutes - current.from) >= 15 } : current))
  }
  const finish = () => {
    if (!drag) return
    // A plain click books an hour; a drag books exactly the selected range.
    const end = drag.moved ? drag.to : Math.min(1440, drag.from + 60)
    onCreate({ start: atMinutes(drag.day, drag.from), end: atMinutes(drag.day, end), allDay: false })
    setDrag(null)
  }
  const keyCreate = (day) => (key) => {
    if (!canAdd || (key.key !== 'Enter' && key.key !== ' ') || key.target !== key.currentTarget) return
    key.preventDefault()
    const start = sameDay(day, now) ? Math.ceil((now.getHours() * 60 + now.getMinutes()) / 60) * 60 : 9 * 60
    onCreate({ start: atMinutes(day, Math.min(start, 23 * 60)), end: atMinutes(day, Math.min(start + 60, 1440)), allDay: false })
  }
  return (
    <div className={`hcw-time${days.length === 1 ? ' is-day' : ''}`}>
      <div className="hcw-time__head" style={{ '--hcw-days': days.length }}>
        <span className="hcw-time__tz">{timezone}</span>
        {days.map((day) => (
          <button key={dayKey(day)} type="button" className={`hcw-dayhead${sameDay(day, today) ? ' is-today' : ''}`} onClick={() => onPickDay(day)} aria-label={`Open ${day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} in day view`}>
            <small>{WEEKDAYS[day.getDay()]}</small><b>{day.getDate()}</b>
          </button>
        ))}
        <span className="hcw-time__tz">All day</span>
        {allDay.map((items, index) => (
          <div key={dayKey(days[index])} className="hcw-allday">
            {items.map((event) => <EventChip key={`${event.source}:${event.id ?? titleOf(event)}`} event={event} onOpen={onOpen} compact />)}
            {canAdd && <button type="button" className="hcw-allday__add" aria-label={`Add an all-day event on ${days[index].toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`} onClick={() => onCreate({ start: startOfDay(days[index]), end: startOfDay(days[index]), allDay: true })}><Plus aria-hidden="true" /></button>}
          </div>
        ))}
      </div>
      <div className="hcw-time__body" ref={scroller}>
        <div className="hcw-time__grid" style={{ '--hcw-days': days.length, '--hcw-hour': `${HOUR_PX}px` }}>
          <div className="hcw-hours" aria-hidden="true">
            {Array.from({ length: 24 }, (_, hour) => <span key={hour}>{hourLabel(hour)}</span>)}
          </div>
          {days.map((day) => {
            const placed = layoutDay(events, day)
            const isToday = sameDay(day, today)
            const selection = drag && sameDay(drag.day, day) ? drag : null
            return (
              <div
                key={dayKey(day)}
                className={`hcw-col${isToday ? ' is-today' : ''}`}
                role="group"
                tabIndex={canAdd ? 0 : -1}
                aria-label={`${day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}${canAdd ? '. Press Enter to add an event' : ''}`}
                onPointerDown={begin(day)}
                onPointerMove={move}
                onPointerUp={finish}
                onPointerCancel={() => setDrag(null)}
                onKeyDown={keyCreate(day)}
              >
                {placed.map(({ event, top, height, column, columns }) => {
                  const calendar = calendarOf(event)
                  return (
                    <button
                      key={`${event.source}:${event.id ?? titleOf(event)}`}
                      type="button"
                      className={`hcw-event is-${calendar.tone}${height < 40 ? ' is-short' : ''}`}
                      style={{ top: (top / 60) * HOUR_PX, height: Math.max(18, (height / 60) * HOUR_PX - 2), left: `calc(${(column / columns) * 100}% + 2px)`, width: `calc(${100 / columns}% - 4px)` }}
                      onClick={() => onOpen(event)}
                      title={`${titleOf(event)} · ${timeRange(event)}`}
                    >
                      <b>{titleOf(event)}</b>
                      <small>{timeRange(event)}</small>
                    </button>
                  )
                })}
                {selection && (
                  <span className="hcw-selection" style={{ top: (selection.from / 60) * HOUR_PX, height: ((selection.to - selection.from) / 60) * HOUR_PX }} aria-hidden="true">
                    {time(atMinutes(day, selection.from))} – {time(atMinutes(day, selection.moved ? selection.to : selection.from + 60))}
                  </span>
                )}
                {isToday && <span className="hcw-now" style={{ top: ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_PX }} aria-hidden="true" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Month: whole weeks; each day lists up to three events and a "+N more" link to Day view. */
function MonthGrid({ days, anchor, events, today, canAdd, onCreate, onOpen, onPickDay }) {
  return (
    <div className="hcw-month">
      {WEEKDAYS.map((day) => <span key={day} className="hcw-month__head">{day}</span>)}
      {days.map((day) => {
        const items = events.filter((event) => onDay(event, day)).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start)
        return (
          <div
            key={dayKey(day)}
            className={`hcw-month__cell${day.getMonth() === anchor.getMonth() ? '' : ' is-out'}${sameDay(day, today) ? ' is-today' : ''}${sameDay(day, anchor) ? ' is-selected' : ''}`}
            onDoubleClick={canAdd ? () => onCreate({ start: atMinutes(day, 9 * 60), end: atMinutes(day, 10 * 60), allDay: false }) : undefined}
          >
            <button type="button" className="hcw-month__day" onClick={() => onPickDay(day)} aria-label={`${day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, ${items.length} ${items.length === 1 ? 'event' : 'events'}. Open day view`}>{day.getDate()}</button>
            {items.slice(0, 3).map((event) => <EventChip key={`${event.source}:${event.id ?? titleOf(event)}`} event={event} onOpen={onOpen} compact />)}
            {items.length > 3 && <button type="button" className="hcw-month__more" onClick={() => onPickDay(day)}>+{items.length - 3} more</button>}
            {canAdd && <button type="button" className="hcw-month__add" aria-label={`Add an event on ${day.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`} onClick={() => onCreate({ start: atMinutes(day, 9 * 60), end: atMinutes(day, 10 * 60), allDay: false })}><Plus aria-hidden="true" /></button>}
          </div>
        )
      })}
    </div>
  )
}

function Agenda({ days, events, today, onOpen }) {
  const groups = agendaDays(events, days)
  if (!groups.length) return <p className="hcw-empty"><CalendarDays aria-hidden="true" />No events in this month for the selected calendars.</p>
  return (
    <ol className="hcw-agenda">
      {groups.map(({ day, events: items }) => (
        <li key={dayKey(day)} className={sameDay(day, today) ? 'is-today' : ''}>
          <span className="hcw-agenda__date"><b>{day.getDate()}</b><small>{day.toLocaleDateString('en-GB', { weekday: 'short', month: 'short' })}</small></span>
          <ul>
            {items.map((event) => {
              const calendar = calendarOf(event)
              return (
                <li key={`${event.source}:${event.id ?? titleOf(event)}`}>
                  <button type="button" onClick={() => onOpen(event)} className={`is-${calendar.tone}`}>
                    <i aria-hidden="true" />
                    <span className="hcw-agenda__time">{event.allDay ? 'All day' : `${time(event.start)} – ${time(event.end)}`}</span>
                    <b>{titleOf(event)}</b>
                    <small>{calendar.label}{event.location ? ` · ${displayText(event.location)}` : ''}</small>
                  </button>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ol>
  )
}

/** Event details side panel: everything the API returned for the event. */
function EventPanel({ event, canEdit, canDelete, onEdit, onDelete, onClose }) {
  const panel = useRef(null)
  useEffect(() => {
    panel.current?.focus()
    const key = (keyEvent) => { if (keyEvent.key === 'Escape') onClose() }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onClose])
  const calendar = calendarOf(event)
  const meetingLink = displayText(hrField(event.raw, 'meetingLink', 'meetingUrl', 'joinUrl'))
  const employee = displayText(event.employeeName ?? hrField(event.raw, 'employeeName'))
  const status = displayText(event.status)
  const description = displayText(event.description)
  const editable = editableEvent(event)
  return (
    // A section, not an <aside>: the HR theme styles every aside as the app sidebar.
    <section className="hcw-panel" ref={panel} tabIndex={-1} aria-label={`${titleOf(event)} details`}>
      <header>
        <span className={`hcw-panel__tag is-${calendar.tone}`}><calendar.icon aria-hidden="true" />{calendar.label}</span>
        <button type="button" className="hcw-icon" onClick={onClose} aria-label="Close details"><X aria-hidden="true" /></button>
      </header>
      <h3>{titleOf(event)}</h3>
      <dl>
        <div><dt><Clock3 aria-hidden="true" /><span className="sr-only">When</span></dt><dd>{event.start.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}<small>{timeRange(event)}</small></dd></div>
        {employee && <div><dt><UserRound aria-hidden="true" /><span className="sr-only">Employee</span></dt><dd>{employee}</dd></div>}
        {event.location && <div><dt><MapPin aria-hidden="true" /><span className="sr-only">Location</span></dt><dd>{displayText(event.location)}</dd></div>}
        {meetingLink && <div><dt><Video aria-hidden="true" /><span className="sr-only">Meeting link</span></dt><dd><a href={meetingLink} target="_blank" rel="noopener noreferrer">Join meeting<ExternalLink aria-hidden="true" /></a></dd></div>}
        {status && <div><dt><CalendarDays aria-hidden="true" /><span className="sr-only">Status</span></dt><dd>{status}</dd></div>}
      </dl>
      {description && <p className="hcw-panel__desc">{description}</p>}
      {!editable && <p className="hcw-panel__note">{event.source === 'leaves' ? 'Leave events come from Leave Management.' : event.source === 'classes' ? 'Classes come from the class schedule.' : 'This event comes from another HR module.'} Edit it there.</p>}
      {editable && (canEdit || canDelete) && (
        <footer>
          {canEdit && <button type="button" className="hcw-btn" onClick={() => onEdit(event)}><Pencil aria-hidden="true" />Edit</button>}
          {canDelete && <button type="button" className="hcw-btn is-danger" onClick={() => onDelete(event)}><Trash2 aria-hidden="true" />Delete</button>}
        </footer>
      )}
    </section>
  )
}

export default function HrCalendarWorkspace({
  events, loading, sourceErrors = [], unavailableTypes = [], upcoming = [], monthTotal = null, month, onMonthChange,
  canAdd, canEdit, canDelete, onCreate, onEdit, onDelete, onRefresh, onExport,
}) {
  const [view, setView] = useState(() => (typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches ? 'agenda' : 'week'))
  const [anchor, setAnchor] = useState(() => {
    const today = startOfDay(new Date())
    return sameDay(monthOf(today), month) ? today : month
  })
  const [sidebar, setSidebar] = useState(() => !(typeof window !== 'undefined' && window.matchMedia?.('(max-width: 1023px)').matches))
  const [hidden, setHidden] = useState(() => new Set())
  const [query, setQuery] = useState('')
  const [opened, setOpened] = useState(null)
  const today = startOfDay(new Date())

  // Keep the loaded month in step with the date being viewed.
  const go = (date) => {
    setAnchor(date)
    if (!sameDay(monthOf(date), month)) onMonthChange(monthOf(date))
  }
  const needle = query.trim().toLowerCase()
  const visible = useMemo(() => events.filter((event) => !hidden.has(calendarOf(event).key) && (!needle
    || [event.title, event.employeeName, event.description, event.location].some((value) => String(displayText(value) || '').toLowerCase().includes(needle)))), [events, hidden, needle])
  const counts = useMemo(() => Object.fromEntries(CALENDARS.map(({ key }) => [key, events.filter((event) => calendarOf(event).key === key && event.start.getMonth() === month.getMonth() && event.start.getFullYear() === month.getFullYear()).length])), [events, month])
  const eventDays = useMemo(() => {
    const keys = new Set()
    for (const event of visible) {
      for (let day = startOfDay(event.start); day <= event.end && keys.size < 500; day = addDays(day, 1)) keys.add(dayKey(day))
    }
    return keys
  }, [visible])
  const days = viewDays(view === 'agenda' ? 'month' : view, anchor)
  const agendaRange = view === 'agenda' ? days.filter((day) => day.getMonth() === anchor.getMonth()) : days
  const toggle = (key) => setHidden((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next })
  const openDay = (day) => { go(day); setView('day') }
  const create = (slot) => { if (canAdd) onCreate(slot) }
  const nextUp = upcoming.filter((event) => !hidden.has(calendarOf(event).key)).slice(0, 5)

  return (
    <div className={`hcw${sidebar ? '' : ' is-collapsed'}`}>
      <header className="hcw-bar">
        <button type="button" className="hcw-icon" aria-label={sidebar ? 'Hide sidebar' : 'Show sidebar'} aria-expanded={sidebar} onClick={() => setSidebar((value) => !value)}><PanelLeft aria-hidden="true" /></button>
        <h1 className="hcw-bar__title">Calendar</h1>
        <button type="button" className="hcw-btn" onClick={() => go(today)}>Today</button>
        <span className="hcw-step">
          <button type="button" className="hcw-icon" aria-label={`Previous ${view === 'agenda' ? 'month' : view}`} onClick={() => go(shiftAnchor(view, anchor, -1))}><ChevronLeft aria-hidden="true" /></button>
          <button type="button" className="hcw-icon" aria-label={`Next ${view === 'agenda' ? 'month' : view}`} onClick={() => go(shiftAnchor(view, anchor, 1))}><ChevronRight aria-hidden="true" /></button>
        </span>
        <h2 className="hcw-bar__range" aria-live="polite">{rangeLabel(view, anchor)}</h2>
        {loading && <span className="hcw-bar__loading" role="status"><RefreshCw className="animate-spin" aria-hidden="true" />Loading</span>}
        <span className="hcw-bar__end">
          <label className="hcw-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search events</span>
            <input type="search" value={query} onChange={(change) => setQuery(change.target.value)} placeholder="Search events or people" />
          </label>
          <span className="hcw-views" role="group" aria-label="Calendar view">
            {VIEWS.map((value) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}>{VIEW_LABELS[value]}</button>)}
          </span>
          <button type="button" className="hcw-icon" aria-label="Refresh calendar" title="Refresh" disabled={loading} onClick={onRefresh}><RefreshCw aria-hidden="true" /></button>
          {onExport && <button type="button" className="hcw-icon" aria-label="Export events" title="Export" onClick={onExport}><Download aria-hidden="true" /></button>}
          {canAdd && <button type="button" className="hcw-btn is-primary" onClick={() => { const start = atMinutes(anchor, 9 * 60); create({ start, end: atMinutes(anchor, 10 * 60), allDay: false }) }}><Plus aria-hidden="true" />Add Event</button>}
        </span>
      </header>

      {sourceErrors.length > 0 && (
        <div className="hcw-alert" role="alert">
          <AlertTriangle aria-hidden="true" />
          <ul>{sourceErrors.map(({ label, message }) => <li key={label}><b>{label}:</b> <span>{message}</span></li>)}</ul>
          <button type="button" className="hcw-btn" onClick={onRefresh} disabled={loading}>Retry</button>
        </div>
      )}

      <div className="hcw-body">
        {sidebar && (
          <section className="hcw-side" aria-label="Calendars">
            <MiniCalendar anchor={anchor} today={today} eventDays={eventDays} onPick={(day) => go(day)} />
            <section className="hcw-cals">
              <h3>Calendars</h3>
              {/* The API's own count for the current month (GET /calendar/events/stats). */}
              {monthTotal != null && <p className="hcw-muted hcw-cals__total">{monthTotal} {monthTotal === 1 ? 'event' : 'events'} this month</p>}
              <ul>
                {CALENDARS.filter((item) => item.key !== 'unknown' || counts.unknown).map((item) => {
                  const unavailable = unavailableTypes.includes(item.key)
                  return (
                    <li key={item.key}>
                      <label className={`is-${item.tone}`}>
                        <input type="checkbox" checked={!hidden.has(item.key)} onChange={() => toggle(item.key)} />
                        <i aria-hidden="true" />
                        <span>{item.label}</span>
                        <small>{unavailable ? 'Unavailable' : counts[item.key]}</small>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>
            <section className="hcw-upcoming">
              <h3>Upcoming</h3>
              {nextUp.length ? (
                <ul>
                  {nextUp.map((event) => (
                    <li key={`${event.source}:${event.id ?? titleOf(event)}`}>
                      <button type="button" onClick={() => { go(startOfDay(event.start)); setOpened(event) }} className={`is-${calendarOf(event).tone}`}>
                        <i aria-hidden="true" />
                        <span><b>{titleOf(event)}</b><small>{event.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {event.allDay ? 'All day' : time(event.start)}</small></span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="hcw-muted">{loading ? 'Loading…' : 'Nothing coming up.'}</p>}
            </section>
          </section>
        )}

        <main className="hcw-main" aria-label={`${VIEW_LABELS[view]} view`}>
          {(view === 'day' || view === 'week') && <TimeGrid days={days} events={visible} today={today} canAdd={canAdd} onCreate={create} onOpen={setOpened} onPickDay={openDay} />}
          {view === 'month' && <MonthGrid days={days} anchor={anchor} events={visible} today={today} canAdd={canAdd} onCreate={create} onOpen={setOpened} onPickDay={openDay} />}
          {view === 'agenda' && <Agenda days={agendaRange} events={visible} today={today} onOpen={setOpened} />}
          {!loading && !events.length && !sourceErrors.length && view !== 'agenda' && <p className="hcw-empty-note">No events in {month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}.{canAdd ? ' Click or drag on the grid to add one.' : ''}</p>}
          {opened && <EventPanel event={opened} canEdit={canEdit} canDelete={canDelete} onEdit={(event) => { setOpened(null); onEdit(event) }} onDelete={(event) => { setOpened(null); onDelete(event) }} onClose={() => setOpened(null)} />}
        </main>
      </div>
    </div>
  )
}

const eventShape = PropTypes.shape({ title: PropTypes.any, start: PropTypes.instanceOf(Date).isRequired, end: PropTypes.instanceOf(Date).isRequired, allDay: PropTypes.bool, type: PropTypes.string, source: PropTypes.string })
HrCalendarWorkspace.propTypes = {
  events: PropTypes.arrayOf(eventShape).isRequired, loading: PropTypes.bool, sourceErrors: PropTypes.array, unavailableTypes: PropTypes.array, upcoming: PropTypes.array, monthTotal: PropTypes.number,
  month: PropTypes.instanceOf(Date).isRequired, onMonthChange: PropTypes.func.isRequired, canAdd: PropTypes.bool, canEdit: PropTypes.bool, canDelete: PropTypes.bool,
  onCreate: PropTypes.func.isRequired, onEdit: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired, onRefresh: PropTypes.func.isRequired, onExport: PropTypes.func,
}
MiniCalendar.propTypes = { anchor: PropTypes.instanceOf(Date).isRequired, today: PropTypes.instanceOf(Date).isRequired, eventDays: PropTypes.instanceOf(Set).isRequired, onPick: PropTypes.func.isRequired }
EventChip.propTypes = { event: eventShape.isRequired, onOpen: PropTypes.func.isRequired, compact: PropTypes.bool }
TimeGrid.propTypes = { days: PropTypes.array.isRequired, events: PropTypes.array.isRequired, today: PropTypes.instanceOf(Date).isRequired, canAdd: PropTypes.bool, onCreate: PropTypes.func.isRequired, onOpen: PropTypes.func.isRequired, onPickDay: PropTypes.func.isRequired }
MonthGrid.propTypes = { ...TimeGrid.propTypes, anchor: PropTypes.instanceOf(Date).isRequired }
Agenda.propTypes = { days: PropTypes.array.isRequired, events: PropTypes.array.isRequired, today: PropTypes.instanceOf(Date).isRequired, onOpen: PropTypes.func.isRequired }
EventPanel.propTypes = { event: eventShape.isRequired, canEdit: PropTypes.bool, canDelete: PropTypes.bool, onEdit: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired, onClose: PropTypes.func.isRequired }
