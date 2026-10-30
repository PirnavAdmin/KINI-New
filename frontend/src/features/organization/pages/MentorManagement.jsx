import { personNameError } from "@shared/utils/personName";
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  Download,
  Edit3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  Upload,
  X,
  UsersRound,
} from 'lucide-react'

import PageHeader from '@shared/components/PageHeader'
import Card from '@shared/components/Card'
import Modal from '@shared/components/Modal'
import AccountCreatedModal from '@shared/components/AccountCreatedModal'
import EmptyState from '@shared/components/EmptyState'
import { TableSkeleton } from '@shared/ui/Skeleton'
import StatusBadge from '@shared/components/StatusBadge'
import { Button, Input, Select } from '@shared/components/FormElements'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { courseService } from '@shared/services/courseService'
import { mentorService } from '@shared/services/mentorService'

const PAGE_SIZE_OPTIONS = [10, 25, 50]
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  courseIds: [],
  status: true,
  photo: '',
}

const SORT_MAP = {
  mentorId: 'MentorId',
  mentorName: 'MentorName',
  courses: 'Courses',
  batches: 'Batches',
  liveClasses: 'LiveClasses',
  recordedClasses: 'RecordedClasses',
  attendance: 'Attendance',
  status: 'Status',
}

const clampPage = (page, totalPages) => {
  const safeTotal = Math.max(1, Number(totalPages) || 1)
  return Math.min(Math.max(1, Number(page) || 1), safeTotal)
}

const buildPageWindow = (currentPage, totalPages) => {
  const windowSize = 5
  if (totalPages <= windowSize) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const start = Math.max(1, currentPage - 2)
  const end = Math.min(totalPages, start + windowSize - 1)
  const adjustedStart = Math.max(1, end - windowSize + 1)

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index)
}

const normalizeStatus = (status) => {
  if (typeof status === 'boolean') return status ? 'active' : 'inactive'
  const value = String(status ?? '').trim().toLowerCase()
  if (value === 'enabled') return 'active'
  if (value === 'disabled') return 'inactive'
  return value || 'active'
}

const formatAttendance = (attendance) => {
  if (attendance === null || attendance === undefined || attendance === '') return '-'
  return typeof attendance === 'number' ? `${attendance}%` : String(attendance)
}

const formatJoinedDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const parseCourseIds = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isInteger(item) && item > 0)
  }

  return []
}

const getMentorName = (mentor) =>
  [mentor.firstName, mentor.lastName].filter(Boolean).join(' ').trim()
  || mentor.mentorName
  || mentor.name
  || '-'

const normalizeMentor = (mentor, courseMap = new Map()) => {
  const courseIds = parseCourseIds(mentor.courseIds ?? mentor.courseIdsCsv)
  const courseNamesFromIds = courseIds
    .map((id) => courseMap.get(Number(id))?.courseName || courseMap.get(Number(id))?.title || `Course ${id}`)
    .filter(Boolean)

  const batches = Array.isArray(mentor.batches) ? mentor.batches.join(', ') : (mentor.batches ?? '-')
  const courses = mentor.courses
    ?? mentor.courseNames
    ?? (courseNamesFromIds.length ? courseNamesFromIds.join(', ') : '-')

  return {
    ...mentor,
    id: mentor.mentorId ?? mentor.id,
    mentorId: mentor.mentorId ?? mentor.id,
    mentorName: mentor.mentorName ?? getMentorName(mentor),
    firstName: mentor.firstName ?? '',
    lastName: mentor.lastName ?? '',
    email: mentor.email ?? '',
    phone: mentor.phone ?? '',
    courseIds,
    courses: Array.isArray(courses) ? courses.join(', ') : courses,
    batches,
    liveClasses: Number(mentor.liveClasses ?? 0),
    recordedClasses: Number(mentor.recordedClasses ?? 0),
    attendance: mentor.attendance ?? 0,
    status: normalizeStatus(mentor.status),
  }
}

