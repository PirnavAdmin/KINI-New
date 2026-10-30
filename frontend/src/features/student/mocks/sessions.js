// TODO: backend — replace this mock response with a sessions API request.
const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60_000).toISOString()

export const MOCK_SESSIONS = [
  {
    id: 'session-js-basics', courseId: 'crs-001', title: 'JavaScript Basics — Recorded',
    scheduledStart: minutesFromNow(-360), scheduledEnd: minutesFromNow(-300), actualEndedAt: minutesFromNow(-300),
    joinUrl: '#mock-live-class', recordingUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    topics: ['Variables', 'Scope', 'Functions'], resources: [{ name: 'JavaScript basics notes.pdf', fileUrl: '#mock-js-basics-pdf' }],
    assessmentId: 'assessment-js-basics', assessmentUnlockRule: 'after-recording-watched',
  },
  {
    id: 'session-react-hooks', courseId: 'crs-001', title: 'React Hooks Live Session',
    scheduledStart: minutesFromNow(3), scheduledEnd: minutesFromNow(48), joinUrl: '#mock-react-hooks-live',
    topics: ['useState', 'useEffect', 'Custom hooks'], resources: [{ name: 'React Hooks worksheet.pdf', fileUrl: '#mock-react-hooks-pdf' }],
    assessmentId: 'assessment-react-hooks', assessmentUnlockRule: 'after-live-attendance',
  },
  {
    id: 'session-spring-core', courseId: 'crs-001', title: 'Spring Core Session',
    scheduledStart: minutesFromNow(24 * 60), scheduledEnd: minutesFromNow(24 * 60 + 90), joinUrl: '#mock-spring-core-live',
    topics: ['IoC container', 'Dependency injection', 'Beans'], resources: [{ name: 'Spring Core notes.pdf', fileUrl: '#mock-spring-core-pdf' }],
    assessmentId: 'assessment-spring-core', assessmentUnlockRule: 'after-recording-watched',
  },
  {
    id: 'session-project-review', courseId: 'crs-001', title: 'Project Review & Q&A',
    scheduledStart: minutesFromNow(72 * 60), scheduledEnd: minutesFromNow(72 * 60 + 60), joinUrl: '#mock-project-review-live',
    topics: ['Project structure', 'Code review', 'Q&A'], resources: [{ name: 'Project review guide.pdf', fileUrl: '#mock-project-review-pdf' }],
    assessmentUnlockRule: 'manual',
  },
]

export const createInitialProgress = (sessions = MOCK_SESSIONS) => Object.fromEntries(sessions.map((session) => [session.id, {
  sessionId: session.id, attendedLive: false, recordingWatchedPct: 0, assessmentUnlocked: false,
}]))
