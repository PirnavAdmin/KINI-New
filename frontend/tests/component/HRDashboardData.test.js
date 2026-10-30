import { describe, expect, it, vi } from 'vitest'
import { dashboardError, getStudentDisplayName, isHrEmployee, loadDashboardList, workforceDepartments } from '../../src/features/hr/services/hrDashboardData'

describe('HR dashboard data', () => {
  it('counts four HR employees separately from two mentors', () => {
    const employees = [{ role: 'Mentor' }, { role: 'Mentor' }, { role: 'HR' }, { role: 'HR Executive' }, { role: 'hr_manager' }, { role: { name: 'HR Coordinator' } }]
    expect(employees.filter(isHrEmployee)).toHaveLength(4)
    expect(isHrEmployee({ role: 'Employee', department: { name: 'Human Resources' } })).toBe(true)
    expect(isHrEmployee({ role: 'Employee', departmentName: 'Operations' })).toBe(false)
    expect(isHrEmployee({ role: 'Mentor', departmentName: 'HR' })).toBe(false)
    expect(isHrEmployee({})).toBe(false)
  })
  it('uses valid student identity fields without coercing objects or placeholders', () => {
    expect(getStudentDisplayName({ fullName: 'Not supplied', firstName: {}, lastName: 'null', email: 'student@example.com' })).toBe('student@example.com')
    expect(getStudentDisplayName({ firstName: 'A', lastName: 'B', studentName: 'C' })).toBe('A B')
    expect(getStudentDisplayName({ StudentId: 12 })).toBe('Student #12')
    expect(getStudentDisplayName({ name: {} })).toBe('Name unavailable')
  })
  it('resolves department IDs without classifying unresolved assignments as unassigned', () => {
    expect(workforceDepartments([{ departmentId: 7 }, { departmentId: 8 }, {}], [{ id: 7, name: 'Training' }]))
      .toEqual([['Training', 1], ['Department #8', 1], ['Unassigned', 1]])
  })
  it('does not offer retry for forbidden or missing resources', () => {
    expect(dashboardError({ response: { status: 403 } }).retryable).toBe(false)
    expect(dashboardError({ response: { status: 404 } }).retryable).toBe(false)
    expect(dashboardError({ response: { status: 500 } }, 'syllabus').message).toBe('Unable to load assigned syllabus.')
    expect(dashboardError({}).message).toBe('Unable to connect. Please try again.')
  })
  it('collects all pages when the server caps the requested page size', async () => {
    const list = vi.fn().mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 2 })
      .mockResolvedValueOnce({ items: [{ id: 2 }], totalCount: 2 })
    expect(await loadDashboardList({ list }, { params: [{ name: 'Page' }, { name: 'Limit' }] })).toEqual([{ id: 1 }, { id: 2 }])
    expect(list.mock.calls[1][0].Page).toBe(2)
  })
})
