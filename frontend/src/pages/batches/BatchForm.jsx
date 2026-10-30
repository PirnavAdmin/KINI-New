import { useId, useRef, useState } from "react";
import { AlertTriangle, UserPlus, X } from "lucide-react";
import Modal from "@shared/components/Modal";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { batchService } from "@shared/services/batchService";
const sections = ["Identity", "Mentor", "Schedule", "Capacity", "Enrollment"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const initial = {
  name: "",
  course: "",
  code: "BAT-2026-007",
  trainer: "",
  substitute: "",
  startDate: "2026-08-01",
  endDate: "2027-02-28",
  days: [],
  startTime: "10:00",
  endTime: "11:30",
  capacity: 30,
  mode: "Online",
  platform: "Google Meet",
  meetingLink: "",
  room: "",
  enrollmentType: "Open",
  students: 0,
  status: "Planned",
};
const input =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
function Field({ label, required, error, children }) {
  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
      {children}
      {error && (
        <span className="mt-1 block text-[11px] text-red-600">{error}</span>
      )}
    </label>
  );
}
export default function BatchForm({
  open,
  batch,
  onClose,
  onSave,
  onEnrollmentChanged,
}) {
  if (!open) return null;
  return (
    <BatchFormContent
      key={batch?.id || "new"}
      batch={batch}
      onClose={onClose}
      onSave={onSave}
      onEnrollmentChanged={onEnrollmentChanged}
    />
  );
}
function BatchFormContent({ batch, onClose, onSave, onEnrollmentChanged }) {
  const base = batch ? { ...initial, ...batch } : initial;
  const [values, setValues] = useState(base);
  const [section, setSection] = useState("Identity");
  const [errors, setErrors] = useState({});
  const [confirmClose, setConfirmClose] = useState(false);
  const set = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
  const formId = useId();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const enrollmentRef = useRef(false);
  const availableSeats = Math.max(0, Math.min(Number(values.capacity), Number(batch?.capacity ?? values.capacity)) - values.students);
  const openStudents = async () => {
    setPickerOpen(true);
    setStudentsLoading(true);
    setEnrollmentError("");
    setSelectedStudents([]);
    try {
      setAvailableStudents(await batchService.getAvailableStudents(batch.id));
    } catch (error) {
      setAvailableStudents([]);
      setEnrollmentError(getApiErrorMessage(error, "Unable to load available students."));
    } finally { setStudentsLoading(false); }
  };
  const enrollStudents = async () => {
    if (enrollmentRef.current || !selectedStudents.length) return;
    if (selectedStudents.length > availableSeats) {
      setEnrollmentError("Selected students exceed the available seats.");
      return;
    }
    enrollmentRef.current = true;
    setEnrolling(true);
    setEnrollmentError("");
    const added = [];
    try {
      for (const studentId of selectedStudents) {
        await batchService.assignStudents({ batchId: batch.id, studentId });
        added.push(studentId);
      }
      setPickerOpen(false);
    } catch (error) {
      setEnrollmentError(getApiErrorMessage(error, "Unable to add students to this batch."));
    } finally {
      if (added.length) {
        setValues(current => ({ ...current, students: current.students + added.length }));
        setAvailableStudents(current => current.filter(student => !added.includes(String(student.studentId ?? student.id))));
        setSelectedStudents(current => current.filter(id => !added.includes(id)));
        window.dispatchEvent(new Event("kini:student-updated"));
        try { await onEnrollmentChanged?.(); }
        catch { setEnrollmentError("Students were added. Reopen the batch to refresh its student list."); }
      }
      enrollmentRef.current = false;
      setEnrolling(false);
    }
  };
  const requestClose = () => { if (savingRef.current || enrollmentRef.current) return; if (confirmClose) setConfirmClose(false); else if (dirty) setConfirmClose(true); else onClose(); };
  const dirty = JSON.stringify(values) !== JSON.stringify(base);
  const conflict =
    !batch &&
    values.trainer === "Rahul Sharma" &&
    values.days.includes("Mon") &&
    values.startTime === "10:00";
  const classCount = values.days.length ? values.days.length * 16 : 0;
  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Batch name is required";
    if (!values.course) next.course = "Select a course";
    else if (batch && values.course !== base.course)
      next.course = "The course cannot be changed for an existing batch. Keep the original course or create a new batch.";
    if (!values.trainer) next.trainer = "Select a primary mentor";
    if (!values.startDate) next.startDate = "Start date is required";
    if (!values.endDate) next.endDate = "End date is required";
    else if (values.endDate <= values.startDate)
      next.endDate = "End date must be after the start date";
    if (values.capacity < values.students)
      next.capacity = `Capacity cannot be below ${values.students} enrolled students`;
    if (conflict) next.conflict = "Resolve the mentor conflict before saving";
    setErrors(next);
    if (next.name || next.course) setSection("Identity");
    else if (next.trainer) setSection("Mentor");
    else if (next.startDate || next.endDate || next.conflict)
      setSection("Schedule");
    else if (next.capacity) setSection("Capacity");
    return !Object.keys(next).length;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (enrollmentRef.current) return;
    if (!validate()) return;
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    try { await onSave(values, batch?.id); onClose(); }
    catch (error) { setSaveError(getApiErrorMessage(error, "Unable to save batch.")); }
    finally { savingRef.current = false; setSaving(false); }
  };
  return (
    <Modal open trapFocus onClose={requestClose} size="lg" showClose={false} ariaLabelledBy={`${formId}-title`}
      className="max-w-[980px]! rounded-2xl!" bodyClassName="p-0!" footerClassName="p-0!"
      hero={        <header className="flex items-center justify-between border-b bg-white px-5 py-4">
          <div>
            <h2 id={`${formId}-title`} className="font-semibold">
              {batch ? "Edit batch" : "Create batch"}
            </h2>
            <p className="text-xs text-slate-500">
              Configure delivery, capacity and enrollment.
            </p>
          </div>
          <button type="button" disabled={saving} aria-label="Close edit batch" onClick={requestClose}>
            <X className="h-5 w-5" />
          </button>
        </header>}
      footer={          <footer className="flex justify-end gap-2 border-t bg-white p-4">
            <button
              type="button"
              disabled={saving} onClick={requestClose}
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit" form={formId} disabled={conflict || saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save batch"}
            </button>
          </footer>}>
        <nav className="flex overflow-x-auto border-b bg-white px-3 sm:justify-center">
          {sections.map((item, index) => (
            <button
              key={item}
              onClick={() => setSection(item)}
              className={`shrink-0 border-b-2 px-4 py-3 text-xs font-semibold ${section === item ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}
            >
              {index + 1}. {item}
            </button>
          ))}
        </nav>
        <form id={formId} onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          {saveError && <p role="alert" className="px-5 pt-3 text-sm text-red-600">{saveError}</p>}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <section className="mx-auto max-w-[820px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="font-semibold">{section}</h3>
              {section === "Identity" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Batch name" required error={errors.name}>
                    <input
                      value={values.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={input}
                    />
                  </Field>
                  <Field label="Course" required error={errors.course}>
                    <select
                      value={values.course}
                      onChange={(e) => {
                        const course = e.target.value;
                        set("course", course);
                        setErrors(current => ({
                          ...current,
                          course: batch && course !== base.course
                            ? "The course cannot be changed for an existing batch. Keep the original course or create a new batch."
                            : "",
                        }));
                      }}
                      aria-invalid={Boolean(errors.course)}
                      className={input}
                    >
                      <option value="">Select course</option>
                      {base.course && !["Full Stack Dev", "Data Science", "UI/UX Design", "React Advanced"].includes(base.course) && <option>{base.course}</option>}
                      <option>Full Stack Dev</option>
                      <option>Data Science</option>
                      <option>UI/UX Design</option>
                      <option>React Advanced</option>
                    </select>
                  </Field>
                  <Field label="Batch code">
                    <input
                      readOnly
                      value={values.code}
                      className={`${input} bg-slate-50 font-mono`}
                    />
                  </Field>
                </div>
              )}
              {section === "Mentor" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Primary mentor"
                    required
                    error={errors.trainer}
                  >
                    <select
                      value={values.trainer}
                      onChange={(e) => set("trainer", e.target.value)}
                      className={input}
                    >
                      <option value="">Select mentor</option>
                      {values.trainer && !["Rahul Sharma", "Priya Nair", "Ankit Singh", "Kavya Reddy", "Suresh Kumar", "Riya Joshi"].includes(values.trainer) && <option>{values.trainer}</option>}
                      {[
                        "Rahul Sharma",
                        "Priya Nair",
                        "Ankit Singh",
                        "Kavya Reddy",
                        "Suresh Kumar",
                        "Riya Joshi",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Substitute mentor">
                    <select
                      value={values.substitute}
                      onChange={(e) => set("substitute", e.target.value)}
                      className={input}
                    >
                      <option value="">None</option>
                      <option>Priya Nair</option>
                      <option>Riya Joshi</option>
                    </select>
                  </Field>
                  <div className="sm:col-span-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                    Mentor availability will be checked against the selected
                    days and times.
                  </div>
                </div>
              )}
              {section === "Schedule" && (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start date" required error={errors.startDate}>
                      <input
                        type="date"
                        value={values.startDate}
                        onChange={(e) => set("startDate", e.target.value)}
                        className={input}
                      />
                    </Field>
                    <Field label="End date" required error={errors.endDate}>
                      <input
                        type="date"
                        value={values.endDate}
                        onChange={(e) => set("endDate", e.target.value)}
                        className={input}
                      />
                    </Field>
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Class days</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {days.map((day) => (
                        <label
                          key={day}
                          className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-semibold ${values.days.includes(day) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200"}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={values.days.includes(day)}
                            onChange={() =>
                              set(
                                "days",
                                values.days.includes(day)
                                  ? values.days.filter((item) => item !== day)
                                  : [...values.days, day],
                              )
                            }
                          />
                          {day}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Start time">
                      <input
                        type="time"
                        value={values.startTime}
                        onChange={(e) => set("startTime", e.target.value)}
                        className={input}
                      />
                    </Field>
                    <Field label="End time">
                      <input
                        type="time"
                        value={values.endTime}
                        onChange={(e) => set("endTime", e.target.value)}
                        className={input}
                      />
                    </Field>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                    Will create {classCount || 48} classes
                  </div>
                  {conflict && (
                    <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Conflict: Rahul already has React Batch at 10:00 AM on
                      Mondays.
                    </div>
                  )}
                  {errors.conflict && (
                    <p className="text-xs text-red-600">{errors.conflict}</p>
                  )}
                </div>
              )}
              {section === "Capacity" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field label="Max students" required error={errors.capacity}>
                    <input
                      type="number"
                      min={values.students || 1}
                      value={values.capacity}
                      onChange={(e) => set("capacity", Number(e.target.value))}
                      className={input}
                    />
                  </Field>
                  <Field label="Mode">
                    <select
                      value={values.mode}
                      onChange={(e) => set("mode", e.target.value)}
                      className={input}
                    >
                      <option>Online</option>
                      <option>Offline</option>
                      <option>Hybrid</option>
                    </select>
                  </Field>
                  {values.mode !== "Offline" && (
                    <>
                      <Field label="Platform">
                        <select
                          value={values.platform}
                          onChange={(e) => set("platform", e.target.value)}
                          className={input}
                        >
                          <option>Google Meet</option>
                          <option>Zoom</option>
                          <option>Microsoft Teams</option>
                        </select>
                      </Field>
                      <Field label="Meeting link">
                        <input
                          value={values.meetingLink}
                          onChange={(e) => set("meetingLink", e.target.value)}
                          className={input}
                        />
                      </Field>
                    </>
                  )}
                  {values.mode !== "Online" && (
                    <Field label="Classroom / Room">
                      <input
                        value={values.room}
                        onChange={(e) => set("room", e.target.value)}
                        className={input}
                      />
                    </Field>
                  )}
                </div>
              )}
              {section === "Enrollment" && (
                <div className="mt-5 space-y-4">
                  <Field label="Enrollment type">
                    <select
                      value={values.enrollmentType}
                      onChange={(e) => set("enrollmentType", e.target.value)}
                      className={input}
                    >
                      <option>Open</option>
                      <option>Invite</option>
                      <option>Admin</option>
                    </select>
                  </Field>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <b className="text-sm">Current students</b>
                        <p className="text-xs text-slate-500">
                          {values.students}/{values.capacity} enrolled ·{" "}
                          {Math.max(0, values.capacity - values.students)} seats
                          remaining
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!batch?.id || availableSeats === 0 || studentsLoading || enrolling}
                        onClick={openStudents}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Add Students
                      </button>
                    </div>
                    {!batch?.id && <p className="mt-2 text-xs text-slate-500">Save the batch before adding students.</p>}
                    {pickerOpen && <div className="mt-4 space-y-3 border-t pt-4">
                      <p className="text-sm font-semibold">Select students for {values.name}</p>
                      {studentsLoading ? <p role="status" className="text-sm">Loading available students...</p> : <div className="max-h-52 space-y-2 overflow-y-auto">
                        {availableStudents.length === 0 && !enrollmentError && <p className="text-sm text-slate-500">No available students for this batch.</p>}
                        {availableStudents.map(student => {
                          const id = String(student.studentId ?? student.id);
                          return <label key={id} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                            <input type="checkbox" checked={selectedStudents.includes(id)} disabled={enrolling || (!selectedStudents.includes(id) && selectedStudents.length >= availableSeats)} onChange={event => setSelectedStudents(current => event.target.checked ? [...current, id] : current.filter(value => value !== id))} />
                            <span>{student.name}<span className="block text-xs text-slate-500">{student.email}</span></span>
                          </label>;
                        })}
                      </div>}
                      <div className="flex justify-end gap-2">
                        <button type="button" disabled={enrolling} onClick={() => setPickerOpen(false)} className="rounded-lg border px-3 py-2 text-xs">Close selection</button>
                        <button type="button" disabled={enrolling || studentsLoading || !selectedStudents.length} onClick={enrollStudents} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{enrolling ? "Adding students..." : `Add selected (${selectedStudents.length})`}</button>
                      </div>
                    </div>}
                    {enrollmentError && <p role="alert" className="mt-3 text-sm text-red-600">{enrollmentError}</p>}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${values.students / values.capacity >= 0.95 ? "bg-red-500" : values.students / values.capacity >= 0.8 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{
                          width: `${Math.min(100, (values.students / values.capacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

        </form>
      {confirmClose && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/30 p-4">
          <div role="alertdialog" aria-modal="true" className="relative w-full max-w-sm rounded-xl bg-white p-5">
            <button type="button" aria-label="Close" onClick={() => setConfirmClose(false)} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"><X className="h-5 w-5" /></button>
            <h3 className="pr-8 font-semibold">Discard unsaved changes?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your batch configuration will not be saved.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmClose(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Keep editing
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

