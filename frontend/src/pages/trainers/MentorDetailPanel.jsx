import { useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  Clock,
  Eye,
  FileText,
  LayoutDashboard,
  Layers3,
  Mail,
  MapPin,
  Phone,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import { batchNames, batchSchedule, courseNames, initialsOf } from "./mentorDirectory";
import { MentorActionsMenu, MentorAvatar, StatusBadge, TypeBadge } from "./MentorKit";
import useMentorRoster from "./useMentorRoster";

/* ──────────────────────────────────────────────────────────────────────
   Right panel of the mentor workspace: the selected mentor's header,
   actions and five tabs. Every value comes from the mentor record loaded
   by useTrainers (or the batch rosters via useMentorRoster); missing fields
   read "Not provided" rather than being invented.
   ────────────────────────────────────────────────────────────────────── */

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "teaching", label: "Courses & Batches", icon: Layers3 },
  { id: "students", label: "Students", icon: Users },
  { id: "schedule", label: "Schedule", icon: CalendarDays },
  { id: "activity", label: "Activity", icon: Activity },
];

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date)
    : "";
};
const text = (value) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value));
const batchId = (batch) => batch.batchId ?? batch.id;

export default function MentorDetailPanel({ trainer, photo, onViewProfile, onEdit, onAction, onDeactivate }) {
  const [tab, setTab] = useState("overview");
  const tabsRef = useRef(null);
  const baseId = useId();
  const roster = useMentorRoster(trainer);

  const onTabKey = (event) => {
    const index = TABS.findIndex((item) => item.id === tab);
    const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const target = (next + TABS.length) % TABS.length;
    setTab(TABS[target].id);
    tabsRef.current?.querySelectorAll("[role=tab]")[target]?.focus();
  };

  const experience = Number(trainer.experience) > 0 ? `${trainer.experience} ${Number(trainer.experience) === 1 ? "yr" : "yrs"} experience` : "";
  return (
    <section className="mw-panel mw-detail" aria-label={`${trainer.name} details`}>
      <header className="mw-detail__head">
        <MentorAvatar name={trainer.name} photo={photo} status={trainer.status} size="lg" />
        <div className="mw-detail__who">
          <h2>{trainer.name}</h2>
          <p className="mw-detail__meta">
            <span>{text(trainer.designation) || "Mentor"}</span>
            <i aria-hidden="true">|</i>
            <span>Employee ID: {trainer.employeeId}</span>
            {trainer.mentorProfileId != null && <><i aria-hidden="true">|</i><span>Mentor ID: {trainer.mentorProfileId}</span></>}
            {experience && <><i aria-hidden="true">|</i><span>{experience}</span></>}
          </p>
          <p className="mw-detail__badges">
            <StatusBadge status={trainer.status} />
            <TypeBadge type={trainer.employmentType} />
          </p>
        </div>
        <div className="mw-detail__actions">
          <button type="button" className="mw-btn is-soft-blue" onClick={() => onViewProfile(trainer)}>
            <Eye aria-hidden="true" /> View Profile
          </button>
          <MentorActionsMenu trainer={trainer} onAction={onAction} onDeactivate={onDeactivate} />
        </div>
      </header>

      <div ref={tabsRef} className="mw-tabs" role="tablist" aria-label="Mentor sections" onKeyDown={onTabKey}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`${baseId}-panel-${id}`}
            tabIndex={tab === id ? 0 : -1}
            className="mw-tabs__tab"
            onClick={() => setTab(id)}
          >
            <Icon aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`} className="mw-detail__body">
        {tab === "overview" && <Overview trainer={trainer} roster={roster} onEdit={onEdit} showTab={setTab} />}
        {tab === "teaching" && <Teaching trainer={trainer} onAction={onAction} />}
        {tab === "students" && <Students trainer={trainer} roster={roster} onViewProfile={onViewProfile} />}
        {tab === "schedule" && <Schedule trainer={trainer} onAction={onAction} />}
        {tab === "activity" && <ActivityFeed trainer={trainer} />}
      </div>
    </section>
  );
}

function Card({ icon: Icon, title, action, className = "", children }) {
  return (
    <section className={`mw-card ${className}`}>
      <header className="mw-card__head">
        <span className="mw-chip-icon is-small" aria-hidden="true"><Icon /></span>
        <h3>{title}</h3>
        {action}
      </header>
      {children}
    </section>
  );
}

// Long addresses break before the "@" first, so the domain stays whole.
const breakableEmail = (email) => (email.includes("@")
  ? <>{email.slice(0, email.lastIndexOf("@"))}<wbr />{email.slice(email.lastIndexOf("@"))}</>
  : email);

function Fact({ icon: Icon, label, value, href, display }) {
  return (
    <div className="mw-fact">
      <dt><Icon aria-hidden="true" /><span className="sr-only">{label}</span></dt>
      <dd>
        <small aria-hidden="true">{label}</small>
        {value ? (href ? <a href={href} title={value}>{display ?? value}</a> : <span>{display ?? value}</span>) : <span className="mw-muted">Not provided</span>}
      </dd>
    </div>
  );
}

// First names as labels, the rest as "+N" (opens the full list).
function Labels({ names, tone, icon: Icon, emptyText, onMore, max = 2 }) {
  if (!names.length) return <p className="mw-muted">{emptyText}</p>;
  const rest = names.length - max;
  return (
    <ul className="mw-labels">
      {names.slice(0, max).map((name) => (
        <li key={name} className={`is-${tone}`} title={name}><Icon aria-hidden="true" /><span>{name}</span></li>
      ))}
      {rest > 0 && (
        <li className="is-more">
          <button type="button" onClick={onMore} aria-label={`Show all ${names.length}`}>+{rest}</button>
        </li>
      )}
    </ul>
  );
}

function Overview({ trainer, roster, onEdit, showTab }) {
  const email = text(trainer.email);
  const phone = text(trainer.mobile ?? trainer.phone);
  const location = text(trainer.location ?? trainer.city ?? trainer.address ?? trainer.branchName ?? trainer.branch);
  const department = text(trainer.department);
  const joined = formatDate(trainer.joiningDate ?? trainer.dateOfJoining ?? trainer.joinedAt);
  const about = text(trainer.bio ?? trainer.about ?? trainer.description ?? trainer.summary);
  const courses = courseNames(trainer);
  const batches = batchNames(trainer);
  const learners = roster.loading || roster.failed ? trainer.students : roster.rows.length;
  const faces = roster.rows.slice(0, 4);
  return (
    <div className="mw-overview">
      <Card
        icon={UserRound}
        title="Contact Information"
        className="mw-overview__contact"
        action={onEdit && <button type="button" className="mw-link" onClick={() => onEdit(trainer)}>Edit</button>}
      >
        <dl className="mw-facts">
          <Fact icon={Mail} label="Email" value={email} display={email ? breakableEmail(email) : undefined} href={email ? `mailto:${email}` : undefined} />
          <Fact icon={Phone} label="Phone" value={phone} href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined} />
          <Fact icon={MapPin} label="Location" value={location} />
          <Fact icon={Building2} label="Department" value={department} />
          <Fact icon={CalendarCheck} label="Joined" value={joined} />
        </dl>
      </Card>
      <Card icon={BookOpen} title="Teaching Courses" className="mw-overview__courses">
        <Labels names={courses} tone="violet" icon={BookOpen} emptyText="No courses assigned" onMore={() => showTab("teaching")} />
      </Card>
      <Card icon={Layers3} title="Assigned Batches" className="mw-overview__batches">
        <Labels names={batches} tone="orange" icon={Layers3} emptyText={trainer.batchesError ? "Batches unavailable" : "No batches assigned"} onMore={() => showTab("teaching")} />
      </Card>
      <Card icon={Users} title="Student Engagement" className="mw-overview__engagement">
        <div className="mw-engage">
          <p className="mw-engage__count">
            <b>{learners ?? "—"}</b>
            <span>{learners === 1 ? "Active learner" : "Active learners"}</span>
          </p>
          {faces.length > 0 && (
            <button type="button" className="mw-faces" onClick={() => showTab("students")} aria-label={`View ${roster.rows.length} students`}>
              {faces.map((student, index) => {
                const name = text(student.studentName ?? student.name ?? [student.firstName, student.lastName].filter(Boolean).join(" ")) || "Student";
                return (
                  <span key={student.studentId ?? student.id ?? index} className="mw-faces__face" title={name}>
                    <AvatarPhoto src={student.profilePhoto ?? student.photoUrl ?? student.profileImageUrl} fallback={initialsOf(name)} />
                  </span>
                );
              })}
              {roster.rows.length > faces.length && <span className="mw-faces__more">+{roster.rows.length - faces.length}</span>}
            </button>
          )}
        </div>
      </Card>
      <Card icon={FileText} title="About Mentor" className="mw-overview__about">
        {about ? <p className="mw-about">{about}</p> : <p className="mw-muted">Not provided</p>}
      </Card>
    </div>
  );
}

function Teaching({ trainer, onAction }) {
  const navigate = useNavigate();
  const batches = trainer.assignedBatches || [];
  const taught = new Set(batches.map((batch) => text(batch.courseName ?? batch.course?.courseName ?? batch.course?.name)).filter(Boolean));
  const otherCourses = courseNames(trainer).filter((name) => !taught.has(name));
  return (
    <div className="mw-stack">
      <Card
        icon={Layers3}
        title={`Assigned Batches (${batches.length})`}
        action={onAction && <button type="button" className="mw-link" onClick={() => onAction("Assign Batch", trainer)}>Assign batch</button>}
      >
        {batches.length ? (
          <ul className="mw-rows">
            {batches.map((batch, index) => (
              <li key={batchId(batch) ?? index}>
                <span className="mw-rows__main">
                  <b>{text(batch.batchName ?? batch.name) || "Batch"}</b>
                  <small>{text(batch.courseName ?? batch.course?.courseName ?? batch.course?.name) || "Course not set"}</small>
                </span>
                <span className="mw-rows__meta"><Users aria-hidden="true" />{batch.studentCount ?? "—"}</span>
                {batch.status && <span className="mw-rows__tag">{batch.status}</span>}
                {batchId(batch) != null && (
                  <button type="button" className="mw-link" onClick={() => navigate(`/organization/batches/${batchId(batch)}/details`)}>Open</button>
                )}
              </li>
            ))}
          </ul>
        ) : <p className="mw-muted">{trainer.batchesError || "No batches are assigned to this mentor."}</p>}
      </Card>
      <Card
        icon={BookOpen}
        title="Courses"
        action={onAction && <button type="button" className="mw-link" onClick={() => onAction("Assign Course", trainer)}>Assign course</button>}
      >
        {courseNames(trainer).length ? (
          <>
            <ul className="mw-labels is-wrap">{courseNames(trainer).map((name) => <li key={name} className="is-violet"><BookOpen aria-hidden="true" /><span>{name}</span></li>)}</ul>
            {otherCourses.length > 0 && <p className="mw-note">{otherCourses.length} {otherCourses.length === 1 ? "course has" : "courses have"} no batch with this mentor yet.</p>}
          </>
        ) : <p className="mw-muted">No courses assigned.</p>}
      </Card>
    </div>
  );
}

const STUDENT_PREVIEW = 8;

function Students({ trainer, roster, onViewProfile }) {
  const rows = roster.rows.slice(0, STUDENT_PREVIEW);
  return (
    <Card
      icon={Users}
      title={`Students${roster.loading ? "" : ` (${roster.rows.length})`}`}
      action={<button type="button" className="mw-link" onClick={() => onViewProfile(trainer, "Students")}>Open full list</button>}
    >
      {roster.loading ? (
        <ul className="mw-rows" aria-busy="true">{[0, 1, 2].map((index) => <li key={index} className="mw-skeleton is-line" />)}</ul>
      ) : rows.length ? (
        <>
          <ul className="mw-rows">
            {rows.map((student, index) => {
              const name = text(student.studentName ?? student.name ?? [student.firstName, student.lastName].filter(Boolean).join(" ")) || "Student";
              return (
                <li key={student.studentId ?? student.id ?? index}>
                  <span className="mw-faces__face is-inline"><AvatarPhoto src={student.profilePhoto ?? student.photoUrl} fallback={initialsOf(name)} /></span>
                  <span className="mw-rows__main">
                    <b>{name}</b>
                    <small>{text(student.email) || "No email"}</small>
                  </span>
                  <span className="mw-rows__tag">{student.batchName}</span>
                </li>
              );
            })}
          </ul>
          {roster.rows.length > rows.length && <p className="mw-note">Showing {rows.length} of {roster.rows.length}. Open the full list for every student.</p>}
          {roster.failed && <p className="mw-note is-error">Some batch rosters couldn’t be loaded.</p>}
        </>
      ) : (
        <p className="mw-muted">{roster.failed ? "Student rosters couldn’t be loaded." : (trainer.assignedBatches || []).length ? "No students in this mentor’s batches yet." : "No batches assigned, so no students yet."}</p>
      )}
    </Card>
  );
}

function Schedule({ trainer, onAction }) {
  const batches = trainer.assignedBatches || [];
  const today = text(trainer.todayClass);
  return (
    <div className="mw-stack">
      <Card icon={Clock} title="Today">
        <p className={today && today !== "No class today" ? "mw-today" : "mw-muted"}>{today || "No class today"}</p>
      </Card>
      <Card
        icon={CalendarDays}
        title="Weekly schedule by batch"
        action={onAction && <button type="button" className="mw-link" onClick={() => onAction("Manage Schedule", trainer)}><Settings aria-hidden="true" /> Manage schedule</button>}
      >
        {batches.length ? (
          <ul className="mw-rows">
            {batches.map((batch, index) => {
              const slot = batchSchedule(batch);
              return (
                <li key={batchId(batch) ?? index}>
                  <span className="mw-rows__main">
                    <b>{text(batch.batchName ?? batch.name) || "Batch"}</b>
                    <small>{text(batch.courseName ?? batch.course?.courseName) || "Course not set"}</small>
                  </span>
                  <span className="mw-rows__slot"><b>{slot.days}</b>{slot.time && <small>{slot.time}</small>}</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="mw-muted">No batches assigned, so nothing is scheduled.</p>}
      </Card>
    </div>
  );
}

// Dated events from the mentor record and their batches, newest first.
function ActivityFeed({ trainer }) {
  const events = [
    { date: trainer.joiningDate ?? trainer.dateOfJoining ?? trainer.joinedAt, text: "Joined the organization", icon: UserRound },
    ...(trainer.assignedBatches || []).flatMap((batch) => {
      const name = text(batch.batchName ?? batch.name) || "a batch";
      return [
        { date: batch.startDate ?? batch.batchStartDate, text: `Started teaching ${name}`, icon: Layers3 },
        { date: batch.endDate ?? batch.batchEndDate, text: `${name} ends`, icon: CalendarCheck },
      ];
    }),
  ]
    .map((event) => ({ ...event, time: event.date ? new Date(event.date).getTime() : NaN }))
    .filter((event) => Number.isFinite(event.time))
    .sort((a, b) => b.time - a.time);
  return (
    <Card icon={Activity} title="Activity">
      {events.length ? (
        <ol className="mw-timeline">
          {events.map(({ text: label, icon: Icon, date }, index) => (
            <li key={`${label}-${index}`}>
              <span className="mw-chip-icon is-small" aria-hidden="true"><Icon /></span>
              <span><b>{label}</b><time dateTime={new Date(date).toISOString()}>{formatDate(date)}</time></span>
            </li>
          ))}
        </ol>
      ) : <p className="mw-muted">No dated activity is recorded for this mentor yet.</p>}
    </Card>
  );
}
