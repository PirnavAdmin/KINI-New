import { useEffect, useMemo, useState } from 'react'
import { batchService } from '@shared/services/batchService'
import { useStudentEnrollments } from './useStudentEnrollments'

const titleCase = (value) => String(value || '').trim().replace(/\b\w/g, (character) => character.toUpperCase())

const idOf = (value) => {
  if (value === null || value === undefined || typeof value === 'object') return null
  const id = String(value).trim()
  return id && id !== '0' ? id : null
}

// Mentor fields a batch record may carry (Batch.MentorId on the backend).
const mentorFromBatch = (batch = {}) => {
  const mentor = batch.mentor && typeof batch.mentor === 'object' ? batch.mentor : {}
  return {
    mentorId: idOf(batch.mentorId ?? batch.tutorId ?? mentor.mentorId ?? mentor.id),
    mentorName: batch.mentorName ?? batch.trainerName ?? mentor.name ?? mentor.fullName
      ?? [mentor.firstName, mentor.lastName].filter(Boolean).join(' '),
    mentorEmail: batch.mentorEmail ?? mentor.email ?? '',
  }
}

// The signed-in student's mentors, one per mentor across all their course ×
// batch enrollments. Source: the token-scoped GET /api/v1/student/courses
// (useStudentEnrollments, the same data My Batch shows). The previous source,
// GET /api/v1/organization/students/{id}, is an organization-only route: with
// a student token it failed and the page silently showed no mentor.
//
// status: 'loading' | 'ready' | 'no-mentor' (enrolled, but no mentor on any
// batch yet) | 'no-enrollment' | 'error' | 'not-student'.
export function useAssignedMentor() {
  const { status: enrollmentStatus, enrollments, error, loading: enrollmentsLoading, reload } = useStudentEnrollments()
  const [batchExtras, setBatchExtras] = useState({})
  const [extrasLoading, setExtrasLoading] = useState(false)

  // A batch listed without its mentor: read the batch itself. Student tokens
  // may be refused there (as on My Batch); that only leaves the mentor unknown.
  const missingBatchIds = useMemo(() => [...new Set(enrollments
    .filter((entry) => entry.batchId && !entry.mentorId)
    .map((entry) => entry.batchId))], [enrollments])

  useEffect(() => {
    if (!missingBatchIds.length) return undefined
    let cancelled = false
    queueMicrotask(() => { if (!cancelled) setExtrasLoading(true) })
    Promise.allSettled(missingBatchIds.map((batchId) => batchService.getById(batchId)))
      .then((results) => {
        if (cancelled) return
        setBatchExtras(Object.fromEntries(results.map((result, index) => [
          missingBatchIds[index],
          result.status === 'fulfilled' ? mentorFromBatch(result.value?.data ?? result.value ?? {}) : {},
        ])))
        setExtrasLoading(false)
      })
    return () => { cancelled = true }
  }, [missingBatchIds])

  const mentors = useMemo(() => {
    const byId = new Map()
    enrollments.forEach((entry) => {
      const extra = entry.batchId ? batchExtras[entry.batchId] ?? {} : {}
      const mentorId = entry.mentorId ?? extra.mentorId ?? null
      if (mentorId == null) return
      const existing = byId.get(mentorId)
      const assignment = [entry.courseName, entry.batchName].filter(Boolean).join(' · ')
      if (existing) {
        if (assignment && !existing.assignments.includes(assignment)) existing.assignments.push(assignment)
        return
      }
      byId.set(mentorId, {
        mentorId,
        name: titleCase(entry.mentorName || extra.mentorName) || 'Assigned mentor',
        email: entry.mentorEmail || extra.mentorEmail || '',
        phone: entry.mentorPhone || '',
        designation: titleCase(entry.mentorDesignation || 'Mentor'),
        course: entry.courseName || '',
        batch: entry.batchName || '',
        assignments: assignment ? [assignment] : [],
      })
    })
    return [...byId.values()]
  }, [enrollments, batchExtras])

  const loading = enrollmentsLoading || extrasLoading
  const status = loading ? 'loading'
    : enrollmentStatus === 'error' || enrollmentStatus === 'not-student' ? enrollmentStatus
      : enrollmentStatus === 'empty' ? 'no-enrollment'
        : mentors.length ? 'ready' : 'no-mentor'

  return {
    mentors,
    // First mentor, for screens that show a single "your mentor" card.
    mentor: mentors[0] ?? null,
    loading,
    status,
    error: enrollmentStatus === 'error' ? error : null,
    reload,
  }
}

export default useAssignedMentor
