import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EmployeeBatches from '@features/employee/pages/EmployeeBatches'
import { batchService } from '@shared/services/batchService'
import { studentsApi } from '@/api/students'
import { loadBatchRosterCounts } from '@shared/services/batchRosterService'

vi.mock('@shared/hooks/usePermission', () => ({ default: () => ({ hasPermission: () => true, can: () => false }) }))
vi.mock('@/features/employee/hooks/useEmployeeTotal', () => ({ default: () => ({ count: 0, loading: false }) }))
vi.mock('@shared/services/batchService', () => ({ batchService: { getAll: vi.fn(), getStudents: vi.fn(), getSummary: vi.fn() } }))
vi.mock('@/api/students', () => ({ studentsApi: { list: vi.fn() } }))
const batch = { batchId: 7, batchName: 'React Morning', courseName: 'React', studentsCount: 99, startDate: '2026-11-01', status: 'Active' }
beforeEach(() => {
  vi.clearAllMocks()
  batchService.getAll.mockResolvedValue({ data: [batch], totalPages: 1, totalRecords: 1 })
  batchService.getSummary.mockResolvedValue({})
  batchService.getStudents.mockResolvedValue({ students: [{ studentId: 1, status: 'Active' }, { studentId: 1, status: 'Active' }, { studentId: 2, status: 'Rejected' }] })
  studentsApi.list.mockResolvedValue({ data: [{ studentId: 3, batchId: 7, status: 'Active' }] })
})
afterEach(cleanup)
it('uses eligible unique roster students plus primary assignments, as Organization Batches does', async () => {
  expect(await loadBatchRosterCounts([batch])).toEqual({ 7: 2 })
  render(<MemoryRouter><EmployeeBatches /></MemoryRouter>)
  expect(await screen.findByText('2 Students')).toBeInTheDocument()
  expect(screen.queryByText('99 Employees')).not.toBeInTheDocument()
  const crumbs = screen.getByRole('navigation', { name: 'Breadcrumb' })
  expect(within(crumbs).getByText('Batches')).toBeInTheDocument()
  expect(within(crumbs).queryByText('Employee')).not.toBeInTheDocument()
  expect(within(crumbs).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/employee/hr-dashboard')
})
it('shows unavailable rather than a stale batch aggregate when a roster fails', async () => {
  batchService.getStudents.mockRejectedValue(new Error('unavailable'))
  render(<MemoryRouter><EmployeeBatches /></MemoryRouter>)
  expect(await screen.findByText('Student count unavailable')).toBeInTheDocument()
})
