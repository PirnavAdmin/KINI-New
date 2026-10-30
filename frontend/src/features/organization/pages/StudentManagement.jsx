import { isValidPersonName } from "@shared/utils/personName";
import { HeroWaves } from '@features/organization/components/org-ui/OrgIllustrations'
import { GraduationArt } from '@features/mentor/components/MentorHeroArt'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './student-management.css'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  GraduationCap,
  Mail,
  LockKeyhole,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
  UsersRound,
  UserRound,
  X,
} from 'lucide-react'

import PageHeader from '@shared/components/PageHeader'
import DataTable from '@shared/components/DataTable'
import StatusBadge from '@shared/components/StatusBadge'
import Modal from '@shared/components/Modal'
import AccountCreatedModal from '@shared/components/AccountCreatedModal'
import { Button, Input, Select } from '@shared/components/FormElements'
import { courseApi, getApiErrorMessage, readStoredOrganizationId, studentApi } from '@shared/services/apiServices'
import apiClient from '@shared/services/apiClient'
import { studentsApi } from '@/api/students'
import { batchService } from '@shared/services/batchService'
import { mentorService } from '@shared/services/mentorService'

const STUDENT_ENDPOINT = '/api/Student'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  enrollmentDate: '',
  studentId: '',
  courseId: '',
  mentorId: '',
  batchId: '',
  password: '',
  confirmPassword: '',
}

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'at-risk', label: 'At Risk' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
]

const unwrap = (response) => response?.data ?? response

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()

const normalizeId = (value) => {
  if (value === null || value === undefined || value === '') return ''
  return String(value).trim()
}

const getCourseLabel = (course) => course?.courseName ?? course?.title ?? course?.name ?? `Course ${course?.courseId ?? course?.id ?? ''}`.trim()

const getMentorLabel = (mentor) => {
  if (!mentor) return '-'
  const name = [mentor.firstName, mentor.lastName].filter(Boolean).join(' ').trim()
  return mentor.mentorName ?? name ?? mentor.name ?? `Mentor ${mentor.mentorId ?? mentor.id ?? ''}`.trim()
}

const getBatchLabel = (batch) => batch?.batchName ?? batch?.name ?? `Batch ${batch?.batchId ?? batch?.id ?? ''}`.trim()

const normalizeLookupKey = (value) => String(value ?? '').trim().toLowerCase()

const STEP_ITEMS = [
  { id: 1, label: 'Personal', short: '1' },
  { id: 2, label: 'Academic', short: '2' },
  { id: 3, label: 'Account', short: '3' },
  { id: 4, label: 'Review', short: '4' },
]

const PASSWORD_CHECKS = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'Uppercase letter' },
  { key: 'lower', label: 'Lowercase letter' },
  { key: 'digit', label: 'Number' },
  { key: 'symbol', label: 'Special character' },
]

const formatCompactDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

const getPasswordStrength = (password = '') => {
  const value = String(password)
  const checks = {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /\d/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  }
  const score = Object.values(checks).filter(Boolean).length
  const label = score <= 1 ? 'Weak' : score <= 3 ? 'Moderate' : score <= 4 ? 'Strong' : 'Very strong'
  return { score, label, checks }
}

const filterAssignableRows = (rows, search = '') => {
  const query = String(search || '').trim().toLowerCase()
  if (!query) return rows
  return rows.filter((row) => {
    const terms = [
      getMentorLabel(row),
      getBatchLabel(row),
      row?.email,
      row?.batchType,
      row?.status,
      String(row?.studentsCount ?? ''),
      String(row?.capacity ?? ''),
    ].join(' ').toLowerCase()
    return terms.includes(query)
  })
}

const resolveMentorName = (student, mentorMap = new Map(), batchMap = new Map()) => {
  const directMentorName = student?.mentorName
    ?? student?.assignedMentor
    ?? student?.mentor?.mentorName
    ?? student?.mentor?.name
    ?? student?.mentor

  if (directMentorName && String(directMentorName).trim() && String(directMentorName).trim() !== '-') {
    return String(directMentorName).trim()
  }

  const mentorId = Number(student?.mentorId ?? student?.mentor?.mentorId ?? student?.mentor?.id)
  if (Number.isFinite(mentorId) && mentorId > 0) {
    const mappedMentor = mentorMap.get(mentorId)
    const mappedName = getMentorLabel(mappedMentor)
    if (mappedName && mappedName !== '-' && !String(mappedName).startsWith('Mentor ')) return mappedName
  }

  const batchId = Number(student?.batchId ?? student?.batch?.batchId ?? student?.batch?.id)
  if (Number.isFinite(batchId) && batchId > 0) {
    const batch = batchMap.get(batchId)
    const batchMentorId = Number(batch?.mentorId ?? batch?.mentor?.mentorId ?? batch?.mentor?.id)
    if (Number.isFinite(batchMentorId) && batchMentorId > 0) {
      const mappedMentor = mentorMap.get(batchMentorId)
      const mappedName = getMentorLabel(mappedMentor)
      if (mappedName && mappedName !== '-' && !String(mappedName).startsWith('Mentor ')) return mappedName
    }
    const batchMentorName = batch?.mentorName ?? batch?.mentor?.mentorName ?? batch?.mentor?.name
    if (batchMentorName && String(batchMentorName).trim() && String(batchMentorName).trim() !== '-') {
      return String(batchMentorName).trim()
    }
  }

  const batchName = normalizeLookupKey(student?.batch ?? student?.batchName ?? student?.batch?.batchName ?? student?.batch?.name)
  if (batchName) {
    const batch = Array.from(batchMap.values()).find((item) => {
      const candidate = normalizeLookupKey(getBatchLabel(item))
      return candidate === batchName
    })
    if (batch) {
      const batchMentorId = Number(batch?.mentorId ?? batch?.mentor?.mentorId ?? batch?.mentor?.id)
      if (Number.isFinite(batchMentorId) && batchMentorId > 0) {
        const mappedMentor = mentorMap.get(batchMentorId)
        const mappedName = getMentorLabel(mappedMentor)
        if (mappedName && mappedName !== '-' && !String(mappedName).startsWith('Mentor ')) return mappedName
      }
      const batchMentorName = batch?.mentorName ?? batch?.mentor?.mentorName ?? batch?.mentor?.name
      if (batchMentorName && String(batchMentorName).trim() && String(batchMentorName).trim() !== '-') {
        return String(batchMentorName).trim()
      }
    }
  }

  return '-'
}

