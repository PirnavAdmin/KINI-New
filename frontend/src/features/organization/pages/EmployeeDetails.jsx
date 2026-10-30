import { normalizeEmploymentType } from "@shared/utils/employeePresentation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  IdCard,
  IndianRupee,
  Landmark,
  Layers3,
  LayoutGrid,
  Mail,
  MapPin,
  Network,
  Pencil,
  Phone,
  ShieldCheck,
  Star,
  User,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { PanelCard, ProfileHero, ProfileTabs, SectionHead, StatTile, StatusPill } from "@features/organization/components/profile/ProfileKit";
import { BatchCards, CourseCards } from "@features/organization/components/profile/EntityCards";
import AttendancePanel from "@features/organization/components/profile/AttendancePanel";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import { employeeService } from "@shared/services/employeeService";
import { permissionApi, permissionRowsToMatrix } from "@shared/services/platformModulesApi";
import { getApiErrorMessage } from "@shared/services/apiServices";
import { courseService } from "@shared/services/courseService";
import { batchService } from "@shared/services/batchService";
import { ROUTES } from "@shared/constants/routeConstants";
import { Button } from "@shared/components/FormElements";
import EmptyState from "@shared/components/EmptyState";
import { TableSkeleton } from "@shared/ui/Skeleton";
import StatusBadge from "@shared/components/StatusBadge";
import { studentsApi } from "@/api/students";
import EmployeeProfileWizard from "@shared/components/EmployeeProfileWizard";
import { useProfilePhoto } from "@shared/hooks/useProfilePhoto";
import { embeddedPhotoUrl } from "@shared/services/profilePhotoService";
import "./employee-details-density.css";

// Tabs shared by every role, plus the role-specific sets appended to them.
// A Mentor's day-to-day work is teaching (students/batches/courses), not the
// HR-facing payroll/permissions screens, so the two role tracks diverge here.
const BASE_TABS = ["Overview", "Profile Details", "Attendance"];
const MENTOR_ONLY_TABS = ["Students", "Batches", "Courses"];
const STAFF_ONLY_TABS = ["Work Progress", "Payroll & Payslips", "Access & Permissions"];
const ALL_TABS = [...BASE_TABS, ...MENTOR_ONLY_TABS, ...STAFF_ONLY_TABS];
const TAB_ICONS = {
  Overview: UserRound,
  "Profile Details": User,
  Attendance: CalendarDays,
  Students: Users,
  Batches: Layers3,
  Courses: BookOpen,
  "Work Progress": Briefcase,
  "Payroll & Payslips": IndianRupee,
  "Access & Permissions": ShieldCheck,
};
// Same designation/role detection already used throughout this page (batches,
// students, the Employment tab's assigned-batches card) — kept as one helper
// so every mentor check agrees instead of drifting.
const isMentorEmployee = (employee) =>
  /mentor|tutor/i.test(String(employee?.role ?? employee?.designation ?? ""));
const DollarSign = IndianRupee;
const ACTIONS = ["view", "add", "edit", "delete", "access"];
const ACTION_FIELDS = {
  view: "canView",
  add: "canAdd",
  edit: "canEdit",
  delete: "canDelete",
  access: "canAccess",
};
const MODULES = [
  "Dashboard",
  "Students",
  "Employees",
  "Courses",
  "Batches",
  "Live Classes",
  "Attendance",
  "Assessments",
  "Reports",
];
const moduleKey = (value) => {
  const key = String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (key === "liveclasses" || key === "liveclass") return "live-classes";
  // EmployeeProfile (permissionId 9) is a distinct backend module from
  // Employees (permissionId 2) — aliasing them together made one module's
  // saved permission silently overwrite the other's.
  if (key === "employeeprofile") return "employee-profile";
  return key;
};
const label = (value) =>
  String(value ?? "-")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
const date = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "-";
const money = (value) =>
  value === undefined || value === null || value === ""
    ? "-"
      : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(value));
const toRows = (payload) => {
  const source = payload?.data ?? payload;
  if (Array.isArray(source)) return source;

  const collections = [
    source?.records,
    source?.items,
    source?.attendance,
    source?.attendances,
    source?.data?.records,
    source?.data?.items,
    source?.data?.attendance,
    source?.data?.attendances,
  ];

  return collections.find(Array.isArray) ?? [];
};

const pick = (record, ...keys) =>
  keys
    .map((key) => record?.[key])
    .find((value) => value !== undefined && value !== null && value !== "");

