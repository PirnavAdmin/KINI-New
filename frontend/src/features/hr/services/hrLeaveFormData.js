import { differenceInCalendarDays } from 'date-fns'
import { calendarDate } from './hrCalendarData'
import { HR_API_CONTRACT } from './hrApiContract'

export const leaveRequestSchema = HR_API_CONTRACT['POST /api/hr/leave'].schema
export function leaveDayCount(fromDate, toDate) {
  const start = calendarDate(fromDate)
  const end = calendarDate(toDate)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fromDate) || !/^\d{4}-\d{2}-\d{2}$/.test(toDate) || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0
  // Calendar-day preview only. The documented API owns any policy adjustments.
  return differenceInCalendarDays(end, start) + 1
}

export function initialLeaveDraft(values = {}) {
  const fromDate = values.fromDate ?? ''
  const toDate = values.toDate ?? fromDate
  return { employeeId: String(values.employeeId ?? ''), leaveType: values.leaveType ?? '', fromDate, toDate, reason: values.reason ?? '', duration: fromDate && toDate !== fromDate ? 'multiple' : 'single' }
}

export function leaveRequestPayload(draft) {
  return { employeeId: String(draft.employeeId), leaveType: draft.leaveType, fromDate: draft.fromDate, toDate: draft.duration === 'single' ? draft.fromDate : draft.toDate, reason: draft.reason.trim() }
}

export function validateLeaveDraft(draft, employees, types) {
  const errors = {}
  if (!employees.some(item => String(item.value) === draft.employeeId)) errors.employeeId = 'Please select an employee.'
  if (!types.some(item => String(item.value) === draft.leaveType)) errors.leaveType = 'Please select a leave type.'
  if (!['single', 'multiple'].includes(draft.duration)) errors.duration = 'Please select a leave duration.'
  if (!draft.fromDate || Number.isNaN(calendarDate(draft.fromDate).getTime())) errors.fromDate = 'Please select a start date.'
  if (!draft.toDate || Number.isNaN(calendarDate(draft.toDate).getTime())) errors.toDate = 'Please select an end date.'
  if (!errors.fromDate && !errors.toDate && !leaveDayCount(draft.fromDate, draft.toDate)) errors.toDate = 'To Date cannot be earlier than From Date.'
  if (!draft.reason.trim()) errors.reason = 'Please enter a reason.'
  const limit = leaveRequestSchema.properties.reason.maxLength
  if (limit != null && draft.reason.length > limit) errors.reason = `Reason must be ${limit} characters or fewer.`
  return errors
}
