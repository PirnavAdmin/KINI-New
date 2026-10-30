import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { HRSyllabusWorkspace } from '@features/syllabus/pages/EmployeeSyllabus'
import { courseService } from '@shared/services/courseService'
import { batchService } from '@shared/services/batchService'

const permissions = vi.hoisted(() => ({ add: true }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ can: () => permissions.add }) }))
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default: () => ({ isHrUser: true, isLoading: false }) }))
vi.mock('@features/syllabus/pages/AssignedSyllabus', () => ({ default: () => <p>Personal syllabus</p> }))
vi.mock('@shared/services/courseService', () => ({ courseService: { getCourses: vi.fn(), getSyllabus: vi.fn(), createSyllabus: vi.fn() } }))
vi.mock('@shared/services/batchService', () => ({ batchService: { getAll: vi.fn(), getById: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  permissions.add = true
  courseService.getCourses.mockResolvedValue({ data: [{ courseId: 7, courseName: 'Java Full Stack' }], totalPages: 1 })
  batchService.getAll.mockResolvedValue({ data: [{ batchId: 3, batchName: 'Java September', courseId: 7 }], totalPages: 1 })
  courseService.getSyllabus.mockResolvedValue({ modules: [] })
  courseService.createSyllabus.mockResolvedValue({})
})
afterEach(cleanup)

it('creates a course syllabus through the existing API and displays the saved modules', async () => {
  render(<HRSyllabusWorkspace />)
  fireEvent.change(await screen.findByLabelText('Course'), { target: { value: '7' } })
  fireEvent.click(await screen.findByRole('button', { name: 'Add Syllabus' }))
  expect(screen.getByLabelText('Course')).toBeDisabled()
  fireEvent.change(screen.getByLabelText('Module name *'), { target: { value: 'Java basics' } })
  fireEvent.change(screen.getByLabelText('Topic name *'), { target: { value: 'Variables' } })
  // The lesson editor's table has two inputs after the module/topic fields.
  const fields = screen.getAllByRole('textbox')
  fireEvent.change(fields[5], { target: { value: 'Primitive types' } })
  courseService.getSyllabus.mockResolvedValue({ modules: [{ moduleName: 'Java basics', topics: [{ topicName: 'Variables', lessons: [{ lessonName: 'Primitive types' }] }] }] })
  fireEvent.click(screen.getByRole('button', { name: 'Save Syllabus' }))
  await waitFor(() => expect(courseService.createSyllabus).toHaveBeenCalledWith('7', expect.objectContaining({ modules: [expect.objectContaining({ moduleName: 'Java basics', topics: [expect.objectContaining({ topicName: 'Variables', lessons: [expect.objectContaining({ lessonName: 'Primitive types' })] })] })] })))
  expect(await screen.findByText('Module 1: Java basics')).toBeInTheDocument()
  await waitFor(() => expect(screen.getByLabelText('Course')).not.toBeDisabled())
})

it('opens a batch syllabus using its linked course ID, not the batch ID', async () => {
  render(<HRSyllabusWorkspace />)
  await screen.findByLabelText('Course')
  fireEvent.click(screen.getByRole('button', { name: 'By batch' }))
  fireEvent.change(screen.getByLabelText('Batch'), { target: { value: '3' } })
  await screen.findByRole('button', { name: 'Add Syllabus' })
  expect(courseService.getSyllabus).toHaveBeenCalledWith(7)
  expect(courseService.getSyllabus).not.toHaveBeenCalledWith(3)
})

it('loads missing course identity from batch details and shows errors without inventing a course', async () => {
  batchService.getAll.mockResolvedValue({ data: [{ batchId: 3, batchName: 'Unlinked batch' }] })
  batchService.getById.mockResolvedValue({ batchId: 3 })
  render(<HRSyllabusWorkspace />)
  await screen.findByLabelText('Course')
  fireEvent.click(screen.getByRole('button', { name: 'By batch' }))
  fireEvent.change(screen.getByLabelText('Batch'), { target: { value: '3' } })
  expect(await screen.findByRole('alert')).toHaveTextContent('no linked course')
  expect(courseService.getSyllabus).not.toHaveBeenCalled()
})

it('does not show Add Syllabus without Add permission', async () => {
  permissions.add = false
  render(<HRSyllabusWorkspace />)
  fireEvent.change(await screen.findByLabelText('Course'), { target: { value: '7' } })
  await screen.findByText('No syllabus added yet')
  expect(screen.queryByRole('button', { name: 'Add Syllabus' })).not.toBeInTheDocument()
  expect(courseService.createSyllabus).not.toHaveBeenCalled()
})

it('shows course lookup failures instead of offering demo data', async () => {
  courseService.getCourses.mockRejectedValue(new Error('Offline'))
  render(<HRSyllabusWorkspace />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load courses')
  expect(screen.queryByLabelText('Course')).not.toBeInTheDocument()
})

it('loads courses beyond the first page', async () => {
  courseService.getCourses.mockResolvedValueOnce({ data: [{ courseId: 7, courseName: 'Java Full Stack' }], totalPages: 2 }).mockResolvedValueOnce({ data: [{ courseId: 8, courseName: 'Python' }], totalPages: 2 })
  render(<HRSyllabusWorkspace />)
  expect(await screen.findByRole('option', { name: 'Python' })).toBeInTheDocument()
  expect(courseService.getCourses).toHaveBeenCalledWith({ page: 2, pageSize: 100 })
})
