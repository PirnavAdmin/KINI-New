import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  CircleArrowRight,
  GraduationCap,
  Trophy,
  CalendarX,
  CircleCheck,
  Clock3,
  MessageCircle,
  RefreshCw,
  UserRoundCheck,
  Users,
} from "lucide-react";
import StudentPageBanner from "@features/student/components/StudentPageBanner";
import CourseLogo from "@features/student/components/CourseLogo";
import { STUDENT_BANNERS } from "@features/student/constants/studentBanners";
import { batchService } from "@shared/services/batchService";
import { useStudentEnrollments } from "@features/student/hooks/useStudentEnrollments";
import { batchEnrollments } from "@features/student/utils/studentEnrollments";
import { ROUTES } from "@shared/constants/routeConstants";

const positiveId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const titleCase = (value) => String(value || "")
  .trim()
  .replace(/\b\w/g, (character) => character.toUpperCase());

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

const initials = (name) => titleCase(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "M";

const numericValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const formatBatchDuration = (batch = {}) => {
  const supplied = batch.duration ?? batch.durationValue;
  const suppliedUnit = batch.durationUnit ?? batch.durationType ?? batch.unit;
  if (supplied !== undefined && supplied !== null && String(supplied).trim() !== "") {
    const value = String(supplied).trim();
    if (/\b(years?|months?|weeks?|days?)\b/i.test(value)) return value;
    if (suppliedUnit) return `${value} ${suppliedUnit}`;
  }
  const start = new Date(batch.startDate);
  const end = new Date(batch.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return "";
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  const adjustedMonths = months - (end.getDate() < start.getDate() ? 1 : 0);
  return adjustedMonths > 0 ? `${adjustedMonths} Months` : "";
};

const getMentorDetails = (source = {}) => {
  const mentor = source?.mentor && typeof source.mentor === "object" ? source.mentor : {};
  const name = source?.mentorName ?? source?.tutorName ?? mentor?.mentorName ?? mentor?.name ?? mentor?.fullName ?? [mentor?.firstName, mentor?.lastName].filter(Boolean).join(" ");
  return {
    id: positiveId(source?.mentorId ?? source?.tutorId ?? mentor?.mentorId ?? mentor?.tutorId ?? mentor?.id),
    name: titleCase(name),
    email: String(source?.mentorEmail ?? source?.tutorEmail ?? mentor?.email ?? "").trim(),
    phone: String(source?.mentorPhone ?? source?.tutorPhone ?? mentor?.phone ?? mentor?.mobile ?? "").trim(),
    designation: titleCase(source?.mentorDesignation ?? source?.tutorDesignation ?? mentor?.designation ?? mentor?.role ?? "Mentor"),
    bio: String(source?.mentorBio ?? mentor?.bio ?? mentor?.about ?? "").trim(),
  };
};

const errorMessage = (error) => {
  const status = error?.response?.status;
  if (status === 400) return "The batch request was invalid. Please try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to access this batch.";
  if (status === 404) return "Your assigned batch could not be found.";
  return "Unable to load your batch information.";
};

const BATCH_FEATURES = [
  { Icon: CalendarCheck, title: "Attend", text: "Live Classes", tone: "blue" },
  { Icon: Users, title: "Learn", text: "with Peers", tone: "orange" },
  { Icon: BarChart3, title: "Track", text: "Your Progress", tone: "violet" },
  { Icon: Trophy, title: "Achieve", text: "Your Goals", tone: "amber" },
];

const BatchSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-36 rounded-2xl bg-slate-200" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 rounded-2xl bg-slate-200" />)}</div>
    <div className="grid gap-4 lg:grid-cols-3"><div className="h-72 rounded-2xl bg-slate-200 lg:col-span-2" /><div className="h-72 rounded-2xl bg-slate-200" /></div>
  </div>
);

const filled = (object) => Object.fromEntries(Object.entries(object ?? {}).filter(([, value]) => (
  value !== null && value !== undefined && String(value).trim() !== ""
)));

