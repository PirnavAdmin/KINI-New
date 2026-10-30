import { studentsApi } from "@/api/students";
import { batchService } from "./batchService";

export const DEFAULT_BATCH_CAPACITY = 25;

const rows = (response) => response?.data ?? response?.items ?? response?.records ?? response?.results ?? [];
const batchIdOf = (batch) => batch?.batchId ?? batch?.id;
const courseIdOf = (batch) => batch?.courseId ?? batch?.course?.courseId ?? batch?.course?.id;
const studentBatchId = (student) => student?.batchId ?? student?.batch?.batchId ?? student?.batch?.id;
const enrollmentCount = (batch) => Number(batch?.enrolledStudents ?? batch?.studentsCount ?? batch?.studentCount ?? 0);
const capacityOf = (batch) => Number(batch?.capacity || DEFAULT_BATCH_CAPACITY);

const nextBatchName = (name, courseBatches) => {
  const base = String(name || "Batch").trim().replace(/\s+\d+$/, "");
  const numbers = courseBatches
    .map((batch) => String(batch.batchName ?? batch.name ?? "").trim())
    .filter((candidate) => candidate.toLowerCase().startsWith(base.toLowerCase()))
    .map((candidate) => Number(candidate.match(/(\d+)$/)?.[1] || 1));
  return `${base} ${Math.max(1, ...numbers) + 1}`;
};

export const ensureNextBatchAfterEnrollment = async (batchId, createdStudentId) => {
  const [batch, batchesResponse, studentsResponse] = await Promise.all([
    batchService.getById(batchId),
    batchService.getAll({ pageNumber: 1, pageSize: 1000 }),
    studentsApi.list({ pageNumber: 1, pageSize: 1000 }),
  ]);
  const batches = rows(batchesResponse);
  const students = rows(studentsResponse);
  const assigned = students.filter((student) => String(studentBatchId(student)) === String(batchId));
  const createdIsIncluded = assigned.some((student) => String(student.studentId ?? student.id) === String(createdStudentId));
  const count = Math.max(enrollmentCount(batch), assigned.length + (createdIsIncluded ? 0 : 1));
  const capacity = capacityOf(batch);

  if (count < capacity) return { created: false, count, capacity, remaining: capacity - count };

  const courseId = courseIdOf(batch);
  const openNextBatch = batches.find((candidate) => {
    if (String(batchIdOf(candidate)) === String(batchId) || String(courseIdOf(candidate)) !== String(courseId)) return false;
    const status = String(candidate.status || "").toLowerCase();
    return ["active", "upcoming", "planned"].includes(status) && enrollmentCount(candidate) < capacityOf(candidate);
  });
  if (openNextBatch) return { created: false, count, capacity, nextBatch: openNextBatch };

  const courseBatches = batches.filter((candidate) => String(courseIdOf(candidate)) === String(courseId));
  const payload = {
    ...batch,
    batchName: nextBatchName(batch.batchName ?? batch.name, courseBatches),
    courseId,
    mentorId: batch.mentorId ?? batch.trainerId ?? batch.mentor?.mentorId ?? batch.mentor?.id,
    tutorId: batch.tutorId ?? batch.mentorId ?? batch.trainerId,
    capacity: DEFAULT_BATCH_CAPACITY,
    status: "Planned",
  };
  const nextBatch = await batchService.create(payload);
  return { created: true, count, capacity, nextBatch };
};

