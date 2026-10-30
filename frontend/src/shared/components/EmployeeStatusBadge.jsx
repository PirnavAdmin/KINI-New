import StatusBadge from './StatusBadge';
import { normalizeEmployeeStatus } from '../utils/employeePresentation';

export default function EmployeeStatusBadge({ status }) {
  return <StatusBadge status={normalizeEmployeeStatus(status)} />;
}
