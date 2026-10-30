import { useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LockKeyhole,
  CalendarDays,
  Sparkles,
  ClipboardList,
  CalendarCheck,
  FolderOpen,
  MessageCircleMore,
  Trash2,
} from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";
import usePermission from "@shared/hooks/usePermission";
import { ROUTES } from "@shared/constants/routeConstants";
import useStudentProgressAccess from "@features/student/hooks/useStudentProgressAccess";
import useHrPermissions from "@features/hr/hooks/useHrPermissions";
import { HR_DASHBOARD_NAVIGATION } from "@features/hr/constants/hrDashboardNavigation";
import { findHrUserByEmail } from "@features/hr/services/hrUserStore";
const KiniCompanyLogo = "/assets/new-logo-f.jpg.jpeg";
const KiniCollapsedLogo = "/assets/kini-company-logo.svg";

const MENU_CONFIG = {
  "super-admin": {
    label: "Super Admin",
    groups: [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            icon: "LayoutDashboard",
            path: "/super-admin/dashboard",
            permissionKey: "dashboard",
          },
          {
            label: "Organizations",
            icon: "Building2",
            path: "/super-admin/organizations",
            permissionKey: "organizations",
          },
          {
            label: "Subscriptions",
            icon: "CreditCard",
            path: "/super-admin/subscriptions",
            permissionKey: "subscriptions",
          },
          {
            label: "Revenue",
            icon: "BarChart3",
            path: ROUTES.SUPER_ADMIN.REVENUE,
            permissionKey: "revenue",
          },
          {
            label: "Reports",
            icon: "FileText",
            path: "/super-admin/reports",
            permissionKey: "reports",
          },
          {
            label: "Roles & Permissions",
            icon: "ShieldCheck",
            path: ROUTES.SUPER_ADMIN.ROLES_PERMISSIONS,
            permissionKey: "governance",
          },
        ],
      },
    ],
    // LAYOUT FIX — Settings pulled out of the scrollable list into a pinned footer (see render).
    footer: [
      {
        label: "Settings",
        icon: "Settings",
        path: "/super-admin/settings",
        permissionKey: "settings",
      },
    ],
  },
  "org-admin": {
    label: "Admin Portal",
    groups: [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            icon: "LayoutDashboard",
            path: "/organization/dashboard",
            permissionKey: "dashboard",
          },
        ],
      },
      {
        title: "People",
        items: [
          {
            label: "Students",
            icon: "GraduationCap",
            path: ROUTES.ORG_ADMIN.STUDENTS,
            permissionKey: "students",
          },
          {
            label: "Employees",
            icon: "Users",
            path: "/organization/employees",
            permissionKey: "employees",
          },
          { label: "Mentors", icon: "UsersRound", path: ROUTES.ORG_ADMIN.TUTORS, permissionKey: "mentors" },
        ],
      },
      {
        title: "Academic",
        items: [
          {
            label: "Courses",
            icon: "BookOpen",
            path: ROUTES.ORG_ADMIN.COURSES,
            permissionKey: "courses",
          },
          {
            label: "Batches",
            icon: "Calendar",
            path: ROUTES.ORG_ADMIN.BATCHES,
            permissionKey: "batches",
          },
          {
            label: "Classes",
            icon: "CalendarDays",
            path: ROUTES.ORG_ADMIN.CLASSES,
            permissionKey: "live-classes",
          },
          { label: "Course Materials", icon: "FolderOpen", path: ROUTES.ORG_ADMIN.COURSE_MATERIALS, permissionKey: "courses" },
          {
            label: "Assessments",
            icon: "ClipboardCheck",
            path: ROUTES.ORG_ADMIN.ASSESSMENTS,
            permissionKey: "assessments",
          },
        ],
      },
      {
        title: "Operations",
        items: [
          {
            label: "Attendance",
            icon: "ClipboardCheck",
            path: ROUTES.ORG_ADMIN.ATTENDANCE,
            permissionKey: "attendance",
          },
          {
            label: "Branch Management",
            icon: "Building2",
            path: ROUTES.ORG_ADMIN.BRANCHES,
            permissionKey: "branches",
          },
        ],
      },
      {
        title: "Finance",
        items: [
          {
            label: "Payroll",
            icon: "CreditCard",
            path: ROUTES.ORG_ADMIN.PAYROLL,
            permissionKey: "dashboard",
          },
          { label: "Revenue", icon: "BarChart3", path: ROUTES.ORG_ADMIN.REVENUE, permissionKey: "dashboard" },
          { label: "Invoices", icon: "FileText", path: ROUTES.ORG_ADMIN.INVOICES, permissionKey: "dashboard" },
        ],
      },
      {
        title: "Insights",
        items: [
          {
            label: "Reports",
            icon: "FileText",
            path: ROUTES.ORG_ADMIN.REPORTS,
            permissionKey: "reports",
          },
        ],
      },
      {
        title: "System",
        items: [
          {
            label: "Settings",
            icon: "Settings",
            path: "/organization/settings",
            permissionKey: "settings",
          },
          {
            label: "HR Settings",
            icon: "Settings",
            path: ROUTES.EMPLOYEE.HR_SETTINGS,
            permissionKey: "settings",
          },
        ],
      },
    ],
  },
  employee: {
    label: "Employee",
    groups: [
      {
        title: "WORKSPACE",
        items: [
          {
            label: "Dashboard",
            icon: "LayoutDashboard",
            path: "/employee/dashboard",
            permissionKey: "dashboard",
          },
          {
            label: "Batches",
            icon: "Users",
            path: ROUTES.EMPLOYEE.BATCHES,
            permissionKey: "batches",
          },
          {
            label: "Class Schedule",
            icon: "CalendarDays",
            path: ROUTES.EMPLOYEE.TODAY_SCHEDULE,
            permissionKey: "schedule",
          },
          {
            label: "AI Career Coach",
            icon: "Sparkles",
            path: ROUTES.EMPLOYEE.AI_CAREER_COACH,
            permissionKey: "ai-career-coach",
          },
        ],
      },
      {
        title: "TEACHING",
        items: [
          {
            label: "Assessments",
            icon: "ClipboardCheck",
            path: ROUTES.EMPLOYEE.ASSESSMENTS,
            permissionKey: "assessments",
          },
          {
            label: "Attendance",
            icon: "CalendarCheck",
            path: ROUTES.EMPLOYEE.ATTENDANCE,
            permissionKey: "attendance",
          },
          {
            label: "Leave Requests",
            icon: "ClipboardCheck",
            path: ROUTES.EMPLOYEE.LEAVE,
          },
          {
            label: "Performance",
            icon: "TrendingUp",
            path: ROUTES.EMPLOYEE.PERFORMANCE,
            permissionKey: "performance",
          },
        ],
      },
      {
        title: "ENGAGE",
        items: [
          {
            label: "Resources",
            icon: "FolderOpen",
            path: ROUTES.EMPLOYEE.RESOURCES,
            permissionKey: "resources",
          },
          {
            label: "Messages",
            icon: "MessageSquare",
            path: ROUTES.EMPLOYEE.MESSAGES,
            permissionKey: "messages",
          },
          {
            label: "Announcements",
            icon: "MessageCircleMore",
            path: ROUTES.EMPLOYEE.ANNOUNCEMENTS,
            permissionKey: "announcements",
          },
          {
            label: "Calendar",
            icon: "Calendar",
            path: ROUTES.EMPLOYEE.CALENDAR,
            permissionKey: "calendar",
          },
          {
            label: "Certificates",
            icon: "Award",
            path: ROUTES.EMPLOYEE.CERTIFICATES,
            permissionKey: "certificates",
          },
        ],
      },
    ],
    // LAYOUT FIX — ACCOUNT items pulled out of the scrollable list into a pinned footer (see render).
    footer: [
      {
        label: "Profile",
        icon: "User",
        path: ROUTES.EMPLOYEE.PROFILE,
        permissionKey: "profile",
      },
      {
        label: "Settings",
        icon: "Settings",
        path: ROUTES.EMPLOYEE.SETTINGS,
      },
      { label: "Logout", icon: "LogOut", path: "/logout" },
    ],
  },
  // RBAC UPGRADE — HR/Operations are Employee *department specializations*, not new
  // roles: same auth, same DashboardLayout, their own filtered menu. See getSidebarConfigKey().
  "employee:hr": {
    label: "HR",
    items: [
      {
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: ROUTES.EMPLOYEE.HR_DASHBOARD,
        permissionKey: "hr-dashboard",
      },
      {
        label: "HR Work Center",
        icon: "ClipboardList",
        path: ROUTES.EMPLOYEE.HR_WORK_CENTER,
        permissionKey: "hr-work-center",
      },
      {
        label: "Employees",
        icon: "Users",
        path: ROUTES.EMPLOYEE.HR_EMPLOYEES,
        permissionKey: "employees",
      },
      {
        label: "Attendance",
        icon: "CalendarCheck",
        path: ROUTES.EMPLOYEE.ATTENDANCE,
        permissionKey: "attendance.employee",
      },
      {
        label: "Leave Management",
        icon: "ClipboardCheck",
        path: ROUTES.EMPLOYEE.HR_LEAVE,
        permissionKey: "leave",
      },
      {
        label: "Payroll",
        icon: "CreditCard",
        path: ROUTES.EMPLOYEE.HR_PAYROLL,
        permissionKey: "payroll",
      },
      {
        label: "Recruitment",
        icon: "Briefcase",
        path: ROUTES.EMPLOYEE.HR_RECRUITMENT,
        permissionKey: "recruitment",
      },
      {
        label: "Documents",
        icon: "FolderOpen",
        path: ROUTES.EMPLOYEE.RESOURCES,
        permissionKey: "documents",
      },
      {
        label: "Reports",
        icon: "FileText",
        path: ROUTES.EMPLOYEE.REPORTS,
        permissionKey: "reports.limited",
      },
    ],
    groups: [
      {
        title: "OVERVIEW",
        items: [
          {
            label: "HR Dashboard",
            icon: "LayoutDashboard",
            path: ROUTES.EMPLOYEE.HR_DASHBOARD,
          },
        ],
      },
      {
        title: "CORE HR",
        items: [
          {
            label: "Employees",
            icon: "Users",
            path: ROUTES.EMPLOYEE.HR_EMPLOYEES,
          },
          {
            label: "Onboarding",
            icon: "UsersRound",
            path: ROUTES.EMPLOYEE.HR_ONBOARDING,
          },
        ],
      },
      {
        title: "TIME & PAY",
        items: [
          {
            label: "Attendance",
            icon: "CalendarCheck",
            path: ROUTES.EMPLOYEE.HR_ATTENDANCE,
          },
          {
            label: "Leave Management",
            icon: "ClipboardCheck",
            path: ROUTES.EMPLOYEE.HR_LEAVE,
          },
          {
            label: "Holidays",
            icon: "CalendarDays",
            path: ROUTES.EMPLOYEE.HR_HOLIDAYS,
          },
          {
            label: "Payroll",
            icon: "CreditCard",
            path: ROUTES.EMPLOYEE.HR_PAYROLL,
          },
          {
            label: "Payslips",
            icon: "FileText",
            path: ROUTES.EMPLOYEE.HR_PAYSLIPS,
          },
        ],
      },
      {
        title: "TALENT",
        items: [
          {
            label: "Recruitment",
            icon: "Briefcase",
            path: ROUTES.EMPLOYEE.HR_RECRUITMENT,
          },
          {
            label: "Appraisals",
            icon: "BarChart3",
            path: ROUTES.EMPLOYEE.HR_APPRAISAL,
          },
        ],
      },
      {
        title: "WORKFORCE",
        items: [
          { label: "Assets", icon: "Layers", path: ROUTES.EMPLOYEE.HR_ASSETS },
          {
            label: "Exit Management",
            icon: "LogOut",
            path: ROUTES.EMPLOYEE.HR_EXIT,
          },
          {
            label: "HR Tickets",
            icon: "MessageSquare",
            path: ROUTES.EMPLOYEE.HR_TICKETS,
          },
        ],
      },
      {
        title: "SYSTEM",
        items: [
          {
            label: "HR Reports",
            icon: "FileText",
            path: ROUTES.EMPLOYEE.HR_REPORTS,
          },
        ],
      },
    ],
    // LAYOUT FIX — Profile/Settings/Logout pulled into a pinned footer (see render).
    footer: [
      {
        label: "Profile",
        icon: "User",
        path: ROUTES.EMPLOYEE.PROFILE,
        permissionKey: "profile",
      },
      {
        label: "Settings",
        icon: "Settings",
        path: ROUTES.EMPLOYEE.HR_SETTINGS,
      },
      { label: "Logout", icon: "LogOut", path: "/logout" },
    ],
  },
  "employee:operations": {
    label: "Operations",
    items: [
      {
        label: "Dashboard",
        icon: "LayoutDashboard",
        path: ROUTES.EMPLOYEE.OPERATIONS_DASHBOARD,
        permissionKey: "operations-dashboard",
      },
      {
        label: "Admissions",
        icon: "UsersRound",
        path: ROUTES.EMPLOYEE.OPERATIONS_ADMISSIONS,
        permissionKey: "admissions",
      },
      {
        label: "Enrollments",
        icon: "GraduationCap",
        path: ROUTES.EMPLOYEE.OPERATIONS_ENROLLMENTS,
        permissionKey: "enrollments",
      },
      {
        label: "Student Support",
        icon: "MessageSquare",
        path: ROUTES.EMPLOYEE.OPERATIONS_STUDENT_SUPPORT,
        permissionKey: "student-support",
      },
      {
        label: "Course Scheduling",
        icon: "CalendarDays",
        path: ROUTES.EMPLOYEE.OPERATIONS_SCHEDULING,
        permissionKey: "scheduling",
      },
      {
        label: "Batches",
        icon: "Layers",
        path: ROUTES.EMPLOYEE.BATCHES,
        permissionKey: "batches",
      },
      {
        label: "Certificates",
        icon: "Award",
        path: ROUTES.EMPLOYEE.CERTIFICATES,
        permissionKey: "certificates",
      },
      {
        label: "Reports",
        icon: "FileText",
        path: ROUTES.EMPLOYEE.REPORTS,
        permissionKey: "reports.limited",
      },
    ],
    // LAYOUT FIX — Profile/Settings/Logout pulled into a pinned footer (see render).
    footer: [
      {
        label: "Profile",
        icon: "User",
        path: ROUTES.EMPLOYEE.PROFILE,
        permissionKey: "profile",
      },
      {
        label: "Settings",
        icon: "Settings",
        path: ROUTES.EMPLOYEE.SETTINGS,
        permissionKey: "settings",
      },
      { label: "Logout", icon: "LogOut", path: "/logout" },
    ],
  },
  mentor: {
    label: "Mentor",
    // The mentor workspace is deliberately scoped to teaching and assigned
    // learners. Organization-wide administration is never shown here.
    groups: [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            icon: "LayoutDashboard",
            path: ROUTES.MENTOR.DASHBOARD,
            permissionKey: "dashboard",
          },
          {
            label: "My Attendance",
            icon: "CalendarCheck",
            path: ROUTES.MENTOR.ATTENDANCE,
            permissionKey: "attendance",
          },
          {
            label: "Leave Requests",
            icon: "ClipboardCheck",
            path: ROUTES.MENTOR.LEAVE,
            permissionKey: "leave",
          },
        ],
      },
      {
        title: "Teaching",
        items: [
          {
            label: "My Courses",
            icon: "BookOpen",
            path: ROUTES.MENTOR.COURSES,
            permissionKey: "courses",
          },
          {
            label: "My Batches",
            icon: "Layers",
            path: ROUTES.MENTOR.BATCHES,
            permissionKey: "batches",
          },
          {
            label: "My Students",
            icon: "Users",
            path: ROUTES.MENTOR.STUDENTS,
            permissionKey: "students",
          },
          {
            label: "My Classes",
            icon: "Calendar",
            path: ROUTES.MENTOR.CALENDAR,
            // Matches the route guard in AppRoutes.jsx — "classes" has no
            // corresponding backend module, so it could never be granted.
            permissionKey: "live-classes",
          },
        ],
      },
      {
        title: "Learning",
        items: [
          {
            label: "Quizzes",
            icon: "ClipboardCheck",
            path: ROUTES.MENTOR.ASSESSMENTS,
            permissionKey: "assessments",
          },
          {
            label: "Profile",
            icon: "User",
            path: ROUTES.MENTOR.PROFILE,
            permissionKey: "profile",
          },
        ],
      },
      {
        title: "Insights",
        items: [
          {
            label: "Reports",
            icon: "FileText",
            path: ROUTES.MENTOR.REPORTS,
            permissionKey: "reports",
          },
          {
            label: "Settings",
            icon: "Settings",
            path: ROUTES.MENTOR.SETTINGS,
            permissionKey: "settings",
          },
        ],
      },
    ],
    // My Courses / Students / Live Classes / Recorded Sessions /
    // Assessments / Performance / Resources are intentionally not linked here —
    // they live inside the Batch Workspace tabs (see MentorBatchWorkspace.jsx)
    // to avoid duplicating navigation. Routes still exist and are untouched.
    footer: [{ label: "Logout", icon: "LogOut", path: "/logout" }],
  },
  student: {
    label: "Student",
    groups: [
      {
        title: null,
        items: [{ label: "Dashboard", icon: "LayoutDashboard", path: ROUTES.STUDENT.DASHBOARD, permissionKey: "dashboard" }],
      },
      {
        title: "Learning",
        items: [
          { label: "My Courses", icon: "BookOpen", path: ROUTES.STUDENT.COURSES, permissionKey: "courses" },
          { label: "My Batch", icon: "Users", path: ROUTES.STUDENT.BATCH },
          { label: "Class Schedule", icon: "CalendarDays", path: ROUTES.STUDENT.CLASS_SCHEDULE },
          { label: "Recordings", icon: "PlayCircle", path: ROUTES.STUDENT.RECORDINGS },
          { label: "Attendance", icon: "CalendarCheck", path: ROUTES.STUDENT.ATTENDANCE },
          { label: "Course Materials", icon: "FolderOpen", path: ROUTES.STUDENT.MATERIALS, permissionKey: "courses" },
          { label: "Assessments", icon: "ClipboardCheck", path: ROUTES.STUDENT.ASSESSMENTS, permissionKey: "assessments" },
          { label: "Progress", icon: "BarChart3", path: ROUTES.STUDENT.PROGRESS },
          { label: "Certificates", icon: "Award", path: ROUTES.STUDENT.CERTIFICATES },
        ],
      },
      {
        title: "Account",
        items: [
          { label: "Payments", icon: "CreditCard", path: ROUTES.STUDENT.PAYMENTS },
          { label: "Profile", icon: "User", path: ROUTES.STUDENT.PROFILE, permissionKey: "profile" },
          { label: "Settings", icon: "Settings", path: ROUTES.STUDENT.SETTINGS, permissionKey: "settings" },
        ],
      },
    ],
    // Student Logout is pinned below the scrollable navigation.
    footer: [],
  },
};

