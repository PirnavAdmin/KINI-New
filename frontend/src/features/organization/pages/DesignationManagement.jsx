import { Briefcase } from 'lucide-react'
import OrganizationApiReadyPage from '@features/organization/components/OrganizationApiReadyPage'
import { ROUTES } from '@shared/constants/routeConstants'

export default function DesignationManagement() {
  return (
    <OrganizationApiReadyPage
      title="Designation Management"
      subtitle="Standardize employee roles and titles across the organization."
      icon={Briefcase}
      backendStatus="The current employee API accepts a designation text field, but there is no dedicated designation CRUD endpoint in the live backend."
      requirements={[
        'Add a designation resource with CRUD support.',
        'Allow employee designations to be managed independently from employee records.',
        'Optionally expose designation hierarchies or reporting levels.',
      ]}
      linkedRoutes={[
        { to: ROUTES.ORG_ADMIN.EMPLOYEES, label: 'Employees' },
      ]}
    />
  )
}
