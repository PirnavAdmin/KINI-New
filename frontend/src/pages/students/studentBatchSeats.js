import { reconcileBatchRoster } from "@shared/utils/batchRoster";

const validCount = (value) => value != null && String(value).trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= 0;
const studentId = (student) => student.studentId ?? student.id;

/** Primary assignments and additional StudentBatch memberships are one roster.
 * Deduplicate by student ID, never by email or by adding aggregate counts. */
export function getBatchSeats(batch = {}, roster, primaryStudents = []) {
  const configured = Object.hasOwn(batch, "configuredCapacity") ? batch.configuredCapacity : batch.capacity ?? batch.maxStudents;
  const reported = configured ?? roster?.capacity ?? roster?.maxStudents;
  const capacity = validCount(reported) ? Number(reported) : 0;
  const studentIds = new Set();
  if (roster) {
    const members = reconcileBatchRoster(batch, roster, primaryStudents);
    for (const student of members) {
      const id = studentId(student);
      if (id != null) studentIds.add(String(id));
    }
  }
  const enrolled = roster ? studentIds.size : Number(batch.enrolledStudents ?? 0);
  return { capacity, enrolled, available: Math.max(0, capacity - enrolled), isFull: capacity <= 0 || enrolled >= capacity, studentIds };
}
