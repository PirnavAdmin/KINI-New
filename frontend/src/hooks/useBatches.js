import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { batchService } from "@shared/services/batchService";
import { getApiErrorMessage } from "@shared/services/apiServices";

const dateOnly = (value) => (value ? String(value).slice(0, 10) : "");
const statusLabel = (value) => {
  const normalized = String(value || "Planned").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeBatch = (batch = {}) => ({
  ...batch,
  id: String(batch.batchId ?? batch.id),
  batchId: batch.batchId ?? batch.id,
  name: batch.batchName ?? batch.name ?? "Untitled batch",
  code:
    batch.batchCode ?? batch.BatchCode ?? batch.batch_code ?? batch.code ?? batch.batchNumber ?? "",
  courseId: batch.courseId ?? batch.course?.courseId ?? batch.course?.id,
  course:
    batch.courseName ?? batch.course?.courseName ?? batch.course?.name ?? "—",
  mentorId: batch.mentorId ?? batch.trainerId ?? batch.mentor?.mentorId,
  trainer:
    batch.mentorName ??
    batch.trainerName ??
    batch.mentor?.name ??
    [batch.mentor?.firstName, batch.mentor?.lastName]
      .filter(Boolean)
      .join(" ") ??
    "Unassigned",
  students: Number(
    batch.studentsCount ?? batch.enrolledStudents ?? batch.studentCount ?? 0,
  ),
  enrolledStudents: Number(
    batch.enrolledStudents ?? batch.studentsCount ?? batch.studentCount ?? 0,
  ),
  liveClasses: Number(batch.liveClasses ?? 0),
  recordedClasses: Number(batch.recordedClasses ?? 0),
  capacity: Number(batch.capacity ?? batch.maxStudents ?? 0),
  schedule: batch.schedule ?? batch.scheduleText ?? "Not scheduled",
  status: statusLabel(batch.status),
  startDate: dateOnly(batch.startDate),
  endDate: dateOnly(batch.endDate),
  mode: batch.batchType ?? batch.mode ?? "Online",
});

export default function useBatches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await batchService.getAll({
        pageNumber: 1,
        pageSize: 1000,
      });
      setBatches((response.data || []).map(normalizeBatch));
    } catch (error) {
      setBatches([]);
      toast.error(getApiErrorMessage(error, "Unable to load batches."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadBatches(), 0);
    window.addEventListener('kini:student-updated', loadBatches);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('kini:student-updated', loadBatches);
    };
  }, [loadBatches]);

  const saveBatch = useCallback(
    async (values, id) => {
      try {
        const response = id
          ? await batchService.update(id, values)
          : await batchService.create(values);
        await loadBatches();
        return normalizeBatch(response || { ...values, id });
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Unable to save batch."));
        throw error;
      }
    },
    [loadBatches],
  );

  const deleteBatch = useCallback(
    async (id) => {
      try {
        await batchService.remove(id);
        await loadBatches();
        return { ok: true };
      } catch (error) {
        const reason = getApiErrorMessage(error, "Unable to delete batch.");
        toast.error(reason);
        return { ok: false, reason };
      }
    },
    [loadBatches],
  );

  const cancelBatch = useCallback(
    async (id, reason) => {
      if (!reason.trim())
        return { ok: false, reason: "Cancellation reason is required." };
      const current = batches.find((batch) => batch.id === String(id));
      if (!current) return { ok: false, reason: "Batch not found." };
      try {
        await batchService.update(id, {
          ...current,
          status: "Cancelled",
          description: [current.description, `Cancelled: ${reason}`]
            .filter(Boolean)
            .join("\n"),
        });
        await loadBatches();
        return { ok: true };
      } catch (error) {
        return {
          ok: false,
          reason: getApiErrorMessage(error, "Unable to cancel batch."),
        };
      }
    },
    [batches, loadBatches],
  );

  const addStudents = useCallback(
    (id, count = 1) => {
      const batch = batches.find((item) => item.id === String(id));
      if (!batch || batch.students + count > batch.capacity)
        return {
          ok: false,
          reason: `Cannot exceed the ${batch?.capacity || 0}-student capacity.`,
        };
      return {
        ok: false,
        reason: "Student enrollment requires the enrollment API.",
      };
    },
    [batches],
  );

  const stats = useMemo(
    () => ({
      total: batches.length,
      active: batches.filter((batch) => batch.status === "Active").length,
      planned: batches.filter((batch) => batch.status === "Planned").length,
      completed: batches.filter((batch) => batch.status === "Completed").length,
      cancelled: batches.filter((batch) => batch.status === "Cancelled").length,
    }),
    [batches],
  );

  const getBatch = useCallback(
    (id) => batches.find((item) => item.id === String(id)),
    [batches],
  );

  return {
    batches,
    loading,
    stats,
    loadBatches,
    saveBatch,
    deleteBatch,
    cancelBatch,
    addStudents,
    getBatch,
  };
}
