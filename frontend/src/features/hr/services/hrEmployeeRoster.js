import { employeeService } from '@shared/services/employeeService'
import { employeeIdOf } from './hrEmployeeIdentity'
import { hrField } from './hrApi'
import { loadDashboardList } from './hrDashboardData'
import { mergeEmployeeEditValues } from './hrEmployeeEditData'

// HR's summary DTO may contain an employee display code and omit the numeric
// primary key. Resolve it from the employee directory, never from userId or
// by extracting digits from a display code.
export function resolveEmployeeRecordIds(rows, directory) {
  const emailOf = row => String(hrField(row, 'email', 'employeeEmail') ?? '').trim().toLowerCase()
  return rows.map(row => {
    if (employeeIdOf(row) != null) return row
    const email = emailOf(row)
    if (!email) return row
    const matches = directory.filter(employee => emailOf(employee) === email)
    if (matches.length !== 1) return row
    const id = employeeIdOf(matches[0])
    return id == null ? row : { ...mergeEmployeeEditValues(row, matches[0]), employeeRecordId: id }
  })
}

export async function loadHrEmployeeRoster(api, definition, signal) {
  const rows = await loadDashboardList(api, definition, signal)
  return enrichEmployeeRecordIds(rows, signal)
}

export async function enrichEmployeeRecordIds(rows, signal) {
  if (signal?.aborted || rows.every(row => employeeIdOf(row) != null)) return rows
  const directory = []
  try {
    for (let page = 1; page <= 1000; page++) {
      const payload = await employeeService.getEmployees({ PageNumber: page, PageSize: 100 })
      if (signal?.aborted) return rows
      directory.push(...(payload.data ?? []))
      if (page >= Math.max(1, Number(payload.totalPages) || 1)) return resolveEmployeeRecordIds(rows, directory)
    }
  } catch (error) {
    if (signal?.aborted) throw error
    // Keep readable rows when the current role cannot read the directory.
    // Unresolved identities must never enable destructive actions.
  }
  return rows
}
