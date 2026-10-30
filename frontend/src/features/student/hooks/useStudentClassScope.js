import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import { courseService } from '@/services/courseService'
import { attendanceService } from '@shared/services/attendanceService'
import { getUserProfile, resolveUserId } from '@/services/profileService'
import { buildStudentClassScope, isClassInStudentScope } from '@features/student/utils/studentClassAccess'
import { normalizeStudentEnrollments } from '@features/student/utils/studentEnrollments'

// The signed-in student's authorized course and batch ids, shared by every
// Student Portal class screen (Class Schedule, My Classes, Recordings,
// Dashboard, Live Classroom) so they all show the same classes.
//
// Sources are the student's own session only: GET /api/v1/student/courses
// (scoped by the auth token), their auth profile, and the login user. Nothing
// is read from leftover browser storage, which can belong to a previous
// account. The scope is rebuilt whenever the signed-in identity changes.
//
// ready: the scope has settled. error: enrollments couldn't be loaded, so no
// class is shown (fail closed). allows(liveClass): whether it may be shown.
const EMPTY = { courseIds: new Set(), batchIds: new Set(), batchesByCourse: new Map(), classRefs: new Map() }

export function useStudentClassScope() {
  const { user } = useAuth()
  const resolvedUserId = useMemo(() => resolveUserId(user), [user])
  const identity = `${user?.studentId ?? user?.student?.studentId ?? ''}:${resolvedUserId ?? ''}:${user?.email ?? ''}`
  const [state, setState] = useState({ identity: null, ready: false, error: '', scope: EMPTY })
  // Auth re-reads the stored user after mount, producing a new object with the
  // same content. Reloading only when the identity changes avoids fetching the
  // enrollments (and every class list) twice on each page load.
  const userRef = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  useEffect(() => {
    let active = true
    const load = async () => {
      const user = userRef.current
      const studentId = user?.studentId ?? user?.StudentId ?? user?.student?.studentId ?? null
      const [coursesResult, profileResult, attendanceResult] = await Promise.allSettled([
        courseService.getStudentCourses(),
        resolvedUserId ? getUserProfile(resolvedUserId) : Promise.resolve(null),
        // Supplies course/batch ids for list rows that omit them (see studentClassAccess).
        studentId != null ? attendanceService.byStudent(studentId) : Promise.resolve([]),
      ])
      if (!active) return
      if (coursesResult.status === 'rejected') {
        setState({ identity, ready: true, error: 'We could not verify your course enrollments, so classes are hidden. Please refresh or sign in again.', scope: EMPTY })
        return
      }
      const profile = profileResult.status === 'fulfilled' ? profileResult.value?.raw ?? null : null
      const scope = buildStudentClassScope({
        // Same course × batch entries My Courses and My Batch render.
        enrollments: normalizeStudentEnrollments(coursesResult.value),
        // The login user and the auth profile describe this same student.
        profile: { ...(user ?? {}), ...(profile ?? {}) },
        attendance: attendanceResult.status === 'fulfilled' && Array.isArray(attendanceResult.value) ? attendanceResult.value : [],
      })
      setState({ identity, ready: true, error: '', scope })
    }
    load()
    return () => { active = false }
  }, [identity, resolvedUserId])

  // A different student signed in: never show the previous account's scope.
  const current = state.identity === identity ? state : { ready: false, error: '', scope: EMPTY }
  return useMemo(() => ({
    ready: current.ready,
    error: current.error,
    courseIds: current.scope.courseIds,
    batchIds: current.scope.batchIds,
    batchesByCourse: current.scope.batchesByCourse,
    classRefs: current.scope.classRefs,
    // Loaded fine, but no approved enrollment was found: nothing can be shown.
    noEnrollments: current.ready && !current.error && current.scope.courseIds.size === 0 && current.scope.batchIds.size === 0,
    // First ids, kept for callers that pass them as list hints.
    courseId: [...current.scope.courseIds][0] ?? null,
    batchId: [...current.scope.batchIds][0] ?? null,
    allows: (liveClass) => current.ready && !current.error && isClassInStudentScope(liveClass, current.scope),
  }), [current.ready, current.error, current.scope])
}

export default useStudentClassScope
