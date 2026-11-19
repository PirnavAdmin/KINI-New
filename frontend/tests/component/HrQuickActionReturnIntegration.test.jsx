import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn(async ({ url, method }) => {
  let data = { items: [] }
  if (url.includes('/announcements')) {
    data = method === 'POST' ? { announcementId: 1, title: 'Test', audience: 'Staff', status: 'Published', publishDate: '2026-11-05T10:00:00', expiryDate: null }
      : url.endsWith('/options') ? { audiences: ['Staff'], statuses: ['Published'] }
        : url.endsWith('/summary') ? { totalAnnouncements: 0, published: 0, drafts: 0, expired: 0, recentlyPublished: 0 }
          : { items: [], page: 1, limit: 10, totalCount: 0, totalPages: 1 }
  }
  return { data, config: {}, status: 200 }
}) } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children }) => <main>{children}</main> }))
// Form field validation is covered by the module suites; exercise the real
// module's successful mutation/close wiring here without unrelated form input.
vi.mock('@features/hr/components/HrApiForm', () => ({ default: ({ onClose, onSave }) => <div>
  <button onClick={onClose}>Cancel popup</button>
  <button onClick={() => onSave({})}>Save popup</button>
</div> }))
afterEach(cleanup)
it.each(['employees', 'announcements', 'calendar'].flatMap(module => ['Cancel popup', 'Save popup'].map(action => [module, action])))('returns to HR Dashboard from the real %s module on %s', async (module, action) => {
  const path = `/employee/test-${module}`
  render(<MemoryRouter initialEntries={[{ pathname: path, state: { openAdd: true, returnTo: '/employee/hr-dashboard' } }]}><Routes>
    <Route path={path} element={<HrApiModule module={module} />} />
    <Route path="/employee/hr-dashboard" element={<h1>Returned to HR Dashboard</h1>} />
  </Routes></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: action }))
  expect(await screen.findByRole('heading', { name: 'Returned to HR Dashboard' })).toBeInTheDocument()
})
