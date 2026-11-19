import { hrField, hrList, hrRequest } from './hrApi'
import { completeCollection, resolveHrEmployee } from './hrEmployeeRecords'

export async function loadPerformanceHistory(identifier, { signal, readEmployees = true } = {}) {
  const numeric = value => /^\d+$/.test(String(value ?? '').trim()) && Number(value) > 0
  let id = identifier
  let identifiers = new Set([String(identifier)])
  if (!numeric(id)) {
    if (!readEmployees) throw new Error('Select an employee with a numeric record ID.')
    const match = resolveHrEmployee(identifier, await completeCollection('employees', signal), [])
    identifiers = match.identifiers
    id = [hrField(match.employee, 'employeeRecordId'), hrField(match.employee, 'employeeId'), hrField(match.employee, 'id')].find(numeric)
    if (id == null) throw new Error('The employee directory did not provide a numeric record ID.')
  }
  identifiers.add(String(id))
  try {
    const value = await hrRequest('GET', '/api/hr/performance/employee/{employeeId}', { id, signal })
    const rows = Array.isArray(value?.performance) ? value.performance : hrList(value)
    return rows.filter(row => hrField(row, 'employeeId') == null || identifiers.has(String(hrField(row, 'employeeId'))))
  } catch (error) {
    if (signal?.aborted || error.response?.status !== 404) throw error
    // Some deployments expose the collection but omit employee history.
    return (await completeCollection('performance', signal)).filter(row => identifiers.has(String(hrField(row, 'employeeId'))))
  }
}
