import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, FileText, FolderKanban, MessageSquareText, UserRound, Users, Video } from 'lucide-react'
import CourseLogo from '@features/student/components/CourseLogo'
import { WEEKDAY_THEMES } from '@features/student/constants/weekdayThemes'
import StudentPageBanner from '@features/student/components/StudentPageBanner'
import { STUDENT_BANNERS } from '@features/student/constants/studentBanners'
import { useStudentClassScope } from '@features/student/hooks/useStudentClassScope'
import { partitionClassesByScope } from '@features/student/utils/studentClassAccess'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { resolveStudentClasses } from '@features/student/utils/resolveStudentClasses'
import useClassRefresh from '@features/student/hooks/useClassRefresh'
import { getStudentJoinState } from '@features/live-classes/utils/liveClassMappers'
import { ROUTES } from '@shared/constants/routeConstants'
import { getApiErrorMessage } from '@shared/services/apiServices'
import toast from 'react-hot-toast'
import { useAuth } from '@shared/hooks/useAuth'

// The class lists the schedule reads. Only the general list carries courseId
// and batchId; the status lists (upcoming/live/completed/today) return names
// only, so their rows can be matched only through the student's attendance.
const CLASS_SOURCES = {
  list: { path: '/api/v1/live-classes', load: () => liveClassService.list({}) },
  upcoming: { path: '/api/v1/live-classes/upcoming', load: () => liveClassService.upcoming({}) },
  live: { path: '/api/v1/live-classes/live', load: () => liveClassService.live({}) },
  completed: { path: '/api/v1/live-classes/completed', load: () => liveClassService.completed({}) },
  today: { path: '/api/v1/live-classes/today', load: () => liveClassService.today({}) },
}

// Development-only diagnostics: ids and statuses, never tokens or personal data.
const debugLog = (stage, ...details) => {
  if (!import.meta.env.DEV) return
  const [first, ...rest] = details
  if (Array.isArray(first)) {
    console.groupCollapsed(`[STUDENT CALENDAR][${stage}] ${first.length} classes`)
    console.table(first)
    console.groupEnd()
  } else console.log(`[STUDENT CALENDAR][${stage}]`, first, ...rest)
}
const debugClass = (item = {}) => ({
  liveClassId: item.liveClassId ?? item.id ?? null,
  title: item.classTitle ?? item.title ?? null,
  courseId: item.courseId ?? null,
  batchId: item.batchId ?? null,
  status: item.status ?? null,
})
const withheldReason = (item, scope) => {
  const courseId = item.courseId ? String(item.courseId) : ''
  if (!courseId && !item.batchId && !scope.classRefs.has(String(item.liveClassId ?? item.id))) return 'missing-class-enrollment-ids'
  if (courseId && !scope.courseIds.has(courseId)) return 'course-not-enrolled'
  return 'batch-not-enrolled-for-course'
}