// ─── ICON MAP ────────────────────────────────────────────────────────────────

function MenuIcon({ name, className = "w-5 h-5" }) {
  const icons = {
    ShieldCheck: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    LayoutDashboard: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="9" />
        <rect x="14" y="3" width="7" height="5" />
        <rect x="14" y="12" width="7" height="9" />
        <rect x="3" y="16" width="7" height="5" />
      </svg>
    ),
    Building2: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18" />
        <path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2" />
        <path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2" />
        <path d="M10 6h4" />
        <path d="M10 10h4" />
        <path d="M10 14h4" />
        <path d="M10 18h4" />
      </svg>
    ),
    Users: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    CreditCard: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    BarChart3: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    FileText: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    Calendar: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" />
      </svg>
    ),
    Settings: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    Video: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    PlayCircle: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" />
      </svg>
    ),
    Layers: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    UsersRound: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    Briefcase: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
    Brain: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96.44 2.5 2.5 0 01-2.04-2.04 2.5 2.5 0 01-.44-4.96A2.5 2.5 0 019.5 2z" />
        <path d="M14.5 2A2.5 2.5 0 0012 4.5v15a2.5 2.5 0 004.96.44 2.5 2.5 0 002.04-2.04 2.5 2.5 0 01.44-4.96A2.5 2.5 0 0014.5 2z" />
      </svg>
    ),
    Target: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
    TrendingUp: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    BookOpen: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    Bell: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    ClipboardCheck: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
    User: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    LogOut: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    Award: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
      </svg>
    ),
    Zap: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    MessageSquare: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
    MessageCircleMore: <MessageCircleMore className={className} />,
    Trash2: <Trash2 className={className} />,
    CalendarDays: <CalendarDays className={className} />,
    Sparkles: <Sparkles className={className} />,
    ClipboardList: <ClipboardList className={className} />,
    CalendarCheck: <CalendarCheck className={className} />,
    FolderOpen: <FolderOpen className={className} />,
    GraduationCap: (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  };
  return icons[name] || <div className={className} />;
}

