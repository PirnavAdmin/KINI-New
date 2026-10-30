import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import apiClient from '@shared/services/apiClient'
import {
  clearProfilePhotoCache,
  parseBatchPhotoResponse,
  profilePhotoService,
} from '@shared/services/profilePhotoService'

vi.mock('@shared/services/apiClient', () => ({
  default: { get: vi.fn() },
  getStoredAuthToken: () => 'real-token',
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
  // Production URL resolution; the dev /uploads proxy mapping has its own test.
  vi.stubEnv('DEV', false)
  URL.createObjectURL = vi.fn(() => 'blob:photo-1')
  URL.revokeObjectURL = vi.fn()
  localStorage.clear()
  clearProfilePhotoCache()
})
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status } })

// Confirmed response of GET /api/v1/profile/photo/Employee/10
const EMPLOYEE_10 = {
  success: true,
  data: { profileType: 'employee', profileId: 10, displayName: 'mohannarayana minchala', photoUrl: 'https://api.example.test/uploads/profile-photos/employee/10_a.png' },
}

it('requests one photo as JSON with the backend profile type and reads data.photoUrl (Employee 10)', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: EMPLOYEE_10 })
  await expect(profilePhotoService.getPhoto('employee', '10')).resolves.toBe(EMPLOYEE_10.data.photoUrl)
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/profile/photo/Employee/10', expect.not.objectContaining({ responseType: 'blob' }))
})

it('maps every profile type to the backend path value and resolves relative photo paths', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: { success: true, data: { photoUrl: '/uploads/p/7.jpg' } } })
  await expect(profilePhotoService.getPhoto('Mentor', 7)).resolves.toBe('https://api.example.test/uploads/p/7.jpg')
  await profilePhotoService.getPhoto('student', 8)
  expect(apiClient.get.mock.calls.map(([url]) => url)).toEqual(['/api/v1/profile/photo/Mentor/7', '/api/v1/profile/photo/Student/8'])
})

it('treats success:false or a missing photoUrl as "no photo"', async () => {
  apiClient.get.mockResolvedValueOnce({ status: 200, data: { success: false, message: 'Not found' } })
  await expect(profilePhotoService.getPhoto('student', 30)).resolves.toBe('')
  apiClient.get.mockResolvedValueOnce({ status: 200, data: { success: true, data: { profileId: 31, displayName: 'No Photo', photoUrl: null } } })
  await expect(profilePhotoService.getPhoto('student', 31)).resolves.toBe('')
})

it('collapses avatars that ask at the same time into one batch request instead of one per row', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: { success: true, count: 1, data: [{ profileType: 'employee', profileId: 10, photoUrl: '/e/10.png' }] } })
  const results = await Promise.all([10, 11, 12].map((id) => profilePhotoService.getPhoto('employee', id)))
  expect(results).toEqual(['https://api.example.test/e/10.png', '', ''])
  expect(apiClient.get).toHaveBeenCalledTimes(1)
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/profile/photo/batch', expect.objectContaining({ params: { employeeIds: '10,11,12' } }))
})

// Shape seen in DevTools for Employee 10: userType/employeeId, photoUrl + profilePhotoUrl.
const EMPLOYEE_10_USER_SHAPE = { userType: 'Employee', employeeId: 10, photoUrl: 'http://api.example.test/uploads/profile-photos/employee/10_a.png', profilePhotoUrl: 'http://api.example.test/uploads/profile-photos/employee/10_a.png' }

it.each([
  ['an array of userType/employeeId entries', { success: true, data: [EMPLOYEE_10_USER_SHAPE] }],
  ['a single object as data', { success: true, data: EMPLOYEE_10_USER_SHAPE }],
  ['entries with only profilePhotoUrl', { success: true, data: [{ userType: 'Employee', employeeId: 10, profilePhotoUrl: EMPLOYEE_10_USER_SHAPE.photoUrl }] }],
])('matches Employee 10 from a batch response shaped as %s', async (_, body) => {
  apiClient.get.mockResolvedValue({ status: 200, data: body })
  const photos = await profilePhotoService.getPhotosBatch('employee', [3, 10])
  expect(photos).toEqual({ 3: '', 10: 'http://api.example.test/uploads/profile-photos/employee/10_a.png' })
})

it('falls back to the single endpoint for a page of rows when the batch request fails', async () => {
  apiClient.get.mockImplementation(async (url) => {
    if (url === '/api/v1/profile/photo/batch') throw httpError(403)
    if (url === '/api/v1/profile/photo/Employee/10') return { status: 200, data: EMPLOYEE_10 }
    throw httpError(404)
  })
  const [three, ten] = await Promise.all([profilePhotoService.getPhoto('employee', 3), profilePhotoService.getPhoto('employee', 10)])
  expect(ten).toBe(EMPLOYEE_10.data.photoUrl)
  expect(three).toBe('')
})

it('treats { success: true, count: 0, data: [] } as "no photo", not an error', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: { success: true, count: 0, data: [] } })
  await expect(profilePhotoService.getPhotosBatch('mentor', [7])).resolves.toEqual({ 7: '' })
})