// Employee endpoints are not fully consistent about the contact field name.
// Keep the detail view (and its edit form) on one canonical `phone` value so
// a number returned as mobile/mobileNumber/phoneNumber is never displayed as
// an empty placeholder.
const normalizeEmployeeDetails = (record = {}) => ({
  ...record,
  phone: pick(
    record,
    "phone",
    "Phone",
    "mobile",
    "Mobile",
    "mobileNumber",
    "MobileNumber",
    "phoneNumber",
    "PhoneNumber",
    "contactNumber",
    "ContactNumber",
  ) ?? "",
});
const sameId = (left, right) => String(left ?? "") === String(right ?? "");
const studentKey = (student) =>
  String(student?.studentId ?? student?.id ?? student?.email ?? student?.name ?? "").trim().toLowerCase();
const mergeStudents = (...groups) => {
  const byKey = new Map();
  groups.flat().filter(Boolean).forEach((student) => {
    const key = studentKey(student);
    if (!key) return;
    byKey.set(key, { ...(byKey.get(key) ?? {}), ...student });
  });
  return [...byKey.values()];
};
const normalizeRosterStudent = (student = {}, batch = {}) => ({
  ...student,
  id: student.studentId ?? student.id,
  studentId: student.studentId ?? student.id,
  name: student.name || student.studentName || [student.firstName, student.lastName].filter(Boolean).join(" "),
  email: student.email ?? student.emailAddress ?? "",
  mobile: student.mobile ?? student.phone ?? student.phoneNumber ?? "",
  batchId: student.batchId ?? batch.batchId,
  batch: student.batchName ?? student.batch ?? batch.batchName ?? (batch.batchId ? `Batch #${batch.batchId}` : ""),
  courseId: student.courseId ?? batch.courseId,
  course: student.courseName ?? student.course ?? batch.courseName ?? "",
  status: student.status ?? "Active",
});
const attendanceRow = (record = {}) => ({
  id: pick(
    record,
    "employeeAttendanceId",
    "attendanceId",
    "id",
    "EmployeeAttendanceId",
  ),
  date: pick(record, "attendanceDate", "date", "AttendanceDate"),
  checkIn: pick(record, "checkIn", "checkInTime", "CheckIn", "CheckInTime"),
  checkOut: pick(
    record,
    "checkOut",
    "checkOutTime",
    "CheckOut",
    "CheckOutTime",
  ),
  status: pick(record, "status", "attendanceStatus", "Status"),
});
const attendanceMinutes = (record, now) => {
  if (!record.checkIn) return null;
  const start = new Date(record.checkIn);
  if (Number.isNaN(start.getTime())) return null;
  const recordDay = String(record.date ?? "").slice(0, 10);
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  if (!record.checkOut && recordDay && recordDay !== today) return null;
  const end = record.checkOut ? new Date(record.checkOut) : now;
  return Number.isNaN(end.getTime())
    ? null
    : Math.max(0, Math.floor((end - start) / 60000));
};
function Card({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-[#0f55f7]" />}
        {title}
      </h2>
      {children}
    </section>
  );
}
function AsyncTabSection({ loading, error, onRetry, isEmpty, emptyTitle, emptyDescription, icon: Icon, children }) {
  if (loading) return <TableSkeleton rows={4} columns={5} />;
  if (error) {
    return (
      <EmptyState
        icon={Icon}
        title="Unable to load this data"
        description={error}
        compact
        action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}
      />
    );
  }
  if (isEmpty) {
    return (
      <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} compact />
    );
  }
  return children;
}

