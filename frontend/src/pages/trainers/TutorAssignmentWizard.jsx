import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, X } from "lucide-react";
import { tutorService } from "@/shared/services/tutorService";
import { getApiErrorMessage } from "@/shared/services/apiServices";

const selectClass = "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none";
const nameOf = (item) => item?.name ?? item?.courseName ?? item?.moduleName ?? item?.subjectName ?? item?.batchName ?? item?.title ?? "Untitled";
const itemId = (item, type = "course") => type === "batch"
  ? item?.batchId ?? item?.BatchId ?? item?.id ?? item?.Id
  : item?.courseId ?? item?.CourseId ?? (item?.batchId ?? item?.BatchId) ?? item?.id ?? item?.Id;

export default function TutorAssignmentWizard({ tutor, onClose, onComplete }) {
  const [data, setData] = useState({ courses: [], batches: [] });
  const [value, setValue] = useState({ courseId: "", batchId: "" });
  const [loading, setLoading] = useState({ courses: true });
  const [error, setError] = useState("");
  const [availabilityResult, setAvailability] = useState(null);
  // Availability is an optional backend capability. Do not block a valid
  // course assignment when that endpoint is absent or returns no content.
  const availability = availabilityResult ?? {
    available: true,
    hasConflict: false,
    message: "Assignment details are complete. You can confirm now.",
  };
  const [saving, setSaving] = useState(false);
  const batchRequest = useRef(0);

  useEffect(() => { tutorService.courses().then((courses) => setData((old) => ({ ...old, courses }))).catch((courseError) => setError(getApiErrorMessage(courseError, "Unable to load organization courses."))).finally(() => setLoading({})); }, []);
  const chooseCourse = async (courseId) => {
    const requestId = ++batchRequest.current;
    setValue({ courseId, batchId: "" }); setAvailability(null); setError(""); setLoading({ batches: true });
    if (!courseId) { setData((old) => ({ ...old, batches: [] })); setLoading({}); return; }
    try {
      const selectedCourse = data.courses.find((course) => String(itemId(course, "course")) === String(courseId));
      const [batchResult] = await Promise.allSettled([
        tutorService.batches(courseId, selectedCourse?.name ?? selectedCourse?.courseName ?? selectedCourse?.title),
      ]);
      if (requestId !== batchRequest.current) return;
      const batches = batchResult.status === "fulfilled" ? batchResult.value : [];
      setData((old) => ({ ...old, batches }));
      const problems = [];
      if (batchResult.status === "rejected") problems.push(batchResult.reason?.response?.status === 404
        ? "No batches were found for this course. Create an active batch first."
        : getApiErrorMessage(batchResult.reason, "Batches could not be loaded."));
      else if (!batches.length) problems.push("No batches found. Create an active batch for this course.");
      if (problems.length) setError(problems.join(" "));
    } finally { if (requestId === batchRequest.current) setLoading({}); }
  };
  const checkAvailability = async () => { setError(""); setAvailability(null); setLoading({ availability: true }); try { setAvailability(await tutorService.availability(tutor.id, { batchId: value.batchId })); } catch { setAvailability({ available: true, hasConflict: false, message: "Availability service is unavailable. You can still confirm this assignment." }); } finally { setLoading({}); } };
  const submit = async () => { setSaving(true); setError(""); try { await tutorService.assign({ tutorId: tutor.id, courseId: Number(value.courseId), batchId: Number(value.batchId) }); onComplete("Mentor assigned successfully.", { ...value, courseName: selected("courseId", data.courses), batchName: selected("batchId", data.batches) }); } catch (assignmentError) { setError(assignmentError?.response?.data?.message || "Unable to assign this mentor."); } finally { setSaving(false); } };
  const selected = (key, list) => nameOf(list.find((x) => String(itemId(x, key === "batchId" ? "batch" : "course")) === String(value[key])));
  const ready = value.courseId && value.batchId;
  const conflict = availability?.hasConflict ?? availability?.conflict ?? availability?.available === false;
  return <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/45 p-4"><div style={{ maxWidth: "760px" }} className="mx-auto my-6 w-full rounded-2xl bg-white shadow-2xl"><header className="flex items-start justify-between border-b border-slate-100 p-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Course-linked assignment</p><h2 className="mt-1 text-lg font-bold text-slate-900">Assign {tutor.name}</h2><p className="mt-1 text-sm text-slate-500">Select a course and batch from your organization.</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></header><div className="space-y-4 p-5">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">1. Course<select value={value.courseId} disabled={loading.courses} onChange={(e) => chooseCourse(e.target.value)} className={selectClass}><option value="">{loading.courses ? "Loading courses…" : "Select course"}</option>{data.courses.map((x) => <option key={itemId(x)} value={itemId(x)}>{nameOf(x)}</option>)}</select></label><label className="text-sm font-semibold">2. Batch<select value={value.batchId} disabled={!value.courseId || loading.batches} onChange={(e) => { setValue((old) => ({ ...old, batchId: e.target.value })); setAvailability(null); }} className={selectClass}><option value="">Select batch</option>{data.batches.map((x) => <option key={itemId(x, "batch")} value={itemId(x, "batch")}>{nameOf(x)}</option>)}</select></label></div>{ready && <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm"><p className="font-bold text-slate-900">Review assignment</p><p className="mt-2 text-slate-600"><b>Course:</b> {selected("courseId", data.courses)} · <b>Batch:</b> {selected("batchId", data.batches)}</p></section>}{availability && <p className={`flex items-center gap-2 rounded-lg p-3 text-sm ${conflict ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{conflict ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{conflict ? availability.message || "Tutor has a schedule conflict." : availability.message || "Tutor is available for this assignment."}</p>}</div><footer className="flex flex-wrap justify-end gap-2 border-t border-slate-100 p-5"><button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm font-semibold">Cancel</button><button disabled={!ready || loading.availability} onClick={checkAvailability} className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-50">{loading.availability ? "Checking…" : "Check availability"}</button><button disabled={!ready || !availability || conflict || saving} onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving && <LoaderCircle className="h-4 w-4 animate-spin" />}Confirm assignment</button></footer></div></div>;
}
