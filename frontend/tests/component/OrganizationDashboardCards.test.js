import { expect, it, vi } from 'vitest'
import { buildDashboardSchedule, loadDashboardLearning } from '@features/organization/utils/dashboardCards'
import { normalizeLiveClassList } from '@features/live-classes/utils/liveClassMappers'

const now = new Date(2030, 0, 2, 8)
const scheduled = fields => ({ id: 1, title: 'Scheduled workshop', batchName: 'Cohort A', mentorName: 'Test Mentor', status: 'scheduled', startAt: new Date(2030, 0, 2, 10).toISOString(), endAt: new Date(2030, 0, 2, 11).toISOString(), ...fields })
const student = fields => ({ studentId: 1, organizationId: '2', courseId: 10, courseName: 'Frontend course', status: 'Active', ...fields })
const services = fields => ({ available: true, organizationId: '2', getEnrollments: vi.fn(async () => ({ data: [] })), getProgress: vi.fn(async () => ({ data: {} })), ...fields })

it('keeps normalized timezone offsets and seconds when selecting upcoming classes', () => {
  const classes = normalizeLiveClassList([{ liveClassId: 1, classTitle: 'Offset schedule', startAt: '2030-01-02T18:30:45+05:30', endAt: '2030-01-02T19:30:45+05:30', status: 'Scheduled', batch: { batchName: 'Evening cohort' }, mentor: { firstName: 'Test', lastName: 'Mentor' } }])
  const { upcomingClasses } = buildDashboardSchedule(classes, new Date('2030-01-02T13:00:30Z'))
  expect(upcomingClasses).toHaveLength(1)
  expect(upcomingClasses[0]).toMatchObject({ date: '2030-01-02T13:00:45.000Z', batch: 'Evening cohort', mentor: 'Test Mentor' })
})

it('keeps a scheduled session whose start has passed but end is still ahead', () => {
  const { upcomingClasses } = buildDashboardSchedule([scheduled({})], new Date(2030, 0, 2, 10, 30))
  expect(upcomingClasses).toHaveLength(1)
})

it('uses lifecycle status for live, completed and cancelled sessions', () => {
  const classes = normalizeLiveClassList([
    scheduled({ id: 1, status: 'InProgress' }),
    scheduled({ id: 2, status: 'Ended' }),
    scheduled({ id: 3, status: 'Canceled' }),
    scheduled({ id: 4, status: 'Scheduled' }),
  ])
  const result = buildDashboardSchedule(classes, now)
  expect(result.upcomingClasses.map(row => row.id)).toEqual([1, 4])
  expect(result.liveSession).toMatchObject({ id: 1, state: 'live', duration: '1h 00m' })
})

it('sorts by real start time, limits to four, and leaves tomorrow out of Current Session', () => {
  const rows = [5, 2, 4, 1, 3].map(id => scheduled({ id, startAt: new Date(2030, 0, 3, 10 + id).toISOString(), endAt: new Date(2030, 0, 3, 11 + id).toISOString() }))
  const result = buildDashboardSchedule(rows, now)
  expect(result.upcomingClasses.map(row => row.id)).toEqual([1, 2, 3, 4])
  expect(result.upcomingClasses[0].dateLabel).toBe('Tomorrow')
  expect(result.liveSession).toBeNull()
})

it('does not turn invalid or expired scheduled dates into upcoming classes', () => {
  expect(buildDashboardSchedule([null, scheduled({ startAt: 'invalid' }), scheduled({ startAt: '2020-01-01', endAt: '2020-01-02' })], now).upcomingClasses).toEqual([])
})

it('reports 0% only for a successfully loaded empty organization', async () => {
  const api = services()
  expect(await loadDashboardLearning([], api)).toMatchObject({ completed: 0, inProgress: 0, notStarted: 0, overall: 0 })
  expect(api.getEnrollments).not.toHaveBeenCalled()
  expect(await loadDashboardLearning([], { ...api, available: false })).toMatchObject({ completed: null, inProgress: null, notStarted: null, overall: null })
})

it('reads the real enrollment and Student Profile percentage response shapes', async () => {
  const api = services({ getEnrollments: vi.fn(async () => ({ data: [{ courseId: 10, courseName: 'Frontend course', enrollmentStatus: 'Active' }] })), getProgress: vi.fn(async () => ({ data: { percentage: 45 } })) })
  expect(await loadDashboardLearning([student({})], api)).toMatchObject({ completed: 0, inProgress: 1, notStarted: 0, overall: 45, current: { name: 'Frontend course', value: 45 } })
  expect(api.getEnrollments).toHaveBeenCalledWith(1)
  expect(api.getProgress).toHaveBeenCalledWith(1)
})

