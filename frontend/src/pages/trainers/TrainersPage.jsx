import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { downloadMentors } from "./mentorExport";
import MentorPasswordReset from "./MentorPasswordReset";
import { ROUTES } from "@shared/constants/routeConstants";
import {
  AlertTriangle,
  CalendarClock,
  Mail,
  Send,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import useTrainers from "@/hooks/useTrainers";
import MentorDirectoryPanel from "./MentorDirectoryPanel";
import MentorDetailPanel from "./MentorDetailPanel";
import useMentorPhotos from "./useMentorPhotos";
import { ALL, EMPTY_FILTERS, STATUS_GROUPS, filterMentors, filterOptions, filtersActive } from "./mentorDirectory";
import TrainerForm from "./TrainerForm";
import TrainerProfile from "./TrainerProfile";
import TutorAssignmentWizard from "./TutorAssignmentWizard";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import KPI from "@/components/common/KPI";
import "./mentor-management.css";

const MENTOR_ART_WEBP = "/assets/Org/web/org-mentor-management.webp";

export default function TrainersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { trainers, courseOptions, loading, error, saveTrainer, changeTrainerStatus, recordAssignment, stats, retry } =
    useTrainers();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const visible = useMemo(() => filterMentors(trainers, filters), [trainers, filters]);
  const options = useMemo(() => filterOptions(trainers), [trainers]);
  const inactiveCount = trainers.filter((item) => item.status === "Inactive").length;
  // Status chip counts follow the search and the other filters, not the status itself.
  const statusCounts = useMemo(() => {
    const pool = filterMentors(trainers, { ...filters, status: ALL });
    return Object.fromEntries([["all", pool.length], ...STATUS_GROUPS.map(({ status }) => [status, pool.filter((item) => item.status === status).length])]);
  }, [trainers, filters]);
  const photoFor = useMentorPhotos(trainers);
  // The selected mentor stays selected while visible; otherwise the first visible one.
  const [selectedId, setSelectedId] = useState(null);
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? null;
  const [form, setForm] = useState({
    open: false,
    trainer: null,
    initialSection: "Personal",
  });
  const [profileId, setProfileId] = useState(null);
  const [profileTab, setProfileTab] = useState("Overview");
  const [notice, setNotice] = useState(null);
  const [assignmentTutor, setAssignmentTutor] = useState(null);
  const [messageTutor, setMessageTutor] = useState(null);
  const profile = trainers.find((item) => item.id === profileId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const match = location.pathname.match(/\/organization\/tutors\/([^/]+)\/assign$/);
      if (match) {
        const tutor = trainers.find((item) => String(item.id) === match[1]);
        if (tutor) setAssignmentTutor(tutor);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [location.pathname, trainers]);

  useEffect(() => {
    if (!notice || notice.type !== "toast") return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const toast = (message) => setNotice({ type: "toast", message });
  const openEdit = (trainer) =>
    setForm({ open: true, trainer, initialSection: "Personal" });
  const openProfile = (trainer, initialTab = "Overview") => {
    setProfileTab(initialTab);
    setProfileId(trainer.id);
  };
  const save = async (values, id) => {
    const record = await saveTrainer(values, id);
    if (id === profileId) setProfileId(record.id);
    if (record?.id != null && (!id || id === selected?.id)) setSelectedId(record.id);
    toast(id ? "Mentor updated successfully" : "Mentor added successfully");
  };
  const handleStatusChange = async (trainer, status) => {
    const result = await changeTrainerStatus(trainer, status);
    if (!result.ok)
      setNotice({
        type: "dialog",
        title: "Status change failed",
        message: result.reason,
      });
    else toast(`${trainer.name} is now ${result.status.toLowerCase()}`);
  };
  const handleAction = (action, trainer) => {
    if (action === "Export Profile") {
      try {
        downloadMentors([trainer], `mentor-${trainer.id}-profile.csv`);
        toast("Mentor profile exported");
      } catch {
        setNotice({ type: "dialog", title: "Export failed", message: "Unable to export this mentor profile." });
      }
      return;
    }
    if (action === "Reset Password") {
      setNotice({ type: "reset", trainer });
      return;
    }
    if (action === "Manage Schedule" || action === "Class Details") {
      navigate(`${ROUTES.ORG_ADMIN.CLASSES}?mentor=${encodeURIComponent(trainer.name)}`);
      return;
    }
    if (action === "Message") {
      setMessageTutor(trainer);
      return;
    }
    if (action === "Assign Batch" || action === "Assign Course") {
      setAssignmentTutor(trainer);
      return;
    }
    if (action === "Performance" || action === "Schedule") {
      openProfile(trainer, action);
      return;
    }
    toast(`${action} opened for ${trainer.name}`);
  };
  // Exports exactly the mentors the directory shows (search and filters applied).
  const exportMentors = () => {
    try {
      downloadMentors(visible);
      toast(visible.length + " mentor records exported");
    } catch {
      setNotice({ type: "dialog", title: "Export failed", message: "Unable to export mentor records." });
    }
  };

  if (profile)
    return (
      <main className="min-h-full bg-slate-50 p-4 sm:p-6">
        <TrainerProfile
          trainer={profile}
          onRefresh={retry}
          refreshing={loading}
          initialTab={profileTab}
          onBack={() => setProfileId(null)}
          onEdit={openEdit}
          onAction={handleAction}
        />
        <TrainerForm
          open={form.open}
          trainer={form.trainer}
          initialSection={form.initialSection}
          onClose={() =>
            setForm({ open: false, trainer: null, initialSection: "Personal" })
          }
          onSave={save}
          courseOptions={courseOptions}
        />
        {notice && (
          <Notice
            notice={notice}
            onClose={() => setNotice(null)}
            onComplete={(message) => toast(message)}
          />
        )}
        {assignmentTutor && createPortal(<TutorAssignmentWizard tutor={assignmentTutor} onClose={() => setAssignmentTutor(null)} onComplete={(message, assignment) => { recordAssignment(assignmentTutor, assignment); setAssignmentTutor(null); toast(message); }} />, document.body)}
        {messageTutor && createPortal(<MentorMessageDialog trainer={messageTutor} onClose={() => setMessageTutor(null)} onSent={(message) => { setMessageTutor(null); toast(message); }} />, document.body)}
      </main>
    );

  return (
    <main className="tutor-management-page min-h-full px-3 py-3 text-slate-800 dark:bg-slate-950 dark:text-slate-100 sm:px-4 xl:px-5">
      <div className="mx-auto max-w-[1600px] space-y-3">
        <header className="mm-hero">
          <div className="mm-hero__copy">
            <p className="mm-hero__eyebrow">Mentor Management</p>
            <h1 className="mm-hero__title">Mentor <em>Management</em></h1>
            <p className="mm-hero__subtitle">Manage mentors, assign courses, track schedules, and empower quality learning experiences.</p>
          </div>
          <span className="mm-hero__dots" aria-hidden="true" />
          {/* The 270 KB WebP of the mentor artwork; the 1.7 MB PNG only if it fails. */}
          <img className="mm-hero__art" src={MENTOR_ART_WEBP} alt="" width="2170" height="725" decoding="async" fetchPriority="high" onError={(event) => { const img = event.currentTarget; if (img.src.endsWith(".webp")) img.src = ORG_BANNERS.mentors.src; else img.hidden = true; }} />
          <p className="mm-hero__quote">Guiding minds. Building brighter futures.</p>
        </header>
        <section className="mm-kpis grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Mentor summary">
          {[
            ["blue", Users, "Total Mentors", stats.total, "Registered mentors", ALL],
            ["green", UserCheck, "Active Mentors", stats.active, "Currently active", "Active"],
            ["orange", CalendarClock, "On Leave", stats.onLeave, "Currently unavailable", "On Leave"],
            ["red", UserX, "Inactive Mentors", inactiveCount, "Not active", "Inactive"],
          ].map(([tone, Icon, label, value, note, target]) => (
            <KPI
              key={label}
              accent={tone}
              icon={Icon}
              label={label}
              value={value}
              description={note}
              loading={loading}
              error={!loading && error ? error : undefined}
              onClick={() => setFilters({ ...filters, status: target })}
              className="h-full"
            />
          ))}
        </section>
        <div className="mm-workspace">
          <MentorDirectoryPanel
            mentors={visible}
            total={trainers.length}
            counts={statusCounts}
            filters={filters}
            options={options}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters(EMPTY_FILTERS)}
            hasFilters={filtersActive(filters)}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            onExport={exportMentors}
            photoFor={photoFor}
            loading={loading}
            error={error}
            onRetry={retry}
          />
          {loading ? (
            <Loading />
          ) : selected ? (
            <MentorDetailPanel
              key={selected.id}
              trainer={selected}
              photo={photoFor(selected)}
              onViewProfile={(trainer, initialTab) => openProfile(trainer, initialTab)}
              onEdit={openEdit}
              onAction={handleAction}
              onDeactivate={handleStatusChange}
            />
          ) : (
            <section className="mw-panel mw-detail mw-state is-centered" aria-label="Mentor details">
              <Users aria-hidden="true" />
              <p>{trainers.length ? "No mentor matches the current filters." : error ? "Mentor details will appear here once mentors load." : "Mentor profiles, courses and students appear here once mentors are added."}</p>
            </section>
          )}
        </div>
      </div>
      <TrainerForm
        open={form.open}
        trainer={form.trainer}
        initialSection={form.initialSection}
        onClose={() =>
          setForm({ open: false, trainer: null, initialSection: "Personal" })
        }
        onSave={save}
        courseOptions={courseOptions}
      />
      {notice && (
        <Notice
          notice={notice}
          onClose={() => setNotice(null)}
          onComplete={(message) => toast(message)}
        />
      )}
      {assignmentTutor && createPortal(<TutorAssignmentWizard tutor={assignmentTutor} onClose={() => setAssignmentTutor(null)} onComplete={(message, assignment) => { recordAssignment(assignmentTutor, assignment); setAssignmentTutor(null); toast(message); }} />, document.body)}
      {messageTutor && createPortal(<MentorMessageDialog trainer={messageTutor} onClose={() => setMessageTutor(null)} onSent={(message) => { setMessageTutor(null); toast(message); }} />, document.body)}
    </main>
  );
}

function MentorMessageDialog({ trainer, onClose, onSent }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const initials = trainer.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const submit = (event) => {
    event.preventDefault();
    const record = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      mentorId: trainer.id,
      mentorName: trainer.name,
      mentorEmail: trainer.email,
      subject: subject.trim(),
      message: message.trim(),
      sentAt: new Date().toISOString(),
    };
    try {
      const previous = JSON.parse(localStorage.getItem("organization-mentor-messages") || "[]");
      localStorage.setItem("organization-mentor-messages", JSON.stringify([record, ...previous]));
    } catch {
      // Sending remains available when browser storage is restricted.
    }
    onSent(`Message sent to ${trainer.name}`);
  };

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-slate-950/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="mentor-message-title" className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-blue-600">Direct message</p>
            <h2 id="mentor-message-title" className="mt-1 text-xl font-bold text-slate-950">Message mentor</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close message dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </header>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{initials}</span>
            <div className="min-w-0"><p className="font-bold text-slate-900">{trainer.name}</p><p className="truncate text-sm text-slate-500">{trainer.email || "Mentor"}</p></div>
          </div>
          <label className="block text-sm font-semibold text-slate-700">Subject
            <input autoFocus required value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} placeholder="Enter message subject" className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Message
            <textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={5} maxLength={2000} placeholder={`Write a message to ${trainer.name}`} className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <p className="flex items-center gap-2 text-xs text-slate-500"><Mail className="h-4 w-4" />This message will be saved in the organization mentor outbox.</p>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button disabled={!subject.trim() || !message.trim()} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" />Send message</button>
        </footer>
      </form>
    </div>
  );
}

