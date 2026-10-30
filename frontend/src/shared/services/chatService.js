import apiClient from './apiClient'
import { API_ENDPOINTS } from '@/api/endpoints'
import { extractApiData, logApiError, logApiRequest, logApiSuccess } from './apiModuleHelpers'
import { filenameFromDisposition } from '@shared/utils/download'

const sendRequest = async (method, endpoint, executor, payload) => {
  logApiRequest(method, endpoint, payload)
  try {
    const response = await executor()
    logApiSuccess(response)
    const body = extractApiData(response)
    // Every Chat endpoint response confirmed live (POST conversations, POST
    // messages, GET messages) uses the same { success, message?, data }
    // envelope — unwrap to the actual payload, falling back to the raw body
    // if a response ever doesn't follow that shape.
    return body?.data ?? body
  } catch (error) {
    logApiError(error)
    throw error
  }
}

// GET /api/v1/chat/conversations — conversations for the authenticated
// mentor. The backend resolves the mentor from the JWT; no mentorId is ever
// sent from the frontend.
export const getConversations = () =>
  sendRequest('GET', API_ENDPOINTS.chat.conversations, () => apiClient.get(API_ENDPOINTS.chat.conversations))

// POST /api/v1/chat/conversations — Swagger-confirmed body: CreateConversationDto
// { studentId, mentorId } (both nullable). A mentor starting a conversation
// passes only { studentId } (the backend resolves the calling mentor from the
// JWT); a student starting one passes only { mentorId } (the backend resolves
// the calling student the same way) — never both, and never the caller's own
// id. Confirmed idempotent live: calling this for a student/mentor pair that
// already has a conversation returns the existing conversation ("Conversation
// ready.") instead of creating a duplicate.
export const createConversation = (payload) =>
  sendRequest('POST', API_ENDPOINTS.chat.conversations, () => apiClient.post(API_ENDPOINTS.chat.conversations, payload), payload)

// GET /api/v1/chat/conversations/{conversationId}/messages — Swagger-confirmed
// query params: page (default 1), pageSize (default 50).
export const getMessages = (conversationId, { page = 1, pageSize = 50 } = {}) =>
  sendRequest(
    'GET',
    API_ENDPOINTS.chat.messages(conversationId),
    () => apiClient.get(API_ENDPOINTS.chat.messages(conversationId), { params: { page, pageSize } }),
    { conversationId, page, pageSize },
  )

// POST /api/v1/chat/conversations/{conversationId}/messages — Swagger-confirmed
// body: SendMessageDto { message, attachmentId? } (verified 2026-09-23).
export const sendMessage = (conversationId, message, attachmentId) =>
  sendRequest(
    'POST',
    API_ENDPOINTS.chat.messages(conversationId),
    () => apiClient.post(API_ENDPOINTS.chat.messages(conversationId), { message, ...(attachmentId == null ? {} : { attachmentId }) }),
    { conversationId, message, attachmentId },
  )

// PUT /api/v1/chat/conversations/{conversationId}/read — Swagger-confirmed:
// no request body.
export const markConversationRead = (conversationId) =>
  sendRequest('PUT', API_ENDPOINTS.chat.read(conversationId), () => apiClient.put(API_ENDPOINTS.chat.read(conversationId)), { conversationId })

// POST /api/v1/chat/conversations/{conversationId}/attachments — Swagger-
// confirmed multipart/form-data fields: "file" (binary) + "message" (string,
// optional caption). No response schema is declared for this endpoint in
// Swagger, so the returned shape is unconfirmed; sendRequest's usual
// { success, data } unwrap is retained. The UI does not interpret this body;
// it refreshes GET messages and renders the verified nested attachment object.
export const uploadAttachment = (conversationId, file, message = '') => {
  const formData = new FormData()
  formData.append('file', file)
  if (message) formData.append('message', message)
  return sendRequest(
    'POST',
    API_ENDPOINTS.chat.attachments(conversationId),
    () => apiClient.post(API_ENDPOINTS.chat.attachments(conversationId), formData, {
      // Let the browser/Axios set the multipart boundary automatically —
      // apiClient's request interceptor already strips any Content-Type
      // header when the body is FormData, so none is set here.
      headers: { Accept: 'application/json' },
    }),
    // Log the file's name/size, never the binary itself.
    { conversationId, fileName: file?.name, fileSize: file?.size, hasMessage: Boolean(message) },
  )
}

// GET /api/v1/chat/attachments/{attachmentId}/view — Swagger-confirmed: only
// the path id, no request body, no declared response schema (presumed to be
// the raw file bytes with a real Content-Type, for inline/browser viewing).
// Fetched as a blob through the authenticated client rather than built as a
// bare URL, since the endpoint is behind auth like every other Chat route.
export const viewAttachment = (attachmentId) =>
  apiClient
    .get(API_ENDPOINTS.chat.attachmentView(attachmentId), { responseType: 'blob' })
    .then((response) => ({
      blob: response.data,
      filename: filenameFromDisposition(response),
      contentType: response.headers?.['content-type'] || response.data?.type || '',
    }))

// GET /api/v1/chat/attachments/{attachmentId}/download — same shape as view()
// above; kept as a separate call because it's a distinct backend route (the
// server may set a different Content-Disposition, e.g. "attachment" vs
// "inline") even though the client-side handling is identical.
export const downloadAttachment = (attachmentId) =>
  apiClient
    .get(API_ENDPOINTS.chat.attachmentDownload(attachmentId), { responseType: 'blob' })
    .then((response) => ({
      blob: response.data,
      filename: filenameFromDisposition(response),
      contentType: response.headers?.['content-type'] || response.data?.type || '',
    }))

// DELETE /api/v1/chat/attachments/{attachmentId} — Swagger-confirmed: only
// the path id, 200 OK with no declared response body.
export const deleteAttachment = (attachmentId) =>
  sendRequest(
    'DELETE',
    API_ENDPOINTS.chat.attachmentById(attachmentId),
    () => apiClient.delete(API_ENDPOINTS.chat.attachmentById(attachmentId)),
    { attachmentId },
  )

export const chatService = {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  uploadAttachment,
  viewAttachment,
  downloadAttachment,
  deleteAttachment,
}

export default chatService
