import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import {
  ArrowLeft, GraduationCap, Eye, BookOpen, Award, Trash2,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input } from '@shared/components/FormElements'
import { getApiErrorMessage, studentApi } from '@shared/services/apiServices'
import { ROUTES } from '@shared/constants/routeConstants'
import { STUDENTS } from '@shared/data/superAdminPageMockData'

// =================================
// TODO: API Integration
// GET /api/v1/super-admin/students
// GET /api/v1/super-admin/students/stats
// GET /api/v1/super-admin/students/:id
// DELETE /api/v1/super-admin/students/:id
// =================================

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
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' })

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const rows = await studentApi.list()
      // Only default a field when the source row is missing it — never zero out
      // real API values (courses, progress, certifications, etc.).
      setStudents((Array.isArray(rows) && rows.length ? rows : STUDENTS).map((row) => ({
        ...row,
        id: row.studentId ?? row.id,
        name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.name || row.email,
        coursesEnrolled: row.coursesEnrolled ?? row.enrolledCourses ?? 0,
        progress: row.progress ?? 0,
        certifications: row.certifications ?? row.certificatesIssued ?? 0,
        status: row.status || 'active',
        joinedDate: row.joinedDate || '-',
        lastActive: row.lastActive || '-',
        avgScore: row.avgScore ?? 0,
        skills: row.skills || [],
      })))
    } catch (error) {
      // Fall back to the curated student dataset so the page stays usable
      // when the API is not available yet.
      setStudents(STUDENTS.map((row) => ({ ...row, id: row.studentId ?? row.id, status: row.status || 'active' })))
      toast.error(getApiErrorMessage(error, 'Unable to load students'))
    } finally { setLoading(false) }
  }

  useEffect(() => {
    const timer = window.setTimeout(fetchStudents, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openStudentDetails = (student) => {
    const studentId = String(student.studentId ?? student.id)
    navigate(ROUTES.SUPER_ADMIN.STUDENT_DETAILS.replace(':studentId', studentId), {
      state: { student },
    })
  }

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
      else await studentApi.create(form)
      toast.success(editingStudent ? 'Student updated' : 'Student created')
      setFormOpen(false)
      await fetchStudents()
    } catch (error) { toast.error(getApiErrorMessage(error, 'Unable to save student')) }
    finally { setSaving(false) }
  }

  const deleteStudent = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return
    try { await studentApi.remove(student.studentId ?? student.id); toast.success('Student deleted'); await fetchStudents() }
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#0f55f7]">
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
                className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
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
          onClick={(e) => { e.stopPropagation(); openStudentDetails(row) }}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="View student details"
        >
          <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-[#0f55f7]" />
        </button><button onClick={(e) => { e.stopPropagation(); openStudentForm(row) }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Edit student"><GraduationCap className="w-3.5 h-3.5 text-slate-400" /></button><button onClick={(e) => { e.stopPropagation(); deleteStudent(row) }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button></div>
      ),
    },
  ]

  const backToSubscriptions = () => navigate(ROUTES.SUPER_ADMIN.SUBSCRIPTIONS)

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* Back to Subscriptions — the Students page sits inside the Subscriptions flow */}
      <button
        type="button"
        onClick={backToSubscriptions}
        className="mb-3 inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0f55f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/40 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Subscriptions
      </button>

      {/* Header */}
      <PageHeader
        showBreadcrumb={false}
        titleClassName="!text-2xl !leading-8"
        containerClassName="!mb-5"
        title="Students"
        subtitle="Manage all students registered on the platform"
        icon={GraduationCap}
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
        onRowClick={(row) => openStudentDetails(row)}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        }
      />

      {/* Add / Edit Student modal — Edit remains reachable from the row actions */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingStudent ? 'Edit Student' : 'Add Student'} footer={<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button><Button onClick={saveStudent} loading={saving}>{editingStudent ? 'Save Changes' : 'Add Student'}</Button></div>}>
        <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Input label="First Name" required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /><Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div><Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
      </Modal>
    </div>
  )
}
