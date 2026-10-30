import { expect, it } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { hrModuleApi, hrRequest } from '@features/hr/services/hrApi'

it('uses the existing shared Bearer interceptor for all ten Calendar operations', async () => {
  const previousAdapter = apiClient.defaults.adapter
  const calls = []
  localStorage.setItem('auth_token', 'calendar-adapter-test-token')
  apiClient.defaults.adapter = async config => {
    calls.push(config)
    // Response mapping is intentionally outside this transport-only test.
    return { config, data: null, status: 200, statusText: 'OK', headers: {} }
  }
  try {
    const api = hrModuleApi('calendar')
    await api.list({ PageNumber: 1, PageSize: 200 })
    await api.create({ title: 'Test' })
    await api.get(42)
    await api.update(42, { title: 'Updated' })
    await api.remove(42)
    await hrRequest('GET', api.path + '/upcoming', { params: { limit: 5 } })
    await api.summary()
    for (const source of ['holidays', 'leaves', 'classes']) await hrRequest('GET', '/api/hr/calendar/' + source)
    expect(calls).toHaveLength(10)
    expect(calls.every(config => config.headers.get('Authorization') === 'Bearer calendar-adapter-test-token')).toBe(true)
  } finally { apiClient.defaults.adapter = previousAdapter; localStorage.removeItem('auth_token') }
})
