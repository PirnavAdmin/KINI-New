import { useEffect, useMemo, useState } from 'react'
import { ROUTES } from '@shared/constants/routeConstants'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowRight, BarChart3, CalendarCheck, CalendarClock, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, Clock3, FileText, Flame, FolderOpen, GraduationCap, IndianRupee, MessageCircle, PlayCircle, Settings2, Target, UserRound, Video } from 'lucide-react'
import './student-dashboard-v14.css'
import KPI from '@/components/common/KPI'
import { useAuth } from '@shared/hooks/useAuth'
import { studentsApi } from '@/api/students'
import { resolveUserId } from '@/services/profileService'
import { batchService } from '@shared/services/batchService'
import { getStudentAccessProgress, getStoredCoursePercentages } from '@features/student/utils/studentProgressAccess'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { resolveStudentClasses } from '@features/student/utils/resolveStudentClasses'
import useClassRefresh from '@features/student/hooks/useClassRefresh'
import { getStudentJoinState, normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'
import { useStudentClassScope } from '@features/student/hooks/useStudentClassScope'
import { readLocalScheduledClasses } from '@shared/services/localScheduleStore'
import toast from 'react-hot-toast'
import { getApiErrorMessage, paymentApi } from '@shared/services/apiServices'
import assessmentService from '@/services/assessmentService'

const EMPTY_ACTIVITY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, hours: 0 }))
const completedClassStatuses = new Set(['completed', 'ended', 'finished'])
const upcomingClassStatuses = new Set(['scheduled', 'upcoming', 'live', 'in-progress', 'started'])
const rowsFrom = (value) => {
  const rows = value?.content ?? value?.items ?? value?.records ?? value?.results ?? value?.data ?? value
  return Array.isArray(rows) ? rows : []
}
const readStoredListLength = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value.length : 0
  } catch {
    return 0
  }
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const classScope = useStudentClassScope()
  const firstName = user?.firstName || user?.name?.split(' ')?.[0] || 'Srinivas'
  const studentId = user?.studentId ?? user?.StudentId ?? user?.student?.studentId ?? user?.student?.id ?? resolveUserId(user)
  const isDemoSession = Boolean(user?.isDemo || localStorage.getItem('isDemo') === 'true' || String(user?.email || '').includes('demo'))
  const [dashboardData, setDashboardData] = useState(() => ({ progress: null, results: [], activity: [], attendance: [], enrollment: null, liveClasses: [], payments: [], assessments: [], loading: Boolean(studentId), paymentError: '', assessmentError: '' }))
  const now = useClassRefresh()

  useEffect(() => {
    let active = true
    if (!studentId) {
      return () => { active = false }
    }

    // Demo users do not have organization-student records in the API. Use the
    // demo session data instead of sending invalid profile/analytics requests.
    if (isDemoSession) {
      queueMicrotask(() => {
        if (!active) return
        setDashboardData({
          progress: null,
          results: [],
          activity: [],
          attendance: [],
          enrollment: { student: user, batch: user?.batch ?? null },
          liveClasses: normalizeLiveClassList(readLocalScheduledClasses()),
          payments: [],
          assessments: [],
          paymentError: '',
          assessmentError: '',
          loading: false,
          loadedAt: new Date().toISOString(),
        })
      })
      return () => { active = false }
    }

    // These organization analytics routes are admin-only and return 404/403
    // for student tokens. Use the supported student profile and live-class
    // endpoints; unavailable analytics remain empty instead of generating
    // repeated failed requests.
    Promise.allSettled([
      studentsApi.getById(studentId, { skipAuthRedirect: true }),
      liveClassService.upcoming({ studentId }),
      liveClassService.list({ studentId }),
      paymentApi.paymentHistory({ studentId }),
      assessmentService.getAvailableAssessments(),
      liveClassService.live({ studentId }),
      liveClassService.today({ studentId }),
      liveClassService.completed({ studentId }),
    ]).then(async ([studentResult, upcomingResult, allClassesResult, paymentResult, assessmentResult, liveResult, todayResult, completedResult]) => {
      if (!active) return
      const student = studentResult.status === 'fulfilled' ? studentResult.value?.data : null
      const batchId = student?.batchId ?? student?.batch?.batchId ?? student?.batch?.id ?? user?.batchId ?? user?.batch?.batchId ?? user?.batch?.id
      let batch = null

      if (batchId) {
        try {
          const batchResponse = await batchService.getById(batchId)
          batch = batchResponse?.data ?? batchResponse
        } catch {
          batch = null
        }
      }

      if (!active) return
      const resolvedClasses = await resolveStudentClasses([
        ...(upcomingResult.status === 'fulfilled' ? upcomingResult.value : []),
        ...(allClassesResult.status === 'fulfilled' ? allClassesResult.value : []),
        ...(liveResult.status === 'fulfilled' ? liveResult.value : []),
        ...(todayResult.status === 'fulfilled' ? todayResult.value : []),
        ...(completedResult.status === 'fulfilled' ? completedResult.value : []),
      ])
      if (!active) return
      setDashboardData({
        progress: null,
        results: [],
        activity: [],
        attendance: [],
        enrollment: { student, batch },
        liveClasses: resolvedClasses,
        payments: paymentResult.status === 'fulfilled' ? rowsFrom(paymentResult.value) : [],
        assessments: assessmentResult.status === 'fulfilled' ? rowsFrom(assessmentResult.value) : [],
        paymentError: paymentResult.status === 'rejected' ? getApiErrorMessage(paymentResult.reason, 'Payment information is unavailable.') : '',
        assessmentError: assessmentResult.status === 'rejected' ? getApiErrorMessage(assessmentResult.reason, 'Quiz status is unavailable.') : '',
        loading: false,
        loadedAt: new Date().toISOString(),
      })
    })

    return () => { active = false }
  }, [isDemoSession, studentId, user, now])

  const student = dashboardData.enrollment?.student
  const batch = dashboardData.enrollment?.batch
  const courseId = student?.courseId ?? student?.course?.courseId ?? student?.course?.id ?? batch?.courseId ?? batch?.course?.courseId ?? batch?.course?.id ?? user?.courseId ?? user?.course?.id
  const courseName = student?.courseName ?? student?.course?.courseName ?? student?.course?.name ?? batch?.courseName ?? batch?.course?.courseName ?? batch?.course?.name ?? user?.courseName ?? user?.course?.name ?? 'Assigned course'
  const mentorName = batch?.mentorName ?? batch?.mentor?.mentorName ?? batch?.mentor?.name ?? student?.mentorName ?? 'Not assigned'
  // Only classes from this student's own enrollments (the live-class
  // endpoints take no student filter). The demo session uses its local data.
  const scopedLiveClasses = isDemoSession ? dashboardData.liveClasses : dashboardData.liveClasses.filter((item) => classScope.allows(item))
  const classesByTime = [...scopedLiveClasses].sort((a, b) => new Date(a.startAt || 0) - new Date(b.startAt || 0))
  // The upcoming endpoint may still return rows whose status is scheduled or
  // upcoming after their scheduled time has passed. The dashboard must use the
  // actual start time as the source of truth so stale classes never appear in
  // the Upcoming Classes card.
  const upcomingClasses = classesByTime.filter((item) => {
    const status = String(item.status || '').toLowerCase()
    if (!upcomingClassStatuses.has(status)) return false
    if (['live', 'in-progress', 'started'].includes(status)) return true
    const startAt = new Date(item.startAt || 0).getTime()
    return Number.isFinite(startAt) && startAt >= now
  })
  const completedClasses = classesByTime.filter((item) => completedClassStatuses.has(String(item.status).toLowerCase())).reverse()
  const nextLiveClass = upcomingClasses[0]
  const pendingQuizzes = dashboardData.assessments.filter((item) => ['available', 'upcoming', 'pending', 'not attempted', 'not_attempted'].includes(String(item.status ?? (item.completed ? 'completed' : 'pending')).toLowerCase()))
  const completedQuizzes = dashboardData.assessments.filter((item) => ['attempted', 'completed', 'passed', 'failed'].includes(String(item.status ?? (item.completed ? 'completed' : '')).toLowerCase()))
  // Live classes open the embedded Jitsi classroom; nothing is recorded by the
  // click — attendance starts only when Jitsi reports the student in the room.
  const coursePath = courseId ? `/student/courses/${courseId}` : '/student/courses'
  const localPercent = Number(getStoredCoursePercentages()[String(courseId)] || 0)
  const apiProgress = Number(dashboardData.progress?.overallProgress ?? dashboardData.progress?.progressPercentage ?? dashboardData.progress?.percentage ?? 0) || 0
  const overallProgress = Math.round(Math.max(apiProgress, localPercent, getStudentAccessProgress()))
  const enrolledCourses = Number(dashboardData.progress?.enrolledCourses ?? dashboardData.progress?.courseCount ?? 1) || 1
  const completedLessons = Number(dashboardData.progress?.completedLessons ?? readStoredListLength(`course-progress-${courseId}-completed`)) || 0
  const attendanceSummary = useMemo(() => {
    const percentageFromProfile = Number(student?.attendance)
    if (Number.isFinite(percentageFromProfile)) {
      return {
        percentage: Math.max(0, Math.min(100, Math.round(percentageFromProfile))),
        note: percentageFromProfile > 0 ? 'Current class participation' : 'Attendance will appear after your first class',
      }
    }

    const rows = dashboardData.attendance
    if (!rows.length) {
      return { percentage: 0, note: 'Attendance will appear after your first class' }
    }

    const presentCount = rows.filter((record) => ['present', 'late'].includes(String(record.status ?? record.attendanceStatus).toLowerCase())).length
    const percentage = Math.round((presentCount / rows.length) * 100)
    return {
      percentage,
      note: `${presentCount} of ${rows.length} classes marked present`,
    }
  }, [dashboardData.attendance, student])

  const progressData = [
    { name: 'Completed', value: overallProgress, color: '#16a34a' },
    { name: 'In Progress', value: overallProgress > 0 && overallProgress < 100 ? 100 - overallProgress : 0, color: '#f39924' },
    { name: 'Not Started', value: overallProgress === 0 ? 100 : 0, color: '#fcd9a8' },
  ]

  const chartActivity = dashboardData.activity.length
    ? EMPTY_ACTIVITY.map((entry, index) => ({ ...entry, hours: Number(dashboardData.activity[index]?.hours ?? dashboardData.activity[index]?.durationHours ?? 0) }))
    : EMPTY_ACTIVITY
  const hasActivity = chartActivity.some((entry) => entry.hours > 0)
  const learningStreak = useMemo(() => {
    // Consecutive days (ending today or yesterday) with at least one recorded
    // learning activity. Activity rows come from the student analytics API.
    const days = new Set(dashboardData.activity
      .map((item) => new Date(item.date ?? item.activityDate ?? item.createdAt ?? item.timestamp ?? ''))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.toDateString()))
    if (!days.size) return 0
    const cursor = new Date()
    if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
    let streak = 0
    while (days.has(cursor.toDateString())) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }, [dashboardData.activity])
  const pendingPayments = dashboardData.payments.filter((payment) => !isPaidPayment(payment))
  const pendingAmount = pendingPayments.reduce((sum, payment) => sum + (Number(payment.dueAmount ?? payment.balanceAmount ?? payment.pendingAmount ?? payment.amount ?? payment.totalAmount ?? 0) || 0), 0)
  const stats = [
    { label: 'Enrolled Courses', value: String(enrolledCourses), note: courseName, icon: GraduationCap, path: ROUTES.STUDENT.COURSES, tone: 'purple' },
    { label: 'Completed Lessons', value: dashboardData.loading ? '...' : String(completedLessons), note: completedLessons ? 'From course progress' : 'No lessons completed yet', icon: CheckCircle2, path: ROUTES.STUDENT.COURSES, tone: 'green' },
    { label: 'Attendance', value: dashboardData.loading ? '...' : `${attendanceSummary.percentage}%`, note: dashboardData.loading ? 'Loading attendance summary' : attendanceSummary.percentage ? attendanceSummary.note : 'Attend your upcoming classes', icon: CalendarCheck, path: ROUTES.STUDENT.ATTENDANCE, tone: 'blue' },
    { label: 'Learning Streak', value: dashboardData.loading ? '...' : `${learningStreak} ${learningStreak === 1 ? 'day' : 'days'}`, note: learningStreak ? 'Keep it going today' : 'Start a learning streak today', icon: Flame, path: coursePath, tone: 'orange' },
    { label: 'Pending Payment', value: dashboardData.loading ? '...' : dashboardData.paymentError ? 'Unavailable' : formatRupees(pendingAmount), note: dashboardData.paymentError || (pendingPayments.length ? `${pendingPayments.length} pending ${pendingPayments.length === 1 ? 'payment' : 'payments'}` : dashboardData.payments.length ? 'All payments completed' : 'No payment records'), icon: IndianRupee, path: ROUTES.STUDENT.PAYMENTS, tone: 'amber' },
    { label: 'Quiz Status', value: dashboardData.loading ? '...' : dashboardData.assessmentError ? 'Unavailable' : `${pendingQuizzes.length} pending`, note: dashboardData.assessmentError || (dashboardData.assessments.length ? `${completedQuizzes.length} completed` : 'No quizzes available'), icon: ClipboardCheck, path: ROUTES.STUDENT.ASSESSMENTS, tone: 'sky' },
  ]

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const openClass = (item) => {
    if (!item?.id) return navigate(ROUTES.STUDENT.CLASS_SCHEDULE)
    const joinState = getStudentJoinState(item)
    if (!joinState.canJoin) {
      toast(joinState.message || 'This class cannot be joined right now.')
      return
    }
    navigate(ROUTES.STUDENT.CLASS_JOIN.replace(':classId', encodeURIComponent(item.id)), { state: { liveClass: item } })
  }

  const quickActions = [
    { label: 'Continue Learning', note: courseName, icon: PlayCircle, path: coursePath, tone: 'blue' },
    { label: 'Class Schedule', note: 'View upcoming sessions', icon: CalendarDays, path: ROUTES.STUDENT.CLASS_SCHEDULE, tone: 'sky' },
    { label: 'Assessments', note: 'Practice and submit work', icon: ClipboardCheck, path: ROUTES.STUDENT.ASSESSMENTS, tone: 'indigo' },
    { label: 'Course Materials', note: 'Notes and resources', icon: FolderOpen, path: ROUTES.STUDENT.MATERIALS, tone: 'amber' },
    { label: 'Mentor Chat', note: mentorName === 'Not assigned' ? 'Mentor will be assigned soon' : 'Chat with your mentor', icon: MessageCircle, path: ROUTES.STUDENT.MENTOR_CHAT, tone: 'purple' },
  ]

  // Recommended next steps are derived from the student's own state.
  const nextSteps = [
    nextLiveClass && getStudentJoinState(nextLiveClass).canJoin && { key: 'live', title: 'Your class is live now', text: `Join ${nextLiveClass.title || courseName} with your mentor and batch.`, action: 'Join Class', onClick: () => openClass(nextLiveClass), icon: Video },
    overallProgress === 0
      ? { key: 'start', title: 'Start your first lesson', text: 'Begin with your assigned course and take the first step towards your learning goals.', action: 'Continue Learning', onClick: () => navigate(coursePath), icon: Target }
      : overallProgress < 100 && { key: 'continue', title: 'Continue your course', text: `You are ${overallProgress}% through ${courseName}. Pick up where you left off.`, action: 'Continue Learning', onClick: () => navigate(coursePath), icon: Target },
    pendingQuizzes.length > 0 && { key: 'quiz', title: pendingQuizzes.length === 1 ? 'Take your pending quiz' : `Take your ${pendingQuizzes.length} pending quizzes`, text: 'Check your understanding and track your progress.', action: 'Open Assessments', onClick: () => navigate(ROUTES.STUDENT.ASSESSMENTS), icon: ClipboardCheck },
    nextLiveClass && !getStudentJoinState(nextLiveClass).canJoin && { key: 'class', title: 'Get ready for your next class', text: `${nextLiveClass.title || courseName} · ${nextLiveClass.dateLabel} · ${nextLiveClass.timeLabel}`, action: 'View Schedule', onClick: () => navigate(ROUTES.STUDENT.CLASS_SCHEDULE), icon: CalendarDays },
    pendingPayments.length > 0 && { key: 'payment', title: 'Complete your pending payment', text: `${formatRupees(pendingAmount)} is pending on your account.`, action: 'View Payments', onClick: () => navigate(ROUTES.STUDENT.PAYMENTS), icon: IndianRupee },
  ].filter(Boolean)


  return <div className="sd14 mx-auto w-full max-w-[1600px]">
    <header className="sd14-hero">
      <div className="sd14-hero__copy">
        <h1>{greeting}, <span>{firstName}!</span> <i aria-hidden="true">👋</i></h1>
        <p>Continue your learning journey and build new skills for a brighter tomorrow.</p>
      </div>
      <div className="sd14-hero__visual">
      <img className="sd14-hero__art" src={STUDENT_DASHBOARD_ART} alt="" decoding="async" draggable={false} />
      <p className="sd14-hero__script" aria-hidden="true"><span>Learn.</span><span>Grow.</span><span>Achieve</span><span>Together.</span></p>
      </div>
    </header>

    <section className="sd14-stats" aria-label="Learning summary">
      {stats.map(({ label, value, note, icon, path, tone }) => (
        <KPI key={label} label={label} value={value} description={note} icon={icon} accent={tone} loading={value === '...'} onClick={() => navigate(path)} />
      ))}
    </section>

    <section className="sd14-grid sd14-grid--classes" aria-label="Class summary">
      <Panel icon={CalendarDays} title="Upcoming Classes" onViewAll={() => navigate(ROUTES.STUDENT.CLASS_SCHEDULE)}>
        {upcomingClasses.length ? (
          <ul className="sd14-classes">
            {upcomingClasses.slice(0, 2).map((item, index) => <ClassRow key={item.id ?? index} item={item} index={index} onJoin={() => openClass(item)} onDetails={() => navigate(ROUTES.STUDENT.CLASS_SCHEDULE)} />)}
          </ul>
        ) : <Empty icon={CalendarDays} title={dashboardData.loading ? 'Loading classes...' : 'No upcoming classes scheduled.'} text={dashboardData.loading ? '' : 'Your organization will publish new classes for your batch here.'} />}
      </Panel>
      <Panel icon={GraduationCap} title="Completed Classes" onViewAll={() => navigate(ROUTES.STUDENT.CLASS_SCHEDULE)}>
        {completedClasses.length ? (
          <ul className="sd14-classes">
            {completedClasses.slice(0, 2).map((item, index) => <ClassRow key={item.id ?? index} item={item} index={index} completed onDetails={() => navigate(item.hasRecording ? ROUTES.STUDENT.RECORDINGS : ROUTES.STUDENT.CLASS_SCHEDULE)} />)}
          </ul>
        ) : <Empty icon={GraduationCap} title={dashboardData.loading ? 'Loading classes...' : 'No completed classes yet.'} text={dashboardData.loading ? '' : 'Your completed classes will appear here with recordings, attendance and mentor details.'} />}
      </Panel>
    </section>

    <section className="sd14-panel sd14-quick" aria-label="Quick actions">
      <h2 className="sd14-panel__title">Quick Actions</h2>
      <div className="sd14-quick__grid">
        {quickActions.map(({ label, note, icon: Icon, path, tone }) => (
          <button type="button" key={label} className={`sd14-quick__card is-${tone}`} onClick={() => navigate(path)}>
            <span className="sd14-quick__icon" aria-hidden="true"><Icon /></span>
            <span className="sd14-quick__text"><b>{label}</b><small>{note}</small></span>
            <ChevronRight className="sd14-quick__chev" aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>

    <section className="sd14-grid sd14-grid--main">
      <Panel icon={BarChart3} title="Learning Progress">
        <div className="sd14-progress">
          <div className="sd14-progress__ring" role="img" aria-label={`${overallProgress}% complete`} style={{ background: progressRing(progressData) }}>
            <div className="sd14-progress__value"><b>{overallProgress}%</b><small>Complete</small></div>
          </div>
          <div className="sd14-progress__body">
            <b>{courseName}</b>
            <p>{overallProgress ? 'Keep the momentum going with your next lesson.' : 'Start your first lesson and build your learning momentum.'}</p>
            <ul>{progressData.map((item) => <li key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}%</b></li>)}</ul>
            <button type="button" className="sd14-btn sd14-btn--outline" onClick={() => navigate(coursePath)}>Open course <ArrowRight /></button>
          </div>
        </div>
      </Panel>
      <Panel icon={Activity} title="Weekly Learning Activity" aside={<span className="sd14-chip">This Week</span>}>
        <div className="sd14-chart">
          <ResponsiveContainer><AreaChart data={chartActivity} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}><defs><linearGradient id="sd14Activity" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2f6fe4" stopOpacity=".35" /><stop offset="100%" stopColor="#2f6fe4" stopOpacity=".02" /></linearGradient></defs><CartesianGrid stroke="#e6edf7" strokeDasharray="4 5" vertical={false} /><XAxis dataKey="day" tick={{ fill: '#5e7089', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} domain={[0, (max) => Math.max(6, Math.ceil(max))]} tick={{ fill: '#5e7089', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip formatter={(value) => [`${value} h`, 'Learning']} /><Area type="monotone" dataKey="hours" stroke={hasActivity ? '#2f6fe4' : '#f39924'} strokeWidth={2.5} fill={hasActivity ? 'url(#sd14Activity)' : 'none'} /></AreaChart></ResponsiveContainer>
          {!hasActivity && (
            <div className="sd14-chart__empty">
              <span aria-hidden="true"><BarChart3 /></span>
              <b>No learning activity yet.</b>
              <small>Complete a lesson or attend a class to start building your weekly activity.</small>
            </div>
          )}
        </div>
      </Panel>
      <Panel icon={Video} title="Live Class" onViewAll={() => navigate(ROUTES.STUDENT.CLASS_SCHEDULE)} viewAllLabel="View Schedule">
        <div className="sd14-live">
          <span className={`sd14-live__tag ${nextLiveClass && getStudentJoinState(nextLiveClass).canJoin ? 'is-live' : ''}`}>{nextLiveClass ? (getStudentJoinState(nextLiveClass).canJoin ? 'Live now' : 'Upcoming session') : 'Schedule pending'}</span>
          <h3>{nextLiveClass?.title || nextLiveClass?.courseName || courseName}</h3>
          <p><CalendarDays aria-hidden="true" />{nextLiveClass ? `${nextLiveClass.dateLabel} • ${nextLiveClass.timeLabel}` : 'Check your class schedule for updates'}</p>
          <p><UserRound aria-hidden="true" />{nextLiveClass?.mentorName && nextLiveClass.mentorName !== 'Not Assigned' ? nextLiveClass.mentorName : mentorName === 'Not assigned' ? 'Mentor will be assigned soon' : mentorName}</p>
          {nextLiveClass && <span className="sd14-badge is-blue sd14-live__mode"><Video aria-hidden="true" />Online</span>}
        </div>
        <div className="sd14-live__actions">
          <button type="button" className="sd14-btn sd14-btn--outline" onClick={() => navigate(ROUTES.STUDENT.CLASS_SCHEDULE)}>View Schedule</button>
          <button type="button" className="sd14-btn sd14-btn--primary" onClick={() => openClass(nextLiveClass)} disabled={!nextLiveClass}>Join Class <ArrowRight /></button>
        </div>
      </Panel>
    </section>

    <section className="sd14-grid sd14-grid--bottom">
      <Panel icon={CalendarClock} title="Recent Activity" onViewAll={() => navigate(coursePath)}>
        <RecentActivity rows={dashboardData.activity} coursePath={coursePath} courseName={courseName} />
      </Panel>
      <NextStepCarousel steps={nextSteps} />
    </section>
  </div>
}

