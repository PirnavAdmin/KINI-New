import { hrField, hrList } from './hrApi'
export const fieldLabel = key => key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim().replace(/ Id$/, ' ID').replace(/Trainers?\s+(?:(?:And|&)\s+)?Mentors?/gi, 'Mentors').replace(/^Administrative Staff$/i, 'HR')
const optionKeys = { departmentId: 'departments', role: 'roles', employeeId: 'employees', leaveType: 'types', audience: 'audiences', status: 'statuses', category: 'categories', Category: 'categories', employmentType: 'employmentTypes', period: 'periods' }

export function employeeRoleOptions(options) {
  const roles = optionsFor('role', options)
  return ['Mentor', 'HR'].map(label => {
    const normalize = value => String(value ?? '').replace(/[\s_-]/g, '').toLowerCase()
    const existing = roles.find(role => normalize(role.label) === normalize(label) || normalize(role.value) === normalize(label) || (label === 'HR' && normalize(role.label).startsWith('hr')))
    return { value: existing?.value ?? (label === 'HR' ? 'HR Executive' : label), label }
  })
}

export function optionsFor(key, options) {
  const raw = hrField(options, optionKeys[key] ?? key, key, ...(key === 'performanceFilters' ? ['performanceLevels', 'performanceOptions'] : []))
  const choices = hrList(raw).map(item => typeof item === 'object' ? {
    value: hrField(item, key, 'value', 'id', 'code', 'name', 'employeeId', 'departmentId', 'roleName', 'leaveType'),
    label: hrField(item, 'label', 'fullName', 'employeeName', 'departmentName', 'roleName', 'name', 'title', 'leaveType', 'code') ?? ([hrField(item, 'firstName'), hrField(item, 'lastName')].filter(Boolean).join(' ') || hrField(item, 'id')),
  } : { value: item, label: item }).filter(item => item.value != null)
  if (key === 'audience') {
    const normalize = value => String(value ?? '').trim().toLowerCase().replace(/s$/, '')
    return ['All', 'HR', 'Mentor', 'Employee', 'Student'].map(label => {
      const existing = choices.find(item => normalize(item.label) === normalize(label) || normalize(item.value) === normalize(label))
      return { value: existing?.value ?? label, label }
    })
  }
  return choices
}
