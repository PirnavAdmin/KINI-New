import { expect, it } from 'vitest'
import apiClient from '@shared/services/apiClient'
import { hrModuleApi, hrRequest } from '@features/hr/services/hrApi'

it('attaches the shared Bearer header to all eight Announcement operations', async () => {
  const originalAdapter = apiClient.defaults.adapter
  const captured = []
  const record = { announcementId: 42, title: 'Adapter fixture', publishDate: '2026-10-01T00:00:00Z', expiryDate: null, status: 'Published' }
  // Local Axios adapter exercises the actual interceptor without network access.
  localStorage.setItem('auth_token', 'announcement-test-token')
  apiClient.defaults.adapter = async config => {
    captured.push(config)
    let data = record
    if (config.url.endsWith('/summary')) data = { totalAnnouncements: 1, published: 1, drafts: 0, expired: 0, recentlyPublished: 1 }
    else if (config.url.endsWith('/options')) data = { audiences: ['Staff'], statuses: ['Published'] }
    else if (config.url.endsWith('/export')) data = new Blob(['title\nAdapter fixture'], { type: 'text/csv' })
    else if (config.method === 'get' && config.url === '/api/hr/announcements') data = { items: [record], page: 1, limit: 10, totalCount: 1, totalPages: 1 }
    else if (config.method === 'delete') data = null
    return { data, config, status: 200, statusText: 'OK', headers: { 'content-type': config.responseType === 'blob' ? 'text/csv' : 'application/json' } }
  }
  try {
    const api = hrModuleApi('announcements')
    await api.summary()
    await api.list({ Page: 1, Limit: 10 })
    await api.create({ title: record.title })
    await api.get(42)
    await api.update(42, { title: record.title })
    await api.remove(42)
    await hrRequest('GET', api.path + '/options')
    await api.export({ Status: 'Published' })
    expect(captured).toHaveLength(8)
    expect(captured.every(config => config.headers.get('Authorization') === 'Bearer announcement-test-token')).toBe(true)
    expect(captured.at(-1).responseType).toBe('blob')
  } finally { apiClient.defaults.adapter = originalAdapter; localStorage.removeItem('auth_token') }
})
