import PropTypes from "prop-types";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coffee,
  FileText,
  GraduationCap,
  Layers3,
  MonitorPlay,
  Radio,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  UsersRound,
  Video,
  UserX,
  Zap,
} from "lucide-react";
import "./org-dashboard.css";
import "./org-dashboard-learning.css";
import { ORG_BANNERS } from "../../constants/orgBanners";
import KPI from "@/components/common/KPI";
import { EmptyState, Panel, ProgressBar } from "./DashboardPanel";
import { show } from "./dashboardFormat";

/* ──────────────────────────────────────────────────────────────────────
   Organization dashboard — hero, KPI row and the learning/activity panels.
   Presentation only: every value comes from InstituteAdminDashboard's
   loader, and a value the APIs did not return renders as "—".
   ────────────────────────────────────────────────────────────────────── */

const DASHBOARD_ART = {
  learning: "/assets/Org/dashboard/learning-books.webp",
  live: "/assets/Org/dashboard/live-camera.webp",
};

function HeroArt() {
  return (
    <svg className="kd-hero__fallback" viewBox="0 0 520 240" aria-hidden="true" focusable="false">
      <ellipse cx="270" cy="222" rx="230" ry="14" fill="#cfe0f8" />
      <path d="M70 220 C40 170 50 120 92 96 C102 140 96 186 70 220 Z" fill="#7dc9a0" />
      <path d="M82 220 C84 170 108 140 140 132 C132 176 112 204 82 220 Z" fill="#4fb07f" />
      <rect x="110" y="190" width="120" height="18" rx="4" fill="#f39924" />
      <rect x="118" y="172" width="108" height="18" rx="4" fill="#e5484d" />
      <rect x="112" y="154" width="114" height="18" rx="4" fill="#2f6fe4" />
      <path d="M120 128 L170 110 L220 128 L170 146 Z" fill="#1c3f78" />
      <path d="M140 136 V150 C156 160 184 160 200 150 V136 L170 146 Z" fill="#244f96" />
      <rect x="236" y="54" width="190" height="124" rx="10" fill="#1c3f78" />
      <rect x="246" y="64" width="170" height="104" rx="5" fill="#eef4fd" />
      <path d="M264 110 L280 96 L292 104 L310 86 L322 92" stroke="#2f6fe4" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M222 178 H440 L452 192 H210 Z" fill="#9db6d8" />
    </svg>
  );
}

/**
 * Welcome banner. `actions` is extra controls rendered beside the primary
 * CTA (the page passes its Create menu); `today` carries the date chip.
 */
export function DashboardHero({ name, actions, today }) {
  return (
    <section className="kd-hero" aria-label="Welcome">
      <span className="kd-hero__dots is-top" aria-hidden="true" />
      <span className="kd-hero__dots is-bottom" aria-hidden="true" />
      <div className="kd-hero__copy">
        <p className="kd-hero__badge">Welcome back, {name}</p>
        <h1 className="kd-hero__title">
          Learn. Grow. Achieve.
          <br />
          Build a <span className="kd-hero__accent">Brighter Tomorrow.</span>
        </h1>
        <p className="kd-hero__sub">Discover industry-relevant courses, learn from expert mentors, and build skills for your future.</p>
        <div className="kd-hero__actions">
          {actions}
        </div>
      </div>
      <div className="kd-hero__visual" aria-hidden="true">
        <img
          src={ORG_BANNERS.dashboard.src}
          alt=""
          width="1400"
          height="503"
          draggable={false}
          decoding="async"
          fetchPriority="high"
          onError={(event) => { event.currentTarget.parentElement.dataset.failed = "1"; }}
        />
        <HeroArt />
      </div>
      <figure className="kd-hero__quote">
        <blockquote>“Education today, better opportunities tomorrow.”</blockquote>
      </figure>
      {today && (
        <div className="kd-hero__today">
          <CalendarDays aria-hidden="true" className="kd-hero__today-icon" />
          <span className="kd-hero__today-copy">
            <b>{today.date}</b>
            <small>{today.greeting}</small>
          </span>
          <button
            type="button"
            className="kd-hero__refresh"
            onClick={today.onRefresh}
            disabled={today.refreshing}
            aria-label={`Refresh dashboard. Last updated ${today.updated}`}
            title={`Last updated ${today.updated}`}
          >
            <RefreshCw aria-hidden="true" className={today.refreshing ? "is-spinning" : ""} />
          </button>
        </div>
      )}
    </section>
  );
}

const KPI_STYLE = {
  students: ["blue", Users],
  active: ["green", GraduationCap],
  inactive: ["orange", UserX],
  mentors: ["purple", UsersRound],
  courses: ["red", BookOpen],
  employees: ["blue", UsersRound],
};

