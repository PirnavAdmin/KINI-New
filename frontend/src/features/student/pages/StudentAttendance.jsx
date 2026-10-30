import { useCallback, useEffect, useMemo, useState } from 'react'
import { BarChart3, BookOpen, CalendarCheck, CalendarDays, CircleCheckBig, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, Filter, GraduationCap, RefreshCw, Search, Target, Trophy, UserRound, XCircle } from 'lucide-react'
import StudentPageBanner from '@features/student/components/StudentPageBanner'
import StudentStatCard from '@features/student/components/StudentStatCard'
import CourseLogo from '@features/student/components/CourseLogo'
import { WEEKDAY_THEMES } from '@features/student/constants/weekdayThemes'
import { STUDENT_BANNERS } from '@features/student/constants/studentBanners'
import { useAuth } from '@shared/hooks/useAuth'
import { attendanceService } from '@shared/services/attendanceService'
import { getStudentClassJoinAttendance } from '@shared/services/studentClassService'
import { triggerFileDownload } from '@shared/utils/download'
import toast from 'react-hot-toast'

const ATTENDANCE_FEATURES = [
  { Icon: CalendarCheck, title: 'Track', text: 'Attendance', tone: 'green' },
  { Icon: BarChart3, title: 'View', text: 'Reports', tone: 'orange' },
  { Icon: Target, title: 'Maintain', text: 'Consistency', tone: 'violet' },
  { Icon: Trophy, title: 'Achieve', text: 'Your Goals', tone: 'blue' },
]
const PERIODS = [{ id: 'week', label: 'This week' }, { id: 'month', label: 'This month' }, { id: 'all', label: 'All time' }]
const DEMO_RECORDS = [
  { attendanceId: 1, attendanceDate: new Date(Date.now() - 2 * 86400000).toISOString(), className: 'React Hooks', status: 'Present' },
  { attendanceId: 2, attendanceDate: new Date(Date.now() - 3 * 86400000).toISOString(), className: 'JavaScript ES6+', status: 'Present' },
  { attendanceId: 3, attendanceDate: new Date(Date.now() - 4 * 86400000).toISOString(), className: 'Development Environment Setup', status: 'Present' },
  { attendanceId: 4, attendanceDate: new Date(Date.now() - 5 * 86400000).toISOString(), className: 'Welcome to the Course', status: 'Absent' },
  { attendanceId: 5, attendanceDate: new Date(Date.now() - 8 * 86400000).toISOString(), className: 'Course Orientation', status: 'Present' },
]