// One enrollment entry (see studentEnrollments) in the shape the batch view reads.
const enrollmentBatch = (entry) => filled({
  batchId: entry.batchId,
  batchName: entry.batchName,
  courseId: entry.courseId,
  courseName: entry.courseName,
  courseDescription: entry.courseDescription,
  batchType: entry.batchType,
  status: entry.batchStatus,
  startDate: entry.startDate,
  endDate: entry.endDate,
  capacity: entry.capacity,
  enrolledStudents: entry.enrolledStudents,
  liveClasses: entry.liveClasses,
  recordedClasses: entry.recordedClasses,
  description: entry.batchDescription,
  mentorId: entry.mentorId,
  mentorName: entry.mentorName,
  mentorEmail: entry.mentorEmail,
  mentorPhone: entry.mentorPhone,
  mentorDesignation: entry.mentorDesignation,
});

// Batch-route details fill in what the enrollment lacks; the enrollment keeps
// its own course and batch ids so one batch never takes another's identity.
const mergeBatch = (base, extra) => ({ ...base, ...filled(extra), ...filled({ batchId: base.batchId, courseId: base.courseId }) });

const toBatchDetails = (batch) => {
  const capacity = numericValue(batch.capacity ?? batch.maxStudents);
  const enrolled = numericValue(batch.enrolledStudents ?? batch.studentCount ?? batch.studentsCount);
  return {
    name: titleCase(batch.batchName || batch.name),
    course: titleCase(batch.courseName || batch.course?.courseName || batch.course?.name),
    type: titleCase(batch.batchType || batch.mode),
    status: titleCase(batch.status),
    mentor: getMentorDetails(batch),
    courseId: positiveId(batch.courseId ?? batch.course?.courseId ?? batch.course?.id),
    start: formatDate(batch.startDate),
    end: formatDate(batch.endDate),
    duration: formatBatchDuration(batch),
    capacity,
    enrolled,
    capacityPercent: capacity > 0 && enrolled !== null ? Math.min(100, Math.max(0, (enrolled / capacity) * 100)) : 0,
    live: numericValue(batch.liveClasses) ?? 0,
    recorded: numericValue(batch.recordedClasses) ?? 0,
    description: String(batch.description || "").trim(),
    courseDescription: String(batch.courseDescription || "").trim(),
  };
};

const statusTone = (status) => {
  const value = String(status || "").toLowerCase();
  if (["active", "ongoing", "in progress", "running"].includes(value)) return "success";
  if (["completed", "closed"].includes(value)) return "navy";
  if (["upcoming", "scheduled", "pending"].includes(value)) return "orange";
  if (["inactive", "cancelled", "canceled"].includes(value)) return "danger";
  return "neutral";
};

const batchPhase = (status) => {
  const tone = statusTone(status);
  if (tone === "navy") return "Batch Completed";
  if (tone === "orange") return "Batch Upcoming";
  if (tone === "danger") return "Batch Inactive";
  return "Batch Ongoing";
};

