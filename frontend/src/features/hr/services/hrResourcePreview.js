export async function resourcePreviewBlob(response) {
  const blob = response.data
  if (!(blob instanceof Blob) || !blob.size) throw new Error('The server did not return a resource file.')
  const type = (blob.type || response.headers?.['content-type'] || '').split(';')[0].toLowerCase()
  const signature = await blob.slice(0, 5).text()
  if (signature === '%PDF-') return new Blob([blob], { type: 'application/pdf' })
  if (type === 'application/pdf') throw new Error('The server returned an invalid PDF document.')
  if (['image/png', 'image/jpeg', 'image/webp', 'text/plain'].includes(type)) return new Blob([blob], { type })
  if (/json|html/.test(type)) {
    let message
    try { const body = JSON.parse(await blob.text()); message = body.message || body.error?.message } catch { /* Keep the readable fallback. */ }
    throw new Error(message || 'The server returned an error instead of the resource document.')
  }
  throw new Error('Preview is not available for this file type. Use Download to open it.')
}