const SCHEDULE_FEATURES = [
  { Icon: Video, title: 'Live Classes', tone: 'blue' },
  { Icon: MessageSquareText, title: 'Ask Doubts', tone: 'orange' },
  { Icon: Users, title: 'Interactive Sessions', tone: 'green' },
  { Icon: FileText, title: 'Class Resources', tone: 'violet' },
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DEFAULT_START_HOUR = 6
const DEFAULT_END_HOUR = 18
const isDeadline = (event) => ['assignment', 'assessment', 'project'].includes(event.kind)
const recordingUrlFrom = (payload) => {
  const sources = [payload, payload?.data, payload?.result, payload?.recording, payload?.data?.recording, payload?.result?.recording]
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue
    const url = source.recordingUrl || source.recordingLink || source.recording?.url || source.url || source.link
    if (url) return String(url).trim()
  }
  return ''
}
const isLiveClassStatus = (status) => ['live', 'in-progress', 'started'].includes(String(status || '').trim().toLowerCase())
const formatClassTime = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return String(value || '')
  const hours = Number(match[1])
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`
}
const formatClassTimeRange = (value) => String(value || '').split(' - ').map(formatClassTime).join(' - ')

const localDateKey = (value) => {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value)
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const timeParts = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})(?:\s*([AP]M))?/i)
  if (!match) return null
  let hour = Number(match[1])
  const minute = Number(match[2])
  const meridiem = match[3]?.toUpperCase()
  if (meridiem === 'PM' && hour < 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : null
}

const toCalendarEvent = (item) => {
  const startDate = localDateKey(item.startDate || item.startAt || item.scheduledDate || item.classDate || item.dateKey || item.date)
  const startTime = timeParts(item.startTime || item.startAt || item.time)
  return {
    title: item.title || item.courseName || 'Scheduled class',
    time: formatClassTimeRange(item.timeLabel || item.startTime || ''),
    kind: 'class',
    liveClassId: item.id,
    // Full normalized class, handed to the classroom page so it has the
    // course/batch/mentor details and the stored meeting link.
    source: item,
    status: item.status,
    meetingUrl: item.meetingUrl || item.meetingLink || item.joinUrl || item.joinLink || item.virtualRoomUrl || item.classUrl || item.meeting?.url || item.meeting?.meetingUrl || item.meeting?.joinUrl || item.url,
    recordingUrl: item.recordingUrl || item.recordingLink || item.recording?.url,
    startDate,
    mentorName: item.mentorName || '',
    course: item.courseName || item.course || '',
    startTime: formatClassTime(item.startTime || ''),
    startHour: startTime?.hour ?? null,
    startMinute: startTime?.minute ?? null,
  }
}

const hourLabel = (hour) => `${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}`

const calendarHours = (events) => {
  const eventHours = events.map((event) => event.startHour).filter(Number.isInteger)
  const start = eventHours.length ? Math.min(DEFAULT_START_HOUR, ...eventHours) : DEFAULT_START_HOUR
  const end = eventHours.length ? Math.max(DEFAULT_END_HOUR, ...eventHours) : DEFAULT_END_HOUR
  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}


function createMonth(calendarDate, calendarEvents) {
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOffset = new Date(year, month, 1).getDay()
  return Array.from({ length: Math.ceil((firstDayOffset + daysInMonth) / 7) * 7 }, (_, index) => {
    const date = index - firstDayOffset + 1
    const real = new Date(year, month, date)
    if (date < 1 || date > daysInMonth) return { date: real.getDate(), muted: true, events: [] }
    const dateKey = localDateKey(real)
    const apiEvents = calendarEvents.filter((event) => event.startDate === dateKey)
    return { date, dateKey, events: apiEvents }
  })
}

export default function StudentCalendar() {
  const navigate = useNavigate()
  // Every class shown here (month/week/day, Today's Live Classes, Upcoming,
  // Selected Date) comes from this one list, filtered to the student's own
  // approved enrollments. The live-class endpoints take no student filter, so
  // their rows are never trusted as already scoped.
  const scope = useStudentClassScope()
  const { user, role } = useAuth()
  const studentId = user?.studentId ?? user?.student?.studentId ?? null
  const [view, setView] = useState('month')
  const [liveClasses, setLiveClasses] = useState([])
  const [scopeWarning, setScopeWarning] = useState('')
  const refreshedAt = useClassRefresh()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [openingClassId] = useState(null)
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date().getDate())
  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setLoading(true)
      setLoadError('')
      // Never keep a previous student's classes on screen while reloading.
      setLiveClasses([])
    })
    if (!scope.ready) return () => { active = false }
    if (scope.error) {
      queueMicrotask(() => {
        if (!active) return
        setLoadError(scope.error)
        setLoading(false)
      })
      return () => { active = false }
    }
    // liveClassService.list() (GET /api/v1/live-classes) 403s for some student
    // accounts; upcoming/live/completed are the status-scoped endpoints that
    // succeed. Promise.allSettled tolerates any one of them failing.
    const endpoints = Object.keys(CLASS_SOURCES)
    debugLog('AUTH', { studentId, role })
    debugLog('ENROLLMENT', {
      authorizedCourseIds: [...scope.courseIds],
      authorizedBatchIds: [...scope.batchIds],
      batchesByCourse: Object.fromEntries([...scope.batchesByCourse].map(([course, batches]) => [course, [...batches]])),
    })
    endpoints.forEach((name) => debugLog('REQUEST', CLASS_SOURCES[name].path))
    Promise.allSettled(endpoints.map((name) => CLASS_SOURCES[name].load())).then(async (sources) => {
      if (!active) return
      sources.forEach((result, index) => {
        const { path } = CLASS_SOURCES[endpoints[index]]
        if (result.status === 'fulfilled') debugLog('RESPONSE', path, { status: 'ok', records: result.value.length, classes: result.value.map(debugClass) })
        else debugLog('ERROR', path, { status: result.reason?.response?.status ?? 'network' })
      })
      const rows = sources.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      const unique = await resolveStudentClasses(rows)
      if (!active) return
      if (!unique.length && sources.every(result => result.status === 'rejected')) {
        // A failed request is never shown as an empty schedule.
        const forbidden = sources.some((result) => result.reason?.response?.status === 403)
        setLoadError(forbidden
          ? "You don't have permission to access this class schedule."
          : getApiErrorMessage(sources[0].reason, 'Unable to load classes. Please try again.'))
        debugLog('FINAL', { visible: 0, reason: forbidden ? 'all-class-requests-forbidden' : 'all-class-requests-failed' })
        setLiveClasses([])
        setLoading(false)
        return
      }
      const { allowed, blocked } = partitionClassesByScope(unique, { courseIds: scope.courseIds, batchIds: scope.batchIds, batchesByCourse: scope.batchesByCourse, classRefs: scope.classRefs })
      // Withheld classes are never shown; this only records why.
      const matches = [
        ...allowed.map((item) => ({ ...debugClass(item), decision: 'shown', reason: 'enrolled' })),
        ...blocked.map((item) => ({ ...debugClass(item), decision: 'withheld', reason: withheldReason(item, scope) })),
      ]
      debugLog('CLASS MATCH', matches)
      debugLog('FILTER', matches.reduce((counts, { reason }) => ({ ...counts, [reason]: (counts[reason] ?? 0) + 1 }), {}))
      const missingIds = blocked.filter((item) => withheldReason(item, scope) === 'missing-class-enrollment-ids')
      setScopeWarning(missingIds.length
        ? `${missingIds.length} ${missingIds.length === 1 ? 'class is' : 'classes are'} hidden because the schedule service didn't say which batch ${missingIds.length === 1 ? 'it belongs' : 'they belong'} to. Contact your organization administrator if a class you expect is missing.`
        : '')
      if (!allowed.length && scope.noEnrollments) {
        setLoadError("No approved course enrollment was found on your account, so there are no classes to show. Contact your organization if this is wrong.")
      }
      debugLog('FINAL', { visible: allowed.length, withheld: blocked.length })
      setLiveClasses(allowed)
      setLoading(false)
    })
    return () => { active = false }
  }, [scope, refreshedAt, studentId, role])
  const calendarEvents = useMemo(() => liveClasses.map(toCalendarEvent).filter((event) => event.startDate), [liveClasses])
  const hours = useMemo(() => calendarHours(calendarEvents), [calendarEvents])
  const days = useMemo(() => createMonth(calendarDate, calendarEvents), [calendarDate, calendarEvents])
  const titleDate = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const title = view === 'month' ? titleDate : view === 'week' ? titleDate : calendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
  const openEvent = async (event) => {
    if (event.target) return navigate(event.target)
    if (event.liveClassId && openingClassId === event.liveClassId) return
    if (!event.liveClassId) {
      toast.error('This class does not have a meeting link yet.', { id: 'student-live-class-open' })
      return
    }
    const status = String(event.status || '').trim().toLowerCase()
    if (status === 'cancelled' || status === 'canceled') {
      toast('This class was cancelled and cannot be joined.', { id: 'student-live-class-open' })
      return
    }
    if (status === 'completed') {
      if (event.recordingUrl) {
        window.open(event.recordingUrl, '_blank', 'noopener,noreferrer')
        return
      }
      try {
        const recording = await liveClassService.getRecording(event.liveClassId)
        const recordingUrl = recordingUrlFrom(recording)
        if (recordingUrl) {
          window.open(recordingUrl, '_blank', 'noopener,noreferrer')
          return
        }
      } catch {
        // A missing recording is a valid state for a completed class.
      }
      toast('This class has ended. The recording will be available when published.', { id: 'student-live-class-open' })
      return
    }
    // Live classes open the embedded Jitsi classroom. The click records
    // nothing — /api/jitsi-attendance/join is sent only when Jitsi reports the
    // student inside the conference (see JitsiMeeting.jsx).
    const joinState = getStudentJoinState(event)
    if (!joinState.canJoin) {
      toast(joinState.message || 'This class cannot be joined right now.', { id: 'student-live-class-open' })
      return
    }
    navigate(ROUTES.STUDENT.CLASS_JOIN.replace(':classId', encodeURIComponent(event.liveClassId)), {
      state: { liveClass: event.source || { ...event, id: event.liveClassId } },
    })
  }

  const goToToday = () => {
    const today = new Date()
    setCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today.getDate())
  }
  const shiftMonth = (step) => {
    const today = new Date()
    const next = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + step, 1)
    setCalendarDate(next)
    setSelectedDate(next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth() ? today.getDate() : 1)
  }
  const todayKey = localDateKey(new Date())
  const sortByTime = (a, b) => `${a.startDate} ${String(a.startHour ?? 99).padStart(2, '0')}:${String(a.startMinute ?? 0).padStart(2, '0')}`.localeCompare(`${b.startDate} ${String(b.startHour ?? 99).padStart(2, '0')}:${String(b.startMinute ?? 0).padStart(2, '0')}`)
  const todaysClasses = calendarEvents.filter((event) => event.startDate === todayKey).sort(sortByTime)
  const upcomingClasses = calendarEvents
    .filter((event) => event.startDate > todayKey && !['cancelled', 'canceled', 'completed'].includes(String(event.status || '').toLowerCase()))
    .sort(sortByTime)
    .slice(0, 3)
  const selectedKey = localDateKey(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedDate))
  const selectedEvents = calendarEvents.filter((event) => event.startDate === selectedKey).sort(sortByTime)

  const jumpTo = (dateKey) => {
    const [year, month, day] = String(dateKey).split('-').map(Number)
    if (!year) return
    setCalendarDate(new Date(year, month - 1, 1))
    setSelectedDate(day)
    setView('month')
  }

  return <main className="ksl-page student-learning-calendar w-full px-2 py-2 sm:px-3">
    <StudentPageBanner
      banner={STUDENT_BANNERS.classSchedule}
      icon={Video}
      eyebrow="Live Classes"
      title="Learn Live, Build"
      highlight="Real Skills!"
      description={<>Attend live classes, interact with your mentor, ask doubts and<br className="ksl-hide-sm" /> stay ahead in your learning journey.</>}
      features={SCHEDULE_FEATURES}
    />
    <div className="ksx-stack">
      <div className="ksx-split">
        <section className="ksl-card">
          <div className="ksx-head">
            <div className="ksx-head__main">
              <span className="ksx-head__icon ksl-tone--navy"><CalendarDays /></span>
              <div><h2 className="ksx-head__title">Learning Calendar</h2><p className="ksx-head__sub">View your scheduled live classes, assignments, assessments and mentor sessions.</p></div>
            </div>
            <div className="ksx-seg" aria-label="Calendar view">
              {['month', 'week', 'day'].map((item) => <button key={item} type="button" onClick={() => setView(item)} aria-pressed={view === item} style={{ textTransform: 'capitalize' }}>{item}</button>)}
            </div>
          </div>
          <div className="ksx-cal-bar">
            <button type="button" onClick={goToToday} className="ksx-btn-soft">Today</button>
            <div className="ksx-cal-bar__center">
              <button type="button" className="ksx-icon-btn" aria-label="Previous month" onClick={() => shiftMonth(-1)}><ChevronLeft /></button>
              <h3 className="ksx-cal-bar__title"><CalendarDays aria-hidden="true" />{title}</h3>
              <button type="button" className="ksx-icon-btn" aria-label="Next month" onClick={() => shiftMonth(1)}><ChevronRight /></button>
            </div>
            <span />
          </div>
          {scopeWarning && <div role="alert" className="ksx-alert ksx-alert--error" style={{ marginTop: '1rem' }}>{scopeWarning}</div>}
          {loadError ? <div className="ksx-alert ksx-alert--error" style={{ marginTop: '1rem' }}>{loadError}</div>
            : loading ? <p className="ksx-muted-sm" style={{ padding: '2rem', textAlign: 'center' }}>Loading your classes...</p>
              : <>{!liveClasses.length && !scopeWarning && <p className="ksx-muted-sm" style={{ padding: '1rem 0 0', textAlign: 'center' }}>No classes scheduled for your enrolled batches.</p>}
              {view === 'month' ? <MonthView days={days} selectedDate={selectedDate} todayKey={todayKey} onSelectDate={setSelectedDate} onOpenEvent={openEvent} />
                : <ScheduleView view={view} selectedDate={selectedDate} calendarDate={calendarDate} calendarEvents={calendarEvents} hours={hours} onOpenEvent={openEvent} />}</>}
          <SelectedDateAgenda selectedKey={selectedKey} items={selectedEvents} onOpenEvent={openEvent} />
        </section>

        <div className="ksx-col ksx-side">
          <section className="ksl-card">
            <div className="ksx-head"><h2 className="ksx-head__title">Today&apos;s Live Classes</h2><button type="button" className="ksx-pill-link" onClick={() => { goToToday(); setView('day') }}>View All<ArrowRight /></button></div>
            {todaysClasses.length ? <ul className="ksx-list ksx-list--cards">{todaysClasses.map((event) => (
              <li key={event.liveClassId} role="button" tabIndex={0} aria-label={`Open ${event.title}`} onClick={() => openEvent(event)} onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter') openEvent(event) }} className={isLiveClassStatus(event.status) ? 'is-live' : ''}>
                <CourseLogo name={`${event.title} ${event.course || ''}`} size="sm" />
                <div className="ksx-list__body">
                  <p className="ksx-list__title">{event.title}</p>
                  <p className="ksx-list__meta">{openingClassId === event.liveClassId ? 'Opening…' : event.time || 'Time TBA'}{isLiveClassStatus(event.status) && <span className="ksx-live-dot">Live</span>}</p>
                  {event.mentorName && <p className="ksx-list__sub"><UserRound aria-hidden="true" />{event.mentorName}</p>}
                </div>
                <span className="ksx-round-chevron"><ChevronRight /></span>
              </li>
            ))}</ul> : <p className="ksx-muted-sm">No live classes scheduled for today.</p>}
          </section>
          <section className="ksl-card">
            <div className="ksx-head"><h2 className="ksx-head__title">Upcoming Classes</h2><button type="button" className="ksx-pill-link" onClick={() => setView('week')}>View All<ArrowRight /></button></div>
            {upcomingClasses.length ? <ul className="ksx-list ksx-list--cards">{upcomingClasses.map((event) => (
              <li key={event.liveClassId} role="button" tabIndex={0} onClick={() => jumpTo(event.startDate)} onKeyDown={(keyEvent) => { if (keyEvent.key === 'Enter') jumpTo(event.startDate) }}>
                <CourseLogo name={`${event.title} ${event.course || ''}`} size="sm" />
                <div className="ksx-list__body">
                  <p className="ksx-list__title">{event.title}</p>
                  <p className="ksx-list__meta">{relativeDay(event.startDate)}{event.startTime ? ` • ${event.startTime}` : ''}</p>
                  {event.mentorName && <p className="ksx-list__sub"><UserRound aria-hidden="true" />{event.mentorName}</p>}
                </div>
                <span className="ksx-round-chevron"><ChevronRight /></span>
              </li>
            ))}</ul> : <p className="ksx-muted-sm">No upcoming classes yet.</p>}
          </section>
        </div>
      </div>
      <div className="ksl-card"><CalendarLegend /></div>
    </div>
  </main>
}