function BatchView({ details }) {
  const navigate = useNavigate();

  const openMentorChat = () => {
    if (!details?.mentor?.name) return;
    // StudentMentorChat resolves the same real assigned mentor on its own
    // (useAssignedMentor) and starts/opens the conversation via the real
    // Chat API — ?mentorId= just lets it jump straight there instead of
    // landing on an empty conversation list.
    navigate(details.mentor.id != null ? `${ROUTES.STUDENT.MENTOR_CHAT}?mentorId=${details.mentor.id}` : ROUTES.STUDENT.MENTOR_CHAT);
  };

  const infoTiles = [
    { key: "name", label: "Batch Name", value: details.name, Icon: Users, tone: "blue" },
    { key: "course", label: "Course", value: details.course, Icon: BookOpen, tone: "orange" },
    { key: "start", label: "Start Date", value: details.start, Icon: CalendarCheck, tone: "green" },
    { key: "end", label: "End Date", value: details.end, Icon: CalendarX, tone: "red" },
    { key: "enrolled", label: "Enrolled", value: details.enrolled !== null ? `${details.enrolled} Students` : "", Icon: Users, tone: "purple" },
    { key: "status", label: "Status", value: details.status, Icon: CircleCheck, tone: "green", pill: true },
  ];

  const hasCapacity = details.capacity !== null && details.enrolled !== null;

  return (
    <div className="ksl-batch-stack" aria-label={details.name || "Assigned batch"}>
      <section className="ksl-card ksl-batch-hero">
        <span className="ksl-tile-icon ksl-tile-icon--orange ksl-tile-icon--xl"><Users /></span>
        <div className="ksl-batch-hero__copy">
          <div className="ksx-batch-label">
            <p className="ksl-eyebrow">Assigned batch</p>
            <span className={`ksl-pill ksl-pill--sm ksl-pill--${statusTone(details.status)}`}><i />{details.status || "Not available"}</span>
          </div>
          <h2 className="ksl-batch-hero__title">{details.name || "Unnamed Batch"}</h2>
          <p className="ksl-batch-hero__sub">{details.course || "Course not available"}{details.type && <><i className="ksl-dot-sep" />{details.type}</>}</p>
        </div>
        <dl className="ksx-hero-stats">
          <div><span className="ksl-tile-icon ksl-tone--blue"><BookOpen /></span><div><dt>Course</dt><dd>{details.course || "—"}</dd></div></div>
          <div><span className="ksl-tile-icon ksl-tone--violet"><Users /></span><div><dt>Students</dt><dd>{details.enrolled ?? "—"}</dd></div></div>
          <div><span className="ksl-tile-icon ksl-tone--green"><CalendarCheck /></span><div><dt>Duration</dt><dd>{details.duration || "—"}</dd></div></div>
        </dl>
        <button type="button" className="ksx-ongoing" onClick={() => navigate(ROUTES.STUDENT.CLASS_SCHEDULE)}>
          <GraduationCap />{batchPhase(details.status)}<ChevronRight />
        </button>
      </section>

      <section className="ksl-batch-grid">
        <article className="ksl-card ksl-batch-info">
          <h2 className="ksl-card__title"><BookOpen className="ksl-card__title-icon ksl-card__title-icon--orange" />Batch Information</h2>
          <dl className="ksl-info-grid">
            {infoTiles.map(({ key, label, value, Icon, tone, pill }) => (
              <div key={key} className="ksl-info-tile">
                <span className={`ksl-tile-icon ksl-tile-icon--${tone}`}><Icon /></span>
                <div className="ksl-info-tile__text">
                  <dt>{label}</dt>
                  <dd>{pill && value ? <span className={`ksl-pill ksl-pill--sm ksl-pill--${statusTone(value)}`}><i />{value}</span> : (value || "Not available")}</dd>
                </div>
              </div>
            ))}
          </dl>
          <div className="ksl-capacity">
            <div className="ksl-capacity__head"><span>Capacity used</span><span>{hasCapacity ? `${Math.round(details.capacityPercent)}%` : "Not available"}</span></div>
            <div className="ksl-capacity__track"><div className="ksl-capacity__bar" style={{ width: `${details.capacityPercent}%` }} /></div>
          </div>
        </article>

        <div className="ksl-batch-side">
          <article className="ksl-card ksl-side-card">
            <h2 className="ksl-card__title"><span className="ksl-card__title-badge ksl-card__title-badge--violet"><UserRoundCheck /></span>Your Mentor</h2>
            {details.mentor.name ? <>
              <div className="ksl-mentor">
                <span className="ksl-avatar">{initials(details.mentor.name)}</span>
                <div><p className="ksl-mentor__name">{details.mentor.name}</p><p className="ksl-mentor__role">{details.mentor.designation}</p></div>
              </div>
              <button type="button" onClick={openMentorChat} className="ksl-btn ksl-btn--navy ksl-btn--block"><MessageCircle />Chat with Mentor<CircleArrowRight /></button>
            </> : <p className="ksl-muted">A mentor has not been assigned yet.</p>}
          </article>
          <article className="ksl-card ksl-side-card">
            <h2 className="ksl-card__title"><BookOpen className="ksl-card__title-icon ksl-card__title-icon--orange" />Course</h2>
            <div className="ksl-course-mini">
              <CourseLogo name={details.course} size="sm" />
              <div className="min-w-0">
                <p className="ksl-course-mini__name">{details.course || "Not available"}</p>
                {details.courseDescription && <p className="ksl-course-mini__desc">{details.courseDescription}</p>}
              </div>
            </div>
            {details.courseId && <button type="button" onClick={() => navigate(`/student/courses/${details.courseId}`)} className="ksl-btn ksl-btn--orange ksl-btn--block">View Course <CircleArrowRight /></button>}
          </article>
        </div>
      </section>

      {(details.start !== "Not available" || details.end !== "Not available") && (
        <section className="ksl-card ksl-timeline">
          <h2 className="ksl-card__title"><Clock3 className="ksl-card__title-icon ksl-card__title-icon--blue" />Batch Timeline</h2>
          <div className="ksl-timeline__row">
            <div><p className="ksl-timeline__date">{details.start}</p><p className="ksl-timeline__cap">Start</p></div>
            <div className="ksl-timeline__track"><i /><i /></div>
            <div className="ksl-timeline__end"><p className="ksl-timeline__date">{details.end}</p><p className="ksl-timeline__cap">End</p></div>
          </div>
        </section>
      )}
      {details.description && details.description !== details.courseDescription && <section className="ksl-card ksl-about"><h2 className="ksl-card__title">About This Batch</h2><p>{details.description}</p></section>}
    </div>
  );
}

