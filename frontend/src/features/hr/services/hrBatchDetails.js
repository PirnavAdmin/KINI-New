import { batchService } from '@shared/services/batchService'
import { liveClassService } from '@features/live-classes/services/liveClassService'
import { hrField, unwrapHrData } from './hrApi'

export const batchIdOf = row => ['batchId', 'id'].map(key => hrField(row, key)).find(value => value != null && String(value).trim() !== '')
export const batchValue = (row, ...keys) => hrField(row, ...keys)
export const batchText = value => value == null || value === '' || typeof value === 'object' ? '\u2014' : String(value)
export const batchPercent = value => value == null || value === '' || !Number.isFinite(Number(value)) ? '\u2014' : Number(value) + '%'
export const batchDate = value => !value || Number.isNaN(new Date(value).getTime()) ? '\u2014' : new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

// Read the original response: shared management normalizers inject defaults
// for capacity, student status and attendance that must not appear as facts.
export async function loadHrBatchDetails(batchId, signal) {
  let batch
  try {
    batch = unwrapHrData(await batchService.getById(batchId, { raw: true, signal }))
  } catch (error) {
    if (error.response?.status === 404) return { notFound: true }
    throw error
  }
  if (!batch || typeof batch !== 'object' || Array.isArray(batch) || batchIdOf(batch) == null || String(batchIdOf(batch)) !== String(batchId)) {
    throw new Error('The service returned an unexpected batch. Please retry.')
  }
  const [roster, classes] = await Promise.allSettled([
    batchService.getStudents(batchId, { raw: true, signal }),
    liveClassService.list({ batchId, page: 1, pageSize: 1000 }),
  ])
  let students, studentsError, sessions, sessionsError
  if (roster.status === 'fulfilled') {
    const body = unwrapHrData(roster.value)
    if (body?.batchId != null && String(body.batchId) !== String(batchId)) studentsError = 'The service returned an unexpected roster.'
    else if (Array.isArray(body)) students = body
    else if (Array.isArray(body?.students)) students = body.students
    else studentsError = 'The service returned an invalid student roster.'
  } else studentsError = 'Unable to load enrolled students.'
  if (classes.status === 'fulfilled' && Array.isArray(classes.value)) {
    sessions = classes.value.filter(row => String(row.batchId ?? row.batch?.batchId ?? row.batch?.id) === String(batchId))
  } else sessionsError = 'Unable to load sessions.'
  return { batch, students, studentsError, sessions, sessionsError }
}
