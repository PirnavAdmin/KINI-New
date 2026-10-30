import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import apiClient from '@shared/services/apiClient'
import service from '@/services/assessmentService'
import AssessmentResults from '@/pages/assessments/AssessmentResults'
import StudentPerformanceModal from '@/pages/assessments/StudentPerformanceModal'
import { normalizeAssessmentStudentResults, normalizeStudentPerformance, scoreDistribution } from '@/pages/assessments/assessmentResultsData'

vi.mock('@shared/services/apiClient', () => ({ default: { get: vi.fn() } }))
// Contract fixtures are test inputs only; application code has no fallback records.
const student = { studentId: 5, studentName: 'Test Student', email: 'test@example.test', score: 0, percentage: 12.5, attempts: 0, status: 'Unavailable', result: null }
const results = (overrides = {}) => ({ assessmentId: 8, assessmentTitle: 'API title', courseName: 'API course', batchName: 'API batch', totalMarks: 5, passingMarks: 1, totalStudents: 21, pageNumber: 1, pageSize: 10, totalPages: 3, students: [student], ...overrides })
const performance = (overrides = {}) => ({ studentId: 5, studentName: 'Performance Student', email: 'performance@example.test', courseName: 'Performance Course', batchName: 'Performance Batch', totalAssessmentsAssigned: 7, assessmentsTaken: 3, totalAttempts: 5, completedAttempts: 4, inProgressAttempts: 1, passedAssessments: 0, failedAssessments: 3, averagePercentage: 0, results: [], ...overrides })
beforeEach(() => { vi.clearAllMocks(); apiClient.get.mockImplementation(async url => ({ data: url.endsWith('/performance') ? performance() : results() })) })
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const mount = () => render(<AssessmentResults assessment={{ id: 8 }} onClose={vi.fn()} />)
const open = async () => { fireEvent.click(await screen.findByRole('button', { name: 'More actions for Test Student' }, { timeout: 5000 })); fireEvent.click(screen.getByRole('menuitem', { name: 'View Performance' })); await screen.findByRole('heading', { name: 'Performance Student' }, { timeout: 5000 }) }

