import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
import { downloadHrFile, hrError, hrModuleApi } from '@features/hr/services/hrApi'
import { activeAnnouncements, loadDashboardAnnouncements, normalizeAnnouncementResponse } from '@features/hr/services/hrAnnouncementData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
const permission = vi.hoisted(() => ({ can: vi.fn(() => true) }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: permission.can, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, actions }) => <main>{actions}{children}</main> }))
const base = '/api/hr/announcements'
// Synthetic fixtures conform to live Swagger DTOs; these are not captured responses.
const record = { announcementId: 42, title: 'Existing announcement', content: 'Existing content', audience: 'Staff', status: 'Published', publishDate: '2026-09-01T10:20:30.123Z', expiryDate: null, createdBy: 'HR' }
const reply = data => ({ data, config: {}, status: 200 })
const page = (items, current = 1, count = items.length, pages = 1) => ({ items, page: current, limit: 10, totalCount: count, totalPages: pages })
const mount = () => render(<MemoryRouter><HrApiModule module="announcements" /></MemoryRouter>)
beforeEach(() => { permission.can.mockImplementation(() => true); HTMLElement.prototype.scrollTo = vi.fn() })
afterEach(() => { cleanup(); vi.clearAllMocks() })

function backend(initial = [record]) {
  let rows = initial.map(row => ({ ...row }))
  apiClient.request.mockImplementation(async request => {
    if (request.url === base + '/options') return reply({ audiences: ['Staff', 'Parents'], statuses: ['Published', 'Draft', 'Expired'] })
    if (request.url === base + '/summary') return reply({ totalAnnouncements: rows.length, published: rows.length, drafts: 0, expired: 0, recentlyPublished: 0 })
    if (request.method === 'POST') { const created = { ...record, ...request.data, announcementId: 73 }; rows.push(created); return reply(created) }
    if (request.method === 'PUT') { rows = rows.map(row => row.announcementId === 42 ? { ...row, ...request.data } : row); return reply(rows.find(row => row.announcementId === 42)) }
    if (request.method === 'DELETE') { rows = rows.filter(row => row.announcementId !== 42); return reply(null) }
    if (request.url === base) return reply(page(rows))
    if (request.url === base + '/42') return reply(rows.find(row => row.announcementId === 42))
    throw new Error('Unexpected request ' + request.url)
  })
}

it('uses server options, creates once with exact nullable DTO, then refreshes list and summary', async () => {
  backend([])
  mount()
  await screen.findByText('No announcements found')
  expect(within(screen.getByRole('combobox', { name: 'Audience', exact: true })).getAllByRole('option').map(item => item.textContent)).toEqual(['All', 'Staff', 'Parents'])
  fireEvent.click(screen.getByRole('button', { name: 'Add Announcement', exact: true }))
  const dialog = screen.getByRole('dialog')
  fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'New announcement' } })
  fireEvent.change(within(dialog).getByLabelText('Content'), { target: { value: 'New content' } })
  fireEvent.change(within(dialog).getByLabelText('Audience'), { target: { value: 'Parents' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
  await screen.findByText('New announcement')
  const posts = apiClient.request.mock.calls.map(([request]) => request).filter(request => request.method === 'POST')
  expect(posts).toHaveLength(1)
  expect(posts[0].data).toEqual({ title: 'New announcement', content: 'New content', audience: 'Parents', publishDate: null, expiryDate: null })
  expect(apiClient.request.mock.calls.filter(([request]) => request.url.endsWith('/summary')).length).toBeGreaterThan(1)
})

it('fetches real detail ID, PUTs preserved status and timestamps, and DELETEs only after confirmation', async () => {
  backend()
  mount()
  await screen.findByText(record.title)
  fireEvent.click(screen.getByRole('button', { name: 'Edit', exact: true }))
  const dialog = await screen.findByRole('dialog', { name: 'Edit Announcement' })
  await waitFor(() => expect(within(dialog).getByLabelText('Title')).toHaveValue(record.title))
  expect(within(dialog).getByLabelText('Status')).toHaveValue('Published')
  fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'Updated announcement' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
  await screen.findByText('Updated announcement')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET', url: base + '/42' }))
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: base + '/42', data: expect.objectContaining({ status: 'Published', publishDate: record.publishDate, expiryDate: null }) }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
  expect(apiClient.request.mock.calls.some(([request]) => request.method === 'DELETE')).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
  await screen.findByText('No announcements found')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'DELETE', url: base + '/42' }))
})

