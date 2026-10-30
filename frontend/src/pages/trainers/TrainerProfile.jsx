import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useMentorRoster from "./useMentorRoster";
import { batchSchedule } from "./mentorDirectory";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Home,
  Layers3,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";
import { PanelCard, ProfileHero, ProfileTabs, StatTile, StatusPill } from "@features/organization/components/profile/ProfileKit";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { embeddedPhotoUrl, mentorPhotoLookup } from "@shared/services/profilePhotoService";
import { useProfilePhoto } from "@shared/hooks/useProfilePhoto";
import KPI from "@/components/common/KPI";

const tabs = ["Overview", "Schedule", "Courses", "Batches", "Students", "Performance"];
const monthly = [
  { month: "Mar", classes: 34 },
  { month: "Apr", classes: 39 },
  { month: "May", classes: 37 },
  { month: "Jun", classes: 44 },
  { month: "Jul", classes: 42 },
  { month: "Aug", classes: 48 },
];

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`pk-panel ${className}`}>
      <header className="pk-panel__head">
        <h3>{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      <div className="pk-panel__body">{children}</div>
    </section>
  );
}

const TAB_ICONS = { Overview: Home, Schedule: CalendarDays, Courses: BookOpen, Batches: Layers3, Students: Users, Performance: BarChart3 };
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_TONES = ["blue", "green", "purple", "orange", "pink", "teal", "blue"];
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const fmtDay = (date) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date).replace("Sep ", "Sept ");
export default function TrainerProfile({
  trainer,
  initialTab = "Overview",
  onBack,
  onEdit,
  onAction,
  onRefresh,
  refreshing = false,
}) {
  const [tab, setTab] = useState(initialTab);
  const navigate = useNavigate();
  const weekStart = (() => { const today = new Date(); const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()); start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); return start; })();
  const phone = trainer.phone ?? trainer.Phone ?? trainer.mobile ?? trainer.Mobile ?? trainer.mobileNumber ?? trainer.MobileNumber ?? trainer.phoneNumber ?? trainer.PhoneNumber ?? trainer.employee?.phone ?? trainer.employee?.mobile;
  const runAction = (action) => onAction(action, trainer);
  // Same lookup as the mentor list, so both show the photo the mentor uploaded.
  // The photo API is the source of truth; a URL embedded in the record is the fallback.
  const photoLookup = mentorPhotoLookup(trainer);
  const { photoUrl: fetchedPhoto } = useProfilePhoto(photoLookup.profileType, photoLookup.profileId);
  const profilePhoto = fetchedPhoto || embeddedPhotoUrl(trainer);
  const batches = (trainer.assignedBatches || []).map(batch => [
    batch.batchName ?? batch.name ?? 'Batch',
    batch.courseName ?? batch.course?.courseName ?? batch.course?.name ?? '\u2014',
    batch.schedule ?? batch.timing ?? '\u2014',
    batch.studentCount ?? '\u2014',
    batch.status ?? '\u2014',
  ]);


  return (
    <div className="org-mentor-profile mx-auto max-w-[1500px] space-y-4 text-slate-800">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to mentors
      </button>
      <ProfileHero
        name={trainer.name}
        status={trainer.status}
        statusTone={trainer.status === "Active" ? "green" : trainer.status === "On Leave" ? "orange" : "gray"}
        avatarTone="peach"
        photo={profilePhoto || undefined}
        online={trainer.status === "Active"}
        subline={<>Employee ID: {trainer.employeeId ?? trainer.id}<em>|</em>{trainer.designation || "Mentor"}</>}
        email={trainer.email}
        phone={phone}
        location={trainer.location ?? trainer.city}
        tiles={[
          { icon: Briefcase, label: "Employment Type", value: trainer.employmentType || trainer.type },
          { icon: UserRound, label: "Designation", value: trainer.designation || "Mentor" },
        ]}
        image={ORG_BANNERS.mentorProfile?.src}
        action={
          <div className="flex gap-2">
            <button type="button" onClick={() => runAction("Export Profile")} className="pk-btn pk-btn--outline" title="Export profile">
              <Download /> Export
            </button>
            <button type="button" onClick={() => onEdit(trainer)} className="pk-btn pk-btn--orange">
              <Pencil /> Edit Profile
            </button>
          </div>
        }
      />
      <ProfileTabs
        label="Mentor sections"
        active={tab}
        onChange={setTab}
        items={tabs.map((item) => ({ id: item, label: item, icon: TAB_ICONS[item] }))}
      />

      {tab === "Overview" && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile tone="blue" icon={Users} value={refreshing ? "…" : trainer.students ?? "—"} label="Total Students" onClick={() => setTab("Students")} />
            <StatTile tone="green" icon={Layers3} value={refreshing ? "…" : trainer.batches ?? 0} label="Assigned Batches" onClick={() => setTab("Batches")} />
            <StatTile tone="orange" icon={BookOpen} value={trainer.courses?.length ?? 0} label="Assigned Courses" onClick={() => setTab("Courses")} />
            <StatTile tone="purple" icon={Star} value={trainer.experience ?? 0} label="Years of Experience" />
          </div>
          <div className="grid items-start gap-4 lg:grid-cols-3">
            <PanelCard icon={UserRound} tone="blue" title="Employee Information">
              <div className="pk-kv-list">
                {[
                  [Mail, "Official Email", trainer.email],
                  [Phone, "Phone", phone],
                  [UserRound, "Designation", trainer.designation],
                  [CalendarDays, "Joined On", trainer.joiningDate],
                  [Briefcase, "Employment Type", trainer.employmentType || trainer.type],
                ].map(([Icon, label, value]) => (
                  <div key={label} className="pk-kv"><span><Icon /></span><small>{label}</small><b title={value || undefined}>{value || "-"}</b></div>
                ))}
              </div>
            </PanelCard>
            <PanelCard icon={Settings} tone="blue" title="Skills & Expertise">
              <div className="tp-exp">
                <b>{trainer.experience ?? 0}</b>
                <span>Years of Experience</span>
                <i aria-hidden="true"><em /><em /><em /><em /></i>
              </div>
              <p className="tp-sub"><Sparkles aria-hidden="true" /> Skills</p>
              <div className="flex flex-wrap gap-2">
                {trainer.skills?.length ? trainer.skills.map((skill) => <span key={skill} className="tp-chip">{skill}</span>) : <span className="text-sm text-slate-500">No skills added yet.</span>}
              </div>
              <p className="tp-sub"><FileText aria-hidden="true" /> Bio</p>
              <div className="tp-bio">{trainer.bio || trainer.about || "No bio added yet."}</div>
            </PanelCard>
            <PanelCard icon={BookOpen} tone="blue" title="Teaching Assignments">
              <div className="tp-box">
                <div className="flex items-center justify-between">
                  <b className="tp-box__title">Assigned Courses</b>
                  <button type="button" className="tp-link" onClick={() => setTab("Courses")}>View all <ArrowRight aria-hidden="true" /></button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {trainer.courses?.length ? trainer.courses.map((course, index) => <span key={`${course}-${index}`} className={`tp-chip ${index % 2 ? "is-blue" : "is-purple"}`}>{course}</span>) : <span className="text-sm text-slate-500">No courses assigned.</span>}
                </div>
              </div>
              <div className="tp-box tp-box--row">
                <span className="tp-box__icon"><Layers3 aria-hidden="true" /></span>
                <div className="min-w-0 flex-1"><b className="tp-box__num">{refreshing ? "…" : trainer.batches ?? "—"}</b><small>Assigned Batches</small></div>
                <button type="button" className="tp-link" onClick={() => setTab("Batches")}>View all <ArrowRight aria-hidden="true" /></button>
              </div>
              <div className="tp-box tp-box--row" aria-label="Mentor student total">
                <span className="tp-box__icon"><Users aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <b className="tp-box__num">{refreshing ? "…" : trainer.students ?? "—"}</b>
                  <small>Total Students</small>
                  <small className="tp-box__note">{trainer.students == null ? "Student count unavailable. Please retry." : "Unique students across assigned batches"}</small>
                </div>
                {onRefresh && trainer.students == null && <button type="button" disabled={refreshing} onClick={onRefresh} className="tp-link">{refreshing ? "Loading..." : "Retry"}</button>}
                {!(onRefresh && trainer.students == null) && <UsersRound className="tp-box__deco" aria-hidden="true" />}
              </div>
            </PanelCard>
          </div>
        </div>
      )}

      {tab === "Schedule" && (
        <section className="pk-panel p-5">
          <div className="pk-section-head">
            <span className="pk-section-head__icon" aria-hidden="true"><CalendarDays /></span>
            <div className="min-w-0 flex-1">
              <h2>Weekly Teaching Schedule</h2>
              <p>View and manage the teaching schedule for each batch and day of the week.</p>
            </div>
            <button type="button" onClick={() => runAction("Manage Schedule")} className="pk-btn pk-btn--outline-orange">
              <Settings /> Manage Schedule
            </button>
          </div>

          <div className="pk-table-wrap mt-5">
            <table className="pk-table tp-batch-table">
              <thead>
                <tr>
                  <th><span className="tp-th"><UsersRound aria-hidden="true" />Batch</span></th>
                  <th><span className="tp-th"><BookOpen aria-hidden="true" />Course</span></th>
                  <th><span className="tp-th"><CalendarDays aria-hidden="true" />Schedule</span></th>
                  <th><span className="tp-th"><Users aria-hidden="true" />Students</span></th>
                  <th><span className="tp-th"><TrendingUp aria-hidden="true" />Status</span></th>
                  <th><span className="tp-th"><MoreVertical aria-hidden="true" />Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {(trainer.assignedBatches || []).map((batch, index) => {
                  const slot = batchSchedule(batch);
                  return (
                    <tr key={batch.batchId ?? batch.id ?? index}>
                      <td className="font-bold text-[#0b1f3f]">{batch.batchName ?? batch.name ?? "Batch"}</td>
                      <td>{batch.courseName ?? batch.course?.courseName ?? batch.course?.name ?? "—"}</td>
                      <td>
                        <span className="tp-slot"><Clock aria-hidden="true" /><span><b>{slot.days}</b>{slot.time && <small>{slot.time}</small>}</span></span>
                      </td>
                      <td><span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-slate-500" aria-hidden="true" />{batch.studentCount ?? batch.studentsCount ?? "—"}</span></td>
                      <td><StatusPill status={batch.status ?? "Active"} /></td>
                      <td>
                        <button
                          type="button"
                          className="pk-icon-btn mx-auto !bg-[#eef3fb]"
                          aria-label={`Open ${batch.batchName ?? "batch"}`}
                          title="Open batch"
                          onClick={() => (batch.batchId ?? batch.id) != null ? navigate(`/organization/batches/${batch.batchId ?? batch.id}/details`) : runAction("Manage Schedule")}
                        >
                          <MoreVertical />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!(trainer.assignedBatches || []).length && (
                  <tr><td colSpan="6" className="py-8 text-center text-slate-500">{trainer.batchesError || "No batches are assigned to this mentor."}</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="tp-week">
            {WEEK.map((day, index) => {
              const date = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index);
              const slots = (trainer.schedule || []).filter((slot) => slot.day === DAY_NAMES[index]);
              return (
                <div key={day} className={`tp-day is-${DAY_TONES[index]}`}>
                  <div className="tp-day__head"><b>{day}</b><small>{fmtDay(date)}</small></div>
                  <div className="tp-day__slots">
                    {slots.length ? slots.map((slot) => (
                      <button key={`${slot.time}-${slot.course}`} type="button" onClick={() => onAction("Class Details", trainer)} className="tp-day__slot">
                        <b>{slot.time}</b><span>{slot.course}</span>
                      </button>
                    )) : (
                      <div className="tp-day__free"><Clock aria-hidden="true" /><b>Available</b><span>No classes scheduled</span></div>
                    )}
                  </div>
                  <button type="button" className="tp-day__add" onClick={() => runAction("Manage Schedule")}><Plus aria-hidden="true" /> Add Slot</button>
                </div>
              );
            })}
          </div>
          <p className="tp-note"><CalendarDays aria-hidden="true" /> You can set multiple time slots per day to show availability for teaching.</p>
        </section>
      )}

      {tab === "Courses" && (
        <Card title="Assigned courses">
          {trainer.courses?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trainer.courses.map((course, index) => (
                <div
                  key={`${course}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/70 p-4"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-600 text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{course}</p>
                    <p className="mt-0.5 text-xs text-slate-500">Assigned course</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No courses are assigned to this mentor.</p>
          )}
        </Card>
      )}

      {tab === "Batches" && (
        <Card
          title="Current & past batches"
          action={
            <button
              onClick={() => onAction("Assign Batch", trainer)}
              className="text-xs font-semibold text-blue-600"
            >
              + Assign batch
            </button>
          }
        >
          {trainer.batchesError && <div role="alert" className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900"><span>{trainer.batchesError}</span><button type="button" disabled={refreshing} onClick={onRefresh}>{refreshing ? "Loading..." : "Retry"}</button></div>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {["Batch", "Course", "Schedule", "Students", "Status"].map(
                    (item) => (
                      <th key={item} className="px-4 py-3">
                        {item}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {!batches.length && !trainer.batchesError && <tr><td colSpan={5} className="px-4 py-5 text-slate-500">{trainer.batches > 0 ? "Batch details are unavailable. Refresh the overview to retry." : "No assigned batches."}</td></tr>}
                {batches.map((row) => (
                  <tr key={`${row[0]}-${batches.indexOf(row)}`}>
                    {row.map((value, index) => (
                      <td
                        key={index}
                        className={`px-4 py-4 ${index === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}
                      >
                        {index === 4 ? (
                          <span
                            className={`rounded-full px-2 py-1 ${value === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "Students" && <MentorStudentsPanel trainer={trainer} refreshing={refreshing} onRefresh={onRefresh} />}

      {tab === "Performance" && (
        <div className="grid gap-3 lg:grid-cols-3">
          <Metric
            value="258"
            label="Classes delivered"
            note="+12% this quarter"
          />
          <Metric
            value="98.4%"
            label="Attendance marking"
            note="Within 30 minutes"
          />
          <Metric
            value="18h"
            label="Review turnaround"
            note="Target: under 24h"
          />
          <Card
            title="Classes delivered by month"
            action={
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                Last 6 months
              </span>
            }
            className="lg:col-span-3"
          >
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} margin={{ top: 18, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} width={38} />
                  <Tooltip
                    cursor={{ fill: "#eff6ff" }}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #dbeafe",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.1)",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="classes" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={64}>
                    <LabelList dataKey="classes" position="top" className="fill-slate-600 text-[10px] font-semibold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

// ADDITIVE — Students tab for the selected mentor. Reuses the existing
// mentor→batch→students relationship (trainer.assignedBatches + the existing
// batchService.getStudents roster endpoint already used across the project).
// No API, routing, or navigation changes; data is scoped to this mentor only.
function MentorStudentsPanel({ trainer, refreshing = false, onRefresh }) {
  const navigate = useNavigate();
  const assignedBatches = trainer.assignedBatches || [];
  const batchKeys = assignedBatches.map((batch) => String(batch.batchId ?? batch.id ?? "")).filter(Boolean);
  const state = useMentorRoster(trainer);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Back to page 1 whenever the mentor or their batches change (adjusted
  // during render, so the stale page is never shown).
  const rosterKey = `${trainer.id}|${batchKeys.join("|")}`;
  const [lastRosterKey, setLastRosterKey] = useState(rosterKey);
  if (lastRosterKey !== rosterKey) {
    setLastRosterKey(rosterKey);
    setPage(1);
  }

  if (state.loading) {
    return (
      <Card title="Assigned students">
        <div className="space-y-2" aria-busy="true">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
          <span className="sr-only">Loading assigned students</span>
        </div>
      </Card>
    );
  }

  if (state.failed && !state.rows.length) {
    return (
      <Card title="Assigned students">
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          <span>Unable to load the students assigned to this mentor. Please retry.</span>
          <button type="button" disabled={refreshing} onClick={onRefresh} className="font-semibold underline">
            {refreshing ? "Loading..." : "Retry"}
          </button>
        </div>
      </Card>
    );
  }

  const totalRows = state.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startRecord = totalRows ? (currentPage - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(currentPage * pageSize, totalRows);
  const paginatedRows = state.rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card
      title={`Assigned students${state.rows.length ? ` (${state.rows.length})` : ""}`}
      action={onRefresh ? (
        <button type="button" disabled={refreshing} onClick={onRefresh} className="text-xs font-semibold text-blue-600 disabled:opacity-50">
          {refreshing ? "Loading..." : "Refresh"}
        </button>
      ) : null}
    >
      {!state.rows.length ? (
        <div className="grid place-items-center py-10 text-center">
          <div>
            <Users className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No students assigned</p>
            <p className="mt-1 text-xs text-slate-400">This mentor currently has no students assigned.</p>
          </div>
        </div>
      ) : (
        <>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {["Student", "Email", "Mobile", "Course", "Batch", "Status"].map((item) => (
                  <th key={item} className="whitespace-nowrap px-4 py-3">{item}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedRows.map((student) => {
                const studentId = student.studentId ?? student.id ?? student.StudentId ?? student.userId ?? student.user?.id;
                const canOpen = studentId !== undefined && studentId !== null && studentId !== "";
                const openStudent = () => canOpen && navigate(`/organization/students/${encodeURIComponent(String(studentId))}`);
                const studentName = student.name ?? ([student.firstName, student.lastName].filter(Boolean).join("") || "\u2014");
                return (
                <tr
                  key={`${studentId ?? student.email ?? student.batchId}`}
                  onClick={canOpen ? openStudent : undefined}
                  onKeyDown={canOpen ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openStudent(); } } : undefined}
                  tabIndex={canOpen ? 0 : undefined}
                  role={canOpen ? "button" : undefined}
                  aria-label={canOpen ? `View student details for ${studentName}` : undefined}
                  className={`outline-none transition hover:bg-slate-50 ${canOpen ? "cursor-pointer focus-visible:bg-slate-100" : ""}`}
                >
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                    <span className={canOpen ? "hover:text-blue-700 hover:underline" : ""}>{studentName}</span>
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-4 text-slate-600" title={student.email}>{student.email || "\u2014"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{student.phone ?? student.mobile ?? "\u2014"}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{student.courseName}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">{student.batchName}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`rounded-full px-2 py-1 ${String(student.status ?? "Active").toLowerCase() === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {student.status ?? "Active"}
                  </span>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-1 flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {startRecord}&ndash;{endRecord} of {totalRows} students
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5">
              Rows per page:
              <select
                value={pageSize}
                onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
                aria-label="Rows per page"
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-800 outline-none focus:border-blue-500"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-1 font-semibold text-slate-700">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        </>
      )}
    </Card>
  );
}

// Performance metrics use the global KPI card (same design in every portal).
function Metric({ value, label, note }) {
  return <KPI label={label} value={value} description={note} icon={TrendingUp} accent="green" />;
}
