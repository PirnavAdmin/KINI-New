import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Activity,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Hash,
  Link2,
  Layers3,
  Lock,
  NotebookPen,
  Radio,
  UserRound,
  Users,
  Video,
  X,
} from "lucide-react";
import { LIVE_CLASS_STATUS_OPTIONS } from "@features/live-classes/utils/liveClassOptions";
import "./schedule-live-class.css";

const JITSI_DOMAIN = import.meta.env?.VITE_JITSI_DOMAIN || "meet.jit.si";
const DESCRIPTION_LIMIT = 500;

// `error` shows a validation message under the field; `hint` a neutral note.
function Row({ icon: Icon, tone, label, required, children, wide = false, top = false, error = "", hint = "" }) {
  return (
    <div className={`slc-row ${wide ? "is-wide" : ""} ${top ? "is-top" : ""} ${error ? "is-invalid" : ""}`}>
      <span className={`slc-row__icon is-${tone}`} aria-hidden="true"><Icon /></span>
      <label className="slc-row__field">
        <span className="slc-label">{label}{required && <i aria-hidden="true"> *</i>}</span>
        {children}
        {error ? <span className="slc-error" role="alert">{error}</span> : hint ? <span className="slc-hint">{hint}</span> : null}
      </label>
    </div>
  );
}

function LiveArt() {
  return (
    <svg className="slc-art" viewBox="0 0 260 130" aria-hidden="true" focusable="false">
      <ellipse cx="140" cy="122" rx="110" ry="7" fill="#dbe8fa" />
      <path d="M36 120 C20 92 26 66 52 54 C60 82 56 104 36 120 Z" fill="#7dc9a0" />
      <path d="M46 120 C48 92 64 76 84 72 C80 98 68 112 46 120 Z" fill="#4fb07f" />
      <rect x="70" y="104" width="44" height="14" rx="3" fill="#2f6fe4" />
      <rect x="74" y="92" width="38" height="12" rx="3" fill="#f39924" />
      <rect x="88" y="24" width="120" height="78" rx="8" fill="#1c3f78" />
      <rect x="95" y="31" width="106" height="64" rx="4" fill="#eef4fd" />
      <rect x="101" y="38" width="40" height="5" rx="2" fill="#c9dbf6" />
      <rect x="101" y="48" width="30" height="5" rx="2" fill="#c9dbf6" />
      <circle cx="132" cy="70" r="13" fill="#2f6fe4" />
      <path d="M128 63 L139 70 L128 77 Z" fill="#fff" />
      <circle cx="176" cy="60" r="12" fill="#fde2bf" />
      <path d="M164 92 C164 76 188 76 188 92 Z" fill="#f39924" />
      <path d="M166 54 C168 44 186 44 188 56 C182 50 172 50 166 54 Z" fill="#1c3f78" />
      <path d="M80 102 H216 L224 112 H72 Z" fill="#9db6d8" />
      <rect x="216" y="70" width="26" height="40" rx="6" fill="#5eead4" />
      <rect x="221" y="76" width="16" height="4" rx="2" fill="#0f766e" />
      <rect x="221" y="84" width="10" height="4" rx="2" fill="#0f766e" />
    </svg>
  );
}

/**
 * Schedule Live Class dialog (mentor › Class Schedule). Controlled by the
 * parent: `form`/`update` hold the values and `onSubmit` creates the class.
 */
