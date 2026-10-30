import { normalizeNotificationTimestamp } from '@shared/services/localScheduleStore'

const ago = (minutes) => normalizeNotificationTimestamp(new Date(Date.now() - minutes * 60000).toISOString())

export const MENTOR_NOTIFICATION_CATEGORIES = [
  'All', 'Unread', 'Students', 'Assignments', 'Courses', 'Batches',
  'Attendance', 'Webinars', 'Meetings', 'Schedule', 'Messages', 'System',
]

export const MENTOR_NOTIFICATIONS = [
  { id: 1, title: 'Assignment submitted', description: 'Alice Johnson submitted React Hooks Assessment.', category: 'Assignments', priority: 'Medium', timestamp: ago(5), unread: true },
  { id: 2, title: 'Live class starting soon', description: 'MERN Batch A class starts in 15 minutes.', category: 'Schedule', priority: 'High', timestamp: ago(15), unread: true },
  { id: 3, title: 'Project review pending', description: 'Three student projects are waiting for your evaluation.', category: 'Assignments', priority: 'High', timestamp: ago(35), unread: true },
  { id: 4, title: 'New student joined batch', description: 'Grace Wilson joined Batch B – Python.', category: 'Students', priority: 'Low', timestamp: ago(50), unread: true },
  { id: 5, title: 'Attendance missing', description: 'Attendance is not submitted for today’s Data Science class.', category: 'Attendance', priority: 'Critical', timestamp: ago(75), unread: true },
  { id: 6, title: 'Webinar scheduled', description: 'AI in Education webinar is scheduled for tomorrow at 3:00 PM.', category: 'Webinars', priority: 'Medium', timestamp: ago(110), unread: true },
  { id: 7, title: 'Mentor sync meeting', description: 'Monthly mentor sync begins today at 4:30 PM.', category: 'Meetings', priority: 'High', timestamp: ago(160), unread: true },
  { id: 8, title: 'Course content updated', description: 'New resources were added to Full Stack MERN.', category: 'Courses', priority: 'Low', timestamp: ago(220), unread: false },
  { id: 9, title: 'New batch assigned', description: 'You have been assigned to Batch C – AI/ML.', category: 'Batches', priority: 'Medium', timestamp: ago(300), unread: false },
  { id: 10, title: 'New group message', description: 'Batch A students posted 8 new messages.', category: 'Messages', priority: 'Medium', timestamp: ago(420), unread: true },
  { id: 11, title: 'Certificate ready', description: 'Bob Smith completed Python for Data Science.', category: 'Students', priority: 'Low', timestamp: ago(760), unread: false },
  { id: 12, title: 'Assignment due tomorrow', description: 'Node.js API assignment is due tomorrow at 11:59 PM.', category: 'Assignments', priority: 'High', timestamp: ago(980), unread: false },
  { id: 13, title: 'Course feedback received', description: 'Five students submitted feedback for React Advanced.', category: 'Courses', priority: 'Low', timestamp: ago(1300), unread: false },
  { id: 14, title: 'Meeting rescheduled', description: 'Student progress review moved to Friday at 2:00 PM.', category: 'Meetings', priority: 'Medium', timestamp: ago(1700), unread: true },
  { id: 15, title: 'System maintenance', description: 'The platform may be unavailable Sunday from 2:00–4:00 AM.', category: 'System', priority: 'Critical', timestamp: ago(2100), unread: false },
  { id: 16, title: 'Attendance submitted', description: 'Batch B attendance was submitted successfully.', category: 'Attendance', priority: 'Low', timestamp: ago(2800), unread: false },
  { id: 17, title: 'Webinar recording available', description: 'React Architecture webinar recording is now available.', category: 'Webinars', priority: 'Low', timestamp: ago(3600), unread: false },
  { id: 18, title: 'Student needs support', description: 'David Brown requested help with Express routing.', category: 'Students', priority: 'High', timestamp: ago(4300), unread: true },
  { id: 19, title: 'Schedule published', description: 'Next week’s mentor class schedule is ready.', category: 'Schedule', priority: 'Medium', timestamp: ago(5600), unread: false },
  { id: 20, title: 'Password changed successfully', description: 'Your account password was updated securely.', category: 'System', priority: 'Low', timestamp: ago(7000), unread: false },
]

export const priorityStyles = {
  Critical: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  High: 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
  Medium: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  Low: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
}

export const timeAgo = (timestamp) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(normalizeNotificationTimestamp(timestamp))) / 60000))
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}