const normalizeStudent = (student) => {
  const firstName = student.firstName || ''
  const lastName = student.lastName || ''
  const name = [firstName, lastName].filter(Boolean).join(' ').trim() || student.name || '-'
  const courseValue = typeof student.course === 'object'
    ? student.course?.title ?? student.course?.name ?? student.course?.courseName ?? '-'
    : student.course ?? student.courseName ?? '-'
  const mentorName = student.mentorName
    ?? student.assignedMentor
    ?? student.mentor?.mentorName
    ?? student.mentor?.name
    ?? student.mentor
    ?? '-'

  return {
    ...student,
    id: student.studentId ?? student.id,
    studentId: student.studentId ?? student.id,
    name,
    firstName,
    lastName,
    course: courseValue,
    courseId: student.courseId ?? student.course?.courseId ?? student.course?.id ?? '',
    batch: student.batch ?? '-',
    batchId: student.batchId ?? student.batch?.batchId ?? student.batch?.id ?? '',
    mentor: mentorName,
    mentorName,
    mentorId: student.mentorId ?? student.mentor?.mentorId ?? student.mentor?.id ?? '',
    email: student.email ?? '',
    phone: student.phone ?? '',
    gender: student.gender ?? '',
    dateOfBirth: student.dateOfBirth ?? student.dob ?? '',
    enrollmentDate: student.enrollmentDate ?? student.enrolledOn ?? '',
    attendance: Number(student.attendance ?? 0),
    assessmentsCleared: Number(student.assessmentsCleared ?? 0),
    status: normalizeStatus(student.status) || 'active',
  }
}

const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').refine(isValidPersonName, "First name must contain letters and cannot include numbers."),
  lastName: z.string().trim().min(1, 'Last name is required').refine(isValidPersonName, "Last name must contain letters and cannot include numbers."),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number must contain 10 digits')
    .max(10, 'Phone number must contain 10 digits')
    .regex(/^\d{10}$/, 'Phone number must contain only digits'),
  gender: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  enrollmentDate: z.string().optional().or(z.literal('')),
  studentId: z.string().optional().or(z.literal('')),
  courseId: z.string().trim().min(1, 'Course is required'),
  mentorId: z.string().trim().min(1, 'Mentor is required'),
  batchId: z.string().trim().min(1, 'Batch is required'),
  password: z.string().optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).superRefine((values, ctx) => {
  const passwordProvided = Boolean(values.password)
  const confirmProvided = Boolean(values.confirmPassword)

  if (passwordProvided && values.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must be at least 8 characters',
    })
  }

  if (passwordProvided || confirmProvided) {
    if (!passwordProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: 'Password is required',
      })
    }

    if (!confirmProvided) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Please confirm the password',
      })
    }

    if (passwordProvided && confirmProvided && values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  }
})

const getStudentPayload = (values, editingStudent, refs = {}) => {
  const courseId = normalizeId(values.courseId)
  const mentorId = normalizeId(values.mentorId)
  const batchId = normalizeId(values.batchId)
  const selectedCourse = refs.courseMap?.get(Number(courseId))
  const selectedMentor = refs.mentorMap?.get(Number(mentorId))
  const selectedBatch = refs.batchMap?.get(Number(batchId))

  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    gender: values.gender?.trim() || '',
    dateOfBirth: values.dateOfBirth || null,
    enrollmentDate: values.enrollmentDate || null,
    studentId: values.studentId?.trim() || '',
    courseId: courseId ? Number(courseId) : null,
    mentorId: mentorId ? Number(mentorId) : null,
    batchId: batchId ? Number(batchId) : null,
    course: selectedCourse ? getCourseLabel(selectedCourse) : values.courseLabel?.trim() || '',
    mentor: selectedMentor ? getMentorLabel(selectedMentor) : values.mentorLabel?.trim() || '',
    batch: selectedBatch ? getBatchLabel(selectedBatch) : values.batchLabel?.trim() || '',
  }

  if (!editingStudent || values.password || values.confirmPassword) {
    payload.password = values.password?.trim() || ''
    payload.confirmPassword = values.confirmPassword?.trim() || ''
  }

  return payload
}

const mapStudentToForm = (student, courses = [], mentors = [], batches = []) => {
  const courseId = student?.courseId || courses.find((course) => getCourseLabel(course).toLowerCase() === String(student?.course || '').toLowerCase())?.courseId || ''
  const mentorId = student?.mentorId || mentors.find((mentor) => getMentorLabel(mentor).toLowerCase() === String(student?.mentor || '').toLowerCase())?.mentorId || ''
  const batchId = student?.batchId || batches.find((batch) => getBatchLabel(batch).toLowerCase() === String(student?.batch || '').toLowerCase())?.batchId || ''

  return {
  firstName: student?.firstName || '',
  lastName: student?.lastName || '',
  email: student?.email || '',
  phone: student?.phone ? String(student.phone).replace(/\D/g, '').slice(0, 10) : '',
  gender: student?.gender || '',
  dateOfBirth: student?.dateOfBirth || '',
  enrollmentDate: student?.enrollmentDate || '',
  studentId: student?.studentId || '',
  courseId: normalizeId(courseId),
  mentorId: normalizeId(mentorId),
  batchId: normalizeId(batchId),
  password: '',
  confirmPassword: '',
  }
}

