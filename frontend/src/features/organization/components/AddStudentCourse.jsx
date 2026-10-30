import { courseService } from '@shared/services/courseService';
import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { studentsApi } from "@/api/students";
import { batchService } from "@shared/services/batchService";
import { enrollmentErrorText } from "@/pages/students/enrollmentErrors";

const idOf = (value) => (value === undefined || value === null || String(value).trim() === "" ? "" : String(value));

/**
 * Student Details → Academic: enroll the student in one more course.
 * Only this organization's batches are offered (GET /api/v1/organization/batches),
 * minus courses the student already has. Saving sends
 * POST /api/StudentBatch {batchId, studentIds:[studentId]} and succeeds only
 * when GET /api/StudentBatch/student/{id}/enrollments then lists the course.
 */
export default function AddStudentCourse({ studentId, enrolledCourseIds, onAdded }) {
  const [open, setOpen] = useState(false);
  const [batches, setBatches] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || batches) return undefined;
    let active = true;
    Promise.all([batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 }), courseService.getCourses({ pageNumber: 1, pageSize: 1000 })])
      .then(([response, courses]) => { if (active) { setBatches(response?.data ?? []); setCatalog(courses?.data ?? []); } })
      .catch(() => { if (active) { setBatches([]); setError("Couldn't load your organization's batches."); } });
    return () => { active = false; };
  }, [open, batches]);

  const courses = useMemo(() => {
    const byId = new Map();
    (batches ?? []).forEach((batch) => {
      const id = idOf(batch.courseId ?? batch.course?.courseId);
      const course = catalog.find(item => idOf(item.courseId ?? item.id) === id);
      const unavailable = !course || course.isDeleted === true || ['deleted', 'inactive', 'archived', 'unpublished', 'false'].includes(String(course.status ?? course.isActive ?? '').toLowerCase());
      if (!unavailable && id && ![...enrolledCourseIds].map(String).includes(id) && !byId.has(id)) byId.set(id, batch.courseName ?? batch.course?.courseName ?? `Course #${id}`);
    });
    return [...byId];
  }, [batches, catalog, enrolledCourseIds]);
  const courseBatches = (batches ?? []).filter((batch) => idOf(batch.courseId ?? batch.course?.courseId) === courseId);

  const close = () => {
    setOpen(false);
    setCourseId("");
    setBatchId("");
    setError("");
  };

  const save = async () => {
    if (!courseId || !batchId || saving) return;
    setSaving(true);
    setError("");
    try {
      await studentsApi.enrollInBatch(studentId, batchId);
      const after = await studentsApi.getEnrollments(studentId).then((response) => response.data);
      const saved = after.some((item) => idOf(item.courseId) === courseId && idOf(item.batchId) === batchId);
      if (!saved) {
        setError("The backend accepted the request but didn't save this enrollment.");
        return;
      }
      window.dispatchEvent(new CustomEvent("kini:student-updated", { detail: { studentId } }));
      close();
      await onAdded?.();
    } catch (requestError) {
      setError(enrollmentErrorText(requestError));
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#d8e4f3] bg-white px-3 text-sm font-semibold text-[#133b5d] hover:bg-[#f6f9fd] dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        <Plus className="h-4 w-4" aria-hidden="true" />Add course
      </button>
    );
  }

  const select = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950";
  return (
    <div className="mb-4 rounded-xl border border-[#e6edf6] bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Course
          <select value={courseId} onChange={(event) => { setCourseId(event.target.value); setBatchId(""); }} disabled={!batches || saving} className={`${select} mt-1`}>
            <option value="">{!batches ? "Loading courses…" : courses.length ? "Select course" : "No other course available"}</option>
            {courses.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Batch
          <select value={batchId} onChange={(event) => setBatchId(event.target.value)} disabled={!courseId || saving} className={`${select} mt-1`}>
            <option value="">{courseId ? "Select batch" : "Select a course first"}</option>
            {courseBatches.map((batch) => {
              const id = idOf(batch.batchId ?? batch.id);
              return <option key={id} value={id}>{batch.batchName ?? batch.name ?? `Batch #${id}`}</option>;
            })}
          </select>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={save} disabled={!courseId || !batchId || saving} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#F39924] px-4 text-sm font-bold text-white disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}{saving ? "Adding…" : "Add"}
          </button>
          <button type="button" onClick={close} disabled={saving} aria-label="Cancel adding a course" className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-white disabled:opacity-50"><X className="h-4 w-4" /></button>
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
