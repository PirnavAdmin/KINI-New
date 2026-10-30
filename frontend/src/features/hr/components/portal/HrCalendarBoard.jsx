import { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, CalendarDays, CalendarSync, ChevronLeft, ChevronRight, Download, Plane, Plus, Star, UserRound, Users,
} from 'lucide-react'
import { displayText } from '@features/hr/services/hrDashboardData'
import { calendarOnDay, inCalendarMonth, calendarMonthMetrics } from '@features/hr/services/hrCalendarData'
import './hr-calendar.css'

// Categories come from normalized API types, never title text.
const TYPES = [
  ['classes', 'Classes', null, 'purple', BookOpen],
  ['meetings', 'Meetings', null, 'blue', Users],
  ['holidays', 'Holidays', null, 'red', Plane],
  ['leaves', 'Leave Events', null, 'orange', Plane],
  ['performance', 'Performance Reviews', null, 'green', Star],
]
const typeOf = event => TYPES.find(([key]) => key === event.type) ?? ['unknown', 'Other', null, 'blue', CalendarDays]
const keyOf = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const timeOf = (date) => (Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
const DONUT = { purple: '#7c3aed', blue: '#2f6fe4', red: '#e5484d', orange: '#f58a0b', green: '#16a34a' }

/** Month calendar + upcoming events + filters + type breakdown for HR Calendar & Events. */
export default function HrCalendarBoard({ rows, error, unavailableTypes = [], upcomingRows = [], upcomingError, loading, month, onMonthChange, canAdd, onAdd, onOpen, onExport }) {
  const navigate = useNavigate()
  const [view, setView] = useState('month')
  const [enabled, setEnabled] = useState(() => new Set(TYPES.map(([key]) => key)))
  const events = useMemo(() => rows.map(row => ({ row, date: row.start, type: typeOf(row) })), [rows])
  const visible = events.filter(item => item.type[0] === 'unknown' || enabled.has(item.type[0]))
  const inMonth = item => inCalendarMonth(item.row, month)
  const today = keyOf(new Date())
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const cells = Array.from({ length: Math.ceil((first.getDay() + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) * 7 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - first.getDay() + 1))
  const metrics = calendarMonthMetrics(rows, month, unavailableTypes)
  const counts = TYPES.map(([key, label, , tone]) => ({ key, label, tone, count: metrics[key] }))
  const total = metrics.total
  let offset = 0
  const donut = total ? `conic-gradient(${counts.filter((item) => item.count).map((item) => { const start = offset; offset += (item.count / total) * 100; return `${DONUT[item.tone]} ${start}% ${offset}%` }).concat(`#e2e8f0 ${offset}% 100%`).join(', ')})` : 'conic-gradient(#e2e8f0 0 100%)'
  const upcoming = upcomingRows.map(row => ({ row, date: row.start, type: typeOf(row) }))
  const shift = (amount) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + amount, 1))
  const list = view === 'list'

  return (
    <div className="hrc">
      <div className="hrc-main">
        <section className="hrc-cal">
          <div className="hrc-cal__bar">
            <button type="button" className="hrc-btn" onClick={() => onMonthChange(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button>
            <span className="hrc-nav">
              <button type="button" aria-label="Previous month" onClick={() => shift(-1)}><ChevronLeft /></button>
              <button type="button" aria-label="Next month" onClick={() => shift(1)}><ChevronRight /></button>
            </span>
            <h2>{month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <span className="hrc-views" role="group" aria-label="Calendar view">
              {[['month', 'Month'], ['list', 'List']].map(([value, label]) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)}>{label}</button>)}
            </span>
          </div>
          {loading && <p className="hrc-loading" role="status">Loading events...</p>}
          {list ? (
            <ul className="hrc-list">
              {visible.filter((item) => inMonth(item)).map((item, index) => (
                <li key={`${item.row.source}:${item.row.id ?? index}`}>
                  <button type="button" onClick={() => onOpen(item.row)} className={`is-${item.type[3]}`}>
                    <b>{item.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</b>
                    <span>{displayText(item.row.title) || 'Event'}</span>
                    <small>{(item.row.allDay ? 'All day' : timeOf(item.date))} · {item.type[1]}</small>
                  </button>
                </li>
              ))}
              {!loading && !error && !visible.some((item) => inMonth(item)) && <li className="hrc-empty">No events scheduled.</li>}
            </ul>
          ) : (
            <div className="hrc-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="hrc-grid__head">{day}</div>)}
              {cells.map((date) => {
                const key = keyOf(date)
                const inMonth = date.getMonth() === month.getMonth()
                const items = visible.filter(item => calendarOnDay(item.row, date))
                return (
                  <div key={key} className={`hrc-cell ${inMonth ? '' : 'is-out'} ${key === today ? 'is-today' : ''}`}>
                    <span className="hrc-cell__day">{date.getDate()}</span>
                    {inMonth && items.slice(0, 2).map((item, index) => {
                      const Icon = item.type[4]
                      return (
                        <button key={index} type="button" className={`hrc-ev is-${item.type[3]}`} onClick={() => onOpen(item.row)} title={displayText(item.row.title)}>
                          <b><Icon aria-hidden="true" />{displayText(item.row.title) || 'Event'}</b>
                          <small>{(item.row.allDay ? 'All day' : timeOf(item.date))}</small>
                        </button>
                      )
                    })}
                    {inMonth && items.length > 2 && <span className="hrc-more">+{items.length - 2} more</span>}
                  </div>
                )
              })}
            </div>
          )}
          {!loading && !error && !visible.some(inMonth) && !list && <p className="hrc-empty">No events scheduled.</p>}
        </section>
        <aside className="hrc-side">
          <section className="hrc-card">
            <header><h3>Upcoming Events</h3></header>
            {loading ? <p className="hrc-loading" role="status">Loading upcoming events...</p> : upcomingError ? <p className="hrc-empty" role="alert">{upcomingError}</p> : upcoming.length ? (
              <ul className="hrc-up">
                {upcoming.map((item, index) => {
                  const Icon = item.type[4]
                  return (
                    <li key={`${item.row.source}:${item.row.id ?? index}`}>
                      <span className="hrc-up__date"><b>{String(item.date.getDate()).padStart(2, '0')}</b>{item.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                      <span className={`hrc-up__icon is-${item.type[3]}`} aria-hidden="true"><Icon /></span>
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onOpen(item.row)}>
                        <b>{displayText(item.row.title) || 'Event'}</b>
                        <small>{item.type[1]} - {(item.row.allDay ? 'All day' : timeOf(item.date))}{item.row.location ? ` · ${displayText(item.row.location)}` : ''}</small>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : <p className="hrc-empty">No upcoming events.</p>}
          </section>
          <section className="hrc-card">
            <header><h3>Calendar Filters</h3><button type="button" onClick={() => setEnabled(new Set(TYPES.map(([key]) => key)))}>Reset</button></header>
            <div className="hrc-filters">
              {TYPES.map(([key, label, , tone]) => (
                <label key={key}>
                  <input type="checkbox" checked={enabled.has(key)} onChange={() => setEnabled((current) => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next })} />
                  <i className={`is-${tone}`} />{label}
                </label>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="hrc-bottom">
        <section className="hrc-card">
          <header><h3>Events by Type</h3></header>
          <div className="hrc-types">
            <div className="hrc-donut" style={{ background: donut }}><span><b>{loading ? '...' : total ?? '—'}</b><small>Events</small></span></div>
            <ul>{counts.map((item) => <li key={item.key}><i className={`is-${item.tone}`} />{item.label}<b>{loading ? '...' : item.count == null ? 'Unavailable' : `${item.count} (${total == null ? '—' : total ? ((item.count / total) * 100).toFixed(1) + '%' : '0.0%'})`}</b></li>)}</ul>
          </div>
        </section>
        <section className="hrc-card">
          <header><h3>This Month Overview</h3></header>
          <div className="hrc-overview">
            {[['Total Events', metrics.total, 'purple', CalendarDays], ['Classes', metrics.classes, 'green', BookOpen], ['Meetings', metrics.meetings, 'blue', Users], ['Leave Events', metrics.leaves, 'orange', Plane]].map(([label, value, tone, Icon]) => (
              <div key={label} className={`is-${tone}`}><Icon aria-hidden="true" /><b>{loading ? '...' : value ?? '—'}</b><small>{label}</small></div>
            ))}
          </div>
        </section>
        <section className="hrc-card">
          <header><h3>Quick Actions</h3></header>
          <div className="hrc-quick">
            {canAdd && <button type="button" onClick={onAdd}><span className="is-purple"><Plus /></span><b>Add Event</b><small>Create a new event</small></button>}
            <button type="button" onClick={() => onMonthChange(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}><span className="is-blue"><CalendarSync /></span><b>Go to Today</b><small>Jump to the current month</small></button>
            <button type="button" onClick={() => navigate('/employee/hr-leave')}><span className="is-blue"><UserRound /></span><b>View Employee Leaves</b><small>Check team availability</small></button>
            {onExport && <button type="button" onClick={onExport}><span className="is-blue"><Download /></span><b>Export Events</b><small>Download calendar data</small></button>}
          </div>
        </section>
      </div>
    </div>
  )
}

HrCalendarBoard.propTypes = {
  rows: PropTypes.array.isRequired, error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]), unavailableTypes: PropTypes.array, upcomingRows: PropTypes.array, upcomingError: PropTypes.string, loading: PropTypes.bool, month: PropTypes.instanceOf(Date).isRequired, onMonthChange: PropTypes.func.isRequired,
  canAdd: PropTypes.bool, onAdd: PropTypes.func, onOpen: PropTypes.func.isRequired, onExport: PropTypes.func,
}