const calendarDateKey = (value) => {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/)
    if (match) return match[1]
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const normalizeRecord = (record, index) => ({
  ...record,
  id: record.attendanceId ?? record.id ?? index,
  date: calendarDateKey(record.liveClass?.scheduledDate ?? record.attendanceDate ?? record.date ?? record.classDate ?? record.createdAt),
  lesson: record.liveClass?.classTitle ?? record.className ?? record.lessonName ?? record.liveClassName ?? record.courseName ?? record.subject ?? 'Class session',
  status: (() => {
    const value = String(record.status ?? record.attendanceStatus ?? '').trim()
    const key = value.toLowerCase().replaceAll('_', ' ').replaceAll('-', ' ')
    if (key === 'on leave' || key === 'leave') return 'Leave'
    if (key === 'present' || key === 'late' || key === 'absent' || key === 'pending') return key[0].toUpperCase() + key.slice(1)
    if (key === 'pending') return 'Pending'
    return value || (record.isPresent ? 'Present' : 'Pending')
  })(),
})
const attendanceClassKey = (record) => String(record.liveClassId ?? record.liveClass?.liveClassId ?? record.classId ?? record.id ?? record.attendanceId ?? '')
const mergeAttendanceRecords = (serverRows = [], joinedRows = []) => {
  const normalizedServerRows = serverRows.filter((record) => record && record.isDeleted !== true).map(normalizeRecord)
  const merged = [...normalizedServerRows, ...joinedRows.map(normalizeRecord)]
  const seen = new Set()
  return merged.filter((record) => {
    const key = attendanceClassKey(record)
    if (key && seen.has(key)) return false
    if (!key) return true
    seen.add(key)
    return true
  })
}
const startOfWeek = (date) => { const value = new Date(date); const day = (value.getDay() + 6) % 7; value.setDate(value.getDate() - day); value.setHours(0, 0, 0, 0); return value }
const inPeriod = (record, period) => {
  if (period === 'all') return true
  const date = record.date
  if (!date) return false
  const now = new Date()
  if (period === 'week') {
    const first = startOfWeek(now)
    const last = new Date(first)
    last.setDate(last.getDate() + 6)
    return date >= calendarDateKey(first) && date <= calendarDateKey(last)
  }
  return date.slice(0, 7) === calendarDateKey(now).slice(0, 7)
}
const statusKey = (status) => String(status || '').trim().toLowerCase()
const hasClassEnded = (record) => {
  const end = record.liveClass?.endTime ?? record.endTime ?? record.classEndTime
  if (!end) return record.date ? record.date < calendarDateKey(new Date()) : false
  const value = new Date(`${record.date}T${String(end).length === 5 ? `${end}:00` : end}`)
  return !Number.isNaN(value.getTime()) && value.getTime() <= Date.now()
}
const formatTime = (value) => {
  if (!value) return ''
  const text = String(value).trim()
  const hm = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AP]M)?$/i)
  if (hm) {
    if (hm[3]) return `${Number(hm[1])}:${hm[2]} ${hm[3].toUpperCase()}`
    const hour = Number(hm[1])
    return `${hour % 12 || 12}:${hm[2]} ${hour >= 12 ? 'PM' : 'AM'}`
  }
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
const recordTime = (record) => {
  const start = formatTime(record.liveClass?.startTime ?? record.startTime ?? record.classStartTime ?? record.joinedAt ?? record.checkInTime)
  const end = formatTime(record.liveClass?.endTime ?? record.endTime ?? record.classEndTime ?? record.leftAt ?? record.checkOutTime)
  return start && end ? `${start} - ${end}` : start || '—'
}
const shortRange = (first, last) => {
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return `${fmt.format(first)} - ${fmt.format(last)}, ${last.getFullYear()}`
}
const isPresent = (status) => ['present', 'late'].includes(String(status).toLowerCase())
const formatDate = (value) => {
  if (!value) return 'Date unavailable'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day))
}

// Dev-only — identifies which fallback in the studentId chain actually
// supplied the value, so a "wrong studentId" theory can be ruled in/out
// from the console instead of guessed at.
const studentIdSource = (user) => {
  if (user?.studentId !== undefined && user?.studentId !== null && user?.studentId !== '') return 'user.studentId'
  if (user?.StudentId != null) return 'user.StudentId'
  if (localStorage.getItem('studentId')) return 'localStorage.studentId'

  return 'none'
}

