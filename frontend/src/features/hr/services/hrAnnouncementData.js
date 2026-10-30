// Bare DTOs documented by live Swagger on 2026-10-02. Unknown envelopes
// must fail visibly rather than being mistaken for an empty announcement list.
export const announcementChangedEvent = 'hr:announcements-changed'
export const announcementSummaryFields = ['totalAnnouncements', 'published', 'drafts', 'expired', 'recentlyPublished']
const recordFields = ['announcementId', 'title', 'audience', 'status', 'publishDate', 'expiryDate', 'createdBy']
const contractError = kind => new Error(`The server returned an unsupported announcement ${kind} response.`)
const object = value => value && typeof value === 'object' && !Array.isArray(value)

export function normalizeAnnouncementRecord(value, detail = false) {
  if (!object(value) || !Number.isInteger(value.announcementId)) throw contractError('record')
  return Object.fromEntries([...recordFields, ...(detail ? ['content'] : [])].filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]))
}

export function normalizeAnnouncementResponse(method, path, value) {
  if (method === 'DELETE') return value
  if (path.endsWith('/summary')) {
    if (!object(value) || !announcementSummaryFields.some(key => Object.hasOwn(value, key))) throw contractError('summary')
    return Object.fromEntries(announcementSummaryFields.map(key => {
      if (value[key] != null && (!Number.isInteger(value[key]) || value[key] < 0)) throw contractError('summary')
      return [key, value[key] ?? null]
    }))
  }
  if (path.endsWith('/options')) {
    if (!object(value) || !['audiences', 'statuses'].some(key => Object.hasOwn(value, key))) throw contractError('options')
    return Object.fromEntries(['audiences', 'statuses'].map(key => {
      if (value[key] != null && (!Array.isArray(value[key]) || value[key].some(item => typeof item !== 'string'))) throw contractError('options')
      return [key, value[key] ?? []]
    }))
  }
  if (method === 'GET' && path === '/api/hr/announcements') {
    if (!object(value) || !Object.hasOwn(value, 'items') || value.items != null && !Array.isArray(value.items)
      || !['page', 'limit', 'totalCount', 'totalPages'].every(key => Number.isInteger(value[key]))
      || value.page < 1 || value.limit < 1 || value.totalCount < 0 || value.totalPages < 0
      || value.items == null && value.totalCount !== 0) throw contractError('list')
    return { items: (value.items ?? []).map(row => normalizeAnnouncementRecord(row)), page: value.page, limit: value.limit, totalCount: value.totalCount, totalPages: value.totalPages }
  }
  return normalizeAnnouncementRecord(value, true)
}

export function announcementOptions(key, options) {
  return (options?.[key === 'audience' ? 'audiences' : 'statuses'] ?? []).map(value => ({ value, label: value }))
}

export function activeAnnouncements(rows, now = Date.now()) {
  return rows.filter(row => {
    const publish = Date.parse(row.publishDate)
    const expiry = row.expiryDate == null ? null : Date.parse(row.expiryDate)
    return String(row.status ?? '').trim().toLowerCase() === 'published'
      && Number.isFinite(publish) && publish <= now
      && (expiry === null || Number.isFinite(expiry) && expiry > now)
  }).sort((a, b) => Date.parse(b.publishDate) - Date.parse(a.publishDate) || a.announcementId - b.announcementId)
}

export async function loadDashboardAnnouncements(api, signal) {
  const rows = []
  for (let page = 1; page <= 1000; page++) {
    const payload = await api.list({ Status: 'Published', Page: page, Limit: 100 }, signal)
    if (signal?.aborted) return []
    if (payload.page !== page) throw new Error('The announcement server returned the wrong page.')
    rows.push(...payload.items)
    if (page >= payload.totalPages || rows.length >= payload.totalCount) return rows
    if (!payload.items.length) throw new Error('The announcement server returned incomplete pagination.')
  }
  throw new Error('Announcement pagination limit exceeded.')
}
