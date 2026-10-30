import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  RefreshCw,
  TicketCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@shared/hooks/useAuth";

function getTimeGreeting(date) {
  const hour = date.getHours();
  if (hour < 12) return { label: "Good morning", emoji: "☀️" };
  if (hour < 17) return { label: "Good afternoon", emoji: "👋" };
  if (hour < 21) return { label: "Good evening", emoji: "🌇" };
  return { label: "Good night", emoji: "🌙" };
}

const KPI_DATA = [
  {
    label: "Students",
    value: 1248,
    note: "+12 today",
    icon: GraduationCap,
    path: "/organization/students",
    color: "blue",
  },
  {
    label: "Mentors",
    value: 24,
    note: "2 on leave",
    icon: Users,
    path: "/organization/mentors",
    color: "violet",
  },
  {
    label: "Courses",
    value: 18,
    note: "3 draft",
    icon: BookOpen,
    path: "/organization/courses",
    color: "cyan",
  },
  {
    label: "Classes today",
    value: 12,
    note: "8 live",
    icon: CalendarDays,
    path: "/organization/live-classes",
    color: "emerald",
  },
  {
    label: "Pending",
    value: 7,
    note: "⚠ urgent",
    icon: ClipboardCheck,
    path: "/organization/students",
    color: "amber",
  },
];

const CLASSES = [
  {
    batch: "React Morning Batch",
    time: "10:00–11:30 AM",
    trainer: "Rahul",
    students: "28/30",
    state: "live",
    status: "Live now",
    action: "View attendance",
  },
  {
    batch: "Node.js Afternoon",
    time: "2:00–3:30 PM",
    trainer: "Priya",
    students: "22/25",
    state: "upcoming",
    status: "Starts in 4h",
    action: "View schedule",
  },
  {
    batch: "Python Basics",
    time: "11:00–12:30 PM",
    trainer: null,
    students: "—",
    state: "issue",
    status: "No mentor",
    action: "Assign mentor",
  },
  {
    batch: "Data Science Eve",
    time: "6:00–7:30 PM",
    trainer: "Ankit",
    students: "18/20",
    state: "upcoming",
    status: "Upcoming",
    action: "View schedule",
  },
];

const REGISTRATIONS = [
  {
    id: 1,
    name: "Anjali Sharma",
    course: "Full Stack Dev",
    time: "2 hours ago",
    docs: ["ID ✓", "Photo ✓", "Cert ✕"],
  },
  {
    id: 2,
    name: "Kiran Mehta",
    course: "Data Science",
    time: "3 hours ago",
    docs: ["ID ✓", "Photo ✓", "Cert ✓"],
  },
  {
    id: 3,
    name: "Rohan Verma",
    course: "UI/UX Design",
    time: "5 hours ago",
    docs: ["ID ✕", "Photo ✓", "Cert ✕"],
  },
];

const ATTENDANCE = [
  { day: "Wed", present: 1132, absent: 116 },
  { day: "Thu", present: 1155, absent: 93 },
  { day: "Fri", present: 1098, absent: 150 },
  { day: "Sat", present: 1180, absent: 68 },
  { day: "Sun", present: 1044, absent: 204 },
  { day: "Mon", present: 1168, absent: 80 },
  { day: "Tue", present: 1192, absent: 56 },
];

const PROGRESS = [
  { name: "On track", value: 68, color: "#10B981" },
  { name: "Needs attention", value: 22, color: "#F59E0B" },
  { name: "At risk", value: 10, color: "#EF4444" },
];

const REGISTRATION_TREND = [
  { day: "1", value: 18 },
  { day: "5", value: 31 },
  { day: "9", value: 27 },
  { day: "13", value: 46 },
  { day: "17", value: 42 },
  { day: "21", value: 59 },
  { day: "25", value: 54 },
  { day: "29", value: 73 },
];

const AT_RISK = [
  {
    name: "Pooja Singh",
    course: "Full Stack Dev",
    attendance: 42,
    progress: 35,
    active: "8 days ago",
  },
  {
    name: "Arjun Kumar",
    course: "Data Science",
    attendance: 55,
    progress: 48,
    active: "5 days ago",
  },
  {
    name: "Meera Nair",
    course: "React Course",
    attendance: 48,
    progress: 52,
    active: "3 days ago",
  },
];

