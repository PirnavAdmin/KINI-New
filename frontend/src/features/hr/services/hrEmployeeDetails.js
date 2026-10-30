import { hrField, hrList, hrModuleApi, hrRequest, unwrapHrData } from './hrApi'
import { loadEmployeeLeaveRecords } from './hrEmployeeLeaveData'
import { completeCollection } from './hrEmployeeRecords'
import { employeeService } from '@shared/services/employeeService'

// The HR controller uses employeeId, not userId or a display employeeCode.
export const employeeIdOf = row => ['employeeId', 'id'].map(key => hrField(row, key)).find(value => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '')
// Status routes require the numeric directory key; employeeId can be a display code.
export const employeeStatusIdOf = row => ['employeeId', 'id'].map(key => hrField(row, key)).find(value =>
  (typeof value === 'number' || typeof value === 'string') && /^\d+$/.test(String(value).trim()) && Number(value) > 0 && Number(value) <= 2147483647
)
export const employeeName = row => hrField(row, 'fullName', 'employeeName', 'name') || [hrField(row, 'firstName'), hrField(row, 'lastName')].filter(Boolean).join(' ') || 'Employee Details'
export const employeeDetailsPath = id => '/employee/hr-employees/' + encodeURIComponent(id)
export async function loadHrEmployeeDetails(employeeId, signal) {
  try {
    const employee = await hrModuleApi('employees').get(employeeId, signal)
    if (!employee || Array.isArray(employee) || employeeIdOf(employee) == null || String(employeeIdOf(employee)) !== String(employeeId)) throw new Error('The service returned an unexpected employee. Refresh the employee list and try again.')
    return { employee }
  } catch (error) {
    if (signal?.aborted || error.response?.status !== 404) throw error
    // A deployed controller may omit the documented detail endpoint. Match
    // only a directory primary key, never a display code or user account ID.
    const directory = await completeCollection('employees', signal)
    const matches = directory.filter(row => String(employeeIdOf(row)) === String(employeeId))
    if (matches.length > 1) throw new Error('The directory returned an ambiguous employee identifier.', { cause: error })
    return matches.length ? { employee: matches[0], warning: 'Detailed profile is unavailable. Showing the employee directory record.' } : { notFound: true }
  }
}
export async function loadEmployeeTab(tab, employeeId, signal, employee) {
  if (tab === 'Leaves') return (await loadEmployeeLeaveRecords(employeeId, { employee, signal })).rows
  const response = tab === 'Batches'
    ? await employeeService.getEmployeeBatches(employeeId)
    : await hrRequest('GET', '/api/hr/' + tab.toLowerCase().replace('leaves', 'leave') + '/employee/{employeeId}', { id: employeeId, signal })
  const value = unwrapHrData(response)
  const rows = Array.isArray(value?.performance) ? value.performance : hrList(value)
  const knownArray = Array.isArray(value) || ['data','items','records','results','attendance','leaves','leaveRequests','performance','reviews','batches'].some(key => Array.isArray(value?.[key]))
  if (!knownArray) throw new Error('The service returned no readable employee records.')
  if (Number(hrField(value, 'totalCount', 'totalRecords')) > rows.length || Number(hrField(value, 'totalPages')) > 1) throw new Error('The service returned an incomplete history. Please retry.')
  if (rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('The service returned invalid employee records.')
  // A scoped endpoint may omit employeeId; explicit other-employee IDs must
  // never enter this employee's table or calculated summary.
  return rows.filter(row => hrField(row, 'employeeId') == null || String(hrField(row, 'employeeId')) === String(employeeId))
}
