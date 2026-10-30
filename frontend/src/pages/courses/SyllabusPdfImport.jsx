import { useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, FileText, Loader2, Upload, X } from "lucide-react";
import { courseService } from "@/shared/services/courseService";
import { mapImportedSyllabus } from "./syllabusImport";

const isPdf = (file) => file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name || ""));
const sizeLabel = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
// Only a plain string from the backend is shown — never an object or a stack.
const backendText = (error) => {
  const message = error?.response?.data?.message;
  return typeof message === "string" && message.trim() ? message.trim() : "";
};

const importErrorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You do not have permission to import a syllabus for this course.";
  if (status === 404) return "This course or its syllabus import service could not be found.";
  if (status === 413) return "This PDF is too large to process.";
  if (status === 400 || status === 422) return backendText(error) || "This PDF could not be processed. Please check the file and try again.";
  return "Unable to process syllabus PDF.";
};

const PROBLEM_TEXT = {
  "no-modules": "No syllabus modules were detected.",
  "no-structure": "Syllabus structure could not be extracted correctly.",
};

// Upload PDF → POST .../syllabus/import-pdf → validate → preview → Apply.
// Shared by Course Details → Syllabus (Apply fills the editor) and
// Edit Course (Apply saves through the existing syllabus API).
export default function SyllabusPdfImport({
  courseId,
  onApply,
  onClose,
  autoProcess = false,
  previewInitiallyOpen = true,
  applyHint = "Applying replaces the modules in the form. Nothing is saved until you click Save Syllabus.",
}) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(previewInitiallyOpen);

  const process = async (target = file) => {
    if (!target || processing) return;
    setProcessing(true);
    setError("");
    setResult(null);
    try {
      setResult(mapImportedSyllabus(await courseService.importSyllabusPdf(courseId, target)));
      setPreviewOpen(previewInitiallyOpen);
    } catch (requestError) {
      setError(importErrorMessage(requestError));
    } finally {
      setProcessing(false);
    }
  };

  const choose = (event) => {
    const next = event.target.files?.[0];
    event.target.value = "";
    if (!next) return;
    setResult(null);
    if (!isPdf(next)) {
      setFile(null);
      setError("Please select a PDF file.");
      return;
    }
    setError("");
    setFile(next);
    if (autoProcess) process(next);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError("");
  };
  const tryAgain = () => {
    reset();
    inputRef.current?.click();
  };
  const cancel = () => (onClose ? onClose() : reset());

  const apply = async () => {
    if (!result?.canApply || applying) return;
    setApplying(true);
    try {
      await onApply(result);
    } finally {
      setApplying(false);
    }
  };

  const { summary } = result ?? {};
  const busy = processing || applying;

  return <section aria-label="Import syllabus from PDF" className="rounded-xl border border-blue-200 bg-white p-3 shadow-sm">
    <header className="mb-2 flex items-center gap-2"><Upload className="h-4 w-4 text-blue-600" /><strong className="mr-auto text-xs uppercase text-slate-700">Import syllabus from PDF</strong>{onClose && <button type="button" aria-label="Close PDF import" disabled={busy} onClick={onClose} className="p-1 text-slate-500 disabled:opacity-40"><X className="h-4 w-4" /></button>}</header>

    <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={choose} className="hidden" data-testid="syllabus-pdf-input" />
    {!result && !processing && <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600"><FileText className="h-4 w-4" />{file ? "Choose another PDF" : autoProcess ? "Choose PDF" : "Select PDF"}</button>
      {file && <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{file.name} · {sizeLabel(file.size)}</span>}
      {!autoProcess && <button type="button" disabled={!file} onClick={() => process()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-60">Process PDF</button>}
    </div>}

    {processing && <div role="status" className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
      <div><p className="font-bold">Processing syllabus...</p><p className="mt-1">Extracting:</p><ul className="ml-4 list-disc"><li>Modules</li><li>Topics</li><li>Lessons</li></ul>{file && <p className="mt-1 text-blue-700">{file.name}</p>}</div>
    </div>}
    {error && <p role="alert" className="mt-2 text-[11px] font-semibold text-rose-600">{error}</p>}

    {result && <div className="space-y-3">
      <div className={`rounded-lg border p-3 text-xs ${result.canApply ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
        <p className="flex items-center gap-1.5 font-bold">{result.canApply ? <><CheckCircle2 className="h-4 w-4" />Syllabus PDF processed successfully</> : <><AlertTriangle className="h-4 w-4" />Syllabus could not be structured correctly.</>}</p>
        <p className="mt-1">File: <span className="font-semibold">{result.fileName || file?.name}</span></p>
        <p className="mt-1">Detected: <strong>{summary.moduleCount} Modules</strong> · <strong>{summary.topicCount} Topics</strong> · <strong>{summary.lessonCount} Lessons</strong></p>
        {!result.canApply && <div role="alert" className="mt-2 space-y-1 font-semibold">
          <p>{PROBLEM_TEXT[result.problem]}</p>
          <p className="font-normal">The PDF was processed, but topics and lessons were not detected. Please fix/retry the syllabus parsing before applying.</p>
        </div>}
      </div>

      {result.canApply && result.modules.length > 0 && <button type="button" aria-expanded={previewOpen} onClick={() => setPreviewOpen((open) => !open)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{previewOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}{previewOpen ? "Hide Preview" : "Preview Syllabus"}</button>}

      {result.canApply && previewOpen && <ol className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 p-3 text-xs" aria-label="Imported syllabus preview">
        {result.modules.map((module, mi) => <li key={mi}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Module {mi + 1}</p>
          <p className="font-bold text-slate-800">{module.moduleName || "Untitled module"}</p>
          {module.description && <p className="mt-0.5 text-slate-500">{module.description}</p>}
          {module.topics.length > 0 && <ol className="mt-1 space-y-1.5 pl-4">{module.topics.map((topic, ti) => <li key={ti}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500">Topic {ti + 1}</p>
            <p className="font-semibold text-blue-700">{topic.topicName || "Untitled topic"}</p>
            {topic.description && <p className="mt-0.5 text-slate-500">{topic.description}</p>}
            {topic.lessons.length > 0 && <ol className="mt-1 space-y-1 pl-4 text-slate-600">{topic.lessons.map((lesson, li) => <li key={li}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Lesson {li + 1}</p>
              <p className="font-medium text-slate-700">{lesson.lessonName || "Untitled lesson"}</p>
              {lesson.description && <p className="text-slate-500">{lesson.description}</p>}
            </li>)}</ol>}
          </li>)}</ol>}
        </li>)}
      </ol>}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {result.canApply && applyHint && <span className="mr-auto text-[11px] text-slate-500">{applyHint}</span>}
        {!result.canApply && <button type="button" onClick={tryAgain} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600">Try Again</button>}
        <button type="button" disabled={applying} onClick={cancel} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-60">Cancel</button>
        <button type="button" disabled={!result.canApply || applying} onClick={apply} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50">{applying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{applying ? "Applying..." : "Apply to Syllabus"}</button>
      </div>
    </div>}
  </section>;
}
