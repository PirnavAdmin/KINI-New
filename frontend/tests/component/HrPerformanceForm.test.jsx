import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import HrApiForm from '@features/hr/components/HrApiForm'

afterEach(cleanup)
function form(onSave) {
  const onClose = vi.fn()
  render(<HrApiForm title="Add Review" operation="POST /api/hr/performance" options={{ employees: [{ value: 7, label: 'Test Employee' }] }} onSave={onSave} onClose={onClose} />)
  fireEvent.change(screen.getByLabelText(/Employee ID/), { target: { value: '7' } })
  fireEvent.change(screen.getByLabelText(/Period/), { target: { value: 'October 2026' } })
  fireEvent.change(screen.getByLabelText(/Performance Score/), { target: { value: '85.5' } })
  fireEvent.change(screen.getByLabelText(/Target Completion/), { target: { value: '90' } })
  return onClose
}
it('sends valid decimal scores with the selected string employee ID', async () => {
  const save = vi.fn().mockResolvedValue({})
  const close = form(save)
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(close).toHaveBeenCalledOnce())
  expect(save).toHaveBeenCalledWith(expect.objectContaining({ employeeId: '7', period: 'October 2026', performanceScore: 85.5, targetCompletion: 90 }))
})
it('identifies an invalid target completion before sending a request', async () => {
  const save = vi.fn()
  form(save)
  fireEvent.change(screen.getByLabelText(/Target Completion/), { target: { value: '101' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Target Completion: enter a value from 0 to 100.')
  expect(save).not.toHaveBeenCalled()
})
it('displays the backend validation field and keeps the input after rejection', async () => {
  const close = form(vi.fn().mockRejectedValue({ response: { status: 400, data: { errors: { Period: ['A review already exists for this period.'] } } } }))
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Period: A review already exists for this period.')
  expect(screen.getByLabelText(/Period/)).toHaveValue('October 2026')
  expect(close).not.toHaveBeenCalled()
})
