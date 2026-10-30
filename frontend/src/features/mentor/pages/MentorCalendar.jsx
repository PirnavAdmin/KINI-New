import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, CheckCircle2, List, Radio, Video } from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";
import { getMentorSessionIdentity } from "../utils/mentorSessionIdentity";
import { batchesForCourse, findById, getBatchMentorId, isModuleCompletedForBatch, modulesForBatch, normalizeMentorBatches, normalizeMentorCourses } from "../utils/mentorScheduleOptions";
import SchedulePage from "../../../pages/schedule/SchedulePage";
import MentorPageHero from "../components/MentorPageHero";
import ScheduleLiveClassDialog from "../components/ScheduleLiveClassDialog";
import useCourseSyllabusModules from "@features/live-classes/hooks/useCourseSyllabusModules";
import { ClassScheduleArt } from "../components/MentorHeroArt";
import MentorLiveClasses from "./MentorLiveClasses";
import MentorRecordedSessions from "./MentorRecordedSessions";
import { getMentorDashboardBatches, getMentorDashboardClasses, getMentorDashboardCourses } from "@shared/services/mentorService";
import { liveClassService } from "@features/live-classes/services/liveClassService";
import { LIVE_CLASS_STATUS_OPTIONS, MEETING_PLATFORM_OPTIONS, toModuleId } from "@features/live-classes/utils/liveClassOptions";
import { liveClassFieldErrors, liveClassSaveErrorMessage, logLiveClassSaveError } from "@features/live-classes/utils/liveClassSaveError";

