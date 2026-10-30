import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, Link, useLocation } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import DashboardLayout from '../../src/shared/layouts/DashboardLayout'
import { useAuth } from '../../src/shared/hooks/useAuth'
import { notificationService } from '../../src/shared/services/notificationService'
import { liveClassService } from '../../src/features/live-classes/services/liveClassService'

vi.mock('../../src/shared/hooks/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('../../src/shared/context/ThemeContext', () => ({ useThemeContext: () => ({ isDark: false, toggle: vi.fn() }) }))
vi.mock('../../src/shared/services/notificationService', () => ({ notificationService: {
  getStudentNotifications: vi.fn(), getStudentUnreadCount: vi.fn(),
  getOrganizationNotifications: vi.fn(), getOrganizationUnreadCount: vi.fn(), markRead: vi.fn(),
} }))
vi.mock('../../src/features/live-classes/services/liveClassService', () => ({ liveClassService: { upcoming: vi.fn() } }))
vi.mock('../../src/features/dashboard/components/Sidebar', () => ({ default: () => <Link to="/student/classes">My Courses</Link> }))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  useAuth.mockReturnValue({ user: { studentId: 5, isDemo: true, firstName: 'Sri' }, role: 'student', updateUser: vi.fn() })
  notificationService.getStudentNotifications.mockResolvedValue([])
  notificationService.getStudentUnreadCount.mockResolvedValue({ unreadCount: 0 })
  liveClassService.upcoming.mockResolvedValue([])
})

it('closes on outside pointer input without consuming the clicked action, and preserves inside and bell interactions', async () => {
  const outsideAction = vi.fn()
  render(<MemoryRouter initialEntries={['/student/dashboard']}><Routes>
    <Route path="/student" element={<DashboardLayout />}>
      <Route path="dashboard" element={<button onClick={outsideAction}>Outside action</button>} />
      <Route path="classes" element={<p>Courses page</p>} />
    </Route>
  </Routes></MemoryRouter>)

  const bell = screen.getByRole('button', { name: 'Notifications' })
  fireEvent.click(bell)
  await screen.findByText('No notifications found.')
  expect(bell).toHaveAttribute('aria-expanded', 'true')

  fireEvent.pointerDown(screen.getByText('No notifications found.'))
  expect(screen.getByText('No notifications found.')).toBeInTheDocument()

  fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside action' }))
  fireEvent.click(screen.getByRole('button', { name: 'Outside action' }))
  await waitFor(() => expect(bell).toHaveAttribute('aria-expanded', 'false'))
  expect(outsideAction).toHaveBeenCalledOnce()

  fireEvent.click(bell)
  expect(bell).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(bell)
  expect(bell).toHaveAttribute('aria-expanded', 'false')

  fireEvent.click(bell)
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(bell).toHaveAttribute('aria-expanded', 'false')

  fireEvent.click(bell)
  // Keyboard/programmatic navigation has no outside pointer event.
  fireEvent.click(screen.getByRole('link', { name: 'My Courses' }))
  await screen.findByText('Courses page')
  expect(bell).toHaveAttribute('aria-expanded', 'false')
})

function DestinationProbe() {
 const location = useLocation();
 return <p>Opened {location.pathname}{location.search}</p>;
}
it.each([
 ['Employee Permissions Changed', 'Permissions for employee ID 16 have been updated.', '/organization/employees?access=16', false],
 ['New HR User Created', 'A new HR user was added.', '/employee/hr-settings?tab=users', true],
])('opens destination for %s, including already-read notifications', async (title, description, expected, isRead) => {
 useAuth.mockReturnValue({ user: {organizationId:1, isDemo:true}, role:'org-admin', updateUser:vi.fn() });
 notificationService.getOrganizationNotifications.mockResolvedValue([{notificationId:16,title,description,isRead}]);
 notificationService.getOrganizationUnreadCount.mockResolvedValue({unreadCount:1});
 // Navigation must not wait for the read API to complete.
 notificationService.markRead.mockImplementation(() => new Promise(() => {}));
 render(<MemoryRouter initialEntries={['/organization/dashboard']}><Routes>
  <Route path="/organization" element={<DashboardLayout />}>
   <Route path="dashboard" element={<p>Dashboard</p>} />
   <Route path="employees" element={<DestinationProbe />} />
  </Route>
  <Route path="/employee/hr-settings" element={<DestinationProbe />} />
 </Routes></MemoryRouter>);
 fireEvent.click(screen.getByRole('button',{name:'Notifications'}));
 const link = await screen.findByRole('link',{name: new RegExp(title)});
 expect(link).toHaveAttribute('href',expected);
 fireEvent.click(link);
 await screen.findByText('Opened ' + expected);
 if (!isRead) expect(notificationService.markRead).toHaveBeenCalledWith(16);
 else expect(notificationService.markRead).not.toHaveBeenCalled();
 const bell = screen.queryByRole('button',{name:'Notifications'});
 if (bell) expect(bell).toHaveAttribute('aria-expanded','false');
});
