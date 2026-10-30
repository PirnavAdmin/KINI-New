import PropTypes from 'prop-types'

// Student Recordings — derived from the student's own live classes.
// There is no separate recordings list endpoint: a class recording is the
// `recordingUrl` already carried by each class from GET /api/v1/live-classes
// (normalized by normalizeLiveClass). Only classes with a recording show up.

const text = (value) => String(value ?? '').trim()
const firstText = (item, keys) => keys.map((key) => text(item?.[key])).find(Boolean) || ''
const firstNumber = (item, keys) => {
  for (const key of keys) {
    const value = Number(item?.[key])
    if (item?.[key] !== undefined && item?.[key] !== null && item?.[key] !== '' && Number.isFinite(value)) return value
  }
  return null
}

const formatClock = (totalSeconds) => {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (value) => String(value).padStart(2, '0')
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

// Watch progress is only used when the API actually reports it (0–100).
const watchProgress = (item) => {
  const value = firstNumber(item, ['watchProgress', 'watchedPercentage', 'progressPercent', 'recordingProgress', 'watchPercent'])
  return value === null ? null : Math.min(100, Math.max(0, value))
}

// Shape of a mapped recording, shared by the Recordings components.
export const recordingShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  courseName: PropTypes.string,
  mentorName: PropTypes.string,
  dateLabel: PropTypes.string,
  durationLabel: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  url: PropTypes.string,
  progress: PropTypes.number,
})

export const toRecording = (item) => {
  const recordingSeconds = firstNumber(item, ['recordingDurationSeconds', 'recordingDurationInSeconds', 'videoDurationSeconds'])
  const progress = watchProgress(item)
  const watched = Boolean(item.isWatched ?? item.watched ?? item.recordingWatched) || (progress !== null && progress >= 95)
  return {
    id: String(item.id ?? item.liveClassId ?? item.recordingUrl),
    title: text(item.title) || 'Class recording',
    courseName: text(item.courseName),
    topic: firstText(item, ['topicName', 'topic', 'moduleName', 'syllabusTopic', 'subject']),
    mentorName: text(item.mentorName),
    recordedAt: item.endAt || item.startAt || item.createdAt || '',
    dateLabel: formatDate(item.endAt || item.startAt || item.createdAt) || text(item.dateLabel),
    durationLabel: recordingSeconds !== null ? formatClock(recordingSeconds) : (item.durationMinutes ? formatClock(item.durationMinutes * 60) : ''),
    thumbnailUrl: firstText(item, ['recordingThumbnailUrl', 'thumbnailUrl', 'thumbnail', 'posterUrl', 'coverImage']),
    url: text(item.recordingUrl),
    progress,
    watched,
    inProgress: !watched && progress !== null && progress > 0,
  }
}

export const toRecordingList = (classes = []) =>
  classes.filter((item) => item?.hasRecording || text(item?.recordingUrl)).map(toRecording)

/* Saved recordings — a per-browser list (there is no bookmark endpoint). */
const savedKey = (studentKey) => `student-recording-bookmarks:${studentKey || 'me'}`

export const readSavedRecordings = (studentKey) => {
  try {
    const rows = JSON.parse(localStorage.getItem(savedKey(studentKey)) || '[]')
    return new Set(Array.isArray(rows) ? rows.map(String) : [])
  } catch {
    return new Set()
  }
}

export const writeSavedRecordings = (studentKey, ids) => {
  try {
    localStorage.setItem(savedKey(studentKey), JSON.stringify([...ids]))
  } catch {
    // Storage can be unavailable (private mode); the toggle still works for this visit.
  }
}

export const RECORDING_SORTS = [
  { id: 'latest', label: 'Latest First' },
  { id: 'oldest', label: 'Oldest First' },
  { id: 'title', label: 'Title A–Z' },
]

const timeOf = (recording) => {
  const value = new Date(recording.recordedAt).getTime()
  return Number.isNaN(value) ? 0 : value
}

export const filterRecordings = (recordings, { search = '', course = 'all', topic = 'all', sort = 'latest' } = {}) => {
  const query = search.trim().toLowerCase()
  const rows = recordings.filter((recording) => {
    if (course !== 'all' && recording.courseName !== course) return false
    if (topic !== 'all' && recording.topic !== topic) return false
    if (!query) return true
    return [recording.title, recording.courseName, recording.topic, recording.mentorName].join(' ').toLowerCase().includes(query)
  })
  const sorted = [...rows]
  if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title))
  else if (sort === 'oldest') sorted.sort((a, b) => timeOf(a) - timeOf(b))
  else sorted.sort((a, b) => timeOf(b) - timeOf(a))
  return sorted
}

export const uniqueValues = (recordings, key) =>
  [...new Set(recordings.map((recording) => recording[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b))
