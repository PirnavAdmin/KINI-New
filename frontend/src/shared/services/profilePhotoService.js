import apiClient, { getStoredAuthToken } from './apiClient'

const unwrap = (response) => response?.data?.data ?? response?.data ?? response

// The backend builds photo URLs from the scheme it sees behind its proxy, so it
// can hand out http:// links while the app (and the API) is served over https.
// Browsers block or auto-upgrade those as mixed content; upgrade them here, in
// one place, until the backend honours X-Forwarded-Proto.
const upgradeInsecureUrl = (url) => (
  /^http:\/\//i.test(url) && typeof window !== 'undefined' && window.location?.protocol === 'https:'
    ? url.replace(/^http:/i, 'https:')
    : url
)

// Uploads live at the API host's root (/uploads/...), not under any path the
// API base URL may have (e.g. https://host/api), so join on the origin.
const apiOrigin = () => {
  try {
    return new URL(String(import.meta.env.VITE_API_BASE_URL || '')).origin
  } catch {
    return ''
  }
}

// In dev, files on the API host are requested same-origin and go through the
// Vite /uploads proxy (vite.config.js). Production uses the backend URL as-is.
const proxiedUploadPath = (url) => {
  if (!import.meta.env.DEV) return null
  try {
    const parsed = new URL(url)
    return parsed.origin.replace(/^http:/i, 'https:') === apiOrigin().replace(/^http:/i, 'https:') && parsed.pathname.startsWith('/uploads/')
      ? `${parsed.pathname}${parsed.search}`
      : null
  } catch {
    return null
  }
}

/** The one place a backend photo value (absolute URL or /uploads/... path) becomes an <img> src. */
export const resolvePhotoUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  const text = value.trim()
  if (!text) return ''
  if (/^(blob:|data:)/i.test(text)) return text
  const path = text.startsWith('/') ? text : `/${text}`
  const absolute = /^https?:/i.test(text) ? text : `${apiOrigin()}${path}`
  return proxiedUploadPath(absolute) ?? upgradeInsecureUrl(absolute)
}

/**
 * Resolves true only if the browser can actually render `src`. Upload
 * responses can yield strings that aren't image URLs (e.g. a status message),
 * so a new photo is verified before it replaces the one on screen.
 */
export const canLoadImage = (src, timeoutMs = 15000) => new Promise((resolve) => {
  if (!src || typeof Image === 'undefined') {
    resolve(false)
    return
  }
  const image = new Image()
  let settled = false
  const finish = (ok) => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    image.onload = null
    image.onerror = null
    resolve(ok)
  }
  const timer = setTimeout(() => finish(false), timeoutMs)
  image.onload = () => finish(image.naturalWidth > 0)
  image.onerror = () => finish(false)
  image.src = src
})

// The signed-in user's own photo changed (upload or removal). Every avatar that
// shows the current user listens for this instead of keeping a separate copy.
export const PROFILE_PHOTO_CHANGED_EVENT = 'kini:profile-photo-changed'
// detail: { removed: true } after a delete; otherwise { photoUrl } with a
// verified URL, or an empty photoUrl meaning "changed — re-fetch it".
export const notifyProfilePhotoChanged = ({ photoUrl = '', removed = false } = {}) => {
  // Any cached copy of this user's photo (e.g. in a mentor list) is now out of date.
  expireProfilePhotoCache()
  ownPhoto = null
  window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_CHANGED_EVENT, { detail: { photoUrl, removed } }))
}

/**
 * Pull a usable URL string out of an arbitrary backend payload.
 * Returns a string or null — never an object, Blob, or undefined.
 */
export const extractProfilePhotoUrl = (payload, depth = 0) => {
  if (depth > 4) return null
  if (!payload) return null
  if (typeof payload === 'string') return payload.trim() || null
  const candidates = [
    payload.photoUrl,
    payload.PhotoUrl,
    payload.profilePhotoUrl,
    payload.ProfilePhotoUrl,
    payload.imageUrl,
    payload.url,
    payload.profilePhoto,
    payload.photo,
    payload.data?.photoUrl,
    payload.data?.imageUrl,
    payload.data?.url,
    payload.data?.profilePhoto,
    payload.data?.photo,
    payload.result,
    payload.data,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate
    if (candidate && typeof candidate === 'object') {
      const nested = extractProfilePhotoUrl(candidate, depth + 1)
      if (nested) return nested
    }
  }
  return null
}

