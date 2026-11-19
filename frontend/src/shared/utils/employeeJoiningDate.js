export function joiningDateError(value) {
  if (!value) return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Select a valid joining date.'
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? 'Select a valid joining date.' : ''
}

// A joining date is a calendar date. Use UTC midnight to preserve the chosen
// day in the backend's date-time DTO, regardless of the browser timezone.
export function employeeJoiningDate(value) {
  if (!value) return null
  if (joiningDateError(value)) throw new Error('Select a valid joining date.')
  return `${value}T00:00:00.000Z`
}
