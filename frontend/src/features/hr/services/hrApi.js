import getApiErrorMessage from '@/utils/getApiErrorMessage'
import apiClient from '@shared/services/apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { HR_API_CONTRACT } from './hrApiContract'
import { normalizeAnnouncementResponse } from './hrAnnouncementData'
import { EMPLOYEE_STATUS_OPTIONS, normalizeEmployeeStatus } from '../constants/employeeStatuses'

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
  if (module === 'announcements') {
    const status = error?.response?.status
    if (status === 401) return 'Your session has expired. Please login again.'
    if (status === 403) return 'You do not have permission to access announcements.'
    if (status === 404) return 'This announcement was not found. It may have been deleted.'
    if (status === 409 && !error.response.data?.errors && !error.response.data?.message && !error.response.data?.error && !error.response.data?.title && typeof error.response.data !== 'string') return 'This announcement could not be changed because of a conflict. Refresh and try again.'
    return getApiErrorMessage(error, status === 409 ? 'This announcement could not be changed because of a conflict. Refresh and try again.' : error?.message || 'The announcement request could not be completed.')
  }
  if (module === 'calendar') return getApiErrorMessage(error, 'The calendar request could not be completed.')
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
  const passwordChange = method === 'PUT' && path === '/api/hr/settings/security/password'
  return apiClient.request({ method, url, params: query, data, signal, ...(passwordChange ? { skipAuthRedirect: true } : {}), ...(binary ? { responseType: 'blob' } : {}) })
    .then(async response => {
      // A wrong current password is a form error, including when the server
      // wraps a failed result inside an HTTP 200 response.
      if (passwordChange) {
        let result = response.data
        for (let depth = 0; depth < 5 && result && typeof result === 'object'; depth++) {
          if (result.success === false || result.succeeded === false || result.isSuccess === false || (result.errors && Object.keys(result.errors).length > 0)) {
            throw Object.assign(new Error('Password change was rejected.'), { response: { ...response, data: { message: 'Password change was rejected. Check your current password and try again.', ...result } } })
          }
          if (!Object.hasOwn(result, 'data')) break
          if (result.data === false) throw Object.assign(new Error('Password change was rejected.'), { response: { ...response, data: { message: 'Password change was rejected. Check your current password and try again.' } } })
          result = result.data
        }
        if (response.data === false) throw new Error('Password change was rejected. Check your current password and try again.')
      }
      if (response.data?.success === false) throw Object.assign(new Error('Request failed'), { response })
      if (path.startsWith('/api/hr/announcements')) {
        if (binary) {
          const type = response.headers?.['content-type'] || response.data?.type || ''
          if (/json|text\/html/i.test(type) || !(response.data instanceof Blob) || !response.data.size) {
            let body
            try { body = JSON.parse(await response.data.text()) } catch { /* unsupported file response */ }
            throw Object.assign(new Error('The server did not return an announcement export file.'), { response: { ...response, data: body } })
          }
          return response
        }
        return normalizeAnnouncementResponse(method, path, response.data)
      }
      return binary ? response : unwrapHrData(response)
    }).catch(async error => {
      if (path.startsWith('/api/hr/announcements') && binary && error.response?.data instanceof Blob) {
        try { error.response.data = JSON.parse(await error.response.data.text()) } catch { /* preserve HTTP status for non-JSON errors */ }
      }
      if (import.meta.env.DEV && error.code !== 'ERR_CANCELED') console.debug('[HR API]', { method, endpoint: path, status: error.response?.status ?? 'network', params: Object.keys(query) })
      throw error
    })
}

const base = module => API_ENDPOINTS.hr[module]
const ids = { employees: 'employeeId', students: 'studentId', attendance: 'attendanceId', leave: 'leaveId', performance: 'performanceId', announcements: 'announcementId', calendar: 'eventId', resources: 'resourceId' }
async function changeEmployeeStatus(id, status) {
  if (typeof id === 'string') id = id.trim()
  status = normalizeEmployeeStatus(status)
  if (!EMPLOYEE_STATUS_OPTIONS.some(option => option.value === status)) throw new Error('Select Active, On Leave or Resigned.')
  if (!/^\d+$/.test(String(id ?? '')) || Number(id) < 1 || Number(id) > 2147483647) {
    throw new Error('A valid numeric employee ID is required to change status. Refresh the employee list and try again.')
  }
  return hrRequest('PATCH', '/api/hr/employees/{employeeId}/status', { id, data: { status } })
}
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
    status: (id, status) => module === 'employees' ? changeEmployeeStatus(id, status) : hrRequest('PATCH', `${detail}/status`, { id, data: { status } }),
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