// ─── Other people's photos ────────────────────────────────────────────────
// Swagger (TalentSphereAPI) contract:
//   GET /api/v1/profile/photo/{profileType}/{profileId}   profileId: int32
//     → { success, data: { profileType, profileId, displayName, photoUrl } }  (JSON, not image bytes)
//   GET /api/v1/profile/photo/batch?studentIds=&employeeIds=&mentorIds=
//     each param is a single string, so several ids are sent comma-separated ("1,2,3")
//     → { success, count, data: [...] }; an id missing from data has no photo.

// Callers use these lowercase keys; BACKEND_PROFILE_TYPE is what goes in the URL.
export const PROFILE_TYPE = { EMPLOYEE: 'employee', STUDENT: 'student', MENTOR: 'mentor' }
export const PROFILE_TYPES = Object.values(PROFILE_TYPE)
const BACKEND_PROFILE_TYPE = { employee: 'Employee', student: 'Student', mentor: 'Mentor' }
const BATCH_PARAM = { student: 'studentIds', employee: 'employeeIds', mentor: 'mentorIds' }
const BATCH_CHUNK_SIZE = 100
const normalizeProfileType = (value) => {
  const type = String(value || '').toLowerCase()
  return BATCH_PARAM[type] ? type : null
}

// Avatars read this while rendering, so a failure here must mean "no session", never a crash.
const sessionToken = () => {
  try {
    return getStoredAuthToken() || null
  } catch {
    return null
  }
}

// Demo sessions use a synthetic token the backend rejects, and without any token
// the request can only 401 — don't call the API in either case.
const cannotRequestPhotos = () => {
  const token = sessionToken()
  return localStorage.getItem('isDemo') === 'true' || !token || token === 'demo-token'
}

