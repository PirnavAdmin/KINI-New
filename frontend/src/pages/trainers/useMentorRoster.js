import { useEffect, useState } from "react";
import { batchService } from "@shared/services/batchService";

// Students taught by one mentor: the roster of each assigned batch
// (trainer.assignedBatches + the existing batchService.getStudents endpoint),
// one row per learner even when they sit in two of the mentor's batches.
// Shared by the directory's detail panel and the full mentor profile.
// Returns { loading, rows, failed } — failed when any batch roster failed.
export default function useMentorRoster(trainer) {
  const assignedBatches = trainer?.assignedBatches || [];
  const batchKeys = assignedBatches.map((batch) => String(batch.batchId ?? batch.id ?? "")).filter(Boolean);
  // One request per mentor + batch set; a result belongs to the key it was loaded for.
  const requestKey = `${trainer?.id ?? ""}|${batchKeys.join("|")}`;
  const [result, setResult] = useState({ key: null, rows: [], failed: false });

  useEffect(() => {
    if (!batchKeys.length) return undefined;
    let active = true;
    // Called per assigned batch — never an organization-wide student fetch.
    Promise.allSettled(batchKeys.map((batchId) => batchService.getStudents(batchId)))
      .then((results) => {
        if (!active) return;
        const rows = [];
        const seen = new Set();
        let failed = false;
        batchKeys.forEach((batchId, index) => {
          const settled = results[index];
          if (settled.status !== "fulfilled") {
            failed = true;
            return;
          }
          const batchMeta = assignedBatches.find((batch) => String(batch.batchId ?? batch.id ?? "") === String(batchId)) || {};
          (settled.value?.students ?? []).forEach((student) => {
            // A learner enrolled in two of this mentor's batches is one row.
            const id = student.studentId ?? student.id;
            const email = String(student.email ?? "").trim().toLowerCase();
            const dedupeKey = id != null
              ? `id:${id}`
              : email
                ? `email:${email}`
                : `row:${rows.length + 1}`; // No identity — keep the row instead of dropping it.
            if (seen.has(dedupeKey)) return;
            seen.add(dedupeKey);
            rows.push({
              ...student,
              batchName: student.batchName ?? batchMeta.batchName ?? batchMeta.name ?? `Batch ${batchId}`,
              courseName: student.courseName ?? batchMeta.courseName ?? batchMeta.course?.courseName ?? "—",
              batchId: student.batchId ?? batchId,
            });
          });
        });
        setResult({ key: requestKey, rows, failed });
      });
    return () => { active = false; };
    // requestKey stands for the mentor and its batch ids; the arrays are rebuilt each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  if (!batchKeys.length) return { loading: false, rows: [], failed: false };
  return result.key === requestKey
    ? { loading: false, rows: result.rows, failed: result.failed }
    : { loading: true, rows: [], failed: false };
}
