// Resolves WHERE a live class's Jitsi conference lives: the Jitsi deployment
// (domain) and the room name. Every participant — mentor and students — must
// land in the same domain + room, so this is shared by the mentor modal and
// the student classroom page.
//
// The backend's live-class and Jitsi-attendance contracts (Swagger-confirmed)
// carry no jitsiRoomName/roomName field — JitsiParticipantEventDto only tracks
// { liveClassId, eventId, participantId, participantName, participantEmail }.
// So the room is read from the class's own stored meeting link when it is a
// Jitsi link, or otherwise derived from the class's own id — never a random or
// invented value.

const DEFAULT_DOMAIN = import.meta.env?.VITE_JITSI_DOMAIN || 'meet.jit.si'

const normalizeHost = (value) => String(value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')

// Meeting links that are clearly NOT Jitsi — embedding these as a Jitsi room
// would put the student in an empty, unrelated conference.
const NON_JITSI_HOSTS = [
  'zoom.us', 'zoom.com', 'meet.google.com', 'teams.microsoft.com', 'teams.live.com',
  'webex.com', 'gotomeeting.com', 'whereby.com', 'bluejeans.com', 'skype.com',
]

const isNonJitsiHost = (host) => NON_JITSI_HOSTS.some((item) => host === item || host.endsWith(`.${item}`))

const platformOf = (liveClass) => String(
  liveClass?.meetingPlatform ?? liveClass?.platform ?? liveClass?.meetingPlatformName ?? '',
).trim().toLowerCase()

const classIdOf = (liveClass) => liveClass?.id ?? liveClass?.liveClassId ?? liveClass?.classId

const meetingUrlOf = (liveClass) => String(liveClass?.meetingUrl || liveClass?.meetingLink || liveClass?.joinUrl || '').trim()

/**
 * @returns {{ domain: string, roomName: string, isJitsi: boolean, externalUrl: string } | null}
 *   isJitsi=false means the class uses another meeting platform — it cannot be
 *   embedded (and its attendance cannot be tracked through Jitsi events).
 */
export function resolveJitsiMeeting(liveClass, defaultDomain = DEFAULT_DOMAIN) {
  const id = classIdOf(liveClass)
  const url = meetingUrlOf(liveClass)
  const platform = platformOf(liveClass)
  const domain = normalizeHost(defaultDomain) || 'meet.jit.si'

  if (url) {
    let parsed = null
    try {
      parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(url) ? url : `https://${url}`)
    } catch {
      parsed = null
    }

    if (parsed && parsed.hostname.includes('.')) {
      const host = parsed.hostname.toLowerCase()
      const segment = parsed.pathname.split('/').filter(Boolean).pop()
      const platformIsOther = /zoom|google|teams|webex|skype|gotomeeting|whereby|bluejeans/.test(platform)
      if (isNonJitsiHost(host) || (platformIsOther && !host.includes('jit'))) {
        return { domain: host, roomName: '', isJitsi: false, externalUrl: parsed.href }
      }
      if (segment) {
        // Keep the link's own Jitsi deployment (self-hosted / 8x8.vc / …)
        // instead of forcing the default domain onto someone else's room.
        return { domain: parsed.host.toLowerCase(), roomName: decodeURIComponent(segment), isJitsi: true, externalUrl: parsed.href }
      }
    } else {
      // A bare room name was stored instead of a full link.
      const trimmed = url.replace(/^\/+/, '')
      if (trimmed && !/\s/.test(trimmed)) return { domain, roomName: trimmed, isJitsi: true, externalUrl: '' }
    }
  }

  if (id != null && id !== '') return { domain, roomName: `KiniEduHub-LiveClass-${id}`, isJitsi: true, externalUrl: '' }
  return null
}

// Back-compat helper (room name only).
export function resolveJitsiRoomName(liveClass) {
  const meeting = resolveJitsiMeeting(liveClass)
  return meeting?.isJitsi ? meeting.roomName : null
}

export default resolveJitsiRoomName
