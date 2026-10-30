import { createContext, useContext, useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, BookOpen, CalendarClock, CalendarDays, CheckCircle2, Clock3, Download, FileText, FolderOpen,
  Inbox, Layers3, Megaphone, MoreHorizontal, PieChart, Search, Star, UserPlus, Users, XCircle, Zap,
} from 'lucide-react'
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import usePermission from '@shared/hooks/usePermission'
import { downloadHrFile, hrError, hrField, hrModuleApi, hrRequest } from '@features/hr/services/hrApi'
import { activeAnnouncements } from '../services/hrAnnouncementData'
import { ROUTES } from '@shared/constants/routeConstants'
import { displayText, workforceDepartments } from '../services/hrDashboardData'
import { attendanceSeries, dayKey, departmentShares, filterLeaves, leaveDays, leaveStatusKey, upcomingItems } from '../services/hrDashboardInsights'
import './hr-dashboard.css'

/* ──────────────────────────────────────────────────────────────────────
   HR dashboard body, laid out after the Kini HR reference screen:
   department donut · attendance trend · today at a glance, the leave
   review table, four supporting lists, and the quick-actions bar. Data
   comes from HRDashboardView (the HR APIs this user may read); every
   section has loading, empty and error states.
   ────────────────────────────────────────────────────────────────────── */

const ModuleState = createContext({ onRetry: () => {}, pending: [], failures: {}, errors: [], loading: false })
const E = ROUTES.EMPLOYEE
const text = (row, ...keys) => displayText(hrField(row, ...keys))
const DEPT_COLORS = ['#2f6fe4', '#f39924', '#16a34a', '#7c3aed', '#0d9488', '#e5484d', '#133b5d']
const SERIES = [
  { key: 'present', label: 'Present', color: '#16a34a' },
  { key: 'onLeave', label: 'On Leave', color: '#f39924' },
  { key: 'absent', label: 'Absent', color: '#e5484d' },
]
const RANGES = [7, 14, 30]
const LEAVE_PAGE = 5
const LEAVE_STATUS_KEY = 'hr-dashboard-leave-status'
const LEAVE_STATUSES = ['pending', 'approved', 'rejected']
const EMPTY_LEAVE_FILTERS = { query: '', type: 'all', status: 'all', from: '', to: '' }

const initials = (name) => String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
const leaveTone = (type) => (/sick/i.test(type) ? 'red' : /home|wfh/i.test(type) ? 'blue' : /casual/i.test(type) ? 'green' : /earn|privilege/i.test(type) ? 'purple' : 'orange')
const dateLabel = (value) => {
  const date = value ? new Date(`${String(value).slice(0, 10)}T00:00:00`) : null
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'
}
const readStoredStatus = () => {
  try {
    const value = window.localStorage.getItem(LEAVE_STATUS_KEY)
    return LEAVE_STATUSES.includes(value) ? value : 'all'
  } catch { return 'all' }
}
const storeStatus = (value) => { try { window.localStorage.setItem(LEAVE_STATUS_KEY, value) } catch { /* storage unavailable */ } }

function Panel({ title, icon: Icon, tone = 'blue', to, action, className = '', children }) {
  const headingId = useId()
  return (
    <section className={`hx-panel is-${tone} ${className}`} aria-labelledby={headingId}>
      <header className="hx-panel__head">
        <span className="hx-panel__icon" aria-hidden="true"><Icon /></span>
        <h2 id={headingId}>{title}</h2>
        <span className="hx-panel__tools">
          {action}
          {to && <Link className="hx-link" to={to}>View All<ArrowRight aria-hidden="true" /></Link>}
        </span>
      </header>
      {children}
    </section>
  )
}

