import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { deleteAttachment, getMessages, markConversationRead, sendMessage, uploadAttachment } from '@shared/services/chatService'
import { chatErrorMessage } from '@shared/utils/chatErrors'

const formatDate = (iso) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return date.toDateString() === new Date().toDateString() ? `Today, ${label}` : label
}
const formatTime = (iso) => {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

const normalizeMessage = (message, role) => ({
  id: message.messageId,
  conversationId: message.conversationId,
  text: message.message ?? '',
  senderId: message.senderId,
  senderType: message.senderType,
  outgoing: String(message.senderType ?? '').toLowerCase() === role,
  sentAt: message.sentAt,
  date: message.sentAt ? formatDate(message.sentAt) : '',
  time: message.sentAt ? formatTime(message.sentAt) : '',
  read: Boolean(message.isRead),
  readAt: message.readAt ?? null,
  // Verified from the user's GET messages response on 2026-09-23.
  // attachment.messageId may be null even when the parent message contains it.
  attachment: Number.isInteger(message.attachment?.attachmentId) ? {
    attachmentId: message.attachment.attachmentId,
    filename: message.attachment.originalFileName || message.attachment.fileName || 'Attachment',
    contentType: message.attachment.fileType ?? '',
    size: message.attachment.fileSize ?? null,
  } : null,
})

export function useConversationMessages(conversationId, onMarkedRead, viewerRole = 'mentor') {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const uploadBusy = useRef(false)
  const pendingAttachments = useRef(new Map())
  const sessionRef = useRef(null)
  const readCallback = useRef(onMarkedRead)
  useEffect(() => { readCallback.current = onMarkedRead }, [onMarkedRead])

  useEffect(() => {
    const session = { active: true, pending: null, timer: null, sending: false }
    sessionRef.current = session
    queueMicrotask(() => {
      if (!session.active) return
      setMessages([])
      setError('')
      setSending(false)
      setLoading(conversationId != null)
    })
    session.refresh = () => {
      if (session.pending) return session.pending
      session.pending = (async () => {
        const payload = await getMessages(conversationId)
        const rows = Array.isArray(payload) ? payload : payload?.data
        if (!Array.isArray(rows)) throw new Error('Unrecognized messages response.')
        if (session.active) {
          setMessages(rows.map((row) => normalizeMessage(row, viewerRole)))
          setError('')
        }
        return rows
      })().finally(() => { session.pending = null })
      return session.pending
    }
    const poll = async (initial = false) => {
      try {
        await session.refresh()
        if (session.active) {
          await markConversationRead(conversationId)
          if (session.active) readCallback.current?.(conversationId)
        }
      } catch (failure) {
        if (session.active) {
          const message = chatErrorMessage(failure, 'Unable to refresh this conversation.')
          if (initial) setError(message)
          else toast.error(message, { id: 'chat-refresh' })
        }
      } finally {
        if (session.active) {
          setLoading(false)
          session.timer = window.setTimeout(() => poll(), 8000)
        }
      }
    }
    if (conversationId != null) poll(true)
    return () => {
      session.active = false
      window.clearTimeout(session.timer)
    }
  }, [conversationId, viewerRole])

  const send = useCallback(async (text) => {
    const session = sessionRef.current
    if (!text.trim() || conversationId == null || !session?.active || session.sending) return
    session.sending = true
    setSending(true)
    try {
      const created = await sendMessage(conversationId, text.trim())
      if (session.active && created?.messageId != null) {
        setMessages((current) => [...current.filter((item) => item.id !== created.messageId), normalizeMessage(created, viewerRole)])
      }
      try {
        await session.pending
        if (session.active) await session.refresh()
      } catch (failure) {
        if (session.active) toast.error(chatErrorMessage(failure, 'Message sent, but refresh failed.'))
      }
    } finally {
      session.sending = false
      if (session.active) setSending(false)
    }
  }, [conversationId, viewerRole])

  const sendAttachment = useCallback(async (file, caption = '') => {
    const session = sessionRef.current
    if (!file || conversationId == null || !session?.active || uploadBusy.current) return
    uploadBusy.current = true
    setUploading(true)
    const key = JSON.stringify([conversationId, file.name, file.size, file.lastModified, caption])
    let operation = 'upload'
    const refresh = async () => {
      try { await session.pending } catch { /* A fresh read follows. */ }
      return session.refresh()
    }
    try {
      let pending = pendingAttachments.current.get(key)
      if (!pending) {
        const uploaded = await uploadAttachment(conversationId, file, caption.trim())
        // Accept only explicit attachmentId, never generic id/messageId/URLs.
        const attachment = uploaded?.attachment ?? uploaded
        if (!Number.isInteger(attachment?.attachmentId) || attachment.attachmentId <= 0
          || (attachment.conversationId != null && String(attachment.conversationId) !== String(conversationId))) {
          if (import.meta.env.DEV) console.error('[Chat Attachment Response]', {
            conversationId, fields: Object.keys(uploaded ?? {}),
            attachmentFields: Object.keys(uploaded?.attachment ?? {}),
          })
          throw new Error('File uploaded, but the server did not return a valid attachment ID. Please share the upload response; do not upload again.')
        }
        pending = { attachmentId: attachment.attachmentId, linked: false }
        pendingAttachments.current.set(key, pending)
      }
      const isPersisted = (rows) => rows.some((row) => row.attachment?.attachmentId === pending.attachmentId)
      operation = 'check-message'
      let rows = await refresh()
      if (!isPersisted(rows) && !pending.linked) {
        operation = 'link-message'
        // Swagger-confirmed SendMessageDto. Upload and sending are separate
        // when GET messages does not yet contain this exact attachment ID.
        await sendMessage(conversationId, caption.trim() || null, pending.attachmentId)
        pending.linked = true
        operation = 'verify-message'
        rows = await refresh()
      }
      if (!isPersisted(rows)) {
        throw new Error('File uploaded, but its message is not returned by the server yet. Reopen this chat before uploading again.')
      }
      pendingAttachments.current.delete(key)
    } catch (failure) {
      if (import.meta.env.DEV) console.error('[Chat Attachment Error]', {
        operation, conversationId, status: failure?.response?.status ?? null,
      })
      throw failure
    } finally {
      uploadBusy.current = false
      setUploading(false)
    }
  }, [conversationId])

  const removeAttachment = useCallback(async (attachmentId) => {
    const session = sessionRef.current
    await deleteAttachment(attachmentId)
    await session?.pending
    if (session?.active) await session.refresh()
  }, [])

  return { messages, loading, error, sending, send, uploading, sendAttachment, removeAttachment }
}

export default useConversationMessages
