import { hrRequest, hrList, hrField, unwrapHrData, hrError } from './hrApi'
import { API_ENDPOINTS } from '@/api/endpoints'

export const HR_WIDGETS = {
  Employees: { key: 'employees', summary: '/api/hr/employees/summary', totals: ['totalEmployees', 'employeeCount', 'total'] },
  Students: { key: 'students', summary: '/api/students/summary', totals: ['totalStudents', 'studentCount', 'total'] },
  Attendance: { key: 'attendance', summary: '/api/hr/attendance/summary', totals: ['totalRecords', 'totalAttendance', 'total'] },
  'Leave Management': { key: 'leave', summary: '/api/hr/leave/summary', totals: ['pendingLeave', 'pendingLeaves', 'pendingRequests'] },
  Announcements: { key: 'announcements', summary: '/api/hr/announcements/summary', totals: ['totalAnnouncements', 'total'] },
  Performance: { key: 'performance', summary: '/api/hr/performance/summary', totals: ['averageScore', 'averagePerformance', 'performanceScore'] },
  Resources: { key: 'resources', summary: '/api/hr/resources/summary', totals: ['totalResources', 'total'] },
  Calendar: { key: 'calendar', summary: '/api/hr/calendar/events/stats', totals: ['totalEvents', 'total'] },
  'Assigned Batches': { key: 'assignedBatches', totals: ['totalAssignedBatches', 'assignedBatchCount', 'totalBatches'] },
  'Class Schedule': { key: 'classSchedule', totals: ['totalClasses', 'todayClasses', 'classCount'] },
  Messages: { key: 'messages', totals: ['totalMessages', 'unreadMessages'] },
  Assessments: { key: 'assessments', totals: ['totalAssessments'] },
  Certificates: { key: 'certificates', totals: ['totalCertificates'] },
}

export function dashboardWidget(payload, label) {
  const definition = HR_WIDGETS[label]
  if (!definition) return null
  payload = unwrapHrData(payload)
  const containers = [payload, payload?.summary, payload?.stats, payload?.overview, payload?.widgets].filter(Boolean)
  for (const container of containers) {
    const nested = hrField(container, definition.key, `${definition.key}Summary`, label === 'Leave Management' ? 'leaveSummary' : definition.key)
    if (nested != null) return typeof nested === 'number' ? { [definition.totals[0]]: nested } : nested
    const total = hrField(container, ...definition.totals.filter(key => key !== 'total'))
    if (total != null) return { ...container, [definition.totals[0]]: total }
  }
  return null
}

export function widgetMetric(raw, label) {
  const summary = raw?.summary ?? raw
  const value = hrField(summary, ...(HR_WIDGETS[label]?.totals || []))
  return typeof value === 'number' || typeof value === 'string' ? value : null
}

export async function loadHrDashboard({ labels, signal, onResult, onPrimary, fallback = {} }) {
  let dashboard = null
  try {
    dashboard = await hrRequest('GET', API_ENDPOINTS.hr.dashboard, { signal })
    if (signal.aborted) return
    onPrimary?.({ data: dashboard, error: null })
  } catch (error) {
    if (signal.aborted) return
    onPrimary?.({ data: null, error: hrError(error) })
  }
  await Promise.allSettled(labels.map(async label => {
    if (signal.aborted) return
    const definition = HR_WIDGETS[label]
    try {
      let raw = dashboardWidget(dashboard, label)
      // Leave overview has its own authoritative approval summary.
      if ((raw == null || label === 'Leave Management') && definition?.summary) raw = await hrRequest('GET', definition.summary, { signal })
      if (raw == null && !definition?.summary && fallback[label]) raw = await fallback[label]()
      if (signal.aborted) return
      if (raw == null) {
        onResult(label, { state: 'unavailable', raw: null, rows: [] })
        return
      }
      onResult(label, { state: 'ready', raw, rows: hrList(raw), updated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    } catch (error) {
      if (!signal.aborted) onResult(label, { state: 'error', rows: [], error: hrError(error, definition?.key ?? label.toLowerCase()) })
    }
  }))
}
