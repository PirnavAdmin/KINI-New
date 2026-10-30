import { NotificationCenter } from '@features/mentor/pages/MentorNotifications'
import { STUDENT_NOTIFICATION_CATEGORIES } from '../data/notificationMockData'
import { useAuth } from '@shared/hooks/useAuth'

export default function StudentNotifications() {
  const { user } = useAuth()
  const studentId = user?.studentId
    ?? localStorage.getItem('studentId')

  return (
    <NotificationCenter
      notificationCategories={STUDENT_NOTIFICATION_CATEGORIES}
      subtitle="Stay updated with classes, assignments, assessments and learning activities."
      hideAnalytics
      hideSecondaryPanels
      hideSettings
      recipientType="student"
      recipientId={studentId}
    />
  )
}
