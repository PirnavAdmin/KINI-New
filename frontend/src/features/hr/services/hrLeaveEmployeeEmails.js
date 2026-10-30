import { hrField } from './hrApi'

const identifiers = (row, directory = false) => [
  ...['employeeId', 'employeeCode', 'employeeNumber', 'code'].map(key => hrField(row, key)),
  ...(directory ? [hrField(row, 'id')] : []),
].filter(value => value != null && String(value).trim()).map(value => String(value).trim())

const emailOf = row => ['email', 'employeeEmail', 'emailAddress', 'workEmail', 'officialEmail']
  .map(key => hrField(row, key))
  .find(value => typeof value === 'string' && /^[^\s@]+@[^\s@]+$/.test(value.trim()))?.trim()

export function enrichLeaveEmployeeEmails(leaves, employees) {
  const byId = new Map()
  for (const employee of employees) {
    for (const id of identifiers(employee, true)) {
      const matches = byId.get(id) ?? new Set()
      matches.add(employee)
      byId.set(id, matches)
    }
  }
  return leaves.map(leave => {
    const nested = hrField(leave, 'employee')
    const supplied = emailOf(leave) ?? emailOf(nested)
    if (supplied) return { ...leave, email: supplied }
    const matches = new Set([...identifiers(leave), ...identifiers(nested)].flatMap(id => [...(byId.get(id) ?? [])]))
    // Names and leave/user IDs cannot reliably identify a directory employee.
    if (matches.size !== 1) return leave
    const employee = [...matches][0]
    const email = emailOf(employee) ?? emailOf(hrField(employee, 'contact')) ?? emailOf(hrField(employee, 'user'))
    return email ? { ...leave, email } : leave
  })
}
