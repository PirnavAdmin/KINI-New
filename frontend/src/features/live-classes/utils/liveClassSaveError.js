import { getApiErrorMessage, readableApiMessage } from '@shared/services/apiServices'

export const LIVE_CLASS_CREATE_FAILED = "We couldn't create the live class. Please try again later or contact support."
export const LIVE_CLASS_UPDATE_FAILED = "We couldn't save the live class. Please try again later or contact support."
export const LIVE_CLASS_NETWORK_FAILED = "We couldn't reach the server, so the live class was not saved. Check your connection and try again."

// .NET runtime exception text ("Object reference not set to an instance of an
// object.", "Sequence contains no elements", stack frames, ...) describes a
// server bug, not anything the user entered.
const SERVER_EXCEPTION = /object reference not set|exception|sequence contains|nullable object must|stack ?trace|\bat\s+\S+\(|[<>{}]|\n/i

const serverMessage = (error) => readableApiMessage(error?.response?.data)

const safeServerMessage = (error) => {
  const message = serverMessage(error)
  return message && message.length <= 200 && !SERVER_EXCEPTION.test(message) ? message : ''
}

// ASP.NET validation keys come as "CourseId", "$.courseId" or "dto.CourseId".
const toFieldKey = (key) => {
  const name = String(key).split('.').pop().replace(/^\$/, '')
  return name ? name.charAt(0).toLowerCase() + name.slice(1) : ''
}

const firstMessage = (value) => (Array.isArray(value) ? value.find(Boolean) : value) || ''

// Field errors from a 400/422 validation response, keyed by the request's
// camelCase field name. Any other status never produces field errors.
export const liveClassFieldErrors = (error) => {
  const status = error?.response?.status
  if (status !== 400 && status !== 422) return {}
  const errors = error?.response?.data?.errors ?? error?.response?.data?.Errors
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) return {}
  return Object.entries(errors).reduce((acc, [key, value]) => {
    const field = toFieldKey(key)
    const message = String(firstMessage(value)).trim()
    if (field && message) acc[field] = message
    return acc
  }, {})
}

// The banner/toast text for a failed live-class create or update. A 409 or
// 5xx carrying a server exception is the backend failing, so it gets the
// generic "couldn't create" text instead of the raw exception or a
// "check your details" hint; a network failure gets its own message.
export const liveClassSaveErrorMessage = (error, { mode = 'create' } = {}) => {
  const failed = mode === 'update' ? LIVE_CLASS_UPDATE_FAILED : LIVE_CLASS_CREATE_FAILED
  const status = error?.response?.status
  if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error' || error?.code === 'ECONNABORTED')) {
    return LIVE_CLASS_NETWORK_FAILED
  }
  if (status >= 500) return failed
  if (status === 409) return safeServerMessage(error) || failed
  if (status === 400 || status === 422) return safeServerMessage(error) || 'Please check the highlighted fields and try again.'
  if (!error?.response) return failed
  return getApiErrorMessage(error, failed)
}

// DEV-only diagnostics: status, endpoint and the backend's message, truncated.
// Never the request headers or token.
export const logLiveClassSaveError = (error, endpoint) => {
  if (!import.meta.env.DEV) return
  console.error('[Live Class API] SAVE FAILED', {
    status: error?.response?.status ?? null,
    endpoint,
    message: (serverMessage(error) || error?.message || '').slice(0, 300),
  })
}