const ACTIVITIES = [
  {
    icon: Award,
    message: "Certificate issued to Kavya Patel",
    time: "8 min ago",
    tone: "violet",
    path: "/organization/certificates",
  },
  {
    icon: UserCheck,
    message: "Student registration approved",
    time: "24 min ago",
    tone: "emerald",
    path: "/organization/students",
  },
  {
    icon: AlertTriangle,
    message: "Mentor marked absent for Python Basics",
    time: "42 min ago",
    tone: "rose",
    path: "/organization/attendance",
  },
  {
    icon: ClipboardCheck,
    message: "React assessment published",
    time: "1 hour ago",
    tone: "blue",
  },
  {
    icon: UserPlus,
    message: "12 students imported into Batch FS-24",
    time: "2 hours ago",
    tone: "cyan",
  },
  {
    icon: TicketCheck,
    message: "Support ticket #TA-204 resolved",
    time: "3 hours ago",
    tone: "amber",
  },
  {
    icon: Award,
    message: "Certificate issued to Rohan Mehta",
    time: "4 hours ago",
    tone: "violet",
  },
  {
    icon: UserCheck,
    message: "Student Anjali Sharma approved",
    time: "5 hours ago",
    tone: "emerald",
  },
  {
    icon: AlertTriangle,
    message: "Mentor absence acknowledged by admin",
    time: "Yesterday",
    tone: "rose",
  },
  {
    icon: ClipboardCheck,
    message: "Data Science assessment published",
    time: "Yesterday",
    tone: "blue",
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    group: "Today",
    icon: AlertTriangle,
    message: "Python Basics needs a mentor assignment",
    time: "12 min ago",
    unread: true,
    tone: "rose",
  },
  {
    id: 2,
    group: "Today",
    icon: ClipboardCheck,
    message: "7 student registrations await approval",
    time: "34 min ago",
    unread: true,
    tone: "amber",
  },
  {
    id: 3,
    group: "Today",
    icon: CalendarDays,
    message: "React Morning Batch is live now",
    time: "1 hour ago",
    unread: true,
    tone: "emerald",
  },
  {
    id: 4,
    group: "Yesterday",
    icon: BookOpen,
    message: "Monthly attendance report is ready",
    time: "Yesterday, 5:20 PM",
    unread: false,
    tone: "blue",
  },
  {
    id: 5,
    group: "This Week",
    icon: Users,
    message: "Student subscription usage reached 87%",
    time: "Monday",
    unread: true,
    tone: "violet",
  },
];

const toneStyles = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const steps = 28;
    let current = 0;
    const timer = window.setInterval(() => {
      current += 1;
      setValue(Math.round((target * current) / steps));
      if (current >= steps) window.clearInterval(timer);
    }, duration / steps);
    return () => window.clearInterval(timer);
  }, [target, duration]);
  return value;
}

