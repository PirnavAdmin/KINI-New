import { useCallback, useEffect, useState } from 'react'
import { getMentorDashboardBatches, getMentorDashboardStudents } from '@shared/services/mentorService'
import { batchService } from '@shared/services/batchService'

const extractList = (value, key, depth = 0) => {
  if (depth > 5) return []
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  for (const candidate of [key, key[0].toUpperCase() + key.slice(1), 'items', 'Items', 'records', 'Records', 'results', 'Results']) {
    if (Array.isArray(value[candidate])) return value[candidate]
  }
  for (const candidate of ['data', 'Data', 'result', 'Result', 'payload', 'Payload']) {
    if (value[candidate] && typeof value[candidate] === 'object') {
      const nested = extractList(value[candidate], key, depth + 1)
      if (nested.length) return nested
    }
  }
  return []
}

const numeric = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback
const firstValue = (...values) => values.find((value) => value !== null && value !== undefined && String(value).trim() !== '') ?? 'Not available'

export const normalizeProgressPercentage = (...values) => {
  const raw = values.find((value) => value !== null && value !== undefined && value !== '')
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 0
  const percentage = parsed > 0 && parsed <= 1 ? parsed * 100 : parsed
  return Math.max(0, Math.min(100, Math.round(percentage)))
}

// Shared normalization for "a student assigned to the current mentor" — used
// by both Mentor → My Students and Mentor → Messages so a student's real id,
// name, batch, attendance and progress are read the exact same way in both
// places, from whichever real field name the backend happens to use.
export const normalizeMentorStudent = (student = {}, batch = {}) => {
  const id = student.studentId ?? student.StudentId ?? student.id ?? student.Id ?? student.userId ?? student.UserId
  const name = (student.studentName ?? student.StudentName ?? student.name ?? student.Name ?? [student.firstName ?? student.FirstName, student.lastName ?? student.LastName].filter(Boolean).join(' ')) || `Student ${id ?? ''}`.trim()
  const progress = normalizeProgressPercentage(
    student.progress,
    student.Progress,
    student.progressPercentage,
    student.ProgressPercentage,
    student.completionPercentage,
    student.courseProgress,
  )
  const attendance = numeric(student.attendance ?? student.Attendance ?? student.attendancePercentage ?? student.AttendancePercentage)
  const riskLevel = String(student.riskLevel ?? student.RiskLevel ?? student.risk ?? student.Risk ?? '').toLowerCase()
  const performance = student.performance ?? (riskLevel === 'high' ? 'poor' : progress >= 80 ? 'excellent' : progress >= 60 ? 'good' : progress > 0 ? 'average' : 'not rated')
  const batchId = student.batchId ?? student.BatchId ?? student.batch?.batchId ?? student.batch?.BatchId ?? student.batch?.id ?? batch.batchId ?? batch.BatchId ?? batch.id ?? batch.Id
  return {
    ...student,
    id,
    studentId: id,
    // The Student profile id for the photo API — never the userId fallback above.
    photoStudentId: student.studentId ?? student.StudentId ?? null,
    name,
    avatar: name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'ST',
    email: student.email ?? student.Email ?? student.emailAddress ?? '',
    phone: student.phone ?? student.Phone ?? student.phoneNumber ?? '',
    course: student.courseName ?? student.CourseName ?? student.course?.courseName ?? student.course?.name ?? batch.courseName ?? batch.CourseName ?? batch.course?.courseName ?? 'Course not provided',
    batch: student.batchName ?? student.BatchName ?? student.batch?.batchName ?? student.batch?.name ?? batch.batchName ?? batch.BatchName ?? batch.name ?? batch.Name ?? 'Batch not provided',
    batchId,
    progress,
    attendance,
    assignmentsCompleted: numeric(student.assignmentsCompleted ?? student.completedAssignments),
    assignmentsTotal: numeric(student.assignmentsTotal ?? student.totalAssignments),
    quizAverage: numeric(student.quizAverage ?? student.assessmentScore ?? student.averageScore),
    status: student.accountStatus ?? student.AccountStatus ?? student.enrollmentStatus ?? student.status ?? student.Status ?? 'Active',
    riskLevel,
    performance: String(performance).toLowerCase(),
      // APIs use several names for the same last-activity value. Keep the
      // first real activity timestamp so the My Students time filters do not
      // silently return an empty roster.
      lastActive: firstValue(
        student.lastActive,
        student.LastActive,
        student.lastActiveAt,
        student.LastActiveAt,
        student.lastActivityAt,
        student.LastActivityAt,
        student.lastActivityDate,
        student.LastActivityDate,
        student.lastActivity,
        student.LastActivity,
        student.activityDate,
        student.ActivityDate,
        student.lastSeenAt,
        student.LastSeenAt,
        student.lastSeen,
        student.LastSeen,
        student.lastLoginAt,
        student.LastLoginAt,
        student.lastLoginDate,
        student.LastLoginDate,
        student.lastLoginTime,
        student.LastLoginTime,
        student.lastLoggedInAt,
        student.LastLoggedInAt,
        student.lastLogin,
        student.LastLogin,
      ),
  }
}