// ─── EXPANDABLE SUB-MENU COMPONENT ─────────────────────────────────────────

function SidebarSubMenu({ item, collapsed, childrenActive }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const showExpanded = childrenActive || expanded;

  return (
    <div className="relative">
      <button
        onClick={() => !collapsed && setExpanded(!showExpanded)}
        className={`relative w-full overflow-hidden flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          childrenActive
            ? "bg-[#0f55f7]/8 text-[#0f55f7] dark:bg-[#0f55f7]/15 dark:text-blue-300"
            : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
        }`}
      >
        <div className="relative z-10 flex items-center gap-3 flex-1">
          <MenuIcon
            name={item.icon}
            className={`w-[18px] h-[18px] ${childrenActive ? "text-[#0f55f7] dark:text-blue-300" : ""}`}
          />
          {!collapsed && (
            <span className="text-sm font-medium whitespace-nowrap flex-1 text-left">
              {item.label}
            </span>
          )}
          {!collapsed && (
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showExpanded ? "rotate-0" : "-rotate-90"}`}
            />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && showExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="relative z-10 ml-8 mt-1 space-y-1 border-l border-slate-200 pl-2 dark:border-slate-700/50">
              {item.children.map((child) => {
                const childActive = location.pathname.startsWith(child.path);
                return (
                  <Link key={child.path} to={child.path} className="block">
                    <div
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                        childActive
                          ? "text-[#0f55f7] font-semibold bg-[#0f55f7]/10"
                          : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {childActive && (
                        <span className="absolute left-0 w-0.5 h-4 bg-[#0f55f7] rounded-full" />
                      )}
                      <span className="ml-0.5">{child.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SIDEBAR COMPONENT ─────────────────────────────────────────────────────

export default function Sidebar({ role = "org-admin", collapsed, onToggle, mobile = false, onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { canModule, isHrUser } = useHrPermissions();
  const { hasPermission } = usePermission(); // RBAC UPGRADE — filters menu items without changing any JSX/markup
  const { progress: studentProgress } = useStudentProgressAccess();
  const [lockedFeature, setLockedFeature] = useState(null);
  // RBAC UPGRADE — a department-tagged employee (HR/Operations) gets its own menu variant;
  // an employee with no (or an unrecognized) department keeps the plain employee menu untouched.
  const assignedHrUser = role === "employee" && localStorage.getItem('isDemo') === 'true' ? findHrUserByEmail(user?.email) : null;
  const department = String(assignedHrUser?.department || user?.department || "").trim().toLowerCase();
  const isHrDepartment = isHrUser;
  const isOperationsDepartment = department === "operations";
  const departmentConfigKey = role === "employee"
    ? (isHrDepartment ? "employee:hr" : isOperationsDepartment ? "employee:operations" : null)
    : null;
  const config =
    (departmentConfigKey && MENU_CONFIG[departmentConfigKey]) ||
    MENU_CONFIG[role] ||
    MENU_CONFIG["org-admin"];
  const sidebarHomePath =
    departmentConfigKey === "employee:hr"
      ? ROUTES.EMPLOYEE.HR_DASHBOARD
      : departmentConfigKey === "employee:operations"
        ? ROUTES.EMPLOYEE.OPERATIONS_DASHBOARD
        : role === "org-admin"
          ? ROUTES.ORG_ADMIN.DASHBOARD
          : role === "mentor"
            ? ROUTES.MENTOR.DASHBOARD
            : `/${role}/dashboard`;
  // Mentors use the same compact enterprise shell as organization admins,
  // while retaining the mentor-only navigation configuration above.
  const isHrSidebar = departmentConfigKey === "employee:hr";
  const usesMentorSidebar = role === "mentor" || isHrSidebar;
  const usesCompactDarkSidebar = role === "org-admin" || usesMentorSidebar;
  const isSuperAdminSidebar = role === "super-admin";
  // Keep the mentor shell dark while giving the company mark a clean white header.
  const isMentorLightSidebar = false;
  const isNavAllowed = (item) =>
    isHrSidebar && item.moduleId ? canModule(item.moduleId) : hasPermission(item.permissionKey);
  const hrItems = HR_DASHBOARD_NAVIGATION.flatMap(section => section.items);
  const hrNavGroups = [
    { title: 'OVERVIEW', labels: ['Dashboard'] },
    { title: 'WORKFORCE', labels: ['Employees', 'Batches'] },
    { title: 'MANAGEMENT', labels: ['Students', 'Attendance', 'Leave Management', 'Performance'] },
    { title: 'ENGAGE', labels: ['Resources', 'Announcements', 'Calendar'] },
  ].map(({ title, labels }) => ({ title, items: labels.map(label => hrItems.find(item => item.label === label)).filter(Boolean) }));
  const navSections = (isHrSidebar ? hrNavGroups : config.groups || [
    { title: null, items: config.items || [] },
  ]).map((section) => ({
    ...section,
    items: (section.items || []).filter(isNavAllowed).filter(item => !isHrSidebar || !(config.footer || []).some(footer => footer.path === item.path)),
  })).filter((section) => section.items.length > 0);
  const footerItems = isHrSidebar
    ? (config.footer || []).filter((item) =>
        (item.label === "Settings" && canModule("settings")) || item.path === "/logout",
      )
    : (config.footer || []).filter(isNavAllowed);
  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    const [pathname, search] = path.split("?");
    if (pathname === ROUTES.ORG_ADMIN.CLASSES) {
      return [ROUTES.ORG_ADMIN.CLASSES, ROUTES.ORG_ADMIN.LIVE_CLASSES].some(
        (route) => location.pathname === route || location.pathname.startsWith(`${route}/`),
      );
    }
    if (search) {
      return location.pathname === pathname && location.search === `?${search}`;
    }
    if (pathname === ROUTES.EMPLOYEE.HR_DASHBOARD && location.pathname === "/employee/dashboard") return true;
    if (
      pathname === "/super-admin/dashboard" ||
      pathname === "/organization/dashboard" ||
      pathname === "/employee/dashboard" ||
      pathname === "/mentor/dashboard" ||
      pathname === "/mentor/notifications" ||
      pathname === "/mentor/settings"
    ) {
      return location.pathname === pathname;
    }
    return isHrSidebar ? location.pathname === pathname || location.pathname.startsWith(`${pathname}/`) : location.pathname.startsWith(pathname);
  };

  const resolveItemPath = (item) =>
    role === "student" && item.label === "AI Career Coach"
      ? ROUTES.STUDENT.AI_CAREER_COACH
      : item.path;

  // LAYOUT FIX — several placeholder items (e.g. HR's Employees/Departments/Leave/Payroll)
  // intentionally share one destination route until their own pages exist. Resolving a single
  // active item by reference (first match wins) stops every same-path item from simultaneously
  // claiming the shared `layoutId="sidebarPill"` — which otherwise rendered as invisible
  // white-on-white items (five sixths of a duplicate-path group lose the layout animation),
  // reading as "missing items" and a huge blank gap even though the DOM height was correct.
  const activeItem =
    [
      ...navSections.flatMap((section) => section.items || []),
      ...footerItems,
    ].find((item) => !item.children && isActive(resolveItemPath(item))) || null;

  const renderItem = (item) => {
    if (item.children) {
      const childrenActive = item.children.some((c) =>
        location.pathname.startsWith(c.path),
      );
      return (
        <SidebarSubMenu
          key={item.label}
          item={item}
          collapsed={collapsed}
          childrenActive={childrenActive}
        />
      );
    }

    const itemPath = resolveItemPath(item);
    const active = item === activeItem;
    const locked =
      role === "student" &&
      item.requiredProgress &&
      studentProgress < item.requiredProgress;
    const itemContent = (
      <div
        className={`mentor-sidebar-item group relative flex items-center gap-3 transition-all duration-200 ${
          isSuperAdminSidebar
            ? collapsed
              ? `mx-2 justify-center rounded-lg px-3 py-2.5 ${active && !locked ? "bg-[#F39924] text-[#133B5D]" : "text-white/80 hover:bg-white/10 hover:text-white"}`
              : `mx-3 rounded-lg px-4 py-2.5 ${active && !locked ? "bg-[#F39924] text-[#133B5D]" : "text-white/90 hover:bg-white/10 hover:text-white"}`
            : usesCompactDarkSidebar
            ? isMentorLightSidebar
              ? collapsed
                ? `mx-2 justify-center rounded-xl px-3 py-2.5 ${active && !locked ? "bg-[#ff8a1f] text-white shadow-[0_10px_22px_rgba(255,138,31,0.28)] ring-1 ring-white/15" : "text-[#dce8f6] hover:bg-white/10 hover:text-white"}`
                : `mx-4 rounded-xl border px-4 py-2 ${active && !locked ? "border-white/15 bg-[#ff8a1f] font-semibold text-white shadow-[0_10px_22px_rgba(255,138,31,0.28)]" : "border-transparent text-[#dce8f6] hover:bg-white/10 hover:text-white"}`
              : collapsed
                ? `mx-2 justify-center rounded-lg px-3 py-2.5 ${active && !locked ? "bg-[#F39924] text-[#133B5D]" : "text-[#DCE8F6] hover:bg-white/10 hover:text-white"}`
                : `mx-3 rounded-lg px-3.5 py-2.5 ${active && !locked ? "bg-[#F39924] text-[#133B5D]" : "text-[#DCE8F6] hover:bg-white/10 hover:text-white"}`
            : `rounded-lg px-3 ${isHrSidebar ? "py-1.5" : role === "employee" ? "py-1.5" : role === "super-admin" || role === "student" ? "py-1.5" : "py-2"} ${
                locked
                  ? "cursor-not-allowed text-slate-300 opacity-75 dark:text-slate-600"
                  : active
                    ? "bg-[#F39924] text-[#133B5D]"
                    : "text-white/85 hover:text-white hover:bg-white/10"
              }`
        } ${
          locked
            ? "cursor-not-allowed text-slate-300 opacity-75 dark:text-slate-600"
            : ""
        }`}
      >
        {active && !locked && !usesCompactDarkSidebar && !isSuperAdminSidebar && !isHrSidebar && (
          <motion.div
            layoutId="sidebarPill"
            className="absolute inset-0 rounded-lg bg-[#F39924]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <div
          className={`mentor-sidebar-item-content relative z-10 flex min-w-0 flex-1 items-center ${collapsed ? "justify-center" : ""} ${item.label === "Branch Management" && usesCompactDarkSidebar ? "gap-2" : "gap-3"}`}
        >
          <MenuIcon
            name={item.icon}
            className={`${(usesCompactDarkSidebar || isSuperAdminSidebar) && collapsed ? "h-5 w-5" : "h-5 w-5"} shrink-0 ${active && !locked ? "text-[#133B5D]" : ""}`}
          />
          {!collapsed && (
            <span
              className={`whitespace-nowrap ${item.label === "Branch Management" && usesCompactDarkSidebar ? "text-[11px] tracking-[-0.02em]" : isSuperAdminSidebar ? "text-[14px]" : usesCompactDarkSidebar ? "text-[13px]" : "text-sm"} ${active && !locked ? "font-bold" : "font-semibold"}`}
            >
              {item.label}
            </span>
          )}
          {locked && <LockKeyhole className="ml-auto h-3.5 w-3.5 shrink-0" />}
        </div>
        {collapsed && active && !locked && (
          <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0f55f7]" />
        )}
      </div>
    );

    if (locked) {
      return (
        <button
          key={item.label}
          type="button"
          onClick={() => setLockedFeature(item)}
          className="block w-full text-left"
          title={collapsed ? item.label : undefined}
          aria-label={collapsed ? item.label : undefined}
          title={`Unlocks at ${item.requiredProgress}% course progress. Current: ${studentProgress}%`}
          aria-label={`${item.label} locked. Unlocks at ${item.requiredProgress}% course progress.`}
        >
          {itemContent}
          {!collapsed && (
            <span
              className={`block px-10 text-[10px] font-medium text-slate-400 dark:text-slate-500 ${role === "student" ? "-mt-0.5 pb-0.5" : "-mt-1 pb-1"}`}
            >
              Unlocks at {item.requiredProgress}% completion
            </span>
          )}
        </button>
      );
    }
    // Logout special handling: render as button instead of Link
    if (itemPath === "/logout") {
      return (
        <button
          key={item.label}
          onClick={handleLogout}
          title={collapsed ? item.label : undefined}
          aria-label={collapsed ? item.label : undefined}
          className="block w-full text-left"
        >
          {itemContent}
        </button>
      );
    }
    return (
      <Link
        key={item.label}
        to={itemPath}
        onClick={onNavigate}
        aria-current={isHrSidebar && active ? "page" : undefined}
        className="block"
        title={item.ariaLabel || (collapsed ? item.label : undefined)}
        aria-label={item.ariaLabel || (collapsed ? item.label : undefined)}
      >
        {itemContent}
      </Link>
    );
  };


  return (
    <aside
      data-ui="dashboard-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      data-sidebar-design={usesMentorSidebar ? "mentor" : undefined}
      className={`relative z-40 flex min-h-0 flex-col overflow-hidden border-r backdrop-blur-xl transition-[width,padding,opacity,transform] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] h-dvh max-h-dvh ${
        "border-[#0D304A] bg-[#133B5D] shadow-[8px_0_24px_rgba(15,42,66,0.16)]"
      } ${usesCompactDarkSidebar ? (collapsed ? usesMentorSidebar ? "w-[88px]" : "w-[68px]" : usesMentorSidebar ? "w-[248px]" : "w-[240px]") : collapsed ? "w-[76px]" : isSuperAdminSidebar ? "w-[252px]" : isHrSidebar ? "w-[224px]" : "w-[256px]"}`}
    >
      {/* Logo Area */}
      <div
        className="sidebar-brand-header relative flex h-[6.5rem] shrink-0 items-center justify-center border-b border-slate-200 bg-white px-4"
      >
        <Link
          to={sidebarHomePath}
          className={`sidebar-brand-card brand-logo-viewport group flex items-center justify-center overflow-hidden transition-[transform,box-shadow,opacity] duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#085FA7]/20 ${
            collapsed
              ? "mx-auto h-12 w-12 rounded-xl bg-transparent hover:scale-105"
              : "h-[5.5rem] w-[calc(100%-2.5rem)] max-w-[180px] rounded-xl bg-transparent hover:-translate-y-0.5"
          }`}
          aria-label="Kini EduHub"
        >
          {collapsed ? (
            <img
              src={KiniCollapsedLogo}
              alt="Kini EduHub - Learn. Innovate. Lead."
              draggable="false"
              className="mentor-company-logo block h-auto max-h-full w-full object-contain"
            />
          ) : usesMentorSidebar ? (
            <img
              src={KiniCompanyLogo}
              alt="Kini EduHub - Learn. Innovate. Lead."
              draggable="false"
              className="mentor-company-logo brand-logo-image block h-full w-full object-contain"
            />
          ) : (
            <img
              src={KiniCompanyLogo}
              alt="Kini EduHub - Learn. Innovate. Lead."
              draggable="false"
              className="mentor-company-logo brand-logo-image block h-full w-full object-contain"
            />
          )}
        </Link>
        <button
          onClick={onToggle}
          className="sidebar-collapse absolute right-2 rounded-lg p-1.5 text-[#17324a] transition-colors hover:bg-slate-100 hover:text-[#0f55f7]"
          aria-label={mobile ? "Close navigation" : collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed &&
        !usesCompactDarkSidebar &&
        config.label !== "HR" &&
        config.label !== "Employee" &&
        config.label !== "Student" &&
        config.label !== "Super Admin" && (
          <div
            className={
              role === "org-admin"
                ? "px-3 pb-1 pt-2"
                : usesMentorSidebar
                  ? "px-3 pb-1 pt-3"
                  : role === "super-admin"
                    ? "px-3 pb-1.5 pt-3"
                    : role === "student"
                      ? "px-3 pb-1.5 pt-2.5"
                      : role === "employee"
                        ? "px-3 pb-1.5 pt-2.5"
                        : "px-4 pt-4 pb-2"
            }
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl bg-[#0f55f7]/10 text-[#0f55f7] border border-[#0f55f7]/20 shadow-sm shadow-[#0f55f7]/5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0f55f7] animate-pulse" />
              {config.label}
            </span>
          </div>
        )}

      {/* Main Navigation — the only scrollable region; flex-1 lets it absorb all leftover
          height so the footer below is always pinned to the bottom, never pushed off it. */}
      <nav
        aria-label={isHrSidebar ? "HR navigation" : usesMentorSidebar ? "Mentor navigation" : `${config.label} navigation`}
        className={`min-h-0 flex-1 overflow-y-auto scroll-pb-4 [scrollbar-width:thin] ${isSuperAdminSidebar ? "px-0 pb-5 pt-2 [scrollbar-color:rgba(255,255,255,.35)_transparent]" : usesCompactDarkSidebar ? "px-0 py-1.5 [scrollbar-color:#cbd5e1_transparent]" : `${isHrSidebar ? "px-2 py-1" : "px-3"} ${usesMentorSidebar ? "py-2" : role === "super-admin" ? "pb-5 pt-1.5" : !isHrSidebar && (role === "student" || role === "employee") ? "py-1.5" : !isHrSidebar ? "py-3" : ""} [scrollbar-color:#cbd5e1_transparent]`}`}
      >
        {navSections.map((section, sectionIndex) => (
          <div
            key={`${section.title || "section"}-${sectionIndex}`}
            className={
              sectionIndex === 0
                ? ""
                : usesCompactDarkSidebar
                  ? isMentorLightSidebar ? "mt-0.5" : "mt-1.5"
                  : isHrSidebar
                    ? "mt-1"
                    : role === "student"
                      ? "mt-2"
                      : role === "super-admin"
                        ? "mt-2.5"
                        : "mt-4"
            }
          >
            {section.title && !collapsed && (
              <div
                className={`font-bold uppercase tracking-[0.16em] ${isSuperAdminSidebar ? "px-7 pb-2 pt-1 text-[11px] text-white/90" : usesCompactDarkSidebar ? (isMentorLightSidebar ? "px-5 pb-0.5 pt-0.5 text-[10px] text-[#315f90]" : usesMentorSidebar ? "px-6 pb-1 text-[10px] text-[#f39924]" : "px-6 pb-1 text-[10px] text-[#72e4e1]") : isHrSidebar ? "px-3 pb-0.5 pt-0 text-[10px] text-slate-400 dark:text-slate-500" : role === "super-admin" ? "px-3 pb-1 text-[10px] text-slate-400 dark:text-slate-500" : "px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500"}`}
              >
                {section.title}
              </div>
            )}
            <div
              className={
                usesCompactDarkSidebar
                  ? "space-y-0"
                  : usesMentorSidebar
                    ? "space-y-1.5"
                    : role === "super-admin"
                      ? "space-y-1"
                      : isHrSidebar
                        ? "space-y-0"
                        : role === "employee"
                          ? "space-y-1"
                          : role === "student"
                            ? "space-y-1"
                            : "space-y-4"
              }
            >
              {/* RBAC UPGRADE — hasPermission(undefined) returns true, so items without a permissionKey (e.g. Logout) are unaffected */}
              {(section.items || [])
                .filter(isNavAllowed)
                .map((item) => renderItem(item))}
            </div>
          </div>
        ))}
        {role === "employee" && !isHrSidebar && (
          <div className="space-y-0">
            {footerItems.map((item) => renderItem(item))}
          </div>
        )}
        {usesMentorSidebar && (
          <div className="mt-1.5 space-y-0">
            {isHrSidebar && !collapsed && <div className="font-bold uppercase tracking-[0.16em] px-6 pb-1 text-[10px] text-[#f39924]">SYSTEM</div>}
            {isHrSidebar ? <div>{footerItems.map((item) => renderItem(item))}</div> : footerItems.map((item) => renderItem(item))}
          </div>
        )}
      </nav>


      {/* Footer Navigation — Profile/Settings/Logout (role-dependent), always pinned below
          the scrollable nav via mt-auto + shrink-0 on this flex-col sibling. */}
      {role !== "mentor" && role !== "employee" && (footerItems.length > 0 ||
        role === "student" ||
        role !== "employee") && (
        <div
        className="mt-2 shrink-0 space-y-1 px-0 py-2"
        >
          {footerItems.map((item) => renderItem(item))}

          {role === "student" && (
            <button onClick={handleLogout} className="block w-full">
              <div className="relative flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group w-full text-left">
                <MenuIcon name="LogOut" className="w-[18px] h-[18px]" />
                {!collapsed && (
                  <span className="whitespace-nowrap text-sm font-medium">
                    Logout
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Generic Logout — org-admin, mentor, super-admin (employee/HR/Operations already carry their own Logout in footerItems) */}
          {role !== "student" && role !== "employee" && (
            <button onClick={handleLogout} className="block w-full">
        <div
                className={`mentor-sidebar-item flex items-center gap-3 rounded-xl py-2.5 transition-all duration-200 group w-full text-left ${collapsed ? "justify-center px-3" : ""} ${isSuperAdminSidebar ? "mx-3 w-[calc(100%-1.5rem)] px-4 font-semibold text-rose-100 hover:bg-rose-500/20 hover:text-white" : `hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-500/10 ${usesCompactDarkSidebar ? "px-6 text-slate-400" : "px-3 text-slate-400"}`}`}
              >
                <MenuIcon name="LogOut" className="w-[18px] h-[18px]" />
                {!collapsed && (
                  <span className="text-sm font-medium">Logout</span>
                )}
              </div>
            </button>
          )}
        </div>
      )}

      {createPortal(
        <AnimatePresence>
          {lockedFeature && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="pointer-events-none fixed inset-y-0 left-4 right-4 z-[100] flex items-center justify-center sm:left-[248px]"
              onClick={() => setLockedFeature(null)}
            >
              <motion.div
                initial={{ scale: 0.98 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.98 }}
                role="dialog"
                aria-modal="false"
                aria-labelledby="locked-feature-title"
                onClick={(event) => event.stopPropagation()}
                className="pointer-events-auto w-full max-w-[360px] rounded-2xl border border-slate-200/90 bg-white/95 p-5 text-center shadow-[0_20px_60px_rgba(15,23,42,.22)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h2
                  id="locked-feature-title"
                  className="mt-3 text-lg font-extrabold text-slate-900 dark:text-white"
                >
                  {lockedFeature.label} Locked
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {lockedFeature.label === "Certificates"
                    ? "Reach 70% course completion to become certificate eligible. Your organization issues the certificate after its academic review."
                    : <>Complete at least {lockedFeature.requiredProgress}% of a course to unlock {lockedFeature.label === "Job Portal" ? "job opportunities" : "this section"}.</>}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
                  {[
                    ["Current", `${studentProgress}%`],
                    ["Required", `${lockedFeature.requiredProgress}%`],
                    [
                      "Remaining",
                      `${Math.max(0, lockedFeature.requiredProgress - studentProgress)}%`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        {label}
                      </p>
                      <p className="mt-1 text-sm font-extrabold text-slate-700 dark:text-slate-200">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setLockedFeature(null)}
                  className="mt-4 w-full rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 py-2.5 text-sm font-bold text-white"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Collapse toggle button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          aria-label="Expand sidebar"
        >
          <svg
            className="w-3 h-3 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </aside>
  );
}
