import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ClipboardCheck,
  Clock,
  Award,
  BarChart3,
  Users,
  Calendar,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CircleAlert,
} from 'lucide-react'
import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { assessmentsApi, courseApi, getApiErrorMessage } from '@shared/services/apiServices'

const STATUS_OPTIONS = ['pending', 'completed']
const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not scheduled'

const getAssessmentStatus = (assessment) => {
  const rawStatus = String(assessment.status ?? '').trim().toLowerCase()
  if (rawStatus === 'completed') return 'completed'
  const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null
  return dueDate && dueDate < new Date() ? 'overdue' : rawStatus || 'pending'
}

export default function OrgAssessments() {
  const [assessments, setAssessments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({ assessmentId: '', title: '', courseId: '', duration: '', totalMarks: '' })

  const fetchAssessments = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const rows = await assessmentsApi.list()
      setAssessments((Array.isArray(rows) ? rows : []).map((assessment) => ({
        id: assessment.assessmentId ?? assessment.id,
        assessmentId: assessment.assessmentId ?? assessment.id,
        title: assessment.title ?? assessment.assessmentTitle ?? assessment.name ?? `Assessment #${assessment.assessmentId ?? assessment.id}`,
        category: `Course ${assessment.courseId || '-'}`,
        courseId: assessment.courseId,
        difficulty: assessment.difficulty ?? assessment.level ?? 'Beginner',
        duration: Number(assessment.duration ?? assessment.durationMinutes ?? assessment.timeLimit ?? 0),
        totalQuestions: Number(assessment.totalQuestions ?? assessment.totalMarks ?? assessment.maximumMarks ?? 0),
        passingScore: Number(assessment.passingScore ?? assessment.passMarks ?? 60),
        bestScore: Number(assessment.bestScore ?? assessment.averageScore ?? assessment.avgScore ?? 0),
        maxAttempts: Number(assessment.maxAttempts ?? assessment.allowedAttempts ?? 1),
        attempts: Number(assessment.attempts ?? assessment.attemptCount ?? 0),
        description: assessment.description || 'Assessment details loaded from API.',
        dueDate: assessment.dueDate,
        skills: assessment.skills || [],
        status: getAssessmentStatus(assessment),
        assignedEmployees: Number(assessment.assignedEmployees ?? assessment.assignedStudents ?? assessment.assignedCount ?? 0),
        completionRate: Number(assessment.completionRate ?? assessment.completedPercentage ?? (String(assessment.status).toLowerCase() === 'completed' ? 100 : 0)),
      })))
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to load assessments')
      setLoadError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const rows = await courseApi.list()
      setCourses(Array.isArray(rows) ? rows : [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load courses for assessments'))
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAssessments()
      fetchCourses()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const openAssessmentForm = (assessment = null) => {
    setEditingAssessment(assessment)
    setFormData(assessment ? { assessmentId: assessment.assessmentId ?? assessment.id, title: assessment.title, courseId: assessment.courseId, duration: assessment.duration, totalMarks: assessment.totalQuestions } : { assessmentId: '', title: '', courseId: '', duration: '', totalMarks: '' })
    setShowCreateModal(true)
  }

  const handleSaveAssessment = async () => {
    const payload = {
      title: formData.title.trim(),
      courseId: Number(formData.courseId),
      duration: Number(formData.duration),
      totalMarks: Number(formData.totalMarks),
    }
    if (!payload.title || !Number.isInteger(payload.courseId) || payload.courseId <= 0
      || !Number.isInteger(payload.duration) || payload.duration <= 0
      || !Number.isInteger(payload.totalMarks) || payload.totalMarks <= 0) {
      toast.error('All assessment fields are required')
      return
    }
    if (!courses.some((course) => Number(course.courseId ?? course.id) === payload.courseId)) {
      toast.error('Please select a valid course')
      return
    }
    setSaving(true)
    try {
      if (editingAssessment) await assessmentsApi.update(editingAssessment.assessmentId ?? editingAssessment.id, payload)
      else await assessmentsApi.create(payload)
      toast.success(editingAssessment ? 'Assessment updated successfully' : 'Assessment created successfully')
      setShowCreateModal(false)
      setFormData({ assessmentId: '', title: '', courseId: '', duration: '', totalMarks: '' })
      await fetchAssessments()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save assessment'))
    } finally {
      setSaving(false)
    }
  }

  const deleteAssessment = async () => {
    const assessment = deleteTarget
    if (!assessment) return
    setDeleting(true)
    try { await assessmentsApi.remove(assessment.assessmentId ?? assessment.id); toast.success('Assessment deleted'); setDeleteTarget(null); await fetchAssessments() }
    catch (error) { toast.error(getApiErrorMessage(error, 'Unable to delete assessment')) }
    finally { setDeleting(false) }
  }

  const enrichedAssessments = useMemo(() =>
    assessments.map((assessment) => ({
      ...assessment,
      category: (() => {
        const course = courses.find((item) => Number(item.courseId ?? item.id) === Number(assessment.courseId))
        return course?.courseName ?? course?.title ?? course?.name
      })()
        || `Course ${assessment.courseId || '-'}`,
      status: getAssessmentStatus(assessment),
      assignedEmployees: assessment.assignedEmployees ?? 0,
      completionRate: assessment.completionRate ?? (assessment.status === 'completed' ? 100 : 0),
    })), [assessments, courses])

  const courseOptions = useMemo(() => courses.map((course) => ({
    value: course.courseId ?? course.id,
    label: course.courseName ?? course.title ?? course.name ?? `Course #${course.courseId ?? course.id}`,
  })), [courses])

  const filtered = useMemo(() =>
    enrichedAssessments.filter((assessment) => {
      const matchesStatus = !statusFilter || assessment.status === statusFilter
      const matchesDifficulty = !difficultyFilter || assessment.difficulty === difficultyFilter
      return matchesStatus && matchesDifficulty
    }), [enrichedAssessments, statusFilter, difficultyFilter])

  const completed = enrichedAssessments.filter((assessment) => assessment.status === 'completed')
  const averageScore = completed.length
    ? Math.round(completed.reduce((sum, assessment) => sum + (assessment.bestScore || 0), 0) / completed.length)
    : 0

  const stats = [
    { label: 'Assessments', value: enrichedAssessments.length, icon: ClipboardCheck, color: '#0f55f7' },
    { label: 'Pending', value: enrichedAssessments.filter((assessment) => assessment.status === 'pending').length, icon: Clock, color: '#F59E0B' },
    { label: 'Completed', value: completed.length, icon: Award, color: '#10B981' },
    { label: 'Avg Score', value: `${averageScore}%`, icon: BarChart3, color: '#06b6a8' },
  ]

  const columns = [
    {
      header: 'Assessment',
      accessor: 'title',
      sticky: 'left',
      width: 260,
      minWidth: 260,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f55f7]/10 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-[#0f55f7]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{row.title}</p>
            <p className="text-xs text-slate-400 truncate">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (row) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.difficulty}</span>
      ),
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {row.duration} min
        </span>
      ),
    },
    {
      header: 'Assigned',
      accessor: 'assignedEmployees',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.assignedEmployees}
        </span>
      ),
    },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {formatDate(row.dueDate)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      sticky: 'right',
      width: 152,
      minWidth: 152,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedAssessment(row)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="View assessment"
          >
            <Eye className="w-4 h-4 text-slate-400 hover:text-[#0f55f7]" />
          </button>
          <button
            type="button"
            onClick={() => openAssessmentForm(row)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Edit assessment"
          >
            <Edit3 className="w-4 h-4 text-slate-400 hover:text-[#F59E0B]" />
          </button>
          <button type="button" onClick={() => setDeleteTarget(row)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10" aria-label="Delete assessment"><Trash2 className="w-4 h-4 text-red-400" /></button>
        </div>
      ),
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:py-10 [&>div:first-child]:!mb-6"
    >
      <PageHeader
        title="Assessments"
        subtitle="Assign, monitor, and review organization assessments"
        icon={ClipboardCheck}
        actions={<Button icon={Plus} onClick={() => openAssessmentForm()}>Create Assessment</Button>}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} delay={index * 0.05} padding="p-5" className="group relative overflow-hidden !border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0f55f7]/5 dark:!border-slate-700">
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stat.color }} />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ring-1 ring-slate-900/5 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${stat.color}12` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        pageSize={6}
        searchable
        searchPlaceholder="Search assessments by title, category, or status..."
        emptyTitle="No assessments found"
        emptyDescription={loadError ? 'The assessment service could not be reached. Use Retry to load the records again.' : 'No assessment records were returned for this organization. Create the first assessment to get started.'}
        emptyIcon={ClipboardCheck}
        filters={
          <>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(event) => setDifficultyFilter(event.target.value)}
              className="px-3 py-2.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/30"
            >
              <option value="">All Difficulty</option>
              {DIFFICULTY_OPTIONS.map((difficulty) => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </>
        }
      />

      {loadError && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2"><CircleAlert className="h-4 w-4" />{loadError}</span>
          <Button variant="secondary" onClick={fetchAssessments}>Retry</Button>
        </div>
      )}

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingAssessment ? 'Edit Assessment' : 'Create Assessment'}
        description="Add a backend assessment"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>Cancel</Button>
            <Button icon={editingAssessment ? null : Plus} onClick={handleSaveAssessment} loading={saving}>{editingAssessment ? 'Save Changes' : 'Create Assessment'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Assessment ID" value={formData.assessmentId || 'Auto generated'} readOnly disabled />
          <Input label="Title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Course ID" required value={formData.courseId} onChange={(event) => setFormData({ ...formData, courseId: event.target.value })} options={courseOptions} placeholder="Select course" />
            <Input label="Duration (minutes)" required type="number" min="1" value={formData.duration} onChange={(event) => setFormData({ ...formData, duration: event.target.value })} />
            <Input label="Total Marks" required type="number" min="1" value={formData.totalMarks} onChange={(event) => setFormData({ ...formData, totalMarks: event.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Assessment"
        description={`Are you sure you want to delete ${deleteTarget?.title || 'this assessment'}? This action cannot be undone.`}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={deleteAssessment} icon={Trash2} loading={deleting}>Delete</Button>
          </div>
        }
      />

      <Modal
        open={!!selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        title={selectedAssessment?.title}
        description={`${selectedAssessment?.category || ''} - ${selectedAssessment?.difficulty || ''}`}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setSelectedAssessment(null)}>Close</Button>
          </div>
        }
      >
        {selectedAssessment && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Assessment ID', value: selectedAssessment.assessmentId },
                { label: 'Course', value: courseOptions.find((course) => String(course.value) === String(selectedAssessment.courseId))?.label || selectedAssessment.category },
                { label: 'Duration', value: `${selectedAssessment.duration} minutes` },
                { label: 'Total Marks', value: selectedAssessment.totalQuestions },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
