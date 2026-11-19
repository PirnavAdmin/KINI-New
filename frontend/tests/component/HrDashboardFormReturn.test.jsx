import { useEffect, useState } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import useDashboardFormReturn from '@shared/hooks/useDashboardFormReturn'

afterEach(cleanup)
function FormPage() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  useDashboardFormReturn(open)
  useEffect(() => {
    if (location.state?.openAdd) {
      setOpen(true)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location, navigate])
  return open ? <><button onClick={() => setOpen(false)}>Cancel</button><button onClick={() => setOpen(false)}>Save successfully</button></> : <p>Module list</p>
}
it.each([
  ['/employee/hr/employees', 'Cancel'], ['/employee/announcements', 'Cancel'], ['/employee/calendar', 'Cancel'],
  ['/employee/hr/employees', 'Save successfully'], ['/employee/announcements', 'Save successfully'], ['/employee/calendar', 'Save successfully'],
])('returns from %s to HR dashboard after %s, even after the add intent is cleared', async (path, action) => {
  render(<MemoryRouter initialEntries={[{ pathname: path, state: { openAdd: true, returnTo: '/employee/hr-dashboard' } }]}><Routes>
    <Route path={path} element={<FormPage />} />
    <Route path="/employee/hr-dashboard" element={<h1>HR Dashboard</h1>} />
  </Routes></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: action }))
  expect(await screen.findByRole('heading', { name: 'HR Dashboard' })).toBeInTheDocument()
})
it('keeps forms opened from the module on their module page', async () => {
  render(<MemoryRouter initialEntries={[{ pathname: '/employee/calendar', state: { openAdd: true } }]}><FormPage /></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  expect(await screen.findByText('Module list')).toBeInTheDocument()
})
