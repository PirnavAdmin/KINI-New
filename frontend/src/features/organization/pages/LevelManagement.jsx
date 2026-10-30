import { BarChart3 } from 'lucide-react'
import OrganizationApiReadyPage from '@features/organization/components/OrganizationApiReadyPage'
import { ROUTES } from '@shared/constants/routeConstants'

export default function LevelManagement() {
  return (
    <OrganizationApiReadyPage
      title="Level Management"
      subtitle="Define academic or competency levels for the Organization dashboard."
      icon={BarChart3}
      backendStatus="There is no dedicated level API in the live backend. Course records currently carry a level text field only."
      requirements={[
        'Add a level master endpoint for list/create/update/delete.',
        'Support level ordering and display labels.',
        'Allow levels to be reused across courses and reporting views.',
      ]}
      linkedRoutes={[
        { to: ROUTES.ORG_ADMIN.COURSES, label: 'Courses' },
        { to: ROUTES.ORG_ADMIN.COMPETENCIES, label: 'Competencies' },
      ]}
    />
  )
}
