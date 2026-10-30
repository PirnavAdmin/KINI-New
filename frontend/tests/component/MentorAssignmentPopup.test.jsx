import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import TutorAssignmentWizard from '@/pages/trainers/TutorAssignmentWizard'
import { tutorService } from '@shared/services/tutorService'
vi.mock('@shared/services/tutorService', () => ({ tutorService: { courses: vi.fn(), batches: vi.fn(), assign: vi.fn() } }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('shows course batches and submits the batch ID rather than its course ID', async () => {
  tutorService.courses.mockResolvedValue([{ courseId: 4, courseName: 'Python' }])
  tutorService.batches.mockResolvedValue([{ batchId: 19, courseId: 4, batchName: 'Python Morning' }])
  tutorService.assign.mockResolvedValue({ success: true })
  render(<TutorAssignmentWizard tutor={{ id: 8, name: 'Test Mentor' }} onClose={vi.fn()} onComplete={vi.fn()} />)
  await screen.findByRole('option', { name: 'Python' })
  fireEvent.change(screen.getByLabelText('1. Course'), { target: { value: '4' } })
  const batch = await screen.findByRole('option', { name: 'Python Morning' })
  expect(batch).toHaveValue('19')
  fireEvent.change(screen.getByLabelText('2. Batch'), { target: { value: '19' } })
  fireEvent.click(screen.getByRole('button', { name: 'Confirm assignment' }))
  await waitFor(() => expect(tutorService.assign).toHaveBeenCalledWith({ tutorId: 8, courseId: 4, batchId: 19 }))
})
it('displays a batch loading error instead of silently showing an empty list', async () => {
  tutorService.courses.mockResolvedValue([{ courseId: 4, courseName: 'Python' }])
  tutorService.batches.mockRejectedValue(new Error('Batch service unavailable'))
  render(<TutorAssignmentWizard tutor={{ id: 8, name: 'Test Mentor' }} onClose={vi.fn()} onComplete={vi.fn()} />)
  await screen.findByRole('option', { name: 'Python' })
  fireEvent.change(screen.getByLabelText('1. Course'), { target: { value: '4' } })
  expect(await screen.findByRole('alert')).toHaveTextContent('Batch service unavailable')
})
