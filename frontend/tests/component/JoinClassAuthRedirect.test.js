import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Join Class used to log a signed-in student out: any 401 from the join
// requests hit the global interceptor, which cleared the session and
// redirected to /login before the classroom page could show its error.

const toBase64Url = (value) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const jwtExpiringIn = (seconds) => `${toBase64Url({ alg: 'HS256' })}.${toBase64Url({ exp: Math.floor(Date.now() / 1000) + seconds })}.signature`

const signInStudent = (token) => {
  localStorage.setItem('auth_token', token)
  localStorage.setItem('isAuthenticated', 'true')
  localStorage.setItem('user_role', 'student')
}

// Fresh modules per test: the interceptor keeps a one-shot redirect guard.
const loadClients = async () => {
  vi.resetModules()
  const { default: apiClient } = await import('@shared/services/apiClient')
  const { liveClassApi } = await import('@features/live-classes/api/liveClassApi')
  const { jitsiAttendanceService } = await import('@shared/services/jitsiAttendanceService')
  return { apiClient, liveClassApi, jitsiAttendanceService }
}

const respondWith = (apiClient, status) => {
  const calls = []
  apiClient.defaults.adapter = async (config) => {
    calls.push(config)
    if (status < 400) return { config, data: { success: true }, status, statusText: 'OK', headers: {} }
    const error = new Error(`Request failed with status code ${status}`)
    error.config = config
    error.response = { config, data: '', status, statusText: '', headers: {} }
    throw error
  }
  return calls
}

const joinPayload = { liveClassId: 7, eventId: 'event-1', participantId: '1', participantName: 'Student', participantEmail: null }

describe('Join Class keeps a valid student session', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.pushState({}, '', '/student/classes/7/join')
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('sends the bearer token with the live-class join request', async () => {
    signInStudent(jwtExpiringIn(3600))
    const { apiClient, liveClassApi } = await loadClients()
    const calls = respondWith(apiClient, 200)
    await liveClassApi.join(7)
    expect(calls[0].method).toBe('post')
    expect(calls[0].url).toBe('/api/v1/live-classes/7/join')
    expect(calls[0].headers.get('Authorization')).toMatch(/^Bearer /)
  })

  it('does not log out on a 401 from POST /live-classes/{id}/join while the token is still valid', async () => {
    signInStudent(jwtExpiringIn(3600))
    const { apiClient, liveClassApi } = await loadClients()
    respondWith(apiClient, 401)
    await expect(liveClassApi.join(7)).rejects.toMatchObject({ response: { status: 401 } })
    expect(localStorage.getItem('auth_token')).not.toBeNull()
    expect(localStorage.getItem('isAuthenticated')).toBe('true')
  })

  it('does not log out on a 401 from the Jitsi attendance join/leave while the token is still valid', async () => {
    signInStudent(jwtExpiringIn(3600))
    const { apiClient, jitsiAttendanceService } = await loadClients()
    respondWith(apiClient, 401)
    await expect(jitsiAttendanceService.join(joinPayload)).rejects.toMatchObject({ response: { status: 401 } })
    await expect(jitsiAttendanceService.leave(joinPayload)).rejects.toMatchObject({ response: { status: 401 } })
    expect(localStorage.getItem('auth_token')).not.toBeNull()
  })

  it('still ends an expired session when Join Class returns 401', async () => {
    signInStudent(jwtExpiringIn(-60))
    const { apiClient, liveClassApi } = await loadClients()
    respondWith(apiClient, 401)
    await expect(liveClassApi.join(7)).rejects.toBeTruthy()
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(localStorage.getItem('isAuthenticated')).toBeNull()
  })

  it('treats a past stored login expiration as expired even without a JWT exp claim', async () => {
    signInStudent('opaque-token')
    localStorage.setItem('token_expiration', new Date(Date.now() - 60_000).toISOString())
    const { apiClient, liveClassApi } = await loadClients()
    respondWith(apiClient, 401)
    await expect(liveClassApi.join(7)).rejects.toBeTruthy()
    expect(localStorage.getItem('auth_token')).toBeNull()
  })

  it.each([403, 404, 409, 500])('never logs out on a %i', async (status) => {
    signInStudent(jwtExpiringIn(3600))
    const { apiClient, liveClassApi } = await loadClients()
    respondWith(apiClient, status)
    await expect(liveClassApi.join(7)).rejects.toMatchObject({ response: { status } })
    await expect(apiClient.get('/api/v1/live-classes/live')).rejects.toMatchObject({ response: { status } })
    expect(localStorage.getItem('auth_token')).not.toBeNull()
  })

  it('keeps the existing logout for a 401 from an ordinary protected request, once for concurrent failures', async () => {
    signInStudent(jwtExpiringIn(3600))
    const { apiClient } = await loadClients()
    respondWith(apiClient, 401)
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem')
    await Promise.allSettled([apiClient.get('/api/v1/live-classes/live'), apiClient.get('/api/v1/live-classes/upcoming')])
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(removeItem.mock.calls.filter(([key]) => key === 'auth_token')).toHaveLength(1)
  })
})

describe('Join Class error messages', () => {
  const failure = (status, data = '') => ({ response: { status, data } })

  it('tells each failure type apart', async () => {
    const { joinErrorMessage } = await import('@features/live-classes/utils/joinErrorMessage')
    expect(joinErrorMessage(failure(401, { message: 'Unauthorized' }), 'x')).toMatch(/didn't accept your sign-in.*still signed in/)
    expect(joinErrorMessage(failure(403), 'x')).toMatch(/don't have access to this class/)
    expect(joinErrorMessage(failure(403, { message: 'You are not enrolled in this batch.' }), 'x')).toBe('You are not enrolled in this batch.')
    expect(joinErrorMessage(failure(404), 'x')).toMatch(/enrollment for it, wasn't found/)
    expect(joinErrorMessage(failure(500), 'x')).toMatch(/class server ran into a problem/)
    expect(joinErrorMessage({ code: 'ERR_NETWORK', message: 'Network Error' }, 'x')).toMatch(/couldn't reach the class server/)
  })

  it('never shows raw server internals', async () => {
    const { joinErrorMessage } = await import('@features/live-classes/utils/joinErrorMessage')
    const trace = 'System.NullReferenceException: Object reference not set\n   at LiveClassController.Join()'
    expect(joinErrorMessage(failure(500, trace), 'x')).not.toMatch(/Exception|Controller/)
    expect(joinErrorMessage(failure(403, trace), 'x')).not.toMatch(/Exception|Controller/)
    expect(joinErrorMessage(failure(404, '<html><body>Not Found</body></html>'), 'x')).not.toMatch(/<html>/)
  })
})
