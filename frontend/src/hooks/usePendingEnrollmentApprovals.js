import { useEffect, useMemo, useState } from 'react'
import {
  ENROLLMENT_APPROVAL_EVENT,
  getPendingEnrollmentApprovals,
} from '@shared/services/enrollmentApprovalStore'
import { demoPaymentApi, isDemoPaymentMode } from '@shared/services/demoPaymentApi'
import { isUpiPaymentMode, upiPaymentApi } from '@shared/services/upiPaymentService'
import { ROUTES } from '@shared/constants/routeConstants'

const DEMO_REFRESH_MS = 15000
const UPI_REFRESH_MS = 30000

// Guest UPI enrollments whose payment the organization verified
// (GET /api/v1/organization/enrollments/pending-approval). They have no
// student record until approval, so they are reviewed on the UPI approval
// page; the Students page and dashboard only list and link them.
const toUpiApproval = (row) => ({
  id: `upi-${row.id}`,
  kind: 'enrollment',
  source: 'upi',
  enrollmentId: row.id,
  name: row.studentName,
  studentName: row.studentName,
  course: row.courseName || 'Course',
  courseName: row.courseName || 'Course',
  courseId: row.courseId,
  organizationId: row.raw?.organizationId ?? row.raw?.OrganizationId,
  email: row.email,
  student: { email: row.email, phone: row.mobile },
  payment: { paymentStatus: row.paymentStatus || 'Verified' },
  createdAt: row.verifiedAt || row.createdAt,
  path: ROUTES.ORG_ADMIN.APPROVALS,
})

// Demo Payment Mode requests come from the dev server's demo backend, so the
// organization sees enrollments paid in any browser, not just this one.
const toDemoApproval = (request) => ({
  ...request,
  kind: 'demo-enrollment',
  name: `${request.student.firstName} ${request.student.lastName}`.trim(),
  studentName: `${request.student.firstName} ${request.student.lastName}`.trim(),
  course: request.course.title,
  courseName: request.course.title,
  // The real course id (course itself is flattened to its title for the dashboard shape).
  courseId: request.course.id,
  batchName: request.batch?.name ?? null,
})

// Pending checkout enrollment requests awaiting organization review. They live
// in the shared enrollment approval store (not the students API), so the
// Students page reads them here to match the dashboard's Pending Approvals.
export default function usePendingEnrollmentApprovals() {
  const [approvals, setApprovals] = useState(getPendingEnrollmentApprovals)
  const [demoApprovals, setDemoApprovals] = useState([])

  useEffect(() => {
    const sync = () => setApprovals(getPendingEnrollmentApprovals())
    window.addEventListener(ENROLLMENT_APPROVAL_EVENT, sync)
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => {
      window.removeEventListener(ENROLLMENT_APPROVAL_EVENT, sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('focus', sync)
    }
  }, [])

  useEffect(() => {
    if (!isDemoPaymentMode) return undefined
    let active = true
    const load = () => demoPaymentApi.listEnrollmentRequests('PendingApproval')
      .then((rows) => { if (active) setDemoApprovals(rows.map(toDemoApproval)) })
      .catch((error) => {
        console.warn('Demo enrollment requests unavailable:', error.message)
        if (active) setDemoApprovals([])
      })
    load()
    const timer = window.setInterval(load, DEMO_REFRESH_MS)
    window.addEventListener(ENROLLMENT_APPROVAL_EVENT, load)
    window.addEventListener('focus', load)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener(ENROLLMENT_APPROVAL_EVENT, load)
      window.removeEventListener('focus', load)
    }
  }, [])

  const [upiApprovals, setUpiApprovals] = useState([])

  useEffect(() => {
    if (!isUpiPaymentMode) return undefined
    let active = true
    const load = () => upiPaymentApi.orgPendingApprovals()
      .then((rows) => { if (active) setUpiApprovals(rows.map(toUpiApproval)) })
      .catch((error) => {
        // No permission or not signed in as organization staff: show none.
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.warn('UPI enrollment approvals unavailable:', error?.message)
        }
        if (active) setUpiApprovals([])
      })
    load()
    const timer = window.setInterval(load, UPI_REFRESH_MS)
    window.addEventListener(ENROLLMENT_APPROVAL_EVENT, load)
    window.addEventListener('focus', load)
    return () => {
      active = false
      window.clearInterval(timer)
      window.removeEventListener(ENROLLMENT_APPROVAL_EVENT, load)
      window.removeEventListener('focus', load)
    }
  }, [])

  return useMemo(() => [...approvals, ...demoApprovals, ...upiApprovals], [approvals, demoApprovals, upiApprovals])
}