function relativeDay(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (localDateKey(tomorrow) === dateKey) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

const MAX_CELL_EVENTS = 3

function MonthView({ days, selectedDate, todayKey, onSelectDate, onOpenEvent }) {
  return <div className="ksx-cal"><div className="ksx-cal__grid">
    {WEEKDAY_THEMES.map(({ short, tone, Icon }) => <div key={short} className={`ksx-cal__dow ksx-cal__dow--${tone}`}><Icon aria-hidden="true" />{short}</div>)}
    {days.map((day, index) => {
      if (day.muted) return <div key={index} className="ksx-cal__cell ksx-cal__cell--muted"><span className="ksx-cal__num">{day.date}</span></div>
      const selected = day.date === selectedDate
      const extra = day.events.length - MAX_CELL_EVENTS
      return <div key={index} role="button" tabIndex={0} onClick={() => onSelectDate(day.date)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelectDate(day.date) }}
        className={`ksx-cal__cell ${selected ? 'ksx-cal__cell--selected' : ''} ${day.dateKey === todayKey ? 'ksx-cal__cell--today' : ''}`}>
        <span className="ksx-cal__num">{day.date}</span>
        <div className="ksx-cal__events">
          {day.events.slice(0, MAX_CELL_EVENTS).map((event, eventIndex) => <EventChip key={event.liveClassId || `${event.title}-${eventIndex}`} event={event} onOpen={onOpenEvent} />)}
          {extra > 0 && <span className="ksx-cal__more">+{extra} more</span>}
        </div>
      </div>
    })}
  </div></div>
}

