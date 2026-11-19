// Account status is distinct from enrollment/approval status.
export function studentStatusOf(student, fallback = '') {
  const value = student?.status ?? student?.Status ?? student?.isActive ?? student?.active
  const key = String(value ?? '').trim().toLowerCase().replace(/[\s_-]/g, '')
  if (['true', '1', 'active', 'enabled'].includes(key)) return 'Active'
  if (['false', '0', 'inactive', 'disabled', 'deactivated'].includes(key)) return 'Inactive'
  if (['pending', 'pendingapproval', 'awaitingapproval'].includes(key)) return 'Pending'
  if (['rejected', 'declined'].includes(key)) return 'Rejected'
  if (key === 'completed') return 'Completed'
  return String(value ?? fallback).trim() || fallback
}
