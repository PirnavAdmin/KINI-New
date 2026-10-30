import { notificationDestination } from "@shared/utils/notificationDestination";
import { useCallback, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Bell,
  User,
  Menu,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useThemeContext } from "@shared/context/ThemeContext";
import toast from "react-hot-toast";
import { useAuth } from "@shared/hooks/useAuth";
import { useCurrentUserPhoto } from "@shared/hooks/useProfilePhoto";
import { AvatarPhoto } from "@/components/common/ProfileImage";
import "@styles/chat-viewport.css";
import Sidebar from "@features/dashboard/components/Sidebar";
import "./header-search.css";
import { isHrModuleUser } from "@features/hr/constants/hrPermissions";
import useHrPermissions from "@features/hr/hooks/useHrPermissions";
import { getUserProfile, resolveUserId } from "@/services/profileService";
import { ROUTES } from "@shared/constants/routeConstants";
import { notificationService } from "@shared/services/notificationService";
import { normalizeNotificationTimestamp } from "@shared/services/localScheduleStore";
import { classScheduleNotification } from "@shared/utils/classScheduleNotification";

// ─── BREADCRUMB GENERATION ──────────────────────────────────────────────────

const BREADCRUMB_MAP = {
  "/super-admin/dashboard": ["Dashboard"],
  "/super-admin/organizations": ["Organizations"],
  "/super-admin/students": ["Students"],
  "/super-admin/employees": ["Employees"],
  "/super-admin/subscriptions": ["Subscriptions"],
  "/super-admin/courses": ["Courses"],
  "/super-admin/revenue": ["Revenue"],
  "/super-admin/roles-permissions": ["Roles & Permissions"],
  "/super-admin/analytics": ["Analytics"],
  "/super-admin/reports": ["Reports"],
  "/super-admin/governance": ["Access & Governance"],
  "/super-admin/settings": ["Settings"],
  "/super-admin/profile": ["Profile"],
  "/organization/dashboard": ["Organization", "Dashboard"],
  "/organization/employees": ["Organization", "Employees"],
  "/organization/tutors": ["Organization", "Mentors"],
  "/organization/students": ["Organization", "Students"],
  "/organization/branches": ["Organization", "Branches"],
  "/organization/teams": ["Organization", "Teams"],
  "/organization/mentors": ["Organization", "Mentors"],
  "/organization/courses": ["Organization", "Courses"],
  "/organization/batches": ["Organization", "Batches"],
  "/organization/batches/": ["Organization", "Batches", "Details"],
  "/organization/courses/": ["Organization", "Courses", "Details"],
  "/organization/live-classes": ["Organization", "Live Classes"],
  "/organization/attendance": ["Organization", "Attendance"],
  "/organization/certificates": ["Organization", "Certificates"],
  "/organization/recycle-bin": ["Organization", "Recycle Bin"],
  "/organization/designations": ["Organization", "Designations"],
  "/organization/levels": ["Organization", "Levels"],
  "/organization/skills": ["Organization", "Skills"],
  "/organization/skills/dashboard": ["Organization", "Skills", "Dashboard"],
  "/organization/skills/master": ["Organization", "Skills", "Skill Master"],
  "/organization/skills/matrix": ["Organization", "Skills", "Skill Matrix"],
  "/organization/skills/analytics": ["Organization", "Skills", "Analytics"],
  "/organization/competencies": ["Organization", "Competencies"],
  "/organization/assessments": ["Organization", "Assessments"],
  "/organization/learning": ["Organization", "Learning"],
  "/organization/goals": ["Organization", "Goals"],
  "/organization/performance": ["Organization", "Performance"],
  "/organization/career-paths": ["Organization", "Career Paths"],
  "/organization/ai-career-coach": ["Organization", "AI Career Coach"],
  "/organization/notifications": ["Organization", "Notifications"],
  "/organization/webinars": ["Organization", "Webinars & Meetings"],
  "/organization/reports": ["Organization", "Reports"],
  "/organization/settings": ["Organization", "Settings"],
  "/employee/hr-settings": ["Organization", "HR Settings"],
  "/employee/dashboard": ["HR Operations", "Dashboard"],
  "/employee/batches": ["Employee", "Batches"],
  "/employee/today-schedule": ["Employee", "Class Schedule"],
  "/employee/my-learning": ["Employee", "My Learning"],
  "/employee/live-classes": ["Employee", "Live Classes"],
  "/employee/recorded-sessions": ["Employee", "Recorded Sessions"],
  "/employee/assignments": ["Employee", "Assignments"],
  "/employee/assessments": ["Employee", "Assessments"],
  "/employee/attendance": ["Employee", "Attendance"],
  "/employee/performance": ["Employee", "Performance"],
  "/employee/skills": ["Employee", "My Skills"],
  "/employee/goals": ["Employee", "My Goals"],
  "/employee/career": ["Employee", "Career Path"],
  "/employee/ai-career-coach": ["Employee", "AI Career Coach"],
  "/employee/certificates": ["Employee", "Certificates"],
  "/employee/reports": ["Employee", "Reports"],
  "/employee/resources": ["Employee", "Resources"],
  "/employee/calendar": ["Employee", "Calendar"],
  "/employee/messages": ["Employee", "Messages"],
  "/employee/notifications": ["Employee", "Notifications"],
  "/employee/announcements": ["Employee", "Announcements"],
  "/employee/learning": ["Employee", "Learning"],
  "/employee/reviews": ["Employee", "Reviews"],
  "/employee/profile": ["Employee", "Profile"],
  "/employee/settings": ["Employee", "Settings"],
  "/mentor/dashboard": ["Mentor", "Dashboard"],
  "/mentor/courses": ["Mentor", "My Courses"],
  "/mentor/students": ["Mentor", "Students"],
  "/mentor/batches": ["Mentor", "My Batches"],
  "/mentor/live-classes": ["Mentor", "Live Classes"],
  "/mentor/recorded-sessions": ["Mentor", "Recorded Sessions"],
  "/mentor/assignments": ["Mentor", "Assignments"],
  "/mentor/assessments": ["Mentor", "Assessments"],
  "/mentor/performance": ["Mentor", "Performance"],
  "/mentor/calendar": ["Mentor", "Class Schedule"],
  "/mentor/webinars-meetings": ["Mentor", "Webinars & Meetings"],
  "/mentor/messages": ["Mentor", "Messages"],
  "/mentor/notifications": ["Mentor", "Notifications"],
  "/mentor/resources": ["Mentor", "Resources"],
  "/mentor/settings": ["Mentor", "Settings"],
  "/mentor/attendance": ["Mentor", "My Attendance"],
  "/mentor/leave": ["Mentor", "Leave Requests"],
  "/student/dashboard": ["Student", "Dashboard"],
  "/student/work-center": ["Student", "My Work Center"],
  "/student/my-classes": ["Student", "My Classes"],
  "/student/calendar": ["Student", "Calendar"],
  "/student/class-schedule": ["Student", "Class Schedule"],
  "/student/attendance": ["Student", "Attendance"],
  "/student/recordings": ["Student", "Recordings"],
  "/student/live-classes": ["Student", "My Classes"],
  "/student/courses": ["Student", "My Courses"],
  "/student/materials": ["Student", "Course Materials"],
  "/student/batch": ["Student", "My Batch"],
  "/student/learning-paths": ["Student", "Learning Paths"],
  "/student/progress": ["Student", "Progress"],
  "/student/assessments": ["Student", "Assessments"],
  "/student/certificates": ["Student", "Certificates"],
  "/student/jobs": ["Student", "Job Portal"],
  "/student/ai-career-coach": ["Student", "AI Career Coach"],
  "/student/notifications": ["Student", "Notifications"],
  "/student/payments": ["Student", "Payments"],
  "/student/mentor-chat": ["Student", "Mentor Chat"],
  "/student/profile": ["Student", "Profile"],
  "/student/settings": ["Student", "Settings"],
};

