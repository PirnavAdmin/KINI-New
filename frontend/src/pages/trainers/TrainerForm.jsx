import { createPortal } from "react-dom";
import { personNameError } from "@shared/utils/personName";
import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ImagePlus,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { getApiErrorMessage } from "@/shared/services/apiServices";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { useProfilePhoto } from "@shared/hooks/useProfilePhoto";
import { embeddedPhotoUrl, mentorPhotoLookup } from "@shared/services/profilePhotoService";

const sections = [
  "Personal",
  "Contact",
  "Employment",
  "Skills",
  "Courses",
  "Access",
];
const permissions = [
  "Manage attendance",
  "Grade assignments",
  "Publish assessments",
  "Message students",
  "Upload resources",
  "View reports",
];
const empty = {
  name: "",
  email: "",
  mobile: "",
  personalEmail: "",
  employeeId: "",
  department: "Technology",
  designation: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  type: "Full-time",
  skills: [],
  experience: "",
  linkedin: "",
  portfolio: "",
  courses: [],
  courseIds: [],
  role: "Mentor",
  active: true,
  permissions,
  profilePhoto: "",
};
const input =
  "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({ label, required, error, children }) {
  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-500"> *</span>}
      {children}
      {error && (
        <span className="mt-1 block text-[11px] font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function TrainerForm(props) {
  if (!props.open) return null;
  return createPortal(<TrainerFormContent key={props.trainer?.id || "new"} {...props} />, document.body);
}

function TrainerFormContent({
  trainer,
  onClose,
  onSave,
  courseOptions = [],
  initialSection = "Personal",
}) {
  const [section, setSection] = useState(initialSection);
  const initialValues = trainer
    ? { ...empty, ...trainer, type: trainer.employmentType || trainer.type || "", permissions: trainer.permissions || permissions }
    : { ...empty, employeeId: "EMP-2026-0009" };
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [skill, setSkill] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const set = (key, value) =>
    setValues((current) => ({ ...current, [key]: value }));
  const dirty = JSON.stringify(values) !== JSON.stringify(initialValues);
  const requestClose = () => (dirty ? setConfirmClose(true) : onClose());
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (confirmClose) setConfirmClose(false);
        else if (dirty) setConfirmClose(true);
        else onClose();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmClose, dirty, onClose]);
  const validate = () => {
    const next = {};
    const nameParts = values.name.trim().split(/\s+/).filter(Boolean);
    if (personNameError(values.name, "Full name")) next.name = personNameError(values.name, "Full name");
    else if (nameParts.length < 2) next.name = "Enter both first name and last name.";
    if ((!trainer || values.email) && !/^\S+@\S+\.\S+$/.test(values.email))
      next.email = "Enter a valid official email.";
    if ((!trainer || values.mobile) && !/^[6-9]\d{9}$/.test(values.mobile))
      next.mobile = "Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
    if (!trainer?.employeeRecordId && (!Array.isArray(values.courseIds) || values.courseIds.length === 0))
      next.courseIds = "Select at least one course for this mentor.";
    setErrors(next);
    if (next.name) setSection("Personal");
    else if (next.email || next.mobile) setSection("Contact");
    else if (next.courseIds) setSection("Courses");
    return Object.keys(next).length === 0;
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaveError("");
    if (!validate()) return;
    setSaving(true);
    try {
      const changedFields = Object.keys(values).filter((key) => JSON.stringify(values[key]) !== JSON.stringify(initialValues[key]));
      await onSave({ ...values, name: values.name.trim(), changedFields }, trainer?.id);
      onClose();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Unable to save mentor. Please check the entered details."));
    } finally {
      setSaving(false);
    }
  };
  const toggleArray = (key, item) =>
    set(
      key,
      values[key].includes(item)
        ? values[key].filter((value) => value !== item)
        : [...values[key], item],
    );
  const addSkill = () => {
    const next = skill.trim();
    if (next && !values.skills.includes(next))
      set("skills", [...values.skills, next]);
    setSkill("");
  };
  // The photo belongs to the mentor's own account: the mentor uploads it from
  // My Profile & Settings. The only upload/remove endpoints act on the signed-in
  // user, so from here it is shown read-only via the mentor's employee/mentor id
  // (calling them here would read or overwrite the admin's own photo).
  const photoLookup = mentorPhotoLookup(trainer || {});
  const { photoUrl: fetchedMentorPhoto } = useProfilePhoto(photoLookup.profileType, photoLookup.profileId);
  const mentorPhoto = fetchedMentorPhoto || embeddedPhotoUrl(trainer || {});

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-6">
      <button
        aria-label="Close mentor form"
        onClick={requestClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={trainer ? "Edit mentor" : "Add mentor"}
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col overflow-hidden rounded-t-2xl border border-white/70 bg-slate-50 shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)] sm:max-h-[calc(100dvh-3rem)] sm:max-w-[860px] sm:rounded-2xl"
      >
        <div className="h-1 shrink-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {trainer ? "Edit mentor" : "Add mentor"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete the employment and teaching profile.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={requestClose}
            className="ml-4 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <nav aria-label="Mentor form sections" className="flex shrink-0 overflow-x-auto border-b border-slate-200 bg-white px-3 sm:justify-between sm:px-6">
          {sections.map((item, index) => (
            <button
              type="button"
              key={item}
              onClick={() => setSection(item)}
              aria-current={section === item ? "step" : undefined}
              className={`group flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition sm:px-2 ${section === item ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] transition ${section === item ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"}`}>
                {index + 1}
              </span>
              {item}
            </button>
          ))}
        </nav>
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] sm:p-6">
              <div className="mb-5">
                <h3 className="font-semibold text-slate-900">{section}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {section === "Access"
                    ? "Control account access and permissions."
                    : `Enter the mentor's ${section.toLowerCase()} details.`}
                </p>
              </div>
              {section === "Personal" && (
                <div className="grid grid-cols-1 gap-4 border-b border-slate-100 pb-8">
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-blue-50 text-blue-500">
                      <AvatarPhoto src={mentorPhoto} alt="Mentor photo" fallback={<ImagePlus className="h-6 w-6" />} />
                    </span>
                    <p className="text-xs text-slate-500">The mentor sets their photo from My Profile &amp; Settings.</p>
                  </div>
                  <Field label="Full name" required error={errors.name}>
                    <input
                      value={values.name ?? ""}
                      onChange={(e) => set("name", e.target.value)}
                      className={input}
                      placeholder="e.g. Rahul Sharma"
                    />
                  </Field>
                </div>
              )}
              {section === "Contact" && (
                <div className="mt-8 grid grid-cols-1 gap-4 border-b border-slate-100 pb-8">
                  <Field label="Official email" required error={errors.email}>
                    <input
                      type="email"
                      value={values.email ?? ""}
                      onChange={(e) => set("email", e.target.value)}
                      className={input}
                      placeholder="name@kini.edu"
                    />
                  </Field>
                  <Field label="Mobile" required error={errors.mobile}>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      aria-invalid={Boolean(errors.mobile)}
                      value={values.mobile ?? ""}
                      onChange={(e) => {
                        const mobile = e.target.value.replace(/\D/g, "").slice(0, 10);
                        set("mobile", mobile);
                        setErrors((current) => ({
                          ...current,
                          mobile: mobile && !/^[6-9]\d{0,9}$/.test(mobile)
                            ? "Indian mobile numbers must start with 6, 7, 8, or 9."
                            : "",
                        }));
                      }}
                      onBlur={() => setErrors((current) => ({
                        ...current,
                        mobile: values.mobile && !/^[6-9]\d{9}$/.test(values.mobile)
                          ? "Enter a 10-digit Indian mobile number starting with 6, 7, 8, or 9."
                          : "",
                      }))}
                      className={input}
                      placeholder="10-digit Indian mobile number"
                    />
                  </Field>
                  <Field label="Personal email">
                    <input
                      type="email"
                      value={values.personalEmail || ""}
                      onChange={(e) => set("personalEmail", e.target.value)}
                      className={input}
                    />
                  </Field>
                </div>
              )}
              {section === "Employment" && (
                <div className="mt-8 grid grid-cols-1 gap-4 border-b border-slate-100 pb-8">
                  <Field label="Employee ID">
                    <input
                      readOnly
                      value={values.employeeId ?? ""}
                      className={`${input} bg-slate-50 font-mono text-slate-500`}
                    />
                  </Field>
                  <Field label="Department">
                    <select
                      value={values.department ?? ""}
                      onChange={(e) => set("department", e.target.value)}
                      className={input}
                    >
                      {[
                        "Technology",
                        "Data Science",
                        "Design",
                        "Business",
                        "Operations",
                      ].map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Designation">
                    <input
                      value={values.designation ?? ""}
                      onChange={(e) => set("designation", e.target.value)}
                      className={input}
                      placeholder="Senior Mentor"
                    />
                  </Field>
                  <Field label="Joining date">
                    <input
                      type="date"
                      value={values.joiningDate ?? ""}
                      onChange={(e) => set("joiningDate", e.target.value)}
                      className={input}
                    />
                  </Field>
                  <Field label="Employment type">
                    <select
                      value={values.type ?? ""}
                      onChange={(e) => set("type", e.target.value)}
                      className={input}
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  </Field>
                </div>
              )}
              {section === "Skills" && (
                <div className="space-y-4">
                  <Field label="Skills">
                    <div className="mt-1.5 flex rounded-lg border border-slate-200 p-1 focus-within:border-blue-500">
                      <input
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Type a skill and press Enter"
                        className="h-8 min-w-0 flex-1 px-2 text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={addSkill}
                        className="rounded-md bg-slate-100 px-2"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </Field>
                  <div className="flex flex-wrap gap-2">
                    {values.skills.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleArray("skills", item)}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                      >
                        {item}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Experience (years)">
                      <input
                        type="number"
                        min="0"
                        value={values.experience ?? ""}
                        onChange={(e) => set("experience", e.target.value)}
                        className={input}
                      />
                    </Field>
                    <Field label="LinkedIn">
                      <input
                        value={values.linkedin || ""}
                        onChange={(e) => set("linkedin", e.target.value)}
                        className={input}
                        placeholder="linkedin.com/in/..."
                      />
                    </Field>
                    <Field label="Portfolio">
                      <input
                        value={values.portfolio || ""}
                        onChange={(e) => set("portfolio", e.target.value)}
                        className={input}
                        placeholder="https://..."
                      />
                    </Field>
                  </div>
                </div>
              )}
              {section === "Courses" && (
                <div>
                  <p className="mb-3 text-xs text-slate-500">
                    {trainer?.employeeRecordId
                      ? "Use Assign course from the mentor list to manage course and batch assignments."
                      : "Select the courses this mentor can deliver. After saving, use Assign to connect the course, module, subject and batch."}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {courseOptions.map((item) => {
                      const courseId = Number(item.courseId ?? item.id);
                      const courseName = item.courseName ?? item.title ?? item.name ?? `Course ${courseId}`;
                      const selected = values.courseIds.map(Number).includes(courseId);
                      return (
                      <label
                        key={courseId}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${selected ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200"}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          disabled={Boolean(trainer?.employeeRecordId)}
                          onChange={() => setValues((current) => ({
                            ...current,
                            courseIds: selected
                              ? current.courseIds.map(Number).filter((id) => id !== courseId)
                              : [...current.courseIds.map(Number), courseId],
                            courses: selected
                              ? current.courses.filter((name) => name !== courseName)
                              : [...current.courses, courseName],
                          }))}
                          className="accent-blue-600"
                        />
                        <span>{courseName} <span className="text-xs text-slate-400">(ID: {courseId})</span></span>
                      </label>
                    )})}
                  </div>
                  {!courseOptions.length && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">No organization courses are available. Create a course before adding a mentor.</p>}
                  {errors.courseIds && <p className="mt-2 text-xs font-medium text-red-600">{errors.courseIds}</p>}
                </div>
              )}
              {section === "Access" && (
                <div className="space-y-4">
                  <Field label="System role">
                    <select
                      value={values.role ?? ""}
                      onChange={(e) => set("role", e.target.value)}
                      className={input}
                    >
                      <option>Mentor</option>
                      <option>Senior Mentor</option>
                      <option>Academic Lead</option>
                      <option>Employee</option>
                    </select>
                  </Field>
                  <label className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                    <span>
                      <b className="block text-sm">Active system access</b>
                      <span className="text-xs text-slate-500">
                        Allow this employee to sign in.
                      </span>
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={values.active}
                      onClick={() => set("active", !values.active)}
                      className={`relative h-6 w-11 rounded-full transition ${values.active ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${values.active ? "left-6" : "left-1"}`}
                      />
                    </button>
                  </label>
                  <div className="rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPermissionsOpen(!permissionsOpen)}
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        Permission controls
                      </span>
                      {permissionsOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {permissionsOpen && (
                      <div className="grid grid-cols-1 gap-3 border-t border-slate-200 p-4">
                        {permissions.map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <input
                              type="checkbox"
                              checked={values.permissions.includes(item)}
                              onChange={() => toggleArray("permissions", item)}
                              className="accent-blue-600"
                            />
                            {item}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3.5 sm:px-7">
            <div>
              <span className="text-xs text-slate-400">
                Section {sections.indexOf(section) + 1} of {sections.length}
              </span>
              {saveError && <p role="alert" className="mt-1 max-w-sm text-xs font-medium text-red-600">{saveError}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestClose}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? "Saving..." : "Save mentor"}
              </button>
            </div>
          </footer>
        </form>
      </aside>
      {confirmClose && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/30 p-4">
          <div role="alertdialog" aria-modal="true" aria-label="Discard unsaved changes" className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
            <button type="button" aria-label="Close discard confirmation" onClick={() => setConfirmClose(false)} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"><X className="h-5 w-5" /></button>
            <h3 className="pr-8 font-semibold">Discard unsaved changes?</h3>
            <p className="mt-2 text-sm text-slate-500">
              Your changes to this mentor will be lost.
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
    </div>
  );
}