/** items: [{ key, label, value, note, path, trend? }] — trend only when history exists. */
export function DashboardKpis({ items, onOpen }) {
  return (
    <section className="kd-kpis" aria-label="Organization metrics">
      {items.map((item) => {
        const [tone, Icon] = KPI_STYLE[item.key] ?? ["blue", Users];
        return (
          <KPI
            key={item.key}
            label={item.label}
            value={show(item.value)}
            description={item.note}
            icon={Icon}
            accent={tone}
            trend={item.trend}
            trendType={item.trend ? "positive" : undefined}
            onClick={item.path ? () => onOpen(item.path) : undefined}
          />
        );
      })}
    </section>
  );
}

const classAppearance = (item) => {
  const category = `${item.course ?? ""} ${item.title ?? ""}`.toLowerCase();
  if (item.state === "live") return [Radio, "red"];
  if (/security|cyber/.test(category)) return [ShieldCheck, "green"];
  if (/java\b/.test(category)) return [Coffee, "orange"];
  if (/python|data/.test(category)) return [UsersRound, "blue"];
  return [Video, "purple"];
};

/** classes: [{ id, title, batch, mentor, dateLabel, date, time, state }] */
export function UpcomingClassesCard({ classes, onViewAll, onJoin, onSchedule }) {
  return (
    <Panel className="kd-upcoming" icon={CalendarDays} title="Upcoming Classes" action={{ label: "View All", onClick: onViewAll }}>
      {classes.length ? (
        <ul className="kd-list">
          {classes.slice(0, 4).map((item) => {
            const [Icon, tone] = classAppearance(item);
            return (
              <li key={item.id}>
                <button type="button" className="kd-list__row" onClick={() => onJoin?.(item)} aria-label={`${item.state === "live" ? "Join" : "View"} ${item.title}`}>
                  <span className={`kd-chip is-${tone}`} aria-hidden="true"><Icon /></span>
                  <span className="kd-list__copy">
                    <b title={item.title}>{item.title}</b>
                    <small>{item.batch || "Batch not provided"} • {item.mentor}</small>
                  </span>
                  <span className="kd-list__when">
                    <span>{item.dateLabel || "Date unavailable"}</span>
                    <time dateTime={item.date}>{item.time}</time>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState icon={CalendarDays} text="No upcoming classes scheduled." />
      )}
      <div className="kd-panel__footer">
        <button type="button" className="kd-soft-btn is-blue" onClick={onSchedule ?? onViewAll}>Schedule a Class</button>
      </div>
    </Panel>
  );
}

/** progress: { completed, inProgress, notStarted, overall, current: { name, value }, unreported } */
export function LearningProgressCard({ progress, onViewAll }) {
  const total = progress.completed + progress.inProgress + progress.notStarted;
  const pct = (value) => (total ? (value / total) * 100 : 0);
  const completedEnd = pct(progress.completed);
  const progressEnd = completedEnd + pct(progress.inProgress);
  const ring = total
    ? `conic-gradient(var(--kd-blue) 0 ${completedEnd}%, var(--kd-orange) ${completedEnd}% ${progressEnd}%, #c7d6ea ${progressEnd}% 100%)`
    : "conic-gradient(#e4ebf4 0 100%)";
  return (
    <Panel className="kd-learning" icon={TrendingUp} title="Learning Progress" action={{ label: "View All", onClick: onViewAll }}>
      <div className="kd-progress">
        <div
          className="kd-donut"
          style={{ background: ring }}
          role="img"
          aria-label={`Overall progress ${progress.overall == null ? "unavailable" : `${progress.overall} percent`}`}
        >
          <span><b>{progress.overall == null ? "—" : `${progress.overall}%`}</b><small>Overall Progress</small></span>
        </div>
        <ul className="kd-legend">
          <li><i className="is-blue" /><span>Completed</span><b>{show(progress.completed)}</b></li>
          <li><i className="is-orange" /><span>In Progress</span><b>{show(progress.inProgress)}</b></li>
          <li><i className="is-gray" /><span>Not Started</span><b>{show(progress.notStarted)}</b></li>
        </ul>
      </div>
      <div className="kd-current">
        <div className="kd-current__copy">
          <p>Currently Learning</p>
          {progress.current ? (
            <div className="kd-current__row">
              <b title={progress.current.name}>{progress.current.name}</b>
              <span className="kd-current__meter">
                <ProgressBar value={progress.current.value} label={`${progress.current.name}: ${progress.current.value}%`} />
                <b>{progress.current.value}%</b>
              </span>
            </div>
          ) : <small>No course progress recorded yet.</small>}
          {progress.unreported > 0 && <small className="kd-current__note">Progress unavailable for {progress.unreported} enrollment{progress.unreported === 1 ? "" : "s"}.</small>}
        </div>
        <img className="kd-current__art" src={DASHBOARD_ART.learning} width="125" height="125" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </div>
    </Panel>
  );
}

/** session: { title, subtitle, mentor, start, duration, participants, state } | null */
export function LiveSessionCard({ session, onView, onDetails, onJoin }) {
  return (
    <Panel className="kd-session" icon={Radio} tone="red" title="Live Class / Current Session" action={{ label: "View All", onClick: onView }}>
      {session ? (
        <>
          <div className="kd-live">
            {session.state === "live" && <span className="kd-live__badge"><i />LIVE</span>}
            <MonitorPlay className="kd-live__icon" aria-hidden="true" />
            <b>{session.title}</b>
            {session.subtitle && <span>{session.subtitle}</span>}
          </div>
          <dl className="kd-live__meta">
            <div><Users aria-hidden="true" /><dt>Mentor</dt><dd>{show(session.mentor)}</dd></div>
            <div><Clock aria-hidden="true" /><dt>{session.state === "live" ? "Started at" : "Starts at"}</dt><dd>{show(session.start)}</dd></div>
            <div><CalendarDays aria-hidden="true" /><dt>Duration</dt><dd>{show(session.duration)}</dd></div>
            <div><UsersRound aria-hidden="true" /><dt>Participants</dt><dd>{show(session.participants)}</dd></div>
          </dl>
          <div className="kd-live__actions">
            <button type="button" className="kd-btn is-outline" onClick={onDetails}>View Details</button>
            <button type="button" className="kd-btn is-primary" onClick={onJoin}>
              {session.state === "live" ? "Join Live Class" : "Open Class"} <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </>
      ) : (
        <EmptyState
          art={DASHBOARD_ART.live}
          text="No live or upcoming session right now."
          action={{ label: "Go to Live Classes", onClick: onView, tone: "red" }}
        />
      )}
    </Panel>
  );
}

const QUICK_ACTIONS = [
  ["Create Course", "Add a new course", BookOpen, "orange", "/organization/courses?create=true"],
  ["Create Batch", "Schedule a batch", Layers3, "blue", "/organization/batches?create=true"],
  ["Schedule Live Class", "Plan a live session", Video, "purple", "/organization/live-classes?create=true"],
  ["Upload Material", "Share study resources", Upload, "green", "/organization/course-materials?upload=true"],
  ["Create Assessment", "Add quiz or assignment", FileText, "red", "/organization/assessments?create=true"],
  ["Generate Certificate", "Issue certificates", Award, "violet", "/organization/certificates"],
];

export function QuickActions({ onOpen }) {
  return (
    <Panel className="kd-quick" icon={Zap} tone="orange" title="Quick Actions" aria-label="Quick actions">
      <div className="kd-quick__grid">
        {QUICK_ACTIONS.map(([label, sub, Icon, tone, path]) => (
          <button key={label} type="button" className={`kd-quick__item is-${tone}`} onClick={() => onOpen(path)}>
            <span className={`kd-chip is-${tone} is-solid`} aria-hidden="true"><Icon /></span>
            <span className="kd-quick__copy"><b>{label}</b><small>{sub}</small></span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/** rows: [{ batch, students, attendance, assessments, progress }] */
export function BatchPerformanceCard({ rows, onViewAll }) {
  // Only show the Assessments column when at least one batch reports it.
  const showAssessments = rows.some((row) => row.assessments != null);
  return (
    <Panel icon={Layers3} title="Batch Performance" action={{ label: "View All", onClick: onViewAll }} bodyClassName="is-flush">
      <div className="kd-table-wrap">
        <table className="kd-table" data-table-header="plain">
          <thead>
            <tr>
              <th scope="col">Batch</th>
              <th scope="col">Students</th>
              <th scope="col">Attendance</th>
              {showAssessments && <th scope="col">Assessments</th>}
              <th scope="col">Progress</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 5).map((row) => (
              <tr key={row.batch}>
                <td className="is-strong" title={row.batch}>{row.batch}</td>
                <td>{row.students}</td>
                <td>{row.attendance == null ? "—" : `${row.attendance}%`}</td>
                {showAssessments && <td>{row.assessments == null ? "—" : `${row.assessments}%`}</td>}
                <td>
                  <span className="kd-meter">
                    <ProgressBar value={row.progress ?? 0} label={`${row.batch} progress ${row.progress ?? 0}%`} />
                    <b>{row.progress ?? 0}%</b>
                  </span>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={showAssessments ? 5 : 4} className="kd-table__empty">No batches yet. Create a batch to track attendance and progress here.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const ACTIVITY_ICONS = {
  student: [UserPlus, "orange"],
  employee: [Users, "green"],
  mentor: [UsersRound, "purple"],
  batch: [Layers3, "blue"],
  course: [BookOpen, "blue"],
  assignment: [FileText, "green"],
  class: [Video, "red"],
  payment: [CheckCircle2, "green"],
};

// Formatted creation time, or "" when the API gave no valid timestamp (the
// row then shows no date rather than an invented one).
const activityStamp = (item) => {
  const parsed = item.timestamp ? new Date(item.timestamp) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";
  const date = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(parsed);
  const hasTime = typeof item.timestamp === "string" ? /T\d{2}:\d{2}/.test(item.timestamp) : true;
  return hasTime
    ? `${date}, ${new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(parsed).toUpperCase()}`
    : date;
};

/** items: the latest activities, newest first: [{ key, type, text, detail, timestamp, path }] */
export function RecentActivityCard({ items, unavailable = false, onViewAll, onOpen }) {
  return (
    <Panel icon={BadgeCheck} title="Recent Activity" action={{ label: "View All", onClick: onViewAll }}>
      {items.length ? (
        <ol className="kd-activity">
          {items.slice(0, 5).map((item, index) => {
            const [Icon, tone] = ACTIVITY_ICONS[item.type] ?? [CheckCircle2, "blue"];
            const stamp = activityStamp(item);
            return (
              <li key={item.key ?? `${item.text}-${index}`}>
                <span className={`kd-chip is-round is-${tone}`} aria-hidden="true"><Icon /></span>
                <button type="button" className="kd-activity__copy" onClick={() => onOpen(item.path || "/organization/notifications")}>
                  <b title={item.text}>{item.text}</b>
                  {item.detail && <small className="kd-activity__detail">{item.detail}</small>}
                  {stamp && <time dateTime={new Date(item.timestamp).toISOString()}>{stamp}</time>}
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <EmptyState icon={BadgeCheck} text="No recent activity. New enrollments, batches and classes appear here." />
      )}
      {unavailable && <p className="kd-activity__notice" role="status">Notifications couldn’t be loaded; showing organization records only.</p>}
    </Panel>
  );
}

/** certificates: { count, inProgress, thisMonth, recent: [{ title, name, time }] } */
export function CertificatesCard({ certificates, onViewAll, onGenerate }) {
  const stats = [
    ["Certificates Issued", certificates.count, "orange", Award],
    ["In Progress", certificates.inProgress, "blue", Clock],
    ["This Month", certificates.thisMonth, "green", CalendarDays],
  ];
  return (
    <Panel icon={Award} tone="purple" title="Certificates & Achievements" action={{ label: "View All", onClick: onViewAll }}>
      <div className="kd-stats">
        {stats.map(([label, value, tone, Icon]) => (
          <div key={label} className={`kd-stat is-${tone}`}>
            <span className="kd-stat__top">
              <span className={`kd-chip is-small is-${tone}`} aria-hidden="true"><Icon /></span>
              <b>{show(value)}</b>
            </span>
            <small>{label}</small>
          </div>
        ))}
      </div>
      <p className="kd-subhead">Recent Certificates</p>
      {certificates.recent.length ? (
        <ul className="kd-cert-list">
          {certificates.recent.slice(0, 3).map((item, index) => (
            <li key={`${item.title}-${index}`}>
              <FileText aria-hidden="true" />
              <span><b>{item.title}</b><small>{item.name}</small></span>
              <time>{item.time}</time>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={FileText}
          text="No certificates issued yet."
          action={{ label: "Generate Certificate", onClick: onGenerate ?? onViewAll }}
        />
      )}
    </Panel>
  );
}

DashboardHero.propTypes = {
  name: PropTypes.string.isRequired,
  actions: PropTypes.node,
  today: PropTypes.shape({
    date: PropTypes.string,
    greeting: PropTypes.string,
    updated: PropTypes.string,
    refreshing: PropTypes.bool,
    onRefresh: PropTypes.func,
  }),
};
DashboardKpis.propTypes = { items: PropTypes.array.isRequired, onOpen: PropTypes.func.isRequired };
UpcomingClassesCard.propTypes = { classes: PropTypes.array.isRequired, onViewAll: PropTypes.func, onJoin: PropTypes.func, onSchedule: PropTypes.func };
LearningProgressCard.propTypes = { progress: PropTypes.object.isRequired, onViewAll: PropTypes.func };
LiveSessionCard.propTypes = { session: PropTypes.object, onView: PropTypes.func, onDetails: PropTypes.func, onJoin: PropTypes.func };
QuickActions.propTypes = { onOpen: PropTypes.func.isRequired };
BatchPerformanceCard.propTypes = { rows: PropTypes.array.isRequired, onViewAll: PropTypes.func };
RecentActivityCard.propTypes = { items: PropTypes.array.isRequired, unavailable: PropTypes.bool, onViewAll: PropTypes.func, onOpen: PropTypes.func };
CertificatesCard.propTypes = { certificates: PropTypes.object.isRequired, onViewAll: PropTypes.func, onGenerate: PropTypes.func };
