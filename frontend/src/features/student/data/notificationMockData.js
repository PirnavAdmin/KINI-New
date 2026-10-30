const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString()

export const STUDENT_NOTIFICATION_CATEGORIES = [
  'All', 'Unread', 'Classes', 'Assessments', 'Courses',
  'Certificates', 'Messages', 'Webinars', 'Career', 'System',
]

export const STUDENT_NOTIFICATIONS = [
  { id: 1, title: 'Live class starting soon', description: 'React Hooks live class starts in 15 minutes.', category: 'Classes', priority: 'High', timestamp: ago(8), unread: true },
  { id: 3, title: 'Assessment tomorrow', description: 'JavaScript Fundamentals assessment begins tomorrow at 10:00 AM.', category: 'Assessments', priority: 'High', timestamp: ago(48), unread: true },
  { id: 4, title: 'New mentor message', description: 'Your mentor replied in the Batch A group chat.', category: 'Messages', priority: 'Medium', timestamp: ago(70), unread: true },
  { id: 5, title: 'New lesson available', description: 'State Management Patterns is now available in your MERN course.', category: 'Courses', priority: 'Low', timestamp: ago(110), unread: true },
  { id: 6, title: 'Webinar registration confirmed', description: 'You are registered for AI in Education tomorrow at 3:00 PM.', category: 'Webinars', priority: 'Medium', timestamp: ago(180), unread: true },
  { id: 8, title: 'Learning streak milestone', description: 'Great work! You maintained a 10-day learning streak.', category: 'Courses', priority: 'Low', timestamp: ago(390), unread: false },
  { id: 9, title: 'Certificate unlocked', description: 'Your Full Stack Foundations certificate is ready to download.', category: 'Certificates', priority: 'Medium', timestamp: ago(620), unread: true },
  { id: 10, title: 'Mock interview scheduled', description: 'Your mock interview is scheduled for Friday at 2:00 PM.', category: 'Career', priority: 'High', timestamp: ago(850), unread: false },
  { id: 11, title: 'Class recording available', description: 'The Node.js Deep Dive recording is now available.', category: 'Classes', priority: 'Low', timestamp: ago(1200), unread: false },
  { id: 12, title: 'Assessment result published', description: 'You scored 86% in the React Advanced assessment.', category: 'Assessments', priority: 'Medium', timestamp: ago(1700), unread: false },
  { id: 13, title: 'Resume review completed', description: 'Your updated resume has been reviewed by your mentor.', category: 'Career', priority: 'Medium', timestamp: ago(2300), unread: false },
  { id: 14, title: 'Course progress updated', description: 'You have completed 72% of MERN Stack Development.', category: 'Courses', priority: 'Low', timestamp: ago(3100), unread: false },
  { id: 15, title: 'System maintenance', description: 'The learning portal may be unavailable Sunday from 2:00–4:00 AM.', category: 'System', priority: 'Critical', timestamp: ago(4300), unread: false },
  { id: 16, title: 'Password changed successfully', description: 'Your account password was updated securely.', category: 'System', priority: 'Low', timestamp: ago(6200), unread: false },
]
