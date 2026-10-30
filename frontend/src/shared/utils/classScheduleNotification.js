const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const dateParts = (value) => {
  const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? { year, month, day }
    : null
}

export const formatClassDate = (value) => {
  const parts = dateParts(value)
  return parts ? `${String(parts.day).padStart(2, '0')} ${MONTHS[parts.month - 1]} ${parts.year}` : ''
}

export const formatClassTime = (value) => {
  const match = String(value ?? '').match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return ''
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return ''
  return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`
}

export const formatClassSchedule = ({ date, startTime, endTime } = {}) => {
  const formattedDate = formatClassDate(date)
  const start = formatClassTime(startTime)
  const end = formatClassTime(endTime)
  const time = [start, end].filter(Boolean).join(' – ')
  return [formattedDate, time].filter(Boolean).join(' • ')
}

// Structured class fields are authoritative. Some notification endpoints only
// send a generated sentence; recognize that exact schedule sentence to display
// its date, but never interpret the date's midnight placeholder as class time.
export const classScheduleNotification = (item) => {
  const classInfo = item.liveClass ?? item.class ?? item
  const message = item.description ?? item.message ?? ''
  const generated = String(message).match(/^(.+?) is scheduled for (\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?)\.?$/i)
  const date = classInfo.scheduledDate ?? classInfo.classDate ?? classInfo.date ?? generated?.[2]
  const scheduleLabel = formatClassSchedule({
    date,
    startTime: classInfo.startTime,
    endTime: classInfo.endTime,
  })
  if (!scheduleLabel) return null
  const classTitle = classInfo.classTitle ?? classInfo.className ?? (generated ? generated[1] : null)
  if (!classTitle) return null
  return { classTitle: String(classTitle), scheduleLabel }
}