// Hero illustration: the supplied organization dashboard artwork (transparent PNG).
const STUDENT_DASHBOARD_ART = '/assets/Org/OrgDashBordHeroBanner.png'
const isPaidPayment = (record) => ['paid', 'paid in full', 'completed', 'success', 'successful']
  .includes(String(record?.status ?? record?.paymentStatus ?? '').toLowerCase())
// Donut as a conic gradient: each segment's share of 100%, in legend order.
const progressRing = (segments) => {
  let start = 0
  const stops = segments.filter((item) => item.value > 0).map((item) => {
    const end = Math.min(100, start + item.value)
    const stop = `${item.color} ${start}% ${end}%`
    start = end
    return stop
  })
  return `conic-gradient(${stops.join(', ') || '#e2e8f0 0% 100%'})`
}
const formatRupees = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`

function Panel({ icon: Icon, title, children, onViewAll, viewAllLabel = 'View all', aside, className = '' }) {
  return <article className={`sd14-panel ${className}`}>
    <header className="sd14-panel__head">
      <h2 className="sd14-panel__title">{Icon && <Icon aria-hidden="true" />}{title}</h2>
      {aside}
      {onViewAll && <button type="button" className="sd14-link" onClick={onViewAll}>{viewAllLabel} <ArrowRight /></button>}
    </header>
    {children}
  </article>
}

function Empty({ icon: Icon, title, text }) {
  return <div className="sd14-empty"><span aria-hidden="true"><Icon /></span><b>{title}</b>{text && <small>{text}</small>}</div>
}

function ClassRow({ item, index, completed = false, onJoin, onDetails }) {
  const start = new Date(item.startAt || '')
  const valid = !Number.isNaN(start.getTime())
  const end = new Date(item.endAt || '')
  const minutes = Number(item.durationMinutes) || (valid && !Number.isNaN(end.getTime()) ? Math.round((end - start) / 60000) : 0)
  const joinState = getStudentJoinState(item)
  const isLive = !completed && joinState.canJoin
  const Icon = index % 2 ? FileText : Settings2
  return <li className="sd14-class">
    <span className="sd14-class__date">
      <b>{valid ? String(start.getDate()).padStart(2, '0') : '--'}</b>
      <small>{valid ? start.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Date TBA'}</small>
      <small>{valid ? start.toLocaleDateString('en-GB', { weekday: 'short' }) : ''}</small>
    </span>
    <span className={`sd14-class__icon ${index % 2 ? 'is-blue' : 'is-purple'}`} aria-hidden="true"><Icon /></span>
    <span className="sd14-class__info">
      <b title={item.title}>{item.title || item.courseName || 'Class session'}</b>
      <small>{item.courseName && item.courseName !== '-' ? item.courseName : item.batchName || 'Class details'}</small>
      <small><Clock3 aria-hidden="true" />{item.timeLabel || 'Time unavailable'}{minutes > 0 ? ` (${minutes} mins)` : ''}</small>
    </span>
    <span className="sd14-class__badges">
      <span className="sd14-badge is-blue"><Video aria-hidden="true" />Online</span>
      {completed
        ? <span className="sd14-badge is-green">Completed</span>
        : isLive ? <span className="sd14-badge is-green"><i />Live</span> : <span className="sd14-badge is-orange">Upcoming</span>}
    </span>
    {isLive
      ? <button type="button" className="sd14-btn sd14-btn--primary" onClick={onJoin}>Join Class <ArrowRight /></button>
      : <button type="button" className="sd14-btn sd14-btn--outline" onClick={onDetails}>{completed && item.hasRecording ? 'Recording' : 'View Details'} <ArrowRight /></button>}
  </li>
}

function RecentActivity({ rows, coursePath, courseName }) {
  const navigate = useNavigate()
  if (!rows.length) {
    return <Empty icon={FileText} title="Your learning journey starts here." text="Complete your first lesson, attend a class, or submit an assessment to see your activity here." />
  }
  return <ul className="sd14-activity">{rows.slice(0, 3).map((item, index) => <li key={item.id ?? index}><button type="button" onClick={() => navigate(coursePath)}><span aria-hidden="true"><Check /></span><span><b>{item.title ?? item.activityType ?? 'Learning activity'}</b><small>{item.description ?? `${courseName} course`}</small></span><time>{item.timeAgo ?? item.date ?? ''}</time><ChevronRight aria-hidden="true" /></button></li>)}</ul>
}

function NextStepCarousel({ steps }) {
  const [index, setIndex] = useState(0)
  const count = steps.length
  const current = count ? steps[Math.min(index, count - 1)] : null
  const go = (delta) => setIndex((value) => (count ? (Math.min(value, count - 1) + delta + count) % count : 0))
  const Icon = current?.icon ?? Target
  return <article className="sd14-panel sd14-next" aria-roledescription="carousel" aria-label="Recommended next step">
    <header className="sd14-panel__head">
      <h2 className="sd14-panel__title"><Target aria-hidden="true" />Recommended Next Step</h2>
      {count > 1 && <span className="sd14-dots" role="tablist" aria-label="Choose a step">{steps.map((step, dot) => <button key={step.key} type="button" role="tab" aria-selected={dot === Math.min(index, count - 1)} aria-label={step.title} onClick={() => setIndex(dot)} />)}</span>}
    </header>
    {current ? (
      <div className="sd14-next__body">
        {count > 1 && <button type="button" className="sd14-next__nav" onClick={() => go(-1)} aria-label="Previous step"><ChevronLeft /></button>}
        <span className="sd14-next__art" aria-hidden="true"><Icon /></span>
        <div className="sd14-next__copy">
          <b>{current.title}</b>
          <p>{current.text}</p>
          <button type="button" className="sd14-btn sd14-btn--primary" onClick={current.onClick}>{current.action} <ArrowRight /></button>
        </div>
        {count > 1 && <button type="button" className="sd14-next__nav" onClick={() => go(1)} aria-label="Next step"><ChevronRight /></button>}
      </div>
    ) : <Empty icon={CheckCircle2} title="You're all caught up." text="New recommendations will appear as your course progresses." />}
  </article>
}
