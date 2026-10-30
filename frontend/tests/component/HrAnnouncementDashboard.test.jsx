import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HRDashboardView from '@features/hr/pages/HRDashboardView'
import apiClient from '@shared/services/apiClient'
import { announcementChangedEvent } from '@features/hr/services/hrAnnouncementData'

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
// Charts belong to unrelated dashboard modules and are outside this test.
vi.mock('recharts', () => ({ Bar: () => null, BarChart: () => null, CartesianGrid: () => null, Legend: () => null, Line: () => null, LineChart: () => null, ResponsiveContainer: () => null, Tooltip: () => null, XAxis: () => null, YAxis: () => null }))
vi.mock('@shared/hooks/useAuth', () => ({ useAuth: () => ({ user: { employeeId: 7 } }) }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: module => module === 'announcements', can: (module, action) => module === 'announcements' && action === 'view', isLoading: false }) }))
vi.mock('@features/hr/hooks/useHrPermissions', () => ({ default: () => ({ canModule: () => false, can: () => false, isLoading: false }) }))
const row = { announcementId: 42, title: 'Visible update', audience: 'Staff', status: 'Published', publishDate: '2020-01-01T00:00:00Z', expiryDate: null }
const response = items => ({ data: { items, page: 1, limit: 100, totalCount: items.length, totalPages: 1 }, config: {}, status: 200 })
const mount = () => render(<MemoryRouter><HRDashboardView /></MemoryRouter>)
afterEach(() => { cleanup(); vi.clearAllMocks() })

it('renders only published active announcements and refreshes only announcements after a change', async () => {
  apiClient.request.mockResolvedValue(response([row, { ...row, announcementId: 43, title: 'Expired update', expiryDate: '2020-02-01T00:00:00Z' }, { ...row, announcementId: 44, title: 'Future update', publishDate: '2099-01-01T00:00:00Z' }, { ...row, announcementId: 45, title: 'Draft update', status: 'Draft' }]))
  mount()
  await screen.findByText('Visible update')
  expect(screen.queryByText('Expired update')).not.toBeInTheDocument()
  expect(screen.queryByText('Future update')).not.toBeInTheDocument()
  expect(screen.queryByText('Draft update')).not.toBeInTheDocument()
  window.dispatchEvent(new Event(announcementChangedEvent))
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledTimes(2))
  expect(apiClient.request.mock.calls.every(([request]) => request.url === '/api/hr/announcements' && request.params.Status === 'Published')).toBe(true)
})

it('queues a targeted refresh during an existing dashboard request', async () => {
  let finishFirst
  apiClient.request.mockImplementationOnce(() => new Promise(resolve => { finishFirst = resolve })).mockResolvedValue(response([{ ...row, title: 'Refreshed update' }]))
  mount()
  await waitFor(() => expect(apiClient.request).toHaveBeenCalledTimes(1))
  window.dispatchEvent(new Event(announcementChangedEvent))
  window.dispatchEvent(new Event(announcementChangedEvent))
  expect(apiClient.request).toHaveBeenCalledTimes(1)
  finishFirst(response([row]))
  await screen.findByText('Refreshed update')
  expect(apiClient.request).toHaveBeenCalledTimes(2)
})
