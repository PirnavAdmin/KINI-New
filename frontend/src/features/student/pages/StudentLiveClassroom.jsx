import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ArrowLeft, BookOpen, CalendarClock, CheckCircle2, Clock3, ExternalLink, Layers3,
  Loader2, LogOut, RotateCcw, TriangleAlert, UserRound, Video,
} from 'lucide-react'
import JitsiMeeting from '@shared/components/JitsiMeeting'
import JitsiAttendanceIndicator from '@shared/components/JitsiAttendanceIndicator'
import { joinErrorMessage } from '@features/live-classes/utils/joinErrorMessage'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { getStudentJoinState, normalizeLiveClass } from '@features/live-classes/utils/liveClassMappers'
import { ROUTES } from '@shared/constants/routeConstants'
import { resolveJitsiMeeting } from '@shared/utils/resolveJitsiRoom'
import { useStudentClassScope } from '@features/student/hooks/useStudentClassScope'

const extractRecord = (payload) => {
  if (!payload || typeof payload !== 'object') return null
  const inner = payload.data ?? payload.result ?? payload.item ?? payload
  return Array.isArray(inner) ? inner[0] ?? null : inner
}

const MEETING_KEYS = ['meetingUrl', 'meetingLink', 'joinUrl', 'joinLink', 'url', 'roomUrl']