// ─── ROLE DETECTION ─────────────────────────────────────────────────────────

function detectRole(pathname) {
  if (pathname.startsWith("/super-admin")) return "super-admin";
  if (pathname.startsWith("/employee")) return "employee";
  if (pathname.startsWith("/mentor")) return "mentor";
  if (pathname.startsWith("/student")) return "student";
  return "org-admin";
}

const ROLE_LABELS = {
  "super-admin": {
    initials: "SA",
    label: "Super Admin",
    email: "admin@talentsphere.com",
  },
  "org-admin": {
    initials: "OC",
    label: "Organization",
    email: "org@kinieduhub.io",
  },
  employee: {
    initials: "ND",
    label: "Narendra",
    email: "narendra@kinieduhub.io",
  },
  mentor: { initials: "MN", label: "Mentor", email: "mentor@kinieduhub.io" },
  student: { initials: "ST", label: "Student", email: "student@kinieduhub.io" },
};

const notificationBadgeClass = (count) => {
  if (count <= 0) return "bg-slate-500";
  if (count < 10) return "bg-emerald-500";
  if (count < 50) return "bg-blue-600";
  if (count < 100) return "bg-orange-500";
  return "bg-red-500";
};

function getUserDisplayInfo(user, role) {
  const fallback = role === "super-admin"
    ? ROLE_LABELS["super-admin"]
    : (ROLE_LABELS[role] || ROLE_LABELS["org-admin"]);
  let storedUser = {};
  try {
    storedUser = JSON.parse(localStorage.getItem(role === "super-admin" ? "superAdmin" : "user") || "{}");
  } catch {
    // Keep the empty fallback when stored profile data is unavailable.
  }
  const displayUser = role === "super-admin" && !user?.identityVerifiedFromLogin
    ? null
    : { ...storedUser, ...(user || {}) };
  const storedOrganizationName = localStorage.getItem("organizationName") || localStorage.getItem("organization_name");
  const storedOrganizationEmail = localStorage.getItem("organizationEmail");
  const storedEmail = localStorage.getItem("user_email");
  const emailLabel = String(displayUser?.email || "")
    .split("@")[0]
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
  const personName =
    displayUser?.fullName ||
    displayUser?.name ||
    [displayUser?.firstName, displayUser?.lastName].filter(Boolean).join(" ");
  const fullName = role === "org-admin"
    ? displayUser?.organizationName || displayUser?.organisationName || storedOrganizationName || personName || emailLabel || fallback.label
    : personName || emailLabel || fallback.label;
  const initials =
    String(fullName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || fallback.initials;

  return {
    initials,
    label: fullName,
    email: role === "org-admin"
      ? displayUser?.organizationEmail || storedOrganizationEmail || displayUser?.email || storedEmail || fallback.email
      : displayUser?.email || storedEmail || fallback.email,
  };
}

// ─── LOGOUT BUTTON ──────────────────────────────────────────────────────────

// ─── HEADER COMPONENT ────────────────────────────────────────────────────────

function Header({
  darkMode,
  onToggleDark,
  role,
  onMenuToggle,
  breadcrumbs,
  onShortcutsOpen,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hiddenRoleCrumb =
    role === "student"
      ? "Student"
      : role === "mentor"
        ? "Mentor"
      : role === "org-admin"
        ? "Organization"
        : null;
  const visibleBreadcrumbs = hiddenRoleCrumb
    ? breadcrumbs.filter((crumb) => crumb !== hiddenRoleCrumb)
    : breadcrumbs;
  const { user, superAdmin, logout } = useAuth();
  const recipientId =
    role === "student"
      ? (user?.studentId ?? localStorage.getItem("studentId"))
      : role === "employee"
        ? (user?.employeeId ??
          localStorage.getItem("employeeId") ??
          user?.id ??
          localStorage.getItem("userId"))
        : role === "mentor"
          ? (user?.mentorId ??
            user?.MentorId ?? localStorage.getItem("mentorId"))
          : role === "org-admin"
            ? (user?.organizationId ??
              localStorage.getItem("organizationId") ??
              localStorage.getItem("organization_id") ??
              localStorage.getItem("orgId"))
            : null;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const roleInfo = getUserDisplayInfo(role === "super-admin" ? superAdmin : user, role);
  // Only Employee/Student/Mentor accounts have a profile photo; the backend
  // rejects /api/v1/profile/photo for OrganizationAdmin and super admins.
  const headerPhoto = useCurrentUserPhoto({ enabled: ["employee", "student", "mentor"].includes(role) });
  const dashboardPath =
    role === "super-admin"
      ? ROUTES.SUPER_ADMIN.DASHBOARD
      : role === "employee"
        ? ROUTES.EMPLOYEE.DASHBOARD
        : role === "mentor"
          ? ROUTES.MENTOR.DASHBOARD
          : role === "student"
            ? ROUTES.STUDENT.DASHBOARD
            : ROUTES.ORG_ADMIN.DASHBOARD;
  useEffect(() => {
    setNotifOpen(false);
  }, [location]);

  // v23 — HR portal pages carry their own breadcrumb, so the header shows the design's search instead.
  const hrPortal = role === "employee" && isHrModuleUser(user) && localStorage.getItem("isDemo") !== "true";
  const showBackButton = location.pathname !== dashboardPath && !hrPortal;
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(dashboardPath, { replace: true });
  };
  const profilePath =
    role === "super-admin"
      ? ROUTES.SUPER_ADMIN.PROFILE
      : role === "employee"
        ? ROUTES.EMPLOYEE.PROFILE
        : role === "mentor"
          ? ROUTES.MENTOR.PROFILE
          : role === "student"
            ? ROUTES.STUDENT.PROFILE
            : ROUTES.ORG_ADMIN.PROFILE;
  const settingsPath =
    role === "super-admin"
      ? ROUTES.SUPER_ADMIN.SETTINGS
      : role === "employee"
        ? ROUTES.EMPLOYEE.SETTINGS
        : role === "mentor"
          ? ROUTES.MENTOR.SETTINGS
          : role === "student"
            ? ROUTES.STUDENT.SETTINGS
            : ROUTES.ORG_ADMIN.SETTINGS;

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!notifOpen) return;

    const closeOnOutsidePointer = (event) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [notifOpen]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotifOpen(false);
        return;
      }
      if (isTyping || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "?") {
        event.preventDefault();
        onShortcutsOpen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onShortcutsOpen]);

  const loadUnreadCount = useCallback(async () => {
    // The backend does not expose an employee-scoped notification endpoint yet
    // (only student, mentor and organization) — skip rather than guess one.
    if (!recipientId || role === "employee") return;
    try {
      const rows =
        role === "student"
          ? await notificationService.getStudentNotifications(recipientId)
          : role === "org-admin"
            ? await notificationService.getOrganizationNotifications(recipientId)
            : await notificationService.getMentorNotifications(recipientId);
      setUnreadCount((Array.isArray(rows) ? rows : []).filter((item) => !(item.isRead ?? item.read ?? false)).length);
    } catch {
      toast.error("Unable to refresh unread count.", { id: "notification-count" });
    }
  }, [recipientId, role]);
  const loadHeaderNotifications = useCallback(async () => {
    if (!recipientId || role === "employee") return;
    try {
      const rows =
        role === "student"
          ? await notificationService.getStudentNotifications(recipientId)
          : role === "org-admin"
            ? await notificationService.getOrganizationNotifications(recipientId)
            : await notificationService.getMentorNotifications(recipientId);
      const allRows = Array.isArray(rows) ? rows : [];
      setUnreadCount(allRows.filter((item) => !(item.isRead ?? item.read ?? false)).length);
      const serverItems = allRows.slice(0, 5).map((item) => {
        const schedule = role === "student" ? classScheduleNotification(item) : null;
        return {
          ...item,
          id: item.notificationId ?? item.id,
          title: item.title ?? item.subject ?? "Notification",
          desc: schedule?.classTitle ?? item.description ?? item.message ?? "",
          scheduleLabel: schedule?.scheduleLabel ?? "",
          time: item.createdAt
            ? new Intl.DateTimeFormat("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              }).format(new Date(normalizeNotificationTimestamp(item.createdAt)))
            : "",
          unread: !(item.isRead ?? item.read ?? false),
        };
      });
      setNotifications(serverItems);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load notifications.', { id: 'notification-load' });
    }
  }, [recipientId, role]);
  useEffect(() => {
    const refresh = () => {
      if (notifOpen) loadHeaderNotifications();
      loadUnreadCount();
    };
    window.addEventListener("kini:notification-created", refresh);
    return () => window.removeEventListener("kini:notification-created", refresh);
  }, [loadHeaderNotifications, loadUnreadCount, notifOpen]);
  useEffect(() => {
    if (!recipientId) return undefined;
    queueMicrotask(loadUnreadCount);
    const timer = window.setInterval(loadUnreadCount, 45000);
    return () => window.clearInterval(timer);
  }, [recipientId, loadUnreadCount]);
  const markHeaderNotificationRead = async (notification) => {
    if (!notification.unread) return;
    try {
      await notificationService.markRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, unread: false } : item,
        ),
      );
      await loadUnreadCount();
    } catch {
      toast.error("Unable to mark notification as read.");
    }
  };
  const markAllHeaderRead = async () => {
    if (!recipientId || role === "employee") return;
    try {
      if (role === "student")
        await notificationService.markAllStudentRead(recipientId);
      else if (role === "org-admin")
        await notificationService.markAllOrganizationRead(recipientId);
      else await notificationService.markAllMentorRead(recipientId);
      setNotifications((current) =>
        current.map((item) => ({ ...item, unread: false })),
      );
      await loadUnreadCount();
    } catch {
      toast.error("Unable to mark notifications as read.");
    }
  };

  const closeProfileMenu = () => setProfileOpen(false);

  const handleLogout = async () => {
    closeProfileMenu();
    await logout();
    navigate(role === "super-admin" ? "/super-admin/login" : "/login", { replace: true });
  };

  return (
    <header
      data-ui="dashboard-header"
      className="sticky top-0 z-30 flex-shrink-0 h-14 bg-white dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-700/50 lg:h-[var(--app-header-h,5.25rem)]"
    >
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Menu toggle + Breadcrumbs */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>

          {showBackButton && (
            <button
              type="button"
              onClick={handleBack}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Go back"
              title="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {/* Breadcrumbs */}
          {!hrPortal && <nav
            className="flex items-center gap-1.5 text-[13px] min-w-0"
            aria-label="Breadcrumb"
          >
            <Link
              to="/"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            {visibleBreadcrumbs.map((crumb, i) => (
              <div key={i} className="flex items-center gap-1.5 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                <span
                  className={`truncate ${
                    i === visibleBreadcrumbs.length - 1
                      ? "text-slate-900 dark:text-white font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  {crumb}
                </span>
              </div>
            ))}
          </nav>}
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDark}
            className="hidden h-10 w-10 place-items-center rounded-xl border border-[#f3d4ae] bg-white text-[#133b5d] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f39924] hover:bg-[#fff1dc] dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/80"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-[18px] h-[18px] text-amber-400" />
            ) : (
              <Moon className="w-[18px] h-[18px] text-[#133b5d]" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notificationMenuRef}>
            <button
              onClick={() => {
                const next = !notifOpen;
                setNotifOpen(next);
                if (next) loadHeaderNotifications();
              }}
              className="relative grid h-10 w-10 place-items-center rounded-xl border-0 bg-transparent text-[#133b5d] shadow-none transition-all duration-200 hover:bg-[#eef4fd] dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
              aria-expanded={notifOpen}
            >
              <Bell className="h-5 w-5 text-[#133b5d] dark:text-slate-300" />
              <span className={`absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-extrabold leading-none text-white shadow-[0_2px_7px_rgba(15,23,42,.22)] ring-2 ring-white dark:ring-slate-900 ${notificationBadgeClass(unreadCount)}`} aria-hidden="true">
                  {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/10 dark:shadow-black/30 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    <button
                      type="button"
                      onClick={markAllHeaderRead}
                      disabled={!unreadCount}
                      className="text-[10px] font-semibold text-[#0f55f7] hover:underline disabled:opacity-40"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        to={notificationDestination(n, role)}
                        onClick={() => {
                          setNotifOpen(false);
                          void markHeaderNotificationRead(n);
                        }}
                        className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${n.unread ? "bg-[#0f55f7]/[0.02]" : ""}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.unread ? "bg-[#0f55f7]/10" : "bg-slate-100 dark:bg-slate-800"}`}
                        >
                          <Bell
                            className={`w-4 h-4 ${n.unread ? "text-[#0f55f7]" : "text-slate-400"}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${n.unread ? "font-semibold text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {n.desc}
                          </p>
                          {n.scheduleLabel && <p className="text-xs text-slate-500 mt-0.5">{n.scheduleLabel}</p>}
                          <p className="text-[10px] text-slate-400 mt-1">
                            {n.time}
                          </p>
                        </div>
                        {n.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0f55f7] shrink-0 mt-2" />
                        )}
                      </Link>
                    ))}
                    {!notifications.length && (
                      <p className="px-4 py-8 text-center text-xs text-slate-400">
                        No notifications found.
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/50 text-center">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(
                          role === "student"
                            ? "/student/notifications"
                            : role === "mentor"
                              ? "/mentor/notifications"
                              : role === "employee"
                                ? "/employee/notifications"
                                : "/organization/notifications",
                        );
                      }}
                      className="text-xs font-semibold text-[#0f55f7] hover:underline"
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef} data-header-profile>
            <button
              onClick={() => setProfileOpen((open) => !open)}
              className="group flex h-auto items-center gap-3 rounded-none border-0 bg-transparent px-0 py-0 text-left shadow-none transition-all duration-200 hover:bg-transparent focus-visible:outline-none"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-controls="profile-menu"
              aria-label="Open profile menu"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#133b5d] bg-[#f39924] text-[18px] font-bold text-[#133b5d] shadow-[0_10px_22px_rgba(19,59,93,.22)] transition-transform duration-200 ease-out group-hover:scale-105 dark:border-slate-900">
                <AvatarPhoto src={headerPhoto} fallback={<span>{roleInfo.initials}</span>} />
              </div>
              <div className="hidden min-w-0 flex-col text-left sm:flex">
                <p className="truncate text-[18px] font-semibold leading-tight text-slate-900 dark:text-white">
                  {roleInfo.label}
                </p>
                <p className="truncate text-[15px] leading-tight text-slate-500 dark:text-slate-400">
                  {roleInfo.email}
                </p>
              </div>
              <ChevronDown
                className={`hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ease-out sm:block ${profileOpen ? "rotate-180" : "rotate-0"}`}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  id="profile-menu"
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  role="menu"
                  aria-label="User menu options"
                  className="absolute right-0 top-full z-50 mt-3 w-[calc(100vw-24px)] max-w-[340px] overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-[0_25px_60px_rgba(15,23,42,.15)] dark:border-slate-700/80 dark:bg-slate-900 sm:w-[320px]"
                >
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border-2 border-[#133b5d] bg-[#f39924] text-[16px] font-bold text-[#133b5d] shadow-[0_8px_20px_rgba(19,59,93,.18)] dark:border-slate-900">
                      <AvatarPhoto src={headerPhoto} fallback={roleInfo.initials} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                        {roleInfo.label}
                      </p>
                      <p className="truncate text-[14px] text-slate-500 dark:text-slate-400">
                        {roleInfo.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <Link
                      to={profilePath}
                      onClick={() => setProfileOpen(false)}
                      role="menuitem"
                      className={`flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(8,95,167,.18)] dark:text-slate-300 dark:hover:bg-slate-800/60 ${
                        location.pathname === profilePath
                          ? "bg-[#EEF6FF] text-[#085FA7] dark:bg-[#0f55f7]/15 dark:text-blue-300"
                          : ""
                      }`}
                    >
                      <User className="h-5 w-5" /> Profile
                    </Link>
                    <Link
                      to={settingsPath}
                      onClick={() => setProfileOpen(false)}
                      role="menuitem"
                      className={`flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(8,95,167,.18)] dark:text-slate-300 dark:hover:bg-slate-800/60 ${
                        location.pathname === settingsPath
                          ? "bg-[#EEF6FF] text-[#085FA7] dark:bg-[#0f55f7]/15 dark:text-blue-300"
                          : ""
                      }`}
                    >
                      <SettingsIcon className="h-5 w-5" /> Settings
                    </Link>
                  </div>
                  <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-red-500 transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(8,95,167,.18)] dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <LogOut className="h-5 w-5" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── MAIN LAYOUT ────────────────────────────────────────────────────────────

export default function DashboardLayout() {
  const { isDark: darkMode, toggle: toggleDarkMode } = useThemeContext();
  const { user, role: authRole, updateUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const hrDrawerRef = useRef(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const location = useLocation();
  const [organizationPageTitle, setOrganizationPageTitle] = useState(
    () => location.state?.organization?.organizationName
      || location.state?.organization?.name
      || "Organization Details",
  );

  useEffect(() => {
    if (!/^\/super-admin\/organizations\/[^/]+$/.test(location.pathname)) return undefined;
    const stateTitle = location.state?.organization?.organizationName
      || location.state?.organization?.name;
    if (stateTitle) setOrganizationPageTitle(stateTitle);
    const handleTitle = (event) => {
      if (event.detail?.name) setOrganizationPageTitle(event.detail.name);
    };
    window.addEventListener("organization-details-loaded", handleTitle);
    return () => window.removeEventListener("organization-details-loaded", handleTitle);
  }, [location.pathname, location.state]);
  // HR Settings is shared by Organization Admin and HR users. Prefer the
  // authenticated role there so the sidebar width and content offset use the
  // same layout instead of inferring Employee from the URL prefix.
  const role = location.pathname === ROUTES.EMPLOYEE.HR_SETTINGS && authRole === "org-admin"
    ? authRole
    : detectRole(location.pathname);
  const { isHrUser } = useHrPermissions();
  const isHrLayout = role === 'employee' && isHrUser;
  const collapsed = sidebarCollapsed;
  const toggleSidebar = () => setSidebarCollapsed(value => !value);
  useEffect(() => {
    if (!isHrLayout || !mobileSidebarOpen) return undefined;
    const previous = document.activeElement;
    const drawer = hrDrawerRef.current;
    const focusable = () => [...(drawer?.querySelectorAll('a[href], button:not([disabled])') || [])];
    focusable()[0]?.focus();
    const trap = event => {
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    drawer?.addEventListener('keydown', trap);
    return () => { drawer?.removeEventListener('keydown', trap); previous?.focus?.(); };
  }, [isHrLayout, mobileSidebarOpen]);
  const isDashboardHome = [
    ROUTES.SUPER_ADMIN.DASHBOARD,
    ROUTES.ORG_ADMIN.DASHBOARD,
    ROUTES.EMPLOYEE.DASHBOARD,
    ROUTES.EMPLOYEE.HR_DASHBOARD,
    ROUTES.EMPLOYEE.OPERATIONS_DASHBOARD,
    ROUTES.MENTOR.DASHBOARD,
    ROUTES.STUDENT.DASHBOARD,
  ].includes(location.pathname);
  const userId = resolveUserId(user);
  const isDemoUser = Boolean(user?.isDemo);
  // Organization and super-admin accounts have no row in the Auth users
  // table — their login response carries organizationId (see
  // authService.js login()), not userId/id. resolveUserId() then falls
  // through to the JWT's sub/nameid claim, which for these roles is that
  // entity's own id (e.g. organizationId), not an Auth user id. Calling
  // GET /api/Auth/profile/{id} with it 404s every time, so this hydration
  // is scoped to roles that actually have a personal Auth profile.
  const hasAuthProfile = role !== "org-admin" && role !== "super-admin";

  useEffect(() => {
    if (!userId || isDemoUser || !hasAuthProfile) return;

    let active = true;
    getUserProfile(userId)
      .then((profile) => {
        if (!active) return;
        updateUser({
          ...profile.raw,
          ...(profile.fullName ? { fullName: profile.fullName, name: profile.fullName } : {}),
          ...(profile.email ? { email: profile.email } : {}),
        });
      })
      .catch(() => {
        // Keep the authenticated session data when profile hydration is unavailable.
      });

    return () => {
      active = false;
    };
  }, [hasAuthProfile, isDemoUser, role, updateUser, userId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
        setShortcutsOpen(false);
        return;
      }
      if (
        isTyping ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.key.toLowerCase() !== "n"
      )
        return;
      const newButton = document.querySelector("[data-page-new]");
      if (newButton) {
        event.preventDefault();
        newButton.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Breadcrumbs
  const breadcrumbPath = location.pathname.replace(/\/+$/, '') || '/';
  const breadcrumbs =
    BREADCRUMB_MAP[breadcrumbPath] ||
    (/^\/super-admin\/organizations\/[^/]+$/.test(breadcrumbPath)
      ? ["Organizations", organizationPageTitle]
      : breadcrumbPath.startsWith("/student/assessments/")
      ? [
          "Student",
          "Assessments",
          location.pathname.endsWith("/instructions")
            ? "Instructions"
            : "Assessment Details",
        ]
      : location.pathname.startsWith("/mentor/batches/")
        ? ["Mentor", "My Batches", "Workspace"]
        : location.pathname.startsWith("/mentor/webinars-meetings/")
          ? ["Mentor", "Webinars & Meetings", "Event Details"]
          : location.pathname.startsWith("/mentor/students/")
            ? ["Mentor", "Students", "Workspace"]
            : ["Dashboard"]);

  // Course learning is intentionally distraction-free: it uses its own curriculum
  // sidebar and player header instead of the main application navigation.
  const isStudentCoursePlayer = /^\/student\/courses\/[^/]+$/.test(
    location.pathname,
  );
  const isStudentMentorChat = role === "student" && location.pathname === "/student/mentor-chat";
  const isChatViewport = isStudentMentorChat || (role === "mentor" && location.pathname === "/mentor/messages");
  if (isStudentCoursePlayer) {
    return (
      <div className="h-dvh w-full overflow-y-auto overflow-x-hidden overscroll-contain bg-white">
        <Outlet />
      </div>
    );
  }

  return (
    <div
      data-chat-viewport={isChatViewport ? "true" : undefined}
      data-dashboard-role={role}
      data-hr-layout={isHrLayout ? "true" : undefined}
      data-sidebar-design={isHrLayout || role === "mentor" ? "mentor" : undefined}
      data-sidebar-collapsed={collapsed ? "true" : "false"}
      className="dashboard-density flex h-dvh w-full min-w-0 overflow-hidden bg-transparent text-[#17324A] transition-colors duration-300 dark:bg-[#0F172A] dark:text-white"
    >
      {/* Desktop Sidebar — fixed, no scroll */}
      <div
        className={`dashboard-desktop-sidebar fixed left-0 top-0 z-40 h-full hidden lg:block ${(role === "mentor" || isHrLayout) ? `mentor-sidebar-shell ${collapsed ? "mentor-sidebar-is-collapsed" : ""}` : ""}`}
      >
        <Sidebar
          role={role}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="dashboard-sidebar-backdrop fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="dashboard-sidebar-drawer fixed inset-y-0 left-0 z-50 lg:hidden"
              ref={hrDrawerRef}
              role={isHrLayout ? "dialog" : undefined}
              aria-modal={isHrLayout ? true : undefined}
              aria-label={isHrLayout ? "HR navigation" : undefined}
            >
              <Sidebar
                role={role}
                collapsed={false}
                mobile={true}
                onNavigate={() => setMobileSidebarOpen(false)}
                onToggle={() => setMobileSidebarOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area — scrollable, offset by sidebar width */}
      <div
        className={`mentor-content-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden transition-[margin-left,width] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          role === "org-admin" || role === "mentor" || isHrLayout
            ? collapsed
              ? role === "mentor"
                ? "lg:ml-[68px] lg:w-[calc(100%-68px)] ml-0 w-full"
                : "lg:ml-[68px] lg:w-[calc(100%-68px)] ml-0 w-full"
              : role === "mentor"
                ? "lg:ml-[248px] lg:w-[calc(100%-248px)] ml-0 w-full"
                : "lg:ml-[240px] lg:w-[calc(100%-240px)] ml-0 w-full"
            : collapsed
              ? "lg:ml-[76px] lg:w-[calc(100%-76px)] ml-0 w-full"
              : role === "super-admin"
                ? "lg:ml-[232px] lg:w-[calc(100%-232px)] ml-0 w-full"
                : role === "employee"
                  ? isHrUser
                    ? "lg:ml-[224px] lg:w-[calc(100%-224px)] ml-0 w-full"
                    : "lg:ml-[256px] lg:w-[calc(100%-256px)] ml-0 w-full"
                  : "lg:ml-[256px] lg:w-[calc(100%-256px)] ml-0 w-full"
        }`}
      >
        <Header
          darkMode={darkMode}
          onToggleDark={toggleDarkMode}
          role={role}
          onMenuToggle={() => setMobileSidebarOpen(true)}
          breadcrumbs={breadcrumbs}
          onShortcutsOpen={() => setShortcutsOpen(true)}
        />

        {/* Page Content — scrollable area */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full min-h-0 min-w-0 flex-1 overflow-x-hidden ${isStudentMentorChat ? "overflow-y-hidden" : "overflow-y-auto overscroll-contain"} ${
            role === "org-admin"
              ? "bg-[var(--app-background)]"
              : "bg-transparent dark:bg-slate-950"
          }`}
        >
          <div
            data-dashboard-home={isDashboardHome && role !== "mentor" ? "true" : undefined}
            className={`${isStudentMentorChat ? "h-full min-h-0" : "min-h-0"} w-full min-w-0 max-w-none ${
              ["/organization/batches", "/organization/employees", "/organization/courses"].includes(location.pathname)
                ? "organization-workspace !min-h-0 p-0 !pb-5 sm:!pb-6"
                : isDashboardHome
                  ? role === "org-admin"
                    ? "dashboard-home-workspace p-1 pb-4 sm:pb-6"
                    : role === "mentor"
                    ? "dashboard-home-workspace bg-[var(--app-background)] p-2 sm:p-3"
                    : "dashboard-home-workspace p-2 sm:p-3"
                : isStudentMentorChat
                    ? "p-2 sm:p-3"
                  : role === "mentor" ||
                    role === "org-admin" ||
                    role === "super-admin"
                  ? "organization-workspace p-0 pb-16"
                  : role === "employee"
                  ? "organization-workspace p-0 pb-6 sm:pb-8"
                  : role === "student"
                    ? "px-2 pt-2 pb-16 sm:px-3 lg:px-3 lg:pt-3"
                    : "px-4 pt-3 pb-16 sm:px-5 lg:px-6 lg:pt-4"
            }`}
          >
            <Outlet />
          </div>
        </motion.main>
      </div>
      <AnimatePresence>
        {shortcutsOpen && (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShortcutsOpen(false)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="keyboard-shortcuts-title"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Keyboard shortcuts
                  </p>
                  <h2
                    id="keyboard-shortcuts-title"
                    className="mt-1 text-lg font-semibold text-slate-900 dark:text-white"
                  >
                    Work faster
                  </h2>
                </div>
                <button
                  onClick={() => setShortcutsOpen(false)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700"
                >
                  Esc
                </button>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                {[
                  ["N", "Create a new record for this page"],
                  ["/", "Focus global search"],
                  ["Esc", "Close a menu, drawer or dialog"],
                  ["?", "Open this shortcuts panel"],
                ].map(([key, description]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4"
                  >
                    <dt className="text-slate-600 dark:text-slate-300">
                      {description}
                    </dt>
                    <dd>
                      <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {key}
                      </kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
