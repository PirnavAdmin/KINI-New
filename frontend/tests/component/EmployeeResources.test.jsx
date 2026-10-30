import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import EmployeeResources from '@features/employee/pages/EmployeeResources'
import apiClient from '@shared/services/apiClient'
import { MemoryRouter } from 'react-router-dom'
import toast from 'react-hot-toast'
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
afterEach(() => { cleanup(); vi.clearAllMocks() })

it('shows six usable learning resources without waiting for HR uploads', () => {
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(screen.getByRole('button', { name: 'View React Hooks Cheat Sheet' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Download Express API Template' })).toBeEnabled()
  expect(apiClient.request).not.toHaveBeenCalled()
  fireEvent.change(screen.getByRole('textbox', { name: 'Search resources' }), { target: { value: 'python' } })
  expect(screen.getAllByRole('article')).toHaveLength(1)
  expect(screen.getByRole('heading', { name: 'Python Pandas Guide' })).toBeInTheDocument()
})

it('renders nested resource metadata without crashing the page', async () => {
  apiClient.request.mockResolvedValue({
    data: { items: [{ resourceId: 7, name: 'Learning guide', category: { id: 2, name: 'Training' }, size: { value: 24, unit: 'KB' }, description: { text: 'A guide' }, fileType: 'PDF' }] },
    config: {}, status: 200,
  })
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Shared by HR' }))
  expect(await screen.findByRole('heading', { name: 'Learning guide' })).toBeInTheDocument()
  expect(screen.getAllByText('Training').length).toBeGreaterThan(0)
  expect(screen.getByText('24 KB')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Download Learning guide' })).toBeEnabled()
})

it('handles malformed metadata, unusable identifiers and null records safely', async () => {
  apiClient.request.mockResolvedValue({ data: { items: [null, false, [], { resourceId: { value: 4 }, name: {}, fileName: {}, category: [], size: {}, fileType: {} }] }, config: {}, status: 200 })
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Shared by HR' }))
  expect(await screen.findByRole('heading', { name: 'Untitled resource' })).toBeInTheDocument()
  expect(screen.getByText('Size not supplied')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Download Untitled resource' })).toBeDisabled()
})

it('keeps request errors on the resource page and recovers using Retry', async () => {
  apiClient.request.mockRejectedValueOnce({ message: { unexpected: 'object' } }).mockResolvedValueOnce({ data: { items: [] }, config: {}, status: 200 })
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Shared by HR' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load this resource')
  expect(screen.getByRole('heading', { name: 'Learning Resources' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
  expect(await screen.findByText('No resources available')).toBeInTheDocument()
})

it('refreshes the built-in library by resetting filters and restoring the catalogue', () => {
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  fireEvent.change(screen.getByRole('textbox', { name: 'Search resources' }), { target: { value: 'python' } })
  expect(screen.getAllByRole('article')).toHaveLength(1)
  fireEvent.click(screen.getByRole('button', { name: 'Refresh', exact: true }))
  expect(screen.getByRole('textbox', { name: 'Search resources' })).toHaveValue('')
  expect(screen.getAllByRole('article')).toHaveLength(6)
  expect(toast.success).toHaveBeenCalledWith('Learning library refreshed.', { id: 'resource-refresh' })
})

it('reloads Shared by HR and announces success only after receiving fresh data', async () => {
  apiClient.request.mockResolvedValueOnce({ data: { items: [{ resourceId: 1, name: 'Old guide' }] }, status: 200 })
  let finish
  apiClient.request.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Shared by HR' }))
  await screen.findByRole('heading', { name: 'Old guide' })
  fireEvent.click(screen.getByRole('button', { name: 'Refresh', exact: true }))
  expect(screen.getByRole('button', { name: 'Refreshing...' })).toBeDisabled()
  expect(toast.success).not.toHaveBeenCalled()
  await waitFor(() => expect(finish).toBeTypeOf('function'))
  finish({ data: { items: [{ resourceId: 2, name: 'New guide' }] }, status: 200 })
  await screen.findByRole('heading', { name: 'New guide' })
  expect(screen.queryByRole('heading', { name: 'Old guide' })).not.toBeInTheDocument()
  expect(toast.success).toHaveBeenCalledWith('Shared resources refreshed.', { id: 'resource-refresh' })
})

it('reports a failed refresh and leaves Refresh usable for retry', async () => {
  apiClient.request.mockResolvedValueOnce({ data: { items: [] }, status: 200 }).mockRejectedValueOnce({ response: { status: 500 } })
  render(<MemoryRouter><EmployeeResources /></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: 'Shared by HR' }))
  await screen.findByText('No resources available')
  fireEvent.click(screen.getByRole('button', { name: 'Refresh', exact: true }))
  await screen.findByRole('alert')
  expect(toast.error).toHaveBeenCalled()
  expect(toast.success).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Refresh', exact: true })).toBeEnabled()
})

