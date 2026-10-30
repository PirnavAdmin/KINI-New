import { hrField, hrList, hrRequest, downloadHrFile } from '@features/hr/services/hrApi'
import learningResources from '../data/learningResources.json'

export { learningResources }

const path = '/api/hr/resources'
const mimeExtensions = { 'application/pdf': 'pdf', 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'text/plain': 'txt', 'text/csv': 'csv', 'application/zip': 'zip' }

// API metadata can be a label object rather than a string. Never pass raw
// objects through to JSX (or to filename string methods).
const resourceText = (value, fallback = '', depth = 0) => {
  if (typeof value === 'string') return value.trim() || fallback
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (!value || typeof value !== 'object' || Array.isArray(value) || depth > 2) return fallback
  return resourceText(hrField(value, 'name', 'title', 'label', 'text', 'fileName', 'courseName', 'categoryName', 'value'), fallback, depth + 1)
}

export function normalizeResource(row) {
  const fileName = resourceText(hrField(row, 'fileName', 'originalFileName'))
  const rawType = resourceText(hrField(row, 'fileType', 'type', 'contentType'), fileName.split('.').slice(1).pop() || 'File').toLowerCase()
  const type = mimeExtensions[rawType] || rawType.replace(/^\./, '')
  const sizeKb = hrField(row, 'sizeKb')
  const rawSize = hrField(row, 'size')
  const size = rawSize && typeof rawSize === 'object'
    ? [resourceText(hrField(rawSize, 'value')), resourceText(hrField(rawSize, 'unit'))].filter(Boolean).join(' ')
    : resourceText(rawSize)
  const id = hrField(row, 'resourceId', 'id')
  return {
    id: (typeof id === 'number' && Number.isFinite(id)) || (typeof id === 'string' && id.trim()) ? id : null,
    title: resourceText(hrField(row, 'name', 'title'), fileName || 'Untitled resource'),
    course: resourceText(hrField(row, 'courseName', 'category', 'course'), 'Learning resource'),
    description: resourceText(hrField(row, 'description')),
    fileName, type,
    size: sizeKb != null && sizeKb !== '' && ['number', 'string'].includes(typeof sizeKb) && Number.isFinite(Number(sizeKb)) && Number(sizeKb) >= 0
      ? `${Number(sizeKb).toLocaleString()} KB` : size || 'Size not supplied',
  }
}

export async function listEmployeeResources(params, signal) {
  const data = await hrRequest('GET', path, { params, signal })
  const rows = hrList(data).filter(row => row && typeof row === 'object' && !Array.isArray(row)).map(normalizeResource)
  const total = hrField(data, 'totalCount', 'totalRecords', 'total')
  const totalPages = hrField(data, 'totalPages')
  return { rows, hasNext: totalPages != null ? params.Page < Number(totalPages) : total != null ? params.Page * params.Limit < Number(total) : rows.length === params.Limit }
}

export async function loadResourceFile(resource, action, signal) {
  const bundled = learningResources.find(item => item.id === resource.id && item.url === resource.url)
  let response
  if (bundled) {
    const result = await fetch(bundled.url, { signal })
    if (!result.ok) throw new Error('Unable to load this learning file. Refresh and try again.')
    response = { data: await result.blob(), headers: {} }
  } else {
    response = await hrRequest('GET', `${path}/{resourceId}/${action}`, { id: resource.id, binary: true, signal })
  }
  const blob = response.data
  if (!(blob instanceof Blob) || !blob.size) throw new Error('This resource has no attached file. Ask HR to upload it again.')
  const head = await blob.slice(0, 1024).text()
  const mime = blob.type.split(';')[0].toLowerCase()
  // A login page or JSON error must never be saved as a PDF.
  if (/^\s*(?:<!doctype html|<html)/i.test(head) || mime === 'text/html' || (mime.includes('json') && !['json', 'application/json'].includes(resource.type))) {
    throw new Error('The server returned a message instead of a file. Ask HR to check the attachment.')
  }
  const pdf = head.startsWith('%PDF-')
  if ((resource.type === 'pdf' || mime === 'application/pdf') && !pdf) throw new Error('This PDF is invalid. Ask HR to upload the original PDF again.')
  const file = pdf ? new Blob([blob], { type: 'application/pdf' }) : blob
  const extension = pdf ? 'pdf' : mimeExtensions[mime] || (/^[a-z0-9]{1,8}$/.test(resource.type) && resource.type !== 'file' && resource.type !== 'code' ? resource.type : 'bin')
  const filename = resource.fileName || `${resource.title.replace(/[<>:"/\\|?*]/g, '-')}.${extension}`
  return { response: { ...response, data: file }, blob: file, filename, pdf }
}

export const saveResourceFile = file => downloadHrFile(file.response, file.filename)

export function resourceError(error) {
  const status = error?.response?.status
  if (status === 401) return 'Your session has expired. Sign in again to access resources.'
  if (status === 403) return 'You do not have permission to access this resource.'
  if (status === 404) return 'This file is missing. Ask HR to upload the attachment again.'
  return error?.response ? 'Unable to load this resource. Please retry.' : resourceText(error?.message, 'Unable to load this resource. Please retry.')
}
