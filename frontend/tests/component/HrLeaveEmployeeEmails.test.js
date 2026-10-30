import { expect, it } from 'vitest'
import { enrichLeaveEmployeeEmails } from '@features/hr/services/hrLeaveEmployeeEmails'

const employees = [{ employeeId: 9, employeeCode: 'EMP-001', email: 'employee@example.com', fullName: 'Employee One' }]

it('fills missing leave emails using the public employee code or numeric employee ID', () => {
  const rows = enrichLeaveEmployeeEmails([{ leaveId: 1, employeeId: 'EMP-001' }, { leaveId: 2, employeeId: 9, email: '' }], employees)
  expect(rows.map(row => row.email)).toEqual(['employee@example.com', 'employee@example.com'])
})

it('prefers email supplied by the leave API and supports nested employee email', () => {
  const rows = enrichLeaveEmployeeEmails([{ employeeId: 9, employeeEmail: 'leave@example.com' }, { employee: { emailAddress: 'nested@example.com' } }], employees)
  expect(rows.map(row => row.email)).toEqual(['leave@example.com', 'nested@example.com'])
})

it('does not match by employee name, leave ID, user ID or ambiguous directory identifiers', () => {
  const rows = [{ leaveId: 9, userId: 9, employeeName: 'Employee One' }, { employeeId: 'unknown' }]
  expect(enrichLeaveEmployeeEmails(rows, employees)).toEqual(rows)
  const ambiguous = [{ ...employees[0] }, { employeeId: 10, employeeCode: 'EMP-001', email: 'other@example.com' }]
  expect(enrichLeaveEmployeeEmails([{ employeeId: 'EMP-001' }], ambiguous)[0].email).toBeUndefined()
})
