import { hrError, hrField, hrList, hrRequest, unwrapHrData } from './hrApi'
import { completeCollection, resolveHrEmployee as resolveLeaveEmployee } from './hrEmployeeRecords'
export { resolveHrEmployee as resolveLeaveEmployee } from './hrEmployeeRecords'

export const employeeLeavePath = id => `/employee/hr-leave/employee/${encodeURIComponent(id)}`
export const leaveStatus = row => String(hrField(row, 'status') ?? '').trim().toLowerCase()
export const pendingLeave = row => ['pending', 'pending approval', 'submitted', 'awaiting approval'].includes(leaveStatus(row))
export const leaveId = row => hrField(row, 'leaveId', 'id')

// Canonical history read shared by Employee Details and Leave Details. The
// deployed employee-specific endpoint rejects public identifiers; the working
// Leave Management collection supports Page/Limit, not EmployeeId filtering.
const readLeaveCollections = ({ employee, readEmployee, signal }) => Promise.allSettled([
  completeCollection('leave', signal),
  employee ? Promise.resolve([employee]) : readEmployee ? completeCollection('employees', signal) : Promise.resolve([]),
])

export async function loadEmployeeLeaveRecords(identifier, { employee, readEmployee = true, signal } = {}) {
  const [history, directory] = await readLeaveCollections({ employee, readEmployee, signal })
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
  if (history.status === 'rejected') throw history.reason
  // Do not display an empty history when the directory needed for mapping failed.
  if (directory.status === 'rejected') throw directory.reason
  return resolveLeaveEmployee(identifier, directory.value, history.value)
}

export async function loadEmployeeLeaveProfile(identifier, { readEmployee, signal, unavailableBalances, resolvedBalanceIds = new Map(), onReady }) {
  // These are the same collections the existing Employees/Leave pages read.
  // Do not depend on detail endpoints that rejected the route's display code.
  const [history, directory] = await readLeaveCollections({ readEmployee, signal })
  if (signal.aborted) return null
  const result = { loading: false, rows: [], employee: null, balance: null }
  if (history.status === 'rejected') result.historyError = history.reason.response ? hrError(history.reason, 'leave') : history.reason.message
  if (directory.status === 'rejected') result.employeeError = hrError(directory.reason, 'employees')
  try {
    Object.assign(result, resolveLeaveEmployee(identifier, directory.status === 'fulfilled' ? directory.value : [], history.status === 'fulfilled' ? history.value : []))
  } catch (error) { result.historyError = error.message; result.employeeError = error.message; return result }
  const id = String(result.backendEmployeeId)
  if (unavailableBalances.has(id)) { result.balanceUnavailable = true; return result }
  result.balanceLoading = true
  onReady?.({ ...result })
  try {
    // Some directory responses supply both employeeId and id. A successful
    // read verifies which is accepted; do not assume either is a numeric code.
    const candidates = [...new Set([resolvedBalanceIds.get(id), result.backendEmployeeId, hrField(result.employee, 'id')].filter(value => value != null).map(String))]
    for (let index = 0; index < candidates.length; index++) {
      try {
        const value = await hrRequest('GET', '/api/hr/leave/balance/{employeeId}', { id: candidates[index], signal })
        if (signal.aborted) throw new DOMException('Aborted', 'AbortError')
        const returnedId = hrField(value, 'employeeId')
        if (returnedId != null && !result.identifiers.has(String(returnedId))) throw new Error('Leave balance belongs to a different employee.')
        result.balance = value
        result.backendEmployeeId = candidates[index]
        resolvedBalanceIds.set(id, candidates[index])
        break
      } catch (error) {
        if (signal.aborted || error.response?.status !== 404 || index === candidates.length - 1) throw error
      }
    }
  } catch (error) {
    if (signal.aborted) return null
    if ([404, 405, 501].includes(error.response?.status)) { unavailableBalances.add(id); result.balanceUnavailable = true }
    else result.balanceError = error.response ? hrError(error, 'leave') : error.message
  }
  result.balanceLoading = false
  return signal.aborted ? null : result
}

export function employeeLeaveRows(response, employeeId) {
  const value = unwrapHrData(response)
  if (!Array.isArray(value) && !['items', 'records', 'results', 'leaves', 'leaveRequests'].some(key => Array.isArray(value?.[key]))) {
    throw new Error('The server returned no readable employee leave history.')
  }
  // The employee endpoint scopes records without an ID. When IDs are present,
  // explicitly discard other employees' records before filtering or counting.
  const records = hrList(value)
  if (records.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('The server returned an invalid leave record.')
  const total = hrField(value, 'totalCount', 'totalRecords')
  if ((total != null && Number(total) > records.length) || Number(hrField(value, 'totalPages')) > 1) {
    throw new Error('The employee history endpoint returned an incomplete page. Complete history is unavailable.')
  }
  return records.filter(row => hrField(row, 'employeeId') == null || String(hrField(row, 'employeeId')) === String(employeeId))
}

export function employeeLeaveSummary(rows) {
  const days = rows.map(row => hrField(row, 'days', 'totalDays', 'numberOfDays'))
  return {
    total: rows.length,
    approved: rows.filter(row => leaveStatus(row) === 'approved').length,
    pending: rows.filter(pendingLeave).length,
    rejected: rows.filter(row => leaveStatus(row) === 'rejected').length,
    days: days.every(value => typeof value === 'number' && Number.isFinite(value)) ? days.reduce((sum, value) => sum + value, 0) : null,
  }
}

export function filterEmployeeLeaves(rows, filters) {
  const search = (filters.search ?? '').trim().toLowerCase()
  return rows.filter(row => {
    const from = String(hrField(row, 'fromDate', 'startDate') ?? '').slice(0, 10)
    const to = String(hrField(row, 'toDate', 'endDate') ?? '').slice(0, 10)
    return (!search || ['leaveType', 'reason', 'status'].some(key => String(hrField(row, key) ?? '').toLowerCase().includes(search)))
      && (!filters.type || hrField(row, 'leaveType') === filters.type)
      && (!filters.status || (filters.status === 'pending' ? pendingLeave(row) : leaveStatus(row) === filters.status))
      && (!filters.from || (from && from >= filters.from))
      && (!filters.to || (to && to <= filters.to))
  })
}