// The one real source of "students assigned to the currently logged-in
// mentor" — both getMentorDashboardStudents() and getMentorDashboardBatches()
// resolve the mentor from the authenticated JWT server-side (no mentorId is
// ever sent from the frontend), so this can never return another mentor's
// roster. Batch rosters (StudentBatch/{batchId}/students) fan out across only
// the batches the dashboard says are actually assigned to this mentor.
export function useMentorStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadStudents = async () => {
      setLoading(true)
      setError('')
      const [studentsResult, batchesResult] = await Promise.allSettled([
        getMentorDashboardStudents(),
        getMentorDashboardBatches(),
      ])
      if (!active) return

      const dashboardStudents = studentsResult.status === 'fulfilled'
        ? extractList(studentsResult.value, 'students').map((student) => normalizeMentorStudent(student))
        : []
      const assignedBatches = batchesResult.status === 'fulfilled'
        ? extractList(batchesResult.value, 'batches')
        : []

      const rosterResults = await Promise.allSettled(assignedBatches
        .filter((batch) => batch.batchId ?? batch.id)
        .map(async (batch) => {
          const roster = await batchService.getStudents(batch.batchId ?? batch.id)
          return (roster.students ?? []).map((student) => normalizeMentorStudent(student, batch))
        }))
      if (!active) return
      const rosterStudents = rosterResults.flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      const source = [...rosterStudents, ...dashboardStudents]
      const uniqueStudents = [...new Map(source.map((student) => [String(student.id ?? `${student.email}:${student.batchId}`), student])).values()]
      setStudents(uniqueStudents)
      if (!uniqueStudents.length && studentsResult.status === 'rejected' && batchesResult.status === 'rejected') {
        const status = studentsResult.reason?.response?.status
        if (import.meta.env.DEV) {
          console.error('[API ERROR]', {
            endpoint: 'GET /api/mentor/dashboard/students, GET /api/mentor/dashboard/batches',
            status: status ?? 'network error',
            hook: 'useMentorStudents',
          })
        }
        setError(
          status === 403
            ? 'Students access is not enabled for your mentor account. Ask your organization admin to enable Students in Access & Permissions, then retry.'
            : studentsResult.reason?.response?.data?.message ?? 'Unable to load students assigned to your batches.',
        )
      }
      setLoading(false)
    }
    loadStudents().catch((requestError) => {
      if (!active) return
      setStudents([])
      setError(requestError?.response?.data?.message ?? 'Unable to load students assigned to your batches.')
      setLoading(false)
    })
    return () => { active = false }
  }, [reloadKey])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  return { students, setStudents, loading, error, reload }
}

export default useMentorStudents
