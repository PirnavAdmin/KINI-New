import { hrField } from './hrApi'

// Employee codes and user account IDs are not employee record primary keys.
export const employeeStatusIdOf = row => ['employeeRecordId', 'employeeId', 'id'].map(key => hrField(row, key)).find(value =>
  (typeof value === 'number' || typeof value === 'string') && /^\d+$/.test(String(value).trim()) && Number(value) > 0 && Number(value) <= 2147483647
)
export const employeeIdOf = row => employeeStatusIdOf(row)
