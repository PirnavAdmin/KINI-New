import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import useEmployeeTotal from '@features/employee/hooks/useEmployeeTotal'
import { hrRequest } from '@features/hr/services/hrApi'

vi.mock('@features/hr/services/hrApi', async importOriginal => ({ ...await importOriginal(), hrRequest: vi.fn() }))
beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

it.each([{ totalEmployees: 6 }, { summary: { totalEmployees: '6' } }])('reads the workforce total from the employee summary: %j', async response => {
  hrRequest.mockResolvedValue(response)
  const { result } = renderHook(() => useEmployeeTotal())
  expect(result.current.loading).toBe(true)
  await waitFor(() => expect(result.current).toEqual({ loading: false, count: 6 }))
  expect(hrRequest).toHaveBeenCalledWith('GET', '/api/hr/employees/summary', expect.objectContaining({ signal: expect.any(AbortSignal) }))
})

it.each([{}, { totalEmployees: null }, { totalEmployees: '' }, { totalEmployees: -1 }, { totalEmployees: true }])('shows unavailable for invalid totals instead of inventing a count: %j', async response => {
  hrRequest.mockResolvedValue(response)
  const { result } = renderHook(() => useEmployeeTotal())
  await waitFor(() => expect(result.current).toEqual({ loading: false, count: null }))
})

it('preserves a real zero and reloads the total on refresh', async () => {
  hrRequest.mockResolvedValueOnce({ totalEmployees: 0 }).mockResolvedValueOnce({ totalEmployees: 7 })
  const { result, rerender } = renderHook(({ revision }) => useEmployeeTotal(revision), { initialProps: { revision: 0 } })
  await waitFor(() => expect(result.current.count).toBe(0))
  rerender({ revision: 1 })
  expect(result.current.loading).toBe(true)
  await waitFor(() => expect(result.current.count).toBe(7))
})

it('does not replace unavailable employee data with batch enrollment counts', async () => {
  hrRequest.mockRejectedValue({ response: { status: 403 } })
  const { result } = renderHook(() => useEmployeeTotal())
  await waitFor(() => expect(result.current).toEqual({ loading: false, count: null }))
})

it('ignores an old response after refresh', async () => {
  let finishOldRequest
  hrRequest.mockImplementationOnce(() => new Promise(resolve => { finishOldRequest = resolve })).mockResolvedValueOnce({ totalEmployees: 8 })
  const { result, rerender } = renderHook(({ revision }) => useEmployeeTotal(revision), { initialProps: { revision: 0 } })
  const signal = hrRequest.mock.calls[0][2].signal
  rerender({ revision: 1 })
  await waitFor(() => expect(result.current.count).toBe(8))
  expect(signal.aborted).toBe(true)
  await act(async () => finishOldRequest({ totalEmployees: 1 }))
  expect(result.current.count).toBe(8)
})
