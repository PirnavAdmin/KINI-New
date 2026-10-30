const asDate = (value) => value instanceof Date ? value : new Date(value)

export const SESSION_STATUSES = ['scheduled', 'starting-soon', 'live', 'completed', 'cancelled']

export function deriveSessionStatus(session, now = new Date()) {
  if (!session) return 'scheduled'
  if (session.status === 'cancelled') return 'cancelled'
  // Completion must be confirmed by an authorized backend/mentor flow.  A
  // scheduled end time or a student leaving the meeting is not proof that a
  // Zoom occurrence has ended, particularly for delayed or recurring classes.
  if (session.status === 'completed' || session.mentorEnded || session.actualEndedAt) return 'completed'
  if (session.status === 'live' || session.mentorStarted) return 'live'

  const current = asDate(now).getTime()
  const start = asDate(session.startAt || session.scheduledStart).getTime()
  if (Number.isFinite(start) && start - current <= 15 * 60_000 && start > current) return 'starting-soon'
  return 'scheduled'
}

export function getRecordingState(session) {
  const value = String(session?.recordingStatus ?? session?.recordingState ?? '').trim().toLowerCase()
  const states = {
    configured: 'configured',
    'in-progress': 'in-progress',
    inprogress: 'in-progress',
    processing: 'processing',
    ready: 'available',
    available: 'available',
    completed: 'available',
    failed: 'failed',
    unavailable: 'unavailable',
  }
  if (states[value]) return states[value]
  // A URL supplied by the authorized backend is the only fallback that can
  // establish recording availability; never infer it from Join or class time.
  return session?.recordingUrl ? 'available' : 'unavailable'
}

export function isAssessmentUnlocked(session, progress = {}) {
  if (!session?.test?.available && !session?.assessmentId) return false
  switch (session.assessmentUnlockRule) {
    case 'after-live-attendance': return Boolean(progress.attendedLive || progress.recordingWatchedPct >= 90)
    case 'after-recording-watched': return progress.recordingWatchedPct >= 90
    case 'manual': return Boolean(progress.assessmentUnlocked)
    default: return session.status === 'completed' || Boolean(session.actualEndedAt)
  }
}