export default function StudentAttendance() {
  const { user, role } = useAuth()
  const studentId = user?.studentId ?? user?.StudentId ?? user?.student?.studentId ?? user?.student?.id ?? localStorage.getItem('studentId')
  const isDemo = user?.isDemo === true
  const [period, setPeriod] = useState('week')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [tableQuery, setTableQuery] = useState('')
  const [tableStatus, setTableStatus] = useState('all')
  const [tablePage, setTablePage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    if (!import.meta.env.DEV) return
    console.log('[Student Attendance] ID RESOLUTION', {
      userId: user?.userId ?? user?.UserId ?? user?.id ?? null,
      studentId: studentId ?? null,
      role: role ?? null,
      source: studentIdSource(user),
    })
  }, [user, role, studentId])

  const loadAttendance = useCallback(async () => {
    setLoading(true); setError(''); setRecords([])
    if (isDemo) { setRecords(DEMO_RECORDS.map(normalizeRecord)); setLoading(false); return }
    if (!studentId) { setError('Your student profile is unavailable. Please sign in again.'); setLoading(false); return }
    if (import.meta.env.DEV) {
      console.log('[Student Attendance] API CALL START', { studentId: String(studentId), endpoint: '/api/Attendance/student/{studentId}' })
    }
    try {
      const rows = await attendanceService.byStudent(studentId)
      if (import.meta.env.DEV) {
        console.log('[Student Attendance] API CALL SUCCESS', {
          studentId: String(studentId),
          status: 200,
          dataType: Array.isArray(rows) ? 'array' : typeof rows,
          dataKeys: Array.isArray(rows) ? undefined : Object.keys(rows || {}),
          count: Array.isArray(rows) ? rows.length : undefined,
        })
      }
      setRecords(mergeAttendanceRecords(rows, getStudentClassJoinAttendance(studentId)))
    } catch (requestError) {
      const status = requestError?.response?.status
      if (import.meta.env.DEV) {
        console.warn('[Student Attendance] API CALL FAILED', {
          studentId: String(studentId),
          endpoint: '/api/Attendance/student/{studentId}',
          status: status ?? 'network error',
          message: requestError?.message ?? null,
          backendMessage: requestError?.response?.data?.Message ?? requestError?.response?.data?.message ?? null,
          backendError: requestError?.response?.data?.Error ?? requestError?.response?.data?.error ?? null,
        })
      }
      // The locally-cached "joined class" list (see studentClassService.js)
      // is a client-side-only fallback for when the request never reached
      // the server at all — it must never stand in for a real server
      // response. Falling back to it for an actual 401/403/404/500 hid the
      // real failure behind what looked like a normal, if sparse,
      // attendance list.
      if (!requestError?.response) {
        const joinedRecords = getStudentClassJoinAttendance(studentId)
        if (joinedRecords.length) { setRecords(joinedRecords.map(normalizeRecord)); return }
      }
      const message = requestError?.response?.data?.message
        || (status === 401 ? 'Your session has expired. Please sign in again.'
          : status === 403 ? 'You do not have permission to view this attendance.'
            : status === 404 ? 'No attendance record was found.'
              : status ? `Unable to load your attendance (server error ${status}). Please try again.`
                : 'Unable to reach the server. Please check your connection and try again.')
      setError(message)
    } finally { setLoading(false) }
  }, [studentId, isDemo])

  useEffect(() => { queueMicrotask(loadAttendance) }, [loadAttendance])
  const weekStart = useMemo(() => { const date = startOfWeek(new Date()); date.setDate(date.getDate() + weekOffset * 7); return date }, [weekOffset])
  const weekEnd = useMemo(() => { const date = new Date(weekStart); date.setDate(date.getDate() + 6); return date }, [weekStart])
  const visible = useMemo(() => records
    .filter((record) => (period === 'week'
      ? Boolean(record.date) && record.date >= calendarDateKey(weekStart) && record.date <= calendarDateKey(weekEnd)
      : inPeriod(record, period)))
    .map((record) => statusKey(record.status) === 'pending' && hasClassEnded(record) ? { ...record, status: 'Absent' } : record)
    .sort((a, b) => b.date.localeCompare(a.date)), [records, period, weekStart, weekEnd])
  const summary = useMemo(() => {
    const present = visible.filter((record) => statusKey(record.status) === 'present').length
    const late = visible.filter((record) => statusKey(record.status) === 'late').length
    const absent = visible.filter((record) => statusKey(record.status) === 'absent').length
    const total = visible.length
    return { total, present, late, absent, percentage: total ? Math.round(((present + late) / total) * 100) : 0 }
  }, [visible])
  const unavailable = loading || Boolean(error)
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, offset) => { const date = new Date(weekStart); date.setDate(date.getDate() + offset); const dayRecords = records.filter((record) => record.date === calendarDateKey(date)); return { date, records: dayRecords, state: dayRecords.length ? (dayRecords.every((record) => isPresent(record.status)) ? 'present' : 'absent') : 'none' } }), [records, weekStart])
  const noClassDays = weekDays.filter((day) => day.state === 'none').length
  const tableRows = useMemo(() => {
    const value = tableQuery.trim().toLowerCase()
    return visible.filter((record) => {
      if (tableStatus !== 'all' && statusKey(record.status) !== tableStatus) return false
      if (!value) return true
      return [record.lesson, record.courseName, record.liveClass?.courseName].filter(Boolean).join(' ').toLowerCase().includes(value)
    })
  }, [visible, tableQuery, tableStatus])
  const pageCount = Math.max(1, Math.ceil(tableRows.length / pageSize))
  const pagedRows = useMemo(() => tableRows.slice((tablePage - 1) * pageSize, tablePage * pageSize), [tableRows, tablePage])
  useEffect(() => { setTablePage(1) }, [period, tableQuery, tableStatus, weekOffset])
  const downloadReport = () => {
    if (downloading || unavailable) return
    setDownloading(true)
    try {
      const rows = ['Date,Class,Status', ...visible.map((record) => [formatDate(record.date), `"${record.lesson.replaceAll('"', '""')}"`, record.status].join(','))]
      triggerFileDownload(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }), `attendance-${period}-${calendarDateKey(new Date())}.csv`)
      toast.success(`${PERIODS.find((item) => item.id === period)?.label} report downloaded.`)
    } catch {
      toast.error('Unable to download the attendance report.')
    } finally {
      setDownloading(false)
    }
  }

  const periodLabel = PERIODS.find((item) => item.id === period)?.label ?? 'This week'
  const pct = (value) => (summary.total ? `${Math.round((value / summary.total) * 100)}%` : '0%')
  const show = (value) => (unavailable ? '—' : value)
  const todayKey = calendarDateKey(new Date())

  return <main className="ksl-page w-full px-2 py-2 sm:px-3">
    <StudentPageBanner
      banner={STUDENT_BANNERS.attendance}
      icon={CalendarCheck}
      eyebrow="Attendance"
      title="Show Up Today,"
      highlight="Build a Better Tomorrow!"
      description={<>Keep track of your class attendance, stay consistent and<br className="ksl-hide-sm" /> make steady progress towards your learning goals.</>}
      features={ATTENDANCE_FEATURES}
    />

    <div className="ksx-stack">
      <div className="ksx-split ksx-split--wide">
        <div className="ksx-col">
          <section className="ksl-card">
            <div className="ksx-head">
              <h2 className="ksl-card__title" style={{ margin: 0 }}><BarChart3 className="ksl-card__title-icon ksl-card__title-icon--orange" />Your week at a glance</h2>
              <div className="ksx-head__main">
                <div className="ksx-week-nav">
                  <button type="button" className="ksx-icon-btn" aria-label="Previous week" onClick={() => { setWeekOffset((value) => value - 1); setPeriod('week') }}><ChevronLeft /></button>
                  <span className="ksx-week-nav__label"><CalendarDays aria-hidden="true" />{shortRange(weekStart, weekEnd)}</span>
                  <button type="button" className="ksx-icon-btn" aria-label="Next week" onClick={() => { setWeekOffset((value) => value + 1); setPeriod('week') }}><ChevronRight /></button>
                </div>
                <div className="ksx-seg" role="tablist" aria-label="Attendance period">
                  {PERIODS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={period === item.id} onClick={() => { setPeriod(item.id); if (item.id === 'week') setWeekOffset(0) }}>{item.label}</button>)}
                </div>
              </div>
            </div>
            <div className="ksx-days">
              {weekDays.map((day) => {
                const key = calendarDateKey(day.date)
                const theme = WEEKDAY_THEMES[day.date.getDay()]
                return <div key={key} className={`ksx-day ksx-day--tone-${theme.tone} ksx-day--${day.state} ${key === todayKey ? 'ksx-day--today' : ''}`}>
                  <span className="ksx-day__name"><theme.Icon aria-hidden="true" />{theme.short}</span>
                  <span className="ksx-day__num">{day.date.getDate()}</span>
                  <span className="ksx-day__state">{unavailable ? (loading ? 'Loading' : '—') : day.state === 'none' ? 'No Class' : day.state === 'present' ? 'Present' : 'Absent'}</span>
                </div>
              })}
            </div>
          </section>

          <div className="ksx-stats">
            <StudentStatCard tone="blue" Icon={GraduationCap} label="Classes Held" value={show(summary.total)} aside={<span className="ksx-chip ksl-tone--violet"><BarChart3 /></span>} />
            <StudentStatCard tone="green" Icon={UserRound} label="Present" value={show(summary.present)} aside={<span className="ksx-chip ksl-tone--green">{show(pct(summary.present))}</span>} />
            <StudentStatCard tone="red" Icon={XCircle} label="Absent" value={show(summary.absent)} valueColor="#e5484d" aside={<span className="ksx-chip ksl-tone--red">{show(pct(summary.absent))}</span>} />
            <StudentStatCard tone="orange" Icon={Clock3} label="Late" value={show(summary.late)} aside={<span className="ksx-chip ksl-tone--orange">{show(pct(summary.late))}</span>} />
          </div>
        </div>

        <div className="ksx-col">
          <button type="button" onClick={downloadReport} disabled={unavailable || downloading} className="ksx-btn-outline" style={{ padding: '1rem' }}>
            <Download />{downloading ? 'Preparing report...' : `Download ${period === 'all' ? 'full' : period} report`}
          </button>
          <section className="ksl-card">
            <div className="ksx-head"><h2 className="ksx-head__title ksx-bar-title">{periodLabel} attendance</h2><span className="ksx-chip ksl-tone--violet"><BarChart3 /></span></div>
            <div className="ksx-donut-wrap">
              <Donut summary={summary} unavailable={unavailable} />
              <ul className="ksx-legend">
                <li><i style={{ background: '#22b573' }} />Present<b>{show(summary.present)}</b></li>
                <li><i style={{ background: '#f39924' }} />Late<b>{show(summary.late)}</b></li>
                <li><i style={{ background: '#e5484d' }} />Absent<b style={{ color: '#e5484d' }}>{show(summary.absent)}</b></li>
                {period === 'week' && <li><i style={{ background: '#cbd5e1' }} />No Class<b>{show(noClassDays)}</b></li>}
              </ul>
            </div>
            <div className="ksx-totals ksx-totals--icons">
              <span><i className="ksl-tone--blue"><GraduationCap /></i><em>Total Classes<b style={{ color: '#1d6cf0' }}>{show(summary.total)}</b></em></span>
              <span><i className="ksl-tone--green"><CircleCheckBig /></i><em>Attended<b style={{ color: '#16a34a' }}>{show(summary.present + summary.late)}</b></em></span>
              <span><i className="ksl-tone--red"><XCircle /></i><em>Absent<b style={{ color: '#e5484d' }}>{show(summary.absent)}</b></em></span>
            </div>
          </section>
        </div>
      </div>

      <section className="ksl-card">
        <div className="ksx-head">
          <div className="ksx-head__main">
            <span className="ksx-head__icon ksl-tone--orange" style={{ width: '2.5rem', height: '2.5rem' }}><BarChart3 /></span>
            <div><h2 className="ksx-head__title">Attendance details</h2><p className="ksx-head__sub">{periodLabel} · {show(summary.total)} classes</p></div>
          </div>
          <div className="ksx-head__main">
            <label className="ksx-field" style={{ width: '19rem', maxWidth: '100%' }}><Search aria-hidden="true" /><input value={tableQuery} onChange={(event) => setTableQuery(event.target.value)} placeholder="Search classes..." aria-label="Search classes" /></label>
            <label className="ksx-field" style={{ width: '11.5rem' }}><Filter aria-hidden="true" /><select value={tableStatus} onChange={(event) => setTableStatus(event.target.value)} aria-label="Filter by status"><option value="all">All Statuses</option><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="leave">Leave</option></select><ChevronDown aria-hidden="true" className="ksx-field__chevron" /></label>
          </div>
        </div>
        {loading ? <div className="ksx-stack">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100" />)}</div>
          : error ? <div className="ksx-alert ksx-alert--error" style={{ marginTop: '1rem' }}><span>{error}</span><button type="button" onClick={loadAttendance} className="ksl-btn ksl-btn--orange"><RefreshCw />Retry</button></div>
            : tableRows.length ? <><div className="ksx-table-wrap"><table className="ksx-table">
              <colgroup><col style={{ width: '3.5rem' }} /><col /><col style={{ width: '18%' }} /><col style={{ width: '22%' }} /><col style={{ width: '9rem' }} /></colgroup>
              <thead className="ksx-thead-chips"><tr>
                <th><span className="ksx-th ksx-th--violet">#</span></th>
                <th><span className="ksx-th ksx-th--violet"><BookOpen />Course / Class</span></th>
                <th><span className="ksx-th ksx-th--blue"><CalendarDays />Date</span></th>
                <th><span className="ksx-th ksx-th--orange"><Clock3 />Time</span></th>
                <th><span className="ksx-th ksx-th--violet"><BarChart3 />Status</span></th>
              </tr></thead>
              <tbody>{pagedRows.map((record, index) => <tr key={record.id}>
                <td>{(tablePage - 1) * pageSize + index + 1}</td>
                <td><div className="ksx-cell-course"><CourseLogo name={`${record.lesson} ${record.courseName ?? record.liveClass?.courseName ?? ''}`} size="sm" /><div><strong>{record.lesson}</strong>{(record.courseName ?? record.liveClass?.courseName ?? record.batchName) && (record.courseName ?? record.liveClass?.courseName ?? record.batchName) !== record.lesson && <div className="ksx-list__sub">{record.courseName ?? record.liveClass?.courseName ?? record.batchName}</div>}</div></div></td>
                <td className="ksx-date-cell"><span className="ksx-cell-icon"><i className="ksl-tone--blue"><CalendarDays /></i>{formatDate(record.date)}</span></td>
                <td><span className="ksx-cell-icon"><i className="ksl-tone--orange"><Clock3 /></i>{recordTime(record)}</span></td>
                <td><StatusBadge status={record.status} /></td>
              </tr>)}</tbody>
            </table></div>
              {pageCount > 1 && <div className="ksx-pagination" aria-label="Attendance details pagination"><span>Showing {(tablePage - 1) * pageSize + 1}-{Math.min(tablePage * pageSize, tableRows.length)} of {tableRows.length}</span><div><button type="button" onClick={() => setTablePage((page) => Math.max(1, page - 1))} disabled={tablePage === 1} aria-label="Previous page"><ChevronLeft /></button><strong>Page {tablePage} of {pageCount}</strong><button type="button" onClick={() => setTablePage((page) => Math.min(pageCount, page + 1))} disabled={tablePage === pageCount} aria-label="Next page"><ChevronRight /></button></div></div>}</>
              : <div className="ksx-empty" style={{ marginTop: '1rem' }}><span className="ksx-empty__icon"><CalendarCheck /></span><h3>No classes in this period</h3><p>Choose another period or clear the filters to review your attendance.</p></div>}
      </section>
    </div>
  </main>
}

