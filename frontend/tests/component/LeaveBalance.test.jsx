import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import LeaveBalance from '@features/hr/components/LeaveBalance'
import { loadEmployeeLeaveBalance } from '@features/hr/services/hrEmployeeLeaveData'
vi.mock('@features/hr/services/hrEmployeeLeaveData', () => ({ loadEmployeeLeaveBalance: vi.fn() }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('resolves the public code, renders zero balances and refreshes the numeric employee', async () => {
  loadEmployeeLeaveBalance.mockResolvedValue({ items: [{ leaveType: 'SICK', allotted: 12, used: 1, remaining: 11 }, { leaveType: 'UNPAID', allotted: 0, used: 0, remaining: 0 }] })
  render(<LeaveBalance identifier="EMP-001" employees={[{ employeeId: 'EMP-001', employeeRecordId: 42, fullName: 'Mahesh' }, { employeeId: 53, fullName: 'Sindhu' }]} />)
  await screen.findByText('SICK')
  expect(loadEmployeeLeaveBalance).toHaveBeenCalledWith('42', expect.objectContaining({ readEmployee: false }))
  expect(screen.getByRole('progressbar', { name: 'UNPAID remaining' })).toHaveAttribute('aria-valuenow', '0')
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
  await waitFor(() => expect(loadEmployeeLeaveBalance).toHaveBeenCalledTimes(2))
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '53' } })
  await waitFor(() => expect(loadEmployeeLeaveBalance).toHaveBeenLastCalledWith('53', expect.anything()))
})
it('does not request a balance without a valid employee', () => {
  render(<LeaveBalance identifier="EMP-001" />)
  expect(screen.getByText('Please select an employee.')).toBeInTheDocument()
  expect(loadEmployeeLeaveBalance).not.toHaveBeenCalled()
})
