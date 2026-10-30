import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Users, BarChart3, ClipboardList, FileText,
  Printer, Search, Pencil, Trash2, X, Save,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CalendarDays, UserRound, BookOpen, TrendingUp,
  Clock, CheckCircle2, AlertCircle, GraduationCap,
  DollarSign, Layers, Code2, Server, Database, Star,
} from 'lucide-react'
import { ROUTES } from '@shared/constants/routeConstants'
import { BATCHES, BATCH_STUDENTS, BATCH_ASSIGNMENTS, BATCH_REPORTS } from '@shared/data/orgBatchesMockData'
import { COURSES_DATA } from '@shared/data/orgBatchesMockData'
import StatusBadge from '@shared/components/StatusBadge'
import { Button } from '@shared/components/FormElements'
import EmptyState from '@shared/components/EmptyState'
import ExportReportButton from '../components/ExportReportButton'

const normalizeBatchStatus = (status) => {
  const value = String(status ?? '').trim().toLowerCase()
  if (['upcoming', 'pending', 'scheduled'].includes(value)) return 'pending'
  if (['active', 'running', 'open'].includes(value)) return 'success'
  if (['completed', 'complete', 'finished', 'closed'].includes(value)) return 'inactive'
  return 'default'
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const getInitials = (value) => {
  const parts = String(value ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

const TABS = [
  { id: 'students', label: 'Students', icon: Users },
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'fullstack', label: 'Full Stack', icon: Layers },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'reports', label: 'Reports', icon: FileText },
]

export default function BatchDetails() {
  const { batchId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('students')
  const [searchQuery, setSearchQuery] = useState('')
  const [studentPage, setStudentPage] = useState(1)
  const [studentOverrides, setStudentOverrides] = useState({})
  const [deletedStudentIds, setDeletedStudentIds] = useState([])
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const STUDENT_PAGE_SIZE = 10
  const batch = useMemo(() => BATCHES.find((b) => b.batchId === Number(batchId)), [batchId])
  const students = useMemo(() => (BATCH_STUDENTS[Number(batchId)] || [])
    .filter((student) => !deletedStudentIds.includes(student.studentId))
    .map((student) => ({ ...student, ...studentOverrides[student.studentId] })),
  [batchId, deletedStudentIds, studentOverrides])
  const assignments = useMemo(() => BATCH_ASSIGNMENTS[Number(batchId)] || [], [batchId])
  const reports = useMemo(() => BATCH_REPORTS[Number(batchId)], [batchId])
  const fullStackCourse = useMemo(() => {
    if (!batch) return null
    return COURSES_DATA.find(
      (c) => c.courseName === batch.courseName || c.courseId === batch.courseId
    )
  }, [batch])

  // Compute dynamic metrics from students
  const studentMetrics = useMemo(() => {
    if (!students.length) {
      return {
        avgProgress: 0,
        avgAttendance: 0,
        avgScore: 0,
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        progressDist: [
          { label: 'Above 80%', pct: 0, count: 0, color: 'bg-emerald-500' },
          { label: '60-80%', pct: 0, count: 0, color: 'bg-[#0f55f7]' },
          { label: '40-60%', pct: 0, count: 0, color: 'bg-amber-500' },
          { label: 'Below 40%', pct: 0, count: 0, color: 'bg-rose-500' },
        ],
        learningTracks: [
          { label: 'Frontend', pct: 0, color: '#0f55f7' },
          { label: 'Backend', pct: 0, color: '#06b6a8' },
          { label: 'Database', pct: 0, color: '#F59E0B' },
          { label: 'DevOps', pct: 0, color: '#EF4444' },
        ],
        attendanceDist: [
          { label: 'Above 90%', pct: 0, count: '0 students', color: 'bg-emerald-500' },
          { label: '75% - 90%', pct: 0, count: '0 students', color: 'bg-[#0f55f7]' },
          { label: 'Below 75%', pct: 0, count: '0 students', color: 'bg-rose-500' },
        ],
        performanceDist: { excellent: 0, good: 0, average: 0, needsImprovement: 0 },
        rating: 'N/A',
      }
    }

    const total = students.length
    const avgProgress = Math.round(students.reduce((s, st) => s + (st.courseProgress || 0), 0) / total)
    const avgAttendance = Math.round(students.reduce((s, st) => s + (st.attendancePercentage || 0), 0) / total)
    const avgScore = Math.round(students.reduce((s, st) => s + (st.averageScore || 0), 0) / total)
    const totalAssign = students.reduce((s, st) => s + (st.totalAssignments || 0), 0)
    const completedAssign = students.reduce((s, st) => s + (st.completedAssignments || 0), 0)
    const pendingAssign = students.reduce((s, st) => s + (st.pendingAssignments || 0), 0)

    // Progress distribution
    const above80 = students.filter((s) => s.courseProgress >= 80).length
    const between60and80 = students.filter((s) => s.courseProgress >= 60 && s.courseProgress < 80).length
    const between40and60 = students.filter((s) => s.courseProgress >= 40 && s.courseProgress < 60).length
    const below40 = students.filter((s) => s.courseProgress < 40).length

    // Learning tracks - compute average per track
    const frontendPct = Math.round(students.reduce((s, st) => s + ((st.learningTrack?.frontend) || 0), 0) / total)
    const backendPct = Math.round(students.reduce((s, st) => s + ((st.learningTrack?.backend) || 0), 0) / total)
    const dbPct = Math.round(students.reduce((s, st) => s + ((st.learningTrack?.database) || 0), 0) / total)
    const devopsPct = Math.round(students.reduce((s, st) => s + ((st.learningTrack?.devops) || 0), 0) / total)

    // Attendance distribution
    const attAbove90 = students.filter((s) => s.attendancePercentage >= 90).length
    const attBetween75and90 = students.filter((s) => s.attendancePercentage >= 75 && s.attendancePercentage < 90).length
    const attBelow75 = students.filter((s) => s.attendancePercentage < 75).length

    // Performance distribution
    const excellent = students.filter((s) => s.performanceRating === 'Excellent').length
    const good = students.filter((s) => s.performanceRating === 'Good').length
    const average = students.filter((s) => s.performanceRating === 'Average').length
    const needsImprovement = students.filter((s) => s.performanceRating === 'Needs Improvement').length

    const topRating = [
      { label: 'Excellent', count: excellent },
      { label: 'Good', count: good },
      { label: 'Average', count: average },
      { label: 'Needs Improvement', count: needsImprovement },
    ].sort((a, b) => b.count - a.count)[0]?.label || 'N/A'

    return {
      avgProgress,
      avgAttendance,
      avgScore,
      totalAssignments: Math.round(totalAssign / total),
      completedAssignments: Math.round(completedAssign / total),
      pendingAssignments: Math.round(pendingAssign / total),
      progressDist: [
        { label: 'Above 80%', pct: Math.round((above80 / total) * 100), count: above80, color: 'bg-emerald-500' },
        { label: '60-80%', pct: Math.round((between60and80 / total) * 100), count: between60and80, color: 'bg-[#0f55f7]' },
        { label: '40-60%', pct: Math.round((between40and60 / total) * 100), count: between40and60, color: 'bg-amber-500' },
        { label: 'Below 40%', pct: Math.round((below40 / total) * 100), count: below40, color: 'bg-rose-500' },
      ],
      learningTracks: [
        { label: 'Frontend', pct: frontendPct, color: '#0f55f7' },
        { label: 'Backend', pct: backendPct, color: '#06b6a8' },
        { label: 'Database', pct: dbPct, color: '#F59E0B' },
        { label: 'DevOps', pct: devopsPct, color: '#EF4444' },
      ],
      attendanceDist: [
        { label: 'Above 90%', pct: Math.round((attAbove90 / total) * 100), count: `${attAbove90} students`, color: 'bg-emerald-500' },
        { label: '75% - 90%', pct: Math.round((attBetween75and90 / total) * 100), count: `${attBetween75and90} students`, color: 'bg-[#0f55f7]' },
        { label: 'Below 75%', pct: Math.round((attBelow75 / total) * 100), count: `${attBelow75} students`, color: 'bg-rose-500' },
      ],
      performanceDist: { excellent, good, average, needsImprovement },
      rating: topRating,
    }
  }, [students])

  const filteredStudents = useMemo(() => {
    let result = [...students]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    }
    result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }, [students, searchQuery])

  const totalStudentPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENT_PAGE_SIZE))
  const paginatedStudents = filteredStudents.slice((studentPage - 1) * STUDENT_PAGE_SIZE, studentPage * STUDENT_PAGE_SIZE)
  const batchStatusVariant = batch ? normalizeBatchStatus(batch.status) : 'default'
  const openStudentProfile = (studentId) => navigate(`/organization/batches/${batchId}/students/${studentId}`)
  const saveStudent = () => {
    const name = editingStudent?.name?.trim()
    const email = editingStudent?.email?.trim()
    if (!name || !email) return
    setStudentOverrides((current) => ({
      ...current,
      [editingStudent.studentId]: { ...current[editingStudent.studentId], name, email },
    }))
    setEditingStudent(null)
  }
  const deleteStudent = () => {
    if (!deleteTarget) return
    setDeletedStudentIds((current) => [...current, deleteTarget.studentId])
    setDeleteTarget(null)
  }

  if (!batch) return (
    <div className="px-4 py-12">
      <EmptyState icon={Users} title="Batch not found" description="The batch you're looking for doesn't exist." action={<Button onClick={() => navigate(ROUTES.ORG_ADMIN.BATCHES)}><ArrowLeft className="w-4 h-4 mr-1.5" /> Back</Button>} />
    </div>
  )

  return (
    <div className="w-full px-4 py-3 sm:px-5 lg:px-6 space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(ROUTES.ORG_ADMIN.BATCHES)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-[#0f55f7]/30 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"><ArrowLeft className="h-4 w-4" /></button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold text-slate-950 dark:text-white sm:text-xl">{batch.batchName}</h1>
              <StatusBadge status={batchStatusVariant} label={batch.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400">{batch.courseName} · {batch.batchType}</p>
          </div>
        </div>
        <ExportReportButton />
      </motion.div>

      {/* Batch Info Cards */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Mentor', value: batch.mentorName, icon: UserRound, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
          { label: 'Course', value: batch.courseName, icon: BookOpen, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
          { label: 'Enrolled', value: `${batch.studentsCount} Students`, icon: Users, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
          { label: 'Duration', value: batch.duration || `${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}`, icon: CalendarDays, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
        ].map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700/60">
        <nav className="flex gap-0 -mb-px overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                  isActive ? 'border-[#0f55f7] text-[#0f55f7]' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'students' && (
          <motion.div key="students" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="space-y-4">
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setStudentPage(1) }} placeholder="Search by name, ID, or email..."
                className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-[#0f55f7] focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white" />
            </div>
            <div className="overflow-hidden rounded-[14px] border border-slate-200/70 bg-white dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-900/60">
                      <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Student</th>
                      <th className="hidden md:table-cell px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">ID</th>
                      <th className="hidden lg:table-cell px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Email</th>
                      <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Progress</th>
                      <th className="hidden sm:table-cell px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Perf.</th>
                      <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.length === 0 ? (
                      <tr><td colSpan={6} className="px-3 py-8"><EmptyState title="No students found" compact /></td></tr>
                    ) : paginatedStudents.map((s) => (
                      <tr key={s.studentId} className="group border-b border-slate-100/80 last:border-0 hover:bg-slate-50/70 dark:border-slate-800/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 text-[10px] font-bold text-[#0f55f7]">{getInitials(s.name)}</div>
                            <div className="min-w-0">
                              <button type="button" onClick={() => openStudentProfile(s.studentId)} className="block max-w-full truncate text-left text-xs font-semibold text-slate-900 transition-colors hover:text-[#0f55f7] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 dark:text-white dark:hover:text-blue-400">{s.name}</button>
                              <p className="text-[10px] text-slate-400">{s.courseName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 py-2"><span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">{s.studentId}</span></td>
                        <td className="hidden lg:table-cell px-3 py-2"><span className="text-xs text-slate-500 dark:text-slate-400">{s.email}</span></td>
                        <td className="px-3 py-2 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div className={`h-full rounded-full ${s.courseProgress >= 80 ? 'bg-emerald-500' : s.courseProgress >= 50 ? 'bg-[#0f55f7]' : 'bg-amber-500'}`} style={{ width: `${s.courseProgress}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{s.courseProgress}%</span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-2 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.assignmentPerformance >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : s.assignmentPerformance >= 70 ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                          }`}>{s.assignmentPerformance}%</span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button type="button" onClick={() => setEditingStudent({ ...s })} aria-label={`Edit ${s.name}`} title="Edit student"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" onClick={() => setDeleteTarget(s)} aria-label={`Delete ${s.name}`} title="Delete student"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredStudents.length > STUDENT_PAGE_SIZE && (
                <div className="flex items-center justify-between border-t border-slate-200/70 px-3 py-2 dark:border-slate-700/60">
                  <p className="text-[10px] text-slate-400">Page {studentPage} of {totalStudentPages}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setStudentPage(1)} disabled={studentPage === 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronsLeft className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button onClick={() => setStudentPage(p => Math.max(1, p - 1))} disabled={studentPage === 1} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronLeft className="w-3.5 h-3.5 text-slate-500" /></button>
                    <span className="px-2 text-[10px] font-medium text-slate-500">{studentPage}</span>
                    <button onClick={() => setStudentPage(p => Math.min(totalStudentPages, p + 1))} disabled={studentPage === totalStudentPages} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronRight className="w-3.5 h-3.5 text-slate-500" /></button>
                    <button onClick={() => setStudentPage(totalStudentPages)} disabled={studentPage === totalStudentPages} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"><ChevronsRight className="w-3.5 h-3.5 text-slate-500" /></button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Total Students', value: students.length, icon: Users, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
                { label: 'Avg Progress', value: `${studentMetrics.avgProgress}%`, icon: TrendingUp, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
                { label: 'Avg Attendance', value: `${studentMetrics.avgAttendance}%`, icon: Clock, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
                { label: 'Avg Score', value: `${studentMetrics.avgScore}%`, icon: CheckCircle2, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
              ].map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                      <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p><p className="text-base font-bold text-slate-900 dark:text-white">{c.value}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Progress Distribution</h3>
                <div className="space-y-2.5">
                  {studentMetrics.progressDist.map((i) => (
                    <div key={i.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]"><span className="font-medium text-slate-600 dark:text-slate-300">{i.label}</span><span className="font-bold text-slate-900 dark:text-white">{i.count} student{i.count !== 1 ? 's' : ''} ({i.pct}%)</span></div>
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className={`h-full rounded-full ${i.color}`} style={{ width: `${i.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Learning Track Overview</h3>
                <div className="space-y-3">
                  {studentMetrics.learningTracks.map((i) => (
                    <div key={i.label} className="flex items-center gap-3">
                      <span className="w-16 text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">{i.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${i.pct}%`, backgroundColor: i.color }} /></div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 min-w-[3ch] text-right">{i.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'fullstack' && fullStackCourse && (
          <motion.div key="fullstack" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            {/* Course Overview Cards */}
            <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Total Price', value: `₹${(fullStackCourse.totalPrice || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
                { label: 'Duration', value: fullStackCourse.totalDuration, icon: Clock, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
                { label: 'Modules', value: `${fullStackCourse.totalModules} Modules`, icon: Layers, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
                { label: 'Level', value: fullStackCourse.level || 'All Levels', icon: GraduationCap, color: 'from-cyan-500/10 to-cyan-400/10', iconColor: 'text-cyan-600' },
                { label: 'Topics', value: fullStackCourse.modules.reduce((s, m) => s + m.topics.length, 0), icon: BookOpen, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
              ].map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Course Description */}
            <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10">
                  <BookOpen className="w-3.5 h-3.5 text-[#0f55f7]" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">{fullStackCourse.courseName}</h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{fullStackCourse.description}</p>
            </div>

            {/* Module Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fullStackCourse.modules.map((mod, i) => {
                const moduleIcons = [Code2, Server, Database, Star]
                const ModuleIcon = moduleIcons[i % moduleIcons.length]
                const moduleColors = [
                  { bg: 'from-blue-500/10 to-cyan-500/10', icon: 'text-blue-600' },
                  { bg: 'from-emerald-500/10 to-teal-500/10', icon: 'text-emerald-600' },
                  { bg: 'from-violet-500/10 to-purple-500/10', icon: 'text-violet-600' },
                ]
                const color = moduleColors[i % moduleColors.length]

                return (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -2 }}
                    className="group rounded-[16px] border border-slate-200/70 bg-white/95 p-4 transition-all duration-300 hover:shadow-lg hover:shadow-[#0f55f7]/5 hover:border-[#0f55f7]/20 dark:border-slate-700/60 dark:bg-slate-900/80 dark:hover:border-[#0f55f7]/30"
                  >
                    {/* Module Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color.bg} group-hover:scale-110 transition-transform`}>
                          <ModuleIcon className={`w-4.5 h-4.5 ${color.icon}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{mod.name}</h3>
                          <p className="text-[10px] text-slate-400">{mod.topics.length} topics</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        {mod.duration}
                      </div>
                    </div>

                    {/* Module Description */}
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">{mod.description}</p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-[#0f55f7]">
                        <DollarSign className="w-3 h-3" />
                        ₹{(mod.price || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        <Layers className="w-3 h-3" />
                        {mod.topics.length} topics
                      </span>
                    </div>

                    {/* Topics Covered */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Topics Covered</p>
                      <div className="flex flex-wrap gap-1">
                        {mod.topics.map((topic) => (
                          <span
                            key={topic}
                            className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800/70 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {!fullStackCourse && activeTab === 'fullstack' && (
          <motion.div key="fullstack-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
            <EmptyState icon={BookOpen} title="No course data available" description="Full Stack course details are not available for this batch." compact />
          </motion.div>
        )}

        {activeTab === 'assignments' && (
          <motion.div key="assignments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            {(() => {
              const totalAs = assignments.length
              const completedAs = assignments.filter((a) => a.status === 'Completed').length
              const pendingAs = assignments.filter((a) => a.status === 'Pending').length
              const scoredAs = assignments.filter((a) => a.score !== null && a.score !== undefined)
              const avgScore = scoredAs.length > 0 ? Math.round(scoredAs.reduce((s, a) => s + a.score, 0) / scoredAs.length) : 0

              return (
                <>
                  <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: 'Total', value: totalAs, icon: ClipboardList, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
                      { label: 'Completed', value: completedAs, icon: CheckCircle2, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
                      { label: 'Pending', value: pendingAs, icon: Clock, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
                      { label: 'Avg Score', value: scoredAs.length > 0 ? `${avgScore}%` : '-', icon: TrendingUp, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
                    ].map((c) => {
                      const Icon = c.icon
                      return (
                        <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                            <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p><p className="text-base font-bold text-slate-900 dark:text-white">{c.value}</p></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="overflow-hidden rounded-[14px] border border-slate-200/70 bg-white dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-700/60 dark:bg-slate-900/60">
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Assignment</th>
                            <th className="hidden sm:table-cell px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</th>
                            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Due Date</th>
                            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">Score</th>
                            <th className="hidden lg:table-cell px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignments.length === 0 ? (
                            <tr><td colSpan={6} className="px-3 py-8"><EmptyState title="No assignments" compact /></td></tr>
                          ) : assignments.map((a) => (
                            <tr key={a.id} className="border-b border-slate-100/80 last:border-0 hover:bg-slate-50/70 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
                              <td className="px-3 py-2"><p className="text-xs font-semibold text-slate-900 dark:text-white">{a.name}</p></td>
                              <td className="hidden sm:table-cell px-3 py-2"><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{a.category || '-'}</span></td>
                              <td className="px-3 py-2"><span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(a.dueDate)}</span></td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  a.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                  : a.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                }`}>{a.status}</span>
                              </td>
                              <td className="px-3 py-2 text-center"><span className="text-xs font-bold text-slate-700 dark:text-slate-300">{a.score !== null ? `${a.score}%` : '-'}</span></td>
                              <td className="hidden lg:table-cell px-3 py-2"><span className="text-xs text-slate-500 dark:text-slate-400">{a.remarks || '-'}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}

        {activeTab === 'attendance' && (
          <motion.div key="attendance" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
              {[
                { label: 'Avg Attendance', value: `${studentMetrics.avgAttendance}%`, icon: Clock, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
                { label: 'Above 90%', value: `${studentMetrics.attendanceDist[0].count}`, icon: Users, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
                { label: 'Below 75%', value: `${studentMetrics.attendanceDist[2].count}`, icon: AlertCircle, color: 'from-rose-500/10 to-rose-400/10', iconColor: 'text-rose-600' },
              ].map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                      <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p><p className="text-sm font-bold text-slate-900 dark:text-white">{c.value}</p></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Attendance Distribution</h3>
                <div className="space-y-2.5">
                  {studentMetrics.attendanceDist.map((i) => (
                    <div key={i.label} className="space-y-1">
                      <div className="flex justify-between text-[11px]"><span className="font-medium text-slate-600 dark:text-slate-300">{i.label}</span><span className="font-bold text-slate-900 dark:text-white">{i.count} ({i.pct}%)</span></div>
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className={`h-full rounded-full ${i.color}`} style={{ width: `${i.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Student Attendance</h3>
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto scrollbar-thin">
                  {students.slice(0, 8).map((s) => (
                    <div key={s.studentId} className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 text-[9px] font-bold text-[#0f55f7]">{getInitials(s.name)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">{s.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className={`h-full rounded-full ${s.attendancePercentage >= 90 ? 'bg-emerald-500' : s.attendancePercentage >= 75 ? 'bg-[#0f55f7]' : 'bg-rose-500'}`} style={{ width: `${s.attendancePercentage}%` }} />
                          </div>
                          <span className={`text-[9px] font-bold ${s.attendancePercentage >= 90 ? 'text-emerald-600 dark:text-emerald-400' : s.attendancePercentage >= 75 ? 'text-[#0f55f7]' : 'text-rose-600 dark:text-rose-400'}`}>{s.attendancePercentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="space-y-4">
            {reports ? (
              <>
                <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
                  {[
                    { label: 'Total Students', value: reports.batchReport?.totalStudents || 0, icon: Users, color: 'from-[#0f55f7]/10 to-[#06b6a8]/10', iconColor: 'text-[#0f55f7]' },
                    { label: 'Avg Progress', value: reports.batchReport?.averageProgress || '0%', icon: TrendingUp, color: 'from-emerald-500/10 to-emerald-400/10', iconColor: 'text-emerald-600' },
                    { label: 'Avg Attendance', value: reports.batchReport?.averageAttendance || '0%', icon: Clock, color: 'from-violet-500/10 to-violet-400/10', iconColor: 'text-violet-600' },
                    { label: 'Avg Score', value: reports.batchReport?.averageScore || '0%', icon: CheckCircle2, color: 'from-amber-500/10 to-amber-400/10', iconColor: 'text-amber-600' },
                    { label: 'Completion', value: reports.batchReport?.completionRate || '0%', icon: GraduationCap, color: 'from-cyan-500/10 to-cyan-400/10', iconColor: 'text-cyan-600' },
                  ].map((c) => {
                    const Icon = c.icon
                    return (
                      <div key={c.label} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-3 dark:border-slate-700/60 dark:bg-slate-900/80">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}><Icon className={`h-4 w-4 ${c.iconColor}`} /></div>
                          <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{c.label}</p><p className="text-sm font-bold text-slate-900 dark:text-white">{c.value}</p></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: 'Batch Report', desc: 'Overall batch metrics and completion', data: reports.batchReport },
                    { title: 'Student Report', desc: 'Student-wise performance breakdown', data: reports.studentReport },
                    { title: 'Assignment Report', desc: 'Submission and scoring analysis', data: reports.assignmentReport },
                    { title: 'Performance Report', desc: 'Performance distribution across students', data: reports.performanceReport },
                    { title: 'Attendance Report', desc: 'Attendance analytics and patterns', data: reports.attendanceReport },
                  ].map((r) => (
                    <div key={r.title} className="rounded-[14px] border border-slate-200/70 bg-white/95 p-4 dark:border-slate-700/60 dark:bg-slate-900/80 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2.5">
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{r.title}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400" title="Print"><Printer className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                      {r.data && (
                        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                          {Object.entries(r.data).map(([k, v]) => (
                            <div key={k} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5">
                              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        <button className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"><Printer className="w-3 h-3" /> Print</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8">
                <EmptyState icon={FileText} title="No reports available" description="Reports will be generated as students progress through the batch." compact />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={() => setEditingStudent(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="edit-student-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <div><h2 id="edit-student-title" className="text-base font-bold text-slate-900 dark:text-white">Edit student</h2><p className="mt-0.5 text-xs text-slate-500">Update student information for this batch.</p></div>
                <button type="button" onClick={() => setEditingStudent(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close edit student"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4 p-5">
                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Student name</span><input autoFocus value={editingStudent.name} onChange={(event) => setEditingStudent((current) => ({ ...current, name: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Email address</span><input type="email" value={editingStudent.email} onChange={(event) => setEditingStudent((current) => ({ ...current, email: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:bg-slate-800/70"><span className="font-semibold text-slate-700 dark:text-slate-300">Student ID:</span> {editingStudent.studentId}</div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700"><button type="button" onClick={() => setEditingStudent(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button><button type="button" onClick={saveStudent} disabled={!editingStudent.name.trim() || !editingStudent.email.trim()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 py-2 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"><Save className="h-3.5 w-3.5" />Save changes</button></div>
            </motion.div>
          </motion.div>
        )}
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={() => setDeleteTarget(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} onMouseDown={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" aria-labelledby="delete-student-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"><Trash2 className="h-5 w-5" /></span><h2 id="delete-student-title" className="mt-4 text-base font-bold text-slate-900 dark:text-white">Delete {deleteTarget.name}?</h2><p className="mt-1.5 text-xs leading-5 text-slate-500">This student will be removed from the current batch list. This action requires confirmation.</p>
              <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setDeleteTarget(null)} className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button><button type="button" onClick={deleteStudent} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"><Trash2 className="h-3.5 w-3.5" />Delete student</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
