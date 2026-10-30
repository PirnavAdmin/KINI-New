import { getConversations, getMessages, uploadAttachment } from '@shared/services/chatService'

// Developer-only probe. Uses the current browser's normal authenticated client.
// It uploads the explicitly selected test file, but never guesses a message link
// or deletes anything. The returned report contains structure, not message text,
// names, email addresses, file contents, tokens, or request headers.
const shape = (value, depth = 0) => {
  if (depth > 8) return '[depth limit]'
  if (value === null) return 'null'
  if (Array.isArray(value)) return value.slice(0, 3).map((item) => shape(item, depth + 1))
  if (typeof value !== 'object') return typeof value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item, depth + 1)]))
}
const rows = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  throw new Error('Unexpected list response. No upload attempted.')
}
const selectFile = () => new Promise((resolve) => {
  const input = document.createElement('input')
  input.type = 'file'
  input.hidden = true
  document.body.appendChild(input)
  const finish = (file) => { input.remove(); resolve(file) }
  input.addEventListener('change', () => finish(input.files?.[0] ?? null), { once: true })
  input.addEventListener('cancel', () => finish(null), { once: true })
  input.click()
})

export async function inspectAttachmentContract() {
  if (!import.meta.env.DEV) throw new Error('This diagnostic is available only in development.')
  const mentorPage = window.location.pathname === '/mentor/messages'
  const studentPage = window.location.pathname === '/student/mentor-chat'
  if (!mentorPage && !studentPage) throw new Error('Open the selected mentor/student conversation first.')
  const parameter = mentorPage ? 'studentId' : 'mentorId'
  const selectedId = new URLSearchParams(window.location.search).get(parameter)
  if (!selectedId) throw new Error('Select a conversation first.')
  const conversations = rows(await getConversations())
  const matches = conversations.filter((item) => String(item[mentorPage ? 'student' : 'mentor']?.id) === selectedId)
  if (matches.length !== 1 || !Number.isInteger(matches[0].conversationId)) {
    throw new Error('Could not uniquely resolve the conversation. No upload attempted.')
  }
  const conversationId = matches[0].conversationId
  const before = rows(await getMessages(conversationId))
  const file = await selectFile()
  if (!file) return { cancelled: true }
  if (!window.confirm('Upload this test file to the selected chat to inspect the attachment API? It may remain on the server.')) return { cancelled: true }
  let operation = 'upload'
  try {
    const response = await uploadAttachment(conversationId, file)
    const report = { conversationId, uploadResponseShape: shape(response) }
    // Record the upload shape even if fetching persisted messages fails.
    console.info('[Chat Attachment Contract] upload', JSON.stringify(report, null, 2))
    operation = 'get-messages-after-upload'
    const after = rows(await getMessages(conversationId))
    const beforeIds = new Set(before.map((item) => item.messageId))
    const added = after.filter((item) => !beforeIds.has(item.messageId))
    report.newMessageCount = added.length
    report.newMessageShapes = added.map((item) => shape(item))
    report.note = 'New messages are observations only; concurrent senders can also create them. No linking request was made.'
    console.info('[Chat Attachment Contract] report', JSON.stringify(report, null, 2))
    return report
  } catch (error) {
    console.error('[Chat Attachment Contract] failure', {
      operation, conversationId, status: error?.response?.status ?? null,
      responseShape: shape(error?.response?.data),
    })
    return { failed: true, operation, status: error?.response?.status ?? null }
  }
}
