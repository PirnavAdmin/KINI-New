import apiClient from './apiClient'
import { extractApiData, logApiError, logApiRequest, logApiSuccess, withPagedResponse } from './apiModuleHelpers'
import { API_ENDPOINTS } from '@/api/endpoints'
import { normalizeEmploymentType } from '@shared/utils/employeePresentation'

const EMPLOYEE_ENDPOINT = API_ENDPOINTS.organization.employees
const normalize = (value) => String(value ?? '').trim().toLowerCase()
const isMentorRole = (role) => ['mentor', 'tutor'].includes(normalize(role))

export function matchesEmployeeSearch(employee, search) {
  const term = normalize(search).replace(/\s+/g, ' ')
  if (!term) return true
  const fields = [employee.fullName, employee.name, [employee.firstName, employee.lastName].filter(Boolean).join(' '), employee.email, employee.phone, employee.phoneNumber, employee.mobile, employee.designation, employee.role, employee.roleName, employee.employeeCode, employee.employeeId]
  if (fields.some(value => normalize(value).replace(/\s+/g, ' ').includes(term))) return true
  const digits = term.replace(/\D/g, '')
  return /^[+\d\s()-]+$/.test(term) && digits.length > 0 && [employee.phone, employee.phoneNumber, employee.mobile].some(value => String(value ?? '').replace(/\D/g, '').includes(digits))
}

const buildParams = (params = {}) => ({
  Search: params.Search ?? params.search ?? params.searchText ?? undefined,
  Status: params.Status ?? params.status ?? undefined,
  SortBy: params.SortBy ?? params.sortBy ?? 'FirstName',
  IsDescending: params.IsDescending ?? params.isDescending ?? false,
  PageNumber: params.PageNumber ?? params.pageNumber ?? 1,
  PageSize: params.PageSize ?? params.pageSize ?? 10,
})

const sendRequest = async (method, endpoint, executor, payload) => {
  logApiRequest(method, endpoint, payload)
  try {
    const response = await executor()
    if (response?.data?.success === false || response?.data?.data?.success === false) {
      throw Object.assign(new Error(response.data?.data?.message || response.data?.message || 'Employee request failed.'), { response })
    }
    logApiSuccess(response)
    return extractApiData(response)
  } catch (error) {
    logApiError(error)
    throw error
  }
}

const toEmployeePayload = (payload = {}) => {
  const employeeType = normalizeEmploymentType(payload.employeeType ?? payload.employmentType)
  return {
    ...payload,
    firstName: String(payload.firstName || '').trim(),
    lastName: String(payload.lastName || '').trim(),
    email: String(payload.email || '').trim(),
    phone: String(payload.phone || '').trim(),
    role: String(payload.role || payload.designation || '').trim(),
    status: String(payload.status || 'Active').trim(),
    ...(employeeType ? { employeeType } : {}),
  }
}

const employeeEndpoint = (id, suffix = '') =>
  `${API_ENDPOINTS.organization.employee(id)}${suffix}`

// Swagger UpdateEmployeeDto: employee edits do not assign mentor courses.
export const toEmployeeUpdatePayload = (payload = {}) => {
  const source = { ...payload, employeeType: payload.employeeType ?? payload.employmentType };
  const fields = ['firstName', 'lastName', 'email', 'phone', 'role', 'status', 'employeeType', 'departmentId', 'designation', 'joiningDate'];
  return Object.fromEntries(fields.filter((key) => source[key] !== undefined).map((key) => [
    key,
    ['departmentId', 'joiningDate'].includes(key) && source[key] === '' ? null : source[key],
  ]));
};

