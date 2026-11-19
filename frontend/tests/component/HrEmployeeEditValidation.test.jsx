import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import HrApiForm from '@features/hr/components/HrApiForm'

afterEach(cleanup)
const values = { firstName: 'Mahesh', lastName: 'Mahi', email: 'mahesh@example.test', phone: '9876543210', role: 'Mentor', departmentId: 1, employmentType: 'Full-Time' }
function mount(onSave = vi.fn(), overrides = {}) {
  render(<HrApiForm operation="PUT /api/hr/employees/{employeeId}" title="Edit Employee" values={{ ...values, ...overrides }} onSave={onSave} onClose={vi.fn()} />)
  return onSave
}
it('limits mobile typing to 10 digits and identifies an invalid mobile number before saving', async () => {
  const save = mount()
  const phone = screen.getByLabelText('Mobile Number')
  fireEvent.change(phone, { target: { value: '12345642345624652' } })
  expect(phone).toHaveValue('1234564234')
  expect(phone).toHaveAttribute('maxlength', '10')
  expect(phone).toHaveAttribute('inputmode', 'numeric')
  fireEvent.click(screen.getByRole('button', { name: /^Save(?: Changes)?$/, exact: true }))
  expect(phone).toHaveAttribute('aria-invalid', 'true')
  expect(phone).toHaveAccessibleDescription(/10-digit Indian mobile number/)
  expect(phone).toHaveFocus()
  expect(save).not.toHaveBeenCalled()
  fireEvent.change(phone, { target: { value: '9876543210' } })
  expect(phone).toHaveAttribute('aria-invalid', 'false')
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('limits a long mobile paste and normalizes formatted +91 numbers without losing digits', () => {
  mount()
  const phone = screen.getByLabelText('Mobile Number')
  phone.setSelectionRange(0, phone.value.length)
  fireEvent.paste(phone, { clipboardData: { getData: () => '+91 98765 43210 99999' } })
  expect(phone).toHaveValue('9876543210')
  fireEvent.change(phone, { target: { value: 'abc98765-43210xyz999' } })
  expect(phone).toHaveValue('9876543210')
})

it('provides employee field placeholders and limits long name and designation input', () => {
  mount()
  expect(screen.getByLabelText('First Name')).toHaveAttribute('placeholder', 'Enter first name')
  expect(screen.getByLabelText('Mobile Number')).toHaveAttribute('placeholder', 'Enter 10-digit mobile number')
  fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'a'.repeat(80) } })
  expect(screen.getByLabelText('First Name')).toHaveValue('a'.repeat(50))
  fireEvent.change(screen.getByLabelText('Designation'), { target: { value: 'a'.repeat(120) } })
  expect(screen.getByLabelText('Designation')).toHaveValue('a'.repeat(100))
})
it('identifies invalid or missing names without hiding the entered values', () => {
  const save = mount(undefined, { firstName: 'Mahesh123', lastName: '' })
  fireEvent.click(screen.getByRole('button', { name: /^Save(?: Changes)?$/, exact: true }))
  expect(screen.getByLabelText('First Name')).toHaveValue('Mahesh123')
  expect(screen.getByLabelText('First Name')).toHaveAccessibleDescription(/letters/)
  expect(screen.getByLabelText('Last Name')).toHaveAccessibleDescription('Enter last name.')
  expect(screen.getByLabelText('First Name')).toHaveFocus()
  expect(save).not.toHaveBeenCalled()
})
it('places backend PascalCase field errors beside their inputs and preserves form values', async () => {
  const save = vi.fn().mockRejectedValue({ response: { status: 422, data: { errors: { 'employee.FirstName': ['This first name is not allowed.'], Phone: ['This mobile number is already registered.'] } } } })
  mount(save)
  fireEvent.click(screen.getByRole('button', { name: /^Save(?: Changes)?$/, exact: true }))
  await waitFor(() => expect(screen.getByLabelText('Mobile Number')).toHaveAccessibleDescription('This mobile number is already registered.'))
  expect(screen.getByLabelText('First Name')).toHaveAccessibleDescription('This first name is not allowed.')
  expect(screen.getByLabelText('First Name')).toHaveFocus()
  expect(screen.getByLabelText('First Name')).toHaveValue('Mahesh')
  expect(screen.queryByText('Please check the entered values and try again.')).not.toBeInTheDocument()
})
it('trims names and accepts a formatted Indian mobile number in the saved DTO', async () => {
  const save = mount(vi.fn().mockResolvedValue({}), { firstName: ' Mahesh ', phone: '+91 98765 43210' })
  fireEvent.click(screen.getByRole('button', { name: /^Save(?: Changes)?$/, exact: true }))
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Mahesh', phone: '9876543210' })))
})
