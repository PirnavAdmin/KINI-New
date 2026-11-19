import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HrApiModule from '@features/hr/components/HrApiModule'
import apiClient from '@shared/services/apiClient'
vi.mock('@shared/services/apiClient', () => ({ default: { request: vi.fn() } }))
vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => true, isLoading: false }) }))
vi.mock('@features/hr/components/HRPage', () => ({ default: ({ children, hero }) => <main>{hero}{children}</main> }))
afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('opens a valid PDF without the plugin-blocking sandbox and uses the correct breadcrumb', async () => {
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-pdf')
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  apiClient.request.mockImplementation(async request => {
    if (request.url.endsWith('/preview')) return { data: new Blob(['%PDF-1.7 test'], { type: 'application/pdf' }), status: 200, config: {} }
    return { data: { data: request.url === '/api/hr/resources' ? [{ resourceId: 1, name: 'Test guide', fileType: 'PDF' }] : [] }, status: 200, config: {} }
  })
  render(<MemoryRouter><HrApiModule module="resources" /></MemoryRouter>)
  await screen.findByText('Test guide')
  expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent('Resources')
  expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).not.toHaveTextContent('Employee')
  fireEvent.click(screen.getByRole('button', { name: 'More actions' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Preview' }))
  const frame = await screen.findByTitle('Resource preview')
  await waitFor(() => expect(frame).toHaveAttribute('src', 'blob:test-pdf'))
  expect(frame).not.toHaveAttribute('sandbox')
})
