import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Eye,
  Filter,
  Layers3,
  PlayCircle,
  RefreshCw,
  Search,
  Sparkles,
  Video,
  Clock3,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@shared/hooks/useAuth'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import attendanceService from '@shared/services/attendanceService'
import { getStudentJoinState, normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'
import { useStudentClassScope } from '@features/student/hooks/useStudentClassScope'
import { ROUTES } from '@shared/constants/routeConstants'
import KPI from '@/components/common/KPI'
import Pagination from '@features/student/components/myClasses/Pagination'
import ViewDetailsDrawer from '@features/student/components/myClasses/ViewDetailsDrawer'
import StatusBadge from '@features/student/components/myClasses/StatusBadge'
import MentorInfo from '@features/student/components/myClasses/MentorInfo'

const DEFAULT_FILTERS = {
  search: '',
  course: 'all',
  mentor: 'all',
  status: 'all',
  date: '',
}

const PAGE_SIZE_OPTIONS = [10, 20, 50]

const extractRows = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.results)) return value.results
  if (Array.isArray(value?.rows)) return value.rows
  if (Array.isArray(value?.content)) return value.content
  return []
}

const normalizeStatus = (status) => String(status || 'scheduled').trim().toLowerCase()

const formatDateParts = (value) => {
  if (!value) return { date: 'Not Available', time: 'Not Available' }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { date: 'Not Available', time: 'Not Available' }

  return {
    date: new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date),
  }
}

const toDateKey = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const isSameLocalDay = (value, reference = new Date()) => {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return (
    date.getFullYear() === reference.getFullYear()
    && date.getMonth() === reference.getMonth()
    && date.getDate() === reference.getDate()
  )
}

const createResourceText = (item) => {
  const resources = Array.isArray(item.resources) ? item.resources : []
  if (resources.length) return resources.slice(0, 3)

  const fallback = []
  if (item.pdfUrl || item.hasPdf) fallback.push('PDF')
  if (item.recordingUrl || item.hasRecording) fallback.push('Recording')
  if (item.notesUrl || item.hasNotes) fallback.push('Notes')
  return fallback
}

const getAttendanceValue = (item) => {
  const value = Number(item.attendancePercentage ?? item.attendanceRate ?? item.attendance ?? 0)
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, value))
}

const getClassAction = (item) => {
  const status = normalizeStatus(item.status)
  const meetingUrl = String(item.meetingUrl || item.meetingLink || '').trim()
  const recordingUrl = String(item.recordingUrl || '').trim()
  const pdfUrl = String(item.pdfUrl || '').trim()

  // Join is driven by the backend-backed status (getStudentJoinState), not by
  // whether a URL happens to be cached: only a LIVE class is joinable, an
  // upcoming one shows a disabled state until the mentor starts it, and
  // completed/cancelled classes never offer Join.
  const joinState = getStudentJoinState(item)
  if (joinState.canJoin) {
    return {
      label: 'Join Class',
      url: meetingUrl,
      variant: 'primary',
      icon: PlayCircle,
      disabled: false,
      join: true,
    }
  }

  if (joinState.state === 'upcoming') {
    return {
      label: 'Upcoming',
      url: '',
      variant: 'secondary',
      icon: Clock3,
      disabled: true,
    }
  }

  if (joinState.state === 'cancelled') {
    return {
      label: 'Cancelled',
      url: '',
      variant: 'secondary',
      icon: Video,
      disabled: true,
    }
  }

  if (status === 'completed' && Boolean(item.recordingEnabled ?? recordingUrl)) {
    return {
      label: 'Watch Recording',
      url: recordingUrl || pdfUrl,
      variant: 'secondary',
      icon: Video,
      disabled: !recordingUrl && !pdfUrl,
    }
  }

  if (status === 'completed' && pdfUrl) {
    return {
      label: 'View Notes',
      url: pdfUrl,
      variant: 'secondary',
      icon: Video,
      disabled: false,
    }
  }

  return {
    label: 'Not Available',
    url: '',
    variant: 'ghost',
    icon: Video,
    disabled: true,
  }
}

