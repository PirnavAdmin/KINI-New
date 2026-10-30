export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_LEAVE', label: 'On Leave' },
  { value: 'RESIGNED', label: 'Resigned' },
]

export const normalizeEmployeeStatus = value => String(value ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_')
