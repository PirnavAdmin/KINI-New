import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mail, MessageSquare, AlertCircle, Trash2, Save, AlertTriangle, Filter, CalendarDays, BookOpen, ClipboardCheck, Award, Clock3, MapPin, RefreshCcw, Users, BarChart3, CheckSquare, ChevronDown, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '@shared/components/Modal'
import { studentService } from '../services/mentorCrudService'
import MentorBanner from '../components/MentorBanner'
import Pager from '../components/Pager'
import { MENTOR_BANNERS } from '../constants/mentorBanners'
import KPI from '@/components/common/KPI'
import './mentor-students-density.css'
import { useMentorStudents } from '../hooks/useMentorStudents'
import { useProfilePhotos } from '@shared/hooks/useProfilePhoto'
import { PROFILE_TYPE, toProfileId } from '@shared/services/profilePhotoService'
import { AvatarPhoto } from '@/components/common/ProfileImage'

const numeric = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback

const studentProfile = (student) => ({
  studentId: student.studentId || 'Not provided',
  batch: student.batch || 'Batch not provided',
  joined: student.joinedDate ?? student.enrolledAt ?? 'Not provided',
  attendance: numeric(student.attendance),
  assignments: `${numeric(student.assignmentsCompleted)}/${numeric(student.assignmentsTotal)}`,
  quizAverage: numeric(student.quizAverage),
  certificates: numeric(student.certificates ?? student.certificateCount),
  location: student.location ?? 'Not provided',
})
// Roster header labels; `tone` picks the pastel header block (kini-mentor-v15.css).
const STUDENT_COLUMNS = [
  { label: '#', tone: 'purple' },
  { label: 'Student', tone: 'blue' },
  { label: 'Batch / Course', tone: 'orange' },
  { label: 'Status', tone: 'green' },
  { label: 'Attendance', tone: 'mint' },
]
const AVATAR_COLORS =['#2f6fe4', '#4338ca', '#0ea5e9', '#1d4ed8', '#9333ea', '#0f2a4a', '#0891b2', '#7c3aed']
const avatarColor = (name = '') => AVATAR_COLORS[[...String(name)].reduce((sum, character) => sum + character.charCodeAt(0), 0) % AVATAR_COLORS.length]

const ringTone = (value) => (value >= 80 ? '#16a34a' : value >= 65 ? '#f59e0b' : '#ef4444')

/* Small progress ring used for attendance and quiz average. */
function Ring({ value = 0, label = false, size = 'md', tone }) {
  const percent = Math.max(0, Math.min(100, Number(value) || 0))
  const radius = 15
  const circumference = 2 * Math.PI * radius
  const color = tone === 'purple' ? (percent >= 80 ? '#16a34a' : percent >= 65 ? '#7c3aed' : '#f59e0b') : ringTone(percent)
  return (
    <span className={`mv15-ring mv15-ring--${size}`} aria-label={`${percent}%`}>
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#e8edf4" strokeWidth="3.4" />
        <circle cx="18" cy="18" r={radius} fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeDasharray={`${(percent / 100) * circumference} ${circumference}`} transform="rotate(-90 18 18)" />
      </svg>
      {label && <b>{percent}%</b>}
    </span>
  )
}

const accountStatus = (student) => {
  const value = String(student.accountStatus ?? student.enrollmentStatus ?? student.status ?? '').trim().toLowerCase()
  return ['inactive', 'disabled', 'suspended', 'archived'].includes(value) ? 'inactive' : 'active'
}