export default function ScheduleLiveClassDialog({ form, update, catalog, batches, modules, errors = {}, mentorLabel, saving, onClose, onSubmit, idOf, nameOf, fieldClass }) {
  const [showPassword, setShowPassword] = useState(false);
  const dialogRef = useRef(null);
  // The parent passes a new onClose function on every render. Reading it
  // through a ref keeps the effects below from re-running on each keystroke —
  // previously that re-ran the initial focus and pulled focus from Class
  // Title back to the Course dropdown after every character.
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  // Initial focus on the first enabled field, once, when the dialog opens
  // (Course stays disabled while the mentor's courses load).
  useEffect(() => {
    dialogRef.current?.querySelector("select:enabled, input:enabled")?.focus();
  }, []);

  const moduleOptions = modules?.options ?? [];
  const moduleState = !form.course ? "no-course" : modules?.status ?? "idle";
  const allCompleted = moduleState === "ready" && Boolean(modules?.allCompleted);
  // Completion that cannot be verified is reported, not treated as "not completed".
  const completionError = moduleState === "ready" && Boolean(form.batch) && moduleOptions.length > 0 && !modules?.completionVerified
    ? "Module completion can't be verified for this batch: the server doesn't report which modules are completed. Check before scheduling."
    : "";
  const modulePlaceholder = {
    "no-course": "Select a course first",
    loading: "Loading modules…",
    error: "Couldn't load modules",
  }[moduleState] ?? (allCompleted ? "All modules completed for this batch" : moduleOptions.length ? "Select module" : "No modules in this course");
  const selectedModule = moduleOptions.find((option) => option.value === String(form.moduleId));
  // The selected module's description sits under the dropdown, so options stay short.
  const moduleHint = moduleState === "ready" && !moduleOptions.length
    ? "This course has no syllabus modules yet. Add one to the course syllabus before scheduling a class."
    : moduleState === "error" ? modules?.error
      : allCompleted ? "Every module of this course is completed for the selected batch."
        : selectedModule?.description ?? "";

  const platformName = String(form.meetingPlatform || "").toLowerCase();
  const canGenerate = !platformName || platformName.includes("jitsi");
  const generateLink = () => {
    const slug = String(form.classTitle || "class").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "class";
    const random = Math.random().toString(36).slice(2, 8);
    if (!form.meetingPlatform) {
      const jitsi = catalog.platforms.find((item) => String(nameOf(item)).toLowerCase().includes("jitsi"));
      if (jitsi) update("meetingPlatform", nameOf(jitsi));
    }
    update("meetingLink", `https://${JITSI_DOMAIN}/kini-${slug}-${random}`);
  };
  // Course/batch options are the mentor's own assignments (catalog.status is
  // loading | error | empty | ready); each state reads differently.
  const catalogState = catalog.status ?? "ready";
  const coursePlaceholder = {
    loading: "Loading your courses…",
    error: "Couldn't load your courses",
    empty: "No courses assigned to you",
  }[catalogState] ?? "Select course";
  const courseHint = {
    error: "Your assigned courses and batches could not be loaded. Close and reopen to try again.",
    empty: "You have no course or batch assignments yet. Ask your organization admin to assign you to a batch.",
  }[catalogState] ?? "";
  const batchPlaceholder = !form.course ? "Select a course first" : batches.length ? "Select batch" : "No batches assigned to you for this course";
  const statuses = catalog.statuses.length ? catalog.statuses : LIVE_CLASS_STATUS_OPTIONS;
  const field = `slc-input ${fieldClass ?? ""}`;

  return (
    <>
      <button type="button" aria-label="Close scheduler" onClick={onClose} className="slc-backdrop" />
      <form ref={dialogRef} onSubmit={onSubmit} noValidate role="dialog" aria-modal="true" aria-labelledby="schedule-title" className="slc-dialog">
        <header className="slc-head">
          <span className="slc-head__icon" aria-hidden="true"><CalendarPlus /></span>
          <div className="min-w-0 flex-1">
            <p className="slc-eyebrow">New Teaching Session</p>
            <h2 id="schedule-title">Schedule <em>Live</em> Class</h2>
            <p className="slc-sub">Set up your live class session, enable recording and publish it to your schedule.</p>
          </div>
          <div className="slc-head__art" aria-hidden="true">
            <span className="slc-live"><Radio />LIVE</span>
            <LiveArt />
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="slc-close"><X /></button>
        </header>

        <div className="slc-grid">
          <Row icon={BookOpen} tone="blue" label="Course" required error={errors.course} hint={courseHint}>
            <select required aria-invalid={Boolean(errors.course) || undefined} aria-busy={catalogState === "loading" || undefined} disabled={catalogState !== "ready"} value={form.course} onChange={(event) => update("course", event.target.value)} className={field}>
              <option value="">{coursePlaceholder}</option>
              {catalog.courses.map((item) => <option key={idOf(item)} value={idOf(item)}>{nameOf(item)}</option>)}
            </select>
          </Row>
          <Row icon={Users} tone="green" label="Batch" required error={errors.batch}>
            <select required aria-invalid={Boolean(errors.batch) || undefined} disabled={!form.course || !batches.length} value={form.batch} onChange={(event) => update("batch", event.target.value)} className={field}>
              <option value="">{batchPlaceholder}</option>
              {batches.map((item) => <option key={idOf(item)} value={idOf(item)}>{nameOf(item)}</option>)}
            </select>
          </Row>
          <Row icon={Layers3} tone="purple" label="Module" required error={errors.moduleId || completionError} hint={moduleHint}>
            <select
              value={form.moduleId}
              onChange={(event) => update("moduleId", event.target.value)}
              disabled={moduleState !== "ready" || !moduleOptions.length || allCompleted}
              aria-invalid={Boolean(errors.moduleId) || undefined}
              aria-busy={moduleState === "loading" || undefined}
              className={field}
            >
              <option value="">{modulePlaceholder}</option>
              {moduleOptions.map((option) => <option key={option.value} value={option.value} disabled={Boolean(option.completed)} title={option.description || option.label}>{option.label}</option>)}
            </select>
          </Row>
          <Row icon={FileText} tone="orange" label="Class Title" required error={errors.classTitle}>
            <input required aria-invalid={Boolean(errors.classTitle) || undefined} value={form.classTitle} onChange={(event) => update("classTitle", event.target.value)} className={field} placeholder="Enter class title" />
          </Row>
          <Row icon={CalendarDays} tone="purple" label="Date" required error={errors.scheduledDate}>
            <input required aria-invalid={Boolean(errors.scheduledDate) || undefined} type="date" value={form.scheduledDate} onChange={(event) => update("scheduledDate", event.target.value)} className={field} />
          </Row>
          <Row icon={UserRound} tone="red" label="Mentor" required>
            <input readOnly value={mentorLabel} className={field} aria-readonly="true" />
          </Row>
          <Row icon={Video} tone="blue" label="Meeting Platform" required error={errors.meetingPlatform}>
            <select required aria-invalid={Boolean(errors.meetingPlatform) || undefined} value={form.meetingPlatform} onChange={(event) => update("meetingPlatform", event.target.value)} className={field}>
              <option value="">Select platform</option>
              {catalog.platforms.map((item) => <option key={idOf(item)} value={nameOf(item)}>{nameOf(item)}</option>)}
            </select>
          </Row>
          <Row icon={Clock} tone="orange" label="Start Time" required error={errors.startTime}>
            <input required aria-invalid={Boolean(errors.startTime) || undefined} type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} className={field} />
          </Row>
          <Row icon={Clock} tone="red" label="End Time" required error={errors.endTime}>
            <input required aria-invalid={Boolean(errors.endTime) || undefined} type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} className={field} />
          </Row>
          <div className="slc-row">
            <label className="slc-rec">
              <input type="checkbox" role="switch" checked={Boolean(form.isRecordingEnabled)} onChange={(event) => update("isRecordingEnabled", event.target.checked)} />
              <span className="slc-rec__switch" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <b>Enable Recording</b>
                <small>{form.isRecordingEnabled ? "This session will be recorded automatically." : "This session will not be recorded."}</small>
              </span>
              <Radio className="slc-rec__icon" aria-hidden="true" />
            </label>
          </div>
          <Row icon={Link2} tone="purple" label="Meeting URL" required wide error={errors.meetingLink}>
            <span className="slc-inline">
              <input required aria-invalid={Boolean(errors.meetingLink) || undefined} type="url" value={form.meetingLink} onChange={(event) => update("meetingLink", event.target.value)} className={field} placeholder="https://..." />
              <button type="button" className="slc-gen" onClick={generateLink} disabled={!canGenerate} title={canGenerate ? `Create a ${JITSI_DOMAIN} room link` : "Generate Link is available for Jitsi meetings"}>
                Generate Link
              </button>
            </span>
          </Row>
          <Row icon={Hash} tone="green" label="Meeting ID">
            <input value={form.meetingId} onChange={(event) => update("meetingId", event.target.value)} className={field} placeholder="Optional" />
          </Row>
          <Row icon={Lock} tone="purple" label="Password">
            <span className="slc-inline slc-inline--pw">
              <input type={showPassword ? "text" : "password"} value={form.meetingPassword} onChange={(event) => update("meetingPassword", event.target.value)} className={field} placeholder="Optional" autoComplete="new-password" />
              <button type="button" className="slc-eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </span>
          </Row>
          <Row icon={Activity} tone="green" label="Status" required>
            <select required value={form.status} onChange={(event) => update("status", event.target.value)} className={field}>
              {statuses.map((item) => <option key={idOf(item)} value={String(nameOf(item)).toLowerCase()}>{nameOf(item)}</option>)}
            </select>
          </Row>
          <div className="slc-row slc-spacer" aria-hidden="true" />
          <Row icon={NotebookPen} tone="blue" label="Description" wide top>
            <textarea value={form.description} maxLength={DESCRIPTION_LIMIT} onChange={(event) => update("description", event.target.value)} className={`${field} slc-textarea`} rows="3" placeholder="Optional notes" />
            <span className="slc-count">{form.description.length}/{DESCRIPTION_LIMIT}</span>
          </Row>
        </div>

        <footer className="slc-foot">
          <button type="button" onClick={onClose} className="slc-btn slc-btn--ghost">Cancel</button>
          <button type="submit" disabled={saving} className="slc-btn slc-btn--primary">
            <Video aria-hidden="true" />
            {saving ? "Scheduling..." : "Schedule Live Class"}
          </button>
        </footer>
      </form>
    </>
  );
}

ScheduleLiveClassDialog.propTypes = {
  form: PropTypes.object.isRequired,
  update: PropTypes.func.isRequired,
  catalog: PropTypes.object.isRequired,
  batches: PropTypes.array.isRequired,
  modules: PropTypes.shape({ status: PropTypes.string, options: PropTypes.array, error: PropTypes.string, allCompleted: PropTypes.bool, completionVerified: PropTypes.bool }),
  errors: PropTypes.object,
  mentorLabel: PropTypes.string,
  saving: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  idOf: PropTypes.func.isRequired,
  nameOf: PropTypes.func.isRequired,
  fieldClass: PropTypes.string,
};
Row.propTypes = { icon: PropTypes.elementType, tone: PropTypes.string, label: PropTypes.node, required: PropTypes.bool, children: PropTypes.node, wide: PropTypes.bool, top: PropTypes.bool, error: PropTypes.string, hint: PropTypes.string };
