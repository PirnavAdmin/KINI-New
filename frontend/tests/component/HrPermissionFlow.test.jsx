import { beforeEach, expect, it, vi } from 'vitest'
import { renderHook, waitFor, cleanup } from '@testing-library/react'
import { AuthContext } from '@shared/context/AuthContextValue'
import useHrPermissions from '@features/hr/hooks/useHrPermissions'
import { permissionApi } from '@shared/services/platformModulesApi'

vi.mock('@shared/services/platformModulesApi', () => ({
  permissionApi: { effectiveByEmployee: vi.fn(), byRole: vi.fn() },
  toBackendUserRole: role => role,
  moduleKey: key => key,
}))

let identity = 100
const mount = (overrides = {}) => {
  const value = { role: 'employee', token: `test-${++identity}`,
    user: { employeeId: identity, role: 'employee', department: 'HR', email: 'hr@example.com' },
    employeeIdResolving: false, employeeProfileResolving: false, ...overrides }
  return renderHook(() => useHrPermissions(), {
    wrapper: ({ children }) => <AuthContext.Provider value={value}>{children}</AuthContext.Provider>,
  })
}
const grant = (key, allowed) => ({ key, canAccess: allowed, canView: allowed, canAdd: allowed })

it.each(['HR', 'HRExecutive', 'HRRecruiter'])('requests the backend %s role instead of Employee', async backendRole => {
  permissionApi.effectiveByEmployee.mockImplementation(async (_id, requestedRole) => {
    if (requestedRole !== backendRole) throw new Error('Wrong permission role')
    return [grant('dashboard', true), grant('employees', false)]
  })
  const employeeId = ++identity
  const { result } = mount({ user: { employeeId, role: 'employee', roleName: backendRole } })
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(permissionApi.effectiveByEmployee).toHaveBeenCalledWith(employeeId, backendRole)
  expect(result.current.isHrUser).toBe(true)
  expect(result.current.canAccessModule('dashboard')).toBe(true)
  expect(result.current.canAccessModule('employees')).toBe(false)
})

it('preserves the HR role when only role-level permissions can be requested', async () => {
  permissionApi.byRole.mockResolvedValue([grant('dashboard', true)])
  const { result } = mount({ user: { role: 'employee', userRole: 'HR' } })
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(permissionApi.byRole).toHaveBeenCalledWith('HR')
  expect(result.current.canAccessModule('dashboard')).toBe(true)
})

it('keeps Employee permission defaults for an Employee in the HR department', async () => {
  permissionApi.effectiveByEmployee.mockResolvedValue([grant('dashboard', true)])
  const { result } = mount()
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(permissionApi.effectiveByEmployee).toHaveBeenCalledWith(identity, 'employee')
})
beforeEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

it('waits for backend permissions before granting the HR workspace', async () => {
  let finish
  permissionApi.effectiveByEmployee.mockImplementation(() => new Promise(resolve => { finish = resolve }))
  const { result } = mount()
  expect(result.current.isLoading).toBe(true)
  expect(result.current.canModule('dashboard')).toBe(false)
  finish([grant('dashboard', true), grant('employees', true)])
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.permissionSource).toBe('api')
  expect(result.current.canModule('employees')).toBe(true)
  expect(result.current.can('employees', 'delete')).toBe(false)
})

it('uses revoked backend grants even when a local full HR profile exists', async () => {
  localStorage.setItem('kini_hr_users_v1', JSON.stringify([{ email: 'hr@example.com', status: 'active', hrRole: 'HR_MANAGER', permissions: { employees: ['view', 'add'] } }]))
  permissionApi.effectiveByEmployee.mockResolvedValue([grant('dashboard', true), grant('employees', false)])
  const { result } = mount()
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.canModule('employees')).toBe(false)
  expect(result.current.canAccessModule('employees')).toBe(false)
  expect(result.current.can('employees', 'add')).toBe(false)
})

it('does not identify a live generic employee from a browser-only HR record', async () => {
  localStorage.setItem('kini_hr_users_v1', JSON.stringify([{ email: 'hr@example.com', status: 'active', permissions: { dashboard: ['view'] } }]))
  permissionApi.effectiveByEmployee.mockResolvedValue([grant('dashboard', true)])
  const { result } = mount({ user: { employeeId: ++identity, role: 'employee', email: 'hr@example.com' } })
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.isHrUser).toBe(false)
  expect(result.current.canAccessModule('dashboard')).toBe(false)
})

it('keeps a direct HR route loading while the profile is resolving', async () => {
  permissionApi.effectiveByEmployee.mockResolvedValue([grant('dashboard', true)])
  const { result } = mount({ employeeProfileResolving: true })
  await waitFor(() => expect(result.current.canModule('dashboard')).toBe(true))
  expect(result.current.isLoading).toBe(true)
})

it.each([[], null])('does not turn empty or invalid backend data into static HR grants: %j', async rows => {
  permissionApi.effectiveByEmployee.mockResolvedValue(rows)
  const { result } = mount()
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(result.current.canModule('dashboard')).toBe(false)
})

it('does not fall back to role grants after an employee lookup fails', async () => {
  permissionApi.effectiveByEmployee.mockRejectedValue(new Error('Forbidden'))
  permissionApi.byRole.mockResolvedValue([grant('dashboard', true)])
  const { result } = mount()
  await waitFor(() => expect(result.current.isLoading).toBe(false))
  expect(permissionApi.byRole).not.toHaveBeenCalled()
  expect(result.current.canModule('dashboard')).toBe(false)
})