function KpiCard({ item, onOpen }) {
  const count = useCountUp(item.value);
  const Icon = item.icon;
  return (
    <button
      onClick={() => onOpen(item.path)}
      className="group rounded-md border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-500"
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {item.label}
        </span>
        <span className={`rounded-md p-1.5 ring-1 ${toneStyles[item.color]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 font-mono text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
        {count.toLocaleString("en-IN")}
      </p>
      <div className="mt-0.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400">{item.note}</span>
        <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-slate-600" />
      </div>
    </button>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
  onClick,
  navigationLabel,
}) {
  const handleKeyDown = (event) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onClick();
  };

  return (
    <section
      className={`rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${
        onClick
          ? "cursor-pointer touch-manipulation transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          : ""
      } ${className}`}
      onClickCapture={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "link" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? navigationLabel || `Open ${title}` : undefined}
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-slate-700">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div aria-label="Loading dashboard" aria-busy="true" className="space-y-4">
      <div className="h-20 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="h-96 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 lg:col-span-3" />
        <div className="h-96 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
      <span className="sr-only">Loading dashboard content</span>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approvals, setApprovals] = useState(REGISTRATIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [message, setMessage] = useState("");
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [lastUpdatedAt, setLastUpdatedAt] = useState(() => new Date());

  const greeting = getTimeGreeting(currentTime);
  const adminName =
    user?.firstName || user?.name?.split(" ")?.[0] || "Admin";
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(currentTime);
  const updatedMinutes = Math.max(
    0,
    Math.floor((currentTime.getTime() - lastUpdatedAt.getTime()) / 60000),
  );
  const updatedLabel =
    updatedMinutes === 0
      ? "Updated just now"
      : `Updated ${updatedMinutes} min${updatedMinutes === 1 ? "" : "s"} ago`;

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => setMessage(""), 2500);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const close = (event) => event.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  const unreadCount = notifications.filter((item) => item.unread).length;
  const groupedNotifications = useMemo(
    () =>
      ["Today", "Yesterday", "This Week"].map((group) => ({
        group,
        items: notifications.filter((item) => item.group === group),
      })),
    [notifications],
  );
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      const updatedAt = new Date();
      setLastUpdatedAt(updatedAt);
      setCurrentTime(updatedAt);
      setMessage("Dashboard updated");
    }, 700);
  };
  const approve = (person) => {
    setApprovals((items) => items.filter((item) => item.id !== person.id));
    setMessage(`${person.name} approved`);
  };
  const openClassAction = (item) => {
    navigate(
      item.state === "issue"
        ? "/organization/mentors"
        : item.state === "live"
          ? "/organization/attendance"
          : "/organization/live-classes",
    );
  };

  if (loading)
    return (
      <main className="min-h-full bg-slate-50 font-sans dark:bg-slate-950">
        <DashboardSkeleton />
      </main>
    );

  return (
    <main className="min-h-full bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-[1600px] space-y-3">
        <section className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:flex-row lg:items-center">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-600 via-cyan-500 to-emerald-400"
          />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Kini Edx Hub
            </p>
            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 dark:text-white sm:text-xl">
              {greeting.label}, {adminName}{" "}
              <span aria-hidden="true">{greeting.emoji}</span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {formattedDate} · Here’s what needs your attention today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/organization/students")}
              className="inline-flex h-8 items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <UserPlus className="h-4 w-4" />
              Add student
            </button>
            <button
              onClick={() => navigate("/organization/batches")}
              className="inline-flex h-8 items-center gap-1.5 rounded border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <CalendarDays className="h-4 w-4" />
              New batch
            </button>
            <button
              onClick={refresh}
              disabled={refreshing}
              aria-label="Refresh dashboard"
              className="ml-1 inline-flex h-8 items-center gap-1.5 rounded px-2 text-[11px] text-slate-500 hover:bg-slate-100 disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              {updatedLabel}
            </button>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={`Open notifications, ${unreadCount} unread`}
              className="relative ml-1 grid h-8 w-8 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </section>


        <section
          aria-label="Key performance indicators"
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5"
        >
          {KPI_DATA.map((item) => (
            <KpiCard key={item.label} item={item} onOpen={navigate} />
          ))}
        </section>

        <div className="grid gap-3.5 lg:grid-cols-5">
          <Panel
            title="Today’s classes"
            subtitle="12 scheduled · 8 currently live"
            className="lg:col-span-3"
            action={
              <button
                onClick={() => navigate("/organization/live-classes")}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Full schedule →
              </button>
            }
          >
            {CLASSES.length === 0 ? (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">
                    No classes scheduled.
                  </p>
                  <button
                    onClick={() => navigate("/organization/live-classes")}
                    className="mt-3 text-sm font-semibold text-blue-600"
                  >
                    Create schedule
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {CLASSES.map((item) => (
                  <div
                    key={item.batch}
                    className="grid min-h-[56px] gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${item.state === "live" ? "bg-emerald-500 ring-4 ring-emerald-100" : item.state === "issue" ? "bg-red-500 ring-4 ring-red-100" : "bg-amber-400 ring-4 ring-amber-100"}`}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {item.batch}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.state === "live" ? "bg-emerald-50 text-emerald-700" : item.state === "issue" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.time} ·{" "}
                          {item.trainer
                            ? `Mentor: ${item.trainer}`
                            : "No mentor assigned"}{" "}
                          · {item.students} students
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openClassAction(item)}
                      className={`h-8 rounded border px-3 text-xs font-semibold ${item.state === "issue" ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"}`}
                    >
                      {item.action}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Pending approvals"
            subtitle={`${approvals.length} shown · 7 total awaiting review`}
            className="lg:col-span-2"
          >
            {approvals.length === 0 ? (
              <div className="grid min-h-72 place-items-center p-6 text-center">
                <div>
                  <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-500" />
                  <p className="mt-3 font-semibold text-slate-800">
                    All caught up!
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    There are no pending approvals.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {approvals.map((person) => (
                  <div
                    key={person.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-2 px-4 py-2"
                  >
                    <div className="col-span-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {person.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {person.course} · {person.time}
                        </p>
                      </div>
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                        Pending
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {person.docs.map((doc) => (
                        <span
                          key={doc}
                          className={`rounded px-1.5 py-0.5 text-[9px] ${doc.endsWith("✓") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 flex gap-1.5">
                      <button
                        onClick={() => approve(person)}
                        className="inline-flex h-6 items-center gap-1 rounded bg-slate-900 px-2 text-[10px] font-semibold text-white hover:bg-slate-700"
                      >
                        <Check className="h-2.5 w-2.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => navigate("/organization/students")}
                        className="h-6 rounded border border-slate-200 px-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate("/organization/students")}
              className="w-full border-t border-slate-100 px-4 py-2 text-left text-[11px] font-semibold text-blue-600 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
            >
              View all (7) →
            </button>
          </Panel>
        </div>

        <div className="grid gap-3.5 lg:grid-cols-3">
          <Panel
            title="Attendance · last 7 days"
            subtitle="Present compared with absent"
            onClick={() => navigate("/organization/attendance")}
            navigationLabel="Open attendance records"
            action={<ChevronRight className="h-4 w-4 text-slate-400" />}
          >
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ATTENDANCE} barGap={2}>
                  <CartesianGrid stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="present" fill="#10B981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="absent" fill="#FCA5A5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 px-5 pb-4 text-xs text-slate-500">
              <span>
                <i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Present
              </span>
              <span>
                <i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-red-300" />
                Absent
              </span>
            </div>
          </Panel>
          <Panel
            title="Student progress"
            subtitle="Current learning health"
            onClick={() => navigate("/organization/students")}
            navigationLabel="Open student progress records"
            action={<ChevronRight className="h-4 w-4 text-slate-400" />}
          >
            <div className="relative h-56 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROGRESS}
                    dataKey="value"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {PROGRESS.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="mt-3 text-center">
                  <p className="font-mono text-2xl font-semibold text-slate-900">
                    68%
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    On track
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3 px-4 pb-4">
              {PROGRESS.map((item) => (
                <span key={item.name} className="text-xs text-slate-500">
                  <i
                    className="mr-1.5 inline-block h-2 w-2 rounded-full"
                    style={{ background: item.color }}
                  />
                  {item.name} {item.value}%
                </span>
              ))}
            </div>
          </Panel>
          <Panel
            title="New registrations"
            subtitle="Daily registrations · August"
            onClick={() => navigate("/organization/students")}
            navigationLabel="Open new student registrations"
            action={<ChevronRight className="h-4 w-4 text-slate-400" />}
          >
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={REGISTRATION_TREND}>
                  <CartesianGrid stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    fontSize={11}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Registrations"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#fff", strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="grid items-start gap-3 lg:grid-cols-5">
          <Panel
            title="At-risk students"
            subtitle="Requires proactive intervention"
            className="overflow-hidden lg:col-span-3"
            action={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          >
            {AT_RISK.length === 0 ? (
              <div className="grid min-h-64 place-items-center p-6 text-sm text-slate-500">
                All students are on track 🎉
              </div>
            ) : (
              <div className="overflow-x-auto lg:overflow-x-visible">
                <table className="w-full min-w-[640px] table-fixed text-left text-xs lg:min-w-0">
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[19%]" />
                    <col className="w-[18%]" />
                    <col className="w-[16%]" />
                    <col className="w-[18%]" />
                    <col className="w-[11%]" />
                  </colgroup>
                  <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      {[
                        "Name",
                        "Course",
                        "Attendance",
                        "Progress",
                        "Last active",
                        "Action",
                      ].map((head) => (
                        <th key={head} className="px-3 py-2.5 font-semibold first:pl-4 last:pr-4">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {AT_RISK.map((student) => (
                      <tr
                        key={student.name}
                        onClick={() => navigate("/organization/students")}
                        tabIndex={0}
                        role="link"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            navigate("/organization/students");
                          }
                        }}
                        className={
                          student.attendance < 50
                            ? "cursor-pointer bg-red-50/70 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                            : "cursor-pointer transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                        }
                      >
                        <td className="truncate py-2.5 pl-4 pr-3 font-semibold text-slate-900">
                          {student.name}
                        </td>
                        <td className="truncate px-3 py-2.5 text-slate-600">
                          {student.course}
                        </td>
                        <td
                          className={`px-3 py-2.5 font-mono font-semibold ${student.attendance < 50 ? "text-red-600" : "text-amber-600"}`}
                        >
                          {student.attendance}%
                        </td>
                        <td className="px-3 py-2.5 font-mono">
                          {student.progress}%
                        </td>
                        <td className="truncate px-3 py-2.5 text-slate-500">
                          {student.active}
                        </td>
                        <td className="py-2.5 pl-3 pr-4 text-right">
                          <button
                            onClick={() => navigate("/organization/students")}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <button
              onClick={() => navigate("/organization/performance")}
              className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-semibold text-blue-600 hover:bg-slate-50"
            >
              View all at-risk →
            </button>
          </Panel>
          <Panel
            title="Recent activity"
            subtitle="Latest changes across your institute"
            className="lg:col-span-2"
          >
            <div className="divide-y divide-slate-100">
              {ACTIVITIES.slice(0, 3).map((item, index) => {
                const Icon = item.icon;
                return (
                    <button
                      type="button"
                      key={`${item.message}-${index}`}
                      onClick={() => navigate(item.path || "/organization/audit-log")}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 dark:hover:bg-slate-800/60"
                    >
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ring-1 ${toneStyles[item.tone]}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        {item.message}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {item.time}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => navigate("/organization/audit-log")}
              className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-xs font-semibold text-blue-600 hover:bg-slate-50"
            >
              View audit log →
            </button>
          </Panel>
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close notifications"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2
                  id="notifications-title"
                  className="font-semibold text-slate-900"
                >
                  Notifications
                </h2>
                <p className="text-xs text-slate-500">
                  {unreadCount} unread updates
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setNotifications((items) =>
                      items.map((item) => ({ ...item, unread: false })),
                    )
                  }
                  className="rounded px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                >
                  Mark all read
                </button>
                <button
                  autoFocus
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close notifications panel"
                  className="grid h-8 w-8 place-items-center rounded text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto">
              {groupedNotifications.map(({ group, items }) => (
                <section key={group} className="border-b border-slate-100">
                  <h3 className="bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {group}
                  </h3>
                  {items.map((item) => (
                    <NotificationItem
                      key={item.id}
                      item={item}
                      onRead={() =>
                        setNotifications((all) =>
                          all.map((notice) =>
                            notice.id === item.id
                              ? { ...notice, unread: false }
                              : notice,
                          ),
                        )
                      }
                    />
                  ))}
                </section>
              ))}
            </div>
          </aside>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          {message}
        </div>
      )}
    </main>
  );
}

function NotificationItem({ item, onRead }) {
  const Icon = item.icon;
  return (
    <div
      className={`flex gap-3 px-5 py-4 ${item.unread ? "bg-blue-50/50" : ""}`}
    >
      <span
        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 ${toneStyles[item.tone]}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">{item.message}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Clock3 className="h-3 w-3" />
            {item.time}
          </span>
          {item.unread && (
            <button
              onClick={onRead}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Mark Read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