const EXPLANATIONS = {
  attendance: 'Recorded attendance appears here.', employees: 'Employees appear once they are added to the directory.',
  leave: 'Leave requests appear here as employees submit them.', performance: 'Completed reviews appear here.',
  announcements: 'Published HR announcements appear here.', calendar: 'Scheduled events appear here.',
  syllabus: 'Assigned syllabus appears here.', batches: 'Batches appear here once they are created.',
  students: 'Student records appear here.', resources: 'Shared documents appear here.', schedule: 'Upcoming classes appear here.',
}
/** Loading skeleton, error with retry, or an empty message for one module. */
function ModuleFallback({ module, children, icon: Icon = Inbox, rows = 3 }) {
  const { onRetry, pending, failures, errors, loading } = useContext(ModuleState)
  const modules = Array.isArray(module) ? module : [module]
  if (modules.some((key) => pending.includes(key))) {
    return <div className="hx-skeleton-list" role="status" aria-label="Loading">{Array.from({ length: rows }, (_, index) => <span key={index} className="hx-skeleton" />)}</div>
  }
  const failed = modules.find((key) => errors.includes(key))
  const failure = failed ? failures[failed] : null
  return (
    <div className={`hx-empty${failed ? ' is-error' : ''}`} role={failed ? 'alert' : 'status'}>
      <Icon aria-hidden="true" />
      <div>
        <strong>{failed ? (failure?.message || 'This section could not be loaded.') : children}</strong>
        {!failed && <small>{EXPLANATIONS[modules[0]]}</small>}
      </div>
      {failed && failure?.retryable !== false && <button type="button" className="hx-btn is-small" disabled={loading} onClick={() => onRetry(failed)}>Retry</button>}
    </div>
  )
}

function Departments({ employees, departments }) {
  const { pending, errors } = useContext(ModuleState)
  const rows = departmentShares(workforceDepartments(employees, departments), employees.length)
  const ready = !pending.includes('employees') && !errors.includes('employees')
  let offset = 0
  const donut = rows.length
    ? `conic-gradient(${rows.map((row, index) => {
      const start = offset
      offset += (row.count / employees.length) * 100
      return `${DEPT_COLORS[index % DEPT_COLORS.length]} ${start}% ${offset}%`
    }).join(', ')})`
    : 'conic-gradient(#e2e8f0 0 100%)'
  return (
    <Panel title="Workforce by Department" icon={PieChart} tone="orange" to={E.HR_EMPLOYEES} className="hx-dept">
      {ready && rows.length ? (
        <div className="hx-dept__body">
          <div className="hx-donut" style={{ background: donut }} role="img" aria-label={`${employees.length} employees across ${rows.length} departments`}>
            <span><b>{employees.length}</b><small>Total<br />Employees</small></span>
          </div>
          <ul className="hx-dept__legend" aria-label="Employees per department">
            {rows.map((row, index) => (
              <li key={row.name} title={`${row.name}: ${row.count} ${row.count === 1 ? 'employee' : 'employees'} (${row.share}%)`}>
                <i style={{ background: DEPT_COLORS[index % DEPT_COLORS.length] }} aria-hidden="true" />
                <span className="hx-dept__name">{row.name}</span>
                <b>{row.count}</b>
                <span className="hx-dept__share">({row.share}%)</span>
              </li>
            ))}
          </ul>
        </div>
      ) : <ModuleFallback module="employees" icon={Users} rows={4}>No department data yet.</ModuleFallback>}
    </Panel>
  )
}

function AttendanceTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const day = payload[0].payload
  return (
    <div className="hx-tooltip">
      <b>{label}</b>
      {day.recorded ? SERIES.map(({ key, label: name, color }) => (
        <span key={key}><i style={{ background: color }} />{name}<strong>{day[key] ?? 0}</strong></span>
      )) : <span>No attendance recorded</span>}
    </div>
  )
}

