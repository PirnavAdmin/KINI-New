import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, BarChart3, BookOpen, CalendarDays, Check, ChevronDown, CloudUpload, FileText, IndianRupee, Loader2, Plus, Trash2, X } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { courseService } from "@/shared/services/courseService";
import Modal from "@shared/components/Modal";
import ModalHero from "@shared/components/ModalHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import CoursesPage from "./CoursesPage";
import CourseSyllabusImportSection from "./CourseSyllabusImportSection";
import { validateCoursePdf } from "./coursePdf";
import "./course-form-modal.css";

const empty = { courseName: "", duration: "", level: "", price: "", status: true };
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
// Suggestions only: duration stays free text, exactly as the backend accepts it.
const DURATION_SUGGESTIONS = ["1 Month", "2 Months", "3 Months", "4 Months", "6 Months", "9 Months", "12 Months"];
const FORM_ID = "course-form";

const sizeLabel = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

// Add / Edit Course dialog. It keeps its own routes (/organization/courses/add,
// .../:courseId/edit) and shows the Courses list behind it, so closing simply
// navigates back exactly as before — which also reloads the list.
export default function CourseForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams();
  const editing = Boolean(courseId);
  const closeDestination = location.state?.returnTo || "/organization/courses";
  const showCoursesBehind = closeDestination.startsWith("/organization/courses");
  const titleId = useId();
  const [open, setOpen] = useState(true);
  const exitTo = useRef(closeDestination);
  const [form, setForm] = useState(empty);
  const [initial, setInitial] = useState(empty);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const createdIdRef = useRef(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [validatingPdf, setValidatingPdf] = useState(false);

  useEffect(() => {
    if (!editing) return;
    let active = true;
    courseService.getCourse(courseId).then((c) => {
      if (!active) return;
      const loaded = {
        courseName: c.courseName ?? c.title ?? c.name ?? "",
        duration: c.duration ?? "",
        level: c.level ?? "",
        price: c.price ?? "",
        status: c.status === true || String(c.status).toLowerCase() === "active",
      };
      setForm(loaded);
      setInitial(loaded);
    }).catch(() => toast.error("Unable to load course details."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [courseId, editing]);

  const busy = saving || deleting || validatingPdf;
  const dirty = Boolean(syllabusFile) || Object.keys(empty).some((key) => String(form[key]) !== String(initial[key]));

  // Close with the exit animation, then leave the route.
  const leave = (destination = closeDestination) => {
    exitTo.current = destination;
    setOpen(false);
  };
  // X, Cancel, Escape and the backdrop: never while saving, and confirm before
  // discarding anything the user has entered.
  const requestClose = () => {
    if (busy) return;
    if (dirty && !window.confirm("Discard your changes to this course?")) return;
    leave();
  };

  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (savingRef.current || validatingPdf) return;
    const next = {};
    if (!form.courseName.trim()) next.courseName = "Course name is required";
    if (!form.duration.trim()) next.duration = "Duration is required";
    if (!form.level) next.level = "Level is required";
    if (form.price === "" || Number(form.price) < 0) next.price = "Enter a valid price";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`${titleId}-${Object.keys(next)[0]}`)?.focus();
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSubmitError("");
    try {
      const payload = {
        courseName: form.courseName.trim(),
        duration: form.duration.trim(),
        level: form.level,
        price: Number(form.price),
        status: form.status,
      };
      if (editing) {
        await courseService.updateCourse(courseId, payload);
      } else {
        if (createdIdRef.current == null) {
          const created = await courseService.createCourse(payload);
          createdIdRef.current = created?.courseId ?? created?.id ?? created?.data?.courseId ?? created?.data?.id;
          if (createdIdRef.current == null && syllabusFile) {
            toast.error("Course created without a returned ID. Find it in the course list before uploading the PDF.");
            leave();
            return;
          }
        } else {
          await courseService.updateCourse(createdIdRef.current, payload);
        }
        if (syllabusFile) await courseService.uploadPdf(createdIdRef.current, syllabusFile);
      }
      toast.success(editing ? "Course updated successfully." : "Course created successfully.");
      leave();
    } catch (error) {
      const reason = error?.response?.status === 413 ? "The PDF exceeds the server upload limit." : error?.response?.data?.message || "Unable to save course or upload PDF.";
      const message = createdIdRef.current != null ? `Course created. ${reason} Retry to finish saving this course.` : reason;
      setSubmitError(message);
      toast.error(message);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete ${form.courseName || "this course"}? This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      await courseService.deleteCourse(courseId);
      toast.success("Course deleted successfully.");
      leave("/organization/courses");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to delete this course. It may have linked batches, students, modules, or assessments.");
    } finally {
      setDeleting(false);
    }
  };

  const fieldId = (key) => `${titleId}-${key}`;

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        {editing && (
          <button type="button" disabled={busy} onClick={remove} className="cfm-btn cfm-btn--danger">
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting…" : "Delete Course"}
          </button>
        )}
      </div>
      <div className="flex gap-2.5">
        <button type="button" onClick={requestClose} disabled={busy} className="cfm-btn cfm-btn--ghost">
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button type="submit" form={FORM_ID} disabled={busy || loading} aria-busy={saving} className="cfm-btn cfm-btn--primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {saving ? (editing ? "Updating…" : "Creating…") : editing ? "Update Course" : "Create Course"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {showCoursesBehind && (
        <div inert aria-hidden="true">
          <CoursesPage />
        </div>
      )}
      <Modal
        open={open}
        onClose={requestClose}
        onExitComplete={() => navigate(exitTo.current, { replace: true })}
        size="lg"
        trapFocus
        motionPreset="rise"
        ariaLabelledBy={titleId}
        backdropClassName="bg-[rgba(15,23,42,0.55)]"
        className="cfm max-w-[920px]! max-h-[min(850px,92dvh)]! rounded-[20px]! border-0! shadow-[0_28px_70px_-18px_rgba(15,23,42,.45)]!"
        bodyClassName="px-5! py-4! sm:px-7!"
        footerClassName="px-5! py-3.5! sm:px-7! shadow-none! dark:bg-slate-800"
        hero={
          <ModalHero
            className="kmh--course"
            eyebrow="Course management"
            title={editing ? "Edit Course" : "Add New Course"}
            subtitle={editing ? "Update the course details and syllabus for your learning programs." : "Create and configure a new course for your learning programs."}
            art={ORG_BANNERS.courseDetails.src}
            titleId={titleId}
            onClose={requestClose}
            closeDisabled={busy}
          />
        }
        footer={footer}
      >
        {loading ? (
          <div className="grid min-h-60 place-items-center" role="status">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF941F]" />
            <span className="sr-only">Loading course details</span>
          </div>
        ) : (
          <form id={FORM_ID} onSubmit={submit} noValidate>
            <SectionHeading
              icon={BookOpen}
              tone="orange"
              title="Course Details"
              subtitle={editing ? "Update the information for this course." : "Enter the required information to create your course."}
            />
            {submitError && (
              <p role="alert" className="mt-3 flex items-start gap-2 rounded-[10px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12.5px] font-medium text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {submitError} Your entries are kept — check them and try again.
              </p>
            )}
            <div className="mt-4 grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
              <Field id={fieldId("courseName")} label="Course Name" icon={BookOpen} error={errors.courseName}>
                <input id={fieldId("courseName")} value={form.courseName} onChange={(e) => change("courseName", e.target.value)} placeholder="e.g. ASP.NET Core Web API" autoComplete="off" {...ariaFor(fieldId("courseName"), errors.courseName)} className="cfm-control" />
              </Field>
              <Field id={fieldId("duration")} label="Duration" icon={CalendarDays} error={errors.duration}>
                <input id={fieldId("duration")} list={`${titleId}-durations`} value={form.duration} onChange={(e) => change("duration", e.target.value)} placeholder="e.g. 4 Months" autoComplete="off" {...ariaFor(fieldId("duration"), errors.duration)} className="cfm-control" />
                <datalist id={`${titleId}-durations`}>
                  {DURATION_SUGGESTIONS.map((option) => <option key={option} value={option} />)}
                </datalist>
              </Field>
              <Field id={fieldId("level")} label="Level" icon={BarChart3} error={errors.level} select>
                <select id={fieldId("level")} value={form.level} onChange={(e) => change("level", e.target.value)} {...ariaFor(fieldId("level"), errors.level)} className={`cfm-control ${form.level ? "" : "is-placeholder"}`}>
                  <option value="">Select course level</option>
                  {LEVELS.map((level) => <option key={level}>{level}</option>)}
                </select>
              </Field>
              <Field id={fieldId("price")} label="Price (INR)" icon={IndianRupee} error={errors.price}>
                <input id={fieldId("price")} type="number" min="0" inputMode="numeric" value={form.price} onChange={(e) => change("price", e.target.value)} placeholder="e.g. 25000" {...ariaFor(fieldId("price"), errors.price)} className="cfm-control" />
              </Field>
              <Field
                id={fieldId("status")}
                label="Course Status"
                adornment={<span className={`h-2.5 w-2.5 rounded-full ${form.status ? "bg-[#22C55E] shadow-[0_0_0_3px_rgba(34,197,94,.18)]" : "bg-[#94A3B8] shadow-[0_0_0_3px_rgba(148,163,184,.2)]"}`} />}
                hint={form.status ? "Active courses can be used for mentor and student assignments." : "Draft courses stay hidden from assignment lists until you activate them."}
                select
              >
                <select id={fieldId("status")} value={form.status ? "active" : "draft"} onChange={(e) => change("status", e.target.value === "active")} aria-describedby={`${fieldId("status")}-hint`} className="cfm-control">
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </Field>
            </div>

            <div className="mt-5 border-t border-[#E8EEF6] pt-4 dark:border-slate-700">
              {editing ? (
                <CourseSyllabusImportSection courseId={courseId} />
              ) : (
                <>
                  <SectionHeading icon={FileText} tone="rose" title="Course Syllabus PDF" subtitle="Upload the course syllabus while creating the course." optional />
                  <PdfDropzone file={syllabusFile} onChange={setSyllabusFile} onValidationChange={setValidatingPdf} disabled={busy} />
                </>
              )}
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

const ariaFor = (id, error) => ({ "aria-invalid": Boolean(error) || undefined, "aria-describedby": error ? `${id}-error` : undefined });

function SectionHeading({ icon: Icon, tone, title, subtitle, optional = false }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className={`cfm-section-icon is-${tone}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold leading-tight text-[#0B2545] dark:text-white">
          {title}
          {optional && <span className="ml-2 align-middle text-[11px] font-semibold text-[#7C8DA5]">Optional</span>}
        </h3>
        <p className="mt-0.5 text-[12.5px] text-[#5E7089] dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

// `adornment` replaces the leading icon (the status dot).
function Field({ id, label, icon: Icon, adornment, error, hint, select = false, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[12.5px] font-semibold text-[#0B2545] dark:text-slate-200">
        {label} <span className="text-[#E5484D]" aria-hidden="true">*</span>
      </label>
      <div className={`cfm-field ${error ? "is-invalid" : ""}`}>
        <span className="cfm-field__icon" aria-hidden="true">{adornment ?? <Icon className="h-4 w-4" />}</span>
        {children}
        {select && <ChevronDown className="cfm-field__chevron" aria-hidden="true" />}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 flex items-center gap-1 text-[11.5px] font-medium text-[#D93036]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
      {!error && hint && <p id={`${id}-hint`} className="mt-1 text-[11.5px] leading-4 text-[#6B7C93] dark:text-slate-400">{hint}</p>}
    </div>
  );
}

// PDF picker for the create flow: browse or drag a file in, see its name and
// size, remove it. The upload itself still happens after the course is saved.
function PdfDropzone({ file, onChange, onValidationChange, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const pick = async (candidate) => {
    if (!candidate) return;
    onValidationChange(true);
    const validation = await validateCoursePdf(candidate).catch(() => "Unable to read this PDF.");
    onValidationChange(false);
    if (validation) {
      setError(validation);
      return;
    }
    setError("");
    onChange(candidate);
  };
  const clear = () => {
    onChange(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="mt-3">
      <div
        className={`cfm-drop ${dragging ? "is-dragging" : ""} ${error ? "is-invalid" : ""}`}
        onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) pick(event.dataTransfer.files?.[0]); }}
      >
        <span className="cfm-drop__icon" aria-hidden="true">
          {file ? <FileText className="h-6 w-6" /> : <CloudUpload className="h-6 w-6" />}
        </span>
        <div className="min-w-0 flex-1">
          {file ? (
            <>
              <p className="truncate text-[13px] font-semibold text-[#0B2545] dark:text-white" title={file.name}>{file.name}</p>
              <p className="mt-0.5 text-[12px] text-[#16A34A]">{sizeLabel(file.size)} · Ready to upload with the course</p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-semibold text-[#0B2545] dark:text-white">Choose a file or drag it here</p>
              <p className="mt-0.5 text-[12px] text-[#6B7C93]">PDF only</p>
            </>
          )}
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled} className="cfm-btn cfm-btn--ghost cfm-btn--sm">{file ? "Replace PDF" : "Upload PDF"}</button>
        {file && (
          <button type="button" onClick={clear} disabled={disabled} className="cfm-btn cfm-btn--ghost cfm-btn--sm" aria-label={`Remove ${file.name}`}>
            <X className="h-4 w-4" />
            Remove
          </button>
        )}
        <input
          disabled={disabled}
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          tabIndex={-1}
          aria-label="Course syllabus PDF"
          className="sr-only"
          onChange={(event) => { const candidate = event.target.files?.[0]; event.target.value = ""; pick(candidate); }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-1.5 flex items-center gap-1 text-[11.5px] font-medium text-[#D93036]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

