import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import { resolveUserId } from '@/services/profileService'
import { jitsiAttendanceService } from '@shared/services/jitsiAttendanceService'
import { loadJitsiScript } from '@shared/utils/loadJitsiScript'
import { resolveJitsiMeeting } from '@shared/utils/resolveJitsiRoom'
import { createJitsiAttendanceSession } from '@shared/utils/jitsiAttendanceSession'

const pick = (...values) => values.find((value) => value != null && value !== '') ?? ''

const newEventId = (liveClassId) => (
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${liveClassId}-${Date.now()}`
)

/**
 * Embeds ONE live class's Jitsi conference and owns its attendance lifecycle:
 *
 *   JitsiMeetExternalAPI created (no attendance yet)
 *     → student actually enters the conference → `videoConferenceJoined`
 *     → POST /api/jitsi-attendance/join   (once)
 *     → student hangs up / conference ends → `videoConferenceLeft` / `readyToClose`
 *     → POST /api/jitsi-attendance/leave  (once, only after a successful join)
 *     → api.dispose()
 *
 * Also covered:
 *  - unmount / in-app navigation while in class → /leave, then dispose
 *  - tab close / refresh while in class → keepalive /leave (Axios requests
 *    don't survive unload and Jitsi can't fire videoConferenceLeft then)
 *  - React StrictMode double-mount → the aborted first mount never creates an
 *    API instance, so no duplicate iframe, listener or attendance call
 *  - re-renders never tear the meeting down (effect keyed on the room only)
 *
 * The parent renders all chrome; progress is reported through onStatusChange:
 *   connecting | waiting | joining | started | in-class | leaving | recorded |
 *   join-failed | leave-failed | unsupported | error
 */
const JitsiMeeting = forwardRef(function JitsiMeeting({ liveClass, onStatusChange, onEnded, className = '' }, ref) {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const apiRef = useRef(null)
  const callbacksRef = useRef({ onStatusChange, onEnded })
  callbacksRef.current = { onStatusChange, onEnded }

  const liveClassId = liveClass?.id ?? liveClass?.liveClassId ?? liveClass?.classId
  const meeting = resolveJitsiMeeting(liveClass)
  const domain = meeting?.domain
  const roomName = meeting?.roomName
  const isJitsi = Boolean(meeting?.isJitsi)

  // Participant details are read at event time (not captured at mount), so a
  // late profile hydration still sends the real values.
  const participantRef = useRef({})
  participantRef.current = {
    participantId: resolveUserId(user),
    participantName: pick(user?.fullName, user?.name, [user?.firstName, user?.lastName].filter(Boolean).join(' '), 'Participant'),
    participantEmail: user?.email || null,
  }

  useImperativeHandle(ref, () => ({
    hangup: () => {
      if (apiRef.current) {
        apiRef.current.executeCommand('hangup')
        return true
      }
      return false
    },
  }), [])

  useEffect(() => {
    const report = (status, detail) => callbacksRef.current.onStatusChange?.(status, detail)

    if (!liveClassId) {
      report('error', 'This class has no valid ID yet.')
      return undefined
    }
    if (!meeting) {
      report('error', 'No meeting room is configured for this class yet.')
      return undefined
    }
    if (!isJitsi) {
      report('unsupported', meeting.externalUrl)
      return undefined
    }

    let active = true
    let ended = false
    const payload = (extra) => ({ liveClassId, ...participantRef.current, ...extra })

    const session = createJitsiAttendanceSession({
      createEventId: () => newEventId(liveClassId),
      sendJoin: ({ eventId }) => jitsiAttendanceService.join(payload({ eventId })),
      sendLeave: ({ eventId }) => jitsiAttendanceService.leave(payload({ eventId })),
      onStatus: (status, error) => report(status, error),
    })

    const handleJoined = () => { if (active) session.handleJoined() }

    const disposeApi = () => {
      const api = apiRef.current
      if (!api) return
      api.removeListener('videoConferenceJoined', handleJoined)
      api.removeListener('videoConferenceLeft', handleLeft)
      api.removeListener('readyToClose', handleLeft)
      try { api.dispose() } catch { /* iframe already gone */ }
      apiRef.current = null
    }

    // videoConferenceLeft and readyToClose usually both fire for one hang-up;
    // the session guard keeps it to a single /leave.
    function handleLeft() {
      if (ended) return
      ended = true
      session.handleLeft().finally(() => {
        disposeApi()
        if (active) callbacksRef.current.onEnded?.()
      })
    }

    const handlePageHide = () => {
      const pending = session.takeUnloadLeave()
      if (pending) jitsiAttendanceService.leaveOnUnload?.(payload({ eventId: pending.eventId }))
    }
    window.addEventListener('pagehide', handlePageHide)

    const start = async () => {
      report('connecting')
      let JitsiMeetExternalAPI
      try {
        JitsiMeetExternalAPI = await loadJitsiScript(domain)
      } catch {
        if (active) report('error', 'Unable to load the Jitsi Meet client. Check your connection and try again.')
        return
      }
      if (!active || !containerRef.current) return
      if (typeof JitsiMeetExternalAPI !== 'function') {
        report('error', 'The Jitsi Meet client did not initialise.')
        return
      }

      let api
      try {
        api = new JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: participantRef.current.participantName,
            email: participantRef.current.participantEmail || undefined,
          },
        })
      } catch {
        report('error', 'Unable to open the meeting room.')
        return
      }
      apiRef.current = api
      api.addListener('videoConferenceJoined', handleJoined)
      api.addListener('videoConferenceLeft', handleLeft)
      api.addListener('readyToClose', handleLeft)
      // Iframe is up; the student may still be on Jitsi's pre-join screen —
      // attendance does NOT start until videoConferenceJoined.
      report('waiting')
    }

    start()

    return () => {
      active = false
      window.removeEventListener('pagehide', handlePageHide)
      session.dispose()
      if (session.isJoined || session.state === 'joining') {
        // Unmounted while in class (Back button / in-app navigation): the
        // page is still alive, so the normal authenticated request is used.
        ended = true
        session.handleLeft().finally(disposeApi)
      } else {
        disposeApi()
      }
    }
    // Keyed on the room only — a user/profile refresh or parent re-render must
    // not tear down and rejoin a live meeting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveClassId, domain, roomName, isJitsi])

  return <div ref={containerRef} className={`h-full w-full ${className}`} />
})

export default JitsiMeeting
