import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import OrgBranches from '@features/organization/pages/OrgBranches'
import apiClient from '@shared/services/apiClient'
import { editBranch } from '@shared/services/organizationService'
import { toast } from 'sonner'

vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
const branch = { branchId: 42, organizationId: 7, name: 'Regression Branch', address: '42 Unique Street', city: 'Hyderabad', country: 'India', phone: '9876543210', email: 'branch@example.com' }
const base = '/api/v1/organization/branches'
let scrollTo
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem('organization_id', '7')
  scrollTo = vi.fn(function ({ top }) { this.scrollTop = top })
  HTMLElement.prototype.scrollTo = scrollTo
  apiClient.get.mockResolvedValue({ data: [branch] })
})
afterEach(cleanup)

it('keeps required-field and email validation enabled', async () => {
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Add Branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save Branch' }))
  expect(screen.getByText('Branch name is required')).toBeInTheDocument()
  expect(screen.getByText('Address is required')).toBeInTheDocument()
  expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
  expect(apiClient.post).not.toHaveBeenCalled()
})

it('opens the saved address for editing and refetches the updated address', async () => {
  apiClient.put.mockResolvedValue({ data: { branchId: 42 } })
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Edit branch' }))
  expect(document.querySelector('textarea')).toHaveValue(branch.address)
  fireEvent.change(document.querySelector('textarea'), { target: { value: '84 Updated Street' } })
  apiClient.get.mockResolvedValue({ data: [{ ...branch, address: '84 Updated Street' }] })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
  await screen.findByText('84 Updated Street')
  expect(apiClient.put).toHaveBeenCalledWith(`${base}/42`, expect.objectContaining({ address: '84 Updated Street' }), undefined)
  expect(apiClient.get).toHaveBeenCalledTimes(2)
})

