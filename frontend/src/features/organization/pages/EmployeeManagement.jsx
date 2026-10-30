import { personNameError } from "@shared/utils/personName";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import OrgShowcaseHero from "@features/organization/components/showcase/OrgShowcaseHero";
import { ORG_BANNERS } from "@features/organization/constants/orgBanners";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  CalendarCheck,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  Edit3,
  GraduationCap,
  Loader2,
  Mail,
  Plus,
  Phone,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  ShieldCheck,
  X,
  Check,
} from "lucide-react";

import EmployeeKpiCard from "@features/organization/components/employee-management/EmployeeKpiCard";
import EmployeeCard, { EmployeeCardSkeleton } from "@features/organization/components/employee-management/EmployeeCard";
import "./employees-density.css";
import ModalHero from "@shared/components/ModalHero";
import Card from "@shared/components/Card";
import Modal from "@shared/components/Modal";
import EmptyState from "@shared/components/EmptyState";
import { Button, Input, Select } from "@shared/components/FormElements";
import {
  branchApi,
  departmentApi,
  getApiErrorMessage,
} from "@shared/services/apiServices";
import { employeeService } from "@shared/services/employeeService";
import { authService } from "@shared/services/authService";
import { permissionApi } from "@shared/services/platformModulesApi";
import EmployeeStatusBadge from "@shared/components/EmployeeStatusBadge";
import { normalizeEmploymentType, normalizeEmployeeStatus as normalizeStatus } from "@shared/utils/employeePresentation";
import { batchService } from "@shared/services/batchService";
import { HR_ROLE_IDS, normalizeUserRole } from "@shared/constants/roles";
import { findHrUserByEmail, removeHrUser, upsertHrUser } from "@features/hr/services/hrUserStore";
import PermissionMatrix from "@features/hr/components/PermissionMatrix";
import { emptyPermissions, normalizePermissions } from "@features/hr/constants/hrPermissionMatrix";
import { hrModuleApi, hrField, hrList } from "@features/hr/services/hrApi";
import { ROUTES } from "@shared/constants/routeConstants";
import usePermission from "@shared/hooks/usePermission";
import { useProfilePhotos } from "@shared/hooks/useProfilePhoto";
import { PROFILE_TYPE, toProfileId } from "@shared/services/profilePhotoService";

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  // The On Leave KPI card filters to this view; the loader supports it.
  { value: "On Leave", label: "On Leave" },
];

// Server-side sort (SORT_MAP keys) — replaces the old sortable table headers.
const SORT_OPTIONS = [
  { value: "firstName:asc", label: "Name A–Z" },
  { value: "firstName:desc", label: "Name Z–A" },
  { value: "email:asc", label: "Email A–Z" },
  { value: "designation:asc", label: "Designation A–Z" },
  { value: "employeeId:desc", label: "Newest first" },
  { value: "employeeId:asc", label: "Oldest first" },
];

const ROLE_OPTIONS = [
  { value: "", label: "Select Role" },
  { value: "mentor", label: "Mentor" },
  { value: "employee", label: "Employee" },
  { value: "hr", label: "HR" },
];

const isHrEmployee = (employee) =>
  normalizeUserRole(employee?.role) === "hr" ||
  /^(hr|human\s*resources?)(\s|$)/i.test(String(employee?.designation || ""));

// Mirrors the mentor/tutor detection already used for batch-assignment lookups
// in this file, so the Mentors KPI agrees with the rest of the page instead of
// introducing a second definition of "mentor".
const isMentorDesignation = (employee) =>
  /mentor|tutor/i.test(String(employee?.role ?? employee?.designation ?? ""));

// GET /api/hr/leave is the same live endpoint the HR > Leave Management module
// reads (see HrApiModule.jsx). "Currently on leave" is derived client-side
// because the backend only filters by exact Status text and does not expose a
// "currently active" flag — approved requests whose fromDate..toDate span
// today (in the browser's local timezone) count as on leave.
const localDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const isApprovedLeaveStatus = (status) =>
  String(status ?? "").trim().toLowerCase() === "approved";

const isLeaveActiveToday = (row, todayKey) => {
  if (!isApprovedLeaveStatus(hrField(row, "status"))) return false;
  const from = hrField(row, "fromDate", "startDate");
  const to = hrField(row, "toDate", "endDate");
  if (!from || !to) return false;
  const fromKey = String(from).slice(0, 10);
  const toKey = String(to).slice(0, 10);
  return fromKey <= todayKey && todayKey <= toKey;
};

const identityKeys = (value) => [
  value?.employeeId,
  value?.employeeID,
  value?.employee_id,
  value?.userId,
  value?.id,
  value?.employee?.employeeId,
  value?.employee?.id,
  value?.employeeEmail,
  value?.email,
  value?.employee?.email,
  value?.employeeName,
  value?.name,
].filter((item) => item !== undefined && item !== null && String(item).trim() !== "")
  .map((item) => String(item).trim().toLowerCase());

// Local HR profiles are only used by the explicit demo session.
const isDemoHrEmployee = (employee) =>
  localStorage.getItem("isDemo") === "true" && isHrEmployee(employee);

const permissionsFromMatrix = (rows, matrix) => Object.fromEntries(
  rows.map((row) => [
    row.key,
    ["view", "add", "edit", "delete", "access"].filter(
      (permission) => Boolean(matrix?.[row.key]?.[permission]),
    ),
  ]),
);

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Intern", label: "Intern" },
];

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  alternatePhone: "",
  address: "",
  departmentId: "",
  designation: "",
  joiningDate: "",
  employmentType: "Full-time",
  salaryStructure: "",
  basicSalary: "",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  confirmAccountNumber: "",
  ifscCode: "",
  createLogin: true,
  sendCredentialsEmail: true,
  role: "",
  status: "active",
};

const matrixFromPermissionRows = (rows) => Object.fromEntries(
  rows.map((row) => [row.key, {
    view: Boolean(row.canView),
    add: Boolean(row.canAdd),
    edit: Boolean(row.canEdit),
    delete: Boolean(row.canDelete),
    access: Boolean(row.canAccess),
  }]),
);

const firstPermissionId = (...values) => values.find((value) =>
  value !== null && value !== undefined && String(value).trim() !== "",
);

const permissionUserId = (employee) => firstPermissionId(
  employee?.userId,
  employee?.UserId,
  employee?.userID,
  employee?.user_id,
  employee?.authUserId,
  employee?.authUserID,
  employee?.applicationUserId,
  employee?.organizationUserId,
  employee?.accountId,
  employee?.user?.userId,
  employee?.user?.UserId,
  employee?.user?.id,
  employee?.account?.userId,
  employee?.account?.id,
  employee?.authUser?.id,
);

const userRows = (payload) => {
  if (Array.isArray(payload)) return payload;
  return [payload?.items, payload?.users, payload?.data, payload?.data?.items, payload?.data?.users]
    .find(Array.isArray) || [];
};

const SORT_MAP = {
  employeeId: "EmployeeId",
  firstName: "FirstName",
  lastName: "LastName",
  name: "FirstName",
  email: "Email",
  phone: "Phone",
  designation: "Designation",
  branch: "BranchId",
  batch: "BatchId",
  role: "Designation",
  joiningDate: "JoiningDate",
  status: "Status",
};

const clampPage = (page, totalPages) => {
  const safeTotal = Math.max(1, Number(totalPages) || 1);
  return Math.min(Math.max(1, Number(page) || 1), safeTotal);
};

