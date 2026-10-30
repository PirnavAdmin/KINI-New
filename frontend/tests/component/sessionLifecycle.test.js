import { describe, expect, it } from 'vitest'
import { deriveSessionStatus } from '../../src/features/student/utils/sessionLifecycle'

const session = { scheduledStart: '2026-08-08T10:00:00.000Z', scheduledEnd: '2026-08-08T11:00:00.000Z' }

describe('deriveSessionStatus', () => {
  it('returns scheduled before the starting-soon window', () => expect(deriveSessionStatus(session, new Date('2026-08-08T09:30:00.000Z'))).toBe('scheduled'))
  it('returns starting-soon during the fifteen-minute window', () => expect(deriveSessionStatus(session, new Date('2026-08-08T09:50:00.000Z'))).toBe('starting-soon'))
  it('does not infer live without mentor confirmation', () => expect(deriveSessionStatus(session, new Date('2026-08-08T10:30:00.000Z'))).toBe('scheduled'))
  it('returns live when the mentor starts', () => expect(deriveSessionStatus({ ...session, mentorStarted: true }, new Date('2026-08-08T09:30:00.000Z'))).toBe('live'))
  it('returns completed after the end time', () => expect(deriveSessionStatus(session, new Date('2026-08-08T11:01:00.000Z'))).toBe('completed'))
  it('keeps backend cancellation authoritative', () => expect(deriveSessionStatus({ ...session, status: 'cancelled', mentorStarted: true }, new Date('2026-08-08T10:30:00.000Z'))).toBe('cancelled'))
})
