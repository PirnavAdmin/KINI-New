import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import BatchDetails from '@features/hr/pages/BatchDetails'
import EmployeeBatches from '@features/employee/pages/EmployeeBatches'
import apiClient from '@shared/services/apiClient'
import { batchService } from '@shared/services/batchService'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { batchIdOf, loadHrBatchDetails } from '@features/hr/services/hrBatchDetails'
vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn() } }))
vi.mock('@shared/services/batchService', () => ({ batchService: { getSummary: vi.fn().mockResolvedValue({}), getAll: vi.fn(), getById: vi.fn(), getStudents: vi.fn(), remove: vi.fn() } }))
vi.mock('@features/live-classes/services/liveClassService', () => ({ liveClassService: { list: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: (_module, action) => action in hrBatchPermissions ? hrBatchPermissions[action] : true, isLoading: false }) }))
const hrBatchPermissions = vi.hoisted(() => ({ edit: true, delete: true }))
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default: () => ({ isHrUser: false, can: () => false }) }))
vi.mock('@features/employee/hooks/useEmployeeTotal', () => ({ default: () => 0 }))
vi.mock('@features/organization/pages/BatchManagement', () => ({ default: ({ initialBatch }) => <div role="dialog">Edit batch {initialBatch?.batchId}</div> }))
const names = ['AL&ML 1', '.Net 1', 'Devops 1', 'nodejs 1', 'Java Full Stack 1', 'React js 1']
const batches = names.map((batchName, i) => ({ batchId: 101 + i, batchName, courseName: 'Course ' + i, status: i === 0 ? 'Active' : 'Upcoming', batchType: 'Online', startDate: '2026-09-01' }))
beforeEach(() => {
  vi.clearAllMocks()
  hrBatchPermissions.edit = true
  hrBatchPermissions.delete = true
  HTMLElement.prototype.scrollTo = vi.fn()
  batchService.getById.mockImplementation((id, { signal }) => apiClient.get('/api/v1/organization/batches/' + id, { signal }))
  batchService.getStudents.mockImplementation((id, { signal }) => apiClient.get('/api/StudentBatch/' + id + '/students', { signal }))
  batchService.getAll.mockResolvedValue({ data: batches, totalPages: 1, totalRecords: 6 })
  apiClient.get.mockImplementation(url => {
    const id = Number(url.split('/').at(url.includes('StudentBatch') ? -2 : -1))
    const batch = batches.find(b => b.batchId === id)
    if (!batch) return Promise.reject({ response: { status: 404 } })
    return Promise.resolve({ data: url.includes('StudentBatch') ? { batchId: id, students: [] } : batch })
  })
  liveClassService.list.mockResolvedValue([])
})
afterEach(cleanup)
function app(path = '/employee/batches') {
  return render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/employee/batches" element={<EmployeeBatches />} /><Route path="/employee/batches/:batchId" element={<BatchDetails />} /></Routes></MemoryRouter>)
}
it.each(names)('opens the correct backend ID for %s', async name => {
  app()
  const heading = await screen.findByRole('heading', { name })
  fireEvent.click(within(heading.closest('article')).getByRole('button', { name: 'View Details', exact: true }))
  await screen.findByRole('heading', { name, level: 1 })
  const id = batches.find(b => b.batchName === name).batchId
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organization/batches/' + id, expect.anything())
  expect(screen.getByLabelText('Breadcrumb')).toHaveTextContent(name)
})
it('switches batches without retaining old data', async () => {
  app('/employee/batches/101')
  await screen.findByRole('heading', { name: names[0], level: 1 })
  fireEvent.click(screen.getByRole('link', { name: 'Back to Batches' }))
  const heading = await screen.findByRole('heading', { name: names[5] })
  fireEvent.click(within(heading.closest('article')).getByRole('button', { name: 'View Details' }))
  await screen.findByRole('heading', { name: names[5], level: 1 })
  expect(screen.queryByRole('heading', { name: names[0] })).not.toBeInTheDocument()
})
it('shows skeletons before a response, then missing metrics and true empty states', async () => {
  let resolve
  apiClient.get.mockReturnValueOnce(new Promise(done => { resolve = done }))
  app('/employee/batches/101')
  expect(screen.getByRole('status', { name: 'Loading batch details' })).toBeInTheDocument()
  expect(screen.queryByText('Batch Not Found')).not.toBeInTheDocument()
  resolve({ data: batches[0] })
  await screen.findByRole('heading', { name: names[0] })
  expect(screen.getByText('Attendance').parentElement).toHaveTextContent('\u2014')
  expect(screen.getByText('Capacity').parentElement).toHaveTextContent('\u2014')
  fireEvent.click(screen.getByRole('tab', { name: 'Students' }))
  expect(screen.getByText('No students enrolled in this batch.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Sessions' }))
  expect(screen.getByText('No sessions have been scheduled for this batch yet.')).toBeInTheDocument()
})
it('handles 404, request errors and retry', async () => {
  const view = app('/employee/batches/999')
  await screen.findByText('Batch Not Found')
  view.unmount()
  apiClient.get.mockRejectedValueOnce(new Error('Network error'))
  app('/employee/batches/101')
  await screen.findByText('Unable to load batch details')
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  await screen.findByRole('heading', { name: names[0] })
})
it('rejects incorrect batch identity and keeps absent IDs absent', async () => {
  apiClient.get.mockResolvedValueOnce({ data: batches[1] })
  await expect(loadHrBatchDetails('101')).rejects.toThrow('unexpected batch')
  expect(batchIdOf({ BatchId: 101 })).toBe(101)
  expect(batchIdOf({ batchId: '', id: 42 })).toBe(42)
  expect(batchIdOf({ batchCode: 'B001' })).toBeUndefined()
})
it('renders raw student values and only sessions of the selected batch', async () => {
  apiClient.get.mockImplementation(url => Promise.resolve({ data: url.includes('StudentBatch') ? { batchId: 101, students: [{ studentId: 44, name: 'Student Forty Four', email: '44@example.com' }] } : batches[0] }))
  liveClassService.list.mockResolvedValue([{ id: 1, batchId: 101, title: 'Own session', status: 'Scheduled' }, { id: 2, batchId: 106, title: 'Other session' }])
  app('/employee/batches/101')
  await screen.findByRole('heading', { name: names[0] })
  fireEvent.click(screen.getByRole('tab', { name: 'Students' }))
  const row = screen.getByText('Student Forty Four').closest('tr')
  expect(within(row).getAllByText('\u2014')).toHaveLength(3)
  expect(within(row).getByRole('link')).toHaveAttribute('href', '/employee/students/44')
  fireEvent.click(screen.getByRole('tab', { name: 'Sessions' }))
  expect(screen.getByText('Own session')).toBeInTheDocument()
  expect(screen.queryByText('Other session')).not.toBeInTheDocument()
})
it('does not report failed roster requests as an empty roster', async () => {
  apiClient.get.mockImplementation(url => url.includes('StudentBatch') ? Promise.reject(new Error()) : Promise.resolve({ data: batches[0] }))
  app('/employee/batches/101')
  await screen.findByRole('heading', { name: names[0] })
  fireEvent.click(screen.getByRole('tab', { name: 'Students' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Unable to load enrolled students')
  expect(screen.queryByText('No students enrolled in this batch.')).not.toBeInTheDocument()
})
it('opens editing and manages students on the same batch page', async () => {
  app('/employee/batches/106')
  await screen.findByRole('heading', { name: names[5] })
  fireEvent.click(screen.getByRole('button', { name: 'Edit Batch' }))
  expect(screen.getByRole('dialog')).toHaveTextContent('Edit batch 106')
  fireEvent.click(screen.getByRole('button', { name: 'Manage Students' }))
  expect(screen.getByRole('tab', { name: 'Students' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('heading', { name: names[5], level: 1 })).toBeInTheDocument()
  expect(screen.getByText('No students enrolled in this batch.')).toBeInTheDocument()
  expect(screen.queryByText('Join Batch')).not.toBeInTheDocument()
})

it('searches batches using a normalized mentor full name', async () => {
  const mentorBatch = { batchId: 201, batchName: 'Ravi Cohort', courseName: 'Course', mentor: { firstName: 'Ravi', lastName: 'Kumar' }, status: 'Active', startDate: '2026-09-01' }
  batchService.getAll.mockResolvedValue({ data: [mentorBatch], totalPages: 1, totalRecords: 1 })
  app()
  await screen.findByRole('heading', { name: 'Ravi Cohort' })
  fireEvent.change(screen.getByRole('textbox', { name: 'Search batches' }), { target: { value: '  Ravi   Kumar  ' } })
  await screen.findByRole('heading', { name: 'Ravi Cohort' })
  expect(await screen.findByText('Ravi Kumar')).toBeInTheDocument()
  await waitFor(() => expect(batchService.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Ravi Kumar', pageNumber: 1 })))
})

it('shows Edit and Delete Batch only when the HR user has each explicit permission', async () => {
  app()
  await screen.findByRole('heading', { name: names[0] })
  expect(screen.getAllByRole('button', { name: 'Edit Batch' }).length).toBeGreaterThan(0)
  expect(screen.getAllByRole('button', { name: 'Delete Batch' }).length).toBeGreaterThan(0)
  fireEvent.click(screen.getAllByRole('button', { name: 'Edit Batch' })[0])
  expect(await screen.findByRole('dialog')).toHaveTextContent('Edit batch 101')
  cleanup()
  hrBatchPermissions.edit = false
  hrBatchPermissions.delete = true
  app()
  await screen.findByRole('heading', { name: names[0] })
  expect(screen.queryByRole('button', { name: 'Edit Batch' })).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Delete Batch' }).length).toBeGreaterThan(0)
  hrBatchPermissions.edit = true
})

it('finds a full mentor name on later pages when API search does not search mentors', async () => {
  const mentorBatch = { ...batches[0], mentor: { firstName: 'Ravi', lastName: 'Kumar' } }
  batchService.getAll.mockImplementation(async ({ search, pageNumber }) => {
    if (search) return { data: [], totalPages: 1 }
    return { data: pageNumber === 2 ? [mentorBatch] : [batches[1]], totalPages: 2 }
  })
  app()
  await screen.findByRole('heading', { name: names[1] })
  fireEvent.change(screen.getByRole('textbox', { name: 'Search batches' }), { target: { value: '  RAVI   Kumar ' } })
  await screen.findByRole('heading', { name: names[0] })
  expect(screen.getByText('Ravi Kumar')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: names[1] })).not.toBeInTheDocument()
  expect(batchService.getAll).toHaveBeenCalledWith({ pageNumber: 2, pageSize: 100 })
})

it('exposes permitted edit and delete actions in the batch menu and deletes the selected ID', async () => {
  batchService.remove.mockResolvedValue({})
  app()
  await screen.findByRole('heading', { name: names[0] })
  fireEvent.click(screen.getByRole('button', { name: 'More actions for ' + names[0] }))
  expect(screen.getByRole('menuitem', { name: 'Edit batch' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('menuitem', { name: 'Delete batch' }))
  fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete Batch' }))
  await waitFor(() => expect(batchService.remove).toHaveBeenCalledWith(101))
})

it('Manage Batch navigates to the selected batch details instead of joining it', async () => {
  app()
  const heading = await screen.findByRole('heading', { name: names[0] })
  fireEvent.click(within(heading.closest('article')).getByRole('button', { name: /Manage Batch/ }))
  await screen.findByRole('heading', { name: names[0], level: 1 })
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/organization/batches/101', expect.anything())
  expect(screen.queryByText(/Joining /)).not.toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Students' })).toHaveAttribute('aria-selected', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Manage Students' }))
  expect(screen.getByRole('heading', { name: names[0], level: 1 })).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('restores the management tab from its URL', async () => {
  app('/employee/batches/101?tab=students')
  await screen.findByRole('heading', { name: names[0], level: 1 })
  expect(screen.getByRole('tab', { name: 'Students' })).toHaveAttribute('aria-selected', 'true')
})

it('redirects old management history to the batch page without opening a preview', async () => {
  app({ pathname: '/employee/batches', state: { manageBatch: { id: 101 } } })
  await screen.findByRole('heading', { name: names[0], level: 1 })
  expect(screen.getByRole('tab', { name: 'Students' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.queryByText('Join Batch')).not.toBeInTheDocument()
})

it('keeps server-paginated results accessible on the next page', async () => {
  batchService.getAll.mockImplementation(async ({ pageNumber }) => ({ data: pageNumber === 2 ? [batches[5]] : batches.slice(0, 5), totalPages: 2, totalRecords: 7 }))
  app()
  await screen.findByRole('heading', { name: names[0] })
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  await screen.findByRole('heading', { name: names[5] })
  expect(screen.getByText('Showing 7-7 of 7 batches')).toBeInTheDocument()
})

it('uses organization summary totals instead of counting the current page', async () => {
  batchService.getSummary.mockResolvedValueOnce({ totalBatches: 40, activeBatches: 30, completedBatches: 8, upcomingBatches: 2 })
  app()
  await screen.findByRole('heading', { name: names[0] })
  expect(batchService.getSummary).toHaveBeenCalled()
  expect(screen.getByText('Total Batches').parentElement).toHaveTextContent('40')
  expect(screen.getByText('Active Batches').parentElement).toHaveTextContent('30')
})

it('keeps existing service defaults while raw detail reads preserve missing values', async () => {
  const { batchService: actual } = await vi.importActual('@shared/services/batchService')
  apiClient.get.mockResolvedValue({ data: { batchId: 101, batchName: 'AL&ML 1' } })
  expect((await actual.getById(101)).capacity).toBe(25)
  expect((await actual.getById(101, { raw: true })).capacity).toBeUndefined()
  apiClient.get.mockResolvedValue({ data: { batchId: 101, students: [{ studentId: 44 }] } })
  const normalized = await actual.getStudents(101)
  expect(normalized.students[0].attendance).toBe(0)
  const raw = await actual.getStudents(101, { raw: true })
  expect(raw.students[0].attendance).toBeUndefined()
  expect(raw.students[0].status).toBeUndefined()
})
