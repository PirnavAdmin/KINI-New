import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Users, LayoutDashboard, TrendingUp, ListChecks,
  Clock, Video, FolderOpen, Award, StickyNote,
  MessageSquare, CalendarClock, Download, CheckCircle2, XCircle,
  FileIcon, Link2, Code2, Presentation, HelpCircle, Share2,
  Plus, GraduationCap, Layers3, UserCheck, ShieldCheck, BadgeCheck, Target, BookOpen,
  Zap, CalendarCheck, Upload as UploadIcon, BarChart3, Info, Loader2,
} from 'lucide-react'
import KPI from '@/components/common/KPI'
import MentorBanner from '../components/MentorBanner'
import { MENTOR_BANNERS } from '../constants/mentorBanners'
import {
  findStudentById, generateLearningProgress,
  generateStudentAttendance, generateStudentCertificates, MENTOR_NOTES_SEED,
} from '@shared/data/mentorStudentWorkspaceMockData'
import assessmentService from '@/services/assessmentService'
import { courseMaterialService } from '@shared/services/courseMaterialService'
import { triggerFileDownload } from '@shared/utils/download'
import { normalizeProgressPercentage } from '../hooks/useMentorStudents'
import { useProfilePhoto } from '@shared/hooks/useProfilePhoto'
import { PROFILE_TYPE } from '@shared/services/profilePhotoService'
import { AvatarPhoto } from '@/components/common/ProfileImage'

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'progress', label: 'Learning Progress', icon: TrendingUp },
  { id: 'assessments', label: 'Assessments', icon: ListChecks },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'resources', label: 'Resources', icon: FolderOpen },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'notes', label: 'Mentor Notes', icon: StickyNote },
]

