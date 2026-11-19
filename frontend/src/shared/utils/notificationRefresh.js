// HR and mentor portals can run in separate tabs or on separate devices.
// Poll the recipient feed as well as responding to local changes.
export function subscribeNotificationRefresh(refresh, interval = 15000) {
  const visibleRefresh = () => {
    if (document.visibilityState !== 'hidden') refresh()
  }
  const timer = window.setInterval(visibleRefresh, interval)
  const events = ['kini:notification-created', 'kini:notifications-changed', 'hr:announcements-changed', 'focus']
  events.forEach(event => window.addEventListener(event, visibleRefresh))
  document.addEventListener('visibilitychange', visibleRefresh)
  return () => {
    window.clearInterval(timer)
    events.forEach(event => window.removeEventListener(event, visibleRefresh))
    document.removeEventListener('visibilitychange', visibleRefresh)
  }
}

export function mentorNotificationRecipient(user) {
  return user?.mentorId ?? user?.MentorId ?? user?.mentor?.mentorId
    ?? user?.mentor?.id ?? localStorage.getItem('mentorId')
}