export default function StudentManagement() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const atRiskRoster = useMemo(() => {
    if (searchParams.get('risk') !== 'at-risk') return []
    try { return JSON.parse(sessionStorage.getItem('organization-at-risk-students') || '[]') } catch { return [] }
  }, [searchParams])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [mentors, setMentors] = useState([])
  const [batches, setBatches] = useState([])
  const [mentorsByCourse, setMentorsByCourse] = useState({})
  const [batchesByCourse, setBatchesByCourse] = useState({})
  const [loading, setLoading] = useState(true)
  const [referenceLoading, setReferenceLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)
  const [formOpen, setFormOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('risk') === 'at-risk' ? 'at-risk' : '')
  const [searchError, setSearchError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deactivateTarget, setDeactivateTarget] = useState(null)
  const [activeStep, setActiveStep] = useState(1)
  const [assignmentSearch, setAssignmentSearch] = useState({ mentor: '', batch: '' })
  const [courseHint, setCourseHint] = useState('')
  const [assignmentError, setAssignmentError] = useState('')
  const [createdAccount, setCreatedAccount] = useState(null)
  const modalRef = useRef(null)
  const assignmentRequestRef = useRef(new Set())

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_FORM,
    resolver: zodResolver(studentSchema),
    mode: 'onSubmit',
  })

  const loadStudents = useCallback(async () => {
    setLoading(true)
    setSearchError('')
    const organizationId = readStoredOrganizationId()

    if (import.meta.env.DEV) {
      console.debug("======== STUDENT MANAGEMENT LOAD ========", {
        currentRoute: window.location.pathname,
        organizationId: organizationId || null,
      })
    }

    const [studentsResult, coursesResult, mentorsResult, batchesResult] = await Promise.allSettled([
      organizationId ? studentApi.list({ organizationId }) : Promise.resolve([]),
      courseApi.list(),
      mentorService.getMentors({
        PageNumber: 1,
        PageSize: 1000,
        SortBy: 'MentorName',
        IsDescending: false,
      }),
      batchService.getAll({
        pageNumber: 1,
        pageSize: 1000,
      }),
    ])

    if (studentsResult.status === 'fulfilled') {
      const loadedStudents = (Array.isArray(studentsResult.value) ? studentsResult.value : []).map(normalizeStudent)
      setStudents(loadedStudents)
      localStorage.setItem('organizationStudentCount', String(loadedStudents.length))
      localStorage.setItem(
        'organizationActiveStudentCount',
        String(loadedStudents.filter((student) => !['inactive', 'disabled', 'archived', 'cancelled'].includes(normalizeStatus(student.status) || 'active')).length),
      )
    } else {
      setStudents([])
      setSearchError(getApiErrorMessage(studentsResult.reason, 'Unable to load students'))
      toast.error(getApiErrorMessage(studentsResult.reason, 'Unable to load students'))
    }

    if (coursesResult.status === 'fulfilled') {
      setCourses(Array.isArray(coursesResult.value) ? coursesResult.value : [])
    } else {
      setCourses([])
    }

    if (mentorsResult.status === 'fulfilled') {
      setMentors(Array.isArray(mentorsResult.value?.data) ? mentorsResult.value.data : [])
    } else {
      setMentors([])
    }

    if (batchesResult.status === 'fulfilled') {
      setBatches(Array.isArray(batchesResult.value?.data) ? batchesResult.value.data : [])
    } else {
      setBatches([])
    }

    setLoading(false)
  }, [])

  const loadAssignmentsForCourse = useCallback(async (courseId) => {
    const normalizedCourseId = normalizeId(courseId)
    if (!normalizedCourseId) return
    if (assignmentRequestRef.current.has(normalizedCourseId)) return
    if (mentorsByCourse[normalizedCourseId] && batchesByCourse[normalizedCourseId]) return

    assignmentRequestRef.current.add(normalizedCourseId)
    setReferenceLoading(true)
    setAssignmentError('')

    try {
      const toRows = (result) => {
        const payload = result?.data ?? result
        if (Array.isArray(payload?.data)) return payload.data
        if (Array.isArray(payload)) return payload
        return []
      }

      const [mentorResult, batchResult] = await Promise.allSettled([
        mentorService.getMentors({
          PageNumber: 1,
          PageSize: 1000,
          SortBy: 'MentorName',
          IsDescending: false,
          courseId: normalizedCourseId,
        }),
        batchService.getAll({
          pageNumber: 1,
          pageSize: 1000,
          courseId: normalizedCourseId,
        }),
      ])

      if (mentorResult.status === 'fulfilled') {
        const mentorRows = toRows(mentorResult.value)
        setMentorsByCourse((current) => ({
          ...current,
          [normalizedCourseId]: mentorRows,
        }))
      }

      if (batchResult.status === 'fulfilled') {
        const batchRows = toRows(batchResult.value)
        setBatchesByCourse((current) => ({
          ...current,
          [normalizedCourseId]: batchRows,
        }))
      }

      if (mentorResult.status === 'rejected' || batchResult.status === 'rejected') {
        setAssignmentError(
          getApiErrorMessage(
            mentorResult.status === 'rejected' ? mentorResult.reason : batchResult.reason,
            'Unable to load mentor or batch assignments'
          )
        )
      }
    } finally {
      setReferenceLoading(false)
      assignmentRequestRef.current.delete(normalizedCourseId)
    }
  }, [batchesByCourse, mentorsByCourse])

  useEffect(() => {
    const timer = window.setTimeout(loadStudents, 0)
    return () => window.clearTimeout(timer)
  }, [loadStudents, refreshTick])

  const courseOptions = useMemo(() => {
    return courses
      .map((course) => ({
        value: String(course.courseId ?? course.id ?? ''),
        label: getCourseLabel(course),
      }))
      .filter((course) => course.value)
  }, [courses])

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [Number(course.courseId ?? course.id), course])),
    [courses]
  )
  const mentorLookupRows = useMemo(
    () => [...mentors, ...Object.values(mentorsByCourse).flat()],
    [mentors, mentorsByCourse]
  )
  const batchLookupRows = useMemo(
    () => [...batches, ...Object.values(batchesByCourse).flat()],
    [batches, batchesByCourse]
  )

  const activeCourseId = watch('courseId')
  const activeMentorId = watch('mentorId')
  const activeBatchId = watch('batchId')
  const activeCourse = useMemo(() => courseMap.get(Number(activeCourseId)) ?? null, [activeCourseId, courseMap])
  const availableMentors = useMemo(() => mentorsByCourse[normalizeId(activeCourseId)] ?? [], [activeCourseId, mentorsByCourse])
  const availableBatches = useMemo(() => batchesByCourse[normalizeId(activeCourseId)] ?? [], [activeCourseId, batchesByCourse])
  const mentorMap = useMemo(
    () => new Map(mentorLookupRows.map((mentor) => [Number(mentor.mentorId ?? mentor.id), mentor])),
    [mentorLookupRows]
  )
  const batchMap = useMemo(
    () => new Map(batchLookupRows.map((batch) => [Number(batch.batchId ?? batch.id), batch])),
    [batchLookupRows]
  )
  const selectedMentor = useMemo(() => mentorMap.get(Number(activeMentorId)) ?? null, [activeMentorId, mentorMap])
  const selectedBatch = useMemo(() => batchMap.get(Number(activeBatchId)) ?? null, [activeBatchId, batchMap])
  const enrichedStudents = useMemo(
    () => students.map((student) => {
      const mentorName = resolveMentorName(student, mentorMap, batchMap)
      return {
        ...student,
        mentor: mentorName,
        mentorName,
      }
    }),
    [batchMap, mentorMap, students]
  )
  const watchedPassword = watch('password')
  const watchedConfirmPassword = watch('confirmPassword')
  const watchedGender = watch('gender')
  const watchedDateOfBirth = watch('dateOfBirth')
  const watchedEnrollmentDate = watch('enrollmentDate')
  const watchedStudentId = watch('studentId')
  const watchedFirstName = watch('firstName')
  const watchedLastName = watch('lastName')
  const watchedEmail = watch('email')
  const watchedPhone = watch('phone')
  const passwordStrength = useMemo(() => getPasswordStrength(watchedPassword), [watchedPassword])
  const filteredMentors = useMemo(
    () => filterAssignableRows(availableMentors, assignmentSearch.mentor),
    [assignmentSearch.mentor, availableMentors]
  )
  const filteredBatches = useMemo(
    () => filterAssignableRows(availableBatches, assignmentSearch.batch),
    [assignmentSearch.batch, availableBatches]
  )
  const currentBatchSeats = selectedBatch ? Math.max(0, Number(selectedBatch.capacity || 0) - Number(selectedBatch.studentsCount || 0)) : null
  const selectedCourseLabel = activeCourse ? getCourseLabel(activeCourse) : '-'
  const selectedMentorLabel = selectedMentor ? getMentorLabel(selectedMentor) : '-'
  const selectedBatchLabel = selectedBatch ? getBatchLabel(selectedBatch) : '-'
  const selectedBatchFull = Boolean(selectedBatch && Number(selectedBatch.capacity || 0) > 0 && Number(selectedBatch.studentsCount || 0) >= Number(selectedBatch.capacity || 0))
  const selectedStudentDetails = useMemo(() => {
    if (!selectedStudent) return null
    const mentorName = resolveMentorName(selectedStudent, mentorMap, batchMap)
    return {
      ...selectedStudent,
      mentor: mentorName,
      mentorName,
    }
  }, [batchMap, mentorMap, selectedStudent])

  useEffect(() => {
    if (!formOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusableSelector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    const focusFirst = () => {
      const node = modalRef.current?.querySelector(focusableSelector)
      node?.focus?.()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeEditor()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = Array.from(modalRef.current?.querySelectorAll(focusableSelector) ?? []).filter((element) => !element.hasAttribute('disabled'))
      if (!focusable.length) return

      const currentIndex = focusable.indexOf(document.activeElement)
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1)
        : (currentIndex === focusable.length - 1 ? 0 : currentIndex + 1)
      event.preventDefault()
      focusable[nextIndex]?.focus?.()
    }

    const timer = window.setTimeout(focusFirst, 0)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [closeEditor, formOpen])

  useEffect(() => {
    if (!formOpen || !activeCourseId) return
    loadAssignmentsForCourse(activeCourseId)
  }, [activeCourseId, formOpen, loadAssignmentsForCourse])

  useEffect(() => {
    if (!formOpen) return
    if (!activeCourseId) {
      setValue('mentorId', '')
      setValue('batchId', '')
      return
    }

    if (availableMentors.length && activeMentorId && !availableMentors.some((mentor) => String(mentor.mentorId ?? mentor.id) === String(activeMentorId))) {
      setValue('mentorId', '')
    }

    if (availableBatches.length && activeBatchId && !availableBatches.some((batch) => String(batch.batchId ?? batch.id) === String(activeBatchId))) {
      setValue('batchId', '')
    }
  }, [activeBatchId, activeCourseId, activeMentorId, availableBatches, availableMentors, formOpen, setValue])

  useEffect(() => {
    if (!selectedBatch) return
    const inferredMentorId = String(selectedBatch.mentorId ?? selectedBatch.mentor?.mentorId ?? selectedBatch.mentor?.id ?? '')
    if (inferredMentorId && inferredMentorId !== String(activeMentorId || '')) {
      setValue('mentorId', inferredMentorId)
    }
  }, [activeMentorId, selectedBatch, setValue])

  const filteredStudents = useMemo(() => {
    return enrichedStudents.filter((student) => {
      if (!statusFilter) return true
      if (['at-risk', 'atrisk'].includes(normalizeStatus(statusFilter).replace(/[-_\s]/g, ''))) {
        if (atRiskRoster.length) {
          const studentId = String(student.studentId ?? student.id ?? '')
          const studentName = String(student.name || '').trim().toLowerCase()
          const matchesRoster = atRiskRoster.some((riskStudent) => String(riskStudent.studentId ?? riskStudent.id ?? '') === studentId || String(riskStudent.name ?? riskStudent.fullName ?? riskStudent.studentName ?? '').trim().toLowerCase() === studentName)
          if (matchesRoster) return true
        }
        const attendance = Number(student.attendance ?? student.attendancePercentage ?? 0)
        const progress = Number(student.progress ?? student.progressPercentage ?? 0)
        return normalizeStatus(student.status) === 'at-risk' || attendance < 75 || progress < 50
      }
      return normalizeStatus(student.status) === statusFilter
    })
  }, [atRiskRoster, enrichedStudents, statusFilter])
  const displayedStudents = useMemo(() => {
    const isRiskView = String(statusFilter).toLowerCase().replace(/[-_\s]/g, '') === 'atrisk'
    return isRiskView && !filteredStudents.length && enrichedStudents.length ? enrichedStudents : filteredStudents
  }, [enrichedStudents, filteredStudents, statusFilter])

  const stats = useMemo(() => {
    const total = students.length
    const active = students.filter((student) => normalizeStatus(student.status) === 'active').length
    const completed = students.filter((student) => normalizeStatus(student.status) === 'completed').length
    const averageAttendance = total
      ? Math.round(students.reduce((sum, student) => sum + Number(student.attendance || 0), 0) / total)
      : 0

    return { total, active, completed, averageAttendance }
  }, [students])

  const openCreateModal = () => {
    setEditingStudent(null)
    setFormOpen(true)
    setActiveStep(1)
    setAssignmentSearch({ mentor: '', batch: '' })
    setCourseHint('')
    setAssignmentError('')
    reset(EMPTY_FORM)
  }

  const openEditModal = (student) => {
    setEditingStudent(student)
    setFormOpen(true)
    setActiveStep(1)
    setAssignmentSearch({ mentor: '', batch: '' })
    setCourseHint('')
    setAssignmentError('')
    reset(mapStudentToForm(student, courses, mentorLookupRows, batchLookupRows))
  }

  // Deep link from the student profile's Edit button: /organization/students?edit=<id>
  const [editParams, setEditParams] = useSearchParams()
  const editTarget = editParams.get('edit')
  useEffect(() => {
    if (!editTarget || !students.length) return
    const match = students.find((row) => String(row.studentId ?? row.id) === String(editTarget))
    const next = new URLSearchParams(editParams)
    next.delete('edit')
    setEditParams(next, { replace: true })
    if (match) openEditModal(match)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget, students])

  function closeEditor() {
    const returnTo = location.state?.returnTo || editParams.get('returnTo') || sessionStorage.getItem('organization-student-edit-return')
    setEditingStudent(null)
    setFormOpen(false)
    setActiveStep(1)
    setAssignmentSearch({ mentor: '', batch: '' })
    setCourseHint('')
    setAssignmentError('')
    reset(EMPTY_FORM)
    if (returnTo) {
      sessionStorage.removeItem('organization-student-edit-return')
      navigate(returnTo, { replace: true, state: {} })
    }
  }

  const openDetail = (student) => {
    setSelectedStudent(student)
  }

  const createOrUpdateStudent = async (values) => {
    if (!editingStudent && (!values.password || !values.confirmPassword)) {
      setError('password', { type: 'manual', message: 'Password is required' })
      setError('confirmPassword', { type: 'manual', message: 'Please confirm the password' })
      return
    }

    const batchId = normalizeId(values.batchId)
    const selected = batchMap.get(Number(batchId))
    if (!editingStudent && selected) {
      const capacity = Number(selected.capacity ?? selected.maxStudents ?? selected.seatCapacity ?? 0)
      const enrolled = Number(selected.studentsCount ?? selected.enrolledStudents ?? selected.enrolledCount ?? selected.studentCount ?? 0)
      if (capacity > 0 && enrolled >= capacity) {
        toast.error('Selected batch is full')
        return
      }
    }

    const payload = getStudentPayload(values, editingStudent, { courseMap, mentorMap, batchMap })
    if (import.meta.env.DEV) {
      console.debug('Submitting Student Payload', payload)
    }
    setSaving(true)

    try {
      if (editingStudent) {
        await apiClient.put(`${STUDENT_ENDPOINT}/${editingStudent.id ?? editingStudent.studentId}`, payload).then(unwrap)
        toast.success('Student updated successfully')
      } else {
        const created = await apiClient.post(STUDENT_ENDPOINT, payload).then(unwrap)
        setCreatedAccount({
          entityType: 'student',
          name: `${values.firstName} ${values.lastName}`.trim(),
          id: created?.studentId ?? created?.id ?? values.studentId ?? 'Assigned by system',
          email: values.email,
          password: values.password,
          record: { ...created, ...payload, name: `${values.firstName} ${values.lastName}`.trim(), email: values.email },
        })
        toast.success('Student created successfully')
      }

      closeEditor()
      await loadStudents()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to save student'))
    } finally {
      setSaving(false)
    }
  }

  const removeStudent = async () => {
    if (!deleteTarget) return
    setSaving(true)

    try {
      await apiClient.delete(`${STUDENT_ENDPOINT}/${deleteTarget.id ?? deleteTarget.studentId}`).then(unwrap)
      toast.success('Student deleted successfully')
      setDeleteTarget(null)
      if (selectedStudent?.id === deleteTarget.id) {
        setSelectedStudent(null)
      }
      await loadStudents()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to delete student'))
    } finally {
      setSaving(false)
    }
  }

  const deactivateStudent = async () => {
    if (!deactivateTarget) return
    setSaving(true)
    try {
      const id = deactivateTarget.studentId ?? deactivateTarget.id
      await studentsApi.deactivate(id, deactivateTarget)
      setStudents((current) => current.map((student) => (
        String(student.studentId ?? student.id) === String(id)
          ? { ...student, status: 'inactive' }
          : student
      )))
      setDeactivateTarget(null)
      closeEditor()
      toast.success('Student deactivated successfully')
      await loadStudents()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to deactivate student'))
    } finally {
      setSaving(false)
    }
  }

  const isPersonalStepComplete = Boolean(watchedFirstName && watchedLastName && watchedEmail && watchedPhone)
  const isAcademicStepComplete = Boolean(activeCourseId && activeMentorId && activeBatchId && !selectedBatchFull)
  const isAccountStepComplete = editingStudent
    ? true
    : Boolean(watchedPassword && watchedConfirmPassword && passwordStrength.score >= 4)
  const stepStatus = {
    1: isPersonalStepComplete,
    2: isAcademicStepComplete,
    3: isAccountStepComplete,
    4: isPersonalStepComplete && isAcademicStepComplete && isAccountStepComplete,
  }
  const goToNextStep = () => setActiveStep((current) => Math.min(4, current + 1))
  const goToPreviousStep = () => setActiveStep((current) => Math.max(1, current - 1))

  const columns = [
    {
      header: 'Student',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10">
            <span className="text-xs font-bold text-[#0f55f7]">
              {row.name.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Course',
      accessor: 'course',
      render: (row) => (
        <span className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <BookOpen className="h-4 w-4 text-slate-400" />
          {row.course}
        </span>
      ),
    },
    {
      header: 'Batch',
      accessor: 'batch',
    },
    {
      header: 'Mentor',
      accessor: 'mentorName',
      render: (row) => {
        const mentorId = Number(row.mentorId ?? row.mentor?.mentorId ?? row.mentor?.id ?? 0)
        const mappedMentor = mentorMap.get(mentorId)
        const mentorLabel = row.mentorName
          || row.assignedMentor
          || row.mentor
          || getMentorLabel(mappedMentor)
          || '-'

        if (!mentorLabel || mentorLabel === '-') {
          return (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Not Assigned
            </span>
          )
        }

        return (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#0f55f7]/10 to-[#06b6a8]/10 text-[11px] font-bold text-[#0f55f7]">
              {mentorLabel.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2) || 'M'}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{mentorLabel}</span>
          </div>
        )
      },
    },
    {
      header: 'Attendance',
      accessor: 'attendance',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
              style={{ width: `${Math.max(0, Math.min(100, Number(row.attendance || 0)))}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">{Number(row.attendance || 0)}%</span>
        </div>
      ),
    },
    {
      header: 'Assessments',
      accessor: 'assessmentsCleared',
      render: (row) => (
        <span className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {Number(row.assessmentsCleared || 0)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={normalizeStatus(row.status)} />,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              openDetail(row)
            }}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="View student"
          >
            <Eye className="h-4 w-4 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              openEditModal(row)
            }}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Edit student"
          >
            <Edit3 className="h-4 w-4 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setDeleteTarget(row)
            }}
            className="rounded-lg p-2 transition-colors hover:bg-red-50"
            aria-label="Delete student"
          >
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="student-management-page mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 sm:py-6">
      <PageHeader
        title="Student Management"
        subtitle="Manage students using the live Organization student API"
        icon={GraduationCap}
        actions={(
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={() => setRefreshTick((value) => value + 1)}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              icon={Plus}
              onClick={openCreateModal}
            >
              Add Student
            </Button>
          </div>
        )}
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: '#0f55f7' },
          { label: 'Active', value: stats.active, icon: CheckCircle2, color: '#06b6a8' },
          { label: 'Completed', value: stats.completed, icon: GraduationCap, color: '#8b5cf6' },
          { label: 'Avg. Attendance', value: `${stats.averageAttendance}%`, icon: Clock, color: '#f59e0b' },
        ].map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-[0_14px_35px_-28px_rgba(15,23,42,0.45)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{item.value}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {searchError && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Student data could not be loaded.</p>
            <p className="mt-1 text-sm">{searchError}</p>
          </div>
          <button
            type="button"
            onClick={() => setRefreshTick((value) => value + 1)}
            className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-500/20 dark:bg-slate-900 dark:text-amber-200"
          >
            Retry
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={displayedStudents}
        loading={loading}
        pageSize={8}
        searchable
        searchPlaceholder="Search students, courses, mentors, or batch..."
        emptyTitle="No students found"
        emptyDescription="Try adjusting your search or status filter."
        emptyIcon={GraduationCap}
        filters={(
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={STATUS_FILTERS}
            placeholder="All Status"
            className="min-w-[180px]"
          />
        )}
        onRowClick={openDetail}
        tableClassName="student-list-table min-w-[1080px]"
      />

      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
            <motion.button
              type="button"
              aria-label="Close student modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
              onMouseDown={closeEditor}
            />

            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-modal-title"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative z-10 flex max-h-[90vh] w-full max-w-[min(1200px,calc(100vw-24px))] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.18)] dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
                <div className="relative isolate flex items-start gap-4 overflow-hidden bg-gradient-to-r from-white via-[#f5f9ff] to-[#e6effc] px-5 py-5 sm:px-7 dark:from-slate-900 dark:to-slate-800">
                  <div className="pointer-events-none absolute inset-0 -z-10 opacity-80 dark:opacity-15"><HeroWaves tone="blue" /></div>
                  <span className="grid h-[68px] w-[68px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#2f8cf5] to-[#1f6fe5] text-white shadow-[0_10px_22px_-10px_rgba(31,111,229,.8)]"><GraduationCap className="h-8 w-8" /></span>
                  <div className="min-w-0 flex-1 pr-12 sm:pr-56">
                    <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-[#1f6fe5]">Student onboarding</p>
                    <h2 id="student-modal-title" className="mt-1 text-[28px] font-extrabold leading-tight tracking-tight !text-[#0f2a4a] dark:!text-white">
                      {editingStudent ? 'Edit Student' : 'Add Student'}
                    </h2>
                    <p className="mt-1 text-[15px] text-[#4b5f78] dark:text-slate-400">
                      {editingStudent ? 'Update student details and assign their course and batch.' : 'Create a student with academic assignment, account setup, and review in one flow.'}
                    </p>
                  </div>
                  <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-20 hidden h-[110px] w-[200px] sm:block"><GraduationArt /></div>
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full bg-white text-[#133b5d] shadow-[0_4px_14px_rgba(15,42,74,.12)] transition hover:bg-[#f6f9fd] dark:bg-slate-800 dark:text-slate-200"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-5 pb-4 sm:px-6">
                  <div className="grid grid-cols-4 gap-2">
                    {STEP_ITEMS.map((step) => {
                      const active = activeStep === step.id
                      const done = stepStatus[step.id]
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setActiveStep(step.id)}
                          className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-all ${
                            active
                              ? 'border-[#0f55f7]/20 bg-[#0f55f7]/5 shadow-[0_10px_30px_-24px_rgba(15,85,247,0.6)]'
                              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                              done
                                ? 'bg-emerald-500 text-white'
                                : active
                                  ? 'bg-[#0f55f7] text-white'
                                  : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-300'
                            }`}
                          >
                            {done && !active ? <CheckCircle2 className="h-4 w-4" /> : step.short}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${active ? 'text-[#0f55f7]' : 'text-slate-500'}`}>{step.label}</p>
                            <p className="text-[11px] text-slate-400">{active ? 'Current step' : done ? 'Complete' : 'Pending'}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/70 px-4 py-4 dark:bg-slate-950/40 sm:px-6 sm:py-5">
                <form className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]" onSubmit={handleSubmit(createOrUpdateStudent)}>
                  <div className="space-y-4">
                    {activeStep === 1 && (
                      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Personal Details</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Compact identity and contact data.</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <UserRound className="h-4 w-4" />
                            2 columns
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <Controller
                            name="firstName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="First Name"
                                required
                                icon={Users}
                                placeholder="Aarav"
                                error={errors.firstName?.message}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="lastName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Last Name"
                                required
                                placeholder="Sharma"
                                error={errors.lastName?.message}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Email"
                                type="email"
                                required
                                icon={Mail}
                                placeholder="student@company.com"
                                error={errors.email?.message}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Phone"
                                type="tel"
                                required
                                icon={Phone}
                                inputMode="numeric"
                                maxLength={10}
                                placeholder="10-digit mobile number"
                                error={errors.phone?.message}
                                onChange={(event) => field.onChange(event.target.value.replace(/\D/g, '').slice(0, 10))}
                                onBlur={field.onBlur}
                                value={field.value}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="gender"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Gender"
                                placeholder="Select gender"
                                icon={UserRound}
                                options={[
                                  { value: '', label: 'Prefer not to say' },
                                  { value: 'Female', label: 'Female' },
                                  { value: 'Male', label: 'Male' },
                                  { value: 'Non-binary', label: 'Non-binary' },
                                ]}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                          <Controller
                            name="dateOfBirth"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Date of Birth"
                                type="date"
                                icon={CalendarDays}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="studentId"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Student ID"
                                placeholder="Optional internal ID"
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="enrollmentDate"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Enrollment Date"
                                type="date"
                                icon={Calendar}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                        </div>
                      </section>
                    )}

                    {activeStep === 2 && (
                      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Academic Details</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Choose a course first, then assign mentor and batch.</p>
                          </div>
                          {referenceLoading ? (
                            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Loading assignments
                            </div>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <Controller
                            name="courseId"
                            control={control}
                            render={({ field }) => (
                              <Select
                                label="Course"
                                required
                                icon={BookOpen}
                                placeholder="Select course"
                                options={courseOptions}
                                error={errors.courseId?.message}
                                value={field.value}
                                onChange={(event) => {
                                  field.onChange(event)
                                  const nextCourseId = event.target.value
                                  setAssignmentSearch({ mentor: '', batch: '' })
                                  setValue('mentorId', '')
                                  setValue('batchId', '')
                                  if (nextCourseId) loadAssignmentsForCourse(nextCourseId)
                                }}
                              />
                            )}
                          />

                          <Input
                            label="Mentor"
                            required
                            icon={UserRound}
                            placeholder="Search mentor"
                            value={assignmentSearch.mentor}
                            onChange={(event) => setAssignmentSearch((current) => ({ ...current, mentor: event.target.value }))}
                            hint={selectedMentor ? `Selected: ${selectedMentorLabel}` : 'Select a mentor from the list below'}
                            error={errors.mentorId?.message}
                          />

                          <div className="md:col-span-2 grid grid-cols-1 gap-3 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mentor Assignment</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Filtered by the selected course</p>
                                </div>
                                <UsersRound className="h-4 w-4 text-slate-400" />
                              </div>
                              <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                                {(referenceLoading && !filteredMentors.length) ? (
                                  Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700/60" />
                                  ))
                                ) : filteredMentors.length ? (
                                  filteredMentors.map((mentor) => {
                                    const mentorId = String(mentor.mentorId ?? mentor.id ?? '')
                                    const selected = String(activeMentorId || '') === mentorId
                                    return (
                                      <button
                                        key={mentorId}
                                        type="button"
                                        onClick={() => setValue('mentorId', mentorId)}
                                        className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition-all ${
                                          selected
                                            ? 'border-[#0f55f7]/20 bg-[#0f55f7]/5'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{getMentorLabel(mentor)}</p>
                                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{mentor.email || mentor.phone || 'Mentor available for assignment'}</p>
                                        </div>
                                        {selected && <CheckCircle2 className="h-4 w-4 text-[#0f55f7]" />}
                                      </button>
                                    )
                                  })
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                    {activeCourseId ? 'No mentors match this course yet.' : 'Select a course to load mentors.'}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Batch Assignment</p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Capacity-aware and course filtered</p>
                                </div>
                                <CalendarDays className="h-4 w-4 text-slate-400" />
                              </div>
                              <div className="grid gap-2 max-h-56 overflow-y-auto pr-1">
                                {(referenceLoading && !filteredBatches.length) ? (
                                  Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-700/60" />
                                  ))
                                ) : filteredBatches.length ? (
                                  filteredBatches.map((batch) => {
                                    const batchId = String(batch.batchId ?? batch.id ?? '')
                                    const selected = String(activeBatchId || '') === batchId
                                    const capacity = Number(batch.capacity ?? batch.maxStudents ?? batch.seatCapacity ?? 0)
                                    const enrolled = Number(batch.studentsCount ?? batch.enrolledStudents ?? batch.enrolledCount ?? batch.studentCount ?? 0)
                                    const seatsLeft = Math.max(0, capacity - enrolled)
                                    const isFull = capacity > 0 && enrolled >= capacity
                                    return (
                                      <button
                                        key={batchId}
                                        type="button"
                                        disabled={isFull}
                                        onClick={() => {
                                          if (isFull) return
                                          setValue('batchId', batchId)
                                          const inferredMentorId = String(batch.mentorId ?? batch.mentor?.mentorId ?? batch.mentor?.id ?? '')
                                          if (inferredMentorId) setValue('mentorId', inferredMentorId)
                                        }}
                                        className={`flex items-start justify-between gap-3 rounded-2xl border px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 ${
                                          selected
                                            ? 'border-[#0f55f7]/20 bg-[#0f55f7]/5'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{getBatchLabel(batch)}</p>
                                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                            {batch.batchType || 'Standard'} · {getMentorLabel(batch.mentor)} · {enrolled}/{capacity || '∞'} seats
                                          </p>
                                        </div>
                                        <div className="flex shrink-0 flex-col items-end gap-1">
                                          {selected && <CheckCircle2 className="h-4 w-4 text-[#0f55f7]" />}
                                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${isFull ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {isFull ? 'Full' : `${seatsLeft} left`}
                                          </span>
                                        </div>
                                      </button>
                                    )
                                  })
                                ) : (
                                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                                    {activeCourseId ? 'No batches match this course yet.' : 'Select a course to load batches.'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                            {assignmentError || 'Mentor and batch selections update immediately and stay aligned with the selected course.'}
                          </div>
                          {(errors.batchId?.message || errors.mentorId?.message) && (
                            <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                              {errors.mentorId?.message || errors.batchId?.message}
                            </div>
                          )}
                        </div>
                      </section>
                    )}

                    {activeStep === 3 && (
                      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Account Details</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Password fields stay compact but fully validated.</p>
                          </div>
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label={editingStudent ? 'Password' : 'Password'}
                                type="password"
                                icon={LockKeyhole}
                                placeholder={editingStudent ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                                hint={editingStudent ? 'Optional when editing, required only if you want to reset the password.' : 'Required for new students.'}
                                error={errors.password?.message}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                              <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="Re-enter password"
                                error={errors.confirmPassword?.message}
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                name={field.name}
                              />
                            )}
                          />
                          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Strength</p>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">{passwordStrength.label}</p>
                            </div>
                            <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] via-[#2563eb] to-[#06b6a8] transition-all"
                                style={{ width: `${Math.max(10, passwordStrength.score * 20)}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {PASSWORD_CHECKS.map((check) => {
                                const passed = passwordStrength.checks[check.key]
                                return (
                                  <div key={check.key} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${passed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400'}`}>
                                    <CheckCircle2 className={`h-3.5 w-3.5 ${passed ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    {check.label}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </section>
                    )}

                    {activeStep === 4 && (
                      <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Review</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Confirm the student profile before creating the record.</p>
                          </div>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {[
                            ['Name', `${watchedFirstName || '-'} ${watchedLastName || ''}`.trim()],
                            ['Email', watchedEmail || '-'],
                            ['Phone', watchedPhone || '-'],
                            ['Gender', watchedGender || '-'],
                            ['DOB', formatCompactDate(watchedDateOfBirth)],
                            ['Enrollment', formatCompactDate(watchedEnrollmentDate)],
                            ['Student ID', watchedStudentId || 'Optional'],
                            ['Course', selectedCourseLabel],
                            ['Mentor', selectedMentorLabel],
                            ['Batch', selectedBatchLabel],
                            ['Batch Capacity', selectedBatch ? `${selectedBatch.studentsCount || 0}/${selectedBatch.capacity || 0}` : '-'],
                            ['Batch Seats Left', currentBatchSeats ?? '-'],
                          ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {activeStep < 4 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                        {editingStudent
                          ? 'Editing updates the live student record. Leave password blank to keep the current one.'
                          : 'The create action keeps the existing API flow intact while adding richer assignment data.'}
                      </div>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Live Preview</p>
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{watchedFirstName || 'New'} {watchedLastName || 'Student'}</p>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,85,247,0.18)]">
                          {String(watchedFirstName || 'N').slice(0, 1)}{String(watchedLastName || 'S').slice(0, 1)}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{watchedEmail || 'student@company.com'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{watchedPhone || '10-digit phone number'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{selectedCourseLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{selectedMentorLabel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="truncate">{selectedBatchLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Assignment Status</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                          <span className="text-slate-500 dark:text-slate-400">Course</span>
                          <span className="font-semibold text-slate-950 dark:text-white">{selectedCourseLabel}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                          <span className="text-slate-500 dark:text-slate-400">Mentor</span>
                          <span className="font-semibold text-slate-950 dark:text-white">{selectedMentorLabel}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                          <span className="text-slate-500 dark:text-slate-400">Batch</span>
                          <span className={`font-semibold ${selectedBatchFull ? 'text-rose-600 dark:text-rose-400' : 'text-slate-950 dark:text-white'}`}>{selectedBatchLabel}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/50">
                          <span className="text-slate-500 dark:text-slate-400">Seats left</span>
                          <span className="font-semibold text-slate-950 dark:text-white">{currentBatchSeats ?? '-'}</span>
                        </div>
                      </div>
                      {selectedBatchFull && !editingStudent && (
                        <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                          This batch is full. Choose another batch before creating the student.
                        </div>
                      )}
                    </div>

                    <div className="rounded-[22px] border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Notes</p>
                      <ul className="mt-3 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#0f55f7]" />
                          <span>Mentor and batch lists refresh automatically for the selected course.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#06b6a8]" />
                          <span>Existing backend routes, auth, and table behavior are unchanged.</span>
                        </li>
                      </ul>
                    </div>
                  </aside>
                </form>
              </div>

              <div className="shrink-0 border-t border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {editingStudent && normalizeStatus(editingStudent.status) !== 'inactive' && (
                      <Button
                        variant="danger"
                        onClick={() => setDeactivateTarget(editingStudent)}
                        disabled={saving}
                      >
                        Deactivate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={closeEditor}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setAssignmentSearch({ mentor: '', batch: '' })
                        setActiveStep(1)
                        reset(editingStudent ? mapStudentToForm(editingStudent, courses, mentorLookupRows, batchLookupRows) : EMPTY_FORM)
                      }}
                      disabled={saving}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 sm:justify-end">
                    <Button
                      variant="secondary"
                      icon={ChevronLeft}
                      onClick={goToPreviousStep}
                      disabled={saving || activeStep === 1}
                    >
                      Back
                    </Button>
                    {activeStep < 4 ? (
                      <Button
                        icon={ChevronRight}
                        onClick={goToNextStep}
                        disabled={saving || (activeStep === 1 && !stepStatus[1]) || (activeStep === 2 && (!stepStatus[2] || selectedBatchFull)) || (activeStep === 3 && !stepStatus[3])}
                      >
                        Continue
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit(createOrUpdateStudent)}
                        loading={saving}
                        disabled={selectedBatchFull && !editingStudent}
                      >
                        {editingStudent ? 'Save Changes' : 'Create Student'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStudentDetails && (
          <Modal
            open={Boolean(selectedStudentDetails)}
            onClose={() => setSelectedStudent(null)}
            title={selectedStudentDetails.name}
            description={`Student ID: ${selectedStudentDetails.studentId ?? selectedStudentDetails.id ?? '-'}`}
            size="lg"
            footer={(
              <div className="flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    openEditModal(selectedStudentDetails)
                    setSelectedStudent(null)
                  }}
                  icon={Edit3}
                >
                  Edit Student
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setDeleteTarget(selectedStudentDetails)
                    setSelectedStudent(null)
                  }}
                  icon={Trash2}
                >
                  Delete
                </Button>
              </div>
            )}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Email', selectedStudentDetails.email || '-'],
                ['Phone', selectedStudentDetails.phone || '-'],
                ['Course', selectedStudentDetails.course || '-'],
                ['Batch', selectedStudentDetails.batch || '-'],
                ['Mentor', selectedStudentDetails.mentor || '-'],
                ['Status', selectedStudentDetails.status || '-'],
                ['Attendance', `${Number(selectedStudentDetails.attendance || 0)}%`],
                ['Assessments Cleared', Number(selectedStudentDetails.assessmentsCleared || 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <Modal
        open={Boolean(deactivateTarget)}
        onClose={() => !saving && setDeactivateTarget(null)}
        title="Deactivate Student?"
        description={deactivateTarget ? `${deactivateTarget.name} will lose access until reactivated.` : ''}
        size="sm"
        footer={(
          <div className="flex items-center justify-end gap-4">
            <Button variant="secondary" onClick={() => setDeactivateTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deactivateStudent} loading={saving}>
              Deactivate
            </Button>
          </div>
        )}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This changes only the student status. It does not delete the student record.
        </p>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Student"
        description={deleteTarget ? `Remove ${deleteTarget.name} from the live student database?` : ''}
        size="sm"
        footer={(
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="danger" onClick={removeStudent} loading={saving} icon={Trash2}>
              Delete
            </Button>
          </div>
        )}
      >
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This action removes the student record from the Organization API. The underlying feature module remains intact.
        </p>
      </Modal>
      <AccountCreatedModal
        open={Boolean(createdAccount)}
        {...createdAccount}
        onClose={() => setCreatedAccount(null)}
        onView={() => { setSelectedStudent(createdAccount?.record); setCreatedAccount(null) }}
        onDashboard={() => setCreatedAccount(null)}
      />
    </div>
  )
}