const buildMentorPayload = (form) => ({
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  courseIds: form.courseIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0),
  status: Boolean(form.status),
  ...(form.photo ? { profilePhoto: form.photo } : {}),
})

export default function MentorManagement() {
  const [mentors, setMentors] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortField, setSortField] = useState('mentorName')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [editingMentor, setEditingMentor] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState(INITIAL_FORM)
  const [createdAccount, setCreatedAccount] = useState(null)

  const loadMentors = useCallback(async ({ pageNumber = page, size = pageSize } = {}) => {
    setLoading(true)
    setErrorMessage('')

    const [mentorsResult, coursesResult] = await Promise.allSettled([
      mentorService.getMentors({
        searchText: searchText.trim(),
        status: statusFilter || undefined,
        sortBy: SORT_MAP[sortField] || SORT_MAP.mentorName,
        isDescending: sortOrder === 'desc',
        pageNumber,
        pageSize: size,
      }),
      courseService.getCourses({ page: 1, pageSize: 1000, sortBy: 'CourseName', sortOrder: 'asc' }),
    ])

    if (coursesResult.status === 'fulfilled') {
      setCourses(Array.isArray(coursesResult.value?.data) ? coursesResult.value.data : [])
    } else {
      setCourses([])
    }

    if (mentorsResult.status === 'fulfilled') {
      const payload = mentorsResult.value || {}
      const rows = Array.isArray(payload.data) ? payload.data : []
      const mentorCourses = coursesResult.status === 'fulfilled' ? (coursesResult.value?.data || []) : []
      const mentorCourseMap = new Map(mentorCourses.map((course) => [Number(course.courseId ?? course.id), course]))
      setMentors(rows.map((mentor) => normalizeMentor(mentor, mentorCourseMap)))
      setTotalRecords(Number(payload.totalRecords ?? payload.totalCount ?? rows.length ?? 0))
      setPage(clampPage(payload.pageNumber ?? payload.PageNumber ?? pageNumber, payload.totalPages ?? payload.TotalPages ?? 1))
      setPageSize(Number(payload.pageSize ?? payload.PageSize ?? size))
      setTotalPages(Number(payload.totalPages ?? payload.TotalPages ?? 1))
    } else {
      const message = getApiErrorMessage(mentorsResult.reason, 'Unable to load mentors')
      setMentors([])
      setErrorMessage(message)
      toast.error(message)
    }

    setLoading(false)
  }, [page, pageSize, searchText, sortField, sortOrder, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadMentors().catch(() => {})
    }, 250)
    return () => window.clearTimeout(timer)
  }, [loadMentors])

  const courseOptions = useMemo(() => courses.map((course) => ({
    value: Number(course.courseId ?? course.id),
    label: `${course.courseName ?? course.title ?? `Course ${course.courseId ?? course.id}`} (#${course.courseId ?? course.id})`,
  })).filter((course) => course.value), [courses])

  const stats = useMemo(() => {
    const active = mentors.filter((mentor) => normalizeStatus(mentor.status) === 'active').length
    const inactive = mentors.filter((mentor) => normalizeStatus(mentor.status) === 'inactive').length
    const averageAttendance = mentors.length
      ? Math.round(mentors.reduce((sum, mentor) => sum + Number(mentor.attendance || 0), 0) / mentors.length)
      : 0

    return [
      { label: 'Total Mentors', value: mentors.length, icon: UsersRound, color: '#0f55f7' },
      { label: 'Active', value: active, icon: UsersRound, color: '#06b6a8' },
      { label: 'Inactive', value: inactive, icon: UsersRound, color: '#F59E0B' },
      { label: 'Avg. Attendance', value: `${averageAttendance}%`, icon: BookOpen, color: '#8b5cf6' },
    ]
  }, [mentors])

  const pageWindow = useMemo(() => buildPageWindow(page, totalPages), [page, totalPages])

  const openCreate = () => {
    setEditingMentor(null)
    setForm(INITIAL_FORM)
    setFormErrors({})
    setFormOpen(true)
  }

  const mapMentorToForm = (mentor) => ({
    firstName: mentor?.firstName ?? '',
    lastName: mentor?.lastName ?? '',
    email: mentor?.email ?? '',
    phone: mentor?.phone ?? '',
    courseIds: Array.isArray(mentor?.courseIds) ? mentor.courseIds.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0) : [],
    status: normalizeStatus(mentor?.status) !== 'inactive',
    photo: mentor?.profilePhoto ?? mentor?.photo ?? mentor?.avatar ?? '',
  })

  const exportMentors = () => {
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
    const rows = [
      ['Mentor Name', 'Email', 'Phone', 'Courses', 'Batches', 'Status', 'Joined Date'],
      ...mentors.map((mentor) => [mentor.mentorName, mentor.email, mentor.phone, mentor.courses, mentor.batches, mentor.status, formatJoinedDate(mentor.joinedDate)]),
    ]
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'mentors.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`${mentors.length} mentor records exported.`)
  }

  const uploadPhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Select a valid image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be smaller than 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm((current) => ({ ...current, photo: String(reader.result || '') }))
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const openEdit = async (mentor) => {
    setEditingMentor(mentor)
    setFormLoading(true)
    setFormOpen(true)
    setFormErrors({})
    try {
      const detail = await mentorService.getMentor(mentor.mentorId ?? mentor.id)
      setForm(mapMentorToForm(detail))
    } catch {
      setForm(mapMentorToForm(mentor))
    } finally {
      setFormLoading(false)
    }
  }

  const openView = (mentor) => setSelectedMentor(mentor)

  const closeForm = () => {
    setFormOpen(false)
    setEditingMentor(null)
    setForm(INITIAL_FORM)
    setFormErrors({})
    setFormLoading(false)
  }

  const validateForm = () => {
    const nextErrors = {}
    if (personNameError(form.firstName, "First name")) nextErrors.firstName = personNameError(form.firstName, "First name");
    if (personNameError(form.lastName, "Last name")) nextErrors.lastName = personNameError(form.lastName, "Last name");
    if (!form.email.trim()) nextErrors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address'
    if (!/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = 'Phone number must contain exactly 10 digits'
    if (!Array.isArray(form.courseIds) || form.courseIds.length === 0) nextErrors.courseIds = 'Select at least one course'

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    const payload = buildMentorPayload(form)
    setSaving(true)
    try {
      if (editingMentor) {
        await mentorService.updateMentor(editingMentor.mentorId ?? editingMentor.id, payload)
        toast.success('Mentor updated successfully.')
      } else {
        const created = await mentorService.createMentor(payload)
        const record = created?.data ?? created ?? {}
        setCreatedAccount({
          entityType: 'mentor',
          name: `${form.firstName} ${form.lastName}`.trim(),
          id: record.mentorId ?? record.tutorId ?? record.employeeId ?? record.id ?? 'Assigned by system',
          email: form.email.trim(),
          password: record.temporaryPassword ?? record.tempPassword ?? record.password,
          record: { ...record, mentorName: `${form.firstName} ${form.lastName}`.trim(), email: form.email.trim() },
        })
        toast.success('Mentor created successfully.')
      }

      closeForm()
      await loadMentors({ pageNumber: page, size: pageSize })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to save mentor')
      const normalizedMessage = message.toLowerCase()
      if (normalizedMessage.includes('email')) {
        setFormErrors((current) => ({ ...current, email: message }))
      }
      if (normalizedMessage.includes('phone')) {
        setFormErrors((current) => ({ ...current, phone: message }))
      }
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setSaving(true)
    try {
      await mentorService.deleteMentor(deleteTarget.mentorId ?? deleteTarget.id)
      toast.success('Mentor deleted successfully.')
      setDeleteTarget(null)
      await loadMentors({ pageNumber: page, size: pageSize })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to delete mentor')
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const toggleCourse = (courseId) => {
    setForm((current) => {
      const exists = current.courseIds.includes(courseId)
      return {
        ...current,
        courseIds: exists
          ? current.courseIds.filter((value) => value !== courseId)
          : [...current.courseIds, courseId],
      }
    })
  }

  const handleSort = (field) => {
    if (!SORT_MAP[field]) return
    setPage(1)
    if (sortField === field) {
      setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortField(field)
    setSortOrder('asc')
  }

  const changeMentorStatus = async (mentor, value) => {
    const mentorId = mentor.mentorId ?? mentor.id;
    if (!mentorId) return;
    const active = value === "active";
    try {
      await mentorService.updateMentor(mentorId, {
        firstName: String(mentor.firstName ?? mentor.mentorName ?? "").trim().split(/\s+/)[0] || "Mentor",
        lastName: String(mentor.lastName ?? mentor.mentorName ?? "").trim().split(/\s+/).slice(1).join(" "),
        email: mentor.email ?? "",
        phone: mentor.phone ?? "",
        courseIds: (mentor.courseIds ?? []).map(Number).filter((id) => Number.isInteger(id) && id > 0),
        status: active,
      });
      setMentors((current) => current.map((item) =>
        String(item.mentorId ?? item.id) === String(mentorId) ? { ...item, status: active ? "active" : "inactive" } : item,
      ));
      toast.success(`Mentor marked ${active ? "active" : "inactive"}.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to update mentor status."));
    }
  };

  const columns = [
    { key: 'mentorName', label: 'Mentor Name', sortable: true, width: 180 },
    { key: 'email', label: 'Email', sortable: false, width: 200 },
    { key: 'courses', label: 'Assigned Course', sortable: true, width: 190 },
    { key: 'batches', label: 'Assigned Batch', sortable: true, width: 150 },
    { key: 'status', label: 'Status', sortable: true, width: 110 },
    { key: 'joinedDate', label: 'Joined Date', sortable: false, width: 120 },
    { key: 'actions', label: 'Actions', sortable: false, width: 130 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mentor-management-page mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:py-10 [&>div:first-child]:!mb-6"
    >
      <PageHeader
        title="Mentor Management"
        subtitle="Manage mentors using the live backend API"
        icon={UsersRound}
        actions={(
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={Download} onClick={exportMentors} disabled={loading || mentors.length === 0}>Export</Button>
            <Button variant="secondary" icon={RefreshCw} onClick={() => loadMentors({ pageNumber: page, size: pageSize })} loading={loading}>Refresh</Button>
            <Button icon={Plus} onClick={openCreate}>Add Mentor</Button>
          </div>
        )}
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Card
            key={stat.label}
            delay={index * 0.05}
            padding="p-5"
            className="group overflow-hidden !border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0f55f7]/5 dark:!border-slate-700"
          >
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: stat.color }} />
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-slate-900/5 transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: `${stat.color}12` }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden !p-0">
        <div className="border-b border-slate-200/70 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchText}
                  onChange={(event) => {
                    setPage(1)
                    setSearchText(event.target.value)
                  }}
                  placeholder="Search mentors by name, course, or status..."
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1)
                  setStatusFilter(event.target.value)
                }}
                options={STATUS_OPTIONS}
                placeholder="All Status"
                className="min-w-[160px]"
              />
              <Select
                value={pageSize}
                onChange={(event) => {
                  setPage(1)
                  setPageSize(Number(event.target.value))
                }}
                options={PAGE_SIZE_OPTIONS.map((size) => ({ value: size, label: `${size} / page` }))}
                placeholder="Rows"
                className="min-w-[140px]"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                <UsersRound className="h-3.5 w-3.5 text-[#0f55f7]" />
                {totalRecords} total records
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-3 border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="p-4 sm:p-5">
            <TableSkeleton rows={6} columns={9} />
          </div>
        ) : mentors.length === 0 ? (
          <div className="p-4 sm:p-5">
            <EmptyState
              title="No mentors found."
              description="Try adjusting your search or filter."
              icon={UsersRound}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1060px] w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-slate-200/70 bg-slate-50/70 dark:border-slate-700/70 dark:bg-slate-900/50">
                  {columns.map((column) => {
                    const activeSort = sortField === column.key
                    const SortIconComponent = activeSort ? (sortOrder === 'asc' ? SortAsc : SortDesc) : ChevronDown

                    return (
                      <th
                        key={column.key}
                        onClick={() => column.sortable && handleSort(column.key)}
                        className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.key === 'actions' ? 'sticky right-0 z-20 bg-slate-50 dark:bg-slate-900' : ''} ${column.sortable ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-300' : ''}`}
                        style={{ width: column.width, minWidth: column.width }}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          {column.label}
                          {column.sortable ? <SortIconComponent className={`h-3.5 w-3.5 ${activeSort ? 'text-[#0f55f7]' : 'text-slate-400'}`} /> : null}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {mentors.map((mentor, index) => (
                  <tr
                    key={mentor.mentorId ?? mentor.id ?? index}
                    onClick={() => openView(mentor)}
                    className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/70 dark:hover:bg-slate-800/30 ${index % 2 === 0 ? 'bg-white/80 dark:bg-slate-900/40' : 'bg-slate-50/40 dark:bg-slate-900/20'}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white truncate">{mentor.mentorName || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 truncate">{mentor.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 truncate">{mentor.courses || '-'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 truncate">{mentor.batches || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <label className="inline-flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <StatusBadge status={normalizeStatus(mentor.status)} />
                        <select
                          aria-label={`Change status for ${mentor.mentorName}`}
                          value={normalizeStatus(mentor.status)}
                          onChange={(event) => changeMentorStatus(mentor, event.target.value)}
                          className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 truncate">{formatJoinedDate(mentor.joinedDate ?? mentor.createdAt ?? mentor.createdDate ?? mentor.dateCreated ?? mentor.createdOn)}</td>
                    <td className="sticky right-0 z-10 bg-white px-4 py-3 text-sm dark:bg-slate-900">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openView(mentor) }}
                          className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label="View mentor"
                        >
                          <Eye className="h-4 w-4 text-slate-500 hover:text-[#0f55f7]" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openEdit(mentor) }}
                          className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                          aria-label="Edit mentor"
                        >
                          <Edit3 className="h-4 w-4 text-slate-500 hover:text-amber-500" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); setDeleteTarget(mentor) }}
                          className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          aria-label="Delete mentor"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mentors.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing page {page} of {totalPages} from {totalRecords} records
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => clampPage(current - 1, totalPages))}
                disabled={page === 1}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1 px-1">
                {pageWindow.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition ${
                      pageNumber === page
                        ? 'bg-[#0f55f7] text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPage((current) => clampPage(current + 1, totalPages))}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingMentor ? 'Edit Mentor' : 'Add Mentor'}
        description="Use the live mentor API with course assignments"
        size="xl"
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeForm} disabled={saving || formLoading}>Cancel</Button>
            <Button icon={saving ? Loader2 : Plus} onClick={handleSave} loading={saving || formLoading}>
              {editingMentor ? 'Save Changes' : 'Create Mentor'}
            </Button>
          </div>
        )}
      >
        {formLoading ? (
          <TableSkeleton rows={4} columns={2} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {form.photo ? <img src={form.photo} alt="Mentor preview" className="h-full w-full object-cover" /> : `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}` || 'M'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Mentor photo</p>
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">JPG, PNG or WebP, up to 2 MB.</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-slate-200 hover:bg-blue-50 dark:bg-slate-900 dark:ring-slate-700">
                  <Upload className="h-4 w-4" /> Upload Photo
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadPhoto} className="sr-only" />
                </label>
              </div>
            </div>
            <Input
              label="First Name"
              required
              value={form.firstName}
              onChange={(event) => setForm({ ...form, firstName: event.target.value })}
              error={formErrors.firstName}
            />
            <Input
              label="Last Name"
              required
              value={form.lastName}
              onChange={(event) => setForm({ ...form, lastName: event.target.value })}
              error={formErrors.lastName}
            />
            <Input
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              error={formErrors.email}
            />
            <Input
              label="Phone"
              type="tel"
              required
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })}
              error={formErrors.phone}
            />
            <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Course Assignments</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select one or more course IDs from the live course API.</p>
                </div>
                {formErrors.courseIds && <span className="text-xs font-semibold text-rose-500">{formErrors.courseIds}</span>}
              </div>
              <div className="mt-4 max-h-64 overflow-y-auto pr-1">
                {courseOptions.length === 0 ? (
                  <div className="rounded-xl bg-white p-4 text-sm text-slate-500 dark:bg-slate-900/50">
                    No courses available yet.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {courseOptions.map((course) => {
                      const selected = form.courseIds.includes(course.value)
                      return (
                        <button
                          key={course.value}
                          type="button"
                          onClick={() => toggleCourse(course.value)}
                          className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                            selected
                              ? 'border-[#0f55f7] bg-[#0f55f7]/5'
                              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/50'
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{course.label}</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400">Course ID: {course.value}</span>
                          </span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[#0f55f7] bg-[#0f55f7]' : 'border-slate-300 bg-transparent'}`}>
                            {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
            <Select
              label="Status"
              required
              value={String(form.status)}
              onChange={(event) => setForm({ ...form, status: event.target.value === 'true' })}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              error={formErrors.status}
            />
          </div>
        )}
      </Modal>

      <AnimatePresence>
        {selectedMentor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setSelectedMentor(null)}
            />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col border-l border-slate-200/70 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)] dark:border-slate-700/60 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-4 dark:border-slate-700/60">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Mentor Details</p>
                  <h2 className="mt-1 text-[14px] font-bold text-slate-900 dark:text-white">{selectedMentor.mentorName ?? 'Mentor Details'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#0f55f7]/25 hover:text-[#0f55f7] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  aria-label="Close mentor details"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="rounded-[20px] bg-[linear-gradient(135deg,rgba(15,85,247,0.08),rgba(124,58,237,0.08),rgba(6,182,168,0.08))] p-4 ring-1 ring-slate-900/[0.04] dark:ring-white/[0.06]">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={normalizeStatus(selectedMentor.status)} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      Mentor ID: {selectedMentor.mentorId ?? selectedMentor.id ?? '-'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-300">{selectedMentor.email ?? '-'}</p>
                      <p className="mt-1 text-[18px] font-black tracking-tight text-slate-900 dark:text-white">
                        {selectedMentor.mentorName ?? '-'}
                      </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Assigned Course</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{selectedMentor.courses ?? '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Assigned Batch</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{selectedMentor.batches ?? '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Phone</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{selectedMentor.phone ?? '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Joined Date</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                          {formatJoinedDate(selectedMentor.joinedDate ?? selectedMentor.createdAt ?? selectedMentor.createdDate ?? selectedMentor.dateCreated ?? selectedMentor.createdOn)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Live Classes</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{selectedMentor.liveClasses ?? '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Recorded Classes</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{selectedMentor.recordedClasses ?? '-'}</p>
                      </div>
                      <div className="rounded-2xl bg-white/85 p-3 shadow-sm dark:bg-slate-950/70 sm:col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Attendance</p>
                        <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">{formatAttendance(selectedMentor.attendance)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200/70 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/95">
                <div className="flex justify-end gap-3">
                  <Button variant="secondary" onClick={() => setSelectedMentor(null)}>Close</Button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Mentor"
        description={`Delete ${deleteTarget?.mentorName || 'this mentor'}?`}
        size="sm"
        footer={(
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={saving}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
          </div>
        )}
      >
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
          This permanently removes the mentor record from the live backend.
        </div>
      </Modal>
      <AccountCreatedModal
        open={Boolean(createdAccount)}
        {...createdAccount}
        onClose={() => setCreatedAccount(null)}
        onView={() => { setSelectedMentor(createdAccount?.record); setCreatedAccount(null) }}
        onDashboard={() => setCreatedAccount(null)}
      />
    </motion.div>
  )
}