const RISK_CONFIG = {
  low: { label: 'Low Risk', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' },
  medium: { label: 'Medium Risk', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' },
  high: { label: 'High Risk', classes: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' },
}


const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const belongsToBatch = (assessment, batch) => {
  const expectedId = batch?.batchId ?? batch?.id
  const expectedName = String(batch?.batchName ?? batch?.name ?? '').trim().toLowerCase()
  const assessmentBatchId = assessment?.batchId ?? assessment?.batch?.batchId ?? assessment?.batch?.id
  const assessmentBatchName = String(
    assessment?.batchName ?? assessment?.batch?.batchName ?? assessment?.batch?.name ?? assessment?.batch ?? ''
  ).trim().toLowerCase()

  return (expectedId != null && assessmentBatchId != null && String(expectedId) === String(assessmentBatchId))
    || Boolean(expectedName && assessmentBatchName === expectedName)
}

const assessmentScore = (assessment) => {
  const value = assessment?.score ?? assessment?.percentage ?? assessment?.average
    ?? assessment?.result?.score ?? assessment?.marksObtained;
  const number = Number(value);
  if (Number.isFinite(number) && number >= 0) return number;
  return null;
}

const SHOW_LEGACY_STUDENT_WORKSPACE_CARDS = new URLSearchParams('').has('legacy')

// Stat tiles use the global KPI card (same design in every portal).
const STAT_TILE_ACCENTS = { purple: "purple", emerald: "green", amber: "orange", rose: "red", blue: "blue" }

function StatTile({ label, value, icon, color = "blue" }) {
  return <KPI label={label} value={value} icon={icon} accent={STAT_TILE_ACCENTS[color] ?? "blue"} />
}

export default function MentorStudentWorkspace() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('overview')
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState('observation')
  const [assessments, setAssessments] = useState([])
  const [assessmentsLoading, setAssessmentsLoading] = useState(true)
  const [assessmentsError, setAssessmentsError] = useState('')
  const [resources, setResources] = useState([])
  const [resourcesLoading, setResourcesLoading] = useState(true)
  const [resourcesError, setResourcesError] = useState('')
    const [downloadingReport, setDownloadingReport] = useState(false)
    const [downloadingResource, setDownloadingResource] = useState(null)

  const liveStudent = location.state?.student
  const mockResult = useMemo(() => findStudentById(studentId), [studentId])
  const student = useMemo(() => liveStudent ? {
    ...liveStudent,
    studentId: liveStudent.studentId ?? liveStudent.id,
    progressPct: normalizeProgressPercentage(liveStudent.progress, liveStudent.progressPercentage, liveStudent.completionPercentage),
    attendancePct: Number(liveStudent.attendance ?? liveStudent.attendancePercentage ?? 0),
    assessmentScore: Number(liveStudent.quizAverage ?? liveStudent.assessmentScore ?? 0),
    enrollmentDate: liveStudent.enrolledAt ?? liveStudent.joinedDate,
    riskLevel: liveStudent.riskLevel || 'low',
  } : mockResult.student, [liveStudent, mockResult.student])
  const batch = useMemo(() => liveStudent ? {
    batchId: liveStudent.batchId,
    batchName: liveStudent.batch || liveStudent.batchName || 'Assigned batch',
    courseName: liveStudent.course || liveStudent.courseName || 'Assigned course',
    currentModule: liveStudent.currentModule || 'Curriculum in progress',
    nextLiveClass: liveStudent.nextLiveClass || null,
  } : mockResult.batch, [liveStudent, mockResult.batch])
  // Only a live student carries a real Student profile id; mock records show initials.
  const { photoUrl } = useProfilePhoto(PROFILE_TYPE.STUDENT, liveStudent?.photoStudentId)
  const [notes, setNotes] = useState(MENTOR_NOTES_SEED)

  useEffect(() => {
    let isCurrent = true

    const loadAssessments = async () => {
      setAssessmentsLoading(true)
      setAssessmentsError('')
      try {
        const items = await assessmentService.getAssessments()
        if (isCurrent) setAssessments(items.filter((assessment) => belongsToBatch(assessment, batch)))
      } catch {
        if (isCurrent) {
          setAssessments([])
          setAssessmentsError('Unable to load assessments for this batch.')
        }
      } finally {
        if (isCurrent) setAssessmentsLoading(false)
      }
    }

    loadAssessments()
    return () => { isCurrent = false }
  }, [batch])

  useEffect(() => {
    let isCurrent = true
    const courseName = String(batch?.courseName ?? '').trim().toLowerCase()

    const loadResources = async () => {
      setResourcesLoading(true)
      setResourcesError('')
      try {
        const items = await courseMaterialService.list()
        if (isCurrent) {
          setResources(items.filter((item) => String(item.courseName ?? '').trim().toLowerCase() === courseName))
        }
      } catch {
        if (isCurrent) {
          setResources([])
          setResourcesError('Unable to load course materials.')
        }
      } finally {
        if (isCurrent) setResourcesLoading(false)
      }
    }

    loadResources()
    return () => { isCurrent = false }
  }, [batch?.courseName])

  const learningProgress = useMemo(() => generateLearningProgress(student, batch), [student, batch])
  const attendance = useMemo(() => generateStudentAttendance(student), [student])
  const certificates = useMemo(() => generateStudentCertificates(student, batch), [student, batch])

  const assessmentAverage = useMemo(() => {
    const scores = assessments.map(assessmentScore).filter((score) => score !== null)
    if (scores.length) return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    const fallback = Number(student.assessmentScore)
    return Number.isFinite(fallback) && fallback > 0 ? Math.round(fallback) : null
  }, [assessments, student.assessmentScore])

  if (!student || !batch) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-12 text-center">
        <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <p className="text-sm font-medium text-slate-500">Student not found</p>
        <button onClick={() => navigate('/mentor/students')} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Students
        </button>
      </div>
    )
  }

  const riskCfg = RISK_CONFIG[student.riskLevel] || RISK_CONFIG.low

  const handleAddNote = () => {
    if (!noteText.trim()) return
    setNotes((prev) => [{ id: Date.now(), text: noteText.trim(), type: noteType, date: formatDate(new Date().toISOString()) }, ...prev])
    setNoteText('')
    toast.success('Note added.')
  }

  const initials = String(student.avatar || student.name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase().slice(0, 2)
  const isActive = String(student.status || '').toLowerCase() === 'active'
  const latestAssessment = assessmentsLoading ? 'Loading...' : assessments[0]?.title || 'No assessments assigned'
    const downloadReport = async () => {
    if (downloadingReport) return
    setDownloadingReport(true)
    const lines = [
      ['Student', student.name], ['Student ID', student.studentId],
      ['Course', batch.courseName], ['Batch', batch.batchName], ['Status', student.status], ['Risk level', riskCfg.label],
      ['Attendance', `${student.attendancePct}%`], ['Course progress', `${student.progressPct}%`],
      ['Assessment average', assessmentAverage !== null ? `${assessmentAverage}%` : 'Not available'], ['Latest assessment', latestAssessment],
      ['Generated', new Date().toLocaleString('en-IN')],
    ]
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    try {
      const csv = lines.map((line) => line.map(escape).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      if (!(blob instanceof Blob) || blob.size === 0) throw new Error('Empty report file received.')
      const filename = `${String(student.name || 'student').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'student'}-report.csv`
      triggerFileDownload(blob, filename)
      toast.success('Report downloaded.')
    } catch (error) {
      toast.error(error?.message || 'Unable to download report.')
    } finally {
      setDownloadingReport(false)
    }

  }

  const downloadResource = async (resource) => {
    if (!resource || downloadingResource != null) return
    setDownloadingResource(resource.materialId ?? resource.id)
    try {
      const blob = await courseMaterialService.file(resource)
      const filename = resource.pdfFileName ?? resource.fileName ?? resource.title ?? 'course-material'
      triggerFileDownload(blob, /\.[a-z0-9]{2,5}$/i.test(filename) ? filename : `${filename}.pdf`)
      toast.success('Resource downloaded successfully.')
    } catch (error) {
      toast.error(error?.response?.status === 404 ? 'This resource is no longer available.' : 'Unable to download this resource.')
    } finally {
      setDownloadingResource(null)
    }
  }
  const scheduleMeeting = () => {
    const batchId = batch.batchId ?? student.batchId
    const courseId = batch.courseId ?? student.courseId
    if (!batchId || !courseId) {
      toast.error('Course and batch are required to schedule a meeting.')
      return
    }
    navigate('/mentor/live-classes', {
      state: {
        createLiveClass: {
          classTitle: `Student meeting: ${student.name}`,
          batchId,
          courseId,
          batchName: batch.batchName,
          courseName: batch.courseName,
          studentId: student.studentId ?? student.id,
          studentName: student.name,
        },
      },
    })
  }
  const ring = (value, color, track) => {
    const pct = Math.max(0, Math.min(100, Number(value) || 0))
    return (
      <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, ${track} 0deg)` }}>
        <div className="grid h-[78px] w-[78px] place-items-center rounded-full bg-white text-xl font-extrabold text-[#0f2a4a] dark:bg-slate-900 dark:text-white">{pct}%</div>
      </div>
    )
  }
  const infoRows = [
    ['Full Name', student.name, Users],
    ['Batch', batch.batchName, Layers3], ['Enrollment Status', student.enrollmentStatus || 'Enrolled', UserCheck],
    ['Join Date', formatDate(student.enrollmentDate), CalendarClock], ['Last Active', student.lastActive || 'Not available', Clock], ['Risk Level', riskCfg.label, ShieldCheck],
  ]

  return (
    <div className="mx-auto max-w-[1500px] space-y-3.5 px-3 py-3 sm:px-4">
      {/* Header */}
      <MentorBanner
        variant="workspace"
        image={MENTOR_BANNERS.studentWorkspace}
        leading={(
          <>
            <button type="button" onClick={() => navigate('/mentor/students')} className="mws-back" aria-label="Back to My Students"><ArrowLeft /></button>
            <span className="mws-avatar">
              <span className="absolute inset-0 grid place-items-center overflow-hidden rounded-full"><AvatarPhoto src={photoUrl} fallback={initials} /></span>
              {isActive && <i aria-label="Active student" />}
            </span>
          </>
        )}
        title={student.name}
        titleAside={(
          <>
            <span className="mws-badge mws-badge--green">{student.status}</span>
            <span className={`mws-badge ${riskCfg.classes}`}>{riskCfg.label}</span>
          </>
        )}
        meta={(
          <p className="mws-meta">
            <span><BadgeCheck aria-hidden="true" />ID: {student.studentId}</span>
            <span><Layers3 aria-hidden="true" />Batch: {batch.batchName}</span>
            <span><Users aria-hidden="true" />Status: {student.enrollmentStatus || 'Enrolled'}</span>
          </p>
        )}
        script={['Better Skills', 'Brighter Tomorrow']}
        actions={(
          <>
            <button type="button" onClick={() => navigate(`/mentor/messages?studentId=${student.studentId ?? student.id}`)} className="mentor-hero-btn mentor-hero-btn--ghost"><MessageSquare aria-hidden="true" />Message Student</button>
            <button type="button" onClick={scheduleMeeting} className="mentor-hero-btn mentor-hero-btn--ghost"><CalendarClock aria-hidden="true" />Schedule Meeting</button>
            <button type="button" onClick={downloadReport} disabled={downloadingReport} className="mentor-hero-btn mentor-hero-btn--primary">{downloadingReport ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}{downloadingReport ? 'Downloading...' : 'Download Report'}</button>
          </>
        )}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPI variant="eyebrow" size="compact" showArrow iconShape="circle" accent="blue" icon={Users} label="Attendance" value={`${student.attendancePct}%`} description="Classes attended" onClick={() => setActiveTab('attendance')} />
        <KPI variant="eyebrow" size="compact" showArrow iconShape="circle" accent="purple" icon={BarChart3} label="Course Progress" value={`${student.progressPct}%`} description="Modules completed" onClick={() => setActiveTab('progress')} />
        <KPI variant="eyebrow" size="compact" showArrow iconShape="circle" accent="orange" icon={ListChecks} label="Assessment Avg" value={assessmentAverage !== null ? `${assessmentAverage}%` : 'Not available'} description="Average score" onClick={() => setActiveTab('assessments')} />
        <KPI variant="eyebrow" size="compact" showArrow iconShape="circle" accent="green" icon={Clock} label="Last Active" value={student.lastActive || 'Not available'} description="Last login" />
        <KPI variant="eyebrow" size="compact" showArrow iconShape="circle" accent="red" icon={Video} label="Upcoming Class" value={batch.nextLiveClass ? `${batch.nextLiveClass.date}, ${batch.nextLiveClass.time}` : 'None'} description="Next scheduled class" onClick={() => navigate('/mentor/calendar')} />
      </div>

      {/* Tabs */}
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-[#e6edf6] bg-white px-2 shadow-[0_4px_16px_rgba(15,42,74,.05)] scrollbar-hide dark:border-slate-700 dark:bg-slate-900" aria-label="Student workspace sections">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const selected = activeTab === tab.id
          return (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} aria-current={selected ? 'page' : undefined}
              className={`flex items-center gap-2 whitespace-nowrap border-b-[3px] px-5 py-3.5 text-[15px] font-semibold transition ${selected ? 'border-[#1f6fe5] bg-[#eef4fd] text-[#1f6fe5]' : 'border-transparent text-[#133b5d] hover:text-[#1f6fe5] dark:text-slate-300'}`}>
              <Icon className="h-5 w-5" /> {tab.label}
            </button>
          )
        })}
      </nav>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid gap-3.5 xl:grid-cols-[1fr_1fr_0.95fr]">
            <section className="rounded-2xl border border-[#e6edf6] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
              <h3 className="flex items-center gap-3 text-lg font-bold text-[#0f2a4a] dark:text-white"><Users className="h-5 w-5 text-[#2f6fe4]" />Student Information</h3>
              <dl className="mt-3 divide-y divide-[#eef2f7] dark:divide-slate-800">
                {infoRows.map(([label, value, Icon]) => (
                  <div key={label} className="flex items-center gap-3 py-2.5 text-[15px]">
                    <Icon className="h-4 w-4 shrink-0 text-[#4b5f78]" />
                    <dt className="w-40 shrink-0 text-[#4b5f78]">{label}</dt>
                    <dd className="min-w-0 truncate font-medium text-[#0f2a4a] dark:text-white">
                      {label === 'Enrollment Status' ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">{value}</span>
                        : label === 'Risk Level' ? <span className={`rounded-full px-3 py-1 text-sm font-bold ${riskCfg.classes}`}>{value}</span> : value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <div className="space-y-3.5">
              <section className="rounded-2xl border border-[#e6edf6] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-3 text-lg font-bold text-[#0f2a4a] dark:text-white"><Target className="h-5 w-5 text-[#F39924]" />Current Focus</h3>
                  <button type="button" onClick={() => navigate('/mentor/courses')} className="rounded-lg border border-[#bcd2f1] px-3 py-1.5 text-sm font-semibold text-[#1f6fe5] hover:bg-[#f3f8ff]">View Course</button>
                </div>
                <dl className="mt-3 space-y-2.5 text-[15px]">
                  {[['Current Module', batch.currentModule], ['Current Lesson', `Lesson ${Math.max(1, learningProgress?.completedModules || 1)} - State Patterns`], ['Latest Assessment', latestAssessment]].map(([label, value]) => (
                    <div key={label} className="flex gap-4"><dt className="w-40 shrink-0 text-[#4b5f78]">{label}</dt><dd className="min-w-0 truncate font-medium text-[#0f2a4a] dark:text-white">{value}</dd></div>
                  ))}
                </dl>
                <div className="mt-4 flex gap-3.5 rounded-xl bg-[#f3f7fd] p-4 dark:bg-slate-800">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-[#2f6fe4] dark:bg-slate-900"><BookOpen className="h-6 w-6" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#1f6fe5]">Learning Path</p>
                    <p className="text-sm text-[#4b5f78]">Keep going! Complete your current module to unlock the next one.</p>
                    <div className="mt-2 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#dfe7f1]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={student.progressPct}><div className="h-full rounded-full bg-[#2f6fe4]" style={{ width: `${student.progressPct}%` }} /></div><b className="text-sm text-[#0f2a4a] dark:text-white">{student.progressPct}%</b></div>
                  </div>
                </div>
              </section>
              <section className="rounded-2xl border border-[#e6edf6] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
                <h3 className="flex items-center gap-3 text-lg font-bold text-[#0f2a4a] dark:text-white"><Zap className="h-5 w-5 text-[#F39924]" />Quick Actions</h3>
                <div className="mt-3 grid grid-cols-3 gap-2.5">
                  {[['Mark Attendance', CalendarCheck, 'bg-[#e3f7ef] text-[#0f8c5b]', () => navigate('/mentor/calendar?tab=completed')], ['Upload Materials', UploadIcon, 'bg-[#e8f1ff] text-[#1d5fcc]', () => setActiveTab('resources')], ['Request Reschedule', CalendarClock, 'bg-[#f1ebfe] text-[#6d3fd0]', () => navigate('/mentor/calendar')]].map(([label, Icon, tone, action]) => (
                    <button key={label} type="button" onClick={action} className={`flex flex-col items-center gap-2 rounded-xl px-2 py-4 text-sm font-bold transition hover:-translate-y-0.5 ${tone}`}><Icon className="h-6 w-6" />{label}</button>
                  ))}
                </div>
              </section>
            </div>
            <div className="space-y-3.5">
              <section className="rounded-2xl border border-[#e6edf6] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
                <h3 className="flex items-center gap-3 text-lg font-bold text-[#0f2a4a] dark:text-white"><BarChart3 className="h-5 w-5 text-[#2f6fe4]" />Performance Summary</h3>
                  <div className="mt-5 grid grid-cols-2 items-start gap-4 text-center">
                    <div className="flex min-w-0 min-h-[158px] flex-col items-center rounded-xl bg-[#f8fbff] px-2.5 py-3 dark:bg-slate-800/70">{ring(student.attendancePct, '#2f6fe4', '#e3edfb')}<p className="relative z-10 mt-3 min-h-10 w-full whitespace-normal break-words text-sm font-bold leading-5 text-[#0f2a4a] dark:text-white">Attendance</p><p className="relative z-10 min-h-5 w-full whitespace-normal text-xs leading-4 text-[#4b5f78]">{student.attendancePct}% of classes</p></div>
                    <div className="flex min-w-0 min-h-[158px] flex-col items-center rounded-xl bg-[#fbf9ff] px-2.5 py-3 dark:bg-slate-800/70">{ring(assessmentAverage ?? 0, '#7c4ddb', '#efe9fd')}<p className="relative z-10 mt-3 min-h-10 w-full whitespace-normal break-words text-sm font-bold leading-5 text-[#0f2a4a] dark:text-white">Assessment Score</p><p className="relative z-10 min-h-5 w-full whitespace-normal text-xs leading-4 text-[#4b5f78]">{assessmentAverage !== null ? 'Average score' : 'No assessments yet'}</p></div>
                </div>
              </section>
              <section className="rounded-2xl border border-[#e6edf6] bg-white p-5 shadow-[0_4px_16px_rgba(15,42,74,.05)] dark:border-slate-700 dark:bg-slate-900">
                <h3 className="flex items-center gap-3 text-lg font-bold text-[#0f2a4a] dark:text-white"><Clock className="h-5 w-5 text-[#2f6fe4]" />Recent Activity</h3>
                <ul className="mt-3 space-y-3 text-[15px]">
                  {student.enrollmentDate && <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><UserCheck className="h-4 w-4" /></span><span className="flex-1 text-[#0f2a4a] dark:text-white">Student enrolled in batch</span><span className="text-sm text-[#4b5f78]">{formatDate(student.enrollmentDate)}</span></li>}
                  {assessments[0] && <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600"><ListChecks className="h-4 w-4" /></span><span className="flex-1 truncate text-[#0f2a4a] dark:text-white">Assessment assigned: {assessments[0].title}</span></li>}
                  <li className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-50 text-orange-500"><Info className="h-4 w-4" /></span><span className="flex-1 text-[#0f2a4a] dark:text-white">{student.lastActive && student.lastActive !== 'Not available' ? `Last active ${student.lastActive}` : 'No recent activity'}</span><span className="text-sm text-[#4b5f78]">—</span></li>
                </ul>
              </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && learningProgress && (
          <motion.div key="progress" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
              <StatTile label="Course Progress" value={`${learningProgress.courseProgress}%`} icon={TrendingUp} color="purple" />
              <StatTile label="Completed Lessons" value={learningProgress.completedLessons} icon={CheckCircle2} color="emerald" />
              <StatTile label="Remaining Lessons" value={learningProgress.remainingLessons} icon={XCircle} color="amber" />
              <StatTile label="Avg Watch Time" value={`${learningProgress.avgWatchTimeMin} min`} icon={Clock} color="blue" />
            </div>
            <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Module Progress ({learningProgress.completedModules}/{learningProgress.totalModules})</h3>
              <div className="space-y-2.5">
                {learningProgress.modules.map((m) => {
                  const progressPercentage = normalizeProgressPercentage(m.progress, m.progressPercentage, m.completionPercentage)
                  return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]"><span className="font-medium text-slate-600 dark:text-slate-300">{m.name}</span><span className="font-bold text-slate-900 dark:text-white">{progressPercentage}%</span></div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercentage}><div className={`h-full rounded-full ${progressPercentage === 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${progressPercentage}%` }} /></div>
                  </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'assessments' && (
          <motion.div key="assessments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHOW_LEGACY_STUDENT_WORKSPACE_CARDS && assessments.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{a.title}</p>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${a.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'}`}>{a.passed ? 'Pass' : 'Fail'}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{a.attempts} attempt{a.attempts !== 1 ? 's' : ''} · {a.timeTakenMin} min</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 text-center"><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{a.score}%</p><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Score</p></div>
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 text-center"><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{a.questionAnalysis.correct}/{a.questionAnalysis.total}</p><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Correct</p></div>
                </div>
                <button onClick={() => toast.success('Opening question analysis...')} className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-purple-50 py-1.5 text-[11px] font-semibold text-purple-600 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400"><HelpCircle className="w-3 h-3" /> Question Analysis</button>
              </motion.div>
            ))}
            {assessmentsLoading && [1, 2].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="mt-6 grid grid-cols-2 gap-2"><div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" /><div className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" /></div>
              </div>
            ))}
            {!assessmentsLoading && assessmentsError && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-[14px] border border-rose-200 bg-rose-50 p-5 text-center text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {assessmentsError}
              </div>
            )}
            {!assessmentsLoading && !assessmentsError && assessments.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-[14px] border border-slate-200/70 bg-white/95 p-8 text-center dark:border-slate-700/60 dark:bg-slate-900/80">
                <ListChecks className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No assessments are assigned to this batch.</p>
                <p className="mt-1 text-xs text-slate-400">Assessments will appear here after they are created for {batch.batchName}.</p>
              </div>
            )}
            {!assessmentsLoading && !assessmentsError && assessments.map((assessment, index) => {
              const duration = Number(assessment.durationMinutes ?? assessment.duration ?? 0)
              const totalMarks = assessment.totalMarks ?? assessment.total ?? '-'
              const passMarks = assessment.passMarks ?? assessment.passingMarks ?? assessment.pass ?? '-'
              const type = assessment.assessmentType ?? assessment.type ?? 'Assessment'
              const scheduledFor = assessment.scheduledAt ?? assessment.startDate ?? assessment.date ?? assessment.createdAt
              const score = assessmentScore(assessment)
              const attempts = Number(assessment.attempts ?? assessment.attempted ?? assessment.attemptCount ?? 0)
              const status = String(assessment.status ?? 'Draft').toLowerCase()
              const resultMessage = score !== null
                ? `Latest result: ${score}%`
                : attempts > 0
                  ? 'Attempt recorded; result is pending evaluation.'
                  : status === 'draft'
                    ? 'Draft assessment: students cannot attempt it yet.'
                    : 'No student attempt has been recorded yet.'

              return (
                <motion.div key={assessment.id ?? assessment.assessmentId ?? assessment.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{assessment.title || 'Untitled assessment'}</p>
                    <span className="shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">{assessment.status || 'Draft'}</span>
                  </div>
                  <p className="mb-3 text-xs text-slate-400">{type} / {formatDate(scheduledFor)}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/50"><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{duration || '-'}{duration ? ' min' : ''}</p><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Duration</p></div>
                    <div className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800/50"><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalMarks} / {passMarks}</p><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">Marks / Pass</p></div>
                  </div>
                  <p className={`mt-3 text-[11px] ${score !== null ? 'font-semibold text-emerald-600' : 'text-slate-400'}`}>{resultMessage}</p>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div key="attendance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
              <StatTile label="Attendance" value={`${attendance.attendancePct}%`} icon={TrendingUp} color="purple" />
              <StatTile label="Late Joins" value={attendance.lateJoins} icon={Clock} color="amber" />
              <StatTile label="Present Days" value={attendance.dailyRecords.filter((r) => r.status === 'present').length} icon={CheckCircle2} color="emerald" />
              <StatTile label="Absent Days" value={attendance.dailyRecords.filter((r) => r.status === 'absent').length} icon={XCircle} color="rose" />
            </div>
            <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Daily Attendance This Week</h3>
              <div className="flex gap-2">
                {attendance.dailyRecords.map((r) => (
                  <div key={r.day} className="flex-1 text-center">
                    <div className={`mx-auto h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold ${r.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : r.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'}`}>{r.status[0].toUpperCase()}</div>
                    <p className="mt-1 text-[9px] font-medium text-slate-400">{r.day}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Weekly Trend</h3>
                <div className="flex items-end gap-2">
                  {attendance.weeklyTrend.map((value, i) => (
                    <div key={attendance.weeklyLabels[i]} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-16 w-full items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (value / 100) * 64)}px` }} className="w-full rounded-t-md bg-gradient-to-t from-purple-500 to-indigo-400" /></div>
                      <span className="text-[9px] font-medium text-slate-400">{attendance.weeklyLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Monthly Trend</h3>
                <div className="flex items-end gap-2">
                  {attendance.monthlyTrend.map((value, i) => (
                    <div key={attendance.monthlyLabels[i]} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-16 w-full items-end"><motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (value / 100) * 64)}px` }} className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400" /></div>
                      <span className="text-[9px] font-medium text-slate-400">{attendance.monthlyLabels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div key="resources" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHOW_LEGACY_STUDENT_WORKSPACE_CARDS && resources.map((r, i) => {
              const Icon = r.type === 'link' ? Link2 : r.type === 'code' ? Code2 : r.type === 'ppt' ? Presentation : FileIcon
              return (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }} className="flex items-center gap-3 rounded-[14px] border border-slate-200/70 bg-white/95 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/80">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10"><Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{r.title}</p>
                    <p className="text-xs text-slate-400">{r.downloaded ? 'Downloaded' : 'Not downloaded'}</p>
                  </div>
                  <button onClick={() => toast.success('Downloading resource...')} className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"><Download className="w-4 h-4" /></button>
                </motion.div>
              )
            })}
            {resourcesLoading && [1, 2].map((item) => (
              <div key={item} className="h-[86px] animate-pulse rounded-[14px] border border-slate-200/70 bg-white/95 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/80">
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="mt-3 h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            ))}
            {!resourcesLoading && resourcesError && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-[14px] border border-rose-200 bg-rose-50 p-5 text-center text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {resourcesError}
              </div>
            )}
            {!resourcesLoading && !resourcesError && resources.length === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 rounded-[14px] border border-slate-200/70 bg-white/95 p-8 text-center dark:border-slate-700/60 dark:bg-slate-900/80">
                <FolderOpen className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">No materials have been uploaded for this course.</p>
                <p className="mt-1 text-xs text-slate-400">Uploaded course PDFs will appear here for {batch.courseName}.</p>
              </div>
            )}
            {!resourcesLoading && !resourcesError && resources.map((resource, index) => (
              <motion.div key={resource.materialId ?? resource.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }} className="flex items-center gap-3 rounded-[14px] border border-slate-200/70 bg-white/95 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10"><FileIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{resource.title}</p>
                  <p className="text-xs text-slate-400">{resource.materialType || 'Document'} / {resource.courseName}</p>
                </div>
                 {resource.resourceUrl ? <button type="button" onClick={() => downloadResource(resource)} disabled={downloadingResource != null} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-purple-50 hover:text-purple-600 disabled:cursor-wait disabled:opacity-50 dark:hover:bg-purple-500/10" aria-label={`Download ${resource.title}`}><Download className="h-4 w-4" /></button> : <span className="shrink-0 text-[11px] text-slate-400">File unavailable</span>}
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'certificates' && (
          <motion.div key="certificates" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-3">
            {certificates.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
                <GraduationCap className="w-10 h-10 opacity-30" />
                No certificates earned yet — complete the course to unlock one.
              </div>
            ) : certificates.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-400/10"><Award className="h-5 w-5 text-amber-600" /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.courseName}</p>
                  <p className="text-xs text-slate-400">{c.status === 'issued' ? `Issued ${formatDate(c.issuedDate)}` : 'In progress — not yet issued'}</p>
                </div>
                {c.status === 'issued' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toast.success('Downloading certificate...')} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"><Download className="w-4 h-4" /></button>
                    <button onClick={() => toast.success('Share link copied!')} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10"><Share2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div key="notes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Add a Private Note</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select value={noteType} onChange={(e) => setNoteType(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/30 shrink-0">
                  <option value="observation">Observation</option>
                  <option value="follow-up">Follow-up Task</option>
                  <option value="improvement">Improvement Suggestion</option>
                </select>
                <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write a note about this student..."
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30" />
                <button onClick={handleAddNote} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shrink-0"><Plus className="w-3.5 h-3.5" /> Add Note</button>
              </div>
            </div>
            <div className="space-y-2.5">
              {notes.map((n) => (
                <div key={n.id} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3.5 dark:border-slate-700/60 dark:bg-slate-900/80">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 capitalize">{n.type.replace('-', ' ')}</span>
                    <span className="text-[10px] text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
