import {
  buildSearchIndex,
  formatDateOnly,
  formatDateTime,
  formatMinutes,
  formatTimeOnly,
  getAttendanceTone,
  getDisplayStatus,
  getStatusTone,
  normalizeOption,
  parseDateTime,
  pickFirst,
  safeNumber,
  toDateInputValue,
  toTimeInputValue,
} from './dateUtils';

const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

// Keep TimeSpan seconds for comparisons; HH:mm remains display-only.
const timestampTime = (value) => {
  const minutes = toTimeInputValue(value);
  const seconds = String(value ?? '').match(/^\d{1,2}:\d{2}(:\d{2}(?:\.\d+)?)/)?.[1] ?? '';
  return minutes ? `${minutes}${seconds}` : '';
};

const parseLocalScheduleDate = (dateValue, timeValue) => {
  const dateText = String(dateValue || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return null;
  const timeText = String(timeValue || '').trim();
  // Backend TimeSpans carry seconds ("15:30:00"); without them in the pattern
  // every backend time silently fell back to midnight.
  const match = timeText.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*([AP]M))?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || 0);
  const meridiem = match[4]?.toUpperCase();
  if (minutes > 59 || seconds > 59 || hours > 23 || (meridiem && (hours < 1 || hours > 12))) return null;
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  const result = new Date(`${dateText}T00:00:00`);
  result.setHours(hours, minutes, seconds, 0);
  return Number.isNaN(result.getTime()) ? null : result;
};

const LIVE_STATUSES = ['live', 'in-progress', 'inprogress', 'in_progress', 'started', 'ongoing'];
const COMPLETED_STATUSES = ['completed', 'complete', 'ended', 'finished'];
const CANCELLED_STATUSES = ['cancelled', 'canceled'];

// The one lifecycle rule every portal uses. Only the backend's start/end/cancel
// endpoints move a class between these states, so an explicit backend status
// always wins over the clock: a class started late — even after its scheduled
// end — stays 'live' until End is clicked, and a scheduled class whose window
// has merely arrived is not 'live' until it is started. Returns null for
// non-lifecycle values (scheduled/upcoming/...) so callers can present those
// with dates and countdowns.
export const getLiveClassLifecycleStatus = (value) => {
  const status = String(value ?? '').trim().toLowerCase();
  if (CANCELLED_STATUSES.includes(status)) return 'cancelled';
  if (COMPLETED_STATUSES.includes(status)) return 'completed';
  if (LIVE_STATUSES.includes(status)) return 'live';
  return null;
};

const splitResources = (item) => {
  const resources = [];
  const push = (value) => {
    if (!value) return;
    const text = toText(value);
    if (text && !resources.includes(text)) resources.push(text);
  };

  [
    item.resources,
    item.resourceNames,
    item.resourceTypes,
    item.materials,
    item.notes,
  ].forEach((value) => {
    if (Array.isArray(value)) value.forEach(push);
    else if (typeof value === 'string') value.split(',').forEach(push);
  });

  if (item.pdfUrl || item.pdf || item.studyMaterialUrl) push('PDF Available');
  if (item.recordingUrl || item.recording || item.recordingLink) push('Recording Available');
  if (item.notesUrl || item.notes || item.studyNotes) push('Notes Available');

  return resources;
};

