import { useEffect, useRef, useState } from 'react'
import { Download, Eye, FileText, Image as ImageIcon, Paperclip, Upload } from 'lucide-react'
import './leave-attachments.css'
import { hrField } from '../services/hrApi'
import leaveAttachmentService from '@shared/services/leaveAttachmentService'
import { getApiErrorMessage } from '@shared/services/apiServices'
import { triggerFileDownload } from '@shared/utils/download'

const documentKeys = ['attachments', 'documents', 'supportingDocuments', 'attachment', 'attachmentUrl', 'documentUrl', 'medicalCertificateUrl']
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const MAX_BYTES = 5 * 1024 * 1024

function documentUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null
  const path = value.trim().replace(/\\/g, '/')
  try {
    const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
    const url = new URL(path, base.endsWith('/') ? base : `${base}/`)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

const sizeLabel = (bytes) => {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return ''
  return n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`
}

// Stored attachments from the leave APIs (private: opened with the signed-in user's token).
function apiAttachments(items) {
  return items
    .filter(item => item && typeof item === 'object' && hrField(item, 'attachmentId') != null)
    .map(item => ({
      attachmentId: hrField(item, 'attachmentId'),
      fileName: hrField(item, 'fileName') || 'Supporting document',
      contentType: hrField(item, 'contentType') || '',
      fileSize: hrField(item, 'fileSize'),
      viewUrl: hrField(item, 'viewUrl') || '',
      downloadUrl: hrField(item, 'downloadUrl') || '',
    }))
}

// Older/other servers may return plain public file URLs.
function linkAttachments(items) {
  return items.filter(item => !(item && typeof item === 'object' && hrField(item, 'attachmentId') != null)).map(item => {
    const url = documentUrl(typeof item === 'string' ? item : hrField(item, 'url', 'fileUrl', 'downloadUrl', 'documentUrl', 'attachmentUrl', 'path'))
    if (!url) return null
    const name = typeof item === 'object' && hrField(item, 'fileName', 'name', 'originalFileName')
    let fallback = 'Supporting document'
    try { fallback = decodeURIComponent(new URL(url).pathname.split('/').pop()) || fallback } catch { /* Use the readable fallback. */ }
    return { url, name: name || fallback }
  }).filter(Boolean).filter((file, index, all) => all.findIndex(other => other.url === file.url) === index)
}

/**
 * Supporting documents of a leave request.
 * - `value`: leave record (HR details already include `attachments`).
 * - `leaveId`: when given, the list is loaded from GET /api/hr/leave/{id}/attachments.
 * - `allowUpload`: lets the owner add a document (pending requests only).
 */
export default function LeaveAttachments({ value, leaveId = null, allowUpload = false }) {
  const raw = documentKeys.flatMap(key => {
    const item = hrField(value, key)
    return item == null ? [] : Array.isArray(item) ? item : [item]
  })
  const [loaded, setLoaded] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    if (leaveId == null) return undefined
    const controller = new AbortController()
    leaveAttachmentService.list(leaveId, controller.signal)
      .then(rows => { if (!controller.signal.aborted) setLoaded(rows) })
      .catch(err => { if (!controller.signal.aborted && err?.name !== 'CanceledError') setError(getApiErrorMessage(err, 'Supporting documents could not be loaded.')) })
    return () => controller.abort()
  }, [leaveId])

  const stored = apiAttachments(loaded ?? raw)
  const links = linkAttachments(raw)

  const open = async (attachment, mode) => {
    setError('')
    // Open the tab synchronously so pop-up blockers allow it; fill it once the file arrives.
    const tab = mode === 'view' ? window.open('', '_blank') : null
    setBusy(`${mode}-${attachment.attachmentId}`)
    try {
      const blob = await leaveAttachmentService.fetchFile(attachment, mode)
      if (mode === 'download') {
        triggerFileDownload(blob, attachment.fileName)
      } else {
        const url = URL.createObjectURL(blob)
        if (tab) tab.location.href = url
        else window.open(url, '_blank', 'noopener')
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      }
    } catch (err) {
      tab?.close()
      setError(getApiErrorMessage(err, 'The document could not be opened.'))
    } finally {
      setBusy(null)
    }
  }

  const upload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    if (!ACCEPTED_TYPES.includes(file.type)) { setError('Attachment must be a PDF, JPG or PNG file.'); return }
    if (file.size > MAX_BYTES) { setError('Attachment must be 5 MB or smaller.'); return }
    setBusy('upload')
    try {
      const saved = await leaveAttachmentService.upload(leaveId, file)
      setLoaded(current => [...(current ?? apiAttachments(raw)), saved])
    } catch (err) {
      setError(getApiErrorMessage(err, 'The document could not be uploaded.'))
    } finally {
      setBusy(null)
    }
  }

  const empty = !stored.length && !links.length
  const FileIcon = file => (String(file.contentType).startsWith('image/') || /\.(jpe?g|png)$/i.test(file.fileName || file.name || '') ? ImageIcon : FileText)
  return <section aria-label="Supporting documents" className="lad">
    <div className="lad__head">
      <span className="lad__head-icon" aria-hidden="true"><Paperclip /></span>
      <h3 className="lad__title">Supporting Documents</h3>
      {allowUpload && leaveId != null && <>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={upload} aria-label="Choose a supporting document" />
        <button type="button" disabled={busy === 'upload'} onClick={() => fileRef.current?.click()} className="lad__btn is-outline lad__add"><Upload aria-hidden="true" />{busy === 'upload' ? 'Uploading…' : 'Add document'}</button>
      </>}
    </div>
    {error && <p role="alert" className="lad__error">{error}</p>}
    {!empty && <ul className="lad__list">
      {stored.map(file => {
        const Icon = FileIcon(file)
        return <li key={`a-${file.attachmentId}`} className="lad__item">
          <span className="lad__file-icon" aria-hidden="true"><Icon /></span>
          <span className="lad__name">{file.fileName}</span>
          {sizeLabel(file.fileSize) && <span className="lad__size">{sizeLabel(file.fileSize)}</span>}
          <span className="lad__actions">
            <button type="button" disabled={busy != null} onClick={() => open(file, 'view')} className="lad__btn is-outline"><Eye aria-hidden="true" />{busy === `view-${file.attachmentId}` ? 'Opening…' : 'View'}<span className="sr-only">: {file.fileName}</span></button>
            <button type="button" disabled={busy != null} onClick={() => open(file, 'download')} className="lad__btn is-solid"><Download aria-hidden="true" />{busy === `download-${file.attachmentId}` ? 'Downloading…' : 'Download'}<span className="sr-only">: {file.fileName}</span></button>
          </span>
        </li>
      })}
      {links.map(file => {
        const Icon = FileIcon(file)
        return <li key={file.url} className="lad__item">
          <span className="lad__file-icon" aria-hidden="true"><Icon /></span>
          <span className="lad__name">{file.name}</span>
          <span className="lad__actions">
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="lad__btn is-outline"><Eye aria-hidden="true" />View document<span className="sr-only">: {file.name} (opens in a new tab)</span></a>
          </span>
        </li>
      })}
    </ul>}
    {empty && <p className="lad__empty">{leaveId != null && loaded === null && !error ? 'Loading documents…' : 'No supporting documents were returned for this request.'}</p>}
  </section>
}
