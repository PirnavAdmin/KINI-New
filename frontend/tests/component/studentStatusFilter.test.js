import { expect, it } from 'vitest'
import { matchesStatus } from '@/pages/students/studentUi'

it('matches backend statuses case-insensitively', () => {
  expect(matchesStatus('ACTIVE', 'Active')).toBe(true)
  expect(matchesStatus(' active ', 'Active')).toBe(true)
  expect(matchesStatus('Inactive', 'Active')).toBe(false)
})

it('groups the same spellings the KPI cards count', () => {
  expect(matchesStatus('Pending Approval', 'Pending')).toBe(true)
  expect(matchesStatus('awaiting approval', 'Pending')).toBe(true)
  expect(matchesStatus('high risk', 'At Risk')).toBe(true)
})

it('treats a missing status as no match', () => {
  expect(matchesStatus(undefined, 'Active')).toBe(false)
  expect(matchesStatus(null, 'Rejected')).toBe(false)
})
