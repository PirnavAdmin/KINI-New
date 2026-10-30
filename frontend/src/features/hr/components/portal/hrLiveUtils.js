import { hrField, hrList } from '../../services/hrApi'

// v23 — helpers shared by HrLiveKit / HrModuleInsights / HrApiModule.
export const initials = (name) => String(name ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?'

const STATUS_TONES = {
  active: 'green', present: 'green', approved: 'green', published: 'green', completed: 'blue',
  pending: 'orange', 'pending approval': 'orange', submitted: 'orange', draft: 'orange', scheduled: 'blue', late: 'orange',
  rejected: 'red', absent: 'red', inactive: 'slate', cancelled: 'red', expired: 'red',
  latecheckout: 'purple', 'late checkout': 'purple', 'on leave': 'blue', onleave: 'blue',
}
export const statusTone = (value) => STATUS_TONES[String(value ?? '').trim().toLowerCase()] ?? STATUS_TONES[String(value ?? '').replace(/[\s_-]/g, '').toLowerCase()] ?? 'slate'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** "02 Oct 2026" for ISO dates; anything else is returned unchanged. */
export function formatDay(value) {
  if (value == null || value === '') return null
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return String(value)
  return `${match[3]} ${MONTHS[Number(match[2]) - 1]} ${match[1]}`
}
export const isoDay = (value) => { const match = String(value ?? '').match(/^\d{4}-\d{2}-\d{2}/); return match ? match[0] : value == null ? null : String(value) }

const LABEL_KEYS = ['label', 'name', 'departmentName', 'department', 'role', 'roleName', 'type', 'leaveType', 'status', 'category', 'month', 'period', 'date']
const VALUE_KEYS = ['count', 'value', 'total', 'employees', 'employeeCount', 'totalEmployees', 'averageScore', 'score', 'performanceScore', 'percentage']
/** Turns `[{name, count}]` or `{ hr: 2, mentor: 3 }` into `[{ label, value }]`. */
export function toPairs(raw) {
  const rows = hrList(raw)
  if (rows.length) {
    return rows.map((row) => ({ label: hrField(row, ...LABEL_KEYS), value: Number(hrField(row, ...VALUE_KEYS)) }))
      .filter((pair) => pair.label != null && Number.isFinite(pair.value))
  }
  let value = raw
  if (value && typeof value === 'object' && !Array.isArray(value) && value.data && typeof value.data === 'object') value = value.data
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.entries(value).filter(([key, item]) => typeof item === 'number' && !/id$/i.test(key)).map(([label, item]) => ({ label, value: item }))
}

export const CHART_COLORS = ['#2f6fe4', '#a78bfa', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#64748b']