it('edits expired announcements using an explicit writable status and preserves the expiry date', async () => {
  backend([{ ...record, status: 'Expired', expiryDate: '2026-09-15T10:20:30.123Z' }])
  mount()
  await screen.findByText(record.title)
  fireEvent.click(screen.getByRole('button', { name: 'Edit', exact: true }))
  const dialog = await screen.findByRole('dialog', { name: 'Edit Announcement' })
  const status = within(dialog).getByLabelText('Status')
  expect(status).toHaveValue('')
  expect(within(status).queryByRole('option', { name: 'Expired' })).not.toBeInTheDocument()
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
  expect(await within(dialog).findByRole('alert')).toHaveTextContent('Status: select an available status.')
  expect(apiClient.request.mock.calls.some(([request]) => request.method === 'PUT')).toBe(false)
  fireEvent.change(status, { target: { value: 'Draft' } })
  fireEvent.change(within(dialog).getByLabelText('Title'), { target: { value: 'Updated expired announcement' } })
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
  await screen.findByText('Updated expired announcement')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ method: 'PUT', url: base + '/42', data: expect.objectContaining({ status: 'Draft', expiryDate: '2026-09-15T10:20:30.123Z' }) }))
})

it('keeps failures distinct from empty lists and shows options failures', async () => {
  apiClient.request.mockRejectedValue({ response: { status: 403 } })
  mount()
  await screen.findByText(/Announcement options: You do not have permission/)
  expect(screen.queryByText('No announcements found')).not.toBeInTheDocument()
})

it('uses real pagination and reuses summary/options for search and page changes', async () => {
  backend()
  const initialHandler = apiClient.request.getMockImplementation()
  apiClient.request.mockImplementation(request => request.url === base && request.method === 'GET'
    ? Promise.resolve(reply(page([{ ...record, title: `Page ${request.params.Page}` }], request.params.Page, 11, 2))) : initialHandler(request))
  mount()
  await screen.findByText('Page 1')
  fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
  await screen.findByText('Page 2')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ params: { Page: 2, Limit: 10 } }))
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), { target: { value: 'news' } })
  await screen.findByText('Page 1')
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ params: { Search: 'news', Page: 1, Limit: 10 } }))
  fireEvent.change(screen.getByLabelText('Start Date'), { target: { value: '2026-10-01' } })
  fireEvent.change(screen.getByLabelText('End Date'), { target: { value: '2026-10-02' } })
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ params: { Search: 'news', StartDate: new Date('2026-10-01T00:00:00').toISOString(), EndDate: new Date('2026-10-02T23:59:59.999').toISOString(), Page: 1, Limit: 10 } })))
  expect(apiClient.request.mock.calls.filter(([request]) => request.url.endsWith('/summary'))).toHaveLength(1)
  expect(apiClient.request.mock.calls.filter(([request]) => request.url.endsWith('/options'))).toHaveLength(1)
})

it('shows actual create validation errors and prevents an overlapping second submit', async () => {
  backend([])
  const initialHandler = apiClient.request.getMockImplementation()
  let rejectSave
  apiClient.request.mockImplementation(request => request.method === 'POST' ? new Promise((_resolve, reject) => { rejectSave = reject }) : initialHandler(request))
  mount()
  await screen.findByText('No announcements found')
  fireEvent.click(screen.getByRole('button', { name: 'Add Announcement', exact: true }))
  const dialog = screen.getByRole('dialog')
  const form = dialog.closest('form')
  fireEvent.submit(form)
  fireEvent.submit(form)
  await waitFor(() => expect(apiClient.request.mock.calls.filter(([request]) => request.method === 'POST')).toHaveLength(1))
  rejectSave({ response: { status: 422, data: { errors: { Title: ['A title is required.'] } } } })
  await within(dialog).findByText('Title: A title is required.')
  expect(within(dialog).getByRole('button', { name: 'Save' })).toBeEnabled()
})