it('rejects invalid Indian mobile numbers in the edit form', async () => {
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Edit branch' }))
  fireEvent.change(document.querySelector('input[type="tel"]'), { target: { value: '5123456789' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
  expect(screen.getByText('Enter a valid Indian mobile number starting with 6, 7, 8, or 9.')).toBeInTheDocument()
  expect(apiClient.put).not.toHaveBeenCalled()
})

it('limits pasted branch phone numbers to ten digits', async () => {
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Edit branch' }))
  const phone = document.querySelector('input[type="tel"]')
  fireEvent.change(phone, { target: { value: '34454543564554767567556464' } })
  expect(phone).toHaveAttribute('maxLength', '10')
  expect(phone).toHaveValue('3445454356')
})

it('rejects invalid mobile numbers before an update request reaches the API client', async () => {
  await expect(editBranch(42, { organizationId: 7, phone: '5123456789' })).rejects.toThrow(
    'Enter a valid Indian mobile number starting with 6, 7, 8, or 9.',
  )
  expect(apiClient.put).not.toHaveBeenCalled()
})

it('persists edited contact and city through the update payload and refreshed branch list', async () => {
  apiClient.put.mockResolvedValue({ data: { branchId: 42 } })
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Edit branch' }))
  fireEvent.change(screen.getByDisplayValue(branch.phone), { target: { value: '9123456789' } })
  fireEvent.change(screen.getByDisplayValue(branch.city), { target: { value: 'Pune' } })
  apiClient.get.mockResolvedValue({ data: [{ ...branch, phone: undefined, BranchContactNumber: '9123456789', city: undefined, BranchCityName: 'Pune' }] })
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
  await screen.findByText('Pune, India')
  expect(screen.getByText('9123456789')).toBeInTheDocument()
  expect(apiClient.put).toHaveBeenCalledWith(`${base}/42`, expect.objectContaining({
    phone: '9123456789',
    city: 'Pune',
    branchCity: 'Pune',
    BranchCity: 'Pune',
    cityName: 'Pune',
    CityName: 'Pune',
    branchCityName: 'Pune',
    BranchCityName: 'Pune',
    branchContactNumber: '9123456789',
    BranchContactNumber: '9123456789',
  }), undefined)
})

it('reports a server inconsistency instead of hiding a branch returned after DELETE', async () => {
  apiClient.delete.mockResolvedValue({ status: 204, data: '' })
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Delete branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('server still returns')))
  expect(screen.getByText(branch.name)).toBeInTheDocument()
  expect(toast.success).not.toHaveBeenCalled()
})

it('moves to a valid page when the last row on the last page is deleted', async () => {
  const rows = Array.from({ length: 9 }, (_, index) => ({ ...branch, branchId: index + 1, name: `Branch ${index + 1}` }))
  apiClient.get.mockResolvedValue({ data: rows })
  apiClient.delete.mockResolvedValue({ status: 204, data: '' })
  render(<OrgBranches />)
  await screen.findByText('Branch 1')
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  expect(screen.getByText('Branch 9')).toBeInTheDocument()
  apiClient.get.mockResolvedValue({ data: rows.slice(0, 8) })
  fireEvent.click(within(screen.getByText('Branch 9').closest('tr')).getByRole('button', { name: 'Delete branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  await screen.findByText('Branch 1')
  expect(screen.queryByText('No branches found')).not.toBeInTheDocument()
})

it('does not let an older GET restore the deleted row', async () => {
  let resolveOld
  apiClient.get.mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve }))
  apiClient.get.mockResolvedValueOnce({ data: [branch] }).mockResolvedValue({ data: [] })
  apiClient.delete.mockResolvedValue({ status: 204, data: '' })
  const { StrictMode } = await import('react')
  render(<StrictMode><OrgBranches /></StrictMode>)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Delete branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  await screen.findByText('No branches found')
  await act(async () => resolveOld({ data: [branch] }))
  expect(screen.queryByText(branch.name)).not.toBeInTheDocument()
})

it('keeps the email DOM node, focus, values and modal scroll while typing', async () => {
  const user = userEvent.setup()
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  await user.click(screen.getByRole('button', { name: 'Add Branch' }))
  await waitFor(() => expect(scrollTo).toHaveBeenCalled())
  const email = document.querySelector('input[type="email"]')
  const body = email.closest('.overflow-y-auto')
  body.scrollTop = 260
  scrollTo.mockClear()
  await user.type(email, 'test@example.com')
  await act(() => new Promise(resolve => setTimeout(resolve, 40)))
  expect(document.querySelector('input[type="email"]')).toBe(email)
  expect(email).toHaveFocus()
  expect(email).toHaveValue('test@example.com')
  expect(body.scrollTop).toBe(260)
  expect(scrollTo).not.toHaveBeenCalled()
})

it('sends the address through the real service and reads it back after create and remount', async () => {
  apiClient.get.mockResolvedValueOnce({ data: [] })
  apiClient.post.mockResolvedValue({ data: { branchId: 42 } })
  const view = render(<OrgBranches />)
  await screen.findByText('No branches found')
  fireEvent.click(screen.getAllByRole('button', { name: 'Add Branch' })[0])
  const inputs = document.querySelectorAll('input')
  const values = [branch.name, branch.phone, branch.city, branch.country, branch.email]
  Array.from(inputs).filter(input => !input.disabled && input.required).forEach((input, index) => fireEvent.change(input, { target: { value: values[index] } }))
  fireEvent.change(document.querySelector('textarea'), { target: { value: branch.address } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Branch' }))
  await screen.findByText(branch.address)
  expect(apiClient.post).toHaveBeenCalledWith(base, expect.objectContaining({ address: branch.address, organizationId: 7 }), undefined)
  expect(apiClient.get).toHaveBeenCalledTimes(2)
  view.unmount()
  render(<OrgBranches />)
  await screen.findByText(branch.address)
})

it('uses the active session organization ID and sends backend branch aliases on create', async () => {
  localStorage.setItem('organization_id', '1')
  localStorage.setItem('user', JSON.stringify({ organizationId: 9, role: 'org-admin' }))
  apiClient.get.mockResolvedValueOnce({ data: [] })
  apiClient.post.mockResolvedValue({ data: { branchId: 42 } })
  render(<OrgBranches />)
  await screen.findByText('No branches found')
  fireEvent.click(screen.getAllByRole('button', { name: 'Add Branch' })[0])
  expect(document.querySelector('input[disabled]')).toHaveValue('9')
  const inputs = document.querySelectorAll('input')
  const values = [branch.name, branch.phone, branch.city, branch.country, branch.email]
  Array.from(inputs).filter(input => !input.disabled && input.required).forEach((input, index) => fireEvent.change(input, { target: { value: values[index] } }))
  fireEvent.change(document.querySelector('textarea'), { target: { value: branch.address } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Branch' }))
  await waitFor(() => expect(apiClient.post).toHaveBeenCalled())
  expect(apiClient.post).toHaveBeenCalledWith(base, expect.objectContaining({
    organizationId: 9,
    orgId: 9,
    name: branch.name,
    branchName: branch.name,
    address: branch.address,
    branchAddress: branch.address,
    location: branch.address,
    phone: branch.phone,
    contactNumber: branch.phone,
    mobileNumber: branch.phone,
    branchContact: branch.phone,
    email: branch.email,
    emailAddress: branch.email,
    primaryEmail: branch.email,
    branchContactEmail: branch.email,
  }), undefined)
})

it('displays address, contact, and email when the branch API uses alternate field names', async () => {
  apiClient.get.mockResolvedValue({
    data: [{
      BranchId: 77,
      BranchName: 'Alias Contract Branch',
      BranchAddress: '55 Alias Road',
      City: 'Pune',
      Country: 'India',
      BranchContact: '9123456780',
      PrimaryEmail: 'alias.branch@example.com',
      Status: 'Active',
    }],
  })
  render(<OrgBranches />)
  await screen.findByText('Alias Contract Branch')
  expect(screen.getByText('55 Alias Road')).toBeInTheDocument()
  expect(screen.getByText('9123456780')).toBeInTheDocument()
  expect(screen.getByText('alias.branch@example.com')).toBeInTheDocument()
})

it('displays city and contact values nested in branch location and contact objects', async () => {
  apiClient.get.mockResolvedValue({
    data: [{
      BranchId: 79,
      BranchName: 'Nested Contract Branch',
      BranchAddress: '12 Nested Road',
      BranchLocation: { City_Name: 'Hyderabad' },
      BranchContactInfo: { Contact_Mobile: '9876543210' },
      Country: 'India',
      Email: 'nested.branch@example.com',
      Status: 'Active',
    }],
  })
  render(<OrgBranches />)
  await screen.findByText('Nested Contract Branch')
  expect(screen.getByText('Hyderabad, India')).toBeInTheDocument()
  expect(screen.getByText('9876543210')).toBeInTheDocument()
})

it('opens alternate branch contact and email field names in details and edit modal', async () => {
  const aliasBranch = {
    BranchId: 78,
    BranchName: 'Details Alias Branch',
    BranchAddress: '88 Details Road',
    City: 'Pune',
    Country: 'India',
    BranchContact: '9234567890',
    PrimaryEmail: 'details.alias@example.com',
    Status: 'Active',
  }
  apiClient.get.mockResolvedValueOnce({ data: [aliasBranch] }).mockResolvedValueOnce({ data: aliasBranch })
  render(<OrgBranches />)
  await screen.findByText('Details Alias Branch')
  fireEvent.click(screen.getByRole('button', { name: 'View branch' }))
  await screen.findByText('Branch Details')
  expect(screen.getAllByText('9234567890').length).toBeGreaterThan(0)
  expect(screen.getAllByText('details.alias@example.com').length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Edit Branch' }))
  expect(screen.getByDisplayValue('9234567890')).toBeInTheDocument()
  expect(screen.getByDisplayValue('details.alias@example.com')).toBeInTheDocument()
})

it('deletes the selected ID once, refetches, and stays absent on remount', async () => {
  apiClient.delete.mockResolvedValue({ status: 204, data: '' })
  const view = render(<OrgBranches />)
  await screen.findByText(branch.name)
  apiClient.get.mockResolvedValue({ data: [] })
  fireEvent.click(screen.getByRole('button', { name: 'Delete branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  await screen.findByText('No branches found')
  expect(apiClient.delete).toHaveBeenCalledExactlyOnceWith(`${base}/42`)
  expect(apiClient.get).toHaveBeenCalledTimes(2)
  view.unmount()
  render(<OrgBranches />)
  await screen.findByText('No branches found')
  expect(screen.queryByText(branch.name)).not.toBeInTheDocument()
})

it('keeps the row and reports the error when DELETE fails', async () => {
  apiClient.delete.mockRejectedValue(new Error('Branch has assigned employees'))
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  fireEvent.click(screen.getByRole('button', { name: 'Delete branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Branch has assigned employees'))
  expect(screen.getByText(branch.name)).toBeInTheDocument()
  expect(toast.success).not.toHaveBeenCalled()
})

it('does not report success if the post-delete refetch fails', async () => {
  apiClient.delete.mockResolvedValue({ status: 204, data: '' })
  render(<OrgBranches />)
  await screen.findByText(branch.name)
  apiClient.get.mockRejectedValue(new Error('Refresh unavailable'))
  fireEvent.click(screen.getByRole('button', { name: 'Delete branch' }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  await screen.findByText('Unable to load branches')
  expect(toast.success).not.toHaveBeenCalled()
  expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Refresh unavailable'))
})
