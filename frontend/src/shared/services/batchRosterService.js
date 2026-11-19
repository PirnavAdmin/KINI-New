import { batchService } from './batchService'
import { studentsApi } from '@/api/students'
import { reconcileBatchRoster } from '@shared/utils/batchRoster'

// Both portals count the same eligible, unique students, including primary assignments.
export async function loadBatchRosterCounts(batches) {
  const ids = [...new Set(batches.map(batch => batch.batchId ?? batch.id).filter(id => id != null && String(id).trim() !== '').map(String))]
  if (!ids.length) return {}
  const [rosters, students] = await Promise.all([
    Promise.allSettled(ids.map(id => batchService.getStudents(id, {}))),
    studentsApi.list().then(response => response.data ?? []).catch(() => []),
  ])
  return Object.fromEntries(ids.map((id, index) => [id, rosters[index].status === 'fulfilled'
    ? reconcileBatchRoster(batches.find(batch => String(batch.batchId ?? batch.id) === id), rosters[index].value, students).length
    : null]))
}