it('counts courses independently for multi-course enrollments and deduplicates the primary course', async () => {
  const api = services({ getEnrollments: async () => ({ data: [
    { courseId: 10, courseName: 'Frontend course', progressPercentage: 100 },
    { courseId: 11, courseName: 'Backend course', courseProgress: 25 },
    { courseId: 12, courseName: 'Data course', progress: 0 },
  ] }) })
  expect(await loadDashboardLearning([student({})], api)).toMatchObject({ completed: 1, inProgress: 1, notStarted: 1, overall: 42, current: { name: 'Backend course', value: 25 } })
  expect(api.getProgress).not.toHaveBeenCalled()
})

it('does not copy aggregate progress to each course when multi-course measurements are missing', async () => {
  const api = services({ getEnrollments: async () => ({ data: [{ courseId: 10 }, { courseId: 11 }] }), getProgress: async () => ({ data: { percentage: 70 } }) })
  expect(await loadDashboardLearning([student({})], api)).toMatchObject({ overall: null, completed: null, unreported: 2 })
})

it('matches per-course progress by courseId instead of response order', async () => {
  const api = services({ getEnrollments: async () => ({ data: [{ courseId: 10 }, { courseId: 11 }] }), getProgress: async () => ({ data: { courses: [{ courseId: 11, percentage: 100 }, { courseId: 10, percentage: 0 }] } }) })
  expect(await loadDashboardLearning([student({})], api)).toMatchObject({ completed: 1, notStarted: 1, overall: 50, unreported: 0 })
})

it.each([null, undefined, '', {}, [], 'invalid'])('keeps unavailable progress %j distinct from zero', async progress => {
  expect(await loadDashboardLearning([student({ progress })], services())).toMatchObject({ overall: null, completed: null, notStarted: null, unreported: 1 })
})

it('keeps explicit zero as a measured not-started enrollment', async () => {
  expect(await loadDashboardLearning([student({ progress: 0 })], services())).toMatchObject({ overall: 0, notStarted: 1, unreported: 0 })
})

it('retains a primary-course measurement when enrollments omit it', async () => {
  const api = services({ getEnrollments: async () => ({ data: [{ courseId: 10, courseName: 'Frontend course' }] }) })
  expect(await loadDashboardLearning([student({ progress: 60 })], api)).toMatchObject({ overall: 60, inProgress: 1 })
  expect(api.getProgress).not.toHaveBeenCalled()
})

it('does not borrow the primary course name or progress for another course', async () => {
  const api = services({ getEnrollments: async () => ({ data: [{ courseId: 10, progress: 100 }, { courseId: 11, progress: 50 }] }) })
  expect(await loadDashboardLearning([student({ progress: 100 })], api)).toMatchObject({ completed: 1, inProgress: 1, current: { name: 'Course #11', value: 50 } })
})

it('counts duplicate enrollment rows once per course and never fetches another tenant', async () => {
  const api = services({ getEnrollments: async () => ({ data: [{ courseId: 10, progress: 50 }, { courseId: 10, progress: 50 }] }) })
  expect(await loadDashboardLearning([student({}), student({ studentId: 2, organizationId: 9 })], api)).toMatchObject({ overall: 50, inProgress: 1 })
})

it('keeps progress unavailable on API failure and retains inline measurements', async () => {
  const fail = async () => { throw new Error('Unavailable') }
  expect(await loadDashboardLearning([student({})], services({ getEnrollments: fail, getProgress: fail }))).toMatchObject({ overall: null, unreported: 1 })
  expect(await loadDashboardLearning([student({ progress: 75 })], services({ getEnrollments: fail, getProgress: fail }))).toMatchObject({ overall: 75, inProgress: 1 })
})

it('excludes pending, rejected and other-organization enrollments', async () => {
  const api = services({ getEnrollments: async () => ({ data: [
    { courseId: 10, enrollmentStatus: 'Rejected' },
    { courseId: 11, organizationId: '9', progress: 90 },
    { courseId: 12, enrollmentStatus: 'PendingApproval', progress: 0 },
    { courseId: 13, enrollmentStatus: 'Active', progress: 50 },
  ] }) })
  expect(await loadDashboardLearning([student({}), student({ studentId: 2, status: 'PendingApproval' })], api)).toMatchObject({ overall: 50, inProgress: 1, unreported: 0 })
})
