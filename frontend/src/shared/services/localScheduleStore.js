const CLASS_KEY = 'kini:scheduled-classes'
const NOTIFICATION_KEY = 'kini:scheduled-class-notifications'

export const normalizeNotificationTimestamp = (value) => {
  if (!value) return ''
  const text = String(value)
  return /(?:Z|[+-]\d{2}:?\d{2})$/.test(text) ? text : `${text}Z`
}

const read = (key) => {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const readLocalScheduledClasses = () => read(CLASS_KEY)
export const readLocalNotifications = () => {
  const stored = read(NOTIFICATION_KEY)
  const classNotifications = readLocalScheduledClasses().map((item) => ({
    id: `local-notification-${item.id}`,
    title: 'Live class scheduled',
    description: `${item.batch || 'Assigned batch'}: ${item.topic || 'Scheduled class'} on ${item.dateKey} at ${item.time || 'scheduled time'}.`,
    category: 'Schedule',
    priority: 'High',
    timestamp: item.createdAt || new Date().toISOString(),
    unread: true,
    local: true,
  }))
  return [...stored, ...classNotifications].filter((item, index, all) => all.findIndex((row) => row.id === item.id) === index)
}

export const saveScheduledClass = (scheduledClass) => {
  const classes = readLocalScheduledClasses().filter((item) => item.id !== scheduledClass.id)
  window.localStorage.setItem(CLASS_KEY, JSON.stringify([...classes, scheduledClass]))
  window.dispatchEvent(new CustomEvent('kini:scheduled-class-created', { detail: scheduledClass }))
}

export const saveScheduledClassNotification = (scheduledClass) => {
  const notification = {
    id: `local-notification-${scheduledClass.id}`,
    title: 'New class scheduled',
    description: `${scheduledClass.batch}: ${scheduledClass.topic} on ${scheduledClass.dateKey} at ${scheduledClass.time}.`,
    category: 'Schedule',
    priority: 'High',
    timestamp: new Date().toISOString(),
    unread: true,
    local: true,
  }
  const notifications = readLocalNotifications().filter((item) => item.id !== notification.id)
  window.localStorage.setItem(NOTIFICATION_KEY, JSON.stringify([notification, ...notifications]))
  window.dispatchEvent(new CustomEvent('kini:notification-created', { detail: notification }))
}
