export const EVENT_TYPE_CONFIG = {
  'live-class': { label: 'Live Class', icon: 'presentation', color: '#10b981', bg: '#ecfdf5', text: '#047857' },
  assignment: { label: 'Assignment', icon: 'file-text', color: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
  assessment: { label: 'Assessment', icon: 'clipboard-check', color: '#8b5cf6', bg: '#f5f3ff', text: '#6d28d9' },
  meeting: { label: 'Meeting', icon: 'users', color: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8' },
  webinar: { label: 'Webinar', icon: 'monitor', color: '#ec4899', bg: '#fdf2f8', text: '#be185d' },
  workshop: { label: 'Workshop', icon: 'wrench', color: '#f97316', bg: '#fff7ed', text: '#c2410c' },
  'office-hours': { label: 'Office Hours', icon: 'clock', color: '#14b8a6', bg: '#f0fdfa', text: '#0f766e' },
  exam: { label: 'Exam', icon: 'graduation-cap', color: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
  reminder: { label: 'Reminder', icon: 'bell', color: '#6366f1', bg: '#eef2ff', text: '#4338ca' },
}

const types = Object.keys(EVENT_TYPE_CONFIG)
const titles = ['Mentor Sync Meeting', 'AI in Education Webinar', 'Git & GitHub Workshop', 'General Q&A Session', 'Python Live Class', 'MERN Assignment', 'React Assessment', 'Interview Preparation', 'System Design Review']
const times = ['9:00 AM - 10:00 AM', '10:00 AM - 11:30 AM', '2:00 PM - 3:30 PM', '3:00 PM - 4:30 PM', '5:00 PM - 6:00 PM']

export const MOCK_CALENDAR_EVENTS = Array.from({ length: 99 }, (_, index) => {
  const type = types[index % types.length]
  const config = EVENT_TYPE_CONFIG[type]
  const day = index < 4 ? 3 : ((index * 7) % 31) + 1
  return { id: index + 1, title: titles[index % titles.length], type, icon: config.icon, day, month: 7, year: 2026, date: `2026-08-${String(day).padStart(2, '0')}`, time: times[index % times.length], course: ['React Development', 'Node.js Backend', 'AWS Cloud Practitioner', 'System Design'][index % 4], batch: ['Batch A - MERN', 'Batch B - Python', 'Batch C - AI/ML'][index % 3], color: config.color, bgColor: config.bg, textColor: config.text, label: config.label }
})
