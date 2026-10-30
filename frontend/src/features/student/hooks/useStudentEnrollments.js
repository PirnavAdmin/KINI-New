import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import { courseService } from '@/services/courseService'
import { normalizeStudentEnrollments } from '@features/student/utils/studentEnrollments'

// The signed-in student's enrollments for My Courses and My Batch, from the
// token-scoped GET /api/v1/student/courses (no student id in the request).
// The course/batch saved on the student's own session is added when present.
//
// status: 'loading' | 'ready' | 'empty' | 'error' | 'not-student'. A failed
// request is 'error' (with the axios error), never an empty list.
const sessionRow = (user) => {
  const courseId = user?.courseId ?? user?.student?.courseId
  const batchId = user?.batchId ?? user?.batch?.batchId ?? user?.student?.batchId
  if (courseId == null && batchId == null) return null
  return { ...(user?.student ?? {}), courseId, batchId, courseName: user?.courseName, batchName: user?.batchName, batch: user?.batch }
}

export function useStudentEnrollments() {
  const { user, role, authLoading } = useAuth()
  const [state, setState] = useState({ status: 'loading', enrollments: [], error: null })
  const requestId = useRef(0)
  const identity = `${role ?? ''}:${user?.studentId ?? user?.student?.studentId ?? ''}:${user?.email ?? ''}`
  const userRef = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  const reload = useCallback(async () => {
    const id = ++requestId.current
    if (role !== 'student') {
      setState({ status: 'not-student', enrollments: [], error: null })
      return
    }
    setState((previous) => ({ ...previous, status: 'loading', error: null }))
    try {
      const rows = await courseService.getStudentCourses()
      const own = sessionRow(userRef.current)
      const enrollments = normalizeStudentEnrollments(own ? [...rows, own] : rows)
      // A newer request (or a different signed-in student) wins.
      if (id === requestId.current) setState({ status: enrollments.length ? 'ready' : 'empty', enrollments, error: null })
    } catch (error) {
      if (id === requestId.current) setState({ status: 'error', enrollments: [], error })
    }
  }, [role])

  useEffect(() => {
    if (authLoading) return undefined
    queueMicrotask(reload)
    return () => { requestId.current += 1 }
  }, [authLoading, identity, reload])

  return { ...state, loading: authLoading || state.status === 'loading', reload }
}

export default useStudentEnrollments
