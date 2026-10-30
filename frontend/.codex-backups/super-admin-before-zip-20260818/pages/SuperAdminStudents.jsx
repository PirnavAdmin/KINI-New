import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Eye, X, TrendingUp, BookOpen,
  Award, Users, BarChart3, Mail, Calendar, Clock, CheckCircle2, Circle, Plus, Trash2
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { KPICard, DashboardSection } from '@shared/components/SharedComponents'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import AccountCreatedModal from '@shared/components/AccountCreatedModal'
import { Button, Input } from '@shared/components/FormElements'
import { getApiErrorMessage, studentApi } from '@shared/services/apiServices'
import { ENROLLMENT_TRENDS, COURSE_COMPLETION_RATE, STUDENT_STATS } from '@shared/data/superAdminPageMockData'
 
// =================================
// TODO: API Integration
// GET /api/v1/super-admin/students
// GET /api/v1/super-admin/students/stats
// GET /api/v1/super-admin/students/:id
// DELETE /api/v1/super-admin/students/:id
// =================================
 
const PIE_CHART_ICONS = {
  CheckCircle2,
  Clock,
  Circle,
}
 
const TOOLTIP_STYLE = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  padding: '8px 12px',
  fontSize: '12px',
}
 
const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
]
 
export default function SuperAdminStudents() {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [createdAccount, setCreatedAccount] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const rows = await studentApi.list()
      setStudents((Array.isArray(rows) ? rows : []).map((row) => ({
        ...row, id: row.studentId ?? row.id, name: [row.firstName, row.lastName].filter(Boolean).join(' '),
        coursesEnrolled: 0, progress: 0, certifications: 0, status: 'active', joinedDate: '-', lastActive: '-', avgScore: 0, skills: [],
      })))
    } catch (error) { toast.error(getApiErrorMessage(error, 'Unable to load students')) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchStudents, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openStudentForm = (student = null) => {
    setEditingStudent(student)
    setForm({ firstName: student?.firstName || '', lastName: student?.lastName || '', email: student?.email || '', phone: student?.phone || '' })
    setFormOpen(true)
  }

  const saveStudent = async () => {
    if (!form.firstName.trim() || !form.email.trim()) return toast.error('First name and email are required')
    setSaving(true)
    try {
      if (editingStudent) await studentApi.update(editingStudent.studentId ?? editingStudent.id, form)
      else {
        const created = await studentApi.create(form)
        const record = created?.data ?? created ?? {}
        setCreatedAccount({
          entityType: 'student',
          name: `${form.firstName} ${form.lastName}`.trim(),
          id: record.studentId ?? record.id ?? 'Assigned by system',
          email: form.email,
          record: { ...record, ...form, name: `${form.firstName} ${form.lastName}`.trim() },
        })
      }
      toast.success(editingStudent ? 'Student updated' : 'Student created')
      setFormOpen(false)
      await fetchStudents()
    } catch (error) { toast.error(getApiErrorMessage(error, 'Unable to save student')) }
    finally { setSaving(false) }
  }

  const deleteStudent = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return
    try { await studentApi.remove(student.studentId ?? student.id); toast.success('Student deleted'); setModalOpen(false); await fetchStudents() }
    catch (error) { toast.error(getApiErrorMessage(error, 'Unable to delete student')) }
  }
 
  const filtered = useMemo(() => {
    return students.filter((s) => !statusFilter || s.status === statusFilter)
  }, [students, statusFilter])
 
  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand/10 to-teal/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">
              {row.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Courses',
      accessor: 'coursesEnrolled',
      render: (row) => (
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.coursesEnrolled}</span>
        </div>
      ),
    },
    {
      header: 'Progress',
      accessor: 'progress',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-[100px]">
            <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${row.progress}%` }}
                className="h-full rounded-full bg-gradient-to-r from-brand to-teal"
              />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500">{row.progress}%</span>
        </div>
      ),
    },
    {
      header: 'Certifications',
      accessor: 'certifications',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.certifications}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    { header: 'Joined', accessor: 'joinedDate' },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1"><button
          onClick={(e) => { e.stopPropagation(); navigate(`/super-admin/students/${row.id}`) }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="View student"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-brand" />
        </button><button onClick={(e) => { e.stopPropagation(); openStudentForm(row) }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /></button><button onClick={(e) => { e.stopPropagation(); deleteStudent(row) }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div>
      ),
    },
  ]
 
  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <KPICard dense icon={GraduationCap} label="Total Students" value={students.length} color="#0f55f7" delay={0} />
        <KPICard dense icon={Users} label="Active Students" value={students.length} color="#06b6a8" delay={1} />
        <KPICard dense icon={BookOpen} label="Completed Courses" value={STUDENT_STATS.completedCourses} color="#0f55f7" delay={2} />
        <KPICard dense icon={Award} label="Certifications Issued" value={STUDENT_STATS.certificationsIssued} color="#06b6a8" delay={3} />
      </div>
 
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <DashboardSection title="Enrollment Trends" subtitle="Monthly enrollments vs completions" icon={TrendingUp} className="lg:col-span-3">
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ENROLLMENT_TRENDS} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
                <Bar dataKey="enrollments" name="Enrollments" fill="#0f55f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completions" name="Completions" fill="#06b6a8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardSection>
 
        <DashboardSection title="Course Completion Rate" subtitle="Overall student progress" icon={PieChart} className="lg:col-span-2">
          <div className="h-44 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={COURSE_COMPLETION_RATE} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={1000}>
                  {COURSE_COMPLETION_RATE.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
              {COURSE_COMPLETION_RATE.map((d) => {
                const Icon = PIE_CHART_ICONS[d.icon]
                return (
                  <span key={d.name} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    {Icon && <Icon className="w-3.5 h-3.5" style={{ color: d.color }} />}
                    {!Icon && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />}
                    {d.name} <span className="font-medium text-slate-700 dark:text-slate-300">{d.value}%</span>
                  </span>
                )
              })}
            </div>
          </div>
        </DashboardSection>
      </div>
 
      {/* Header */}
      <PageHeader
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
        title="Students"
        subtitle="Manage all students registered on the platform"
        icon={GraduationCap}
        actions={<Button icon={Plus} onClick={() => openStudentForm()}>Add Student</Button>}
      />
 
      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={8}
        searchPlaceholder="Search students by name or email..."
        emptyTitle="No students found"
        emptyDescription="Try adjusting your search or filters."
        emptyIcon={GraduationCap}
        onRowClick={(row) => navigate(`/super-admin/students/${row.id}`)}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        }
      />
 
      {/* Student Details Modal */}
      <AnimatePresence>
        {modalOpen && selectedStudent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/10 to-teal/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-teal dark:text-teal-300">{selectedStudent.name}</h2>
                    <p className="text-sm text-slate-400">Student ID: {String(selectedStudent.id).toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
 
              <div className="overflow-y-auto p-6 space-y-6">
                {/* Status & Info */}
                <div className="flex items-center gap-4">
                  <StatusBadge status={selectedStudent.status} size="md" />
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {selectedStudent.joinedDate}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedStudent.lastActive}
                  </span>
                </div>
 
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Enrolled Courses', value: selectedStudent.coursesEnrolled, icon: BookOpen, color: '#0f55f7' },
                    { label: 'Certifications', value: selectedStudent.certifications, icon: Award, color: '#06b6a8' },
                    { label: 'Avg. Score', value: `${selectedStudent.avgScore}%`, icon: BarChart3, color: '#10B981' },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                      <item.icon className="w-4 h-4 mx-auto mb-1" style={{ color: item.color }} />
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
 
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Overall Progress</p>
                    <span className="text-sm font-bold text-brand">{selectedStudent.progress}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedStudent.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-brand to-teal"
                    />
                  </div>
                </div>
 
                {/* Skills */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0f55f7]/10 text-brand border border-[#0f55f7]/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
 
                {/* Contact */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Contact Information</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="w-4 h-4" />
                    {selectedStudent.email}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'} footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={saveStudent} loading={saving}>{editingStudent ? 'Save Changes' : 'Add Student'}</Button></div>}>
        <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div><Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </Modal>
      <AccountCreatedModal
        open={Boolean(createdAccount)}
        {...createdAccount}
        onClose={() => setCreatedAccount(null)}
        onView={() => { setSelectedStudent(createdAccount?.record); setModalOpen(true); setCreatedAccount(null) }}
        onDashboard={() => setCreatedAccount(null)}
      />
    </div>
  )
}
 
