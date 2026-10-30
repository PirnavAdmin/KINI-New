import apiClient, { getStoredAuthToken, NGROK_HEADERS } from './apiClient'
import { getPayload } from './apiServices'
import { API_ENDPOINTS } from '@/api/endpoints'

// Swagger-confirmed shape of TalentSphereAPI.DTOs.JitsiParticipantEventDto —
// additionalProperties: false, so only these five keys may be sent.
const toEventDto = ({ liveClassId, eventId, participantId, participantName, participantEmail }) => ({
  liveClassId: Number(liveClassId),
  eventId: eventId ?? null,
  participantId: participantId != null ? String(participantId) : null,
  participantName: participantName ?? null,
  participantEmail: participantEmail ?? null,
})

export const jitsiAttendanceService = {
  // A 401 here must not end a valid session mid-class; see skipAuthRedirect in apiClient.
  join: (payload) => apiClient.post(API_ENDPOINTS.jitsiAttendance.join, toEventDto(payload), { skipAuthRedirect: 'unless-expired' }).then(getPayload),
  leave: (payload) => apiClient.post(API_ENDPOINTS.jitsiAttendance.leave, toEventDto(payload), { skipAuthRedirect: 'unless-expired' }).then(getPayload),

  // Same POST /api/jitsi-attendance/leave with the same DTO and bearer token,
  // but sent with fetch({ keepalive: true }) so it survives the page being
  // closed/refreshed while the student is still in the conference (Axios
  // requests are cancelled on unload, and Jitsi never gets to fire
  // videoConferenceLeft in that case). Fire-and-forget by design.
  leaveOnUnload: (payload) => {
    if (typeof fetch !== 'function') return false
    try {
      const base = String(apiClient.defaults.baseURL || '').replace(/\/+$/, '')
      const token = getStoredAuthToken()
      fetch(`${base}${API_ENDPOINTS.jitsiAttendance.leave}`, {
        method: 'POST',
        keepalive: true,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...NGROK_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(toEventDto(payload)),
      }).catch(() => {})
      return true
    } catch {
      return false
    }
  },
}

export default jitsiAttendanceService
