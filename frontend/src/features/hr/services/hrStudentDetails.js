import { hrError, hrField, hrModuleApi, unwrapHrData } from './hrApi'
import { courseService } from '@shared/services/courseService'
import { batchService } from '@shared/services/batchService'
import { mentorService } from '@shared/services/mentorService'
import { loadHrStudentRoster } from './hrStudentRoster'

export const studentIdOf = row => [hrField(row, 'studentId'), hrField(row, 'id')].find(value => value != null && String(value).trim() !== '')
export const studentName = row => hrField(row, 'fullName', 'studentName', 'name') || [hrField(row, 'firstName'), hrField(row, 'lastName')].filter(Boolean).join(' ')
export function studentRelationship(row, key) {
  const nested = hrField(row, key)
  return hrField(row, `${key}Name`, ...(key === 'mentor' ? ['assignedMentorName', 'trainerName'] : [])) ||
    (typeof nested === 'string' ? nested : hrField(nested, `${key}Name`, 'fullName', 'name') || (key === 'mentor' ? studentName(nested) : null)) || null
}

// Reloads need no navigation state. Merge only the roster row with this exact ID.
export async function loadHrStudentDetails(id, signal) {
  const api = hrModuleApi('students')
  const [detail, roster] = await Promise.allSettled([api.get(id, signal), loadHrStudentRoster(api, {}, signal)])
  if (signal?.aborted) return null
  const row = roster.status === 'fulfilled' ? roster.value.find(item => String(studentIdOf(item)) === String(id)) : null
  const value = detail.status === 'fulfilled' ? detail.value : null
  if (value && (typeof value !== 'object' || Array.isArray(value) || (studentIdOf(value) != null && String(studentIdOf(value)) !== String(id)))) {
    throw new Error('The server returned details for an unexpected student.')
  }
  if (detail.status === 'rejected' && detail.reason?.response?.status !== 404) throw detail.reason
  if (value && studentIdOf(value) == null && !row) throw new Error('Unable to verify the student identifier. Refresh and try again.')
  if (!row && !value) {
    if (roster.status === 'rejected') throw roster.reason
    return { notFound: true }
  }
  // A failed roster lookup must be visible rather than silently losing relationships.
  const student = { ...row }
  for (const [key, item] of Object.entries(value ?? {})) {
    if (item != null && item !== '') {
      for (const existing of Object.keys(student)) if (existing.toLowerCase() === key.toLowerCase()) delete student[existing]
      student[key] = item
    }
  }
  if (studentName(value)) student.fullName = studentName(value)
  for (const key of ['course', 'batch', 'mentor']) {
    const nested = hrField(value, key)
    if (nested && typeof nested === 'object') {
      const relatedId = hrField(value, `${key}Id`) ?? hrField(nested, `${key}Id`, 'id')
      const relatedName = studentRelationship(value, key)
      if (relatedId != null) student[`${key}Id`] = relatedId
      if (relatedName) student[`${key}Name`] = relatedName
    }
    const changed = hrField(value, `${key}Id`) != null && hrField(row, `${key}Id`) != null && String(hrField(value, `${key}Id`)) !== String(hrField(row, `${key}Id`))
    if (changed && !studentRelationship(value, key)) {
      for (const field of Object.keys(student)) if ([`${key}Name`, key, ...(key === 'mentor' ? ['assignedMentorName', 'trainerName'] : [])].some(name => field.toLowerCase() === name.toLowerCase())) delete student[field]
    }
  }
  const warnings = []
  if (roster.status === 'rejected') warnings.push(`Student roster: ${hrError(roster.reason, 'students')}`)
  if (detail.status === 'rejected') warnings.push('Detailed profile is unavailable; showing this student’s current roster information.')
  const sources = { course: courseService.getCourse, batch: batchService.getById, mentor: mentorService.getMentor }
  await Promise.all(Object.entries(sources).map(async ([key, get]) => {
    const relatedId = hrField(student, `${key}Id`) ?? hrField(hrField(student, key), `${key}Id`, 'id')
    if (relatedId == null || studentRelationship(student, key)) return
    try {
      const related = unwrapHrData(await get(relatedId))
      const returnedId = hrField(related, `${key}Id`, 'id')
      if (returnedId != null && String(returnedId) !== String(relatedId)) throw new Error('Unexpected relationship identifier')
      const name = studentRelationship({ [key]: related }, key)
      if (name) student[`${key}Name`] = name
      else warnings.push(`${key} name is unavailable.`)
    } catch (error) { warnings.push(`${key}: ${hrError(error, 'students')}`) }
  }))
  if (signal?.aborted) return null
  return { student, warning: warnings.join(' ') || null }
}