function Attendance({ history }) {
  const { pending, errors } = useContext(ModuleState)
  const [range, setRange] = useState(7)
  const series = useMemo(() => attendanceSeries(history, range), [history, range])
  const hasData = series.some((day) => day.recorded > 0)
  const ready = !pending.includes('attendance') && !errors.includes('attendance')
  return (
    <Panel title={`Attendance Trend - Recent ${range} Days`} icon={BarChart3} tone="green"
      action={(
        <label className="hx-select is-small">
          <span className="sr-only">Date range</span>
          <select value={range} onChange={(event) => setRange(Number(event.target.value))}>
            {RANGES.map((days) => <option key={days} value={days}>Last {days} Days</option>)}
          </select>
        </label>
      )}
      className="hx-attendance">
      {ready && hasData ? (
        <>
          <div className="hx-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={series} margin={{ top: 8, right: 20, left: -26, bottom: 0 }}>
                <defs>
                  <linearGradient id="hx-present-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e8eef6" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} interval={range > 14 ? 'preserveStartEnd' : 0} minTickGap={6} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip content={<AttendanceTooltip />} />
                <Area dataKey="present" stroke="none" fill="url(#hx-present-fill)" isAnimationActive={false} legendType="none" tooltipType="none" />
                {[...SERIES].reverse().map(({ key, label, color }) => (
                  <Line key={key} dataKey={key} name={label} stroke={color} strokeWidth={2.2} dot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ul className="hx-legend" aria-label="Series">
            {SERIES.map(({ key, label, color }) => <li key={key}><i style={{ background: color }} aria-hidden="true" />{label}</li>)}
          </ul>
        </>
      ) : <ModuleFallback module="attendance" icon={CalendarDays} rows={4}>No attendance recorded in the last {range} days.</ModuleFallback>}
    </Panel>
  )
}

/** Four counts for today, each from its own module and each linking to it. */
function TodayAtAGlance({ rows }) {
  const { pending, errors } = useContext(ModuleState)
  if (!rows.length) return null
  return (
    <Panel title="Today at a Glance" icon={Zap} tone="orange" to={rows[0].to} className="hx-glance">
      <ul className="hx-glance__list">
        {rows.map(({ key, module, label, sub, value, icon: Icon, tone, to }) => {
          const modules = Array.isArray(module) ? module : [module]
          const busy = modules.some((item) => pending.includes(item))
          // Unavailable only when every source behind the count failed.
          const failed = modules.every((item) => errors.includes(item))
          return (
            <li key={key}>
              <Link to={to} className={`is-${tone}`}>
                <span className="hx-glance__icon" aria-hidden="true"><Icon /></span>
                <b>{busy ? <span className="hx-skeleton hx-skeleton--kpi" aria-label="Loading" /> : failed ? '—' : value}</b>
                <span className="hx-glance__text"><strong>{label}</strong><small>{failed ? 'Unavailable' : sub}</small></span>
              </Link>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function LeaveQueue({ rows }) {
  const { pending, errors } = useContext(ModuleState)
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => ({ ...EMPTY_LEAVE_FILTERS, status: readStoredStatus() }))
  const [applied, setApplied] = useState(draft)
  const [page, setPage] = useState(1)
  const types = useMemo(() => [...new Set(rows.map((row) => text(row, 'leaveType', 'type')).filter(Boolean))].sort(), [rows])
  const matches = useMemo(() => filterLeaves(rows, applied), [rows, applied])
  const pages = Math.max(1, Math.ceil(matches.length / LEAVE_PAGE))
  const current = Math.min(page, pages)
  const visible = matches.slice((current - 1) * LEAVE_PAGE, current * LEAVE_PAGE)
  const set = (key) => (event) => setDraft((previous) => ({ ...previous, [key]: event.target.value }))
  const apply = (event) => { event?.preventDefault(); storeStatus(draft.status); setApplied(draft); setPage(1) }
  const reset = () => { storeStatus('all'); setDraft(EMPTY_LEAVE_FILTERS); setApplied(EMPTY_LEAVE_FILTERS); setPage(1) }
  const ready = !pending.includes('leave') && !errors.includes('leave')
  const filtered = JSON.stringify(applied) !== JSON.stringify(EMPTY_LEAVE_FILTERS)
  const headingId = useId()
  return (
    <section className="hx-panel is-orange hx-leave" aria-labelledby={headingId}>
      <header className="hx-panel__head">
        <span className="hx-panel__icon" aria-hidden="true"><CalendarClock /></span>
        <h2 id={headingId}>Leave Requests Awaiting Review</h2>
        <form className="hx-filters" role="search" aria-label="Filter leave requests" onSubmit={apply}>
          <label className="hx-search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search by employee</span>
            <input type="search" value={draft.query} onChange={set('query')} placeholder="Search by employee name..." />
          </label>
          <label className="hx-select">
            <span className="sr-only">Leave type</span>
            <select value={draft.type} onChange={set('type')}>
              <option value="all">All Leave Types</option>
              {types.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <span className="hx-range">
            <label className="hx-date-input"><CalendarDays aria-hidden="true" /><input type="date" value={draft.from} max={draft.to || undefined} onChange={set('from')} aria-label="From date" /></label>
            <ArrowRight aria-hidden="true" />
            <label className="hx-date-input"><CalendarDays aria-hidden="true" /><input type="date" value={draft.to} min={draft.from || undefined} onChange={set('to')} aria-label="To date" /></label>
          </span>
          <label className="hx-select">
            <span className="sr-only">Status</span>
            <select value={draft.status} onChange={set('status')}>
              <option value="all">All Status</option>
              {LEAVE_STATUSES.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}
            </select>
          </label>
          <button type="submit" className="hx-btn is-primary">Apply</button>
          <button type="button" className="hx-btn is-soft" onClick={reset}>Reset</button>
        </form>
      </header>
      {ready && matches.length ? (
        <>
          <div className="hx-table-wrap">
            <table className="hx-table" data-table-header="plain">
              <thead><tr><th scope="col" className="hx-num">#</th><th scope="col">Employee</th><th scope="col">Leave Type</th><th scope="col">From</th><th scope="col">To</th><th scope="col">Days</th><th scope="col">Status</th><th scope="col" className="hx-center">Action</th></tr></thead>
              <tbody>
                {visible.map((row, index) => {
                  const id = String(hrField(row, 'leaveId', 'id') ?? `${current}-${index}`)
                  const type = text(row, 'leaveType', 'type') || 'Leave'
                  const status = leaveStatusKey(hrField(row, 'status'))
                  const StatusIcon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock3
                  const name = text(row, 'employeeName', 'fullName') || 'Employee'
                  const days = leaveDays(row)
                  return (
                    <tr key={id}>
                      <td className="hx-num">{(current - 1) * LEAVE_PAGE + index + 1}</td>
                      <td><span className="hx-person"><span className="hx-avatar" aria-hidden="true">{initials(name)}</span><span>{name}</span></span></td>
                      <td><span className={`hx-pill is-${leaveTone(type)}${/^[a-z]+$/i.test(type) ? ' is-caps' : ''}`}>{type}</span></td>
                      <td className="hx-nowrap">{dateLabel(hrField(row, 'fromDate', 'startDate'))}</td>
                      <td className="hx-nowrap">{dateLabel(hrField(row, 'toDate', 'endDate') || hrField(row, 'fromDate', 'startDate'))}</td>
                      <td>{days ?? '—'}</td>
                      <td><span className={`hx-status is-${status}`}><StatusIcon aria-hidden="true" />{status[0].toUpperCase() + status.slice(1)}</span></td>
                      <td className="hx-center">
                        <span className="hx-actions">
                          <Link className="hx-review" to={`${E.HR_LEAVE}?leave=${encodeURIComponent(id)}`} aria-label={`Review leave request from ${name}`}>Review</Link>
                          <button type="button" className="hx-more" aria-label={`Open leave management for ${name}`} onClick={() => navigate(E.HR_LEAVE)}><MoreHorizontal aria-hidden="true" /></button>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <nav className="hx-pager" aria-label="Leave request pages">
              <span>{(current - 1) * LEAVE_PAGE + 1}–{Math.min(current * LEAVE_PAGE, matches.length)} of {matches.length}</span>
              <button type="button" onClick={() => setPage(current - 1)} disabled={current === 1}>Previous</button>
              <button type="button" onClick={() => setPage(current + 1)} disabled={current === pages}>Next</button>
            </nav>
          )}
        </>
      ) : ready && rows.length ? (
        <div className="hx-empty" role="status"><Inbox aria-hidden="true" /><div><strong>No leave requests match these filters.</strong><small>Change the filters or press Reset.</small></div>{filtered && <button type="button" className="hx-btn is-small" onClick={reset}>Reset</button>}</div>
      ) : <ModuleFallback module="leave" icon={FileText}>No leave requests yet.</ModuleFallback>}
    </section>
  )
}

const statusTone = (value) => {
  const status = String(value || '').toLowerCase()
  if (/active|ongoing|live|published|enrolled|completed/.test(status)) return 'green'
  if (/upcoming|scheduled/.test(status)) return 'blue'
  if (/pending|draft/.test(status)) return 'orange'
  if (/inactive|cancel|expired|reject/.test(status)) return 'red'
  return 'navy'
}
const timeRange = (start, end) => {
  const time = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return end ? `${time(start)} – ${time(end)}` : time(start)
}

function UpcomingEvents({ events, modules }) {
  const { pending, errors } = useContext(ModuleState)
  const settled = modules.every((key) => !pending.includes(key)) && !modules.every((key) => errors.includes(key))
  return (
    <Panel title="Upcoming Events" icon={CalendarDays} tone="blue" to={E.CALENDAR}>
      {events.length ? (
        <ul className="hx-events">
          {events.map((item) => (
            <li key={item.id}>
              <span className="hx-events__date" aria-hidden="true"><b>{item.start.getDate()}</b><small>{item.start.toLocaleDateString('en-US', { month: 'short' })}</small></span>
              <span className="hx-list__main"><strong title={item.title}>{item.title}</strong><small>{timeRange(item.start, item.end)}</small></span>
              <span className={`hx-pill ${item.kind === 'Live Class' ? 'is-blue' : 'is-purple'}`}>{item.kind}</span>
            </li>
          ))}
        </ul>
      ) : settled
        ? <div className="hx-empty" role="status"><CalendarDays aria-hidden="true" /><div><strong>No upcoming events.</strong><small>{EXPLANATIONS.calendar}</small></div></div>
        : <ModuleFallback module={modules} icon={CalendarDays}>No upcoming events.</ModuleFallback>}
    </Panel>
  )
}

function TrainingPanel({ tabs, data }) {
  const { pending, errors } = useContext(ModuleState)
  const [tab, setTab] = useState(tabs[0].key)
  const currentTab = tabs.find((item) => item.key === tab) ?? tabs[0]
  const rows = data[currentTab.key] || []
  return (
    <Panel title="Training & Shared Resources" icon={FileText} tone="purple" to={currentTab.to}>
      <div className="hx-tabs" role="tablist" aria-label="Training">
        {tabs.map((item) => (
          <button key={item.key} type="button" role="tab" aria-selected={item.key === currentTab.key} onClick={() => setTab(item.key)}>
            {item.key === currentTab.key && <item.icon aria-hidden="true" />}{item.title}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {!pending.includes(currentTab.key) && !errors.includes(currentTab.key) && rows.length ? (
          <ul className="hx-rows">
            {rows.slice(0, 3).map((row, index) => {
              const status = text(row, 'status')
              return (
                <li key={`${currentTab.key}-${index}`}>
                  <strong title={text(row, ...currentTab.name)}>{text(row, ...currentTab.name) || 'Untitled'}</strong>
                  {status && <span className={`hx-dot-pill is-${statusTone(status)}`}><i aria-hidden="true" />{status}</span>}
                </li>
              )
            })}
          </ul>
        ) : <ModuleFallback module={currentTab.key} icon={currentTab.icon}>{currentTab.empty}</ModuleFallback>}
      </div>
    </Panel>
  )
}

// "2.4 MB" from a byte count; a size the API already formatted is shown as is.
const fileSize = (row) => {
  const value = hrField(row, 'fileSize', 'size', 'sizeInBytes', 'fileSizeBytes')
  if (typeof value === 'string' && /[a-z]/i.test(value)) return value.trim()
  const bytes = Number(value)
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** power).toFixed(power ? 1 : 0)} ${units[power]}`
}

/** Downloads one shared resource through the same endpoint as the Resources module. */
function ResourceDownload({ id, name }) {
  const [busy, setBusy] = useState(false)
  const download = async () => {
    setBusy(true)
    try {
      downloadHrFile(await hrRequest('GET', `${hrModuleApi('resources').detail}/download`, { id, binary: true }), name)
    } catch (error) {
      toast.error(hrError(error, 'resources'), { id: 'hr-dashboard-resource-download' })
    } finally {
      setBusy(false)
    }
  }
  return (
    <button type="button" className="hx-icon-btn" onClick={download} disabled={busy} aria-label={`Download ${name}`} title={`Download ${name}`}>
      <Download aria-hidden="true" />
    </button>
  )
}

export default function HRDashboardOverview({ employees = [], attendance = [], data = {}, errors = [], loading = false, pending = [], failures = {}, onRetry = () => {} }) {
  const { canModule, can } = useHrPermissions()
  const { hasPermission, can: canPlatformAction } = usePermission()
  const ready = (key) => !pending.includes(key) && !errors.includes(key)

  const showAnnouncements = hasPermission('announcements') && canPlatformAction('announcements', 'view')
  const announcements = activeAnnouncements(data.announcements || [])
  // One reference time per mount, so re-renders don't shift the windows below.
  const [renderedAt] = useState(() => Date.now())
  const weekAgo = renderedAt - 7 * 86400000
  const recentAnnouncements = announcements.filter((row) => new Date(hrField(row, 'publishDate') || 0).getTime() >= weekAgo)
  const eventModules = [hasPermission('calendar') && 'calendar', hasPermission('schedule') && 'schedule'].filter(Boolean)
  const eventSources = { calendar: hasPermission('calendar') ? data.calendar || [] : [], schedule: hasPermission('schedule') ? data.schedule || [] : [] }
  const events = upcomingItems(eventSources, new Date(renderedAt), 2)
  const todayKey = dayKey(new Date(renderedAt))
  const eventsToday = upcomingItems(eventSources, new Date(new Date(renderedAt).setHours(0, 0, 0, 0)), 500)
    .filter((item) => dayKey(item.start) === todayKey).length
  const pendingLeaves = (data.leave || []).filter((row) => leaveStatusKey(hrField(row, 'status')) === 'pending').length
  const pendingReviews = (data.performance || []).filter((row) => /pending|draft|in.?progress|due/i.test(String(hrField(row, 'status') || ''))).length

  const glance = [
    canModule('leave') && { key: 'leave', module: 'leave', label: 'Leave Requests', sub: 'Pending approval', value: pendingLeaves, icon: CalendarClock, tone: 'red', to: E.HR_LEAVE },
    showAnnouncements && { key: 'announcements', module: 'announcements', label: 'New Announcements', sub: announcements[0] ? <>Latest: <span>{text(announcements[0], 'title')}</span></> : 'This week', value: recentAnnouncements.length, icon: Megaphone, tone: 'blue', to: E.ANNOUNCEMENTS },
    eventModules.length > 0 && { key: 'events', module: eventModules, label: 'Scheduled Events', sub: 'Today', value: eventsToday, icon: CalendarDays, tone: 'purple', to: E.CALENDAR },
    canModule('performance') && { key: 'performance', module: 'performance', label: 'Performance Reviews', sub: 'Pending', value: pendingReviews, icon: BarChart3, tone: 'orange', to: E.HR_PERFORMANCE },
  ].filter(Boolean)

  const training = [
    { key: 'batches', title: 'Batches', allowed: hasPermission('batches'), to: E.BATCHES, name: ['batchName', 'name'], empty: 'No batches available.', icon: Layers3 },
    { key: 'syllabus', title: 'Assigned Syllabus', allowed: hasPermission('resources'), to: E.SYLLABUS, name: ['courseName', 'syllabusName', 'title'], empty: 'No syllabus assigned yet.', icon: BookOpen },
  ].filter((item) => item.allowed)
  const showResources = hasPermission('resources')

  const actions = [
    { label: 'Add Employee', to: E.HR_EMPLOYEES, module: 'employees', action: 'add', create: true, icon: UserPlus, tone: 'blue' },
    { label: 'Review Leave Requests', to: E.HR_LEAVE, module: 'leave', icon: FileText, tone: 'orange' },
    { label: 'View Attendance', to: E.HR_ATTENDANCE, module: 'attendance', icon: CalendarDays, tone: 'purple' },
    { label: 'Create Announcement', to: E.ANNOUNCEMENTS, module: 'announcements', action: 'add', create: true, icon: Megaphone, tone: 'green' },
    { label: 'Schedule Event', to: E.CALENDAR, module: 'calendar', action: 'add', create: true, icon: CalendarClock, tone: 'red' },
  ].filter((item) => canModule(item.module) && (!item.action || can(item.module, item.action)))

  return (
    <ModuleState.Provider value={{ onRetry, pending, failures, errors, loading }}>
      {(canModule('employees') || canModule('attendance') || glance.length > 0) && (
        <div className="hx-grid hx-grid--analytics">
          {canModule('employees') && <Departments employees={employees} departments={data.departments || []} />}
          {canModule('attendance') && <Attendance history={attendance} />}
          <TodayAtAGlance rows={glance} />
        </div>
      )}

      {canModule('leave') && <LeaveQueue rows={data.leave || []} />}

      <div className="hx-grid hx-grid--four">
        {eventModules.length > 0 && <UpcomingEvents events={events} modules={eventModules} />}
        {training.length > 0 && <TrainingPanel tabs={training} data={data} />}
        {canModule('performance') && (
          <Panel title="Recent Performance Reviews" icon={Star} tone="green" to={E.HR_PERFORMANCE}>
            {ready('performance') && data.performance?.length ? (
              <ul className="hx-reviews">
                {data.performance.slice(0, 4).map((row, index) => {
                  const score = text(row, 'performanceScore')
                  const rating = text(row, 'rating', 'performanceRating', 'grade')
                  return (
                    <li key={String(hrField(row, 'performanceId', 'id') ?? index)}>
                      <strong title={text(row, 'employeeName')}>{text(row, 'employeeName') || 'Employee'}</strong>
                      <small>{[text(row, 'period'), score && `Score ${score}`].filter(Boolean).join(' · ')}</small>
                      {rating && <span className={`hx-pill ${/average|fair/i.test(rating) ? 'is-orange' : /poor|low/i.test(rating) ? 'is-red' : 'is-green'}`}>{rating}</span>}
                    </li>
                  )
                })}
              </ul>
            ) : <ModuleFallback module="performance" icon={Star}>No performance reviews yet.</ModuleFallback>}
          </Panel>
        )}
        {showResources && (
          <Panel title="Resources" icon={FolderOpen} tone="red" to={E.RESOURCES}>
            {ready('resources') && data.resources?.length ? (
              <ul className="hx-files">
                {data.resources.slice(0, 3).map((row, index) => {
                  const id = hrField(row, 'resourceId', 'id')
                  const name = text(row, 'name', 'title') || 'Resource'
                  return (
                    <li key={String(id ?? index)}>
                      <span className={`hx-files__icon${index % 2 ? ' is-blue' : ''}`} aria-hidden="true"><FileText /></span>
                      <span className="hx-list__main"><strong title={name}>{name}</strong><small>{fileSize(row) || [text(row, 'category'), text(row, 'fileType')].filter(Boolean).join(' · ')}</small></span>
                      {id != null && <ResourceDownload id={id} name={name} />}
                    </li>
                  )
                })}
              </ul>
            ) : <ModuleFallback module="resources" icon={FolderOpen}>No shared resources yet.</ModuleFallback>}
          </Panel>
        )}
      </div>

      {actions.length > 0 && (
        <section className="hx-quick" aria-label="Quick actions">
          <h2><Zap aria-hidden="true" />Quick Actions</h2>
          <div>
            {actions.map(({ label, to, create, icon: Icon, tone }) => (
              <Link key={label} to={to} state={create ? { openAdd: true } : undefined} className={`is-${tone}`}>
                <Icon aria-hidden="true" />{label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </ModuleState.Provider>
  )
}
