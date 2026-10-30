import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Trash2, Check, ChevronLeft, ChevronRight, ClipboardList,
  CalendarClock, ShieldCheck, Eye, Sparkles, Save, Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@shared/services/apiServices";
import assessmentService from "@/services/assessmentService";
import AssessmentPdfImport from "./AssessmentPdfImport";
import ModalHero from "@shared/components/ModalHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
// Backend-confirmed accepted values for AssessmentQuestion.questionType.
// "True/False" is shown to the mentor but submitted as "TrueFalse" (no
// separator) to match what the backend actually accepts. Note this is a
// per-question type, distinct from the Setup step's per-assessment "type"
// field below, which is Assessment.assessmentType itself (backend enum
// "MCQ" | "Coding" | "Mixed" — a 400 was thrown when this used to offer
// Quiz/Test/Mid-term/Final, values the backend never accepted).
const QUESTION_TYPE_OPTIONS = [
  { value: "MCQ", label: "MCQ" },
  { value: "TrueFalse", label: "True/False" },
  { value: "Descriptive", label: "Descriptive" },
  { value: "Coding", label: "Coding" },
];
const empty = {
  name: "",
  description: "",
  courseId: "",
  batchId: "",
  type: "MCQ",
  start: "",
  end: "",
  duration: 30,
  total: 50,
  pass: 25,
  attempts: "1",
  negative: false,
  wrongMarks: 0,
  proctoring: false,
  shuffleQuestions: true,
  shuffleOptions: true,
  immediate: false,
  release: "",
  questions: [],
};
const toEditorData = (item) => {
  if (!item) return empty;
  const start = item.start || item.startDate || item.date || item.scheduledAt || item.scheduledDate || "";
  const end = item.end || item.endDate || (start ? new Date(new Date(start).getTime() + Number(item.duration || item.durationMinutes || 30) * 60000).toISOString() : "");
  // API timestamps with an explicit offset describe an absolute instant; the
  // form uses datetime-local, so convert that instant to local wall time once.
  const localDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  return { ...empty, ...item, start: localDate(start), end: localDate(end), questions: item.questions || [] };
};
export default function CreateAssessment({ open, onClose, batches, courses = [], onSave, initialData = null, allowPdfImport = false }) {
  const [step, setStep] = useState(1),
    [saving, setSaving] = useState(false),
    [f, setF] = useState(() => toEditorData(initialData)),
    [q, setQ] = useState({
      text: "",
      difficulty: "",
      type: "MCQ",
      marks: 5,
      options: ["", "", "", ""],
      correct: 0,
      answer: "",
  });
  const contentRef = useRef(null);
  const submittingRef = useRef(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const editedQuestionIds = useRef(new Set());
  const questionTextRef = useRef(null);
  const [pdfImportOpen, setPdfImportOpen] = useState(false);
  // Imported questions are appended after any manual ones, in PDF order, and
  // then behave exactly like manually added questions (edit, reorder, delete).
  const applyImportedQuestions = (imported) => {
    const batch = Date.now();
    setF((current) => ({
      ...current,
      questions: [...current.questions, ...imported.map((question, index) => ({ ...question, options: [...question.options], id: `pdf-${batch}-${index}` }))],
    }));
    setPdfImportOpen(false);
    toast.success(`${imported.length} question${imported.length === 1 ? "" : "s"} added from the PDF. Review them before publishing.`);
  };
  const editQuestion = async (question) => {
    setQuestionLoading(true);
    try {
      let editorQuestion = question;
      if (question.apiQuestionId && !editedQuestionIds.current.has(question.id)) {
        const fresh = await assessmentService.getQuestion(question.apiQuestionId);
        if (!fresh || typeof fresh !== "object" || !fresh.questionText) throw new Error("The question response is empty.");
        const options = Array.isArray(fresh.options) ? fresh.options : [];
        editorQuestion = { ...question, text: fresh.questionText, type: fresh.questionType ?? question.type,
          difficulty: fresh.difficulty ?? question.difficulty, marks: fresh.marks ?? question.marks,
          answer: fresh.correctAnswer ?? question.answer,
          ...(options.length ? { options: options.map((option) => option.optionText), correct: Math.max(0, options.findIndex((option) => option.isCorrect)) } : {}),
        };
      }
      setQ({ ...editorQuestion, options: [...editorQuestion.options] });
      setEditingQuestionId(question.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to load question."));
    } finally {
      setQuestionLoading(false);
    }
  };
  const moveQuestion = (index, offset) => {
    const questions = [...f.questions];
    [questions[index], questions[index + offset]] = [questions[index + offset], questions[index]];
    setF((current) => ({ ...current, questions }));
  };

  // Each wizard step should begin at its own top, rather than retaining the
  // scroll position from the previous step and hiding fields under the header.
  useLayoutEffect(() => {
    if (open) contentRef.current?.scrollTo({ top: 0 });
  }, [open, step]);

  if (!open) return null;
  const paperTotal = f.questions.reduce(
    (sum, question) => sum + (Number(question.marks) || 0),
    0,
  );
  // Mirrors the backend's own Publish rule (SUM(question.marks) === assessment.totalMarks)
  // so the mismatch is visible while the paper is being built, well before the
  // mentor ever reaches Publish.
  const assessmentTotalMarks = Number(f.total) || 0;
  const marksMatch = f.questions.length === 0 || paperTotal === assessmentTotalMarks;
  const set = (key, value) => setF((x) => ({ ...x, [key]: value }));
  const setScheduleField = (key, value) => {
    setF((current) => {
      const next = { ...current, [key]: value };
      if (next.start && next.end) {
        const start = new Date(next.start).getTime();
        const end = new Date(next.end).getTime();
        if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
          next.duration = Math.round((end - start) / 60000);
        }
      }
      return next;
    });
  };
  const addQ = () => {
    if (!q.text.trim() || !Number.isInteger(Number(q.marks)) || Number(q.marks) <= 0)
      return toast.error("Enter the question and marks.");
    if (q.type === "MCQ" && q.options.some((x) => !x.trim()))
      return toast.error("Enter all four MCQ options.");
    if (q.type === "TrueFalse" && !q.answer)
      return toast.error("Select the correct answer.");
    const questions = editingQuestionId !== null
      ? f.questions.map((item) => item.id === editingQuestionId ? { ...q, id: item.id } : item)
      : [...f.questions, { ...q, id: Date.now() }];
    // Total marks are the mentor's own explicit choice (validated against the
    // question paper separately, see the marks-match summary below) — never
    // silently overwritten here. The backend rejects Publish unless
    // SUM(question.marks) === assessment.totalMarks; auto-forcing one to
    // match the other would hide that mismatch instead of letting the
    // mentor decide which side to fix.
    setF((current) => ({ ...current, questions }));
    if (editingQuestionId !== null) editedQuestionIds.current.add(editingQuestionId);
    setEditingQuestionId(null);
    setQ({
      text: "",
      difficulty: "",
      type: "MCQ",
      marks: 5,
      options: ["", "", "", ""],
      correct: 0,
      answer: "",
    });
  };
  const save = async (draft) => {
    const durationMinutes = Number(f.duration);
    // The mentor's own entry — never silently replaced by the question
    // paper's sum. A mismatch against paperTotal is surfaced by the summary
    // in the Questions step and blocks Publish later, but a draft-in-progress
    // is allowed to save while the paper is still being built.
    const totalMarks = Number(f.total) || 0;
    const passingMarks = Number(f.pass);
    if (!f.name || !f.batchId || !f.start || !f.end)
      return toast.error("Complete basic setup.");
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0)
      return toast.error("Duration must be greater than 0 minutes.");
    if (!Number.isFinite(passingMarks) || passingMarks < 0 || passingMarks > totalMarks)
      return toast.error("Pass marks must be between 0 and the total marks.");
    if (new Date(f.end) <= new Date(f.start))
      return toast.error("End time must be after start time.");
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSaving(true);
    try {
      const total = totalMarks;
      const pass = passingMarks;
      setF((current) => ({ ...current, total, pass }));
      await onSave({ ...f, total, pass, status: draft ? "Draft" : "Scheduled", evaluated: false, attempted: 0, passed: 0, avg: "—", date: f.start });
      toast.success(initialData ? "Assessment updated" : draft ? "Assessment saved as draft" : "Assessment scheduled");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to save assessment."), { id: "assessment-save-error" });
    } finally {
      submittingRef.current = false;
      setSaving(false);
    }
  };
  const goNext = () => {
    if (step === 1 && (!f.name || !f.batchId || !f.start || !f.end))
      return toast.error("Complete the required setup fields first.");
    if (step === 1 && new Date(f.end) <= new Date(f.start))
      return toast.error("End time must be after start time.");
    if (step === 1 && (!Number.isFinite(Number(f.duration)) || Number(f.duration) <= 0))
      return toast.error("Duration must be greater than 0 minutes.");
    if (step === 2 && !f.questions.length)
      return toast.error("Add at least one question before continuing.");
    setStep((current) => Math.min(4, current + 1));
  };
  const Toggle = ({ label, k }) => (
    <button
      type="button"
      onClick={() => set(k, !f[k])}
      className={`group flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-semibold transition ${f[k] ? "border-blue-200 bg-blue-50/60 text-slate-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"}`}
    >
      <span>{label}</span>
      <span
        className={`h-6 w-11 shrink-0 rounded-full p-1 transition ${f[k] ? "bg-blue-600 shadow-inner" : "bg-slate-200 dark:bg-slate-700"}`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${f[k] ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
  const field = (fieldLabel, key, type = "text") => (
    <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200">
      {fieldLabel}
      <input
        type={type}
        min={key === "duration" ? 1 : undefined}
        step={type === "number" ? 1 : undefined}
        value={f[key]}
        onChange={(e) => key === "start" || key === "end" ? setScheduleField(key, e.target.value) : set(key, e.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </label>
  );
  const sectionClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-700 dark:bg-slate-900";
  const selectClass = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-900 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white";
  const steps = [
    { label: "Setup", hint: "Basic details", icon: ClipboardList },
    { label: "Questions", hint: "Build the paper", icon: Sparkles },
    { label: "Rules", hint: "Access & security", icon: ShieldCheck },
    { label: "Review", hint: "Confirm & publish", icon: Eye },
  ];
  const currentStep = steps[step - 1] || steps[0];
  const progress = Math.round((step / steps.length) * 100);
  return createPortal((
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-slate-950/55 p-2 backdrop-blur-sm sm:p-4"
      onMouseDown={onClose}
    >
      <aside
        onMouseDown={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100vh-16px)] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl border border-white/60 bg-[#fbfaf7] shadow-[0_32px_100px_rgba(15,23,42,.35)] sm:max-h-[calc(100vh-32px)] sm:rounded-[24px] dark:border-slate-700 dark:bg-slate-950"
      >
        <ModalHero
          icon={ClipboardList}
          eyebrow={initialData ? "Assessment editor" : "Assessment builder"}
          title={initialData ? "Edit" : "Create New"}
          accent="Assessment"
          accentTone="blue"
          subtitle="Build engaging assessments to evaluate learning outcomes with flexible settings and scheduling."
          art={ORG_BANNERS.createAssessment.src}
          onClose={onClose}
        />
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-7 sm:py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="ca-steps grid grid-cols-4 gap-1 sm:gap-3">
          {steps.map((item, i) => {
            const done = i + 1 < step;
            const active = step === i + 1;
            return (
            <button
              type="button" key={item.label} disabled={!done && !active}
              onClick={() => done && setStep(i + 1)}
              className={`flex items-center gap-2 rounded-xl px-2 py-2 text-left transition sm:px-3 ${active ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900" : done ? "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30" : "text-slate-400"}`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${active ? "bg-blue-600 text-white shadow-[0_6px_14px_-4px_rgba(37,99,235,.6)]" : done ? "bg-emerald-500 text-white" : "bg-slate-300 text-white dark:bg-slate-700"}`} aria-hidden="true">{done ? <Check size={16} strokeWidth={3} /> : i + 1}</span>
              <span className="hidden min-w-0 sm:block"><b className="block text-sm">{item.label}</b><span className="block truncate text-xs font-medium opacity-70">{item.hint}</span></span>
            </button>
          )})}
          </div>
        </div>
        <div className="border-b border-slate-200/80 bg-slate-50/80 px-4 py-2.5 sm:px-7 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span><span className="text-slate-800 dark:text-slate-200">{currentStep.label}</span> · {currentStep.hint}</span>
            <span className="shrink-0 font-bold text-blue-600 dark:text-blue-400">{progress}% complete</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <main ref={contentRef} className="min-h-0 flex-1 overflow-y-auto bg-[#fbfaf7] p-4 sm:p-6 dark:bg-slate-950">
          {step === 1 && (
            <div className="space-y-4">
              <section className={sectionClass}>
                <div className="mb-4 flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50"><ClipboardList size={18} /></span><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Assessment details</h3><p className="mt-0.5 text-xs text-slate-500">Give your assessment a clear identity and audience.</p></div></div>
                <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{field("Assessment name *", "name")}</div>
              <div className="sm:col-span-2">{field("Description", "description")}</div>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200">Course *
                <select value={f.courseId} onChange={(e) => setF((current) => ({ ...current, courseId: e.target.value, batchId: "" }))} className={selectClass}>
                  <option value="">Choose course</option>
                  {courses.map((course) => <option key={course.courseId ?? course.id} value={course.courseId ?? course.id}>{course.courseName ?? course.title ?? course.name}</option>)}
                </select>
              </label>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                Assigned batch *
                <select
                  value={f.batchId}
                  onChange={(e) => {
                    const batch = batches.find((item) => String(item.id) === e.target.value);
                    setF((current) => ({ ...current, batchId: e.target.value, courseId: String(batch?.courseId ?? batch?.courseID ?? batch?.course?.courseId ?? batch?.course?.id ?? current.courseId) }));
                  }}
                  className={selectClass}
                >
                  <option value="">Choose batch</option>
                  {batches.filter((b) => !f.courseId || String(b.courseId ?? b.courseID ?? b.course?.courseId ?? b.course?.id ?? f.courseId) === String(f.courseId)).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.subject}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                Assessment type
                <select
                  value={f.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={selectClass}
                >
                  {["MCQ", "Coding", "Mixed"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
                </div>
              </section>
              <section className={sectionClass}>
                <div className="mb-4 flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50"><CalendarClock size={18} /></span><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule & scoring</h3><p className="mt-0.5 text-xs text-slate-500">Set availability, duration and success criteria.</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {field("Start date & time *", "start", "datetime-local")}
                {field("End date & time *", "end", "datetime-local")}
                {field("Duration (minutes) *", "duration", "number")}
                {field("Total marks *", "total", "number")}
                {field("Pass marks *", "pass", "number")}
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                Attempts
                <select
                  value={f.attempts}
                  onChange={(e) => set("attempts", e.target.value)}
                  className={selectClass}
                >
                  {["1", "2", "Unlimited"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              </div>
              </section>
              <section className={sectionClass}>
              <Toggle label="Negative marking" k="negative" />
              {f.negative && (
                <div className="mt-4">{field("Marks per wrong answer", "wrongMarks", "number")}</div>
              )}
              </section>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-blue-900 dark:from-blue-950/50 dark:to-indigo-950/40"><p className="flex items-center gap-2 text-sm font-bold text-blue-900 dark:text-blue-200"><Sparkles size={16} /> Build your question paper</p><p className="mt-1 pl-6 text-xs text-blue-700 dark:text-blue-300">Correct answers stay hidden from students and objective questions are auto-evaluated.</p></div>
              <div className={`rounded-xl border p-3 text-sm shadow-sm ${marksMatch ? "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"}`}>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
                  <span>Questions: {f.questions.length}</span>
                  <span>Total Question Marks: {paperTotal}</span>
                  <span>Assessment Total Marks: {assessmentTotalMarks}</span>
                  <span className="inline-flex items-center gap-1">
                    Marks Status: {marksMatch ? "✓ Match" : "✗ Mismatch"}
                  </span>
                </div>
                {!marksMatch && (
                  <p className="mt-1.5 text-xs font-medium">
                    Question marks ({paperTotal}) must equal assessment total marks ({assessmentTotalMarks}). Publishing will be blocked until these match — adjust the question marks or the assessment&apos;s Total marks field in Setup.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {allowPdfImport && <button type="button" disabled={pdfImportOpen} onClick={() => setPdfImportOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-600 shadow-sm disabled:opacity-60 dark:border-blue-900 dark:bg-slate-900"><Upload size={16} /> Upload Questions PDF</button>}
                <button type="button" onClick={() => { questionTextRef.current?.scrollIntoView?.({ block: "center" }); questionTextRef.current?.focus(); }} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm dark:bg-blue-600"><Plus size={16} /> Add Question</button>
              </div>
              {allowPdfImport && pdfImportOpen && <AssessmentPdfImport onApply={applyImportedQuestions} onClose={() => setPdfImportOpen(false)} />}
              {f.questions.map((x, index) => (
                <div
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  key={x.id}
                >
                  <span className="flex min-w-0 items-center gap-3 text-sm"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</span><span><b className="block truncate">{x.text}</b><span className="text-[11px] text-slate-500">{x.type} · {x.marks} marks</span></span></span>
                  <div className="flex items-center gap-2">
                  <button type="button" disabled={questionLoading} onClick={() => editQuestion(x)} className="text-xs font-semibold text-blue-600">Edit</button>
                  <button type="button" aria-label={`Move question ${index + 1} up`} disabled={index === 0} onClick={() => moveQuestion(index, -1)} className="text-xs disabled:opacity-30">Up</button>
                  <button type="button" aria-label={`Move question ${index + 1} down`} disabled={index === f.questions.length - 1} onClick={() => moveQuestion(index, 1)} className="text-xs disabled:opacity-30">Down</button>
                  <button
                    aria-label={`Delete question ${index + 1}`}
                    onClick={() =>
                      set(
                        "questions",
                        f.questions.filter((a) => a.id !== x.id),
                      )
                    }
                  >
                    <Trash2 className="text-rose-500" size={16} />
                  </button>
                  </div>
                </div>
              ))}
              <div className={sectionClass}>
                <div className="mb-4"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Add a question</h3><p className="mt-1 text-xs text-slate-500">Choose the format, enter marks and define the correct answer.</p></div>
                <input
                  ref={questionTextRef}
                  value={q.text}
                  onChange={(e) => setQ({ ...q, text: e.target.value })}
                  placeholder="Question text"
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800"
                />
                <label className="mt-3 block text-sm">Difficulty
                  <input value={q.difficulty ?? ""} onChange={(e) => setQ({ ...q, difficulty: e.target.value })} className={selectClass} placeholder="Enter difficulty" />
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <select
                    value={q.type}
                    onChange={(e) => setQ({ ...q, type: e.target.value })}
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {QUESTION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={q.marks}
                    onChange={(e) => setQ({ ...q, marks: e.target.value })}
                    aria-label="Question marks" className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                {q.type === "MCQ" &&
                  q.options.map((x, i) => (
                    <label
                      key={i}
                      className="mt-2 flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        checked={q.correct === i}
                        onChange={() => setQ({ ...q, correct: i })}
                      />
                      <input
                        value={x}
                        onChange={(e) => {
                          const a = [...q.options];
                          a[i] = e.target.value;
                          setQ({ ...q, options: a });
                        }}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 rounded border p-2"
                      />
                    </label>
                  ))}
                {q.type === "TrueFalse" && <div className="mt-3 grid grid-cols-2 gap-2">{["True", "False"].map((value) => <label key={value} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm font-semibold ${q.answer === value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white"}`}><input type="radio" name="true-false" checked={q.answer === value} onChange={() => setQ({ ...q, answer: value })} />{value}</label>)}</div>}
                {(q.type === "Descriptive" || q.type === "Coding") && <textarea value={q.answer} onChange={(e) => setQ({ ...q, answer: e.target.value })} placeholder="Optional model answer or evaluation note" className="mt-3 min-h-20 w-full rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800" />}
                <button
                  onClick={addQ}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-blue-600"
                >
                  <Plus size={16} /> {editingQuestionId !== null ? "Update question" : "Add question"}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                MCQ and True/False can be auto-evaluated. Written answers require mentor review.
              </p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-1"><h3 className="text-base font-bold text-slate-900 dark:text-white">Assessment rules</h3><p className="mt-1 text-sm text-slate-500">Control integrity, question order and result visibility.</p></div>
              <Toggle
                label="Enable proctoring (webcam and tab-switch monitoring)"
                k="proctoring"
              />
              <Toggle label="Randomize question order" k="shuffleQuestions" />
              <Toggle label="Randomize answer options" k="shuffleOptions" />
              <Toggle label="Release results immediately" k="immediate" />
              {!f.immediate && (
                <>{field("Scheduled result release", "release", "datetime-local")}</>
              )}
            </div>
          )}
          {step === 4 && (
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="py-2 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"><Check size={28} strokeWidth={2.5} /></span><h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">Ready to schedule</h3><p className="mt-1 text-sm text-slate-500">Review the configuration before making it available.</p></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <p>
                  <b>{f.name || "Untitled assessment"}</b>
                </p>
                <p className="mt-2">
                  {f.questions.length} questions ·{" "}
                  {paperTotal}/{assessmentTotalMarks} marks
                  {!marksMatch && <span className="ml-1.5 font-semibold text-rose-600 dark:text-rose-400">(mismatch — Publish will be blocked)</span>}
                </p>
                <p>
                  Pass marks: {f.pass} · {f.type}
                </p>
                <p>Duration: {Number(f.duration) || 0} minutes</p>
                <p>
                  Batch:{" "}
                  {batches.find((b) => b.id === f.batchId)?.name ||
                    "Not selected"}
                </p>
              </div>
            </div>
          )}
        </main>
        <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-7 dark:border-slate-800 dark:bg-slate-900">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < 4 ? (
            <button
              onClick={goNext}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => save(true)}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold dark:border-slate-700"
              >
                <Save size={15} /> Save draft
              </button>
              <button
                onClick={() => save(false)}
                disabled={saving}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                {saving ? "Saving..." : initialData ? "Save changes" : "Schedule assessment"}
              </button>
            </div>
          )}
        </footer>
      </aside>
    </div>
  ), document.body);
}
