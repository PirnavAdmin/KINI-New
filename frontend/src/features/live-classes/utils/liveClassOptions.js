// Single source of truth for the Schedule Live Class form options, shared by
// Organization (useLiveClasses / LiveClassFormModal) and Mentor
// (MentorCalendar / ScheduleLiveClassDialog).
//
// The backend contract (Swagger CreateLiveClassDto) takes meetingPlatform as a
// plain string label — "Zoom", "Jitsi", ... — never a numeric id, and accepts
// no status at all (status changes go through start/end/cancel). The ids here
// are form-local keys only; getMeetingPlatformLabel() turns one into the label
// that is actually submitted.
//
// The backend's GET /meeting-platforms/dropdown and /status/dropdown return
// { id, platformName } / { id, statusName }; they are not used for these
// selects because the form must submit labels, and the Organization form —
// the working reference — already uses these options.
export const MEETING_PLATFORM_OPTIONS = [
  { id: 1, name: 'Zoom' },
  { id: 2, name: 'Google Meet' },
  { id: 3, name: 'Microsoft Teams' },
  { id: 4, name: 'YouTube Live' },
  { id: 5, name: 'Jitsi' },
];

export const LIVE_CLASS_STATUS_OPTIONS = [
  { id: 'scheduled', name: 'Scheduled' },
  { id: 'live', name: 'Live' },
  { id: 'completed', name: 'Completed' },
  { id: 'cancelled', name: 'Cancelled' },
];

export const getMeetingPlatformLabel = (platformId) => {
  const normalized = String(platformId ?? '').trim();
  return MEETING_PLATFORM_OPTIONS.find((option) => String(option.id) === normalized)?.name ?? '';
};

// Maps a stored platform label (any casing/wording the backend returns) back
// to its form id, or '' when it matches none of the options.
export const getMeetingPlatformIdFromLabel = (value) => {
  const label = String(value ?? '').trim().toLowerCase();
  if (!label) return '';
  if (label.includes('zoom')) return '1';
  if (label.includes('google meet') || label.includes('meet')) return '2';
  if (label.includes('microsoft teams') || label.includes('teams')) return '3';
  if (label.includes('youtube')) return '4';
  if (label.includes('jitsi')) return '5';
  return '';
};

// The live class's syllabus moduleId as the backend requires it (an integer
// ≥ 1), or undefined for anything else — never 0, NaN or a guessed id.
export const toModuleId = (value) => {
  if (value == null || value === '') return undefined;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : undefined;
};