// The backend only accepts integer ids; display codes like "TUT-001" can't be looked up.
export const toProfileId = (value) => {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

// The profile id of a record for the photo API: the first of `fields` holding a
// positive integer. Some HR endpoints put a display code ("P10") in employeeId
// and the numeric id in id; a code is skipped, never parsed. Never pass userId.
export const profileIdOf = (record = {}, fields = []) => {
  for (const field of fields) {
    const id = toProfileId(record?.[field])
    if (id) return id
  }
  return null
}

// A photo URL already embedded in a record (the Employee/Student models carry
// `profilePhotoUrl`; older payloads use other names). '' when there is none.
export const embeddedPhotoUrl = (record = {}) => {
  const value = [
    record.profilePhotoUrl, record.ProfilePhotoUrl, record.profilePhoto, record.photoUrl,
    record.avatarUrl, record.photo, record.employee?.profilePhotoUrl,
  ].find((candidate) => typeof candidate === 'string' && candidate.trim())
  return value ? resolvePhotoUrl(value.trim()) : ''
}

// Which photo belongs to a mentor. In the backend a mentor is an Employee and
// the photo is stored on the Employee record (Mentor has no photo field), so the
// employee id is the reliable key; mentorId is only used when no employee id exists.
// Matching is by id only — never by name, email or row position.
export const mentorPhotoLookup = (mentor = {}) => {
  const employeeId = toProfileId(mentor.employeeRecordId ?? mentor.employee?.employeeId)
  if (employeeId) return { profileType: 'employee', profileId: employeeId }
  const mentorId = toProfileId(mentor.mentorId)
  if (mentorId) return { profileType: 'mentor', profileId: mentorId }
  return { profileType: null, profileId: null }
}

const photoKey = (profileType, profileId) => `${String(profileType).toLowerCase()}:${profileId}`

// Cached results: key -> url string, or '' for "no photo". Blob URLs are shared
// between every avatar showing the same person, so they are revoked on eviction
// (and on logout via clearProfilePhotoCache) rather than when one avatar unmounts.
const MAX_CACHED_PHOTOS = 300
// Short enough that a photo another user just changed shows up on the next
// visit; long enough that re-renders and pagination don't re-request.
const PHOTO_CACHE_TTL_MS = 60 * 1000
const photoCache = new Map()
const cachedAt = new Map()
const inFlight = new Map()
// The signed-in user's own photo request: { token, promise }.
let ownPhoto = null

const rememberPhoto = (key, url) => {
  const previous = photoCache.get(key)
  if (previous?.startsWith('blob:') && previous !== url) URL.revokeObjectURL(previous)
  if (photoCache.has(key)) photoCache.delete(key)
  photoCache.set(key, url)
  cachedAt.set(key, Date.now())
  while (photoCache.size > MAX_CACHED_PHOTOS) {
    const [oldestKey, oldestUrl] = photoCache.entries().next().value
    photoCache.delete(oldestKey)
    cachedAt.delete(oldestKey)
    if (oldestUrl?.startsWith('blob:')) URL.revokeObjectURL(oldestUrl)
  }
  return url
}

// Photos are permission-scoped, so a cache filled under one login must not be
// reused after signing in as someone else.
let cacheSessionToken = null
const syncCacheWithSession = () => {
  const token = sessionToken()
  if (token !== cacheSessionToken) {
    clearProfilePhotoCache()
    cacheSessionToken = token
  }
}

export const getCachedProfilePhoto = (profileType, profileId) => {
  syncCacheWithSession()
  const key = photoKey(profileType, profileId)
  if (!photoCache.has(key) || Date.now() - (cachedAt.get(key) || 0) > PHOTO_CACHE_TTL_MS) return undefined
  return photoCache.get(key)
}

// Mark every entry stale without revoking blob URLs that may still be on screen;
// the next lookup re-fetches and replaces them.
export const expireProfilePhotoCache = () => { cachedAt.clear() }

export const clearProfilePhotoCache = () => {
  photoCache.forEach((url) => { if (url?.startsWith('blob:')) URL.revokeObjectURL(url) })
  photoCache.clear()
  cachedAt.clear()
  inFlight.clear()
  ownPhoto = null
}

const looksLikeBase64Image = (value) => /^[A-Za-z0-9+/=\s]{200,}$/.test(value)

// Turn any photo value the backend may send (URL, relative path, base64) into an <img> src.
const toImageSrc = (value) => {
  if (!value || typeof value !== 'string') return ''
  const text = value.trim()
  if (!text) return ''
  if (looksLikeBase64Image(text)) return `data:image/jpeg;base64,${text.replace(/\s/g, '')}`
  return resolvePhotoUrl(text)
}

const isNoPhotoError = (error) => [404, 204].includes(error?.response?.status)

// Development-only diagnostics (console.info so they show at the default log level).
const logDebug = (...args) => { if (import.meta.env.DEV) console.info(...args) }

// skipAuthRedirect: a photo the user may not see must not sign them out; the
// page's own data requests still go through the normal 401 handling.
async function fetchSinglePhoto(profileType, profileId) {
  const response = await apiClient.get(
    `/api/v1/profile/photo/${BACKEND_PROFILE_TYPE[profileType]}/${profileId}`,
    { skipAuthRedirect: true },
  )
  const body = response.data
  const url = response.status === 204 || body?.success === false ? '' : toImageSrc(extractProfilePhotoUrl(body?.data ?? body))
  logDebug('[ProfilePhoto]', { profileType, profileId, status: response.status, resolvedUrl: url || '(no photo)' })
  return url
}

// Pull an id -> photo map out of whatever shape the batch endpoint returns:
//   { "12": "url" } | { students: { "12": "url" } } | [{ studentId: 12, photoUrl }] | { students: [...] }
const ID_FIELDS = {
  student: ['studentId', 'StudentId'],
  employee: ['employeeId', 'EmployeeId'],
  mentor: ['mentorId', 'MentorId', 'tutorId'],
}
const GROUP_FIELDS = {
  student: ['students', 'studentPhotos', 'Students', 'studentIds'],
  employee: ['employees', 'employeePhotos', 'Employees', 'employeeIds'],
  mentor: ['mentors', 'mentorPhotos', 'Mentors', 'mentorIds'],
}

// Endpoints name the type differently: profileType: "employee" (single/batch)
// or userType: "Employee" (current user). Compared lowercase everywhere.
const entryType = (entry) => String(entry?.profileType ?? entry?.ProfileType ?? entry?.userType ?? entry?.UserType ?? entry?.type ?? '').toLowerCase()
// A single photo record rather than a list or an id -> url map.
const isPhotoEntry = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value)
  && (Boolean(entryType(value)) || ['profileId', 'ProfileId', 'employeeId', 'EmployeeId', 'studentId', 'StudentId', 'mentorId', 'MentorId'].some((field) => value[field] != null))
const entryId = (entry, profileType) => {
  const fields = [...(ID_FIELDS[profileType] || []), 'profileId', 'ProfileId', 'id', 'Id']
  for (const field of fields) {
    const id = toProfileId(entry?.[field])
    if (id) return id
  }
  return null
}

// In a mixed request (several id types at once) an entry is only trusted when it
// says which type it is, so employee 10 can never be shown as student 10.
const hasTypedId = (entry, profileType) => ID_FIELDS[profileType].some((field) => toProfileId(entry?.[field]))

