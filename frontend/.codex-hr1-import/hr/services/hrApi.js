import apiClient from '@shared/services/apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { HR_API_CONTRACT } from './hrApiContract'

export function unwrapHrData(response) {
  let value = response
  if (value && 'config' in value && 'status' in value) value = value.data
  for (let i = 0; i < 5 && value && !Array.isArray(value) && Object.hasOwn(value, 'data'); i++) {
    if (Array.isArray(value.data) && ['totalCount', 'totalRecords', 'totalPages'].some(key => key in value)) {
      const { data, ...pagination } = value
      return { ...pagination, items: data }
    }
    value = value.data
  }
  return value ?? null
}

export function hrList(value) {
  value = unwrapHrData(value)
  if (Array.isArray(value)) return value
  for (const key of ['items', 'records', 'results', 'content', 'employees', 'students', 'attendance', 'leaves', 'leaveRequests', 'events', 'resources', 'announcements', 'reviews', 'departments', 'roles', 'types', 'batches', 'assignedBatches', 'schedules', 'classSchedule', 'classes', 'messages', 'assessments', 'certificates']) {
    if (Array.isArray(value?.[key])) return value[key]
  }
  return []
}

export function hrError(error, module = 'this module') {
  const status = error?.response?.status
  if (status === 401) return 'Your session has expired. Please login again.'
  if (status === 403) return `You do not have permission to access ${module === 'attendance' ? 'attendance records' : module}.`
  if (status === 404) return 'Requested resource was not found.'
  if (status === 400 || status === 422) return 'Please check the entered values and try again.'
  if (status >= 500) return 'Unable to load data. Please try again.'
  return status ? 'The request could not be completed. Please try again.' : 'Unable to connect to the server.'
}

export const hrField = (row, ...keys) => {
  for (const key of keys) {
    const actual = Object.keys(row || {}).find(name => name.toLowerCase() === key.toLowerCase())
    if (row?.[actual] !== undefined && row?.[actual] !== null) return row[actual]
  }
  return null
}

export const hrText = (value) => value == null ? 'Not supplied' : typeof value === 'object'
  ? value.name ?? value.title ?? value.label ?? 'Not supplied' : String(value)

export function hrRequest(method, path, { id, params = {}, data, signal, binary = false } = {}) {
  const definition = HR_API_CONTRACT[`${method} ${path}`]
  if (!definition) return Promise.reject(new Error('This operation is not documented by the backend.'))
  if (path.includes('{') && (id === undefined || id === null || id === '')) return Promise.reject(new Error('A record identifier is required.'))
  const url = path.replace(/\{[^}]+\}/g, () => encodeURIComponent(id))
  const query = Object.fromEntries(definition.params.filter(({ name }) => params[name] !== undefined && params[name] !== '').map(({ name }) => [name, params[name]]))
  return apiClient.request({ method, url, params: query, data, signal, ...(binary ? { responseType: 'blob' } : {}) })
    .then(response => {
      if (response.data?.success === false) throw Object.assign(new Error('Request failed'), { response })
      return binary ? response : unwrapHrData(response)
    }).catch(error => {
      if (import.meta.env.DEV && error.code !== 'ERR_CANCELED') console.debug('[HR API]', { method, endpoint: path, status: error.response?.status ?? 'network', params: Object.keys(query) })
      throw error
    })
}

const base = module => API_ENDPOINTS.hr[module]
const ids = { employees: 'employeeId', students: 'studentId', attendance: 'attendanceId', leave: 'leaveId', performance: 'performanceId', announcements: 'announcementId', calendar: 'eventId', resources: 'resourceId' }
export function hrModuleApi(module) {
  const path = base(module)
  const detail = `${path}/{${ids[module]}}`
  return {
    path, detail, idKey: ids[module],
    list: (params, signal) => hrRequest('GET', path, { params, signal }),
    summary: signal => hrRequest('GET', `${path}/${module === 'calendar' ? 'stats' : 'summary'}`, { signal }),
    get: (id, signal) => hrRequest('GET', detail, { id, signal }),
    create: data => hrRequest('POST', `${path}${module === 'attendance' ? '/mark' : ''}`, { data }),
    update: (id, data) => hrRequest('PUT', detail, { id, data }),
    remove: id => hrRequest('DELETE', detail, { id }),
    status: (id, status) => hrRequest('PATCH', `${detail}/status`, { id, data: { status } }),
    export: params => hrRequest('GET', `${path}/export`, { params, binary: true }),
  }
}

export function downloadHrFile(response, fallback = 'hr-export.csv') {
  const disposition = response.headers?.['content-disposition'] || ''
  const match = disposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)
  let filename = fallback
  try { if (match) filename = decodeURIComponent(match[1]).split(/[\\/]/).at(-1) } catch { /* use the safe fallback */ }
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
