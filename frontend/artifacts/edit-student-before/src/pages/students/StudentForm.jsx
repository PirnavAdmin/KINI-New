import { isValidPersonName } from "@shared/utils/personName";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  Info,
  Loader2,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { getApiErrorMessage } from "@shared/services/apiServices";
import ModalHero from "@shared/components/ModalHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import { courseService } from "@shared/services/courseService";
import { batchService } from "@shared/services/batchService";
import { studentsApi } from "@/api/students";
import { getBatchSeats } from "./studentBatchSeats";
import { enrollmentErrorText } from "./enrollmentErrors";

const MAX_COURSES = 10;

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").refine(isValidPersonName, "First name must contain letters and cannot include numbers."),
  lastName: z.string().trim().min(1, "Last name is required.").refine(isValidPersonName, "Last name must contain letters and cannot include numbers."),
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Phone number is required.").regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number starting with 6, 7, 8, or 9."),
  // One student, one or more course enrollments, each with its own batch.
  enrollments: z.array(z.object({
    courseId: z.string().trim().min(1, "Select a course."),
    batchId: z.string().trim().min(1, "Select a batch."),
  })).min(1, "Add at least one course.").max(MAX_COURSES),
}).superRefine((values, context) => {
  const seen = new Set();
  values.enrollments.forEach((row, index) => {
    if (!row.courseId) return;
    if (seen.has(row.courseId)) {
      context.addIssue({ code: "custom", path: ["enrollments", index, "courseId"], message: "This course is already added above." });
    }
    seen.add(row.courseId);
  });
});

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  enrollments: [{ courseId: "", batchId: "" }],
};

const rowsFrom = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.courses)) return value.courses;
  if (Array.isArray(value?.batches)) return value.batches;
  if (Array.isArray(value?.data?.courses)) return value.data.courses;
  if (Array.isArray(value?.data?.batches)) return value.data.batches;
  return [];
};

const fieldClass = (hasError) =>
  `h-[52px] w-full rounded-xl border bg-white pl-11 pr-4 text-[15px] font-medium text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:ring-4 ${
    hasError
      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
      : "border-slate-200 shadow-sm hover:border-slate-300 focus:border-blue-500 focus:ring-blue-100/70"
  }`;

