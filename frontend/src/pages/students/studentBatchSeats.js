import { isPendingApprovalStudent } from "@shared/utils/studentApprovalStatus";

const validCount = (value) => value != null && String(value).trim() !== "" && Number.isInteger(Number(value)) && Number(value) >= 0;
const studentId = (student) => student.studentId ?? student.id;
const occupiesSeat = (student) => !isPendingApprovalStudent(student)
  && !["rejected", "declined", "cancelled", "canceled", "archived"].includes(String(student.status ?? "").trim().toLowerCase());

/** Primary assignments and additional StudentBatch memberships are one roster.
 * Deduplicate by student ID, never by email or by adding aggregate counts. */
export function getBatchSeats(batch = {}, roster, primaryStudents = []) {
  const configured = Object.hasOwn(batch, "configuredCapacity") ? batch.configuredCapacity : batch.capacity ?? batch.maxStudents;
  const reported = configured ?? roster?.capacity ?? roster?.maxStudents;
  const capacity = validCount(reported) ? Number(reported) : 0;
  const studentIds = new Set();
  if (roster) {
    const batchId = batch.batchId ?? batch.id;
    const primaryById = new Map(primaryStudents.map((student) => [String(studentId(student)), student]));
    const members = [...(roster.students ?? []), ...primaryStudents.filter((student) =>
      batchId != null && student.batchId != null && String(student.batchId) === String(batchId))];
    for (const student of members) {
      const id = studentId(student);
      if (id != null && occupiesSeat(primaryById.get(String(id)) ?? student)) studentIds.add(String(id));
    }
  }
  const enrolled = roster ? studentIds.size : Number(batch.enrolledStudents ?? 0);
  return { capacity, enrolled, available: Math.max(0, capacity - enrolled), isFull: capacity <= 0 || enrolled >= capacity, studentIds };
}