function ScheduleView({ view, selectedDate, calendarDate, calendarEvents, hours, onOpenEvent }) {
  const anchor = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), selectedDate)
  const weekStart = new Date(anchor)
  weekStart.setDate(anchor.getDate() - anchor.getDay())
  const columns = view === 'week'
    ? DAYS.map((day, index) => ({ day, date: new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index) }))
    : [{ day: DAYS[anchor.getDay()], date: anchor }]
  return <div className="ksx-cal"><div className="ksx-hours" style={{ gridTemplateColumns: `78px repeat(${columns.length}, minmax(120px, 1fr))` }}>
    <div className="ksx-hours__head" />
    {columns.map(({ day, date }) => <div key={date.toISOString()} className="ksx-hours__head">{day} {date.getDate()}/{date.getMonth() + 1}</div>)}
    {hours.map((hour) => <TimeRow key={hour} hour={hour} columns={columns} calendarEvents={calendarEvents} onOpenEvent={onOpenEvent} />)}
  </div></div>
}

function TimeRow({ hour, columns, calendarEvents, onOpenEvent }) {
  return <>
    <div className="ksx-hours__time">{hourLabel(hour)}</div>
    {columns.map(({ date }) => {
      const dateKey = localDateKey(date)
      const events = calendarEvents.filter((event) => event.startDate === dateKey && event.startHour === hour)
      return <div key={date.toISOString()} className="ksx-cal__events">{events.map((event, index) => <EventChip key={event.liveClassId || `${event.title}-${index}`} event={event} onOpen={onOpenEvent} />)}</div>
    })}
  </>
}

