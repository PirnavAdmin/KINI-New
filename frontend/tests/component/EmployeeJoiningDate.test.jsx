import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import EmployeeFormModal from '@features/organization/components/EmployeeFormModal'
import { employeeService } from '@shared/services/employeeService'
import { employeeJoiningDate, joiningDateError } from '@shared/utils/employeeJoiningDate'

vi.mock('@shared/services/employeeService', () => ({ employeeService: { createEmployee: vi.fn() } }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

it('preserves the selected calendar day and rejects invalid dates', () => {
  expect(employeeJoiningDate('2026-11-13')).toBe('2026-11-13T00:00:00.000Z')
  expect(employeeJoiningDate('')).toBeNull()
  expect(joiningDateError('2026-02-30')).toBe('Select a valid joining date.')
  expect(joiningDateError('2028-02-29')).toBe('')
})

it.each(['mentor', 'hr'])('saves the joining date from the organization %s employee form', async role => {
  employeeService.createEmployee.mockResolvedValue({})
  render(<EmployeeFormModal open onClose={vi.fn()} onCreated={vi.fn()} />)
  for (const [label, value] of [['First Name', 'Luna'], ['Last Name', 'Grace'], ['Email', 'luna@example.test'], ['Phone', '9876543210']]) {
    fireEvent.change(screen.getByText(label, { selector: 'label' }).parentElement.querySelector('input'), { target: { value } })
  }
  fireEvent.click(screen.getByRole('button', { name: /Select Role/ }))
  fireEvent.click(screen.getByRole('option', { name: role === 'mentor' ? 'Mentor' : 'HR', exact: true }))
  fireEvent.change(screen.getByLabelText('Joining Date'), { target: { value: '2026-11-13' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create Employee' }))
  await waitFor(() => expect(employeeService.createEmployee).toHaveBeenCalledWith(expect.objectContaining({ joiningDate: '2026-11-13T00:00:00.000Z', role })))
})
