import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import Sidebar from '@features/dashboard/components/Sidebar'
const access = vi.hoisted(() => ({ denied: null }))
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { department: 'HR' }, logout: vi.fn() }) }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: key => key !== access.denied }) }))
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default: () => ({ isHrUser: true, permissionSource: 'api', canModule: key => key !== access.denied }) }))
vi.mock('@features/student/hooks/useStudentProgressAccess', () => ({ default: () => ({ progress: 100 }) }))
afterEach(() => { cleanup(); access.denied = null })
const app = (path, props = {}) => render(<MemoryRouter initialEntries={[path]}><Sidebar role="employee" {...props} /></MemoryRouter>)
it.each([
  ['/employee/students/24', 'Students'],
  ['/employee/batches/101', 'Batches'],
  ['/employee/hr-employees/9', 'Employees'],
  ['/employee/hr-employees/9/attendance', 'Employees'],
  ['/employee/batches/101/students', 'Batches'],
  ['/employee/hr-leave/employee/15', 'Leave Management'],
  ['/employee/hr-attendance/employee/15', 'Attendance'],
])('keeps the parent active at %s', (path, label) => {
  app(path)
  expect(screen.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page')
  expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1)
})
it('uses the mentor nav flow and requested HR groups', () => {
  app('/employee/students')
  const nav = screen.getByRole('navigation', { name: 'HR navigation' })
  expect(nav).toContainElement(screen.getByRole('button', { name: 'Logout' }))
  expect(nav).toContainElement(screen.getByRole('link', { name: 'Settings', exact: true }))
  for (const label of ['OVERVIEW', 'WORKFORCE', 'MANAGEMENT', 'ENGAGE', 'SYSTEM']) expect(screen.getByText(label)).toBeInTheDocument()
  expect(nav.closest('aside')).toHaveAttribute('data-ui', 'dashboard-sidebar')
  expect(nav.closest('aside')).toHaveAttribute('data-sidebar-design', 'mentor')
})
it('labels collapsed icons and toggles the rail', () => {
  const toggle = vi.fn()
  app('/employee/students', { collapsed: true, onToggle: toggle })
  expect(screen.getByRole('link', { name: 'Students', exact: true })).toHaveAttribute('title', 'Students')
  expect(screen.getByRole('button', { name: 'Logout' })).toHaveAttribute('title', 'Logout')
  fireEvent.click(screen.getAllByRole('button', { name: 'Expand sidebar' })[0])
  expect(toggle).toHaveBeenCalledOnce()
})
it('retains permission filtering', () => {
  access.denied = 'students'
  app('/employee/students')
  expect(screen.queryByRole('link', { name: 'Students', exact: true })).not.toBeInTheDocument()
})
it('provides a mobile close action and closes on navigation', () => {
  const close = vi.fn()
  app('/employee/students', { mobile: true, onToggle: close, onNavigate: close })
  fireEvent.click(screen.getByRole('button', { name: 'Close navigation' }))
  fireEvent.click(screen.getByRole('link', { name: 'Employees', exact: true }))
  expect(close).toHaveBeenCalledTimes(2)
})