const collectPhotos = (source, profileType, into, mixed) => {
  if (!source) return
  if (Array.isArray(source)) {
    source.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return
      const type = entryType(entry)
      if (type && type !== profileType) return
      if (!type && mixed && !hasTypedId(entry, profileType)) return
      const id = entryId(entry, profileType)
      if (id) into.set(id, toImageSrc(extractProfilePhotoUrl(entry)))
    })
    return
  }
  if (typeof source === 'object' && !mixed) {
    Object.entries(source).forEach(([key, value]) => {
      const id = toProfileId(key)
      if (!id) return
      into.set(id, toImageSrc(typeof value === 'string' ? value : extractProfilePhotoUrl(value)))
    })
  }
}

export const parseBatchPhotoResponse = (payload, profileType, { mixed = false } = {}) => {
  const result = new Map()
  const body = payload?.data !== undefined && !Array.isArray(payload) ? payload.data : payload
  const group = GROUP_FIELDS[profileType]?.map((field) => body?.[field]).find(Boolean)
  const source = group ?? body
  collectPhotos(isPhotoEntry(source) ? [source] : source, profileType, result, mixed && !group)
  return result
}

const chunk = (ids) => {
  const chunks = []
  for (let index = 0; index < ids.length; index += BATCH_CHUNK_SIZE) chunks.push(ids.slice(index, index + BATCH_CHUNK_SIZE))
  return chunks
}

/**
 * One GET /batch per chunk, with every requested type in the same query.
 * idsByType: { employee: [10, 11], student: [4] }. Resolves to a Map of
 * photoKey -> src ('' for ids the backend returned no photo for), and caches it.
 */
async function fetchBatch(idsByType) {
  const types = Object.keys(idsByType).filter((type) => idsByType[type]?.length)
  const chunksByType = Object.fromEntries(types.map((type) => [type, chunk(idsByType[type])]))
  const requestCount = Math.max(0, ...types.map((type) => chunksByType[type].length))
  const mixed = types.length > 1
  const photos = new Map()
  await Promise.all(Array.from({ length: requestCount }, async (_, index) => {
    const params = {}
    types.forEach((type) => { if (chunksByType[type][index]) params[BATCH_PARAM[type]] = chunksByType[type][index].join(',') })
    const response = await apiClient.get('/api/v1/profile/photo/batch', { params, skipAuthRedirect: true })
    types.forEach((type) => {
      const ids = chunksByType[type][index]
      if (!ids) return
      const found = parseBatchPhotoResponse(response.data, type, { mixed })
      // Ids the backend didn't return have no photo; cache that so they aren't re-requested.
      ids.forEach((id) => { photos.set(photoKey(type, id), rememberPhoto(photoKey(type, id), found.get(id) || '')) })
    })
    logDebug('[ProfilePhotoBatch]', { params, status: response.status, count: response.data?.count })
  }))
  return photos
}

// ─── Request coalescing ───────────────────────────────────────────────────
// Avatars ask for their own photo, but those rendered together (a table page)
// are collected for one tick and fetched with a single batch request instead
// of one request per row. A lone avatar (a details page) uses the single API.
const queue = new Map()
let flushScheduled = false
const SINGLE_FALLBACK_LIMIT = 25

async function flushQueue() {
  flushScheduled = false
  const jobs = [...queue.values()]
  queue.clear()
  if (!jobs.length) return
  if (jobs.length === 1) {
    const [{ profileType, id, resolve, reject }] = jobs
    fetchSinglePhoto(profileType, id).then(resolve, reject)
    return
  }
  const idsByType = {}
  jobs.forEach(({ profileType, id }) => { (idsByType[profileType] ||= []).push(id) })
  try {
    const photos = await fetchBatch(idsByType)
    jobs.forEach((job) => job.resolve(photos.get(photoKey(job.profileType, job.id)) ?? ''))
  } catch (error) {
    // A failed batch (e.g. a role the batch endpoint rejects) must not blank a
    // whole table: one page's worth of rows falls back to the single endpoint.
    const status = error?.response?.status
    if (status === 401 || jobs.length > SINGLE_FALLBACK_LIMIT) {
      jobs.forEach((job) => job.reject(error))
      return
    }
    logDebug('[ProfilePhotoBatch] failed, using the single endpoint', { status: status ?? error?.message, body: error?.response?.data })
    jobs.forEach((job) => fetchSinglePhoto(job.profileType, job.id).then(job.resolve, job.reject))
  }
}