const buildPageWindow = (currentPage, totalPages) => {
  const windowSize = 5;
  if (totalPages <= windowSize)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + windowSize - 1);
  const adjustedStart = Math.max(1, end - windowSize + 1);

  return Array.from(
    { length: end - adjustedStart + 1 },
    (_, index) => adjustedStart + index,
  );
};


const getEmployeeName = (employee) =>
  [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim() ||
  employee.name ||
  employee.employeeName ||
  "-";

const normalizedText = (value) => String(value ?? "").trim().toLowerCase();

const batchMatchesEmployee = (batch, employee) => {
  const batchMentor = batch.mentor ?? {};
  // A batch's mentorId is a Mentor profile ID and never equals an EmployeeId
  // by meaning, so IDs are compared only within the same namespace.
  const same = (a, b) => a != null && b != null && String(a).trim() !== "" && String(a) === String(b);
  const batchMentorId = batch.mentorId ?? batch.trainerId ?? batchMentor.mentorId;
  if (same(batchMentorId, employee.mentorId)) return true;
  if (same(batchMentor.employeeId, employee.employeeId ?? employee.id)) return true;

  const employeeEmail = normalizedText(employee.email);
  const batchEmail = normalizedText(batch.mentorEmail ?? batchMentor.email);
  if (employeeEmail && batchEmail && employeeEmail === batchEmail) return true;

  const employeeName = normalizedText(getEmployeeName(employee));
  const batchName = normalizedText(
    batch.mentorName ?? batchMentor.mentorName ?? batchMentor.name ?? batchMentor.fullName,
  );
  return Boolean(employeeName && batchName && employeeName === batchName);
};

const normalizeEmployee = (employee, departments, branches) => {
  const departmentId =
    employee.departmentId ??
    employee.department?.departmentId ??
    employee.department?.id;
  const branchId =
    employee.branchId ?? employee.branch?.branchId ?? employee.branch?.id;
  const batchId =
    employee.batchId ??
    employee.batch?.batchId ??
    employee.batch?.id ??
    employee.batch;

  const departmentLabel =
    employee.department?.name ??
    employee.departmentName ??
    departments.find(
      (item) => Number(item.departmentId ?? item.id) === Number(departmentId),
    )?.name ??
    (departmentId ? `Department #${departmentId}` : "-") ??
    "-";

  const branchLabel =
    employee.branch?.name ??
    employee.branchName ??
    branches.find(
      (item) => Number(item.branchId ?? item.id) === Number(branchId),
    )?.name ??
    branchId ??
    "-";

  return {
    ...employee,
    id: employee.employeeId ?? employee.id,
    employeeId: employee.employeeId ?? employee.id,
    firstName: employee.firstName ?? "",
    lastName: employee.lastName ?? "",
    name: getEmployeeName(employee),
    email: employee.email ?? "",
    phone: employee.phone ?? "",
    departmentId,
    branchId,
    batchId,
    department: departmentLabel,
    branch: branchLabel,
    batch:
      employee.batch?.batchName ??
      employee.batchName ??
      employee.batch ??
      batchId ??
      "-",
    role: employee.role ?? employee.designation ?? "-",
    designation: employee.role ?? employee.designation ?? "-",
    employmentType: normalizeEmploymentType(employee.employeeType ?? employee.employmentType),
    status: normalizeStatus(employee.status),
  };
};

const buildEmployeePayload = (form) => {
  const normalizedRole = String(form.role || "").trim().toLowerCase();
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    role: ({ mentor: "Mentor", tutor: "Tutor", employee: "Employee", hr: "HR" })[normalizedRole] ?? form.role.trim(),
    status: form.status.trim().toLowerCase() === "inactive" ? "Inactive" : "Active",
    employeeType: form.employmentType,
  };
};

