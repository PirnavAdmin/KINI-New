import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/hooks/useAuth";
import usePermission from "@shared/hooks/usePermission";
import { ROUTES } from "@shared/constants/routeConstants";

// A role's landing route (e.g. /mentor/dashboard) is chosen at login before
// permissions are even fetched (see Login.jsx's ROLE_DASHBOARD_ROUTES use),
// so a user whose org admin disabled that specific module lands here with
// nowhere else to go — every route in the app is gated by PermissionGuard,
// and this page was previously just a dead end ("Go back"). This offers the
// first module (in priority order, same order Sidebar.jsx lists them) this
// user actually has permission for.
//
// Intentionally a small, separate list rather than importing Sidebar.jsx's
// own MENU_CONFIG: that object isn't self-contained (it pulls in several
// other component-local constants), and re-exporting it would also make
// Sidebar.jsx export a non-component, breaking Fast Refresh for that file.
// Keep this in sync with Sidebar.jsx's per-role groups if those change.
const FALLBACK_CANDIDATES = {
  mentor: [
    { label: "My Attendance", path: ROUTES.MENTOR.ATTENDANCE, permissionKey: "attendance" },
    { label: "My Courses", path: ROUTES.MENTOR.COURSES, permissionKey: "courses" },
    { label: "My Batches", path: ROUTES.MENTOR.BATCHES, permissionKey: "batches" },
    { label: "My Students", path: ROUTES.MENTOR.STUDENTS, permissionKey: "students" },
    { label: "My Classes", path: ROUTES.MENTOR.CALENDAR, permissionKey: "live-classes" },
    { label: "Quizzes", path: ROUTES.MENTOR.ASSESSMENTS, permissionKey: "assessments" },
    { label: "Leave Requests", path: ROUTES.MENTOR.LEAVE, permissionKey: "leave" },
    { label: "Profile", path: ROUTES.MENTOR.PROFILE, permissionKey: "profile" },
    { label: "Dashboard", path: ROUTES.MENTOR.DASHBOARD, permissionKey: "dashboard" },
  ],
  employee: [
    { label: "Attendance", path: ROUTES.EMPLOYEE.ATTENDANCE, permissionKey: "attendance" },
    { label: "Batches", path: ROUTES.EMPLOYEE.BATCHES, permissionKey: "batches" },
    { label: "Profile", path: ROUTES.EMPLOYEE.PROFILE, permissionKey: "profile" },
    { label: "Dashboard", path: ROUTES.EMPLOYEE.DASHBOARD, permissionKey: "dashboard" },
  ],
  student: [
    { label: "My Courses", path: ROUTES.STUDENT.COURSES, permissionKey: "courses" },
    { label: "Assessments", path: ROUTES.STUDENT.ASSESSMENTS, permissionKey: "assessments" },
    { label: "Dashboard", path: ROUTES.STUDENT.DASHBOARD, permissionKey: "dashboard" },
  ],
};

const findFirstAllowedItem = (role, hasPermission) => {
  const candidates = FALLBACK_CANDIDATES[role] || [];
  return candidates.find((item) => hasPermission(item.permissionKey));
};

export default function Unauthorized() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { hasPermission, isLoading } = usePermission();
  const suggestion = isLoading ? null : findFirstAllowedItem(role, hasPermission);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Unauthorized</h1>
        <p className="mt-2 text-slate-500">
          Your account does not have permission to access this page.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Go back
          </button>
          {suggestion && (
            <button
              type="button"
              onClick={() => navigate(suggestion.path, { replace: true })}
              className="rounded-lg bg-[#f39924] px-4 py-2 text-sm font-semibold text-white hover:bg-[#df8412]"
            >
              Go to {suggestion.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