describe('assessment results and performance contracts', () => {
  it('preserves zero, uses exact percentage, and leaves missing values unavailable', () => {
    expect(normalizeAssessmentStudentResults(results(), 8).students[0]).toMatchObject({ score: 0, percentage: 12.5, attempts: 0, state: 'Unavailable' })
    expect(normalizeStudentPerformance(performance(), 5).summary).toMatchObject({ passedAssessments: 0, averagePercentage: 0 })
    expect(normalizeStudentPerformance(performance({ averagePercentage: undefined }), 5).summary.averagePercentage).toBeNull()
  })
  it('rejects malformed and mismatched responses', () => {
    expect(() => normalizeAssessmentStudentResults(results(), 9)).toThrow()
    expect(() => normalizeStudentPerformance(performance(), 9)).toThrow()
    expect(() => normalizeStudentPerformance({ studentId: 5 }, 5)).toThrow()
    expect(() => normalizeAssessmentStudentResults(results({ pageSize: 0 }), 8)).toThrow()
  })
  it('counts zero and decimal percentages while ignoring missing scores', () => {
    expect(scoreDistribution([0, 20, 20.5, 40, 60, 80, 100, null].map(percentage => ({ percentage }))).map(row => row.count)).toEqual([2, 2, 1, 1, 1])
  })
  it('uses the shared client and exact endpoint/query parameters', async () => {
    const signal = new AbortController().signal
    await service.getAssessmentStudentResults(8, { search: 'hari', pageNumber: 2, pageSize: 20 }, { signal })
    expect(apiClient.get).toHaveBeenCalledWith('/api/Assessment/8/students/results', { signal, params: { search: 'hari', pageNumber: 2, pageSize: 20 } })
    await expect(service.getStudentPerformance('bad')).rejects.toThrow()
  })
  it('loads real table fields without fetching performance and uses server pagination/search', async () => {
    mount()
    await screen.findByText('API title', {}, { timeout: 5000 })
    expect(screen.getByText('12.5%')).toBeInTheDocument()
    expect(apiClient.get).toHaveBeenCalledTimes(1)
    apiClient.get.mockResolvedValueOnce({ data: results({ pageNumber: 2 }) })
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    await waitFor(() => expect(apiClient.get).toHaveBeenLastCalledWith('/api/Assessment/8/students/results', expect.objectContaining({ params: { search: '', pageNumber: 2, pageSize: 10 } })), { timeout: 5000 })
    await waitFor(() => expect(screen.getByText('Showing 11 to 11 of 21 records')).toBeInTheDocument())
    fireEvent.change(screen.getByRole('textbox', { name: 'Search students' }), { target: { value: 'hari' } })
    await waitFor(() => expect(apiClient.get).toHaveBeenLastCalledWith('/api/Assessment/8/students/results', expect.objectContaining({ params: { search: 'hari', pageNumber: 1, pageSize: 10 } })), { timeout: 5000 })
    fireEvent.change(screen.getByRole('combobox', { name: 'Rows per page' }), { target: { value: '20' } })
    await waitFor(() => expect(apiClient.get).toHaveBeenLastCalledWith('/api/Assessment/8/students/results', expect.objectContaining({ params: { search: 'hari', pageNumber: 1, pageSize: 20 } })), { timeout: 5000 })
  })
  it('opens performance only on demand, reuses cache and refreshes both reads', async () => {
    mount(); await open()
    expect(apiClient.get).toHaveBeenCalledWith('/api/Assessment/students/5/performance', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(within(screen.getByRole('region', { name: 'Performance summary' })).getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('No assessment performance available')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close performance' }))
    await open()
    expect(apiClient.get.mock.calls.filter(([url]) => url.endsWith('/performance'))).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh student performance' }))
    await waitFor(() => expect(apiClient.get.mock.calls.filter(([url]) => url.endsWith('/performance'))).toHaveLength(2))
    await waitFor(() => expect(apiClient.get.mock.calls.filter(([url]) => url.endsWith('/results'))).toHaveLength(2), { timeout: 5000 })
  })
  it.each([[401, 'Session expired. Please login again.'], [403, "You don't have permission to view this student's performance."], [404, 'No performance data found for this student.'], [500, 'Unable to load student performance.']])('shows %s errors and supports retry', async (status, message) => {
    apiClient.get.mockRejectedValueOnce({ response: { status } })
    render(<StudentPerformanceModal studentId={5} cache={new Map()} refreshKey={0} onClose={vi.fn()} onRefresh={vi.fn()} />)
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('No assessment performance available')).toBeInTheDocument()
  })
  it('ignores a late response after switching students', async () => {
    let resolve
    apiClient.get.mockReturnValueOnce(new Promise(done => { resolve = done }))
    const cache = new Map()
    const props = { cache, refreshKey: 0, onClose: vi.fn(), onRefresh: vi.fn() }
    const view = render(<StudentPerformanceModal key={5} studentId={5} {...props} />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading student performance')
    apiClient.get.mockResolvedValueOnce({ data: performance({ studentId: 6, studentName: 'Second Student' }) })
    view.rerender(<StudentPerformanceModal key={6} studentId={6} {...props} />)
    await screen.findByText('Second Student')
    await act(async () => resolve({ data: performance() }))
    expect(screen.queryByText('Performance Student')).not.toBeInTheDocument()
    expect(cache.has('5')).toBe(false)
  })
  it('renders supplied history marks with each attempt denominator and actual answer totals', async () => {
    apiClient.get.mockResolvedValueOnce({ data: performance({ results: [
      { studentAssessmentId: 41, assessmentTitle: 'First Assessment', score: 2, totalMarks: 5, percentage: 40, result: 'Pass', status: 'Submitted', totalQuestions: 5, correctAnswers: 2, wrongAnswers: 3 },
      { studentAssessmentId: 42, assessmentTitle: 'Second Assessment', score: 2, totalMarks: 10, percentage: 20, result: 'Fail', status: 'Submitted', totalQuestions: 10, correctAnswers: 2, wrongAnswers: 8 },
    ] }) })
    render(<StudentPerformanceModal studentId={5} cache={new Map()} refreshKey={0} onClose={vi.fn()} onRefresh={vi.fn()} />)
    expect(await screen.findByText('2 / 5')).toBeInTheDocument()
    expect(screen.getByText('2 / 10')).toBeInTheDocument()
    expect(screen.getByText('PASS')).toBeInTheDocument()
    expect(screen.getByText('FAIL')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
  })
})