export default function EmployeeManagement() {
  const navigate = useNavigate();
  const { can } = usePermission();
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState([]);
  const [workforceStats, setWorkforceStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    mentors: 0,
    hr: 0,
  });
  const [onLeaveCount, setOnLeaveCount] = useState(null);
  const [onLeaveError, setOnLeaveError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("firstName");
  const [sortOrder, setSortOrder] = useState("asc");
  // Row selection is scoped to the rows currently loaded; it is reset whenever
  // the list is reloaded (page, search, filter, sort or after a change).
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [accessEmployee, setAccessEmployee] = useState(null);
  const [permissionRows, setPermissionRows] = useState([]);
  const [accessMatrix, setAccessMatrix] = useState({});
  const [hrAccessPermissions, setHrAccessPermissions] = useState(() => emptyPermissions());
  const [editingAccess, setEditingAccess] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [savingStatusId, setSavingStatusId] = useState(null);

  const openAccess = async (employee) => {
    setAccessMatrix({});
    setPermissionRows([]);
    setEditingAccess(false);
    setAccessError("");
    setAccessLoading(true);

    const employeeId = employee.employeeId ?? employee.id;
    let selectedEmployee = employee;
    let userId = permissionUserId(selectedEmployee);
    if (!userId && employeeId) {
      try {
        const details = await employeeService.getEmployee(employeeId);
        selectedEmployee = { ...employee, ...(details?.data ?? details) };
        userId = permissionUserId(selectedEmployee);
      } catch {
        // The permission API below will provide the visible error state.
      }
    }
    if (!userId && selectedEmployee.email) {
      try {
        const users = userRows(await authService.getUsers({ email: selectedEmployee.email }));
        const linkedUser = users.find((user) =>
          String(user.email ?? user.emailAddress ?? "").trim().toLowerCase()
            === String(selectedEmployee.email).trim().toLowerCase(),
        );
        userId = permissionUserId(linkedUser);
        if (userId) selectedEmployee = { ...selectedEmployee, userId };
      } catch {
        // User lookup is optional because some deployments restrict this endpoint.
      }
    }
    if (userId) selectedEmployee = { ...selectedEmployee, userId };
    setAccessEmployee(selectedEmployee);
    if (isDemoHrEmployee(selectedEmployee)) {
      const hrUser = findHrUserByEmail(selectedEmployee.email);
      setHrAccessPermissions(normalizePermissions(hrUser?.permissions));
      setAccessLoading(false);
      return;
    }
    const role = selectedEmployee.role ?? selectedEmployee.designation ?? "employee";
    if (import.meta.env.DEV && userId) {
      console.log("[EmployeePermissions] employee:", selectedEmployee);
      console.log("[EmployeePermissions] userId:", userId);
    }
    try {
      const [rows, catalogRows] = await Promise.all([
        permissionApi.effectiveByEmployee(employeeId, role),
        // Best-effort: a module nobody has ever saved a role/employee value
        // for is absent from `rows` entirely, so without the catalog it can
        // never be shown or granted here. Fall back to `rows` alone if the
        // catalog request fails — no regression from today's behavior.
        permissionApi.moduleCatalogRows().catch(() => []),
      ]);
      const rowsByKey = new Map(rows.map((row) => [row.key, row]));
      const completeRows = catalogRows.length
        ? catalogRows.map((catalogRow) => rowsByKey.get(catalogRow.key) ?? catalogRow)
        : rows;
      if (import.meta.env.DEV) {
        console.debug("[EmployeePermissions] effective rows:", completeRows.map((row) => ({
          permissionId: row.permissionId, key: row.key, module: row.module, canAccess: row.canAccess,
        })));
        const duplicateIds = completeRows.map((row) => row.permissionId).filter((id, index, all) => all.indexOf(id) !== index);
        if (duplicateIds.length) console.warn("[EmployeePermissions] duplicate permissionId(s) after normalization:", duplicateIds);
      }
      setPermissionRows(completeRows);
      setAccessMatrix(matrixFromPermissionRows(completeRows));
      localStorage.setItem(`kini:employee-permissions:${employeeId}`, JSON.stringify(completeRows));
      if (selectedEmployee.email) localStorage.setItem(`kini:employee-permissions:email:${selectedEmployee.email.trim().toLowerCase()}`, JSON.stringify(completeRows));
    } catch (error) {
      setPermissionRows([]);
      setAccessMatrix({});
      setAccessError(getApiErrorMessage(error, "Unable to load permissions from the server."));
    } finally {
      setAccessLoading(false);
    }
  };

  const closeAccess = () => {
    if (savingPermissions) return;
    setAccessEmployee(null);
    setEditingAccess(false);
    if (searchParams.has("access")) {
      const next = new URLSearchParams(searchParams);
      next.delete("access");
      setSearchParams(next, { replace: true });
    }
  };

  const toggleAccess = (moduleKey, permission) => {
    if (!editingAccess) return;
    setAccessMatrix((current) => ({
      ...current,
      [moduleKey]: {
        ...current[moduleKey],
        [permission]: !current[moduleKey]?.[permission],
      },
    }));
  };
  const setAllPermissions = (enabled) => {
    if (!editingAccess) return;
    const permissions = ["view", "add", "edit", "delete", "access"];
    setAccessMatrix(Object.fromEntries(
      permissionRows.map((row) => [
        row.key,
        Object.fromEntries(permissions.map((permission) => [permission, enabled])),
      ]),
    ));
  };
  const savePermissions = async () => {
    if (!accessEmployee || savingPermissions) return;
    if (isDemoHrEmployee(accessEmployee)) {
      upsertHrUser({
        id: findHrUserByEmail(accessEmployee.email)?.id || "",
        name: accessEmployee.firstName || accessEmployee.name,
        lastName: accessEmployee.lastName,
        email: accessEmployee.email,
        mobile: accessEmployee.phone,
        designation: accessEmployee.designation || "HR",
        employeeType: accessEmployee.employmentType,
        status: normalizeStatus(accessEmployee.status),
        role: "HR",
        hrRole: findHrUserByEmail(accessEmployee.email)?.hrRole || HR_ROLE_IDS.EXECUTIVE,
        permissions: hrAccessPermissions,
      });
      toast.success("HR permissions updated successfully.");
      setEditingAccess(false);
      return;
    }
    const employeeId = accessEmployee.employeeId ?? accessEmployee.id;
    if (!employeeId) {
      setEditingAccess(false);
      return;
    }
    if (!accessMatrix || typeof accessMatrix !== "object" || !Object.keys(accessMatrix).length) {
      toast.error("Please select at least one permission before saving.");
      return;
    }
    setSavingPermissions(true);
    try {
      const payload = permissionRows.map((row) => ({
        ...row,
        permissionId: row.permissionId,
        module: row.module,
        canView: Boolean(accessMatrix[row.key]?.view),
        canAdd: Boolean(accessMatrix[row.key]?.add),
        canEdit: Boolean(accessMatrix[row.key]?.edit),
        canDelete: Boolean(accessMatrix[row.key]?.delete),
        canAccess: Boolean(accessMatrix[row.key]?.access),
      }));
      // TEMPORARY DIAGNOSTIC — remove once the Mentor Schedule Class
      // /unauthorized report is confirmed resolved.
      if (import.meta.env.DEV) {
        console.debug("[EmployeePermissions] PUT source rows:", payload);
        console.log("[EmployeePermissions] module 8 (live-classes) in PUT payload:", payload.find((row) => row.permissionId === 8) ?? "(missing from payload)");
      }
      await permissionApi.updateEmployee(employeeId, { permissions: payload });
      const refreshedRows = await permissionApi.effectiveByEmployee(
        employeeId,
        accessEmployee.role ?? accessEmployee.designation ?? "employee",
      );
      if (import.meta.env.DEV) {
        const savedRow = refreshedRows.find((row) => row.key === "live-classes" || row.permissionId === 8);
        console.log("[EmployeePermissions] module 8 (live-classes) after save + refetch:", savedRow ?? "(missing from effectiveByEmployee response)");
      }
      setPermissionRows(refreshedRows);
      setAccessMatrix(matrixFromPermissionRows(refreshedRows));
      localStorage.setItem(`kini:employee-permissions:${employeeId}`, JSON.stringify(refreshedRows));
      if (accessEmployee.email) localStorage.setItem(`kini:employee-permissions:email:${accessEmployee.email.trim().toLowerCase()}`, JSON.stringify(refreshedRows));
      setEmployees((current) =>
        current.map((employee) =>
          (employee.employeeId ?? employee.id) === employeeId
            ? { ...employee, permissions: accessMatrix }
            : employee,
        ),
      );
      if (isDemoHrEmployee(accessEmployee)) {
        const existingHrUser = findHrUserByEmail(accessEmployee.email);
        upsertHrUser({
          id: existingHrUser?.id || "",
          name: accessEmployee.firstName || accessEmployee.name,
          lastName: accessEmployee.lastName,
          email: accessEmployee.email,
          mobile: accessEmployee.phone,
          designation: accessEmployee.designation || "HR",
          employeeType: accessEmployee.employmentType,
          status: normalizeStatus(accessEmployee.status),
          role: "HR",
          hrRole: existingHrUser?.hrRole || HR_ROLE_IDS.EXECUTIVE,
          permissions: permissionsFromMatrix(permissionRows, accessMatrix),
        });
      }
      toast.success(isHrEmployee(accessEmployee)
        ? "HR permissions updated successfully."
        : "Employee permissions updated successfully.");
      setEditingAccess(false);
      if (searchParams.has("access")) {
        const next = new URLSearchParams(searchParams);
        next.delete("access");
        setSearchParams(next, { replace: true });
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Unable to update permissions. Please try again.",
        ),
        { id: "employee-permission-update-error" },
      );
    } finally {
      setSavingPermissions(false);
    }
  };
  const [form, setForm] = useState(INITIAL_FORM);

  const loadEmployees = useCallback(
    async function loadEmployees({
      pageNumber = page,
      size = pageSize,
    } = {}) {
      setLoading(true);
      setErrorMessage("");

      const [employeesResult, departmentsResult, branchesResult, totalResult, batchesResult, leaveResult] =
        await Promise.allSettled([
          employeeService.getEmployees({
            searchText: searchText.trim(),
            // Leave is maintained by the HR leave API, not as an employee
            // status. Load the roster normally and apply the leave filter
            // after joining the two datasets below.
            status: statusFilter === "On Leave" ? undefined : statusFilter || undefined,
            sortBy: SORT_MAP[sortField] || SORT_MAP.firstName,
            isDescending: sortOrder === "desc",
            pageNumber,
            pageSize: size,
          }),
          departmentApi.list(),
          branchApi.list(),
          employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 }),
          batchService.getOrganizationBatches({ pageNumber: 1, pageSize: 1000 }),
          hrModuleApi("leave").list({ Page: 1, Limit: 1000 }),
        ]);

      const organizationBatches = batchesResult.status === "fulfilled"
        ? (batchesResult.value?.data ?? [])
        : [];

      let unfilteredTotal = null;
      if (totalResult.status === "fulfilled") {
        const summaryPayload = totalResult.value || {};
        const summaryRows = Array.isArray(summaryPayload.data)
          ? summaryPayload.data
          : [];
        const reportedTotal = Number(
          summaryPayload.totalRecords ??
            summaryPayload.totalCount ??
            summaryRows.length,
        );
        unfilteredTotal = Math.max(reportedTotal, summaryRows.length);
        const visibleSummaryRows = summaryRows;
        setWorkforceStats({
          total: Math.max(visibleSummaryRows.length, unfilteredTotal - (summaryRows.length - visibleSummaryRows.length)),
          active: summaryRows.filter(
            (employee) => normalizeStatus(employee.status) === "active",
          ).length,
          inactive: summaryRows.filter(
            (employee) => normalizeStatus(employee.status) === "inactive",
          ).length,
          mentors: summaryRows.filter(isMentorDesignation).length,
          hr: summaryRows.filter(isHrEmployee).length,
        });
      }

      let activeLeaveEmployeeIds = new Set();
      let activeLeaveDetails = new Map();
      if (leaveResult.status === "fulfilled") {
        const todayKey = localDateKey(new Date());
        const leaveRows = hrList(leaveResult.value);
        const activeLeaveRows = leaveRows.filter((row) => isLeaveActiveToday(row, todayKey));
        activeLeaveEmployeeIds = new Set(activeLeaveRows.flatMap(identityKeys));
        activeLeaveDetails = new Map(activeLeaveRows.flatMap((row) => identityKeys(row).map((key) => [key, {
          from: hrField(row, "fromDate", "startDate"),
          to: hrField(row, "toDate", "endDate"),
        }])));
        setOnLeaveCount(new Set(activeLeaveRows.map((row) =>
          identityKeys(row)[0] || identityKeys(row)[1] || identityKeys(row)[2],
        ).filter(Boolean)).size);
        setOnLeaveError("");
      } else {
        setOnLeaveCount(null);
        setOnLeaveError(
          getApiErrorMessage(leaveResult.reason, "Unable to load leave data."),
        );
      }

      const resolvedDepartments =
        departmentsResult.status === "fulfilled" && Array.isArray(departmentsResult.value)
          ? departmentsResult.value
          : [];
      const resolvedBranches =
        branchesResult.status === "fulfilled" && Array.isArray(branchesResult.value)
          ? branchesResult.value
          : [];

      setDepartments(resolvedDepartments);
      setBranches(resolvedBranches);

      if (employeesResult.status === "fulfilled") {
        const payload = employeesResult.value || {};
        const rows = Array.isArray(payload.data) ? payload.data : [];
        const normalizedRows = rows.map((employee) =>
          normalizeEmployee(employee, resolvedDepartments, resolvedBranches),
        );
        const visibleRows = statusFilter === "On Leave"
          ? normalizedRows.filter((employee) => identityKeys(employee).some((key) => activeLeaveEmployeeIds.has(key)))
          : normalizedRows;
        const rowsWithBatches = await Promise.all(
          visibleRows.map(async (employee) => {
            const leave = identityKeys(employee).map((key) => activeLeaveDetails.get(key)).find(Boolean);
            const withLeave = leave ? { ...employee, leaveFromDate: leave.from, leaveToDate: leave.to } : employee;
            if (!/mentor|tutor/i.test(String(employee.role ?? employee.designation ?? ""))) {
              return { ...withLeave, assignedBatches: [], batchCount: 0 };
            }
            try {
              const result = await employeeService.getEmployeeBatches(
                employee.employeeId ?? employee.id,
              );
              const batchPayload = result?.data ?? result;
              const assignedBatches = Array.isArray(batchPayload?.batches)
                ? batchPayload.batches
                : [];
              // The employee-scoped endpoint is authoritative, including when it
              // reports no batches; the organization list is only a fallback
              // when that request fails.
              return {
                ...withLeave,
                assignedBatches,
                batchCount: assignedBatches.length
                  ? Number(batchPayload?.totalRecords ?? assignedBatches.length)
                  : 0,
              };
            } catch {
              const fallbackBatches = organizationBatches.filter((batch) => batchMatchesEmployee(batch, employee));
              return { ...withLeave, assignedBatches: fallbackBatches, batchCount: fallbackBatches.length };
            }
          }),
        );
        setEmployees(rowsWithBatches);
        setSelectedIds(new Set());
        const responseTotal = Number(
          payload.totalRecords ?? payload.totalCount ?? rows.length ?? 0,
        );
        const effectiveTotal =
          !searchText.trim() && !statusFilter && unfilteredTotal !== null
            ? Math.max(visibleRows.length, unfilteredTotal - (rows.length - visibleRows.length))
            : Math.max(visibleRows.length, responseTotal - (rows.length - visibleRows.length));
        setTotalRecords(effectiveTotal);
        setPage(
          clampPage(
            payload.pageNumber ?? payload.PageNumber ?? pageNumber,
            payload.totalPages ?? payload.TotalPages ?? 1,
          ),
        );
        setPageSize(Number(payload.pageSize ?? payload.PageSize ?? size));
        setTotalPages(
          Math.max(
            Number(payload.totalPages ?? payload.TotalPages ?? 1),
            Math.ceil(effectiveTotal / (Number(payload.pageSize) || size || 1)),
          ),
        );
        setLoading(false);
        return;
      }

      const requestError = employeesResult.reason;
      setEmployees([]);
      setSelectedIds(new Set());
      setTotalRecords(0);
      setTotalPages(1);
      setWorkforceStats({ total: 0, active: 0, inactive: 0, mentors: 0, hr: 0 });
      setErrorMessage(
        getApiErrorMessage(requestError, "Unable to load employees."),
      );

      setLoading(false);
    },
    [page, pageSize, searchText, sortField, sortOrder, statusFilter],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadEmployees().catch(() => {});
    }, 250);
    return () => window.clearTimeout(timer);
  }, [loadEmployees]);

  useEffect(() => {
    const requestedEmployeeId = searchParams.get("access");
    if (!requestedEmployeeId || !employees.length || accessEmployee) return;
    const match = employees.find(
      (employee) =>
        String(employee.employeeId ?? employee.id) === requestedEmployeeId,
    );
    if (!match) return undefined;
    const timer = window.setTimeout(() => openAccess(match), 0);
    return () => window.clearTimeout(timer);
  }, [employees, searchParams, accessEmployee]);

  const stats = useMemo(() => {
    return [
      {
        key: "total",
        label: "Total Employees",
        description: "Organization workforce",
        value: workforceStats.total,
        icon: Users,
        // Navy for counts and roles; colour only where it is a state
        // (active green, on leave orange).
        color: "navy",
      },
      {
        key: "active",
        label: "Active Employees",
        description: "Currently active",
        value: workforceStats.active,
        icon: UserCheck,
        color: "green",
      },
      {
        key: "mentors",
        label: "Mentors",
        description: "Teaching batches",
        value: workforceStats.mentors,
        icon: GraduationCap,
        color: "navy",
      },
      {
        key: "hr",
        label: "HR",
        description: "Human resources team",
        value: workforceStats.hr,
        icon: ShieldCheck,
        color: "navy",
      },
      {
        key: "onLeave",
        label: "On Leave",
        description: "Currently on leave",
        value: onLeaveCount,
        icon: CalendarOff,
        color: "orange",
        error: onLeaveError,
      },
    ];
  }, [workforceStats, onLeaveCount, onLeaveError]);

  const pageWindow = useMemo(
    () => buildPageWindow(page, totalPages),
    [page, totalPages],
  );

  const handleKpiClick = (key) => {
    setPage(1);
    if (key === "total") {
      setSearchText("");
      setStatusFilter("");
      return;
    }
    if (key === "active") {
      setSearchText("");
      setStatusFilter("Active");
      return;
    }
    if (key === "mentors" || key === "hr") {
      setStatusFilter("");
      setSearchText(key === "mentors" ? "Mentor" : "HR");
      return;
    }
    if (key === "onLeave") {
      // Keep the organization user on the Employees page. The old
      // `/employee/hr-leave` route belongs to the employee portal and falls
      // back to the organization dashboard when opened from this module.
      setSearchText("");
      setStatusFilter("On Leave");
      return;
    }
  };

  const openCreate = () => {
    setEditingEmployee(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const changeEmployeeStatus = async (employee, nextStatus) => {
    const employeeId = employee.employeeId ?? employee.id;
    if (!employeeId || savingStatusId) return;
    setSavingStatusId(employeeId);
    try {
      await employeeService.updateEmployee(
        employeeId,
        buildEmployeePayload({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          role: employee.role ?? employee.designation,
          status: nextStatus,
          employmentType: employee.employeeType ?? employee.employmentType ?? "Full-time",
        }),
      );
      toast.success(
        `Employee marked ${nextStatus === "active" ? "active" : "inactive"}.`,
      );
      await loadEmployees({ pageNumber: page, size: pageSize });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to update employee status."),
      );
    } finally {
      setSavingStatusId(null);
    }
  };

  const openEmployeeProfile = (employee) => {
    const employeeId = employee?.employeeId ?? employee?.id;
    if (!employeeId) return toast.error("Employee ID is unavailable");
    navigate(
      ROUTES.ORG_ADMIN.EMPLOYEE_DETAILS.replace(
        ":employeeId",
        encodeURIComponent(employeeId),
      ),
    );
  };

  const loadEmployeeDetails = async (employeeId, fallbackEmployee = null) => {
    setDetailsLoading(true);
    try {
      const response = await employeeService.getEmployee(employeeId);
      const details = response?.data ?? response;
      return normalizeEmployee(details, departments, branches);
    } catch (error) {
      if (fallbackEmployee) return fallbackEmployee;
      throw error;
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEdit = async (employee) => {
    const fallback = employee;
    setFormErrors({});
    setFormOpen(true);

    const details = await loadEmployeeDetails(
      employee.employeeId ?? employee.id,
      fallback,
    );
    setEditingEmployee(details);
    setForm({
      firstName: details.firstName ?? "",
      lastName: details.lastName ?? "",
      email: details.email ?? "",
      phone: details.phone ?? "",
      alternatePhone: details.alternatePhone ?? "",
      address: details.address ?? details.addressLine1 ?? "",
      departmentId: details.departmentId ?? "",
      designation: details.designation ?? "",
      joiningDate: details.joiningDate ? String(details.joiningDate).slice(0, 10) : "",
      employmentType: normalizeEmploymentType(details.employeeType ?? details.employmentType),
      salaryStructure: details.salaryStructure ?? details.salaryStructureName ?? "",
      basicSalary: details.basicSalary ?? "",
      accountHolderName: details.bankDetails?.accountHolderName ?? "",
      bankName: details.bankDetails?.bankName ?? "",
      accountNumber: details.bankDetails?.accountNumber ?? "",
      confirmAccountNumber: details.bankDetails?.accountNumber ?? "",
      ifscCode: details.bankDetails?.ifscCode ?? "",
      createLogin: details.createLogin ?? true,
      sendCredentialsEmail: details.sendCredentialsEmail ?? true,
      role: ["mentor", "tutor", "employee", "hr"].includes(
        String(details.role ?? details.designation ?? "").trim().toLowerCase(),
      )
        ? String(details.role ?? details.designation).trim().toLowerCase()
        : "",
      status:
        normalizeStatus(details.status) === "inactive" ? "inactive" : "active",
    });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
    setForm(INITIAL_FORM);
    setFormErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};
    if (personNameError(form.firstName, "First name")) nextErrors.firstName = personNameError(form.firstName, "First name");
    if (personNameError(form.lastName, "Last name")) nextErrors.lastName = personNameError(form.lastName, "Last name");
    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      nextErrors.email = "Enter a valid email address";
    if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      nextErrors.phone = "Enter a valid Indian mobile number starting with 6, 7, 8, or 9";
    if (!form.role.trim()) nextErrors.role = "Role is required";
    if (!form.employmentType.trim()) nextErrors.employmentType = "Employment type is required";
    if (!form.status.trim()) nextErrors.status = "Status is required";

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = buildEmployeePayload(form);
    const isHrRole = payload.role.toLowerCase() === "hr";

    setSaving(true);
    try {
      if (editingEmployee) {
        const recordId = editingEmployee.employeeId ?? editingEmployee.id;
        await employeeService.updateEmployee(recordId, payload);
        toast.success("Employee updated successfully.");
        const previousHrRecord = findHrUserByEmail(editingEmployee.email || form.email);
        if (isHrRole) {
          upsertHrUser({
            id: previousHrRecord?.id || "",
            name: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            mobile: payload.phone,
            designation: form.designation || "HR",
            status: payload.status.toLowerCase(),
            role: "HR",
            hrRole: previousHrRecord?.hrRole || HR_ROLE_IDS.EXECUTIVE,
            permissions: previousHrRecord?.permissions || {},
          });
        } else if (previousHrRecord) {
          removeHrUser(previousHrRecord.id);
        }
      } else {
        try {
          const existing = await employeeService.getEmployees({
            search: payload.email,
            pageNumber: 1,
            pageSize: 100,
          });
          const duplicateEmail = (existing?.data ?? []).some(
            (employee) => String(employee.email ?? employee.Email ?? "").trim().toLowerCase() === payload.email.toLowerCase(),
          );
          if (duplicateEmail) {
            setFormErrors((current) => ({ ...current, email: "An employee with this email already exists" }));
            toast.error("An employee with this email already exists.");
            return;
          }
        } catch (error) {
          // A user may have create permission without list permission. Let the
          // backend enforce the duplicate rule during the create request.
          if (error?.response?.status !== 403) throw error;
        }
        await employeeService.createEmployee(payload);
        if (isHrRole) {
          upsertHrUser({
            name: payload.firstName,
            lastName: payload.lastName,
            email: payload.email,
            mobile: payload.phone,
            designation: form.designation || "HR",
            status: payload.status.toLowerCase(),
            role: "HR",
            hrRole: HR_ROLE_IDS.EXECUTIVE,
            permissions: {},
          });
        }
        toast.success("Employee created successfully.");
      }

      closeForm();
      await loadEmployees({ pageNumber: page, size: pageSize });
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to save employee");
      const normalizedMessage = message.toLowerCase();
      if (normalizedMessage.includes("email")) {
        setFormErrors((current) => ({ ...current, email: message }));
      }
      if (normalizedMessage.includes("phone")) {
        setFormErrors((current) => ({ ...current, phone: message }));
      }
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    try {
      const recordId = deleteTarget.employeeId ?? deleteTarget.id;
      const isHrRole = String(deleteTarget.role ?? deleteTarget.designation ?? "").trim().toLowerCase() === "hr";
      await employeeService.deleteEmployee(recordId);
      if (isHrRole) {
        const hrRecord = findHrUserByEmail(deleteTarget.email);
        if (hrRecord) removeHrUser(hrRecord.id);
      }
      toast.success("Employee deleted successfully.");
      setDeleteTarget(null);
      await loadEmployees({ pageNumber: page, size: pageSize });
    } catch (error) {
      const message = getApiErrorMessage(error, "Unable to delete employee");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // One batch request for the visible page; rows show initials until it resolves.
  const { photos: employeePhotos } = useProfilePhotos(PROFILE_TYPE.EMPLOYEE, employees.map((employee) => employee.employeeId));

  const getInitials = (employee) => {
    const first = (employee.firstName || "")[0] || "";
    const last = (employee.lastName || "")[0] || "";
    return (first + last).toUpperCase() || "?";
  };

  const rowKey = (employee, index) =>
    employee.employeeId ?? employee.id ?? `emp-${index}`;
  const rowKeys = employees.map(rowKey);
  const allSelected = rowKeys.length > 0 && rowKeys.every((key) => selectedIds.has(key));
  const someSelected = selectedIds.size > 0 && !allSelected;
  const toggleAllRows = () =>
    setSelectedIds(allSelected ? new Set() : new Set(rowKeys));
  const toggleRow = (key) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const filtersActive = Boolean(searchText.trim() || statusFilter);
  const clearFilters = () => {
    setPage(1);
    setSearchText("");
    setStatusFilter("");
  };
  const showingFrom = employees.length ? (page - 1) * pageSize + 1 : 0;
  const showingLabel = `Showing ${showingFrom}–${showingFrom ? showingFrom + employees.length - 1 : 0} of ${totalRecords} employees`;

  const exportSelectedEmployees = () => {
    const selected = employees.filter((employee, index) => selectedIds.has(rowKey(employee, index)));
    if (!selected.length) return;
    const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["Employee", "Email", "Phone", "Designation", "Status"].join(","),
      ...selected.map((employee) => [
        employee.name ?? `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim(),
        employee.email,
        employee.phone ?? employee.mobile,
        employee.designation ?? employee.role,
        employee.status,
      ].map(escape).join(",")),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "selected-employees.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="employee-management-page h-auto min-h-0 w-full min-w-0 px-3 pb-6 pt-3 sm:px-5 sm:pb-8 sm:pt-4"
    >
      <OrgShowcaseHero
        variant="v14"
        className="osh-v14--plain-eyebrow osh-v14--compact-chips mb-3"
        eyebrow="People Operations"
        title={["Employee", "Management"]}
        subtitle="Manage your team, track performance, and build a stronger organization together."
        features={[
          { icon: Users, label: ["Manage Profiles", "Complete employee data"], tone: "blue" },
          { icon: TrendingUp, label: ["Track Performance", "Monitor growth"], tone: "purple" },
          { icon: CalendarCheck, label: ["Manage Attendance", "Real-time insights"], tone: "green" },
          { icon: ShieldCheck, label: ["Streamline HR", "Simplify operations"], tone: "orange" },
        ]}
        art={ORG_BANNERS.employees}
      />

      <section aria-label="Employee statistics" className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, index) => (
          <EmployeeKpiCard
            key={stat.key}
            stat={stat}
            loading={loading}
            delay={index * 0.05}
            onRetry={() => loadEmployees({ pageNumber: page, size: pageSize })}
            onClick={() => handleKpiClick(stat.key)}
          />
        ))}
      </section>

      <Card className="overflow-hidden !rounded-2xl !border-[#E3EBF3] !p-0 shadow-[0_8px_24px_rgba(19,59,93,.06)] dark:!border-slate-700">
        <div className="employees-toolbar border-b border-[#EDF2F7] bg-white p-3 sm:p-4 lg:px-2.5 lg:py-2 dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-2">
            {/* Tablet: search on its own row, the three selects split the next
                row evenly; desktop (xl): everything on one line. */}
            <div className="employees-toolbar-controls grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:items-center xl:gap-2">
              <div className="min-w-0 sm:col-span-3 xl:flex-1">
                <Input
                  icon={Search}
                  value={searchText}
                  onChange={(event) => {
                    setPage(1);
                    setSearchText(event.target.value);
                  }}
                  placeholder="Search employees by name, email, phone, or designation..."
                  aria-label="Search employees"
                  className="!py-3"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(event) => {
                  setPage(1);
                  setStatusFilter(event.target.value);
                }}
                options={STATUS_OPTIONS}
                placeholder="All Status"
                className="min-w-[150px] !border-[#DCE6F0] !py-3 xl:min-w-[118px]"
              />
              <Select
                value={`${sortField}:${sortOrder}`}
                onChange={(event) => {
                  const [field, order] = String(event.target.value).split(":");
                  if (!field || !SORT_MAP[field]) return;
                  setPage(1);
                  setSortField(field);
                  setSortOrder(order === "desc" ? "desc" : "asc");
                }}
                options={SORT_OPTIONS}
                placeholder="Sort"
                className="min-w-[150px] !border-[#DCE6F0] !py-3 xl:min-w-[140px]"
              />
              <Select
                value={pageSize}
                onChange={(event) => {
                  setPage(1);
                  setPageSize(Number(event.target.value));
                }}
                options={PAGE_SIZE_OPTIONS.map((size) => ({
                  value: size,
                  label: `${size} / page`,
                }))}
                placeholder="Rows"
                className="min-w-[130px] !border-[#DCE6F0] !py-3 xl:min-w-[104px]"
              />
            </div>
            <div className="employees-toolbar-actions flex flex-wrap items-center gap-2 text-[13px] font-medium text-slate-600 xl:flex-nowrap xl:text-[12.5px] dark:text-slate-300">
              {selectedIds.size > 0 && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-[#FDF0DC] px-3.5 py-2.5 font-semibold text-[#B7671A]">
                  {selectedIds.size} selected
                  <button type="button" onClick={exportSelectedEmployees} className="rounded-md bg-white/70 px-2 py-1 text-xs font-bold hover:bg-white">Export</button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="rounded-md px-1 text-xs font-bold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F39924]/40"
                  >
                    Clear
                  </button>
                </span>
              )}
              <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#F1F5F9] px-3.5 py-2.5 lg:px-2.5 lg:py-[7px] dark:bg-slate-800">
                <Users className="h-4 w-4 text-[#64748B]" aria-hidden="true" />
                <span className="inline-block min-w-[100px] tabular-nums">{totalRecords} total records</span>
              </span>
              <span className="v14-actions sm:ml-auto">
                <button
                  type="button"
                  className="v14-btn"
                  onClick={() => loadEmployees({ pageNumber: page, size: pageSize })}
                  disabled={loading}
                >
                  <RefreshCw className={loading ? "animate-spin" : undefined} aria-hidden="true" /> Refresh
                </button>
                {can("employees", "add") && (
                  <button type="button" className="v14-btn v14-btn--primary" onClick={openCreate}>
                    <Plus aria-hidden="true" /> Add Employee
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center justify-between gap-3 border-b border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
            </div>
            <Button variant="secondary" icon={RefreshCw} onClick={() => loadEmployees({ pageNumber: page, size: pageSize })}>Retry</Button>
          </div>
        )}

        {loading && employees.length === 0 ? (
          <div className="ec-grid" aria-busy="true" aria-label="Loading employees">
            {Array.from({ length: 6 }, (_, index) => <EmployeeCardSkeleton key={index} />)}
          </div>
        ) : employees.length === 0 ? (
          <div className="min-h-[360px] p-4 sm:p-5">
            <EmptyState
              title={errorMessage ? "Employee data is unavailable" : "No employees found"}
              description={errorMessage
                ? "We couldn't connect to the employee service. Retry when the connection is available."
                : filtersActive
                  ? `No employees match ${[searchText.trim() && `“${searchText.trim()}”`, statusFilter && `status “${statusFilter}”`].filter(Boolean).join(" and ")}. Try a different search or clear the filters.`
                  : "Add your first employee to start managing your team."}
              icon={Users}
              compact
              action={errorMessage
                ? <Button variant="secondary" icon={RefreshCw} onClick={() => loadEmployees({ pageNumber: page, size: pageSize })}>Retry</Button>
                : filtersActive
                  ? <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
                  : can("employees", "add") ? <Button icon={Plus} onClick={openCreate}>Add Employee</Button> : undefined}
            />
          </div>
        ) : (
          <>
            <div className="ec-gridbar">
              <label>
                <input
                  type="checkbox"
                  ref={(element) => {
                    if (element) element.indeterminate = someSelected;
                  }}
                  checked={allSelected}
                  onChange={toggleAllRows}
                  className="ec-check"
                />
                Select all on this page
              </label>
              <span className="tabular-nums">{showingLabel}</span>
            </div>
            <div className="ec-grid" aria-busy={loading || undefined}>
              {employees.map((employee, index) => {
                const key = rowKey(employee, index);
                const employeeId = employee.employeeId ?? employee.id;
                const canEdit = can("employees", "edit");
                return (
                  <EmployeeCard
                    key={key}
                    employee={employee}
                    photoUrl={employeePhotos[toProfileId(employee.employeeId)]}
                    selected={selectedIds.has(key)}
                    onToggleSelect={() => toggleRow(key)}
                    accessLabel={isHrEmployee(employee) ? "Assign HR module permissions" : "View role and access"}
                    savingStatus={savingStatusId === employeeId}
                    actions={{
                      onOpen: () => openEmployeeProfile(employee),
                      onAccess: canEdit ? () => openAccess(employee) : undefined,
                      onEdit: canEdit ? () => openEdit(employee) : undefined,
                      onStatusChange: canEdit ? (nextStatus) => changeEmployeeStatus(employee, nextStatus) : undefined,
                      onDelete: can("employees", "delete") ? () => setDeleteTarget(employee) : undefined,
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {employees.length > 0 && (
          <div className="employees-footer flex flex-col gap-2 border-t border-slate-200/70 px-3 py-2.5 lg:py-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {showingLabel} · Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => clampPage(current - 1, totalPages))
                }
                disabled={page === 1}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1 px-1">
                {pageWindow.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                    className={`h-8 min-w-8 rounded-lg px-2 text-sm font-semibold transition ${
                      pageNumber === page
                        ? "bg-[#133B5D] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => clampPage(current + 1, totalPages))
                }
                disabled={page === totalPages}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {createPortal(
        <AnimatePresence>
          {accessEmployee && (
            <>
              <motion.button
                type="button"
                aria-label="Close role and access panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeAccess}
                className="fixed inset-0 z-[70] cursor-default bg-slate-950/30 backdrop-blur-[2px]"
              />
              <motion.aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="employee-access-title"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 330, damping: 34 }}
                className="fixed inset-y-0 right-0 z-[80] flex h-[100dvh] w-full max-w-[min(640px,calc(100vw-12px))] min-h-0 flex-col overflow-hidden border-l border-slate-200/80 bg-white/95 shadow-[-24px_0_70px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-900/96 sm:max-w-[min(640px,calc(100vw-16px))]"
              >
                <div className="shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-blue-50 via-white to-teal-50 px-5 py-5 dark:border-slate-700 dark:from-blue-950/40 dark:via-slate-900 dark:to-teal-950/30 sm:px-6">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-[#06b6a8]/15 shadow-[0_0_0_24px_rgba(15,85,247,0.03)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f55f7] to-[#06b6a8] text-sm font-extrabold text-white shadow-lg shadow-blue-500/20">
                        {getInitials(accessEmployee)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f55f7]">
                          Employee access
                        </p>
                        <h2
                          id="employee-access-title"
                          className="truncate text-xl font-extrabold tracking-tight text-slate-900 dark:text-white"
                        >
                          {accessEmployee.name}
                        </h2>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {accessEmployee.email || accessEmployee.department}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={savingPermissions}
                      onClick={closeAccess}
                      className="rounded-xl border border-slate-200 bg-white/80 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:text-white"
                      aria-label="Close panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-5 sm:px-6">
                  <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Assigned role
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                        {isHrEmployee(accessEmployee)
                          ? "HR"
                          : accessEmployee.role ||
                          accessEmployee.designation ||
                          "Employee"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>
                      <EmployeeStatusBadge status={accessEmployee.status} />
                    </div>
                  </div>

                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {isHrEmployee(accessEmployee) ? "HR permission profile" : "Organization module access"}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {editingAccess
                          ? isHrEmployee(accessEmployee)
                            ? "Choose the HR modules and actions this employee can use after login."
                            : "Editing this employee's organization module access."
                          : isHrEmployee(accessEmployee)
                            ? "Review the current HR role access, then choose Manage access to assign custom permissions."
                            : "Previewing access inherited from the assigned role or saved permissions. This is not a file list."}
                    </p>
                    {accessError && (
                      <p className="mt-1 text-xs font-medium text-red-600">{accessError}</p>
                    )}
                  </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {editingAccess && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAllPermissions(true)}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            Mark all
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllPermissions(false)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                          >
                            Unmark all
                          </button>
                        </>
                      )}
                      <span className="rounded-full bg-[#0f55f7]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0f55f7]">
                        {editingAccess ? "Editing" : "Read only"}
                      </span>
                    </div>
                  </div>

                  {isDemoHrEmployee(accessEmployee) ? (
                    <PermissionMatrix
                      value={hrAccessPermissions}
                      onChange={editingAccess ? setHrAccessPermissions : undefined}
                    />
                  ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-700">
                    <div className="sticky top-0 z-10 grid grid-cols-[minmax(120px,1fr)_repeat(5,minmax(36px,42px))] items-center gap-1 bg-slate-50 px-3 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:bg-slate-800/90">
                      <span className="text-left">Module</span>
                      <span>View</span>
                      <span>Add</span>
                      <span>Edit</span>
                      <span>Delete</span>
                      <span>Access</span>
                    </div>
                    {accessLoading ? (
                      <div className="p-8 text-center text-sm text-slate-500">Loading permissions...</div>
                    ) : permissionRows.length ? permissionRows.map((module) => (
                      <div
                        key={module.permissionId ?? module.key}
                        className="grid grid-cols-[minmax(120px,1fr)_repeat(5,minmax(36px,42px))] items-center gap-1 border-t border-slate-200/70 px-3 py-3 dark:border-slate-700/70"
                      >
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {module.module}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {["view", "add", "edit", "delete", "access"].filter(
                              (action) => accessMatrix[module.key]?.[action],
                            ).length
                              ? "Some access granted"
                              : "No access granted"}
                          </span>
                        </div>
                        {["view", "add", "edit", "delete", "access"].map(
                          (permission) => {
                            const enabled = Boolean(
                              accessMatrix[module.key]?.[permission],
                            );
                            return (
                              <button
                                key={permission}
                                type="button"
                                disabled={!editingAccess}
                                onClick={() =>
                                  toggleAccess(module.key, permission)
                                }
                                className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition ${enabled ? "border-[#0f55f7] bg-[#0f55f7] text-white" : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-800"} ${editingAccess ? "cursor-pointer hover:scale-105" : "cursor-default"}`}
                                aria-label={`${module.label} ${permission}: ${enabled ? "allowed" : "not allowed"}`}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            );
                          },
                        )}
                      </div>
                    )) : (
                      <div className="p-8 text-center text-sm text-red-600">{accessError || "No permission modules were returned."}</div>
                    )}
                  </div>
                  )}
                </div>

                <div className="shrink-0 border-t border-slate-200/80 bg-white/90 px-5 py-4 shadow-[0_-10px_25px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/90 sm:px-6">
                  <div className="flex flex-col-reverse items-stretch justify-end gap-2 sm:flex-row sm:items-center">
                    <Button
                      variant="secondary"
                      disabled={savingPermissions}
                      onClick={closeAccess}
                    >
                      Close
                    </Button>
                    {editingAccess && (accessEmployee.employeeId ?? accessEmployee.id) ? (
                      <Button
                        icon={savingPermissions ? Loader2 : Check}
                        loading={savingPermissions}
                        disabled={savingPermissions}
                        onClick={savePermissions}
                      >
                        {savingPermissions ? "Saving..." : isHrEmployee(accessEmployee) ? "Save HR permissions" : "Save permissions"}
                      </Button>
                    ) : (accessEmployee.employeeId ?? accessEmployee.id) ? (
                      <Button
                        icon={ShieldCheck}
                        disabled={accessLoading || (!isDemoHrEmployee(accessEmployee) && !permissionRows.length)}
                        onClick={() => setEditingAccess(true)}
                      >
                        {isHrEmployee(accessEmployee) ? "Manage HR access" : "Manage access"}
                      </Button>
                    ) : (
                      <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                        Role access only
                      </span>
                    )}
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editingEmployee ? "Edit Employee" : "Add Employee"}
        description={
          editingEmployee
            ? "Update profile, role and employment status."
            : "Create an employee profile and assign their initial access role."
        }
        size="lg"
        hero={
          <ModalHero
            icon={editingEmployee ? Edit3 : UserPlus}
            title={editingEmployee ? "Edit" : "Add"}
            accent="Employee"
            subtitle={
              editingEmployee
                ? "Update profile, role and employment status."
                : "Fill in the details below to add a new employee to the organization."
            }
            art={ORG_BANNERS.addEmployee.src}
            onClose={closeForm}
            closeDisabled={saving}
          />
        }
        className="!rounded-3xl !border-[#ead8bd] shadow-[0_32px_90px_-24px_rgba(115,76,35,0.28)] ring-1 ring-[#d99a52]/20"
        headerClassName="relative overflow-hidden !border-0 !px-7 !py-6 !bg-gradient-to-r !from-[#9b5d2e] !via-[#b96f32] !to-[#d98b3d] [&_h2]:!text-white [&_p]:!text-[#fff3df] [&_button]:!bg-white/15 [&_button]:hover:!bg-white/25 [&_button_svg]:!text-white before:pointer-events-none before:absolute before:-right-16 before:-top-24 before:h-56 before:w-56 before:rounded-full before:bg-white/10 after:pointer-events-none after:absolute after:-bottom-24 after:right-36 after:h-44 after:w-44 after:rounded-full after:bg-[#ffe2b5]/15"
        bodyClassName="!bg-white !p-6 sm:!p-7"
        footerClassName="!border-[#ead8bd] !bg-white !px-7"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button
              icon={saving ? Loader2 : Plus}
              onClick={handleSave}
              loading={saving}
            >
              {editingEmployee ? "Save Changes" : "Create Employee"}
            </Button>
          </div>
        }
      >
        {detailsLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading employee details...
          </div>
        ) : (
          <div className="employee-form relative grid grid-cols-1 gap-x-6 gap-y-5 overflow-hidden rounded-[26px] border border-[#ead8bd] bg-white/95 p-5 shadow-[0_20px_55px_-32px_rgba(115,76,35,0.28)] backdrop-blur md:grid-cols-2 sm:p-7 [&_label]:!font-semibold [&_label]:!text-slate-700">
            <div className="relative -mx-1 -mt-1 mb-1 flex items-center justify-between overflow-hidden rounded-2xl border border-[#ead8bd] bg-gradient-to-r from-[#fff4e2] via-[#fffaf2] to-[#f8e7cf] px-5 py-4 md:col-span-2">
              <div className="relative z-10 flex items-center gap-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#b76527] to-[#e39a45] text-white shadow-lg shadow-[#b76527]/20">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold tracking-tight text-slate-900">Personal Information</p>
                  <p className="mt-0.5 text-xs text-slate-500">Basic identity and employment details</p>
                </div>
              </div>
              <span className="relative z-10 hidden rounded-full border border-[#e6bd88]/80 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#a85f22] sm:inline-flex">
                <span className="mr-1 text-rose-500">*</span> Required fields
              </span>
              <span className="absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[#efb866]/20" />
              <span className="absolute right-20 top-8 h-16 w-16 rounded-full bg-[#d48a3a]/10" />
            </div>
            <Input
              label="First Name"
              required
              value={form.firstName}
              onChange={(event) =>
                setForm({ ...form, firstName: event.target.value })
              }
              error={formErrors.firstName}
            />
            <Input
              label="Last Name"
              required
              value={form.lastName}
              onChange={(event) =>
                setForm({ ...form, lastName: event.target.value })
              }
              error={formErrors.lastName}
            />
            <Input
              label="Email"
              type="email"
              required
              icon={Mail}
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              error={formErrors.email}
            />
            <Input
              label="Phone"
              type="tel"
              required
              icon={Phone}
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(event) =>
                (() => {
                  const phone = event.target.value.replace(/\D/g, "").slice(0, 10);
                  setForm({ ...form, phone });
                  setFormErrors((current) => ({
                    ...current,
                    phone: phone && !/^[6-9]\d{0,9}$/.test(phone)
                      ? "Indian mobile numbers must start with 6, 7, 8, or 9"
                      : phone.length === 10 && !/^[6-9]\d{9}$/.test(phone)
                        ? "Enter exactly 10 digits"
                        : "",
                  }));
                })()
              }
              error={formErrors.phone}
            />
            <Select
              label="Role"
              required
              value={form.role}
              onChange={(event) =>
                setForm({ ...form, role: event.target.value })
              }
              options={ROLE_OPTIONS}
              placeholder="Select role"
              error={formErrors.role}
            />
            <Select
              label="Employment Type"
              required
              value={form.employmentType}
              onChange={(event) =>
                setForm({ ...form, employmentType: event.target.value })
              }
              options={form.employmentType && !EMPLOYMENT_TYPE_OPTIONS.some((option) => option.value === form.employmentType) ? [...EMPLOYMENT_TYPE_OPTIONS, { value: form.employmentType, label: form.employmentType }] : EMPLOYMENT_TYPE_OPTIONS}
              error={formErrors.employmentType}
            />
            <Select
              label="Status"
              required
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              error={formErrors.status}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Employee"
        description={`Delete ${deleteTarget?.firstName ? `${deleteTarget.firstName} ${deleteTarget.lastName ?? ""}`.trim() : "this employee"}?`}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={saving}>
              Delete
            </Button>
          </div>
        }
      >
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
          This will remove the employee record from the live backend.
        </div>
      </Modal>
    </motion.div>
  );
}