function Loading() {
  return (
    <div aria-busy="true" className="mw-panel mw-detail space-y-3 p-4">
      <div className="h-20 animate-pulse rounded-xl bg-slate-200/80" />
      <div className="h-10 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="h-64 animate-pulse rounded-xl bg-slate-200/60" />
      <span className="sr-only">Loading mentor records</span>
    </div>
  );
}

function Notice(props) {
  return createPortal(<NoticeContent {...props} />, document.body);
}

function NoticeContent({ notice, onClose, onComplete }) {
  const [batch, setBatch] = useState("Node.js Afternoon");
  if (notice.type === "reset") return <MentorPasswordReset trainer={notice.trainer} onClose={onClose} onComplete={onComplete} />;
  if (notice.type === "assignment")
    return (
      <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onComplete(`${notice.trainer.name} assigned to ${batch}`);
          }}
          className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
        >
          <h3 className="font-semibold text-slate-900">Assign batch</h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose an available batch for {notice.trainer.name}. Schedule
            conflicts are checked before assignment.
          </p>
          <label className="mt-4 block text-xs font-semibold text-slate-700">
            Batch
            <select
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option>Node.js Afternoon</option>
              <option>Python Weekend</option>
              <option>Data Science Evening</option>
            </select>
          </label>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
              Assign batch
            </button>
          </div>
        </form>
      </div>
    );
  if (notice.type === "dialog")
    return (
      <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/45 p-4">
        <div
          role="alertdialog"
          className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
        >
          <div className="flex items-start justify-between">
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <button
              onClick={onClose}
              className="rounded p-1 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">{notice.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ⚠️ {notice.message}
          </p>
          <button
            onClick={onClose}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Understood
          </button>
        </div>
      </div>
    );
  return (
    <div
      role="status"
      className="fixed right-6 top-6 z-[180] flex max-w-sm items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl"
    >
      <UserCheck className="h-4 w-4 text-blue-300" />
      {notice.message}
    </div>
  );
}