it('fetches a mixed list in one request and keys results by type and id', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: { success: true, count: 2, data: [
    { profileType: 'employee', profileId: 10, photoUrl: '/e/10.png' },
    { profileType: 'student', profileId: 25, photoUrl: '/s/25.png' },
    { profileId: 10, photoUrl: '/untyped.png' },
  ] } })
  const photos = await profilePhotoService.getProfilePhotosBatch({ employeeIds: [10], studentIds: [10, 25], mentorIds: [7] })
  expect(apiClient.get).toHaveBeenCalledTimes(1)
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/profile/photo/batch', expect.objectContaining({ params: { studentIds: '10,25', employeeIds: '10', mentorIds: '7' } }))
  // An entry without a type is never guessed onto student 10 in a mixed request.
  expect(photos).toEqual({ 'employee-10': 'https://api.example.test/e/10.png', 'student-25': 'https://api.example.test/s/25.png', 'student-10': '', 'mentor-7': '' })
})

it('upgrades http photo URLs to https when the app is served over https (mixed content)', async () => {
  const { resolvePhotoUrl } = await import('@shared/services/profilePhotoService')
  vi.stubGlobal('location', { ...window.location, protocol: 'https:' })
  expect(resolvePhotoUrl('http://api.example.test/uploads/e/10.png')).toBe('https://api.example.test/uploads/e/10.png')
  vi.stubGlobal('location', { ...window.location, protocol: 'http:' })
  expect(resolvePhotoUrl('http://localhost:5000/uploads/e/10.png')).toBe('http://localhost:5000/uploads/e/10.png')
})

it('joins a relative /uploads path to the API origin, never the page origin or the API base path', async () => {
  const { resolvePhotoUrl } = await import('@shared/services/profilePhotoService')
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/api/')
  // Exact value returned by GET /api/hr/settings/profile for employee 10.
  expect(resolvePhotoUrl('/uploads/profile-photos/employee/10_246b38f82e3f48efa104a44910ef5f14.png'))
    .toBe('https://api.example.test/uploads/profile-photos/employee/10_246b38f82e3f48efa104a44910ef5f14.png')
  expect(resolvePhotoUrl('uploads/p/1.png')).toBe('https://api.example.test/uploads/p/1.png')
  expect(resolvePhotoUrl('')).toBe('')
})

it('in dev, serves API-host uploads through the same-origin /uploads proxy (ngrok blocks plain <img> requests)', async () => {
  const { resolvePhotoUrl } = await import('@shared/services/profilePhotoService')
  vi.stubEnv('DEV', true)
  expect(resolvePhotoUrl('/uploads/profile-photos/employee/10_a.png')).toBe('/uploads/profile-photos/employee/10_a.png')
  // The photo API hands out http:// URLs for the https API host.
  expect(resolvePhotoUrl('http://api.example.test/uploads/profile-photos/employee/10_a.png')).toBe('/uploads/profile-photos/employee/10_a.png')
  expect(resolvePhotoUrl('https://cdn.other.test/uploads/x.png')).toBe('https://cdn.other.test/uploads/x.png')
})

it('requests the signed-in user\'s own photo once for every avatar that shows it', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: { success: true, data: { photoUrl: '/me.png' } } })
  const [first, second] = await Promise.all([profilePhotoService.getOwnPhoto(), profilePhotoService.getOwnPhoto()])
  expect(first).toBe('https://api.example.test/me.png')
  expect(second).toBe(first)
  expect(apiClient.get).toHaveBeenCalledTimes(1)
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/profile/photo', expect.anything())
})

it('caches results so the same person is fetched once, including concurrent requests', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: EMPLOYEE_10 })
  await Promise.all([profilePhotoService.getPhoto('employee', 3), profilePhotoService.getPhoto('employee', 3)])
  await profilePhotoService.getPhoto('employee', 3)
  expect(apiClient.get).toHaveBeenCalledTimes(1)
})

it('treats 404 as "no photo" (cached) but lets 401/403/500 reject without caching', async () => {
  apiClient.get.mockRejectedValueOnce(httpError(404))
  await expect(profilePhotoService.getPhoto('student', 5)).resolves.toBe('')
  await profilePhotoService.getPhoto('student', 5)
  expect(apiClient.get).toHaveBeenCalledTimes(1)

  for (const status of [401, 403, 500]) {
    apiClient.get.mockRejectedValueOnce(httpError(status))
    await expect(profilePhotoService.getPhoto('student', 100 + status)).rejects.toMatchObject({ response: { status } })
  }
})

it('never calls the API for missing, non-numeric ids or demo sessions', async () => {
  await expect(profilePhotoService.getPhoto('student', 'TUT-001')).resolves.toBe('')
  await expect(profilePhotoService.getPhoto('', 4)).resolves.toBe('')
  localStorage.setItem('isDemo', 'true')
  await expect(profilePhotoService.getPhoto('student', 4)).resolves.toBe('')
  await expect(profilePhotoService.getPhotosBatch('student', [1, 2])).resolves.toEqual({})
  expect(apiClient.get).not.toHaveBeenCalled()
})

