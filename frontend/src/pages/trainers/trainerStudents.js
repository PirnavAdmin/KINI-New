import { reconcileBatchRoster } from '@shared/utils/batchRoster';
// A learner enrolled in two assigned batches is still one student.
export function countUniqueStudents(rows) {
  const identities = new Set();
  for (const row of rows) {
    const id = row.studentId ?? row.student?.studentId ?? row.student?.id ?? row.id;
    const email = row.email ?? row.studentEmail ?? row.student?.email;
    if (id != null && id !== '') identities.add(`id:${id}`);
    else if (typeof email === 'string' && email.trim()) identities.add(`email:${email.trim().toLowerCase()}`);
    else return null; // Without identity, cross-batch deduplication is unsafe.
  }
  return identities.size;
}

export function mentorRosterSummary(batches, rosters, organizationStudents = []) {
  const uniqueBatches = [...new Map(batches.map(batch => [String(batch.batchId ?? batch.id), batch])).values()];
  const reconciled = new Map(uniqueBatches.flatMap(batch => {
    const id = String(batch.batchId ?? batch.id);
    const roster = rosters.get(id);
    return roster ? [[id, { students: reconcileBatchRoster(batch, roster, organizationStudents) }]] : [];
  }));
  const assignedBatches = uniqueBatches.map(batch => {
    const roster = reconciled.get(String(batch.batchId ?? batch.id));
    return { ...batch, studentCount: roster ? roster.students.length : null };
  });
  const complete = assignedBatches.every(batch => rosters.has(String(batch.batchId ?? batch.id)));
  return {
    assignedBatches,
    students: complete ? countUniqueStudents(assignedBatches.flatMap(batch => reconciled.get(String(batch.batchId ?? batch.id)).students)) : null,
  };
}
