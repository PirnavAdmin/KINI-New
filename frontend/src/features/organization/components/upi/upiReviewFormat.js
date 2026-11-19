/** "PendingVerification" → "Pending Verification". */
export const statusLabel = (status) => String(status || 'Pending')
  .replace(/[_-]+/g, ' ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/\b\w/g, (letter) => letter.toUpperCase())

export const money = (value) => (value == null || Number.isNaN(Number(value)) ? '—' : `₹${Number(value).toLocaleString('en-IN')}`)

export const dateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/** True when the server refused the request for this account (HTTP 403). */
export const isForbidden = (error) => error?.response?.status === 403

/**
 * What a 403 tells us, for the permission panel: the call that was refused and
 * the server's own message (ASP.NET often sends an empty 403 body).
 */
export const describeForbidden = (error, readMessage) => ({
  endpoint: `${String(error?.config?.method ?? 'get').toUpperCase()} ${String(error?.config?.url ?? '').split('?')[0]}`,
  serverMessage: readMessage?.(error?.response?.data) || '',
})