function EventChip({ event, onOpen }) {
  const status = String(event.status || '').toLowerCase()
  const variant = event.kind !== 'class' ? event.kind : isLiveClassStatus(status) ? 'live' : status === 'completed' ? 'completed' : 'class'
  return <button type="button" title={`${event.time ? `${event.time} ` : ''}${event.title}`} onClick={(clickEvent) => { clickEvent.stopPropagation(); onOpen(event) }} className={`ksx-event ksx-event--${variant}`}>
    <i aria-hidden="true" />{event.time || event.title}
  </button>
}

function SelectedDateAgenda({ selectedKey, items, onOpenEvent }) {
  const [year, month, day] = selectedKey.split('-').map(Number)
  const label = new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const deadlines = items.filter(isDeadline)
  return <section className="ksx-selected">
    <span className="ksx-head__icon ksl-tone--navy"><CalendarDays /></span>
    <div className="ksx-selected__copy">
      <p className="ksx-list__meta">Selected Date</p>
      <h3 className="ksx-head__title">{label}</h3>
      {!items.length && <p className="ksx-list__sub">No classes, assignments, quizzes, assessments, or projects on this date.</p>}
    </div>
    <span className="ksx-chip ksl-tone--navy">{deadlines.length} deadline{deadlines.length === 1 ? '' : 's'}</span>
    {items.length > 0 && <div className="ksx-selected__items">
      {items.map((item, index) => {
        const Icon = item.kind === 'assessment' ? ClipboardCheck : item.kind === 'project' ? FolderKanban : item.kind === 'assignment' ? FileText : Video
        const tone = item.kind === 'assessment' ? 'orange' : item.kind === 'project' ? 'violet' : item.kind === 'assignment' ? 'red' : 'blue'
        return <button type="button" key={item.liveClassId || `${item.title}-${index}`} onClick={() => onOpenEvent(item)} className="ksl-card" style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.7rem', textAlign: 'left', cursor: 'pointer' }}>
          <span className={`ksl-tile-icon ksl-tone--${tone}`}><Icon /></span>
          <span className="ksx-list__body"><span className="ksx-list__title" style={{ display: 'block' }}>{item.title}</span><span className="ksx-list__sub" style={{ display: 'block' }}>{item.course || item.mentorName || 'Live class'} · {item.time}</span></span>
        </button>
      })}
    </div>}
  </section>
}

function CalendarLegend() {
  return <div className="ksx-legend-row">
    <span><i style={{ background: '#1d6cf0' }} />Live class</span>
    <span><i style={{ background: '#f39924' }} />Assessment / quiz</span>
    <span><i style={{ background: '#e5484d' }} />Assignment / project deadline</span>
    <span><i style={{ background: '#7c3aed' }} />Mentor session</span>
  </div>
}
