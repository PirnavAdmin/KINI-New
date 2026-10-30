import { AlertCircle, ArrowUpRight, BookOpen, CheckCircle2, Compass, Sparkles } from "lucide-react";

const Section = ({ title, icon: Icon, children }) => (
  <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)] dark:border-slate-800 dark:bg-slate-950">
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#085FA7]/10 text-[#085FA7] dark:text-cyan-300">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
    </div>
    {children}
  </section>
);

const StatusDot = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
      status === "ok"
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
        : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${status === "ok" ? "bg-emerald-500" : "bg-rose-500"}`} />
    {status === "ok" ? "Loaded" : "Unavailable"}
  </span>
);

const List = ({ items = [] }) => (
  <div className="space-y-2">
    {items.length ? items.map((item) => (
      <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
          {item.path ? <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{item.path}</p> : null}
        </div>
        <ArrowUpRight className="h-4 w-4 text-slate-300" />
      </div>
    )) : (
      <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">No live data available yet.</p>
    )}
  </div>
);

export default function ConversationSidebar({ context }) {
  const liveData = context?.liveData || {};
  const navigationHints = context?.navigationHints || [];
  const sources = context?.sourceStatus || [];
  const session = context?.session || {};
  const intent = context?.intent?.primary || "general";
  const selectedCourse = context?.selectedCourse || null;
  const selectedMentor = context?.selectedMentor || null;
  const learningGoal = context?.learningGoal || "";
  const careerGoal = context?.careerGoal || "";
  const language = context?.language || "en";

  const coursesCount = liveData.courses?.count ?? 0;
  const assessmentsCount = liveData.assessments?.count ?? 0;
  const profileReady = Boolean(session.user?.fullName || session.user?.email);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto p-3">
      <section className="rounded-[1.6rem] border border-slate-200 bg-gradient-to-br from-[#085FA7] via-[#0A6BB5] to-[#5CA347] p-4 text-white shadow-[0_20px_45px_rgba(8,95,167,0.22)] dark:border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">Live backend</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Kini Copilot</h2>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/82">
          Intelligent, role-aware answers powered by your real platform data and the AI backend.
        </p>
      </section>

      <Section title="Session snapshot" icon={Compass}>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Intent</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{intent}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Role</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{session.role || "guest"}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Courses</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{coursesCount}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Assessments</p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{assessmentsCount}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900">
          <span className={`h-2.5 w-2.5 rounded-full ${profileReady ? "bg-emerald-500" : "bg-amber-500"}`} />
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {profileReady ? "Profile context loaded from the live API" : "Profile context not available in this session"}
          </p>
        </div>
      </Section>

      <Section title="Assistant memory" icon={Sparkles}>
        <div className="space-y-2">
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Selected course</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
              {selectedCourse?.title || selectedCourse?.name || "None yet"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Current mentor</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
              {selectedMentor?.name || selectedMentor?.fullName || "None yet"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Learning goal</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
              {learningGoal || "Not set"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Career goal</p>
            <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
              {careerGoal || "Not set"}
            </p>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">Language</span>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              {language}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Recommended actions" icon={BookOpen}>
        <List items={navigationHints} />
      </Section>

      <Section title="API health" icon={CheckCircle2}>
        <div className="space-y-2">
          {sources.map((source) => (
            <div key={source.key} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2.5 dark:bg-slate-900">
              <div>
                <p className="text-sm font-medium capitalize text-slate-900 dark:text-white">{source.key.replace(/([A-Z])/g, " $1")}</p>
                {source.message ? <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{source.message}</p> : null}
              </div>
              <StatusDot status={source.status} />
            </div>
          ))}
          {!sources.length ? (
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              No API activity yet
            </div>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