export const normalizeLiveClass = (item = {}, context) => {
  const id = item.id ?? item.liveClassId ?? item.classId ?? item.sessionId;
  const title = pickFirst(item, ['title', 'classTitle', 'sessionTitle', 'name']) || 'Untitled Class';
  const description = pickFirst(item, ['description', 'summary', 'overview']) || '';
  const courseId = item.courseId ?? item.course?.id ?? item.course?.courseId ?? null;
  const courseName = pickFirst(item, ['courseName', 'course.title', 'course.courseName', 'course.name']) || item.course?.title || item.course?.name || '-';
  const batchId = item.batchId ?? item.batch?.id ?? item.batch?.batchId ?? null;
  const batchName = pickFirst(item, ['batchName', 'batch.title', 'batch.batchName', 'batch.name']) || item.batch?.title || item.batch?.name || '-';
  const mentorId = item.mentorId ?? item.mentor?.id ?? item.mentor?.mentorId ?? null;
  // The backend's Mentor entity only has firstName/lastName — no combined
  // fullName/name field — so that combination must be built explicitly or
  // every assigned mentor renders as "Not Assigned".
  const mentorFirstLast = [item.mentor?.firstName, item.mentor?.lastName].filter(Boolean).join(' ').trim();
  const mentorName = pickFirst(item, ['mentorName', 'mentor.fullName', 'mentor.name', 'mentor.displayName']) || item.mentor?.fullName || item.mentor?.name || mentorFirstLast || 'Not Assigned';
  const mentorAvatar = pickFirst(item, ['mentorAvatar', 'mentor.avatarUrl', 'mentor.photoUrl']) || item.mentor?.avatarUrl || item.mentor?.photoUrl || '';
  const mentorDesignation = pickFirst(item, ['mentorDesignation', 'mentor.designation', 'mentor.role', 'mentor.position']) || item.mentor?.designation || item.mentor?.role || 'Senior Mentor';
  const platform = pickFirst(item, ['meetingPlatform', 'platform', 'meeting.platform', 'meetingPlatformName']) || item.platformName || 'Not Specified';
  const meetingUrl = pickFirst(item, ['meetingUrl', 'meetingLink', 'joinUrl', 'joinLink', 'virtualRoomUrl', 'classUrl', 'url', 'link']) || item.meeting?.url || item.meeting?.meetingUrl || item.meeting?.meetingLink || item.meeting?.joinUrl || item.meeting?.joinLink || item.meeting?.link || '';
  const meetingId = pickFirst(item, ['meetingId', 'meeting.meetingId', 'meeting.id']) || '';
  const password = pickFirst(item, ['password', 'meetingPassword', 'meeting.password']) || '';
  const sourceStatus = String(pickFirst(item, ['backendStatus', 'status', 'state', 'classStatus']) || 'scheduled').toLowerCase();
  const dateValue = pickFirst(item, ['date', 'dateKey', 'scheduledDate', 'classDate', 'sessionDate', 'startDate']);
  const startAtValue = pickFirst(item, ['startAt', 'startDateTime', 'scheduledStartAt', 'startsAt', 'startDate', 'dateKey', 'dateTime']);
  const endAtValue = pickFirst(item, ['endAt', 'endDateTime', 'scheduledEndAt', 'endsAt', 'endDate']);
  const startAt = parseDateTime(startAtValue || dateValue, timestampTime(item.startTime || item.time || item.startHour || item.start)) || null;
  const fallbackStart = parseDateTime(startAtValue, timestampTime(item.startTime || item.time || item.startHour || item.start)) || null;
  const finalStart = startAt || fallbackStart;
  let finalEnd = parseDateTime(endAtValue, timestampTime(item.endTime || item.endHour || item.end))
    || (dateValue && timestampTime(item.endTime || item.endHour || item.end)
      ? parseDateTime(dateValue, timestampTime(item.endTime || item.endHour || item.end)) : null)
    || parseLocalScheduleDate(dateValue || startAtValue, item.endTime || item.endHour || item.end)
    || null;
  // A time-only end earlier than the start belongs to the following day.
  if (!endAtValue && finalStart && finalEnd && finalEnd < finalStart) finalEnd.setDate(finalEnd.getDate() + 1);
  // Backend lifecycle status wins (see getLiveClassLifecycleStatus). The
  // scheduled end time is display-only: it previously turned a backend-live
  // class into 'completed' — and because the end resolved to midnight for the
  // backend's date/time shape, that happened the moment a class was started.
  const now = new Date(context?.now ?? Date.now());
  const status = getLiveClassLifecycleStatus(sourceStatus)
    || (['scheduled', 'upcoming'].includes(sourceStatus)
      ? (finalEnd && now >= finalEnd ? 'completed' : 'scheduled')
      : sourceStatus);
  const statusLabel = getDisplayStatus(status);
  const statusTone = getStatusTone(status);
  const startTime = toTimeInputValue(item.startTime || item.time || item.startHour || finalStart);
  const endTime = toTimeInputValue(item.endTime || item.endHour || finalEnd);
  const dateLabel = formatDateOnly(finalStart || dateValue);
  // Accept both "2026-09-28" and a DateTime-serialized "2026-09-28T00:00:00".
  const dateOnly = String(dateValue ?? '').match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? '';
  const timeLabel = startTime && endTime ? `${startTime} - ${endTime}` : formatTimeOnly(finalStart || item.startTime || item.time);
  const duration = safeNumber(item.durationMinutes ?? item.duration ?? item.durationMins, 0);
  const durationLabel = duration ? formatMinutes(duration) : toText(item.durationLabel) || 'Not Available';
  const studentsCount = safeNumber(item.studentsCount ?? item.students ?? item.enrolledStudents ?? item.attendanceCount, 0);
  const capacity = safeNumber(item.capacity ?? item.maxStudents ?? item.studentCapacity ?? item.totalCapacity ?? item.seats, 0);
  const attendancePercentage = safeNumber(item.attendancePercentage ?? item.attendanceRate ?? item.attendance, 0);
  const recordingUrl = pickFirst(item, ['recordingUrl', 'recordingLink', 'recording', 'videoUrl']) || '';
  // Backend field is modulePdfPath (+ modulePdfName), not pdfUrl/studyNotesUrl.
  const pdfUrl = pickFirst(item, ['pdfUrl', 'modulePdfPath', 'studyNotesUrl', 'notesUrl', 'documentUrl']) || '';
  const resources = splitResources({ ...item, recordingUrl, pdfUrl });
  const createdAt = pickFirst(item, ['createdAt', 'createdDate']) || '';
  const updatedAt = pickFirst(item, ['updatedAt', 'updatedDate']) || '';
  const createdBy = pickFirst(item, ['createdBy', 'createdUser', 'creatorName', 'authorName']) || '';
  const updatedBy = pickFirst(item, ['updatedBy', 'updatedUser', 'modifiedBy']) || '';
  const notesText = toText(pickFirst(item, ['notes', 'remarks', 'classNotes', 'sessionNotes'])) || '';
  const scheduleText = buildSearchIndex(title, courseName, batchName, mentorName, platform, statusLabel, ...resources);

  return {
    ...item,
    id,
    title,
    description,
    courseId,
    courseName,
    batchId,
    batchName,
    mentorId,
    mentorName,
    mentorAvatar,
    mentorDesignation,
    platform,
    meetingUrl,
    meetingId,
    password,
    status,
    backendStatus: sourceStatus,
    statusLabel,
    statusTone,
    dateLabel,
    timeLabel,
    startAt: finalStart ? finalStart.toISOString() : (startAtValue || dateValue || ''),
    endAt: finalEnd ? finalEnd.toISOString() : (endAtValue || ''),
    startDate: dateOnly || toDateInputValue(finalStart || dateValue),
    startTime,
    endTime,
    durationMinutes: duration,
    durationLabel,
    studentsCount,
    capacity,
    attendancePercentage,
    recordingUrl,
    pdfUrl,
    resources,
    createdAt,
    updatedAt,
    createdBy,
    updatedBy,
    createdDateLabel: formatDateTime(createdAt),
    updatedDateLabel: formatDateTime(updatedAt),
    notesText,
    searchIndex: scheduleText,
    hasRecording: Boolean(recordingUrl),
    hasPdf: Boolean(pdfUrl),
    hasNotes: Boolean(resources.some((entry) => entry.toLowerCase().includes('notes'))),
  };
};

