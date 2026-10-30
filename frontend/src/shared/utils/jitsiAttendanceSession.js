// Framework-free attendance state machine for ONE embedded Jitsi session.
//
// Jitsi conference events are the only source of truth:
//   videoConferenceJoined → join()  (at most once while "in class")
//   videoConferenceLeft   → leave() (at most once, and only after a join)
//   readyToClose          → leave() (same guard — never a second record)
//
// Reconnects: if Jitsi drops the conference and re-joins it inside the same
// page session, a join that follows a completed leave starts a NEW attendance
// session (new eventId) instead of silently being ignored — so the student's
// time after reconnecting is still recorded, without ever duplicating a
// join/leave pair.
//
// Statuses reported through onStatus:
//   connecting | joining | started | in-class | leaving | recorded | join-failed | leave-failed

export function createJitsiAttendanceSession({ sendJoin, sendLeave, createEventId, onStatus } = {}) {
  let state = 'idle' // idle | joining | joined | leaving | left
  let eventId = null
  let pendingJoin = null
  let disposed = false
  let startedTimer = null

  const emit = (status, detail) => {
    if (!disposed || status === 'recorded' || status === 'leave-failed') onStatus?.(status, detail)
  }

  const handleJoined = () => {
    if (disposed || state === 'joining' || state === 'joined') return pendingJoin
    state = 'joining'
    eventId = createEventId?.() ?? null
    emit('joining')
    pendingJoin = Promise.resolve()
      .then(() => sendJoin({ eventId }))
      .then(() => {
        if (state !== 'joining') return
        state = 'joined'
        emit('started')
        clearTimeout(startedTimer)
        startedTimer = setTimeout(() => { if (state === 'joined') emit('in-class') }, 2500)
      })
      .catch((error) => {
        // The student is still in the conference; a later /leave for a join
        // the backend never accepted would be an orphan record.
        if (state === 'joining') state = 'idle'
        emit('join-failed', error)
      })
    return pendingJoin
  }

  const handleLeft = async () => {
    if (state === 'joining') {
      // Leave raced a join still in flight — wait so /leave never lands
      // before its /join on the server.
      await pendingJoin?.catch(() => {})
    }
    if (state !== 'joined') return false
    state = 'leaving'
    clearTimeout(startedTimer)
    emit('leaving')
    try {
      await sendLeave({ eventId })
      state = 'left'
      emit('recorded')
      return true
    } catch (error) {
      state = 'left'
      emit('leave-failed', error)
      return false
    }
  }

  return {
    handleJoined,
    handleLeft,
    /** Synchronous snapshot for page-unload leave (keepalive request). */
    takeUnloadLeave() {
      if (state !== 'joined') return null
      state = 'left'
      clearTimeout(startedTimer)
      return { eventId }
    },
    get state() { return state },
    get eventId() { return eventId },
    get isJoined() { return state === 'joined' },
    dispose() {
      disposed = true
      clearTimeout(startedTimer)
    },
  }
}

export default createJitsiAttendanceSession