export default function MentorStudents() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [selected, setSelected] = useState(() => new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const { students, setStudents, loading, error: loadError, reload } = useMentorStudents()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingStudent] = useState(null)
  const [viewingStudent, setViewingStudent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', course: '' })

  const filtered = useMemo(() => {
    let result = students
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter(s =>
        [s.name, s.email, s.course, s.batch].some(value => String(value || '').toLowerCase().includes(query))
      )
    }
    if (batchFilter !== 'all') result = result.filter(s => s.batch === batchFilter)
    if (courseFilter !== 'all') result = result.filter(s => s.course === courseFilter)
    if (statusFilter === 'attention') {
      result = result.filter(s => s.riskLevel === 'high' || s.status === 'at-risk' || s.performance === 'poor')
    } else if (statusFilter !== 'all') {
      result = result.filter(s => accountStatus(s) === statusFilter)
    }
    return result
  }, [students, searchQuery, statusFilter, batchFilter, courseFilter])

  const batchOptions = useMemo(() => [...new Set(students.map(s => s.batch).filter(value => value && value !== 'Batch not provided'))].sort(), [students])
  const courseOptions = useMemo(() => [...new Set(students.map(s => s.course).filter(value => value && value !== 'Course not provided'))].sort(), [students])
  const filtersActive = Boolean(searchQuery.trim()) || [statusFilter, batchFilter, courseFilter].some(value => value !== 'all')
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setBatchFilter('all')
    setCourseFilter('all')
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedStudents = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  // One batch request for the visible page (plus the open profile, if any).
  const { photos: studentPhotos } = useProfilePhotos(PROFILE_TYPE.STUDENT, [...paginatedStudents, viewingStudent].map((student) => student?.photoStudentId))
  const photoOf = (student) => studentPhotos[toProfileId(student?.photoStudentId)]
  const startRecord = filtered.length ? (currentPage - 1) * pageSize + 1 : 0
  const endRecord = Math.min(currentPage * pageSize, filtered.length)
  const activeCount = students.filter(s => accountStatus(s) === 'active').length
  const inactiveCount = students.filter(s => accountStatus(s) === 'inactive').length
  const needsAttentionCount = students.filter(s => s.riskLevel === 'high' || s.status === 'at-risk' || s.performance === 'poor').length
  const pageKeys = paginatedStudents.map(s => String(s.id))
  const allOnPageSelected = pageKeys.length > 0 && pageKeys.every(key => selected.has(key))
  const toggleSelected = (key) => setSelected(prev => { const next = new Set(prev); if (next.has(key)) next.delete(key); else next.add(key); return next })
  const togglePageSelection = () => setSelected(prev => { const next = new Set(prev); pageKeys.forEach(key => (allOnPageSelected ? next.delete(key) : next.add(key))); return next })

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Name and email are required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    setSaving(true)
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.id, form)
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...form, avatar: s.avatar, progress: s.progress, lastActive: s.lastActive, status: s.status, performance: s.performance } : s))
        toast.success('Student updated successfully')
      } else {
        const created = await studentService.create(form)
        const initials = form.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        setStudents(prev => [...prev, {
          id: created.id, name: form.name, email: form.email, phone: form.phone, course: form.course,
          progress: 0, lastActive: 'Just now', avatar: initials, status: 'active', performance: 'average'
        }])
        toast.success('Student added successfully')
      }
      setModalOpen(false)
    } catch {
      toast.error('Unable to save student')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (student) => {
    try {
      await studentService.remove(student.id)
      setStudents(prev => prev.filter(s => s.id !== student.id))
      toast.success('Student removed successfully')
      setDeleteConfirm(null)
    } catch {
      toast.error('Unable to delete student')
    }
  }

  const sendMessage = (student) => {
    setViewingStudent(null)
    navigate(`/mentor/messages?studentId=${student.studentId ?? student.id}`)
  }

  const sendEmail = (student) => {
    const email = String(student?.email ?? '').trim()
    if (!email) return
    window.location.href = `mailto:${encodeURIComponent(email)}`
  }


  return (
    <div className="mentor-students-page mv15 mx-auto max-w-[1500px] px-2 pb-4 pt-2 sm:px-3">
      <MentorBanner
        variant="students"
        image={MENTOR_BANNERS.students}
        eyebrow="Mentor Portal"
        eyebrowIcon={Users}
        title="My"
        highlight="Students"
        subtitle="Track your students' progress, attendance and learning journey."
        script={['Guide', 'Support', 'Grow Together']}
        floating={[
          { icon: BarChart3, label: 'Learning Progress', tone: 'blue' },
          { icon: CheckSquare, label: 'Assignments', tone: 'green' },
          { icon: CalendarDays, label: 'Attendance', tone: 'blue' },
          { icon: BarChart3, label: 'Performance', tone: 'pink' },
        ]}
      />

      <div className="mentor-students-kpis mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: students.length, description: 'Across all my batches', icon: Users, accent: 'blue', filter: 'all' },
          { label: 'Active Students', value: activeCount, description: 'Currently learning', icon: UserRound, accent: 'green', filter: 'active' },
          { label: 'Inactive Students', value: inactiveCount, description: 'No recent activity', icon: Clock3, accent: 'orange', filter: 'inactive' },
          { label: 'Need Attention', value: needsAttentionCount, description: 'Low engagement', icon: AlertCircle, accent: 'red', filter: 'attention' },
        ].map((stat) => (
          <KPI
            key={stat.label}
            variant="top"
            iconShape="circle"
            decoration="sparkline"
            accent={stat.accent}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            loading={loading}
            ariaLabel={`${stat.label}: ${loading ? 'loading' : stat.value}. Show ${stat.filter === 'all' ? 'all students' : stat.label.toLowerCase()}`}
            onClick={() => { setStatusFilter(stat.filter); setCurrentPage(1) }}
            className={statusFilter === stat.filter && stat.filter !== 'all' ? 'ring-2 ring-[#F39924]/40' : ''}
          />
        ))}
      </div>

      <section className="mv15-toolbar mb-2" role="search">
        <label className="mv15-field mv15-field--grow">
          <Search aria-hidden="true" />
          <input
            type="text"
            placeholder="Search students by name, email or course..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            aria-label="Search students"
          />
        </label>
        <label className="mv15-field mv15-field--select">
          <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }} aria-label="Filter students by status">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="attention">Needs Attention</option>
          </select>
          <ChevronDown aria-hidden="true" className="mv15-field__chevron" />
        </label>
        <label className="mv15-field mv15-field--select">
          <select value={batchFilter} onChange={(event) => { setBatchFilter(event.target.value); setCurrentPage(1) }} aria-label="Filter students by batch">
            <option value="all">All Batches</option>
            {batchOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="mv15-field__chevron" />
        </label>
        <label className="mv15-field mv15-field--select">
          <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setCurrentPage(1) }} aria-label="Filter students by course">
            <option value="all">All Courses</option>
            {courseOptions.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
          <ChevronDown aria-hidden="true" className="mv15-field__chevron" />
        </label>
        <button type="button" className="mv15-ghost-btn" onClick={clearFilters} disabled={!filtersActive}>
          <Filter aria-hidden="true" />
          Clear Filters
        </button>
      </section>

      <section className="mv15-card mentor-students-roster">
        <div className="mv15-table-wrap">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500"><span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" /><p className="mt-3 text-sm font-semibold">Loading assigned batch students…</p></div>
          ) : loadError ? (
            <div className="mentor-students-error mx-auto my-8 flex max-w-xl flex-col items-center justify-center px-6 py-8 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-50 text-rose-500"><AlertCircle className="h-5 w-5" /></span>
              <p className="mt-3 text-sm font-semibold text-rose-700">{loadError}</p>
              <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">We couldn&apos;t retrieve the roster. Check your assigned batches or try loading it again.</p>
              <button type="button" onClick={reload} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#ff8800] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e87800]">
                <RefreshCcw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          ) : paginatedStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Search className="mb-3 h-12 w-12 opacity-40" />
              <p className="text-sm font-medium">{students.length ? 'No students match your search or filters.' : 'No students assigned yet.'}</p>
              {students.length > 0 && <p className="mt-1 text-xs">Try a different search or filter.</p>}
            </div>
          ) : (
            <table data-table-header="plain" className="mv15-table mv15-table--students">
              <thead>
                <tr>
                  <th scope="col"><div className="mv15-th mv15-th--slate"><input type="checkbox" aria-label="Select all students on this page" checked={allOnPageSelected} onChange={togglePageSelection} /></div></th>
                  {STUDENT_COLUMNS.map((column) => (
                    <th key={column.label} scope="col"><div className={`mv15-th mv15-th--${column.tone}`}>{column.label}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, i) => {
                  const profile = studentProfile(student)
                  const isActive = accountStatus(student) === 'active'
                  const key = String(student.id)
                  return (
                    <tr key={key} className="cursor-pointer" onClick={() => navigate(`/mentor/students/${student.id}`, { state: { student } })}>
                      <td onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${student.name}`} checked={selected.has(key)} onChange={() => toggleSelected(key)} /></td>
                      <td className="mv15-muted-cell">{startRecord + i}</td>
                      <td>
                        <div className="mv15-person">
                          <span className="mv15-avatar overflow-hidden" style={{ background: avatarColor(student.name) }}><AvatarPhoto src={photoOf(student)} fallback={student.avatar} /></span>
                          <span className="min-w-0"><b>{student.name}</b><small>{student.email || '—'}</small></span>
                        </div>
                      </td>
                      <td><div className="mv15-stack"><b>{profile.batch}</b><small>{student.course}</small></div></td>
                      <td><span className={`mv15-status mv15-status--${isActive ? 'green' : 'gray'}`}><i />{isActive ? 'Active' : 'Inactive'}</span></td>
                      <td><div className="mv15-ring-cell"><Ring value={profile.attendance} /><b>{profile.attendance}%</b></div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {!loading && !loadError && filtered.length > 0 && (
          <Pager label="students" first={startRecord} last={endRecord} total={filtered.length} page={currentPage} pageCount={totalPages} onPage={setCurrentPage} pageSize={pageSize} onPageSize={(size) => { setPageSize(size); setCurrentPage(1) }} />
        )}
      </section>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStudent ? 'Edit Student' : 'Add Student'}
        description={editingStudent ? 'Update student details' : 'Enter the details for the new student'}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg disabled:opacity-60 transition-all">
              {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Enter full name"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="Enter email address"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="Enter phone number"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Course</label>
            <select value={form.course} onChange={(e) => setForm(p => ({ ...p, course: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all">
              <option>Full Stack MERN</option>
              <option>Python for Data Science</option>
              <option>AI & Machine Learning</option>
              <option>React Development</option>
              <option>Node.js Backend</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        title={viewingStudent?.name || ''}
        description="Academic profile, engagement and learning progress"
        size="xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setViewingStudent(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Close</button>
            <button onClick={() => sendMessage(viewingStudent)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg transition-all">
              <MessageSquare className="w-4 h-4" />
              Send Message
            </button>
          </div>
        }
      >
        {viewingStudent && (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/60">
              <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-xl font-bold text-white shadow-lg shadow-purple-500/15">
                <AvatarPhoto src={photoOf(viewingStudent)} fallback={viewingStudent.avatar} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2"><p className="text-lg font-bold text-slate-900 dark:text-white">{viewingStudent.name}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${viewingStudent.status === 'at-risk' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>{viewingStudent.status === 'at-risk' ? 'Needs support' : 'Active'}</span></div>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{studentProfile(viewingStudent).studentId} · {studentProfile(viewingStudent).batch}</p>
                <p className="mt-1 text-xs text-slate-500">{viewingStudent.course}</p>
              </div>
              </div>
              <div className="rounded-lg bg-white/80 px-3 py-2 text-right dark:bg-slate-900/60"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall progress</p><p className="text-2xl font-bold text-purple-600">{viewingStudent.progress}%</p></div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Attendance', value: `${studentProfile(viewingStudent).attendance}%`, icon: CalendarDays, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Assignments', value: studentProfile(viewingStudent).assignments, icon: ClipboardCheck, color: 'text-violet-600 bg-violet-50' },
                { label: 'Quiz average', value: `${studentProfile(viewingStudent).quizAverage}%`, icon: Award, color: 'text-amber-600 bg-amber-50' },
                { label: 'Certificates', value: studentProfile(viewingStudent).certificates, icon: BookOpen, color: 'text-blue-600 bg-blue-50' },
              ].map((item) => <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"><span className={`mb-2 grid h-8 w-8 place-items-center rounded-lg ${item.color}`}><item.icon className="h-4 w-4" /></span><p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p></div>)}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.15fr_.85fr]">
              <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Learning progress</h3><div className="mt-4 flex items-center justify-between text-xs"><span className="font-semibold text-slate-700 dark:text-slate-200">Course completion</span><span className="font-bold text-slate-900 dark:text-white">{viewingStudent.progress}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${viewingStudent.progress}%` }} /></div><div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-800"><div><p className="text-slate-400">Current course</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{viewingStudent.course}</p></div><div><p className="text-slate-400">Batch</p><p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">{studentProfile(viewingStudent).batch}</p></div></div></section>
              <section className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Student information</h3><div className="mt-3 space-y-2.5 text-xs"><p className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Mail className="h-3.5 w-3.5 text-slate-400" />{viewingStudent.email}</p><p className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><MapPin className="h-3.5 w-3.5 text-slate-400" />{studentProfile(viewingStudent).location}</p><p className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><Clock3 className="h-3.5 w-3.5 text-slate-400" />Active {viewingStudent.lastActive}</p><p className="flex items-center gap-2 text-slate-600 dark:text-slate-300"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />Joined {studentProfile(viewingStudent).joined}</p></div></section>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remove Student"
        description="This action cannot be undone"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setDeleteConfirm(null)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all">
              <Trash2 className="w-4 h-4" /> Remove
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirm?.name}</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