export const normalizeLiveClassList = (list = []) => (Array.isArray(list) ? list.map(normalizeLiveClass) : []);

// Join rules, shared by every screen that renders a meeting action. Accept a
// raw API row or an already-normalized one. A completed/cancelled class keeps
// its stored meeting URL for records, but must never offer Join; and — as
// above — a class is only joinable once the backend reports it live.
export const isLiveClassClosed = (item) => ['completed', 'cancelled'].includes(normalizeLiveClass(item).status);

export const canJoinLiveClass = (item) => {
  const { status, meetingUrl } = normalizeLiveClass(item);
  return status === 'live' && Boolean(meetingUrl);
};

// Student join rules (embedded Jitsi classroom). Driven by the backend-backed
// status computed in normalizeLiveClass — never by display text:
//   live      → joinable
//   scheduled/upcoming → not yet (the mentor must start the class first)
//   completed → never joinable (recording/notes only)
//   cancelled → never joinable
// A meeting URL is not required: resolveJitsiMeeting() falls back to the
// class-id room that the mentor's embedded meeting also uses.
export const getStudentJoinState = (item) => {
  const normalized = normalizeLiveClass(item);
  const { status } = normalized;
  if (status === 'cancelled') return { state: 'cancelled', canJoin: false, label: 'Cancelled', message: 'This class was cancelled and cannot be joined.' };
  if (status === 'completed') return { state: 'completed', canJoin: false, label: 'Completed', message: 'This class has ended.' };
  if (status === 'live') return { state: 'live', canJoin: true, label: 'Join Class', message: '' };
  return { state: 'upcoming', canJoin: false, label: 'Upcoming', message: 'Join will be available when the mentor starts the class.' };
};