// The join endpoint's link may sit at the top level or inside data/result/
// liveClass/meeting — read every place the existing callers used to read.
const meetingUrlFrom = (payload) => {
  const sources = [payload, payload?.data, payload?.result, payload?.liveClass, payload?.data?.liveClass, payload?.meeting, payload?.data?.meeting]
  for (const source of sources) {
    if (!source || typeof source !== 'object') continue
    for (const key of MEETING_KEYS) {
      const value = source[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return typeof payload === 'string' && /^https?:\/\//i.test(payload.trim()) ? payload.trim() : ''
}

const pickDefined = (source, keys) => Object.fromEntries(
  keys.filter((key) => source?.[key] != null && source[key] !== '').map((key) => [key, source[key]]),
)

const formatClassTime = (item) => {
  if (!item?.startAt) return item?.timeLabel || '—'
  const start = new Date(item.startAt)
  if (Number.isNaN(start.getTime())) return item.timeLabel || '—'
  const date = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(start)
  const time = (value) => new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(value)
  const end = item.endAt ? new Date(item.endAt) : null
  return `${date} · ${time(start)}${end && !Number.isNaN(end.getTime()) ? ` – ${time(end)}` : ''}`
}

// Student-facing embedded classroom for ONE live class:
//   /student/classes/:classId/join
// Opening this page records nothing. Attendance starts only when Jitsi reports
// the student actually inside the conference (see JitsiMeeting.jsx).
export default function StudentLiveClassroom() {
  const { classId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const meetingRef = useRef(null)
  const passedClass = location.state?.liveClass
  // Only classes from this student's own enrollments can be opened, whether
  // reached from a list or by typing the URL.
  const scope = useStudentClassScope()

  const [liveClass, setLiveClass] = useState(() => (passedClass ? normalizeLiveClass(passedClass) : null))
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [attendance, setAttendance] = useState('connecting')
  const [meetingError, setMeetingError] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [ended, setEnded] = useState(false)
  const [sessionKey, setSessionKey] = useState(0)
  const [roomReady, setRoomReady] = useState(false)
  const [roomError, setRoomError] = useState('')

  // Resolve the class, then ask the backend for its meeting room.
  //
  // • GET /api/v1/live-classes and GET /api/v1/live-classes/{id} return 403
  //   for the student role, so the class record comes from the row handed
  //   over by My Classes / Dashboard / Calendar, or — after a refresh — from
  //   the student-scoped live/upcoming/completed endpoints.
  // • The student list rows don't carry the mentor's meeting link, and a
  //   student that invents its own room ends up in a DIFFERENT conference
  //   than the mentor. POST /api/v1/live-classes/{id}/join is the backend's
  //   class-level join/eligibility endpoint and returns the class's real
  //   meeting link, so it is called once here — only for a LIVE class, before
  //   the room is opened. Attendance itself is still recorded only by the
  //   Jitsi conference events (/api/jitsi-attendance/join|leave).
  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError('')
    setRoomError('')

    const findInStudentLists = async () => {
      const results = await Promise.allSettled([
        liveClassService.live({}),
        liveClassService.upcoming({}),
        liveClassService.completed({}),
      ])
      const rows = results.flatMap((result) => (result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []))
      return rows.find((row) => String(row?.id ?? row?.liveClassId ?? row?.classId) === String(classId)) || null
    }

    const run = async () => {
      if (!scope.ready) return
      if (scope.error) {
        setLoadError(scope.error)
        return
      }
      // Navigation state is only a hint; the class is re-read from the API so
      // its course and batch come from the backend, not the browser.
      const found = await findInStudentLists().catch(() => null)
      if (!active) return
      const record = found ? normalizeLiveClass(found) : (passedClass ? normalizeLiveClass(passedClass) : null)
      if (!record) {
        setLoadError('This class could not be found in your schedule.')
        return
      }
      if (!scope.allows(record)) {
        setLoadError("You don't have access to this class. It isn't part of your enrolled courses.")
        return
      }
      setLiveClass(record)
      if (!getStudentJoinState(record).canJoin) return

      try {
        const response = await liveClassService.join(classId)
        if (!active) return
        const details = extractRecord(response) || {}
        const meetingUrl = meetingUrlFrom(response)
        const merged = normalizeLiveClass({
          ...record,
          ...pickDefined(details, ['courseName', 'batchName', 'mentorName', 'courseId', 'batchId', 'mentorId']),
          ...(meetingUrl ? { meetingUrl } : {}),
        })
        setLiveClass(merged)
        setRoomReady(true)
      } catch (error) {
        if (!active) return
        // A refusal from the backend (400/401/403/404) is final: never open the
        // room from the class row's link around it. Only an unreachable or
        // failing server falls back to the row's own link.
        const status = error?.response?.status
        const refused = status >= 400 && status < 500
        if (!refused && record.meetingUrl) {
          setRoomReady(true)
        } else {
          setRoomError(joinErrorMessage(error, 'You are not allowed to join this class right now.'))
        }
      }
    }

    run().finally(() => { if (active && scope.ready) setLoading(false) })
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, scope])

  const joinState = liveClass ? getStudentJoinState(liveClass) : null

  const handleStatus = useCallback((status, detail) => {
    setAttendance(status)
    if (status === 'error') setMeetingError(typeof detail === 'string' ? detail : 'Unable to open this meeting.')
    if (status === 'unsupported') setExternalUrl(typeof detail === 'string' ? detail : '')
    if (status === 'join-failed') toast.error(joinErrorMessage(detail, 'Attendance could not be started. Leave and rejoin to try again.'), { id: 'jitsi-attendance' })
    if (status === 'leave-failed') toast.error(joinErrorMessage(detail, 'Your leave time could not be recorded.'), { id: 'jitsi-attendance' })
    if (status === 'recorded') toast.success('Attendance recorded.', { id: 'jitsi-attendance' })
  }, [])

  const backToClasses = () => navigate(ROUTES.STUDENT.MY_CLASSES)

  // Hang up through Jitsi so the normal videoConferenceLeft → /leave path
  // runs; "Back to Classes" then navigates once the leave has been recorded.
  const exitAfterLeaveRef = useRef(false)
  const leaveClass = ({ exit = false } = {}) => {
    exitAfterLeaveRef.current = exit
    if (!meetingRef.current?.hangup()) backToClasses()
  }
  const handleEnded = () => {
    if (exitAfterLeaveRef.current) backToClasses()
    else setEnded(true)
  }

  const rejoin = () => {
    setEnded(false)
    setMeetingError('')
    setAttendance('connecting')
    setSessionKey((value) => value + 1)
  }

  const title = liveClass?.title || 'Live class'
  const inMeeting = joinState?.canJoin && roomReady && !ended && !meetingError && !externalUrl

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 px-3 py-3 sm:px-4">
      <header className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm sm:px-4">
        <button
          type="button"
          onClick={inMeeting ? () => leaveClass({ exit: true }) : backToClasses}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </button>
        <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
        <h1 className="min-w-0 flex-1 truncate text-base font-bold text-[#133B5D] sm:text-lg">{title}</h1>
        {joinState?.state === 'live' && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" aria-hidden="true" />
            Live
          </span>
        )}
        {inMeeting && <JitsiAttendanceIndicator status={attendance} />}
        {inMeeting && attendance !== 'connecting' && (
          <button
            type="button"
            onClick={() => leaveClass()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave class
          </button>
        )}
      </header>

      {loading ? (
        <StateCard icon={Loader2} spin title="Preparing your class…" />
      ) : loadError ? (
        <StateCard icon={TriangleAlert} tone="amber" title={loadError} action={<BackButton onClick={backToClasses} />} />
      ) : roomError && joinState?.canJoin ? (
        <StateCard icon={TriangleAlert} tone="amber" title="Unable to join this class" text={roomError} action={<BackButton onClick={backToClasses} />} />
      ) : joinState && !joinState.canJoin ? (
        <StateCard
          icon={joinState.state === 'completed' ? CheckCircle2 : joinState.state === 'cancelled' ? TriangleAlert : CalendarClock}
          tone={joinState.state === 'completed' ? 'green' : joinState.state === 'cancelled' ? 'rose' : 'blue'}
          title={joinState.state === 'completed' ? 'Completed' : joinState.state === 'cancelled' ? 'Cancelled' : 'Upcoming'}
          text={joinState.message}
          action={<BackButton onClick={backToClasses} />}
        />
      ) : (
        <div className="grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="relative h-[calc(100dvh-170px)] min-h-[440px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm md:min-h-[520px]">
            {roomReady && !ended && !meetingError && !externalUrl && (
              <JitsiMeeting
                key={sessionKey}
                ref={meetingRef}
                liveClass={liveClass}
                onStatusChange={handleStatus}
                onEnded={handleEnded}
              />
            )}
            {attendance === 'connecting' && !meetingError && !externalUrl && !ended && (
              <Overlay>
                <Loader2 className="h-7 w-7 animate-spin" />
                <p className="text-sm text-slate-300">Connecting to the class…</p>
              </Overlay>
            )}
            {ended && (
              <Overlay>
                <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                <p className="text-base font-semibold">You left the class</p>
                <JitsiAttendanceIndicator status={attendance} tone="dark" />
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={rejoin} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                    <RotateCcw className="h-4 w-4" /> Rejoin
                  </button>
                  <button type="button" onClick={backToClasses} className="rounded-lg bg-[#F39924] px-4 py-2 text-sm font-semibold text-white hover:brightness-105">
                    Back to Classes
                  </button>
                </div>
              </Overlay>
            )}
            {(meetingError || externalUrl) && (
              <Overlay>
                <TriangleAlert className="h-8 w-8 text-amber-400" />
                <p className="max-w-md text-center text-sm font-semibold">
                  {externalUrl
                    ? 'This class uses a meeting platform other than Jitsi, so it cannot be embedded and attendance cannot be tracked automatically. Your mentor records attendance for this class.'
                    : meetingError}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {externalUrl && (
                    <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                      <ExternalLink className="h-4 w-4" /> Open meeting link
                    </a>
                  )}
                  {meetingError && (
                    <button type="button" onClick={rejoin} className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">
                      <RotateCcw className="h-4 w-4" /> Try again
                    </button>
                  )}
                  <button type="button" onClick={backToClasses} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">Back to Classes</button>
                </div>
              </Overlay>
            )}
          </section>

          {/* A div, not <aside>: the student theme paints every <aside> as the navy sidebar. */}
          <div role="complementary" data-ui="live-class-info" className="grid content-start gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-1" aria-label="Class information">
            <InfoRow icon={BookOpen} label="Course" value={liveClass?.courseName} />
            <InfoRow icon={Layers3} label="Batch" value={liveClass?.batchName} />
            <InfoRow icon={UserRound} label="Mentor" value={liveClass?.mentorName} />
            <InfoRow icon={Clock3} label="Class time" value={formatClassTime(liveClass)} />
            {/* Same room name the mentor sees in the Jitsi header — lets both sides confirm they're in one meeting. */}
            <InfoRow icon={Video} label="Meeting room" value={roomReady ? resolveJitsiMeeting(liveClass)?.roomName : ''} />
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 sm:col-span-2 xl:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Attendance status</p>
              <div className="mt-1.5"><JitsiAttendanceIndicator status={attendance} /></div>
              <p className="mt-2 text-[11px] leading-4 text-slate-500">
                Attendance starts when you enter the meeting and is recorded when you leave.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#133B5D]/5 text-[#133B5D]"><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value || '—'}</p>
      </div>
    </div>
  )
}

function Overlay({ children }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/95 p-6 text-white">
      {children}
    </div>
  )
}

const STATE_TONES = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
  neutral: 'bg-slate-100 text-slate-500',
}

function StateCard({ icon: Icon, title, text, action, tone = 'neutral', spin = false }) {
  return (
    <section className="grid place-items-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
      <span className={`grid h-12 w-12 place-items-center rounded-full ${STATE_TONES[tone]}`}>
        <Icon className={`h-6 w-6 ${spin ? 'animate-spin' : ''}`} />
      </span>
      <h2 className="mt-3 text-lg font-bold text-slate-900">{title}</h2>
      {text && <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>}
      {action && <div className="mt-4">{action}</div>}
    </section>
  )
}

function BackButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg bg-[#133B5D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2f4a]">
      <ArrowLeft className="h-4 w-4" /> Back to Classes
    </button>
  )
}