const buildOptions = (rows, keySelector, labelSelector, placeholder) => [
  { value: 'all', label: placeholder },
  ...Array.from(
    new Map(
      rows
        .map((row) => {
          const value = String(keySelector(row) ?? '').trim()
          const label = String(labelSelector(row) ?? '').trim()
          return value ? [value, { value, label: label || value }] : null
        })
        .filter(Boolean)
    ).values()
  ),
]

// Summary cards use the global KPI card (same design in every portal).
function StatCard({ icon, label, value, helper, accent }) {
  return <KPI label={label} value={value} description={helper} icon={icon} accent={accent} />
}

function MiniButton({ icon: Icon, children, variant = 'secondary', className = '', ...props }) {
  const styles = {
    primary: 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-[0_8px_18px_rgba(15,85,247,0.14)] hover:-translate-y-0.5 hover:brightness-105',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white',
  }

  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </button>
  )
}

function TableSkeleton() {
  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] dark:border-slate-700/60 dark:bg-slate-900/80">
      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[1.7fr_1fr_1fr_0.8fr_0.9fr_0.8fr_0.9fr_0.9fr_1fr_1.1fr] items-center gap-3 rounded-[18px] bg-slate-50 px-3 py-3 dark:bg-slate-800/40">
            {Array.from({ length: 10 }).map((__, inner) => (
              <div key={inner} className="h-4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyClassesState({ onBrowseCourses, onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[380px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white/90 px-6 py-12 text-center shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] dark:border-slate-700/60 dark:bg-slate-900/80"
    >
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(15,85,247,0.12),rgba(6,182,168,0.12))]">
          <BookOpen className="h-7 w-7 text-[#0f55f7]" />
        </div>
        <Sparkles className="absolute -right-2 -top-2 h-5 w-5 text-[#06b6a8]" />
      </div>
      <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900 dark:text-white">No Classes Scheduled</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
        Your schedule is empty for the selected filters. Try resetting the filters or browsing your course catalog.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <MiniButton variant="secondary" icon={RefreshCw} onClick={onReset}>Reset Filters</MiniButton>
        <MiniButton variant="primary" icon={ArrowRight} onClick={onBrowseCourses}>Browse Courses</MiniButton>
      </div>
    </motion.div>
  )
}