export const normalizeDashboard = (data = {}, fallbackList = []) => {
  const items = normalizeLiveClassList(fallbackList);
  const totalClasses = safeNumber(
    data.totalClasses ?? data.total ?? data.totalCount ?? data.totalRecords,
    items.length,
  );
  const todayClasses = safeNumber(data.todayClasses ?? data.todaysClasses ?? data.today ?? items.filter((item) => item.dateLabel === 'Today').length, 0);
  const upcoming = safeNumber(data.upcoming ?? data.upcomingClasses ?? items.filter((item) => ['upcoming', 'scheduled'].includes(item.status)).length, 0);
  const liveNow = safeNumber(data.liveNow ?? data.live ?? items.filter((item) => item.status === 'live').length, 0);
  const completed = safeNumber(data.completed ?? data.completedClasses ?? items.filter((item) => item.status === 'completed').length, 0);
  const cancelled = safeNumber(data.cancelled ?? data.canceled ?? items.filter((item) => item.status === 'cancelled').length, 0);
  const attendanceRate = safeNumber(data.attendanceRate ?? data.averageAttendance ?? data.attendancePercentage, items.length ? Math.round(items.reduce((sum, item) => sum + Number(item.attendancePercentage || 0), 0) / items.length) : 0);
  const averageDuration = safeNumber(data.averageDuration ?? data.avgDuration ?? data.avgClassDuration, items.length ? Math.round(items.reduce((sum, item) => sum + Number(item.durationMinutes || 0), 0) / Math.max(items.length, 1)) : 0);
  const mostActiveMentor = toText(data.mostActiveMentor ?? data.topMentor ?? data.activeMentor ?? items[0]?.mentorName) || 'Not Available';
  const mostAttendedBatch = toText(data.mostAttendedBatch ?? data.topBatch ?? items[0]?.batchName) || 'Not Available';

  return {
    totalClasses,
    todayClasses,
    upcoming,
    liveNow,
    completed,
    cancelled,
    attendanceRate,
    averageDuration,
    mostActiveMentor,
    mostAttendedBatch,
  };
};

export const normalizeDropdownItems = (list = []) => (Array.isArray(list) ? list.map(normalizeOption) : []);

export const normalizeAttendanceRows = (list = []) => (
  Array.isArray(list)
    ? list.map((item) => {
        const studentId = item.studentId ?? item.id ?? item.userId;
        const name = pickFirst(item, ['studentName', 'name', 'fullName', 'student.fullName', 'student.name']) || 'Student';
        const email = pickFirst(item, ['email', 'studentEmail', 'student.email']) || '-';
        const joinedAt = pickFirst(item, ['joinedAt', 'joinTime', 'checkInAt']);
        const leftAt = pickFirst(item, ['leftAt', 'leaveTime', 'checkOutAt']);
        const status = String(pickFirst(item, ['status', 'attendanceStatus']) || 'present').toLowerCase();
        const duration = item.durationMinutes ?? item.duration ?? 0;
        return {
          ...item,
          id: studentId,
          studentId,
          name,
          email,
          joinedAt,
          joinedAtLabel: formatDateTime(joinedAt),
          leftAt,
          leftAtLabel: formatDateTime(leftAt),
          durationLabel: duration ? formatMinutes(duration) : 'Not Available',
          status,
          statusTone: getAttendanceTone(status),
          searchIndex: buildSearchIndex(name, email, status),
        };
      })
    : []
);