export default function StudentMyBatch() {
  const { status, enrollments, error, loading, reload } = useStudentEnrollments();
  const [extras, setExtras] = useState({});
  const batches = useMemo(() => batchEnrollments(enrollments), [enrollments]);

  // Optional enrichment per batch. Student tokens can be blocked from the
  // single batch route; the student-batch roster route carries capacity and
  // counts. A failure here never hides the enrollment itself.
  useEffect(() => {
    const ids = [...new Set(batches.map((entry) => entry.batchId).filter(Boolean))];
    if (!ids.length) return undefined;
    let cancelled = false;
    Promise.all(ids.map(async (batchId) => {
      const [byId, roster] = await Promise.allSettled([batchService.getById(batchId), batchService.getStudents(batchId)]);
      const batch = byId.status === "fulfilled" ? byId.value?.data ?? byId.value : null;
      return [batchId, { ...(batch ?? {}), ...(roster.status === "fulfilled" ? roster.value ?? {} : {}) }];
    })).then((pairs) => {
      if (!cancelled) setExtras(Object.fromEntries(pairs));
    });
    return () => { cancelled = true; };
  }, [batches]);

  const detailsList = useMemo(() => batches.map((entry) => ({
    key: entry.key,
    details: toBatchDetails(mergeBatch(enrollmentBatch(entry), entry.batchId ? extras[entry.batchId] : null)),
  })), [batches, extras]);

  const errorText = status === "not-student"
    ? "This page is available only to a student account."
    : status === "error" ? errorMessage(error) : "";

  return (
    <main className="ksl-page ksl-batch-page w-full px-2 py-2 sm:px-3">
      <StudentPageBanner
        banner={STUDENT_BANNERS.myBatch}
        icon={Users}
        eyebrow="My Batch"
        title="Stay on Track with"
        highlight="Your Batch"
        description={<>View your batch details, attend classes, connect with your mentor<br className="ksl-hide-sm" /> and make steady progress towards your learning goals.</>}
        features={BATCH_FEATURES}
      />
      {loading ? <BatchSkeleton /> : errorText ? (
        <section className="ksl-card ksl-state ksl-state--warn" role="alert"><p>{errorText}</p>{status === "error" && <button type="button" onClick={reload} className="ksl-btn ksl-btn--orange"><RefreshCw />Retry</button>}</section>
      ) : !detailsList.length ? (
        <section className="ksl-card ksl-state"><Users className="ksl-state__icon" /><h2>No Batch Assigned</h2><p>You haven&apos;t been assigned to a batch yet.<br />Please contact your organization administrator.</p></section>
      ) : detailsList.map(({ key, details }) => <BatchView key={key} details={details} />)}
    </main>
  );
}
