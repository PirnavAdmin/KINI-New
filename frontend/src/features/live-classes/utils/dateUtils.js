const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const pad = (value) => String(value ?? '').padStart(2, '0');

const monthFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

export const SCHEDULE_DATE_MIN = '2000-01-01';
export const SCHEDULE_DATE_MAX = '2100-12-31';

export const isValidScheduleDate = (value) => {
  const normalized = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return false;
  if (normalized < SCHEDULE_DATE_MIN || normalized > SCHEDULE_DATE_MAX) return false;

  const [year, month, day] = normalized.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
};

export const getNestedValue = (source, path) => {
  if (!source || typeof source !== 'object') return undefined;
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), source);
};

export const pickFirst = (source, paths = []) => {
  for (const path of paths) {
    const value = getNestedValue(source, path);
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
};

export const formatDateOnly = (value) => {
  if (!value) return 'Not Available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return toText(value) || 'Not Available';
  return monthFormatter.format(date);
};

export const formatTimeOnly = (value) => {
  if (!value) return 'Not Available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return toText(value) || 'Not Available';
  return timeFormatter.format(date);
};

export const formatDateTime = (value) => {
  if (!value) return 'Not Available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return toText(value) || 'Not Available';
  return `${monthFormatter.format(date)} • ${timeFormatter.format(date)}`;
};

export const parseDateTime = (dateValue, timeValue) => {
  if (!dateValue && !timeValue) return null;
  if (dateValue && !timeValue) {
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const dateString = String(dateValue || '').trim();
  const timeString = String(timeValue || '').trim();
  // The backend sends scheduledDate as a DateTime whose time part is always
  // midnight ("2026-10-05T00:00:00") and the real time separately in
  // startTime/endTime ("15:30:00"). Only that midnight-only date is combined
  // with the separate time; a full datetime with a real time is used as-is.
  const midnightOnlyDate = dateString.match(/^(\d{4}-\d{2}-\d{2})T00:00(?::00(?:\.0+)?)?(Z|[+-]\d{2}:?\d{2})?$/i);
  // A nonzero offset is explicit schedule-zone information. UTC midnight in
  // the backend's calendar-date field keeps its existing local-date convention.
  const scheduleOffset = midnightOnlyDate?.[2] && !/^(Z|[+-]00:?00)$/i.test(midnightOnlyDate[2]) ? midnightOnlyDate[2] : '';
  const combined = midnightOnlyDate && timeString
    ? `${midnightOnlyDate[1]}T${timeString}${scheduleOffset}`
    : dateString.includes('T') ? dateString : `${dateString}T${timeString}`;
  const date = new Date(combined);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatMinutes = (minutes) => {
  const value = Number(minutes || 0);
  if (!value) return '0 min';
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

export const normalizeOption = (item = {}) => ({
  id: item.id ?? item.value ?? item.courseId ?? item.batchId ?? item.mentorId,
  label: item.label ?? item.name ?? item.title ?? item.courseName ?? item.batchName ?? item.fullName ?? item.platformName ?? item.statusName ?? toText(item.value),
  value: item.value ?? item.id ?? item.courseId ?? item.batchId ?? item.mentorId ?? item.name ?? item.title,
  ...item,
});

export const buildSearchIndex = (...parts) => parts.map(toText).filter(Boolean).join(' ').toLowerCase();

export const getStatusTone = (status) => {
  const value = String(status || 'scheduled').toLowerCase();
  if (['live', 'ongoing', 'in progress'].includes(value)) return 'live';
  if (['completed', 'done', 'ended'].includes(value)) return 'success';
  if (['cancelled', 'canceled'].includes(value)) return 'danger';
  if (['upcoming', 'scheduled'].includes(value)) return 'pending';
  return 'default';
};

export const getDisplayStatus = (status) => {
  const value = String(status || 'scheduled').trim();
  if (!value) return 'Scheduled';
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase());
};

export const getAttendanceTone = (status) => {
  const value = String(status || '').toLowerCase();
  if (['present', 'attended'].includes(value)) return 'success';
  if (['late'].includes(value)) return 'warning';
  if (['absent', 'missed'].includes(value)) return 'danger';
  return 'default';
};

export const safeNumber = (value, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? fallback : numberValue;
};

// Calendar date in the viewer's local time zone. A backend date such as
// "2026-09-28" or "2026-09-28T00:00:00" is already a calendar date, so keep
// its leading YYYY-MM-DD as-is — converting through toISOString() (UTC)
// shifted every class one day back for time zones ahead of UTC (e.g. IST).
export const toDateInputValue = (value) => {
  if (!value) return '';
  const leadingDate = typeof value === 'string' ? value.trim().match(/^(\d{4}-\d{2}-\d{2})/) : null;
  if (leadingDate) return leadingDate[1];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export const toTimeInputValue = (value) => {
  if (!value) return '';
  if (String(value).includes(':') && String(value).length <= 8) return String(value).slice(0, 5);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