export const employeeService = {
  getRoles: async () => {
    const endpoint = API_ENDPOINTS.organization.employeeRoles
    return sendRequest('GET', endpoint, () => apiClient.get(endpoint), {})
  },
  getEmployees: async (params = {}) => {
    const query = buildParams(params)
    if (String(query.Search ?? '').trim()) {
      // Server search does not consistently cover the fields displayed in
      // the list. Search the complete organization roster before paginating.
      const fetchPage = async page => {
        const request = { ...query, Search: undefined, PageNumber: page, PageSize: 1000 }
        return withPagedResponse(await sendRequest('GET', EMPLOYEE_ENDPOINT, () => apiClient.get(EMPLOYEE_ENDPOINT, { params: request }), request))
      }
      const first = await fetchPage(1)
      const rows = [...first.data]
      const pages = Number(first.totalRecords) <= rows.length ? 1 : Math.max(Number(first.totalPages) || 1, Math.ceil((Number(first.totalRecords) || 0) / (Number(first.pageSize) || 1000)))
      for (let page = 2; page <= pages; page++) rows.push(...(await fetchPage(page)).data)
      const matches = rows.filter(employee => matchesEmployeeSearch(employee, query.Search))
      const size = Math.max(1, Number(query.PageSize) || 10)
      const totalPages = Math.max(1, Math.ceil(matches.length / size))
      const page = Math.min(Math.max(1, Number(query.PageNumber) || 1), totalPages)
      return { ...first, data: matches.slice((page - 1) * size, page * size), totalRecords: matches.length, totalCount: matches.length, totalPages, pageNumber: page, pageSize: size }
    }
    const response = await sendRequest('GET', EMPLOYEE_ENDPOINT, () => apiClient.get(EMPLOYEE_ENDPOINT, { params: query }), query)
    return withPagedResponse(response)
  },
  getEmployee: async (id) => sendRequest('GET', employeeEndpoint(id), () => apiClient.get(employeeEndpoint(id)), { id }),
  getEmployeeBatches: async (id) => {
    const endpoint = API_ENDPOINTS.organization.mentorBatches(id)
    return sendRequest('GET', endpoint, () => apiClient.get(endpoint), { id })
  },
  createEmployee: async (payload) => sendRequest('POST', EMPLOYEE_ENDPOINT, () => apiClient.post(EMPLOYEE_ENDPOINT, toEmployeePayload(payload)), payload),
  updateEmployee: async (id, payload) => sendRequest('PUT', employeeEndpoint(id), () => apiClient.put(employeeEndpoint(id), toEmployeeUpdatePayload(payload)), { id, ...payload }),
  getAttendance: async (id, params = {}) => {
    const endpoint = API_ENDPOINTS.employeeAttendance.base
    const query = { employeeId: id, ...params }
    return sendRequest('GET', endpoint, () => apiClient.get(endpoint, { params: query }), query)
  },
  getWorkProgress: async (id, params = {}) => {
    const endpoint = employeeEndpoint(id, '/work-progress')
    return sendRequest('GET', endpoint, () => apiClient.get(endpoint, { params }), { id, ...params })
  },
  getPayslips: async (id, params = {}) => {
    const endpoint = employeeEndpoint(id, '/payslips')
    return sendRequest('GET', endpoint, () => apiClient.get(endpoint, { params }), { id, ...params })
  },
  deleteEmployee: async (id) => sendRequest('DELETE', employeeEndpoint(id), () => apiClient.delete(employeeEndpoint(id)), { id }),
  resolveMentorByEmail: async (email, authenticatedUser = {}) => {
    const normalizedEmail = normalize(email)
    if (!normalizedEmail) return null

    const firstPage = await employeeService.getEmployees({ search: normalizedEmail, pageNumber: 1, pageSize: 100 })
    const allEmployees = [...(firstPage?.data || [])]
    const totalPages = Math.max(1, Number(firstPage?.totalPages) || 1)

    for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
      const page = await employeeService.getEmployees({ search: normalizedEmail, pageNumber, pageSize: 100 })
      allEmployees.push(...(page?.data || []))
    }

    const matches = allEmployees.filter((employee) => normalize(employee.email ?? employee.Email) === normalizedEmail)
    const mentorMatches = matches.filter((employee) => isMentorRole(employee.role ?? employee.Role))
    const candidates = mentorMatches.length ? mentorMatches : matches
    const stableIds = [
      authenticatedUser?.employeeId,
      authenticatedUser?.userId,
      authenticatedUser?.id,
      authenticatedUser?.subjectId,
      authenticatedUser?.organizationUserId,
    ].filter((id) => id !== null && id !== undefined && String(id).trim())
    const stableMatch = candidates.find((employee) => stableIds.some((id) =>
      [employee.employeeId, employee.userId, employee.subjectId, employee.organizationUserId]
        .some((value) => String(value ?? '') === String(id)),
    ))

    if (stableMatch) return { employee: stableMatch, employees: allEmployees }
    if (candidates.length === 1) return { employee: candidates[0], employees: allEmployees }
    if (candidates.length > 1) console.warn('Multiple employee records found for authenticated email', candidates)
    return { employee: null, employees: allEmployees }
  },
}

export default employeeService