const SECTION_TONE = {
  blue: {
    section: "border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-white",
    badge: "bg-blue-100 text-blue-700",
  },
  violet: {
    section: "border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-white",
    badge: "bg-violet-100 text-violet-700",
  },
  emerald: {
    section: "border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

function FormSection({ tone, number, title, subtitle, children }) {
  const { section, badge } = SECTION_TONE[tone];
  return (
    <section className={`animate-in fade-in-0 slide-in-from-bottom-1 rounded-2xl border p-5 shadow-sm duration-300 ${section}`}>
      <div className="mb-3.5 flex items-center gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold sm:h-11 sm:w-11 sm:text-base ${badge}`}>
          {number}
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h3>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-[13px]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, error, icon: Icon, after, children, className = "" }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        )}
        {children}
      </div>
      {after}
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

const batchCourseIdOf = (batch) => batch.courseId ?? batch.course?.courseId ?? batch.course?.id;
const courseIdOf = (course) => course.courseId ?? course.id;

/**
 * Add / edit a student with one or more course enrollments.
 *
 * Backend contract (Swagger): POST/PUT /api/v1/organization/students take a
 * single courseId + batchId, so the first course is saved with the student and
 * every further course is enrolled with POST /api/StudentBatch
 * {batchId, studentIds:[studentId]}. If some of those fail, the student is
 * NOT created again on retry: only the failed courses are re-sent.
 *
 * onSave(payload, id) should resolve with the saved student (its id is used
 * for the further courses). onEnrolled(message) is called after they succeed.
 */
export default function StudentForm({ open, student, onClose, onSave, onEnrolled }) {
  const [confirmClose, setConfirmClose] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [lookupWarning, setLookupWarning] = useState("");
  // After a partial failure: the student that was already saved, and which
  // further courses were enrolled ("ok") or failed (error text), by row index.
  const [savedStudentId, setSavedStudentId] = useState(null);
  const [rowResults, setRowResults] = useState({});
  const submitErrorRef = useRef(null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY_FORM });
  const { fields, append, remove } = useFieldArray({ control, name: "enrollments" });
  const enrollmentValues = watch("enrollments");

  // Batches of one course, matched by course id. A batch with no course id
  // falls back to the course name; a batch of a different course never matches.
  const batchesForCourse = useMemo(() => {
    const byCourse = new Map();
    courses.forEach((course) => {
      const id = String(courseIdOf(course));
      const name = String(course.courseName ?? course.title ?? course.name ?? "").trim().toLowerCase();
      byCourse.set(id, batches.filter((batch) => {
        const batchCourseId = batchCourseIdOf(batch);
        if (batchCourseId !== undefined && batchCourseId !== null && String(batchCourseId) !== "") return String(batchCourseId) === id;
        const batchCourseName = String(batch.courseName ?? batch.course?.courseName ?? batch.course?.name ?? "").trim().toLowerCase();
        return Boolean(name && batchCourseName === name);
      }));
    });
    return (courseId) => byCourse.get(String(courseId)) ?? [];
  }, [batches, courses]);

  useEffect(() => {
    if (!open) return;
    reset(student ? {
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      email: student.email || "",
      phone: student.phone || student.mobile || "",
      enrollments: [{ courseId: String(student.courseId || ""), batchId: String(student.batchId || "") }],
    } : EMPTY_FORM);
    setSubmitError("");
    setSavedStudentId(null);
    setRowResults({});
    setLookupError("");
    setLookupWarning("");
    setConfirmClose(false);

    let active = true;
    setLookupsLoading(true);
    Promise.allSettled([
      // Load the same complete catalogue used by the Courses page. The API
      // exposes status as a boolean on records and does not accept the string
      // "Active" consistently as a query value.
      courseService.getCourses({ page: 1, pageSize: 1000 }),
      batchService.getOrganizationBatches({ pageSize: 1000 }),
      studentsApi.list(),
    ]).then(async ([courseResult, batchResult, studentResult]) => {
      if (!active) return;
      const liveCourses = courseResult.status === "fulfilled" ? rowsFrom(courseResult.value) : [];
      const liveBatches = batchResult.status === "fulfilled" ? rowsFrom(batchResult.value) : [];
      // Combine primary assignments with additional memberships, just like the list.
      const primaryStudents = studentResult.status === "fulfilled" ? rowsFrom(studentResult.value) : [];
      const rosterResults = await Promise.allSettled(
        liveBatches.map((batch) => batchService.getStudents(batch.batchId ?? batch.id)),
      );
      if (!active) return;
      const batchesWithSeats = liveBatches.map((batch, index) => {
        const result = rosterResults[index];
        if (result.status === "rejected" || studentResult.status === "rejected") return { ...batch, seatsUnavailable: true };
        const seats = getBatchSeats(batch, result.value, primaryStudents);
        return {
          ...batch,
          capacity: seats.capacity,
          configuredCapacity: seats.capacity,
          enrolledStudents: seats.enrolled,
          includesStudent: seats.studentIds.has(String(student?.studentId ?? student?.id)),
        };
      });
      const courseById = new Map();
      liveCourses.forEach((course) => {
        const courseId = course.courseId ?? course.id;
        if (courseId !== undefined && courseId !== null) courseById.set(String(courseId), course);
      });
      liveBatches.forEach((batch) => {
        const courseId = batch.courseId ?? batch.course?.courseId ?? batch.course?.id;
        const courseName = batch.courseName ?? batch.course?.courseName ?? batch.course?.name;
        if (courseId !== undefined && courseId !== null && courseName && !courseById.has(String(courseId))) {
          courseById.set(String(courseId), { courseId, courseName });
        }
      });
      // Only courses that have one of this organization's batches can be
      // assigned (a batch is required), so courses without one are not listed.
      const organizationCourses = [...courseById.values()].filter((course) => {
        const id = String(courseIdOf(course));
        const name = String(course.courseName ?? course.title ?? course.name ?? "").trim().toLowerCase();
        return liveBatches.some((batch) => {
          const batchCourseId = batchCourseIdOf(batch);
          if (batchCourseId !== undefined && batchCourseId !== null && String(batchCourseId) !== "") return String(batchCourseId) === id;
          return Boolean(name && String(batch.courseName ?? batch.course?.courseName ?? batch.course?.name ?? "").trim().toLowerCase() === name);
        });
      });
      setCourses(organizationCourses);
      setBatches(batchesWithSeats);
      if (!organizationCourses.length && courseResult.status === "rejected") {
        setLookupError(getApiErrorMessage(courseResult.reason, "Unable to load organization courses."));
      } else if (!organizationCourses.length) {
        setLookupError(batchResult.status === "rejected"
          ? getApiErrorMessage(batchResult.reason, "Unable to load organization batches.")
          : "No course has a batch yet. Create a batch before adding a student.");
      } else if (courseResult.status === "rejected") {
        setLookupWarning("Courses were loaded from your organization batches.");
      } else if (batchResult.status === "rejected") {
        setLookupWarning(getApiErrorMessage(batchResult.reason, "Unable to load organization batches."));
      } else if (!liveBatches.length) {
        setLookupWarning("No organization batches are available. Create a batch before assigning a student.");
      } else if (batchesWithSeats.some((batch) => batch.seatsUnavailable)) {
        setLookupWarning("Unable to verify seats for some batches. Reopen this form to retry.");
      }
    }).finally(() => {
      if (active) setLookupsLoading(false);
    });
    return () => { active = false; };
  }, [open, reset, student]);

  // The form body scrolls: bring a new submit error into view.
  useEffect(() => {
    if (submitError) submitErrorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [submitError]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        if (confirmClose) setConfirmClose(false);
        else if (isDirty) setConfirmClose(true);
        else onClose();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [confirmClose, isDirty, onClose, open]);

  if (!open) return null;

  const finishClose = () => {
    reset(EMPTY_FORM);
    setSubmitError("");
    setSavedStudentId(null);
    setRowResults({});
    setConfirmClose(false);
    onClose();
  };
  const requestClose = () => (isDirty ? setConfirmClose(true) : finishClose());

  const describeError = (error) => {
    const apiMessage = getApiErrorMessage(error, "Unable to add student. Please check the details and try again.");
    const normalizedMessage = apiMessage.toLowerCase();
    const isDuplicateOrDatabaseConstraint =
      normalizedMessage.includes("already")
      || normalizedMessage.includes("duplicate")
      || normalizedMessage.includes("unique")
      || normalizedMessage.includes("entity changes")
      || normalizedMessage.includes("inner exception");
    return isDuplicateOrDatabaseConstraint
      ? "This email or phone number is already registered. Use a different email and phone number."
      : apiMessage === "Network Error"
        ? "Unable to connect to the student service. Your entered details are preserved; check the backend connection and try again."
        : apiMessage;
  };

  const submit = async (values) => {
    setSubmitError("");
    // Validate the exact filtered/enriched rows rendered in the dropdowns.
    // Looking them up again in the raw batch list could select a duplicate row
    // with stale capacity data and incorrectly report a full batch.
    const rows = values.enrollments.map((row) => ({
      ...row,
      batch: batchesForCourse(row.courseId).find((batch) => String(batch.batchId ?? batch.id) === String(row.batchId)),
    }));
    for (const [index, row] of rows.entries()) {
      if (rowResults[index] === "ok") continue;
      const seats = getBatchSeats(row.batch);
      if (row.batch?.seatsUnavailable) {
        setSubmitError(`Course ${index + 1}: unable to verify seats for this batch. Reopen this form to retry.`);
        return;
      }
      if (!row.batch || (seats.isFull && !row.batch.includesStudent)) {
        setSubmitError(`Course ${index + 1}: this batch is full. Select another batch with available seats.`);
        return;
      }
    }

    // 1. The student with the first course (skipped on a retry: already saved).
    let studentId = savedStudentId ?? student?.id ?? null;
    if (savedStudentId == null) {
      const [first] = rows;
      const mentorId = first.batch?.mentorId
        ?? first.batch?.tutorId
        ?? first.batch?.mentor?.mentorId
        ?? first.batch?.mentor?.employeeId
        ?? first.batch?.mentor?.id;
      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        courseId: Number(first.courseId),
        batchId: Number(first.batchId),
        ...(mentorId != null && String(mentorId).trim() ? { mentorId: Number(mentorId) } : {}),
      };
      let saved;
      try {
        saved = await onSave(payload, student?.id);
      } catch (error) {
        setSubmitError(describeError(error));
        return;
      }
      studentId = saved?.id ?? saved?.studentId ?? student?.id ?? null;
      if (studentId == null && rows.length > 1) {
        // The caller didn't return the record: find the new student by email.
        const roster = await studentsApi.list().then((response) => response.data).catch(() => []);
        const matches = roster.filter((item) => String(item.email ?? "").trim().toLowerCase() === payload.email.toLowerCase());
        studentId = matches.length === 1 ? matches[0].id : null;
      }
      if (rows.length === 1) {
        finishClose();
        return;
      }
      if (studentId == null) {
        setSubmitError(`The student was saved with ${rows[0].batch?.courseName ?? "the first course"}, but their student ID couldn't be read, so the other courses were not added. Add them from the student's edit form.`);
        setSavedStudentId("unknown");
        return;
      }
      setSavedStudentId(studentId);
      setRowResults({ 0: "ok" });
    }
    if (studentId === "unknown") return;

    // 2. Every further course. GET /api/StudentBatch/student/{id}/enrollments
    //    is the source of truth: a course counts as enrolled only when it is
    //    listed there. It is read before posting (so a retry never re-sends an
    //    enrollment that already exists) and again afterwards to confirm.
    const results = { ...rowResults, 0: "ok" };
    const sameId = (a, b) => a != null && b != null && String(a) === String(b);
    const readEnrollments = () => studentsApi.getEnrollments(studentId).then((response) => response.data);
    const before = await readEnrollments().catch(() => null);
    const posted = [];
    for (const [index, row] of rows.entries()) {
      if (index === 0 || results[index] === "ok") continue;
      const existing = before?.find((item) => sameId(item.courseId, row.courseId));
      if (existing && sameId(existing.batchId, row.batchId)) {
        results[index] = "ok";
        continue;
      }
      if (existing) {
        results[index] = `Already enrolled in this course (${existing.batchName ?? `batch #${existing.batchId}`}).`;
        continue;
      }
      try {
        await studentsApi.enrollInBatch(studentId, row.batchId);
        posted.push(index);
      } catch (error) {
        results[index] = enrollmentErrorText(error);
      }
    }
    if (posted.length) {
      const after = await readEnrollments().catch(() => null);
      posted.forEach((index) => {
        const row = rows[index];
        const saved = after?.some((item) => sameId(item.courseId, row.courseId) && sameId(item.batchId, row.batchId));
        results[index] = saved
          ? "ok"
          : after
            ? "The backend accepted the request but didn't save this enrollment."
            : "Couldn't confirm this enrollment. Retry checks it before sending it again.";
      });
    }
    setRowResults({ ...results });
    const failed = rows.filter((_, index) => results[index] !== "ok").length;
    if (failed) {
      const added = rows.length - failed;
      setSubmitError(`Student saved. ${added} of ${rows.length} courses enrolled; ${failed} ${failed === 1 ? "enrollment" : "enrollments"} failed. Retry sends only the failed ones.`);
      return;
    }
    await onEnrolled?.(`Student saved with ${rows.length} courses.`);
    finishClose();
  };

  const retrying = savedStudentId != null && savedStudentId !== "unknown";
  const canAddCourse = fields.length < MAX_COURSES && !lookupsLoading && !lookupError;

  return createPortal((
    <div className="fixed inset-0 z-[9999] isolate flex items-center justify-center p-3 sm:p-5">
      <button aria-label="Close student form" onClick={requestClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-form-title"
        className="student-form-modal animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 relative flex max-h-[90vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_40px_100px_-20px_rgba(15,23,42,0.55)] duration-200"
      >
        <ModalHero
          titleId="student-form-title"
          icon={GraduationCap}
          eyebrow="Student onboarding"
          title={student ? "Edit" : "Add New"}
          accent="Student"
          subtitle="Enter student details and assign their courses and batches."
          art={ORG_BANNERS.addStudent.src}
          onClose={requestClose}
        />

        <form onSubmit={handleSubmit(submit)} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-5 sm:p-6">
            <div className="space-y-3.5">
            <FormSection tone="blue" number={1} title="Student Information" subtitle="Basic identity details of the student">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Field id="student-first-name" label="First Name" icon={UserRound} error={errors.firstName?.message}>
                  <input id="student-first-name" autoComplete="given-name" {...register("firstName")} className={fieldClass(errors.firstName)} placeholder="Srinivas" />
                </Field>
                <Field id="student-last-name" label="Last Name" icon={UserRound} error={errors.lastName?.message}>
                  <input id="student-last-name" autoComplete="family-name" {...register("lastName")} className={fieldClass(errors.lastName)} placeholder="Sree" />
                </Field>
              </div>
            </FormSection>

            <FormSection tone="violet" number={2} title="Contact Information" subtitle="Communication and login contact details">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <Field id="student-email" label="Email" icon={Mail} error={errors.email?.message}>
                  <input id="student-email" type="email" autoComplete="email" {...register("email")} className={fieldClass(errors.email)} placeholder="student@example.com" />
                </Field>
                <Field id="student-phone" label="Phone" icon={Phone} error={errors.phone?.message}>
                  <input id="student-phone" inputMode="numeric" autoComplete="tel" maxLength={10} {...register("phone", { onChange: (event) => { event.target.value = event.target.value.replace(/\D/g, ""); } })} className={fieldClass(errors.phone)} placeholder="8125336729" />
                </Field>
              </div>
            </FormSection>

            <FormSection tone="emerald" number={3} title="Academic Assignment" subtitle="Assign one or more courses and select a batch for each course">
              <div className="space-y-3">
                {fields.map((field, index) => {
                  const row = enrollmentValues?.[index] ?? {};
                  const rowBatches = row.courseId ? batchesForCourse(row.courseId) : [];
                  const rowErrors = errors.enrollments?.[index];
                  const result = rowResults[index];
                  // A course already saved stays fixed so a retry can't change it.
                  const locked = result === "ok";
                  return (
                    <div key={field.id} className="rounded-xl border border-emerald-100 bg-white/80 p-3 sm:p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Course {index + 1}</p>
                        <div className="flex items-center gap-2">
                          {locked && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Saved</span>}
                          {result && result !== "ok" && <span className="text-xs font-semibold text-red-600">Not added: {result}</span>}
                          {fields.length > 1 && !locked && (
                            <button
                              type="button"
                              onClick={() => {
                                remove(index);
                                setRowResults((current) => Object.fromEntries(Object.entries(current)
                                  .filter(([key]) => Number(key) !== index)
                                  .map(([key, value]) => [Number(key) > index ? Number(key) - 1 : Number(key), value])));
                              }}
                              aria-label={`Remove course ${index + 1}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />Remove
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                        <Field id={`student-course-${index}`} label="Course" icon={BookOpen} error={rowErrors?.courseId?.message}>
                          <select
                            id={`student-course-${index}`}
                            {...register(`enrollments.${index}.courseId`, { onChange: () => setValue(`enrollments.${index}.batchId`, "", { shouldDirty: true }) })}
                            disabled={lookupsLoading || locked}
                            className={`${fieldClass(rowErrors?.courseId)} appearance-none pr-10`}
                          >
                            <option value="">{lookupsLoading ? "Loading courses..." : lookupError ? "Courses unavailable" : "Select course"}</option>
                            {courses.map((course) => {
                              const id = courseIdOf(course);
                              const label = course.courseName || course.title || course.name || `Course #${id}`;
                              const takenElsewhere = enrollmentValues?.some((other, otherIndex) => otherIndex !== index && String(other?.courseId) === String(id));
                              return <option key={id} value={id} disabled={takenElsewhere}>{label}{takenElsewhere ? " (already added)" : ""}</option>;
                            })}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        </Field>
                        <Field
                          id={`student-batch-${index}`}
                          label="Batch"
                          icon={Users}
                          error={rowErrors?.batchId?.message}
                          after={row.courseId && !lookupsLoading && rowBatches.length === 0 && (
                            <p className="mt-2 text-xs font-medium text-amber-700">
                              No batch is assigned to this course. Select a course with a batch or create a batch first.
                            </p>
                          )}
                        >
                          <select id={`student-batch-${index}`} {...register(`enrollments.${index}.batchId`)} disabled={lookupsLoading || !row.courseId || locked} className={`${fieldClass(rowErrors?.batchId)} appearance-none pr-10`}>
                            <option value="">{!row.courseId ? "Select a course first" : "Select batch"}</option>
                            {rowBatches.map((batch) => {
                              const id = batch.batchId ?? batch.id;
                              const label = batch.batchName || batch.name || `Batch #${id}`;
                              const seats = getBatchSeats(batch);
                              const seatLabel = batch.seatsUnavailable ? "Seats unavailable" : seats.capacity > 0
                                ? `${seats.enrolled}/${seats.capacity} students — ${seats.isFull ? "Full" : `${seats.available} seats available`}`
                                : "Capacity not set";
                              return <option key={id} value={id} disabled={batch.seatsUnavailable || (seats.isFull && !batch.includesStudent)}>{label} — {seatLabel}</option>;
                            })}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        </Field>
                      </div>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => append({ courseId: "", batchId: "" }, { shouldFocus: true })}
                  disabled={!canAddCourse}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-white/70 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {fields.length >= MAX_COURSES ? `Up to ${MAX_COURSES} courses` : "Add another course"}
                </button>
                {fields.length > 1 && (
                  <p className="text-xs text-slate-500">
                    One student account is created with the first course; each further course is added to the same student in its own batch.
                  </p>
                )}
              </div>
            </FormSection>

            {submitError && (
              <div ref={submitErrorRef} role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {submitError}
              </div>
            )}
            {lookupWarning && !submitError && !lookupError && (
              <div role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                {lookupWarning}
              </div>
            )}
            </div>
          </div>

          <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="inline-flex items-center gap-2 self-start rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-900 sm:text-sm">
              <Info className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
              All fields marked with <span className="text-red-500">*</span> are required.
            </div>
            <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={requestClose} className="h-12 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200">Cancel</button>
            <button type="submit" disabled={isSubmitting || lookupsLoading || Boolean(lookupError)} className="inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-600 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {isSubmitting ? (student ? "Saving..." : "Adding...") : retrying ? "Retry failed courses" : (student ? "Save Changes" : "Add Student")}
            </button>
            </div>
          </footer>
        </form>
      </aside>

      {confirmClose && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/30 p-4">
          <div role="alertdialog" aria-modal="true" className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <button type="button" aria-label="Close" onClick={() => setConfirmClose(false)} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500"><X className="h-5 w-5" /></button>
            <h3 className="mt-3 font-semibold text-slate-900">Discard unsaved changes?</h3>
            <p className="mt-1 text-sm text-slate-500">Your changes will not be saved.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmClose(false)} className="rounded-lg border px-3 py-2 text-sm font-semibold">Keep editing</button>
              <button type="button" onClick={finishClose} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white">Discard changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  ), document.body);
}