it('uses the Swagger batch query parameter for the profile type and only asks for uncached ids', async () => {
  apiClient.get.mockResolvedValueOnce({ status: 200, data: { 1: 'https://cdn.test/1.jpg' } })
  await expect(profilePhotoService.getPhotosBatch('student', [1, '2', 'bad', 1])).resolves.toEqual({ 1: 'https://cdn.test/1.jpg', 2: '' })
  expect(apiClient.get).toHaveBeenCalledWith('/api/v1/profile/photo/batch', expect.objectContaining({ params: { studentIds: '1,2' } }))

  apiClient.get.mockResolvedValueOnce({ status: 200, data: [] })
  await profilePhotoService.getPhotosBatch('student', [1, 2, 3])
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/profile/photo/batch', expect.objectContaining({ params: { studentIds: '3' } }))

  apiClient.get.mockResolvedValueOnce({ status: 200, data: [] })
  await profilePhotoService.getPhotosBatch('mentor', [9])
  expect(apiClient.get).toHaveBeenLastCalledWith('/api/v1/profile/photo/batch', expect.objectContaining({ params: { mentorIds: '9' } }))
})

it('splits very large rosters into several batch requests', async () => {
  apiClient.get.mockResolvedValue({ status: 200, data: {} })
  await profilePhotoService.getPhotosBatch('employee', Array.from({ length: 250 }, (_, index) => index + 1))
  expect(apiClient.get).toHaveBeenCalledTimes(3)
})

it.each([
  ['id map', { 4: '/p/4.jpg' }],
  ['wrapped id map', { success: true, data: { 4: { photoUrl: '/p/4.jpg' } } }],
  ['grouped by type', { students: { 4: '/p/4.jpg' }, mentors: { 4: '/m/4.jpg' } }],
  ['array of entries', [{ profileType: 'student', profileId: 4, photoUrl: '/p/4.jpg' }, { profileType: 'mentor', profileId: 4, photoUrl: '/m/4.jpg' }]],
  ['array keyed by studentId', { data: [{ studentId: 4, url: '/p/4.jpg' }] }],
])('parses a batch response shaped as %s', (_, payload) => {
  expect(parseBatchPhotoResponse(payload, 'student').get(4)).toBe('https://api.example.test/p/4.jpg')
})

it('looks a mentor up by the employee record that holds the photo, falling back to mentorId — never by name', async () => {
  const { mentorPhotoLookup } = await import('@shared/services/profilePhotoService')
  expect(mentorPhotoLookup({ mentorId: 9, employeeRecordId: 31, name: 'nani narendraaaa' })).toEqual({ profileType: 'employee', profileId: 31 })
  expect(mentorPhotoLookup({ mentorId: 9, employeeRecordId: null })).toEqual({ profileType: 'mentor', profileId: 9 })
  expect(mentorPhotoLookup({ name: 'nani narendraaaa', email: 'n@x.test', employeeRecordId: 'EMP-001' })).toEqual({ profileType: null, profileId: null })
})

it('takes the numeric employee profile id, skipping display codes like P10 and never using userId', async () => {
  const { profileIdOf } = await import('@shared/services/profilePhotoService')
  const fields = ['employeeId', 'EmployeeId', 'id', 'Id']
  expect(profileIdOf({ employeeId: 10, userId: 18 }, fields)).toBe(10)
  expect(profileIdOf({ employeeId: 'P10', id: 10, userId: 18 }, fields)).toBe(10)
  expect(profileIdOf({ employeeId: 'P10', userId: 18 }, fields)).toBeNull()
})

it('reads the backend profilePhotoUrl field embedded in a record', async () => {
  const { embeddedPhotoUrl } = await import('@shared/services/profilePhotoService')
  expect(embeddedPhotoUrl({ profilePhotoUrl: '/uploads/e/31.jpg', profilePhoto: '' })).toBe('https://api.example.test/uploads/e/31.jpg')
  expect(embeddedPhotoUrl({ profilePhoto: '' })).toBe('')
})

it('re-fetches a cached photo once it is stale or after the signed-in user changes their photo', async () => {
  const { notifyProfilePhotoChanged } = await import('@shared/services/profilePhotoService')
  apiClient.get.mockResolvedValue({ status: 200, data: {} })
  await profilePhotoService.getPhotosBatch('employee', [31])
  await profilePhotoService.getPhotosBatch('employee', [31])
  expect(apiClient.get).toHaveBeenCalledTimes(1)

  notifyProfilePhotoChanged({ photoUrl: 'https://cdn.test/new.jpg' })
  await profilePhotoService.getPhotosBatch('employee', [31])
  expect(apiClient.get).toHaveBeenCalledTimes(2)

  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(Date.now() + 61 * 1000)
  await profilePhotoService.getPhotosBatch('employee', [31])
  expect(apiClient.get).toHaveBeenCalledTimes(3)
  vi.useRealTimers()
})
