import { useState } from "react";
import { AlertTriangle, CheckCircle2, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { courseService } from "@/shared/services/courseService";
import SyllabusPdfImport from "./SyllabusPdfImport";
import { toSyllabusSavePayload } from "./syllabusImport";

const countsOf = (syllabus) => {
  const modules = Array.isArray(syllabus?.modules) ? syllabus.modules : [];
  const topics = modules.flatMap((module) => (Array.isArray(module?.topics) ? module.topics : []));
  return {
    moduleCount: modules.length,
    topicCount: topics.length,
    lessonCount: topics.reduce((sum, topic) => sum + (Array.isArray(topic?.lessons) ? topic.lessons.length : 0), 0),
  };
};

// GET .../syllabus answers 404 when a course has no syllabus yet.
const loadExistingSyllabus = async (courseId) => {
  try {
    return await courseService.getSyllabus(courseId);
  } catch (error) {
    if (error?.response?.status === 404) return null;
    throw error;
  }
};

const saveErrorMessage = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to manage this course syllabus.";
  if (status === 409) return "The server did not allow replacing the existing syllabus.";
  if (status === 400 && typeof message === "string" && message.trim()) return message.trim();
  return "Unable to save the imported syllabus. Please try again.";
};

// Edit Course → Course Syllabus PDF. Separate from Update Course: it never
// reads or writes course fields, and course updates never touch the syllabus.
//
// Process PDF (POST .../syllabus/import-pdf) → preview → Apply to Syllabus →
// [confirm when a syllabus already exists] → POST .../syllabus (existing save
// API) → GET .../syllabus to confirm what was stored → View Syllabus.
export default function CourseSyllabusImportSection({ courseId }) {
  const navigate = useNavigate();
  const [importKey, setImportKey] = useState(0);
  const [pendingReplace, setPendingReplace] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(null);

  const save = async (imported, existing) => {
    setSaving(true);
    setSaveError("");
    try {
      await courseService.createSyllabus(courseId, toSyllabusSavePayload(imported, existing?.description));
      // Report what the backend actually stored, not what was sent.
      setSaved(countsOf(await loadExistingSyllabus(courseId)));
      setPendingReplace(null);
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const apply = async (imported) => {
    setSaveError("");
    let existing;
    try {
      existing = await loadExistingSyllabus(courseId);
    } catch {
      setSaveError("Unable to check this course's current syllabus. Nothing was saved.");
      return;
    }
    if (countsOf(existing).moduleCount > 0) {
      setPendingReplace({ imported, existing });
      return;
    }
    await save(imported, existing);
  };

  const startOver = () => {
    setSaved(null);
    setPendingReplace(null);
    setSaveError("");
    setImportKey((key) => key + 1);
  };

  return <div className="mt-5 border-t pt-5">
    <p className="flex items-center gap-2 text-sm font-bold"><ScrollText className="h-4 w-4 text-blue-600" />Course Syllabus PDF</p>
    <p className="mt-1 text-xs text-slate-500">Upload a syllabus PDF to automatically create modules, topics and lessons.</p>

    {saved ? <div role="status" className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" />Syllabus imported successfully</p>
      <p className="mt-1"><strong>{saved.moduleCount} Modules</strong> · <strong>{saved.topicCount} Topics</strong> · <strong>{saved.lessonCount} Lessons</strong></p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => navigate(`/organization/courses/${encodeURIComponent(courseId)}/details?tab=syllabus`)} className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white">View Syllabus</button>
        <button type="button" onClick={startOver} className="rounded-lg border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-800">Import another PDF</button>
      </div>
    </div> : <div className="mt-3 space-y-3">
      <div className="rounded-2xl border-2 border-dashed border-blue-200 bg-white p-4">
        <p className="text-sm font-bold text-slate-800">Upload Course Syllabus</p>
        <p className="mb-3 text-xs text-slate-500">Choose a PDF containing modules, topics and lessons. PDF only.</p>
        <SyllabusPdfImport
          key={importKey}
          courseId={courseId}
          autoProcess
          previewInitiallyOpen={false}
          applyHint="Applying saves this structure as the course syllabus."
          onApply={apply}
        />
      </div>

      {pendingReplace && <div role="alertdialog" aria-labelledby="replace-syllabus-title" className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p id="replace-syllabus-title" className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" />Existing syllabus found</p>
        <p className="mt-1">This course already contains a syllabus. Applying this PDF will replace the existing syllabus.</p>
        <p className="mt-1 text-xs">Current: {countsOf(pendingReplace.existing).moduleCount} Modules · {countsOf(pendingReplace.existing).topicCount} Topics · {countsOf(pendingReplace.existing).lessonCount} Lessons</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" disabled={saving} onClick={() => setPendingReplace(null)} className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold disabled:opacity-60">Cancel</button>
          <button type="button" disabled={saving} onClick={() => save(pendingReplace.imported, pendingReplace.existing)} className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">{saving ? "Replacing..." : "Replace Syllabus"}</button>
        </div>
      </div>}
      {saving && !pendingReplace && <p role="status" className="text-xs font-semibold text-blue-700">Saving syllabus...</p>}
      {saveError && <p role="alert" className="text-xs font-semibold text-rose-600">{saveError}</p>}
    </div>}
  </div>;
}
