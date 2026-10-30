import { useCallback, useEffect, useState } from 'react'
import { createConversation, getConversations } from '@shared/services/chatService'

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  for (const key of ['data', 'conversations', 'items']) {
    if (Array.isArray(payload[key])) return payload[key]
  }
  return []
}

// Field names below are taken verbatim from a live GET /api/v1/chat/conversations
// (POST-create variant confirmed) response:
// { conversationId, mentor: {id,name,email,role}, student: {id,name,email,role},
//   lastMessage, lastMessageAt, unreadCount, createdAt }
// Both sides of a conversation are always present in the response — the same
// conversation just displays the OTHER party depending on who is viewing it:
// a mentor sees the student's name/email as the conversation's identity, a
// student sees the mentor's. studentId/mentorId are kept on every item either
// way, since both are genuinely present in every real response.
const normalizeConversation = (conversation = {}, viewerRole = 'mentor') => {
  const student = conversation.student ?? {}
  const mentor = conversation.mentor ?? {}
  const studentId = student.id ?? student.studentId ?? null
  const mentorId = mentor.id ?? mentor.mentorId ?? conversation.mentorId ?? null
  const conversationId = conversation.conversationId ?? conversation.id
  const isStudentViewer = viewerRole === 'student'
  const other = isStudentViewer ? mentor : student
  const otherId = isStudentViewer ? mentorId : studentId
  const fallbackLabel = isStudentViewer ? 'Mentor' : 'Student'
  const name = other.name || (otherId != null ? `${fallbackLabel} ${otherId}` : fallbackLabel)
  return {
    id: String(conversationId),
    conversationId,
    studentId,
    mentorId,
    name,
    email: other.email ?? '',
    initials: name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || fallbackLabel.slice(0, 2).toUpperCase(),
    lastMessage: conversation.lastMessage ?? null,
    lastMessageAt: conversation.lastMessageAt ?? null,
    unreadCount: Number.isFinite(conversation.unreadCount) ? conversation.unreadCount : 0,
    createdAt: conversation.createdAt ?? null,
  }
}

// The one real source of "conversations the currently logged-in user
// actually has" — GET /api/v1/chat/conversations resolves the caller
// (mentor or student) from the authenticated JWT server-side, so this can
// never return another user's conversations.
export function useConversations({ viewerRole = 'mentor' } = {}) {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // The axios error itself, so callers can tell 401/403/404/5xx apart.
  const [errorDetail, setErrorDetail] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadConversations = async () => {
      setLoading(true)
      setError('')
      setErrorDetail(null)
      try {
        const payload = await getConversations()
        if (!active) return
        setConversations(extractList(payload).map((item) => normalizeConversation(item, viewerRole)))
        setLoading(false)
      } catch (requestError) {
        if (!active) return
        setConversations([])
        setError(requestError?.response?.data?.message ?? 'Unable to load conversations.')
        setErrorDetail(requestError)
        setLoading(false)
      }
    }
    loadConversations()
    return () => { active = false }
  }, [reloadKey, viewerRole])

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  const upsertConversation = useCallback((conversation) => {
    const next = normalizeConversation(conversation, viewerRole)
    setConversations((current) => {
      const exists = current.some((item) => item.id === next.id)
      return exists ? current.map((item) => (item.id === next.id ? { ...item, ...next } : item)) : [next, ...current]
    })
    return next
  }, [viewerRole])

  const markLocalRead = useCallback((conversationId) => {
    setConversations((current) => current.map((item) => (
      item.id === String(conversationId) ? { ...item, unreadCount: 0 } : item
    )))
  }, [])

  // POST /conversations is confirmed idempotent on the backend (returns the
  // existing conversation instead of erroring/duplicating), but callers
  // should still prefer an already-loaded conversation from `conversations`
  // when one exists, to avoid an unnecessary round trip. A mentor starting a
  // conversation sends { studentId }; a student starting one sends
  // { mentorId } — never the caller's own id, which the backend already
  // knows from the JWT.
  const startConversation = useCallback(async (otherPartyId) => {
    const payload = viewerRole === 'student' ? { mentorId: Number(otherPartyId) } : { studentId: Number(otherPartyId) }
    const created = await createConversation(payload)
    return upsertConversation(created)
  }, [upsertConversation, viewerRole])

  return { conversations, loading, error, errorDetail, reload, startConversation, markLocalRead, upsertConversation }
}

export default useConversations