const enqueuePhoto = (profileType, id) => new Promise((resolve, reject) => {
  queue.set(photoKey(profileType, id), { profileType, id, resolve, reject })
  if (!flushScheduled) {
    flushScheduled = true
    setTimeout(flushQueue, 0)
  }
})

export const profilePhotoService = {
  /**
   * One person's photo. Resolves to an <img>-ready src, or '' when the person
   * has no photo (404). Other failures (401/403/500/network) reject so callers
   * can fall back to initials without caching the failure.
   */
  async getPhoto(profileType, profileId) {
    const type = normalizeProfileType(profileType)
    const id = toProfileId(profileId)
    if (!type || !id || cannotRequestPhotos()) return ''
    syncCacheWithSession()
    const key = photoKey(type, id)
    const cached = getCachedProfilePhoto(type, id)
    if (cached !== undefined) return cached
    if (inFlight.has(key)) return inFlight.get(key)
    const request = enqueuePhoto(type, id)
      .then((url) => rememberPhoto(key, url))
      .catch((error) => {
        logDebug('[ProfilePhoto] failed', { profileType: type, profileId: id, status: error?.response?.status ?? error?.message, body: error?.response?.data })
        if (isNoPhotoError(error)) return rememberPhoto(key, '')
        throw error
      })
      .finally(() => inFlight.delete(key))
    inFlight.set(key, request)
    return request
  },

  /**
   * Photos for many people of the same type in one request.
   * Resolves to { [profileId]: src } where src is '' for people without a photo.
   */
  async getPhotosBatch(profileType, profileIds = []) {
    const type = normalizeProfileType(profileType)
    const photos = {}
    if (!type || cannotRequestPhotos()) return photos
    const all = await profilePhotoService.getProfilePhotosBatch({ [BATCH_PARAM[type]]: profileIds })
    Object.entries(all).forEach(([key, url]) => { photos[key.slice(type.length + 1)] = url })
    return photos
  },

  /**
   * Photos for a mixed list (students, employees and mentors) in one request.
   * Resolves to { 'employee-10': src, 'student-4': src, ... } — keyed by type
   * as well as id, since ids are only unique within a type.
   */
  async getProfilePhotosBatch({ studentIds = [], employeeIds = [], mentorIds = [] } = {}) {
    const photos = {}
    if (cannotRequestPhotos()) return photos
    syncCacheWithSession()
    const missing = {}
    Object.entries({ student: studentIds, employee: employeeIds, mentor: mentorIds }).forEach(([type, list]) => {
      [...new Set((list || []).map(toProfileId).filter(Boolean))].forEach((id) => {
        const cached = getCachedProfilePhoto(type, id)
        if (cached === undefined) (missing[type] ||= []).push(id)
        else photos[`${type}-${id}`] = cached
      })
    })
    if (!Object.keys(missing).length) return photos
    const fetched = await fetchBatch(missing)
    fetched.forEach((url, key) => { photos[key.replace(':', '-')] = url })
    return photos
  },

  async get() {
    const response = await apiClient.get('/api/v1/profile/photo', { skipAuthRedirect: true })
    const result = unwrap(response)
    return { ...(result && typeof result === 'object' ? result : {}), photoUrl: resolvePhotoUrl(extractProfilePhotoUrl(result)) }
  },

  /**
   * The signed-in user's own photo URL ('' when none), shared by every place
   * that shows it (navbar, account menu, mentor attendance) so it is requested
   * once per session. Reset by notifyProfilePhotoChanged after upload/delete.
   */
  getOwnPhoto() {
    const token = sessionToken()
    if (cannotRequestPhotos()) return Promise.resolve('')
    if (!ownPhoto || ownPhoto.token !== token) {
      const entry = { token, promise: null }
      entry.promise = profilePhotoService.get()
        .then((result) => result.photoUrl || '')
        .catch((error) => {
          if (ownPhoto === entry) ownPhoto = null
          throw error
        })
      ownPhoto = entry
    }
    return ownPhoto.promise
  },

  async upload(file) {
    const formData = new FormData()
    // Swagger contract requires the capitalized multipart field name.
    formData.append('Photo', file)
    const response = await apiClient.post('/api/v1/profile/photo', formData, {
      skipAuthRedirect: true,
    })
    const result = unwrap(response)
    return { ...(result && typeof result === 'object' ? result : {}), photoUrl: resolvePhotoUrl(extractProfilePhotoUrl(result)) }
  },

  async remove() {
    const response = await apiClient.delete('/api/v1/profile/photo', {
      skipAuthRedirect: true,
    })
    return unwrap(response)
  },
}

export default profilePhotoService
