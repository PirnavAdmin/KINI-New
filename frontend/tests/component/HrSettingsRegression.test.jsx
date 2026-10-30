import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiSettings from '@features/hr/components/HrApiSettings'
import HrApiForm from '@features/hr/components/HrApiForm'
import apiClient from '@shared/services/apiClient'
vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const updateUser = vi.hoisted(() => vi.fn())
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: {}, updateStoredUser: updateUser }) }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@shared/context/ThemeContext', () => ({ useTheme: () => ({ isDark: false, toggle: vi.fn() }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, className }) => <main className={className}>{children}</main> }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it.each(['unauthorized', 'wrapped failure'])('keeps the password dialog open on %s and sends the entered current password', async kind => {
  apiClient.request.mockImplementation(async request => {
    if (request.method === 'PUT') {
      expect(request.url).toBe('/api/hr/settings/security/password')
      expect(request.skipAuthRedirect).toBe(true)
      expect(request.data).toEqual({ currentPassword: 'Incorrect1!', newPassword: 'Replacement2!' })
      if (kind === 'unauthorized') throw { response: { status: 401, data: { message: 'Current password is incorrect.' } } }
      return { status: 200, data: { data: { succeeded: false, message: 'Current password is incorrect.' } } }
    }
    return { status: 200, data: {} }
  })
  render(<MemoryRouter><HrApiSettings /></MemoryRouter>)
  fireEvent.click(screen.getByRole('tab', { name: 'Security', exact: true }))
  fireEvent.click(await screen.findByRole('button', { name: 'Change password' }))
  for (const [label, value] of [['Current Password', 'Incorrect1!'], ['New Password', 'Replacement2!'], ['Confirm Password', 'Replacement2!']]) {
    fireEvent.change(screen.getByLabelText(label, { selector: 'input' }), { target: { value } })
  }
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect.')
  expect(screen.getByRole('button', { name: 'Save', exact: true })).toBeEnabled()
  expect(screen.getByLabelText('Current Password', { selector: 'input' })).toHaveValue('Incorrect1!')
})
const profile = { firstName: 'Sai', lastName: 'Purna', email: 'person@example.com', phone: '9944103404' }
it('rejects name digits while typing and limits the phone to ten digits', () => {
  const save = vi.fn()
  render(<HrApiForm title="Edit profile" operation="PUT /api/hr/settings/profile" values={profile} onSave={save} onClose={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Sai123' } })
  expect(screen.getByLabelText('First Name')).toHaveValue('Sai')
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '9944103404123' } })
  expect(screen.getByLabelText('Phone')).toHaveValue('9944103404')
  fireEvent.change(screen.getByLabelText('Phone'), { target: { value: '1234567890' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(screen.getByRole('alert')).toHaveTextContent('Phone: enter a valid 10-digit Indian mobile number.')
  expect(save).not.toHaveBeenCalled()
})
it('toggles all password fields and identifies a confirmation mismatch', () => {
  render(<HrApiForm title="Change password" operation="PUT /api/hr/settings/security/password" onSave={vi.fn()} onClose={vi.fn()} />)
  for (const label of ['Current Password', 'New Password', 'Confirm Password']) {
    const input = screen.getByLabelText(label, { selector: 'input' })
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: `Show ${label}` }))
    expect(input).toHaveAttribute('type', 'text')
  }
  fireEvent.change(screen.getByLabelText('Current Password', { selector: 'input' }), { target: { value: 'OldPassword1!' } })
  fireEvent.change(screen.getByLabelText('New Password', { selector: 'input' }), { target: { value: 'NewPassword1!' } })
  fireEvent.change(screen.getByLabelText('Confirm Password', { selector: 'input' }), { target: { value: 'Different1!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(screen.getByRole('alert')).toHaveTextContent('Confirm Password: does not match New Password.')
})
it('shows backend password field errors without replacing them with a generic message', async () => {
  render(<HrApiForm title="Change password" operation="PUT /api/hr/settings/security/password" values={{ currentPassword: 'Wrong1!', newPassword: 'NewPassword1!' }} onSave={vi.fn().mockRejectedValue({ response: { status: 400, data: { errors: { CurrentPassword: ['Current password is incorrect.'] } } } })} onClose={vi.fn()} />)
  fireEvent.change(screen.getByLabelText('Confirm Password', { selector: 'input' }), { target: { value: 'NewPassword1!' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('CurrentPassword: Current password is incorrect.')
})
it('retains an uploaded photo after a stale profile refresh', async () => {
  apiClient.request.mockImplementation(async ({ method, url }) => ({ data: url.endsWith('/photo') && method === 'POST' ? { profilePhotoUrl: '/uploads/new-avatar.png' } : profile, status: 200 }))
  const { container } = render(<MemoryRouter><HrApiSettings /></MemoryRouter>)
  fireEvent.click(await screen.findByRole('button', { name: 'Upload profile photo' }))
  fireEvent.change(screen.getByLabelText(/Photo/, { selector: 'input' }), { target: { files: [new File(['png'], 'avatar.png', { type: 'image/png' })] } })
  fireEvent.submit(screen.getByLabelText(/Photo/, { selector: 'input' }).closest('form'))
  await waitFor(() => expect(container.querySelector('.hst-avatar img')).toHaveAttribute('src', expect.stringContaining('/uploads/new-avatar.png')))
  fireEvent.click(screen.getByRole('tab', { name: 'Notifications' }))
  fireEvent.click(screen.getByRole('tab', { name: 'Profile', exact: true }))
  await waitFor(() => expect(container.querySelector('.hst-avatar img')).toHaveAttribute('src', expect.stringContaining('/uploads/new-avatar.png')))
  expect(updateUser).toHaveBeenCalledWith(expect.objectContaining({ photoUrl: expect.stringContaining('new-avatar.png') }))
})

it('names the New Password requirements that fail the server policy before sending a request', async () => {
  apiClient.request.mockResolvedValue({ data: { passwordPolicy: { minLength: 8, requireUppercase: true, requireNumber: true } }, status: 200 })
  render(<MemoryRouter><HrApiSettings /></MemoryRouter>)
  fireEvent.click(screen.getByRole('tab', { name: 'Security', exact: true }))
  fireEvent.click(await screen.findByRole('button', { name: 'Change password' }))
  fireEvent.change(screen.getByLabelText('Current Password', { selector: 'input' }), { target: { value: 'OldPassword1!' } })
  for (const label of ['New Password', 'Confirm Password']) fireEvent.change(screen.getByLabelText(label, { selector: 'input' }), { target: { value: 'weak' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('New Password: include at least 8 characters, an uppercase letter, a number.')
  expect(apiClient.request.mock.calls.some(([request]) => request.method === 'PUT')).toBe(false)
})
