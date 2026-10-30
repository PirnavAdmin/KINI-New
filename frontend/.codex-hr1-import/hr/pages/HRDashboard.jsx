import { useAuth } from '@shared/hooks/useAuth'
import { isHrModuleUser } from '../constants/hrPermissions'
import EmployeeInformationDashboard from '@features/employee/pages/EmployeeInformationDashboard'
import HRDashboardView from './HRDashboardView'
export default function HRDashboard() {
 const { user } = useAuth()
 return isHrModuleUser(user) && localStorage.getItem('isDemo') !== 'true' ? <EmployeeInformationDashboard /> : <HRDashboardView />
}