const tabs = [
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "live", label: "Live", icon: Radio },
  { id: "completed", label: "Completed", icon: CheckCircle2 },
  { id: "recordings", label: "Recordings", icon: Video },
];
// Recording is off for a new class; the mentor turns it on explicitly.
const emptyForm = { course: "", batch: "", moduleId: "", classTitle: "", description: "", mentorId: "", meetingPlatform: "", meetingLink: "", meetingId: "", meetingPassword: "", scheduledDate: "", startTime: "", endTime: "", status: "scheduled", isRecordingEnabled: false };
const rows = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  for (const key of ["items", "records", "results", "data", "courses", "batches"]) { const result = rows(value[key]); if (result.length) return result; }
  return [];
};
const idOf = (item) => item?.id ?? item?.courseId ?? item?.batchId ?? item?.platformId ?? item?.meetingPlatformId ?? item?.value;
const nameOf = (item) => item?.name ?? item?.title ?? item?.courseName ?? item?.batchName ?? item?.label ?? String(idOf(item) ?? "");
const formatTimeForApi = (value) => {
  const parts = String(value || "").split(":");
  return parts.length >= 2 ? `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00` : String(value || "");
};
const getMentorIdForUser = (mentors, user) => {
  const identity = getMentorSessionIdentity(user);
  const knownIds = [identity.mentorId, identity.employeeId, identity.userId].filter(Boolean).map(String);
  const directMatch = mentors.find((item) => [
    item?.mentorId, item?.id, item?.employeeId, item?.userId, item?.user?.id,
  ].filter(Boolean).some((value) => knownIds.includes(String(value))));
  if (directMatch) return idOf(directMatch);

  const email = String(user?.email ?? user?.Email ?? "").trim().toLowerCase();
  const userName = String(user?.fullName ?? user?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`).trim().toLowerCase();
  const profileMatch = mentors.find((item) => {
    const itemEmail = String(item?.email ?? item?.Email ?? item?.user?.email ?? "").trim().toLowerCase();
    const itemName = nameOf(item).trim().toLowerCase();
    return (email && itemEmail === email) || (userName && itemName === userName);
  });
  return profileMatch ? idOf(profileMatch) : undefined;
};
const classRows = (value) => rows(value).map((item) => {
  const dateKey = String(item.dateKey ?? item.classDate ?? item.scheduledDate ?? item.date ?? item.startDateTime ?? "").slice(0, 10);
  const status = String(item.status ?? item.classStatus ?? "Upcoming").toLowerCase().includes("complete") ? "Completed" : "Upcoming";
  return { ...item, id: item.id ?? item.liveClassId ?? item.classId ?? item.scheduleId, dateKey, time: item.time ?? `${item.startTime ?? ""}-${item.endTime ?? ""}`, batch: item.batchName ?? item.batch?.name ?? item.courseName ?? "Assigned batch", topic: item.topicName ?? item.topic ?? item.title ?? item.classTitle ?? item.subject ?? "Class session", students: Number(item.studentCount ?? item.students ?? 0), status, attendance: status === "Completed" ? "Not marked" : "Pending", color: "blue" };
}).filter((item) => item.dateKey && item.id != null);

export default function MentorCalendar() {
  const { user } = useAuth();
  const mentorIdentity = getMentorSessionIdentity(user);
  const mentorLabel = user?.fullName ?? user?.name ?? user?.email ?? "Logged-in mentor";
  const [params, setParams] = useSearchParams();
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  // Platform/status options come from the same shared module the Organization
  // form uses. The backend dropdowns return { id, platformName } / { id,
  // statusName }, which nameOf() rendered — and submitted — as the bare id.
  // Courses and batches come only from the mentor-scoped dashboard endpoints
  // (see mentorScheduleOptions); `status` keeps loading, error and "nothing
  // assigned" apart in the dialog.
  const [catalog, setCatalog] = useState({ status: "loading", courses: [], batches: [], mentors: [], platforms: MEETING_PLATFORM_OPTIONS, statuses: LIVE_CLASS_STATUS_OPTIONS });
  const [scheduledClasses, setScheduledClasses] = useState([]);
  const refreshClasses = async () => {
    const [dashboard, live] = await Promise.allSettled([getMentorDashboardClasses(), liveClassService.list()]);
    const incoming = classRows(live.status === "fulfilled" ? live.value : dashboard.status === "fulfilled" ? dashboard.value : []);
    if (live.status === "fulfilled" || dashboard.status === "fulfilled") setScheduledClasses(incoming);
  };
  useEffect(() => { refreshClasses().catch(() => {}); }, []);
  useEffect(() => {
    if (!params.has("create")) return;
    setSchedulerOpen(true);
    const next = new URLSearchParams(params); next.delete("create"); setParams(next, { replace: true });
  }, [params, setParams]);
  const sessionMentorId = mentorIdentity.mentorId;
  useEffect(() => {
    let active = true;
    // Only a real mentor id is compared with a row's mentorId; a user or
    // employee id is a different key space.
    const mentorIds = sessionMentorId != null ? [String(sessionMentorId)] : [];
    // The organization dropdowns are read for the mentor list only (to resolve
    // the mentor id when the session lacks it), never for courses or batches.
    Promise.allSettled([getMentorDashboardCourses(), getMentorDashboardBatches(), liveClassService.dropdowns()]).then(([course, batch, dropdown]) => {
      if (!active) return;
      const mentors = rows(dropdown.status === "fulfilled" ? dropdown.value?.mentors : []);
      // Batches are the assignment record a class needs; without them nothing
      // can be scheduled, so their failure is an error, not "no batches".
      if (batch.status === "rejected") {
        setCatalog((current) => ({ ...current, status: "error", courses: [], batches: [], mentors }));
        return;
      }
      const batches = normalizeMentorBatches(batch.status === "fulfilled" ? batch.value : [], mentorIds);
      const courses = normalizeMentorCourses(course.status === "fulfilled" ? course.value : [], batches, mentorIds);
      setCatalog((current) => ({ ...current, status: courses.length ? "ready" : "empty", courses, batches, mentors }));
    });
    return () => { active = false; };
  }, [sessionMentorId]);
  const requestedTab = params.get("tab") || "schedule";
  const activeTab = tabs.map((tab) => tab.id).includes(requestedTab) ? requestedTab : "schedule";
  const selectTab = (tab) => { const next = new URLSearchParams(params); next.set("tab", tab); setParams(next, { replace: true }); };
  // Schedule tab: Calendar ⇄ Class List, kept in the URL (?view=list).
  const scheduleView = params.get("view") === "list" ? "list" : "calendar";
  const setScheduleView = (view) => { const next = new URLSearchParams(params); if (view === "list") next.set("view", "list"); else next.delete("view"); setParams(next, { replace: true }); };
  const openScheduler = () => setSchedulerOpen(true);
  const [fieldErrors, setFieldErrors] = useState({});
  // Syllabus modules of the selected course (GET .../courses/{id}/syllabus).
  const courseModules = useCourseSyllabusModules(form.course, schedulerOpen);
  // Completion is per batch: the same module can be done in one batch and open in another.
  const syllabusModules = modulesForBatch(courseModules, form.batch);
  const courseBatches = batchesForCourse(catalog.batches, findById(catalog.courses, form.course));
  const update = (key, value) => {
    setForm((current) => {
      // A module completed in the newly chosen batch cannot stay selected.
      if (key === "batch") return { ...current, batch: value, moduleId: isModuleCompletedForBatch(courseModules, current.moduleId, value) ? "" : current.moduleId };
      if (key !== "course") return { ...current, [key]: value };
      // A new course invalidates its module, and the batch unless it is one of
      // this mentor's batches for the new course.
      const allowed = batchesForCourse(catalog.batches, findById(catalog.courses, value));
      return { ...current, course: value, moduleId: "", batch: findById(allowed, current.batch) ? current.batch : "" };
    });
    setFieldErrors((current) => (current[key] ? { ...current, [key]: "" } : current));
  };
  const closeScheduler = () => { setSchedulerOpen(false); setForm(emptyForm); setFieldErrors({}); };
  const scheduleClass = async (event) => {
    event.preventDefault();
    // Field-level validation; messages show beside each field and no value is reset.
    const errors = {};
    // The ids must be ones this mentor is assigned, not just non-empty.
    if (!form.course) errors.course = "Select a course.";
    else if (!findById(catalog.courses, form.course)) errors.course = "Select one of your assigned courses.";
    if (!form.batch) errors.batch = "Select a batch.";
    else if (!findById(courseBatches, form.batch)) errors.batch = "Select one of your batches for this course.";
    // The backend requires a module (moduleId ≥ 1), so a class can't be
    // scheduled without one.
    if (form.course && syllabusModules.status === "loading") errors.moduleId = "Modules are still loading.";
    else if (form.course && syllabusModules.status === "error") errors.moduleId = "Modules couldn't be loaded. Close and reopen to try again.";
    else if (syllabusModules.allCompleted) errors.moduleId = "All modules completed for this batch.";
    else if (form.course && !syllabusModules.options.length) errors.moduleId = "This course has no syllabus modules. Add one before scheduling.";
    else if (form.course && !form.moduleId) errors.moduleId = "Select a module.";
    else if (form.moduleId) {
      const selectedModule = syllabusModules.options.find((option) => option.value === String(form.moduleId));
      if (!selectedModule) errors.moduleId = "Select a module from this course.";
      else if (selectedModule.completed) errors.moduleId = "This module is completed for this batch. Choose the next module.";
    }
    if (!form.classTitle.trim()) errors.classTitle = "Enter a class title.";
    if (!form.scheduledDate) errors.scheduledDate = "Select a date.";
    if (!form.meetingPlatform) errors.meetingPlatform = "Select a meeting platform.";
    if (!form.startTime) errors.startTime = "Select a start time.";
    if (!form.endTime) errors.endTime = "Select an end time.";
    else if (form.startTime && form.endTime <= form.startTime) errors.endTime = "End time must be after start time.";
    if (!form.meetingLink.trim()) errors.meetingLink = "Enter the meeting URL.";
    else { try { new URL(form.meetingLink); } catch { errors.meetingLink = "Enter a valid meeting URL (https://…)."; } }
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return toast.error("Check the highlighted fields.");
    const identity = mentorIdentity;
    const selectedBatch = findById(courseBatches, form.batch);
    const mentorId = identity.mentorId ?? getBatchMentorId(selectedBatch) ?? getMentorIdForUser(catalog.mentors, user);
    if (!mentorId) return toast.error("Your mentor profile is not available. Please sign in again or contact support.");
    const courseId = Number(form.course);
    const batchId = Number(form.batch);
    const numericMentorId = Number(mentorId);
    const moduleId = toModuleId(form.moduleId);
    if (!Number.isInteger(courseId) || !Number.isInteger(batchId) || !Number.isInteger(numericMentorId)) return toast.error("Please select valid course, batch, and mentor values.");
    if (!moduleId) {
      setFieldErrors({ moduleId: "Select a module." });
      return toast.error("Check the highlighted fields.");
    }
    const payload = {
      classTitle: form.classTitle.trim(),
      description: form.description.trim(),
      courseId,
      batchId,
      moduleId,
      mentorId: numericMentorId,
      meetingPlatform: form.meetingPlatform.trim(),
      meetingLink: form.meetingLink.trim(),
      meetingId: form.meetingId.trim(),
      meetingPassword: form.meetingPassword.trim(),
      scheduledDate: String(form.scheduledDate || "").slice(0, 10),
      startTime: formatTimeForApi(form.startTime),
      endTime: formatTimeForApi(form.endTime),
      status: form.status || "scheduled",
      // The create DTO's field is recordingEnabled (see toLiveClassRequest).
      recordingEnabled: Boolean(form.isRecordingEnabled),
    };
    setSaving(true);
    try {
      if (import.meta.env.DEV) console.log("Live class create payload", payload);
      await liveClassService.create(payload);
      await refreshClasses(); closeScheduler(); toast.success("Class scheduled successfully");
    } catch (error) {
      logLiveClassSaveError(error, "POST /api/v1/live-classes");
      // Only a 400/422 validation response marks fields; course/batch use the form's own keys.
      const { courseId: course, batchId: batch, ...serverFieldErrors } = liveClassFieldErrors(error);
      setFieldErrors((current) => ({ ...current, ...serverFieldErrors, ...(course && { course }), ...(batch && { batch }) }));
      toast.error(liveClassSaveErrorMessage(error));
    } finally { setSaving(false); }
  };
  return <div data-ui="mentor-calendar-page" className="mentor-calendar-page mv17 min-h-full bg-[#f8f1e3] dark:bg-slate-950">
    <div className="mx-auto min-w-0 max-w-[1600px] px-2 pt-0 sm:px-3">
      <MentorPageHero
        className="mph--schedule"
        icon={CalendarDays}
        title="Class Schedule"
        subtitle="Plan sessions, track live classes and access recordings."
        art={<ClassScheduleArt />}
        artWidth="250px"
        script={["Organize", "Teach", { text: "Inspire", accent: true }]}
        aside={
          <nav aria-label="Class sections" className="mph-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button type="button" key={tab.id} onClick={() => selectTab(tab.id)} aria-current={activeTab === tab.id ? "page" : undefined}>
                  <Icon aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        }
      />
    </div>
    <div className="mt-3 min-w-0">
      {activeTab === "schedule" && scheduleView === "calendar" && <SchedulePage embedded scheduledClasses={scheduledClasses} view="calendar" onViewChange={setScheduleView} onScheduleClass={openScheduler} />}
      {activeTab === "schedule" && scheduleView === "list" && <MentorLiveClasses key="schedule-list" embedded initialStatus="all" allowCreate={false} onScheduleClass={openScheduler} viewToggle={<ScheduleViewToggle view={scheduleView} onChange={setScheduleView} />} />}
      {activeTab === "live" && <MentorLiveClasses key="live" embedded initialStatus="live" allowCreate={false} onScheduleClass={openScheduler} />}
      {activeTab === "completed" && <MentorLiveClasses key="completed" embedded initialStatus="completed" allowCreate={false} onScheduleClass={openScheduler} />}{activeTab === "recordings" && <MentorRecordedSessions />}</div>
    {schedulerOpen && <ScheduleLiveClassDialog form={form} update={update} catalog={catalog} batches={courseBatches} modules={syllabusModules} errors={fieldErrors} mentorLabel={mentorLabel} saving={saving} onClose={closeScheduler} onSubmit={scheduleClass} idOf={idOf} nameOf={nameOf} />}
  </div>;
}

function ScheduleViewToggle({ view, onChange }) {
  return (
    <div className="mv17-viewtoggle" role="group" aria-label="Schedule view">
      {[["calendar", CalendarDays, "Calendar"], ["list", List, "Class List"]].map(([value, Icon, label]) => (
        <button key={value} type="button" aria-pressed={view === value} onClick={() => onChange(value)}><Icon aria-hidden="true" />{label}</button>
      ))}
    </div>
  );
}
