import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import HrApiForm from '@features/hr/components/HrApiForm'

afterEach(cleanup)

function mount(values, operation = 'PUT /api/hr/attendance/{attendanceId}') {
  const save = vi.fn().mockResolvedValue(undefined)
  render(<HrApiForm operation={operation} title="Edit Attendance" values={values} onSave={save} onClose={vi.fn()} />)
  return save
}

it.each([null, '', '   '])('blocks Present without a check-out time (%s)', checkOut => {
  const save = mount({ status: 'PRESENT', checkIn: '05:46 PM', checkOut })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(screen.getByRole('alert')).toHaveTextContent('enter a check-out time before saving attendance as Present')
  expect(save).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Check In')).toHaveValue('05:46 PM')
})

it('allows retry after supplying the missing check-out time', async () => {
  const save = mount({ status: 'Present', checkIn: '09:00 AM', checkOut: '' })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  fireEvent.change(screen.getByLabelText('Check Out'), { target: { value: '06:00 PM' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(save).toHaveBeenCalledWith({ status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' }))
})

it('allows Pending without a check-out time', async () => {
  const save = mount({ status: 'PENDING', checkIn: '09:00 AM' })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(save).toHaveBeenCalledWith({ status: 'PENDING', checkIn: '09:00 AM', checkOut: null }))
})

it('also blocks marking attendance as Present without check-out', () => {
  const save = mount({ employeeId: '42', date: '2026-11-13', status: 'Present', checkIn: '09:00 AM' }, 'POST /api/hr/attendance/mark')
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(screen.getByText(/enter a check-out time/)).toBeInTheDocument()
  expect(save).not.toHaveBeenCalled()
})

it('offers employee IDs and names in an attendance dropdown', async () => {
  const save = vi.fn().mockResolvedValue(undefined)
  render(<HrApiForm operation="POST /api/hr/attendance/mark" title="Add Attendance" values={{ date: '2026-11-13', status: 'Pending' }} options={{ employees: [{ value: 42, label: 'Mahesh Mahi' }, { value: 53, label: 'Sindhu' }] }} onSave={save} onClose={vi.fn()} />)
  const select = screen.getByRole('combobox', { name: 'Employee ID' })
  expect(screen.getByRole('option', { name: '42 - Mahesh Mahi' })).toBeInTheDocument()
  fireEvent.change(select, { target: { value: '42' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ employeeId: '42' })))
})