function StatusBadge({ status }) {
  const key = statusKey(status)
  const tone = key === 'late' ? 'late' : key === 'pending' ? 'pending' : isPresent(status) ? 'present' : 'absent'
  const Icon = tone === 'present' ? CheckCircle2 : tone === 'late' ? Clock3 : XCircle
  return <span className={`ksx-status ksx-status--${tone}`}><Icon />{status}</span>
}

function Donut({ summary, unavailable }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const parts = [
    { value: summary.present, color: '#22b573' },
    { value: summary.late, color: '#f39924' },
    { value: summary.absent, color: '#e5484d' },
  ]
  let offset = 0
  const color = summary.percentage >= 75 ? '#16a34a' : summary.percentage >= 50 ? '#f08a12' : '#e5484d'
  return <div className="ksx-donut">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#e9eef4" strokeWidth="9" />
      {!unavailable && summary.total > 0 && parts.map((part, index) => {
        const length = (part.value / summary.total) * circumference
        const node = part.value ? <circle key={index} cx="50" cy="50" r={radius} fill="none" stroke={part.color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} /> : null
        offset += length
        return node
      })}
    </svg>
    <div className="ksx-donut__center"><strong style={{ color }}>{unavailable ? '—' : `${summary.percentage}%`}</strong><span>Attendance</span></div>
  </div>
}