function ClassRow({ item, index, onOpen, onJoin, joining }) {
  const attendance = getAttendanceValue(item)
  const schedule = formatDateParts(item.startAt)
  const action = getClassAction(item)
  const resources = createResourceText(item)
  const status = normalizeStatus(item.status)

  return (
    <tr
      onClick={() => onOpen(item)}
      className="group cursor-pointer border-b border-slate-100/90 last:border-b-0 hover:bg-slate-50/70 dark:border-slate-800/70 dark:hover:bg-slate-800/30"
    >
      <td className="px-4 py-4 align-middle text-sm font-semibold text-slate-400">
        #{index}
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,85,247,0.14),rgba(6,182,168,0.14))] text-[#0f55f7] ring-1 ring-[#0f55f7]/10">
            <Layers3 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-[#0f55f7] dark:text-white">
              {item.title || 'Untitled Class'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
              <span className="truncate font-medium">{item.batchName || item.batch || 'No batch'}</span>
              {item.durationLabel && (
                <>
                  <span>•</span>
                  <span>{item.durationLabel}</span>
                </>
              )}
              {resources.length > 0 && (
                <>
                  <span>•</span>
                  <span>{resources.join(', ')}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="max-w-[180px]">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{item.courseName || 'Not Available'}</p>
          <p className="mt-1 text-[11px] text-slate-400">{item.category || 'Course'}</p>
        </div>
      </td>

      <td className="px-4 py-4 align-middle">
        <MentorInfo name={item.mentorName} avatar={item.mentorAvatar} />
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0f55f7]/8 px-2.5 py-1 text-[11px] font-semibold text-[#0f55f7]">
          <Video className="h-3.5 w-3.5" />
          <span className="truncate max-w-[120px]">{item.platform || 'Not Specified'}</span>
        </div>
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{schedule.date}</div>
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">{schedule.time}</div>
      </td>

      <td className="px-4 py-4 align-middle">
        <StatusBadge status={status === 'live' ? 'live' : status === 'completed' ? 'completed' : 'upcoming'} label={item.statusLabel || status} pulse={status === 'live'} />
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
              style={{ width: `${attendance}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{attendance}%</span>
        </div>
      </td>

      <td className="px-4 py-4 align-middle">
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onOpen(item)
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:-translate-y-0.5 hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label={`View details for ${item.title || 'class'}`}
          >
            <Eye className="h-4 w-4" />
          </button>

          <MiniButton
            variant={action.variant}
            icon={action.icon}
            disabled={action.disabled || joining}
            className="min-w-[122px]"
            onClick={(event) => {
              event.stopPropagation()
              onJoin(item)
            }}
          >
            {joining ? 'Joining…' : action.label}
          </MiniButton>
        </div>
      </td>
    </tr>
  )
}

function MobileClassCard({ item, onOpen, onJoin, joining }) {
  const action = getClassAction(item)
  const attendance = getAttendanceValue(item)
  const schedule = formatDateParts(item.startAt)
  const resources = createResourceText(item)
  const status = normalizeStatus(item.status)

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(item)}
      className="rounded-[22px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] dark:border-slate-700/60 dark:bg-slate-900/80"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,85,247,0.14),rgba(6,182,168,0.14))] text-[#0f55f7]">
          <Layers3 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status === 'live' ? 'live' : status === 'completed' ? 'completed' : 'upcoming'} label={item.statusLabel || status} pulse={status === 'live'} />
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {item.courseName || 'Course'}
            </span>
          </div>
          <h3 className="mt-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">{item.title || 'Untitled Class'}</h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{item.batchName || item.batch || 'No batch'}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Date</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{schedule.date}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Time</p>
          <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{schedule.time}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <MentorInfo name={item.mentorName} avatar={item.mentorAvatar} />
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]" style={{ width: `${attendance}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{attendance}%</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#0f55f7]/8 px-2.5 py-1 text-[11px] font-semibold text-[#0f55f7]">
          <Video className="h-3.5 w-3.5" />
          {item.platform || 'Not Specified'}
        </div>
        {resources.slice(0, 3).map((resource) => (
          <span key={resource} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {resource}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpen(item)
          }}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          aria-label={`View details for ${item.title || 'class'}`}
        >
          <Eye className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={action.disabled || joining}
          onClick={(event) => {
            event.stopPropagation()
            onJoin(item)
          }}
          className={`inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition-all ${
            action.variant === 'primary'
              ? 'bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] text-white shadow-[0_8px_18px_rgba(15,85,247,0.14)] hover:-translate-y-0.5 hover:brightness-105'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <action.icon className="h-3.5 w-3.5" />
          {joining ? 'Joining…' : action.label}
        </button>
      </div>
    </motion.article>
  )
}

export default function MyClasses() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const studentScope = useStudentClassScope()
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    date: searchParams.get('date') === 'today' ? toDateKey(new Date()) : '',
  }))
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedClass, setSelectedClass] = useState(null)
  const deferredSearch = useDeferredValue(filters.search)

  // Shared by the table row, mobile card, and details drawer. A live class
  // opens the embedded Jitsi classroom route — no attendance call is made by
  // the click itself; /api/jitsi-attendance/join is sent only once Jitsi
  // reports the student inside the conference (JitsiMeeting.jsx). Completed
  // classes just open whatever recording/notes link is already known.
  const handleJoinClick = useCallback((item) => {
    const action = getClassAction(item)
    if (action.disabled) return
    if (!action.join) {
      if (action.url) window.open(action.url, '_blank', 'noopener,noreferrer')
      return
    }
    const liveClassId = item.liveClassId ?? item.id
    if (!liveClassId) {
      toast.error('This class has no valid ID yet.')
      return
    }
    navigate(ROUTES.STUDENT.CLASS_JOIN.replace(':classId', encodeURIComponent(liveClassId)), { state: { liveClass: item } })
  }, [navigate])

  const loadClasses = useCallback(async ({ silent = false } = {}) => {
    // Wait for the student's enrollments; without them nothing is shown.
    if (!studentScope.ready) return
    if (studentScope.error) {
      setClasses([])
      setError(user?.isDemo ? '' : studentScope.error)
      setLoading(false)
      return
    }
    if (silent) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const params = {}
      if (studentScope.courseId) params.courseId = studentScope.courseId
      if (studentScope.batchId) params.batchId = studentScope.batchId

      const listResult = await liveClassService.list(params)

      // attendanceStatus here is only a placeholder until the details drawer
      // opens and fetches this student's REAL per-class record from
      // GET /api/Attendance/my/liveclass/{liveClassId} (see handleOpenClass).
      // It used to be guessed from this course's overall attendance
      // PERCENTAGE (attendance >= 90 ? 'present' : ...), which described the
      // student's whole course history, not whether they attended this one
      // session, so it must not be treated as a real per-class status.
      // GET /api/v1/live-classes ignores course/batch params, so rows outside
      // this student's enrollments are dropped here.
      const normalized = normalizeLiveClassList(extractRows(listResult))
        .filter((item) => studentScope.allows(item))
        .map((item) => ({
          ...item,
          attendanceStatus: item.attendanceStatus || 'pending',
        }))

      if (import.meta.env.DEV) {
        console.debug('Student My Classes payload', {
          scope: studentScope,
          listResult,
        })
      }

      setClasses(normalized)
    } catch (loadError) {
      setError(user?.isDemo ? '' : getApiErrorMessage(loadError, 'Unable to load your classes.'))
      setClasses([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [studentScope, user])

  useEffect(() => {
    // Initial data synchronization for the current student scope.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClasses()
  }, [loadClasses])

  const stats = useMemo(() => {
    const total = classes.length
    const todayClasses = classes.filter((item) => isSameLocalDay(item.startAt)).length
    const upcomingClasses = classes.filter((item) => ['scheduled', 'upcoming'].includes(normalizeStatus(item.status))).length
    const completedClasses = classes.filter((item) => normalizeStatus(item.status) === 'completed').length
    const averageAttendance = total
      ? Math.round(classes.reduce((sum, item) => sum + getAttendanceValue(item), 0) / total)
      : 0

    return {
      total,
      todayClasses,
      upcomingClasses,
      completedClasses,
      averageAttendance,
    }
  }, [classes])

  const courseOptions = useMemo(() => buildOptions(
    classes,
    (row) => row.courseId || row.courseName,
    (row) => row.courseName || row.courseId,
    'All Courses',
  ), [classes])

  const mentorOptions = useMemo(() => buildOptions(
    classes,
    (row) => row.mentorId || row.mentorName,
    (row) => row.mentorName || row.mentorId,
    'All Mentors',
  ), [classes])

  const filteredClasses = useMemo(() => {
    const search = deferredSearch.trim().toLowerCase()

    return classes.filter((item) => {
      const status = normalizeStatus(item.status)
      const itemDateKey = toDateKey(item.startAt)
      if (filters.course !== 'all' && String(item.courseId || item.courseName) !== filters.course && String(item.courseName) !== filters.course) return false
      if (filters.mentor !== 'all' && String(item.mentorId || item.mentorName) !== filters.mentor && String(item.mentorName) !== filters.mentor) return false
      if (filters.status !== 'all' && status !== filters.status) return false
      if (filters.date && itemDateKey !== toDateKey(filters.date)) return false
      if (search && !(item.searchIndex || '').includes(search)) return false
      return true
    })
  }, [classes, deferredSearch, filters.course, filters.date, filters.mentor, filters.status])

  const totalPages = Math.max(1, Math.ceil(filteredClasses.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)
  const pageItems = useMemo(
    () => filteredClasses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
    [currentPage, filteredClasses, rowsPerPage],
  )

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setPage(1)
    setRowsPerPage(10)
  }, [])

  const handleBrowseCourses = useCallback(() => {
    navigate('/student/courses')
  }, [navigate])

  const handleOpenClass = useCallback((classItem) => {
    setSelectedClass(classItem)
    const liveClassId = classItem?.id
    if (!liveClassId) return
    // GET /api/Attendance/my/liveclass/{liveClassId} — this student's OWN
    // attendance for this exact session, resolved from the auth token (no
    // studentId to supply). Fetched only when a class's details are opened,
    // never once per row in the list, so browsing the list itself never
    // fires N attendance requests.
    attendanceService.myLiveClassAttendance(liveClassId)
      .then((record) => {
        const status = String(record?.status || record?.attendanceStatus || '').toLowerCase() || 'pending'
        setSelectedClass((current) => (current?.id === liveClassId ? { ...current, attendanceStatus: status } : current))
      })
      .catch(() => {
        // No record yet (404), no permission, or a network error — the chip
        // already shows "pending" from the list load; never guess "present".
      })
  }, [])

  const handleRefresh = useCallback(() => {
    loadClasses({ silent: true })
  }, [loadClasses])

  const showingFrom = filteredClasses.length === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1
  const showingTo = Math.min(filteredClasses.length, currentPage * rowsPerPage)
  const scopedLabel = studentScope.courseId || studentScope.batchId ? 'Scoped to your enrolled class' : 'Live backend data'

  if (loading) {
    return (
      <div className="relative mx-auto w-full max-w-none px-4 py-3 sm:px-5 lg:py-4">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/90 p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] dark:border-slate-700/60 dark:bg-slate-900/80">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-9 w-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-[520px] max-w-full animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-9 w-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="min-h-[126px] animate-pulse rounded-[20px] border border-slate-200/70 bg-slate-200/80 dark:border-slate-700/60 dark:bg-slate-800/80" />
          ))}
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-14 animate-pulse rounded-[20px] bg-slate-200 dark:bg-slate-800" />
          <TableSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative mx-auto w-full max-w-none px-4 py-6 sm:px-5 lg:py-8">
        <div className="flex min-h-[42vh] flex-col items-center justify-center rounded-[24px] border border-rose-200/70 bg-white/90 px-6 py-12 text-center shadow-[0_8px_18px_rgba(15,23,42,0.04)] dark:border-rose-500/20 dark:bg-slate-900/80">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-rose-500/10 text-rose-500">
            <Filter className="h-7 w-7" />
          </div>
          <h3 className="mt-5 text-xl font-black tracking-tight text-slate-900 dark:text-white">Unable to load classes</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">{error}</p>
          <MiniButton variant="primary" icon={RefreshCw} className="mt-6" onClick={handleRefresh}>
            Retry
          </MiniButton>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto w-full max-w-none px-0 py-0">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(15,85,247,0.08),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(6,182,168,0.08),transparent_24%),linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_42%,#F8FAFC_100%)] dark:bg-[radial-gradient(circle_at_15%_0%,rgba(15,85,247,0.12),transparent_28%),radial-gradient(circle_at_85%_12%,rgba(6,182,168,0.10),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_42%,#020617_100%)]" />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[18px] border border-slate-200/70 bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(6,182,168,0.08),transparent_24%),linear-gradient(135deg,rgba(15,85,247,0.04),rgba(255,255,255,0.04))]" />
        <div className="relative flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span>Dashboard</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">My Classes</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-[2.2rem]">
                My Classes
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0f55f7]" />
                {stats.total} Total
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#06b6a8]/10 px-2.5 py-1 text-xs font-semibold text-[#067f76] dark:text-[#9bf3eb]">
                <Sparkles className="h-3.5 w-3.5" />
                {scopedLabel}
              </span>
            </div>
            <p className="max-w-3xl text-[13px] leading-5 text-slate-500 dark:text-slate-400">
              Track your scheduled, live, and completed classes in a compact dashboard. Join live sessions, watch recordings, and review class resources from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <MiniButton variant="secondary" icon={RefreshCw} onClick={handleRefresh} disabled={refreshing}>
              Refresh
            </MiniButton>
            <MiniButton variant="primary" icon={ArrowRight} onClick={handleBrowseCourses}>
              Browse Courses
            </MiniButton>
          </div>
        </div>
      </motion.section>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <StatCard icon={Layers3} label="Total Classes" value={stats.total} helper="All scheduled sessions" accent="blue" />
        <StatCard icon={CalendarDays} label="Today's Classes" value={stats.todayClasses} helper="Happening today" accent="teal" />
        <StatCard icon={Clock3} label="Upcoming" value={stats.upcomingClasses} helper="Queued for you" accent="orange" />
        <StatCard icon={BookOpen} label="Completed" value={stats.completedClasses} helper={`Avg. attendance ${stats.averageAttendance}%`} accent="purple" />
      </div>

      <div className="mt-2.5 rounded-[18px] border border-slate-200/70 bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-700/60 dark:bg-slate-950/35">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => {
                setFilters((current) => ({ ...current, search: event.target.value }))
                setPage(1)
              }}
              placeholder="Search class title, course, mentor, batch, or resource..."
              className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:flex xl:items-center">
            <label className="min-w-0">
              <span className="sr-only">Filter by status</span>
              <select
                value={filters.status}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, status: event.target.value }))
                  setPage(1)
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#0f55f7]/40 focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label className="min-w-0">
              <span className="sr-only">Filter by course</span>
              <select
                value={filters.course}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, course: event.target.value }))
                  setPage(1)
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#0f55f7]/40 focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              >
                {courseOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="sr-only">Filter by mentor</span>
              <select
                value={filters.mentor}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, mentor: event.target.value }))
                  setPage(1)
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#0f55f7]/40 focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              >
                {mentorOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="min-w-0">
              <span className="sr-only">Filter by date</span>
              <input
                type="date"
                value={filters.date}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, date: event.target.value }))
                  setPage(1)
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#0f55f7]/40 focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              />
            </label>

            <label className="min-w-[110px]">
              <span className="sr-only">Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value))
                  setPage(1)
                }}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-all focus:border-[#0f55f7]/40 focus:ring-4 focus:ring-[#0f55f7]/10 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option} / page</option>
                ))}
              </select>
            </label>

            <MiniButton variant="secondary" icon={RefreshCw} onClick={handleRefresh} disabled={refreshing}>
              Refresh
            </MiniButton>
            <MiniButton variant="ghost" icon={Filter} onClick={handleReset}>
              Reset
            </MiniButton>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {filteredClasses.length === 0 ? (
          <EmptyClassesState onBrowseCourses={handleBrowseCourses} onReset={handleReset} />
        ) : (
          <>
            <div className="hidden rounded-[22px] border border-slate-200/70 bg-white/90 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] dark:border-slate-700/60 dark:bg-slate-900/80 lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur dark:bg-slate-900/95">
                    <tr className="text-left text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      <th className="px-4 py-4">#</th>
                      <th className="px-4 py-4">Class</th>
                      <th className="px-4 py-4">Course</th>
                      <th className="px-4 py-4">Mentor</th>
                      <th className="px-4 py-4">Platform</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Time</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Attendance</th>
                      <th className="px-4 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, index) => (
                      <ClassRow
                        key={item.id || `${item.title}-${index}`}
                        item={item}
                        index={(currentPage - 1) * rowsPerPage + index + 1}
                        onOpen={handleOpenClass}
                        onJoin={handleJoinClick}
                        joining={false}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 lg:hidden">
              {pageItems.map((item, index) => (
                <MobileClassCard
                  key={item.id || `${item.title}-${index}`}
                  item={item}
                  onOpen={handleOpenClass}
                  onJoin={handleJoinClick}
                  joining={false}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-[22px] border border-slate-200/70 bg-white/90 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] ring-1 ring-slate-900/[0.03] backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {showingFrom} to {showingTo} of {filteredClasses.length} classes
              </p>
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                pageSize={rowsPerPage}
                totalItems={filteredClasses.length}
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setRowsPerPage(value)
                  setPage(1)
                }}
              />
            </div>
          </>
        )}
      </div>

      <ViewDetailsDrawer
        open={Boolean(selectedClass)}
        classItem={selectedClass}
        joining={false}
        onClose={() => setSelectedClass(null)}
        onJoin={(classItem) => handleJoinClick(classItem || selectedClass || {})}
        onOpenResource={(classItem, type) => {
          const target = String(type || '').toLowerCase() === 'recording'
            ? classItem?.recordingUrl || classItem?.meetingUrl || classItem?.pdfUrl
            : classItem?.pdfUrl || classItem?.recordingUrl || classItem?.meetingUrl
          if (target) {
            window.open(target, '_blank', 'noopener,noreferrer')
          }
        }}
      />
    </div>
  )
}


