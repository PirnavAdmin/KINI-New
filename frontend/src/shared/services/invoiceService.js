import apiClient from './apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { getListPayload, getPayload } from './apiServices'
import { filenameFromDisposition } from '@shared/utils/download'

const pdfFromResponse = async (response) => {
  const blob = response.data
  const contentType = String(response.headers?.['content-type'] || blob?.type || '').toLowerCase()
  const signature = blob instanceof Blob ? await blob.slice(0, 5).text() : ''
  if (!(blob instanceof Blob) || !contentType.includes('application/pdf') || signature !== '%PDF-') {
    const error = new Error('The server did not return a valid invoice PDF.')
    error.response = response
    throw error
  }
  return { blob, filename: filenameFromDisposition(response) }
}

export const invoiceService = {
  list: (params = {}) => apiClient.get(API_ENDPOINTS.invoices.base, {
    params: { PageNumber: 1, PageSize: 1000, ...params },
  }).then(getListPayload),
  get: (invoiceId) => apiClient.get(API_ENDPOINTS.invoices.byId(invoiceId)).then(getPayload),
  create: (payload) => apiClient.post(API_ENDPOINTS.invoices.base, payload).then(getPayload),
  update: (invoiceId, payload) => apiClient.put(API_ENDPOINTS.invoices.byId(invoiceId), payload).then(getPayload),
  cancel: (invoiceId) => apiClient.post(API_ENDPOINTS.invoices.cancel(invoiceId), {}).then(getPayload),
  // Kept as an alias for the existing invoice-management screen. The backend
  // cancels invoices instead of deleting financial records.
  remove: (invoiceId) => apiClient.post(API_ENDPOINTS.invoices.cancel(invoiceId), {}).then(getPayload),
  pdf: (invoiceId) => apiClient.get(API_ENDPOINTS.invoices.pdf(invoiceId), { responseType: 'blob' }).then((response) => response.data),
  downloadPdf: (invoiceId) => apiClient.get(API_ENDPOINTS.invoices.pdf(invoiceId), {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  }).then(pdfFromResponse),
  sendEmail: (invoiceId, payload = {}) => apiClient
    .post(API_ENDPOINTS.invoices.sendEmail(invoiceId), payload)
    .then(getPayload),
}

export default invoiceService
