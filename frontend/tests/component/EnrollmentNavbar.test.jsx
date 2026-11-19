import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it } from 'vitest'
import EnrollmentNavbar from '@features/enrollment/components/EnrollmentNavbar'

afterEach(cleanup)
function mount(path = '/enrollment?courseId=5') {
  render(<MemoryRouter initialEntries={[path]}><EnrollmentNavbar /></MemoryRouter>)
}
it('uses one Home header on enrollment without marking Home active', () => {
  mount()
  expect(screen.getAllByRole('banner')).toHaveLength(1)
  expect(screen.queryByText('Enrollment')).not.toBeInTheDocument()
  for (const link of screen.getAllByRole('link', { name: 'Home', exact: true })) {
    expect(link).toHaveAttribute('href', '/')
    expect(link).not.toHaveAttribute('aria-current')
  }
  expect(screen.getByRole('button', { name: 'Open Programs submenu' })).toHaveAttribute('aria-expanded', 'false')
  fireEvent.click(screen.getByRole('button', { name: 'Open Programs submenu' }))
  expect(screen.getByRole('button', { name: 'Close Programs submenu' })).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getAllByRole('link', { name: 'Corporate Training' })[0]).toHaveAttribute('href', '/corporate-training')
})
it('opens the mobile menu and dismisses it with Escape', () => {
  mount()
  fireEvent.click(screen.getByRole('button', { name: 'Open navigation menu' }))
  expect(screen.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true')
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false')
})
