import getApiErrorMessage from '@/utils/getApiErrorMessage'

export function notificationLoadError(error, source = 'Notifications') {
  if (Array.isArray(error?.feedErrors)) return error.feedErrors.join(' ')
  const status = error?.response?.status
  if (status === 401) return `${source}: your session has expired or was rejected. Please sign in again.`
  if (status === 403) return `${source}: this account does not have permission to read this feed.`
  if (error?.code === 'ERR_UNEXPECTED_HTML') return `${source}: the API returned a web page instead of data. Check the backend connection.`
  return `${source}${status ? ` (${status})` : ''}: ${getApiErrorMessage(error, 'Unable to load. Please try again.')}`
}
