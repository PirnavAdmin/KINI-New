import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import { loadHrStudentRoster, summarizeHrStudents } from '@features/hr/services/hrStudentRoster'
import apiClient from '@shared/services/apiClient'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

const roster = Array.from({ length: 14 }, (_, index) => ({ studentId: index + 1, fullName: `Student ${index + 1}`, status: index < 8 ? 'Active' : index < 13 ? 'Pending approval' : 'Inactive' }))

it('accounts for the remaining student in a 14 / 8 / 5 roster', () => {
  expect(summarizeHrStudents(roster)).toEqual({ totalStudents: 14, activeStudents: 8, pendingStudents: 5, inactiveStudents: 1, completedStudents: 0, otherStudents: 0 })
  expect(summarizeHrStudents([{ status: ' ACTIVE ' }, { status: 'pending-approval' }, {}, { status: 'Rejected' }])).toMatchObject({ totalStudents: 4, activeStudents: 1, pendingStudents: 1, otherStudents: 2 })
})

it('reads all pages even when the server caps page size and deduplicates students', async () => {
  const api = { list: vi.fn().mockResolvedValueOnce({ items: roster.slice(0, 10), totalCount: 14 }).mockResolvedValueOnce({ items: roster.slice(9), totalCount: 14 }) }
  expect(await loadHrStudentRoster(api, { Status: 'Active' })).toEqual(roster)
  expect(api.list.mock.calls[1][0]).toMatchObject({ PageNumber: 2, Status: 'Active' })
})

it('does not publish partial totals when a later page fails or pagination repeats', async () => {
  const api = { list: vi.fn().mockResolvedValueOnce({ items: roster.slice(0, 10), totalCount: 14 }).mockRejectedValueOnce(new Error('offline')) }
  await expect(loadHrStudentRoster(api, {})).rejects.toThrow('offline')
  api.list.mockResolvedValue({ items: roster.slice(0, 10), totalCount: 14 })
  await expect(loadHrStudentRoster(api, {})).rejects.toThrow('did not advance')
})

it('searches course names across all pages without relying on backend Search', async () => {
  const records = Array.from({ length: 100 }, (_, i) => ({ studentId: i + 1, fullName: `Learner ${i}`, courseName: 'Java' }))
  const api = { list: vi.fn().mockResolvedValueOnce({ items: records, totalPages: 2 }).mockResolvedValueOnce({ items: [{ studentId: 101, fullName: 'Python Learner', courseName: 'Python Full Stack' }], totalPages: 2 }) }
  const result = await loadHrStudentRoster(api, { Search: '  PYTHON   full ', Status: 'Active' })
  expect(result.map(row => row.studentId)).toEqual([101])
  expect(api.list.mock.calls[0][0]).not.toHaveProperty('Search')
  expect(api.list.mock.calls[1][0]).toMatchObject({ Status: 'Active', PageNumber: 2 })
})

it('keeps cards, filters, pagination and refreshed statuses in sync without the separate summary', async () => {
  let records = roster.map(row => ({ ...row }))
  apiClient.request.mockImplementation(({ url, params }) => {
    if (url !== '/api/students') throw new Error('Unexpected summary request')
    const filtered = records.filter(row => !params.Status || row.status === params.Status)
    const start = (params.PageNumber - 1) * 10
    return Promise.resolve({ data: { items: filtered.slice(start, start + 10), totalCount: filtered.length }, config: {}, status: 200 })
  })
  render(<MemoryRouter><HrApiModule module="students" /></MemoryRouter>)
  // Each term and its value share a card; verify the displayed counts.
  const count = label => screen.getByText(label, { selector: '.kini-kpi__label' }).parentElement.querySelector('.kini-kpi__value').textContent
  await screen.findByText('Total Students', { selector: '.kini-kpi__label' })
  await waitFor(() => expect(count('Total Students')).toBe('14'))
  expect(count('Active Students')).toBe('8')
  expect(count('Pending Students')).toBe('5')
  fireEvent.click(screen.getByRole('button', { name: 'Next page', exact: true }))
  await screen.findByText('Student 14')
  expect(count('Total Students')).toBe('14')
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'Active' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search', exact: true }))
  await screen.findByText('Student 1', { exact: true })
  expect(count('Total Students')).toBe('8')
  records[0].status = 'Inactive'
  fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
  await waitFor(() => expect(count('Total Students')).toBe('7'))
})

it('shows matching course students and updates totals when course text is searched', async () => {
  const records = [
    { studentId: 1, fullName: 'Python Learner', email: 'one@example.com', courseName: 'Python', status: 'Active' },
    { studentId: 2, fullName: 'Java Learner', email: 'two@example.com', courseName: 'Java', status: 'Inactive' },
  ]
  apiClient.request.mockImplementation(async ({ params }) => ({ data: { items: params.Search ? [] : records, totalCount: params.Search ? 0 : 2 }, status: 200 }))
  render(<MemoryRouter><HrApiModule module="students" /></MemoryRouter>)
  await screen.findByText('Java Learner')
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'PYTHON' } })
  fireEvent.click(screen.getByRole('button', { name: 'Search', exact: true }))
  await waitFor(() => expect(screen.queryByText('Java Learner')).not.toBeInTheDocument())
  expect(await screen.findByText('Python Learner')).toBeInTheDocument()
  expect(screen.getByText('Total Students', { selector: '.kini-kpi__label' }).parentElement.querySelector('.kini-kpi__value')).toHaveTextContent('1')
})

it.each(['Active', 'Pending', 'Inactive', 'Rejected'])('changes student status to %s through the dialog', async status => {
  let current = 'Active'
  apiClient.request.mockImplementation(async request => {
    if (request.method === 'PATCH') {
      current = request.data.status
      return { data: { success: true }, status: 200 }
    }
    return { data: { items: [{ studentId: 24, fullName: 'Student One', status: current }], totalCount: 1 }, status: 200 }
  })
  render(<MemoryRouter><HrApiModule module="students" /></MemoryRouter>)
  await screen.findByText('Student One')
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Change Status' }))
  const dialog = await screen.findByRole('dialog', { name: 'Change Status' })
  const select = within(dialog).getByRole('combobox', { name: 'Status' })
  expect(select).toHaveValue('Active')
  expect(within(select).queryByRole('option', { name: 'Completed' })).not.toBeInTheDocument()
  fireEvent.change(select, { target: { value: status } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save', exact: true }))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PATCH', url: '/api/students/24/status', data: { status } })))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})
