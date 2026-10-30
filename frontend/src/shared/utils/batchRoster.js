// Include primary assignments that have not yet reached StudentBatch, while
// preserving additional enrollments in that endpoint. Count each student once.
export function reconcileBatchRoster(batch, roster, organizationStudents = []) {
  const batchId = String(batch.batchId ?? batch.id);
  const batchName = String(batch.batchName ?? batch.name ?? "").trim().toLowerCase();
  const payload = roster?.data ?? roster;
  const enrolled = Array.isArray(payload) ? payload : payload?.students ?? payload?.items ?? [];
  const primary = organizationStudents.filter(student => {
    const id = student.batchId ?? student.batch?.batchId ?? student.batch?.id;
    if (id != null) return String(id) === batchId;
    const name = String(student.batchName ?? student.batch?.batchName ?? student.batch?.name ?? student.batch ?? "").trim().toLowerCase();
    return Boolean(batchName && name === batchName);
  });
  const seen = new Set();
  return [...enrolled, ...primary].filter(student => {
    const id = student.studentId ?? student.id;
    if (id == null) return true;
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