it('hides mutations and export for a view-only user', async () => {
  permission.can.mockImplementation((_module, action) => action === 'view')
  backend()
  mount()
  await screen.findByText(record.title)
  for (const name of ['Add Announcement', 'Edit', 'Delete', 'Export']) expect(screen.queryByRole('button', { name, exact: true })).not.toBeInTheDocument()
})

it('rejects undocumented list envelopes and preserves true pagination metadata', () => {
  expect(() => normalizeAnnouncementResponse('GET', base, { data: [record] })).toThrow(/unsupported announcement list/)
  expect(normalizeAnnouncementResponse('GET', base, page([record], 2, 31, 4))).toMatchObject({ page: 2, limit: 10, totalCount: 31, totalPages: 4 })
  expect(normalizeAnnouncementResponse('GET', base + '/summary', { totalAnnouncements: 0 })).toMatchObject({ totalAnnouncements: 0, published: null })
})

it('filters unpublished, expired, invalid and future announcements and sorts active records newest first', () => {
  const now = Date.parse('2026-10-02T12:00:00Z')
  const rows = [record, { ...record, announcementId: 2, publishDate: '2026-10-01T12:00:00Z' }, ...['Draft', 'Archived', 'Expired', null].map(status => ({ ...record, status })), { ...record, publishDate: '2026-10-03T00:00:00Z' }, { ...record, expiryDate: '2026-10-02T12:00:00Z' }, { ...record, expiryDate: 'invalid' }]
  expect(activeAnnouncements(rows, now).map(row => row.announcementId)).toEqual([2, 42])
})

it('loads every published dashboard page using documented query names', async () => {
  const api = { list: vi.fn().mockResolvedValueOnce(page([record], 1, 2, 2)).mockResolvedValueOnce(page([{ ...record, announcementId: 73 }], 2, 2, 2)) }
  expect(await loadDashboardAnnouncements(api)).toHaveLength(2)
  expect(api.list).toHaveBeenNthCalledWith(2, { Status: 'Published', Page: 2, Limit: 100 }, undefined)
})

it('requests filtered export as a blob, rejects JSON error downloads and preserves validation messages', async () => {
  apiClient.request.mockResolvedValue({ ...reply(new Blob(['{"message":"Export denied"}'], { type: 'application/json' })), headers: { 'content-type': 'application/json' } })
  await expect(hrModuleApi('announcements').export({ Search: 'staff', Audience: 'Staff', Unknown: 'ignored' })).rejects.toThrow(/export file/)
  expect(apiClient.request).toHaveBeenCalledWith(expect.objectContaining({ responseType: 'blob', params: { Search: 'staff', Audience: 'Staff' } }))
  expect(hrError({ response: { status: 422, data: { errors: { Title: ['A title is required.'] } } } }, 'announcements')).toBe('Title: A title is required.')
  expect(hrError({ response: { status: 409 } }, 'announcements')).toMatch(/conflict/)
})

it('downloads a successful blob using the server filename without treating it as JSON', async () => {
  const blob = new Blob(['title,audience\nUpdate,Staff'], { type: 'text/csv' })
  apiClient.request.mockResolvedValue({ ...reply(blob), headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="announcements.csv"' } })
  const result = await hrModuleApi('announcements').export({ Status: 'Published' })
  expect(result.data).toBe(blob)
  const previousCreate = URL.createObjectURL
  URL.createObjectURL = vi.fn(() => 'blob:announcements')
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
    expect(this.download).toBe('announcements.csv')
    expect(this.href).toBe('blob:announcements')
  })
  vi.useFakeTimers()
  const previousRevoke = URL.revokeObjectURL
  URL.revokeObjectURL = vi.fn()
  try {
    downloadHrFile(result)
    expect(click).toHaveBeenCalledTimes(1)
    vi.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:announcements')
  } finally { click.mockRestore(); URL.createObjectURL = previousCreate; URL.revokeObjectURL = previousRevoke; vi.useRealTimers() }
})
