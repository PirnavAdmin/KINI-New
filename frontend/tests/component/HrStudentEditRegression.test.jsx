import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import HrApiForm from '@features/hr/components/HrApiForm'

afterEach(cleanup)
const values = { firstName: 'First', lastName: 'Student', email: 'student@example.com', phone: '9999999999', courseId: 1, batchId: 2, mentorId: 3 }
function edit(onSave, onClose) {
  return render(<HrApiForm title="Edit Student" operation="PUT /api/students/{studentId}" values={values} onSave={onSave} onClose={onClose} />)
}

it('closes an unchanged edit without making a save request', async () => {
  const save = vi.fn().mockRejectedValue({ response: { status: 404 } })
  const close = vi.fn()
  edit(save, close)
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  expect(close).toHaveBeenCalledOnce()
  expect(save).not.toHaveBeenCalled()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('saves changed fields and preserves relationship IDs', async () => {
  const save = vi.fn().mockResolvedValue({})
  const close = vi.fn()
  edit(save, close)
  fireEvent.change(screen.getByRole('textbox', { name: 'First Name' }), { target: { value: 'Updated' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(close).toHaveBeenCalledOnce())
  expect(save).toHaveBeenCalledWith({ ...values, firstName: 'Updated' })
})

it('keeps the form open when a changed save fails', async () => {
  const close = vi.fn()
  edit(vi.fn().mockRejectedValue({ response: { status: 404 } }), close)
  fireEvent.change(screen.getByRole('textbox', { name: 'First Name' }), { target: { value: 'Updated' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save', exact: true }))
  await screen.findByRole('alert')
  expect(close).not.toHaveBeenCalled()
  expect(screen.getByRole('textbox', { name: 'First Name' })).toHaveValue('Updated')
})
