import { hrField, hrList } from './hrApi'

export const displayText = value => {
  if (!['string', 'number'].includes(typeof value)) return ''
  const text = String(value).trim()
  return /^(null|undefined|not supplied|\[object Object\])$/i.test(text) ? '' : text
}

export function isHrEmployee(employee) {
  const key = value => (displayText(value) || displayText(hrField(value, 'name', 'roleName', 'departmentName', 'label'))).replace(/[\s_-]/g, '').toLowerCase()
  const roles = ['role', 'roleName', 'userRole', 'hrRole', 'designation'].map(field => key(hrField(employee, field))).filter(Boolean)
  const hrRoles = ['hr', 'hrexecutive', 'hrmanager', 'hradmin', 'hrrecruiter', 'hrcoordinator', 'humanresources', 'humanresourcesexecutive', 'humanresourcesmanager']
  if (roles.some(role => hrRoles.includes(role))) return true
  // A generic Employee role needs an explicit HR department. Other employees
  // must not be counted as HR simply because they are not mentors.
  return roles.every(role => ['employee', 'staff'].includes(role))
    && ['hr', 'humanresources'].includes(key(hrField(employee, 'departmentName', 'department')))
}

export function getStudentDisplayName(student) {
  const field = key => displayText(hrField(student, key))
  return field('fullName') || [field('firstName'), field('lastName')].filter(Boolean).join(' ')
    || field('studentName') || field('name') || field('email')
    || (field('studentId') || field('id') ? `Student #${field('studentId') || field('id')}` : 'Name unavailable')
}

export function dashboardError(error, module) {
  const status = error?.response?.status
  const retryable = ![401, 403, 404].includes(status)
  const message = status === 401 ? 'Your session has expired. Please sign in again.'
    : status === 403 ? 'You do not have permission to view this section.'
    : status === 404 ? 'This section is currently unavailable.'
    : module === 'syllabus' ? 'Unable to load assigned syllabus.'
    : !error?.response ? 'Unable to connect. Please try again.'
    : 'Something went wrong while loading this section.'
  return { status, retryable, message }
}

export function workforceDepartments(employees, departments) {
  const counts = new Map()
  for (const employee of employees) {
    const value = hrField(employee, 'departmentName', 'department')
    const id = hrField(employee, 'departmentId') ?? hrField(value, 'departmentId', 'id')
    const match = departments.find(row => id != null && String(hrField(row, 'departmentId', 'id')) === String(id))
    const name = displayText(value) || displayText(hrField(value, 'name', 'departmentName'))
      || displayText(hrField(match, 'departmentName', 'name'))
      || (id != null ? `Department #${displayText(id) || 'unknown'}` : 'Unassigned')
    counts.set(name, (counts.get(name) || 0) + 1)
  }
  return [...counts].sort((a, b) => b[1] - a[1])
}

// Follow server pagination so directory totals are not a first-page count.
export async function loadDashboardList(api, definition, signal, preview = false) {
  const names = definition.params.map(param => param.name)
  const pageKey = names.includes('PageNumber') ? 'PageNumber' : 'Page'
  const sizeKey = names.includes('PageSize') ? 'PageSize' : 'Limit'
  const result = []
  for (let page = 1; ; page++) {
    const payload = await api.list({ [pageKey]: page, [sizeKey]: preview ? 4 : 100 }, signal)
    const rows = hrList(payload)
    result.push(...rows)
    const total = hrField(payload, 'totalCount', 'totalRecords', 'total')
    const pages = hrField(payload, 'totalPages')
    if (preview || !names.includes(pageKey) || !rows.length
      || (total != null && result.length >= Number(total))
      || (pages != null && page >= Number(pages))
      || (total == null && pages == null && rows.length < 100)) break
    if (page >= 1000) throw new Error('Dashboard pagination limit exceeded')
  }
  return result
}