function StudentsTab({ students, loading, error, onRetry, onSelectStudent }) {
  return (
    <AsyncTabSection
      loading={loading}
      error={error}
      onRetry={onRetry}
      isEmpty={!students.length}
      icon={Users}
      emptyTitle="No students assigned"
      emptyDescription="No students are currently assigned to this mentor."
    >
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:border-slate-700">
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Batch</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const studentId = student.studentId ?? student.id;
              const canOpen = Boolean(onSelectStudent) && (studentId !== undefined && studentId !== null && studentId !== "");
              const open = () => canOpen && onSelectStudent(student);
              return (
                <tr
                  key={studentId ?? student.email ?? student.name}
                  onClick={canOpen ? open : undefined}
                  onKeyDown={
                    canOpen
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            open();
                          }
                        }
                      : undefined
                  }
                  tabIndex={canOpen ? 0 : undefined}
                  role={canOpen ? "button" : undefined}
                  aria-label={canOpen ? `View student details for ${student.name || "student"}` : undefined}
                  className={`border-b border-slate-100 last:border-0 outline-none dark:border-slate-800 ${canOpen ? "cursor-pointer transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 dark:hover:bg-slate-800/60 dark:focus-visible:bg-slate-800/60" : ""}`}
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    <span className={canOpen ? "hover:underline hover:text-[#0f55f7] dark:hover:text-blue-300" : ""}>
                      {student.name || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {studentId ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {student.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {student.mobile || student.phone || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {student.batch || "-"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {student.course || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={String(student.status ?? "active").toLowerCase()}
                      label={student.status ?? "Active"}
                      size="sm"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AsyncTabSection>
  );
}

function BatchesTab({ batches, loading, error, onRetry, mentorName }) {
  return (
    <AsyncTabSection
      loading={loading}
      error={error}
      onRetry={onRetry}
      isEmpty={!batches.length}
      icon={Layers3}
      emptyTitle="No batches assigned"
      emptyDescription="No batches are currently assigned to this mentor."
    >
      <div className="space-y-2">
        {batches.map((batch) => (
          <div
            key={batch.batchId}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {batch.batchName || `Batch ${batch.batchId}`}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {batch.courseName || "Course not available"}
                </p>
              </div>
              <StatusBadge
                status={String(batch.status ?? "active").toLowerCase()}
                label={batch.status ?? "Active"}
                size="sm"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span>
                Students: <strong>{batch.studentCount ?? batch.studentsCount ?? 0}/{batch.capacity ?? "-"}</strong>
              </span>
              <span>
                Batch ID: <strong>{batch.batchId}</strong>
              </span>
              <span>
                Starts: <strong>{date(batch.startDate)}</strong>
              </span>
              <span>
                Ends: <strong>{date(batch.endDate)}</strong>
              </span>
              <span className="col-span-2">
                Mentor: <strong>{mentorName}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </AsyncTabSection>
  );
}

function CoursesTab({ courses, loading, error, onRetry }) {
  return (
    <AsyncTabSection
      loading={loading}
      error={error}
      onRetry={onRetry}
      isEmpty={!courses.length}
      icon={BookOpen}
      emptyTitle="No courses assigned"
      emptyDescription="No courses are currently assigned to this mentor."
    >
      <div className="space-y-2">
        {courses.map((course) => (
          <div
            key={course.courseId ?? course.courseName}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {course.courseName}
                </p>
                {course.courseCode && (
                  <p className="mt-0.5 text-xs text-slate-500">Code: {course.courseCode}</p>
                )}
              </div>
              {course.status && (
                <StatusBadge
                  status={String(course.status).toLowerCase()}
                  label={course.status}
                  size="sm"
                />
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <span>
                Students: <strong>{course.studentCount}</strong>
              </span>
              <span>
                Batches: <strong>{course.batches.length}</strong>
              </span>
              {course.duration && (
                <span className="col-span-2">
                  Duration: <strong>{course.duration}</strong>
                </span>
              )}
              <span className="col-span-2">
                Assigned batches:{" "}
                <strong>
                  {course.batches.map((batch) => batch.batchName).filter(Boolean).join(", ") || "-"}
                </strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </AsyncTabSection>
  );
}

export default function EmployeeDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const tab = ALL_TABS.includes(requestedTab) ? requestedTab : "Overview";
  const [employee, setEmployee] = useState(null);
  // This employee's own photo — never GET /api/v1/profile/photo, which returns the
  // signed-in admin's photo. Source of truth is the per-user photo endpoint keyed by
  // this employee's id; the record's own profilePhotoUrl (Employee model) is the fallback.
  const embeddedPhoto = employee ? embeddedPhotoUrl(employee) : "";
  const { photoUrl: fetchedPhoto, loading: photoLoading } = useProfilePhoto("employee", employeeId, { enabled: Boolean(employee) });
  useEffect(() => {
    if (!import.meta.env.DEV || !employee || photoLoading) return;
    console.info("[EmployeeDetails photo]", {
      routeEmployeeId: employeeId,
      employeeId: employee.employeeId,
      userId: employee.userId,
      mentorId: employee.mentorId,
      photoFields: Object.fromEntries(Object.entries(employee).filter(([key]) => /photo|avatar|image/i.test(key))),
      fromPhotoApi: fetchedPhoto || "(none)",
      fromRecord: embeddedPhoto || "(none)",
    });
  }, [employee, employeeId, embeddedPhoto, fetchedPhoto, photoLoading]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabLoading, setTabLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [permissionModules, setPermissionModules] = useState(MODULES.map((module) => ({ id: moduleKey(module), label: module })));
  const permissionsDirtyRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [studentsReload, setStudentsReload] = useState(0);
  const [assignedBatches, setAssignedBatches] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [batchesError, setBatchesError] = useState("");
  const [batchesReload, setBatchesReload] = useState(0);
  const [courseCatalog, setCourseCatalog] = useState([]);
  const [now, setNow] = useState(() => new Date());
  const [overviewAttendance, setOverviewAttendance] = useState(null);
  const isMentor = isMentorEmployee(employee);
  const tabs = useMemo(
    () => [...BASE_TABS, ...(isMentor ? MENTOR_ONLY_TABS : STAFF_ONLY_TABS)],
    [isMentor],
  );
  const employeeName = useMemo(
    () =>
      [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
      employee?.name ||
      "Employee",
    [employee],
  );
  // A deep link like ?tab=Payroll for a mentor (or ?tab=Students for regular
  // staff) is only knowable once the employee record — and therefore the
  // role — has loaded. Snap back to Overview rather than rendering a tab the
  // role doesn't have.
  useEffect(() => {
    if (!employee || tabs.includes(tab)) return;
    const next = new URLSearchParams(params);
    next.delete("tab");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, tab, tabs]);
  // Derived purely from the mentor's assigned batches — there is no separate
  // mentor-to-course endpoint in this codebase, so "this mentor's courses"
  // means the courses backing the batches they actually teach.
  const assignedCourses = useMemo(() => {
    const catalogById = new Map(
      courseCatalog.map((course) => [Number(course.courseId ?? course.id), course]),
    );
    const byKey = new Map();
    assignedBatches.forEach((batch) => {
      const courseId = batch.courseId ?? batch.course?.courseId ?? batch.course?.id;
      const courseName = batch.courseName ?? batch.course?.courseName ?? batch.course?.name;
      const key = courseId ?? courseName;
      if (key === undefined || key === null || key === "") return;
      if (!byKey.has(key)) {
        const catalogCourse = courseId !== undefined ? catalogById.get(Number(courseId)) : undefined;
        byKey.set(key, {
          courseId,
          courseName: courseName || catalogCourse?.courseName || `Course ${courseId}`,
          courseCode: catalogCourse?.courseCode ?? catalogCourse?.code ?? null,
          duration: catalogCourse?.duration ?? null,
          status: catalogCourse?.status ?? null,
          batches: [],
          studentCount: 0,
        });
      }
      const entry = byKey.get(key);
      entry.batches.push(batch);
      entry.studentCount += Number(
        batch.studentCount ?? batch.studentsCount ?? batch.enrolledStudents ?? 0,
      );
    });
    return [...byKey.values()];
  }, [assignedBatches, courseCatalog]);
  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    employeeService
      .getEmployee(employeeId)
      .then((result) => active && setEmployee(normalizeEmployeeDetails(result?.data ?? result)))
      .catch(
        (requestError) =>
          active &&
          setError(
            getApiErrorMessage(requestError, "Unable to load this employee."),
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [employeeId]);
  useEffect(() => {
    if (!employee || !isMentor) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssignedStudents([]);
      setStudentsError("");
      return;
    }
    let active = true;
    setStudentsLoading(true);
    setStudentsError("");
    const batchIds = assignedBatches
      .map((batch) => batch.batchId ?? batch.id)
      .filter((id) => id !== undefined && id !== null && String(id).trim() !== "");
    Promise.allSettled([
      studentsApi.list(),
      ...assignedBatches.map((batch) =>
        batchService.getStudents(batch.batchId ?? batch.id)
          .then((roster) => (roster.students ?? []).map((student) => normalizeRosterStudent(student, {
            ...batch,
            batchId: roster.batchId ?? batch.batchId ?? batch.id,
            batchName: roster.batchName || batch.batchName,
            courseName: roster.courseName || batch.courseName,
          }))),
      ),
    ])
      .then((results) => {
        if (!active) return;
        const listResult = results[0];
        const data = listResult.status === "fulfilled" ? (listResult.value?.data ?? []) : [];
        const ids = [employee.employeeId, employee.mentorId, employee.id]
          .filter(Boolean)
          .map(String);
        const name = [employee.firstName, employee.lastName]
          .filter(Boolean)
          .join(" ")
          .trim()
          .toLowerCase();
        const rosterStudents = results
          .slice(1)
          .filter((result) => result.status === "fulfilled")
          .flatMap((result) => result.value);
        const directStudents = data.filter(
          (student) =>
            ids.includes(String(student.mentorId ?? "")) ||
            batchIds.some((batchId) => sameId(student.batchId, batchId)) ||
            (name &&
              String(student.mentorName ?? "")
                .trim()
                .toLowerCase() === name),
        );
        setAssignedStudents(mergeStudents(directStudents, rosterStudents));
        if (listResult.status === "rejected" && !rosterStudents.length) throw listResult.reason;
      })
      .catch((requestError) => {
        if (!active) return;
        setAssignedStudents([]);
        setStudentsError(getApiErrorMessage(requestError, "Unable to load students."));
      })
      .finally(() => active && setStudentsLoading(false));
    return () => {
      active = false;
    };
  }, [assignedBatches, employee, isMentor, studentsReload]);
  useEffect(() => {
    if (!employee || !isMentor) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssignedBatches([]);
      setBatchesError("");
      return;
    }
    let active = true;
    setBatchesLoading(true);
    setBatchesError("");
    employeeService
      .getEmployeeBatches(employeeId)
      .then((result) => {
        if (!active) return;
        const payload = result?.data ?? result;
        setAssignedBatches(
          Array.isArray(payload?.batches) ? payload.batches : [],
        );
      })
      .catch((requestError) => {
        if (!active) return;
        setAssignedBatches([]);
        setBatchesError(getApiErrorMessage(requestError, "Unable to load assigned batches."));
        toast.error(
          getApiErrorMessage(requestError, "Unable to load assigned batches."),
        );
      })
      .finally(() => active && setBatchesLoading(false));
    return () => {
      active = false;
    };
  }, [employee, employeeId, isMentor, batchesReload]);
  useEffect(() => {
    if (!employee || !isMentor) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCourseCatalog([]);
      return;
    }
    let active = true;
    courseService
      .getCourses({ page: 1, pageSize: 1000 })
      .then((result) => active && setCourseCatalog(Array.isArray(result?.data) ? result.data : []))
      .catch(() => active && setCourseCatalog([]));
    return () => {
      active = false;
    };
  }, [employee, isMentor]);
  useEffect(() => {
    if (
      !employee ||
      ![
        "Attendance",
        "Work Progress",
        "Payroll & Payslips",
        "Access & Permissions",
      ].includes(tab)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords([]);
      return;
    }
    let active = true;
    permissionsDirtyRef.current = false;
    setTabLoading(true);
    const request =
      tab === "Attendance"
        ? employeeService.getAttendance(employeeId)
        : tab === "Work Progress"
          ? employeeService.getWorkProgress(employeeId)
            : tab === "Payroll & Payslips"
              ? employeeService.getPayslips(employeeId)
            : Promise.all([permissionApi.modules(), permissionApi.byEmployee(employeeId)]);
    request
      .then((result) => {
        if (!active) return;
        if (tab === "Access & Permissions") {
          const [modules, employeePermissions] = result;
          const catalog = (Array.isArray(modules) ? modules : []).map((item) => ({
            id: moduleKey(item?.moduleKey ?? item?.moduleName ?? item?.module ?? item?.name ?? item?.id),
            label: item?.moduleName ?? item?.module ?? item?.name ?? item?.label ?? "Module",
            permissionId: item?.permissionId ?? item?.moduleId ?? item?.id,
          })).filter((item) => item.id);
          if (catalog.length) setPermissionModules(catalog);
          // Do not replace a user's clicks with a slower response that started
          // before the bulk or individual permission changes.
          if (!permissionsDirtyRef.current) {
            setPermissions(
              permissionRowsToMatrix(
                    employeePermissions?.permissions ?? employeePermissions?.data?.permissions ?? employeePermissions?.data ?? employeePermissions,
                    catalog,
                  ),
            );
          }
        } else setRecords(toRows(result));
      })
      .catch(
        (requestError) =>
          active &&
          toast.error(
            getApiErrorMessage(
              requestError,
              `Unable to load ${tab.toLowerCase()}.`,
            ),
          ),
      )
      .finally(() => active && setTabLoading(false));
    return () => {
      active = false;
    };
  }, [employee, employeeId, tab]);
  useEffect(() => {
    if (tab !== "Attendance") return undefined;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, [tab]);
  // Overview KPI: this month's attendance, loaded once per employee.
  useEffect(() => {
    if (!employee || !employeeId) return undefined;
    let active = true;
    employeeService.getAttendance(employeeId)
      .then((result) => { if (active) setOverviewAttendance(toRows(result).map(attendanceRow)); })
      .catch(() => { if (active) setOverviewAttendance([]); });
    return () => { active = false; };
  }, [employee, employeeId]);
  const monthAttendance = useMemo(() => {
    if (!overviewAttendance) return null;
    const month = new Date().toISOString().slice(0, 7);
    const rows = overviewAttendance.filter((row) => String(row.date ?? "").slice(0, 7) === month);
    if (!rows.length) return null;
    const present = rows.filter((row) => row.checkOut || /present|complete/i.test(String(row.status ?? ""))).length;
    return Math.round((present / rows.length) * 100);
  }, [overviewAttendance]);
  const attendanceRows = useMemo(() => records.map(attendanceRow), [records]);
  const minutesOf = useMemo(() => (row) => attendanceMinutes(row, now), [now]);

  const selectTab = (next) => {
    const nextParams = new URLSearchParams(params);
    next === "Overview"
      ? nextParams.delete("tab")
      : nextParams.set("tab", next);
    setParams(nextParams);
  };
  const openStudent = (student) => {
    const studentId = student?.studentId ?? student?.id;
    if (studentId === undefined || studentId === null || studentId === "") {
      toast.error("This student record is missing an ID, so its details page cannot be opened.");
      return;
    }
    navigate(
      ROUTES.ORG_ADMIN.STUDENT_DETAILS.replace(":studentId", encodeURIComponent(studentId)),
    );
  };
  const savePermissions = async () => {
    if (!employeeId) {
      toast.error("Unable to update permissions: employee ID is missing.");
      return;
    }
    setSaving(true);
    try {
      await permissionApi.updateEmployee(employeeId, { permissions });
      permissionsDirtyRef.current = false;
      toast.success("Employee permissions updated successfully.");
    } catch (requestError) {
      toast.error(
        getApiErrorMessage(requestError, "Unable to update permissions."),
      );
    } finally {
      setSaving(false);
    }
  };
  const setAllPermissions = (enabled) => {
    permissionsDirtyRef.current = true;
    setPermissions((current) => Object.fromEntries(
      permissionModules.map((module) => {
        const key = moduleKey(module.id ?? module.label);
        return [key, {
          ...(current[key] ?? {}),
          canView: enabled,
          canAdd: enabled,
          canEdit: enabled,
          canDelete: enabled,
          canAccess: enabled,
        }];
      }),
    ));
  };
  const saveProfileDetails = async (payload) => {
    setSaving(true);
    try {
      await employeeService.updateEmployee(employeeId, { ...employee, ...payload });
      const result = await employeeService.getEmployee(employeeId);
      setEmployee(normalizeEmployeeDetails(result?.data ?? result));
      toast.success("Employee profile section saved successfully.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError, "Unable to save employee profile."));
      throw requestError;
    } finally {
      setSaving(false);
    }
  };
  if (loading)
    return (
      <div className="mx-auto max-w-7xl p-6">
        <TableSkeleton rows={5} columns={3} />
      </div>
    );
  if (error || !employee)
    return (
      <div className="mx-auto max-w-7xl p-6">
        <EmptyState
          icon={User}
          title="Employee not found"
          description={error || "The employee is unavailable."}
          action={
            <Button onClick={() => navigate(ROUTES.ORG_ADMIN.EMPLOYEES)}>
              Back to Employees
            </Button>
          }
        />
      </div>
    );
  const recordKeys = records[0] ? Object.keys(records[0]).slice(0, 7) : [];
  return (
    <main className="org-employee-profile mx-auto w-full max-w-[1500px] space-y-4 px-4 py-3 sm:px-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.ORG_ADMIN.EMPLOYEES)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3b5270] hover:text-[#0f2a4a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to employees
      </button>
      <ProfileHero
        name={employeeName}
        status={label(employee.status) || "Active"}
        statusTone={/inactive|terminat|resign/i.test(String(employee.status ?? "")) ? "red" : "green"}
        avatarText={(employee.firstName ?? employeeName ?? "?").charAt(0).toUpperCase()}
        photo={fetchedPhoto || embeddedPhoto || undefined}
        online={/active/i.test(String(employee.status ?? "active")) && !/inactive/i.test(String(employee.status ?? ""))}
        subline={<>Employee ID: {employee.employeeCode ?? employee.employeeId ?? "Not assigned"}<em>|</em>{employee.designation ?? employee.role ?? "-"}</>}
        email={employee.email}
        phone={employee.phone}
        location={[employee.city, employee.state].filter(Boolean).join(", ") || employee.address || employee.addressLine1}
        tiles={[
          { icon: CalendarDays, label: "Employment Type", value: label(normalizeEmploymentType(employee.employeeType ?? employee.employmentType)) },
          { icon: UserRound, label: "Designation", value: employee.designation ?? employee.role },
        ]}
        image={ORG_BANNERS.employeeProfile?.src}
        action={
          <button type="button" className="pk-btn pk-btn--orange" onClick={() => selectTab("Profile Details")}>
            <Pencil /> Edit Profile
          </button>
        }
      />
      <ProfileTabs
        label="Employee sections"
        active={tab}
        onChange={selectTab}
        items={tabs.map((item) => ({ id: item, label: item, icon: TAB_ICONS[item] ?? LayoutGrid }))}
      />
      {tabLoading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : tab === "Profile Details" ? (
        <EmployeeProfileWizard initialData={employee} onSave={saveProfileDetails} onComplete={() => selectTab("Overview")} title="Employee profile" />
      ) : tab === "Overview" ? (
        <div className="space-y-4">
          {isMentor && (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile tone="blue" icon={Users} labelFirst label="Total Students" value={studentsLoading ? "…" : assignedStudents.length} link="View Students" onClick={() => selectTab("Students")} />
              <StatTile tone="green" icon={GraduationCap} labelFirst label="Assigned Batches" value={batchesLoading ? "…" : assignedBatches.length} link="View Batches" onClick={() => selectTab("Batches")} />
              <StatTile tone="purple" icon={BookOpen} labelFirst label="Courses Handled" value={batchesLoading ? "…" : assignedCourses.length} link="View Courses" onClick={() => selectTab("Courses")} />
              <StatTile tone="orange" icon={Clock} labelFirst label="Attendance (This Month)" value={monthAttendance == null ? "—" : `${monthAttendance}%`} link="View Attendance" onClick={() => selectTab("Attendance")} />
            </div>
          )}
          <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <PanelCard icon={User} title="Contact Information" action={<button type="button" className="pk-btn pk-btn--outline pk-btn--sm" onClick={() => selectTab("Profile Details")}><Pencil /> Edit</button>}>
                <div className="pk-fields">
                  {[
                    [Mail, "Email", employee.email],
                    [Phone, "Phone", employee.phone],
                    [MapPin, "Address", employee.address ?? employee.addressLine1],
                    [Phone, "Emergency Contact", [employee.emergencyContactName, employee.emergencyContactPhone].filter(Boolean).join(" · ")],
                  ].map(([Icon, name, value]) => (
                    <div key={name} className="pk-field"><span><Icon /></span><div className="min-w-0"><small>{name}</small><b title={value || undefined}>{value || "-"}</b></div></div>
                  ))}
                </div>
              </PanelCard>
              {isMentor && (
                <PanelCard
                  icon={Layers3}
                  title={`Assigned Batches (${assignedBatches.length})`}
                  action={<button type="button" className="pk-btn pk-btn--outline pk-btn--sm !text-[#1d63d8]" onClick={() => selectTab("Batches")}>View All</button>}
                >
                  {assignedBatches.length ? (
                    <div className="space-y-3">
                      {assignedBatches.slice(0, 3).map((batch, index) => (
                        <article key={batch.batchId} className={`pk-mini-batch ${index % 2 ? "is-orange" : "is-blue"}`}>
                          <div className="flex items-start gap-3">
                            <span className="pk-mini-batch__icon" aria-hidden="true"><UsersRound /></span>
                            <div className="min-w-0 flex-1">
                              <h4>{batch.batchName || `Batch ${batch.batchId}`}</h4>
                              <p>{batch.courseName || "Course not available"}</p>
                            </div>
                            <StatusPill status={batch.status ?? "Active"} />
                          </div>
                          <div className="pk-mini-batch__stats">
                            <div><Users /><span><small>Students</small><b>{batch.studentCount ?? batch.studentsCount ?? 0}/{batch.capacity ?? "-"}</b></span></div>
                            <div><IdCard /><span><small>Batch ID</small><b>{batch.batchId}</b></span></div>
                            <div><CalendarDays /><span><small>Starts</small><b>{date(batch.startDate)}</b></span></div>
                            <div><CalendarDays /><span><small>Ends</small><b>{date(batch.endDate)}</b></span></div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No batches are assigned to this mentor.</p>
                  )}
                </PanelCard>
              )}
            </div>
            <div className="space-y-4">
              <PanelCard icon={Briefcase} title="Employment Details" action={<button type="button" className="pk-btn pk-btn--outline pk-btn--sm" onClick={() => selectTab("Profile Details")}><Pencil /> Edit</button>}>
                <div className="pk-kv-grid">
                  {[
                    [IdCard, "Employee ID", employee.employeeCode ?? employee.employeeId],
                    [UserRound, "Designation", employee.designation ?? employee.role],
                    [CalendarDays, "Joining Date", date(employee.joiningDate)],
                    [FileText, "Employment Type", label(normalizeEmploymentType(employee.employeeType ?? employee.employmentType))],
                    [Network, "Reporting Manager", employee.reportingManagerName ?? employee.reportingManager],
                    [Building2, "Salary Structure", employee.salaryStructureName],
                    [Wallet, "Gross Salary", money(employee.grossSalary ?? employee.salary)],
                    [Star, "Status", <StatusPill key="status" status={label(employee.status) || "Active"} />, "orange"],
                  ].map(([Icon, name, value, tone]) => (
                    <div key={name} className="pk-kv"><span className={tone ? `is-${tone}` : undefined}><Icon /></span><small>{name}</small><b>{value || "-"}</b></div>
                  ))}
                </div>
              </PanelCard>
              <PanelCard icon={Landmark} title="Bank Details" action={<button type="button" className="pk-btn pk-btn--outline pk-btn--sm" onClick={() => selectTab("Profile Details")}><Pencil /> Edit</button>}>
                <div className="pk-kv-grid">
                  {[
                    [UserRound, "Account Holder", employee.bankDetails?.accountHolderName, "orange"],
                    [Landmark, "Bank", employee.bankDetails?.bankName],
                    [CreditCard, "Account Number", employee.bankDetails?.maskedAccountNumber ?? "Restricted"],
                    [BadgeCheck, "IFSC", employee.bankDetails?.ifscCode, "purple"],
                    [Building2, "Branch", employee.bankDetails?.branchName, "orange"],
                  ].map(([Icon, name, value, tone]) => (
                    <div key={name} className="pk-kv"><span className={tone ? `is-${tone}` : undefined}><Icon /></span><small>{name}</small><b>{value || "-"}</b></div>
                  ))}
                </div>
              </PanelCard>
            </div>
          </div>
        </div>
      ) : tab === "Access & Permissions" ? (
        <Card title="Role & screen access" icon={ShieldCheck}>
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Assign screen permissions</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose individual actions or use bulk controls, then save the changes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setAllPermissions(true)}
                disabled={saving || !permissionModules.length}
              >
                Full access
              </Button>
              <Button
                variant="secondary"
                onClick={() => setAllPermissions(true)}
                disabled={saving || !permissionModules.length}
              >
                Mark all
              </Button>
              <Button
                variant="secondary"
                onClick={() => setAllPermissions(false)}
                disabled={saving || !permissionModules.length}
              >
                Unmark all
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-slate-400">
                  <th className="p-3">Module</th>
                  {ACTIONS.map((action) => (
                    <th key={action} className="p-3 text-center">
                      {action}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionModules.map((module) => {
                  const key = moduleKey(module.id ?? module.label);
                  return (
                    <tr
                      key={key}
                      className="border-b border-slate-100 dark:border-slate-800"
                    >
                      <td className="p-3 font-semibold">{module.label}</td>
                      {ACTIONS.map((action) => (
                        <td key={action} className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={Boolean(permissions[key]?.[ACTION_FIELDS[action]])}
                            onChange={(event) => {
                              permissionsDirtyRef.current = true;
                              setPermissions((current) => ({
                                ...current,
                                [key]: {
                                  ...(current[key] ?? {}),
                                  [ACTION_FIELDS[action]]: event.target.checked,
                                },
                              }))
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <Button loading={saving} onClick={savePermissions}>
              <Check className="mr-1 h-4 w-4" />
              Save permissions
            </Button>
          </div>
        </Card>
      ) : tab === "Students" ? (
        <section>
          <SectionHead icon={Users} title="Students" subtitle="Students across the batches assigned to this employee." />
          <p className="pk-count">
            {studentsLoading ? "Loading…" : `${assignedStudents.length} Student${assignedStudents.length === 1 ? "" : "s"}`}
          </p>
          <div className="pk-panel p-4">
            <StudentsTab
              students={assignedStudents}
              loading={studentsLoading}
              error={studentsError}
              onRetry={() => setStudentsReload((value) => value + 1)}
              onSelectStudent={openStudent}
            />
          </div>
        </section>
      ) : tab === "Batches" ? (
        batchesLoading || batchesError ? (
          <BatchesTab batches={assignedBatches} loading={batchesLoading} error={batchesError} onRetry={() => setBatchesReload((value) => value + 1)} mentorName={employeeName} />
        ) : (
          <BatchCards
            batches={assignedBatches}
            mentorName={employeeName}
            onOpen={(batch) => navigate(ROUTES.ORG_ADMIN.BATCH_DETAILS.replace(":batchId", encodeURIComponent(batch.batchId)))}
            empty={<EmptyState icon={Layers3} title="No batches found" description="No batches match this search, or none are assigned to this mentor." />}
          />
        )
      ) : tab === "Courses" ? (
        batchesLoading || batchesError ? (
          <CoursesTab courses={assignedCourses} loading={batchesLoading} error={batchesError} onRetry={() => setBatchesReload((value) => value + 1)} />
        ) : (
          <CourseCards
            courses={assignedCourses}
            onOpen={(course) => navigate(ROUTES.ORG_ADMIN.COURSE_DETAILS.replace(":courseId", encodeURIComponent(course.courseId)))}
            empty={<EmptyState icon={BookOpen} title="No courses found" description="No courses match this search, or none are assigned to this mentor." />}
          />
        )
      ) : tab === "Attendance" ? (
        <AttendancePanel rows={attendanceRows} minutesOf={minutesOf} fileName={`attendance-${employee.employeeId ?? employeeId}`} />
      ) : (
        <Card
          title={tab}
          icon={
            tab === "Attendance"
              ? Clock
              : tab === "Work Progress"
                ? Briefcase
                : DollarSign
          }
        >
          {records.length ? (
            (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs uppercase text-slate-400">
                      {recordKeys.map((key) => (
                        <th key={key} className="p-3">
                          {label(key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr
                        key={
                          record.id ??
                          record.attendanceId ??
                          record.payslipId ??
                          index
                        }
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        {recordKeys.map((key) => (
                          <td key={key} className="p-3">
                            {String(record[key] ?? "-")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <EmptyState
              icon={tab === "Attendance" ? CalendarDays : Briefcase}
              title={`No ${tab.toLowerCase()} records`}
              description="No records are available for this employee yet."
            />
          )}
        </Card>
      )}
    </main>
  );
}
