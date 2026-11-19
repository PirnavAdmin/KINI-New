import { employeeService } from '@shared/services/employeeService'
import { hrField } from './hrApi'
import { employeeIdOf } from './hrEmployeeIdentity'

const fields = {
  firstName: ['givenName'], lastName: ['familyName', 'surname'], email: ['employeeEmail'],
  phone: ['phoneNumber', 'mobile', 'mobileNumber'], role: ['roleName'], departmentId: [],
  designation: [], employmentType: ['employeeType'], joiningDate: ['dateOfJoining', 'joinDate'],
}
const supplied = value => value != null && (typeof value !== 'string' || value.trim() !== '')

// Detail DTOs can omit fields or return null. Keep already-saved directory
// values, and use explicit name fields rather than guessing a split full name.
export function mergeEmployeeEditValues(primary, fallback = {}) {
  const result = { ...fallback, ...primary }
  for (const [key, aliases] of Object.entries(fields)) {
    const value = [primary, fallback].flatMap(row => [key, ...aliases].map(name => hrField(row, name))).find(supplied)
    if (value !== undefined) result[key] = value
  }
  return result
}

export async function loadEmployeeEditValues(row, detail, signal) {
  let values = mergeEmployeeEditValues(detail, row)
  if (['firstName', 'lastName'].every(key => supplied(values[key]))) return values
  const id = employeeIdOf(row)
  if (id == null || signal?.aborted) return values
  try {
    const saved = await employeeService.getEmployee(id)
    if (signal?.aborted) return values
    if (String(employeeIdOf(saved)) !== String(id)) throw new Error('The directory returned a different employee. Close this form and try again.')
    values = mergeEmployeeEditValues(values, saved)
  } catch (error) {
    if (signal?.aborted || ![403, 404].includes(error.response?.status)) throw error
    // Keep the HR record readable when the optional directory route is denied
    // or unavailable. Do not invent first/last names from a display name.
  }
  return values
}
