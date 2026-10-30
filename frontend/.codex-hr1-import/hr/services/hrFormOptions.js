import { hrField, hrList } from './hrApi'
export const fieldLabel = key => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim().replace(/ Id$/, ' ID')
const optionKeys = { departmentId: 'departments', role: 'roles', employeeId: 'employees', leaveType: 'types', audience: 'audiences', status: 'statuses', category: 'categories', Category: 'categories', employmentType: 'employmentTypes', period: 'periods' }

export function optionsFor(key, options) {
  const raw = options[optionKeys[key] ?? key]
  return hrList(raw).map(item => typeof item === 'object' ? {
    value: hrField(item, key, 'value', 'id', 'code', 'name', 'employeeId', 'departmentId', 'roleName', 'leaveType'),
    label: hrField(item, 'label', 'fullName', 'employeeName', 'departmentName', 'roleName', 'name', 'title', 'leaveType', 'code', 'id'),
  } : { value: item, label: item }).filter(item => item.value != null)
}

