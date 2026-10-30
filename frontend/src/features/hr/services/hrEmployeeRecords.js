import { hrField, hrList, hrModuleApi, unwrapHrData } from './hrApi'
import { HR_API_CONTRACT } from './hrApiContract'

// `id` belongs to the employee directory record here, never to a leave row.
const directoryIds = employee => ['employeeId', 'id', 'employeeCode', 'employeeNumber', 'code'].map(key => hrField(employee, key)).filter(value => value != null && value !== '').map(String)
const recordEmployeeIds = row => [hrField(row, 'employeeId'), hrField(row, 'employeeCode'), hrField(row, 'employeeNumber'),
  ...directoryIds(hrField(row, 'employee') ?? {})].filter(value => value != null && value !== '').map(String)

export function resolveHrEmployee(identifier, employees, leaves) {
  const matches = employees.filter(employee => directoryIds(employee).includes(String(identifier)))
  if (matches.length > 1) throw new Error('The employee identifier matches multiple directory records. Select the employee again.')
  const employee = matches[0] ?? null
  const identifiers = new Set(employee ? directoryIds(employee) : [String(identifier)])
  const rows = leaves.filter(row => recordEmployeeIds(row).some(value => identifiers.has(value)))
  // Never interpret an attendance/leave record's id/userId or parse an EMP code into a primary key.
  const backendEmployeeId = hrField(employee, 'employeeId', 'id') ?? identifier
  const displayCode = hrField(employee, 'employeeCode', 'employeeNumber', 'code')
  return { employee, rows, identifiers, backendEmployeeId, displayCode }
}

export async function completeCollection(module, signal) {
  const api = hrModuleApi(module)
  const params = HR_API_CONTRACT[`GET ${api.path}`].params.map(param => param.name)
  const records = []
  const seen = new Set()
  for (let page = 1; page <= 1000; page++) {
    const value = await api.list({ Page: page, Limit: 100 }, signal)
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    const raw = unwrapHrData(value)
    if (!Array.isArray(raw) && !['items', 'records', 'results', 'employees', 'attendance', 'leaves', 'leaveRequests'].some(key => Array.isArray(raw?.[key]))) throw new Error(`The server returned no readable ${module} collection.`)
    const rows = hrList(raw)
    if (rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error(`The server returned an invalid ${module} record.`)
    const signature = JSON.stringify(rows)
    if (rows.length && seen.has(signature)) throw new Error(`The ${module} API repeated a page; complete history could not be verified.`)
    seen.add(signature)
    records.push(...rows)
    const total = hrField(raw, 'totalCount', 'totalRecords', 'total')
    const pages = hrField(raw, 'totalPages')
    if (total != null && records.length >= Number(total)) return records
    if (pages != null && page >= Number(pages)) {
      if (total != null && records.length < Number(total)) throw new Error(`The ${module} collection is incomplete.`)
      return records
    }
    if (!rows.length) {
      if (total != null && records.length < Number(total)) throw new Error(`The ${module} collection is incomplete.`)
      return records
    }
    if (total == null && pages == null && (rows.length < 100 || !params.includes('Page'))) return records
  }
  throw new Error(`The ${module} pagination limit was exceeded.`)
}

