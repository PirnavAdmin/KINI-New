import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Award, BarChart3, BookOpen, Calendar, Clock, GraduationCap,
  Mail, Sparkles,
} from 'lucide-react'
import StatusBadge from '@shared/components/StatusBadge'
import { studentApi } from '@shared/services/apiServices'
import { ROUTES } from '@shared/constants/routeConstants'
import { STUDENTS } from '@shared/data/superAdminPageMockData'

const CARD_CLASS =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-5'

const AVATAR_GRADIENT = 'bg-gradient-to-br from-[#0877B9] via-[#278F8D] to-[#58A94B]'

// Mirrors the normalization applied on the Students list page so a record
// always exposes the same field names whether it comes from the API, the
// navigation state, or the curated mock dataset.
const normalizeStudent = (row = {}) => ({
  ...row,
  id: row.studentId ?? row.id,
  name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.name || row.email || 'Unnamed student',
  email: row.email || '—',
  coursesEnrolled: row.coursesEnrolled ?? row.enrolledCourses ?? 0,
  progress: row.progress ?? 0,
  certifications: row.certifications ?? row.certificatesIssued ?? 0,
  status: row.status || 'active',
  joinedDate: row.joinedDate || '-',
  lastActive: row.lastActive || '-',
  avgScore: row.avgScore ?? 0,
  skills: row.skills || [],
})

const initialsOf = (name = '') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

function StatTile({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center dark:bg-slate-800/50">
      <Icon className="mx-auto mb-1.5 h-5 w-5" style={{ color }} />
      <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  )
}

export default function SuperAdminStudentDetails() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const passedStudent = location.state?.student
  const [student, setStudent] = useState(() =>
    passedStudent ? normalizeStudent(passedStudent) : null,
  )
  const [loading, setLoading] = useState(!passedStudent)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      // Best-effort fetch so direct visits / refreshes still resolve the record.
      try {
        const details = await studentApi.getById(studentId)
        if (!active) return
        setStudent(normalizeStudent(details))
        setLoading(false)
      } catch {
        if (!active) return
        const mock = STUDENTS.find(
          (item) => String(item.studentId ?? item.id) === String(studentId),
        )
        if (mock) {
          setStudent(normalizeStudent(mock))
          setLoading(false)
        } else {
          // Keep the student passed through navigation state if the fetch failed.
          if (!passedStudent) setNotFound(true)
          setLoading(false)
        }
      }
    }

    if (!passedStudent) load()
    return () => {
      active = false
    }
    // location.state is read once per id change and is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId])

  const backToList = () =>
    navigate(ROUTES.SUPER_ADMIN.STUDENTS, { state: { from: 'details' } })

  if (loading) {
    return (
      <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
        <div className="mb-4 h-9 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700/50" />
        <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900" />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" />
        </div>
      </div>
    )
  }

  if (notFound || !student) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-500/10">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Student Not Found</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            The student you&apos;re looking for could not be found.
          </p>
          <button
            type="button"
            onClick={backToList}
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f55f7] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b46d6]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 py-3 sm:px-6 lg:px-7">
      {/* Back to Students */}
      <motion.button
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        type="button"
        onClick={backToList}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[#0f55f7] dark:text-slate-400"
        aria-label="Back to students"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Students
      </motion.button>

      {/* Identity header */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[#0877B9] via-[#278F8D] to-[#58A94B]" />
        <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <div
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${AVATAR_GRADIENT} text-xs font-extrabold text-white shadow-md shadow-[#278F8D]/20`}
            >
              {initialsOf(student.name)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {student.name}
                </h1>
                <StatusBadge status={student.status} />
              </div>
              <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                {student.email}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                  Student ID {String(student.id).toUpperCase()}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {student.joinedDate}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Last active {student.lastActive}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile icon={BookOpen} label="Enrolled Courses" value={student.coursesEnrolled} color="#0f55f7" />
        <StatTile icon={Award} label="Certifications" value={student.certifications} color="#06b6a8" />
        <StatTile icon={BarChart3} label="Avg. Score" value={`${student.avgScore}%`} color="#10B981" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Overall Progress */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className={`${CARD_CLASS} lg:col-span-2`}
        >
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
              Overall Progress
            </h3>
            <span className="text-sm font-bold text-[#0f55f7]">{student.progress}%</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${student.progress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[#0f55f7] to-[#06b6a8]"
            />
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Course completion tracked across all enrolled programs.
          </p>
        </motion.section>

        {/* Contact Information */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className={`${CARD_CLASS} flex flex-col`}
        >
          <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
            Contact Information
          </h3>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{student.email}</span>
          </div>
        </motion.section>
      </div>

      {/* Skills */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className={`${CARD_CLASS} mt-4`}
      >
        <h3 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">Skills</h3>
        {student.skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {student.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-[#0f55f7]/20 bg-[#0f55f7]/10 px-3 py-1.5 text-xs font-medium text-[#0f55f7]"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">No skills recorded for this student.</p>
        )}
      </motion.section>
    </div>
  )
}
