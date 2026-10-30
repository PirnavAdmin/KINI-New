import { API_ENDPOINTS } from "@/api/endpoints";
import apiClient from "./apiClient";
import { cleanPayload, getListPayload, getPayload } from "./apiServices";

const body = (payload) => cleanPayload(payload);

// Swagger-confirmed: the backend's UserRole enum is PascalCase
// (Student, Organization, Employee, Mentor, HR, HRRecruiter, HRExecutive,
// OperationAssociate, SuperAdmin). The app's internal role model (roles.js
// normalizeRole()) is lowercase/hyphenated for routing ("mentor", "org-admin"),
// which the backend's /api/Permission/roles/{role} route rejects with 403 —
// not a 400/404, because it binds fine but then fails a role-string equality
// check. Translate right before the request leaves this module so every
// caller (usePermission.js, EmployeeManagement.jsx) is protected uniformly.
const BACKEND_USER_ROLES = {
  student: "Student",
  organization: "Organization",
  orgadmin: "Organization",
  org: "Organization",
  employee: "Employee",
  mentor: "Mentor",
  hr: "HR",
  hrrecruiter: "HRRecruiter",
  hrexecutive: "HRExecutive",
  operationassociate: "OperationAssociate",
  operationsassociate: "OperationAssociate",
  superadmin: "SuperAdmin",
  admin: "SuperAdmin",
};

export const toBackendUserRole = (value) => {
  const key = String(value ?? "").replace(/[\s_-]/g, "").toLowerCase();
  if (BACKEND_USER_ROLES[key]) return BACKEND_USER_ROLES[key];
  const raw = String(value ?? "").trim();
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Employee";
};

// Swagger-confirmed catalog from GET /api/Permission/modules — 17 distinct
// modules, permissionId 1-17 (grew from the original 10 once Leave Management,
// Performance, Resources, Announcements, Settings and Calendar were added).
// EmployeeProfile (9) is its own module, separate from Employees (2) —
// collapsing them into one key previously corrupted both (whichever loaded
// last silently overwrote the other's checkbox state in the Manage Access
// matrix, and merge lookups fell back to the wrong role row) and produced the
// duplicate permissionId "9" React key warning. This map is only a fallback
// key->id lookup for building a full catalog when the live /modules catalog
// isn't available (see toPermissionRows) — the actual id->name direction
// always comes from the API response itself via moduleKey() below, which is
// the single source of truth every consumer (usePermission.js included)
// normalizes module names through.
const PERMISSION_MODULE_IDS = {
  dashboard: 1,
  employees: 2,
  courses: 3,
  batches: 4,
  attendance: 5,
  assessments: 6,
  reports: 7,
  'live-classes': 8,
  'employee-profile': 9,
  students: 10,
  leave: 11,
  performance: 12,
  resources: 13,
  announcements: 14,
  settings: 15,
  calendar: 17,
};

// Single source of truth for turning a raw backend module name (or an
// already-normalized key) into the app's canonical module key. Every
// consumer — this file's own normalizePermissionRows, and usePermission.js's
// apiPermissionKeys — must resolve a given module name to the same key, or
// permission checks and the sidebar/route guards silently disagree.
export const moduleKey = (value) => {
  const key = String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = {
    dashboard: 'dashboard',
    employee: 'employees', employees: 'employees',
    course: 'courses', courses: 'courses',
    batch: 'batches', batches: 'batches',
    attendance: 'attendance',
    assessment: 'assessments', assessments: 'assessments',
    report: 'reports', reports: 'reports',
    liveclass: 'live-classes',
    liveclasses: 'live-classes',
    employeeprofile: 'employee-profile',
    student: 'students', students: 'students',
    leavemanagement: 'leave', leave: 'leave',
    performance: 'performance',
    resource: 'resources', resources: 'resources',
    announcement: 'announcements', announcements: 'announcements',
    setting: 'settings', settings: 'settings',
    calendar: 'calendar',
  };
  return aliases[key] || key;
};

const permissionValue = (row, ...keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
};

const isPermissionEnabled = (value) => {
  if (typeof value === 'string') {
    return !['false', '0', 'no', 'off', 'disabled', 'deny', 'denied', ''].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
};

// Swagger-confirmed: UpdateRolePermissionDto / UpdateEmployeePermissionDto are
// EXACTLY { permissionId, canView, canAdd, canEdit, canDelete, canAccess }
// with additionalProperties: false. Extra fields (moduleId, module) here were
// being sent on every PUT /api/Permission/{roles|employees}/{id} request and
// are almost certainly why the backend returned 400.
const permissionPayload = (row) => {
  if (!row || typeof row !== "object") return row;
  const permissionId = row.permissionId ?? row.PermissionId ?? row.moduleId ?? row.ModuleId ?? row.id ?? row.Id;
  return {
    permissionId,
    canView: isPermissionEnabled(permissionValue(row, "canView", "CanView", "view", "View")),
    canAdd: isPermissionEnabled(permissionValue(row, "canAdd", "CanAdd", "add", "Add")),
    canEdit: isPermissionEnabled(permissionValue(row, "canEdit", "CanEdit", "edit", "Edit")),
    canDelete: isPermissionEnabled(permissionValue(row, "canDelete", "CanDelete", "delete", "Delete")),
    canAccess: isPermissionEnabled(permissionValue(row, "canAccess", "CanAccess", "hasAccess", "HasAccess", "access", "Access", "view", "View")),
  };
};

export const toPermissionRows = (permissions, modules = []) => {
  if (Array.isArray(permissions)) return permissions;
  if (!permissions || typeof permissions !== "object") return permissions;

  const apiModules = Array.isArray(modules) ? modules : [];
  const catalog = apiModules.length
    ? apiModules.map((item) => {
        const key = moduleKey(item?.key ?? item?.moduleKey ?? item?.moduleName ?? item?.name ?? item?.module);
        return { item, key };
      }).filter(({ key }) => key)
    : Object.entries(PERMISSION_MODULE_IDS).map(([key]) => ({ item: null, key }));

  return catalog.map(({ item: apiModule, key }) => {
    const row = permissions[key] ?? permissions[`${key}s`] ?? {};
    const fallbackId = PERMISSION_MODULE_IDS[key];
    const permissionId = apiModule?.moduleId ?? apiModule?.permissionId ?? apiModule?.id ?? fallbackId;
    return {
      moduleId: permissionId,
      permissionId,
      module: apiModule?.moduleName ?? apiModule?.name ?? apiModule?.module ?? key.charAt(0).toUpperCase() + key.slice(1),
      canView: isPermissionEnabled(permissionValue(row, 'canView', 'CanView', 'view', 'View')),
      canAdd: isPermissionEnabled(permissionValue(row, 'canAdd', 'CanAdd', 'add', 'Add')),
      canEdit: isPermissionEnabled(permissionValue(row, 'canEdit', 'CanEdit', 'edit', 'Edit')),
      canDelete: isPermissionEnabled(permissionValue(row, 'canDelete', 'CanDelete', 'delete', 'Delete')),
      hasAccess: isPermissionEnabled(permissionValue(row, 'canAccess', 'CanAccess', 'hasAccess', 'HasAccess', 'access', 'Access', 'view', 'View')),
      canAccess: isPermissionEnabled(permissionValue(row, 'canAccess', 'CanAccess', 'hasAccess', 'HasAccess', 'access', 'Access', 'view', 'View')),
    };
  });
};

const permissionList = (payload) => {
  const source = payload?.permissions ?? payload?.data ?? payload?.items ?? payload?.modules ?? payload;
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== 'object') return [];
  return Object.entries(source).map(([module, value]) => {
    if (Array.isArray(value)) {
      return {
        module,
        canView: value.includes('view'),
        canAdd: value.includes('add'),
        canEdit: value.includes('edit'),
        canDelete: value.includes('delete'),
        canAccess: value.includes('view'),
      };
    }
    return {
      module,
      ...(value && typeof value === 'object' ? value : { canView: Boolean(value) }),
    };
  });
};

const ACTION_FIELD_MAP = { view: 'canView', add: 'canAdd', edit: 'canEdit', delete: 'canDelete', access: 'canAccess' };
const CAN_FIELDS = ['canView', 'canAdd', 'canEdit', 'canDelete', 'canAccess'];

// Some Permission responses return one row per module with five boolean
// columns; others (observed in production: duplicate React key on the
// module id, e.g. "9") return one row per (module, action) pair instead —
// e.g. { permissionId: 9, action: "Access", allowed: true }. usePermission.js
// already anticipates that exact flat shape for its own key-list computation;
// this normalizer previously didn't, so each action row rendered as its own
// "module" entry sharing the same permissionId. Fold both shapes into one
// row per module before returning.
const groupPermissionRowsByModule = (rows) => {
  const order = [];
  const byGroupKey = new Map();
  rows.forEach((row) => {
    const groupKey = row.permissionId !== undefined && row.permissionId !== null
      ? `id:${row.permissionId}`
      : `key:${row.key}`;
    if (!byGroupKey.has(groupKey)) {
      order.push(groupKey);
      byGroupKey.set(groupKey, {
        ...row,
        canView: false, canAdd: false, canEdit: false, canDelete: false, canAccess: false,
        __provided: { canView: false, canAdd: false, canEdit: false, canDelete: false, canAccess: false },
      });
    }
    const target = byGroupKey.get(groupKey);
    CAN_FIELDS.forEach((field) => {
      if (row.__provided?.[field]) {
        target[field] = row[field];
        target.__provided[field] = true;
      }
    });
    if (target.permissionId === undefined || target.permissionId === null) target.permissionId = row.permissionId;
    if (!target.module) target.module = row.module;
  });
  return order.map((groupKey) => byGroupKey.get(groupKey));
};

// groupPermissionRowsByModule only folds rows that share a permissionId. It does
// NOT catch the backend returning genuinely DIFFERENT permissionId rows for the
// same module — observed in production for employee permissions, where
// "Students" comes back as both permissionId 10 (all false) and permissionId 16
// (all true) for the same employee. Every downstream consumer keys off `.key`
// (effectiveByEmployee's role/employee Maps, permissionRowsToMatrix's reduce,
// usePermission's apiPermissionKeys), so left alone this collapses to
// "whichever row happens to appear last in the array wins" with no visibility
// into what just got silently dropped. This is a backend/data-model issue —
// see the module-level comment above PERMISSION_MODULE_IDS — not something the
// frontend can fix by deleting a row, so instead: resolve it deterministically
// (deny wins — a duplicate positive record must never silently override an
// explicit deny) and log it loudly in dev so it doesn't go unnoticed.
const collapseDuplicateModuleKeys = (rows) => {
  const order = [];
  const byKey = new Map();
  rows.forEach((row) => {
    if (!row.key) {
      order.push(row);
      return;
    }
    const existing = byKey.get(row.key);
    if (!existing) {
      byKey.set(row.key, row);
      order.push(row);
      return;
    }
    if (import.meta.env.DEV) {
      console.warn('[PERMISSION DUPLICATE MODULE]', {
        module: existing.module ?? row.module,
        key: row.key,
        permissionIds: [existing.permissionId, row.permissionId],
        rows: [existing, row],
        resolution: 'deny-wins for display: a field only reads true if every duplicate row agrees. All duplicate permissionIds are still tracked (__duplicatePermissionIds) so a save writes every one of them — previously only the first-seen id was kept, so saving "true" only ever updated that one row, leaving the other duplicate row at its old value; the very next read deny-wins merged that stale row back in and undid the save.',
      });
    }
    // Every permissionId seen for this key, not just the first — this is
    // what permissionRowsToPayload() needs to write all of them together.
    const existingIds = existing.__duplicatePermissionIds || [existing.permissionId];
    const mergedIds = [...existingIds, row.permissionId].filter((value, index, all) =>
      value !== undefined && value !== null && all.indexOf(value) === index,
    );
    const merged = {
      ...existing,
      __duplicateModule: true,
      __duplicatePermissionIds: mergedIds,
      __provided: { ...existing.__provided },
    };
    CAN_FIELDS.forEach((field) => {
      merged[field] = Boolean(existing[field]) && Boolean(row[field]);
      merged.__provided[field] = Boolean(existing.__provided?.[field]) || Boolean(row.__provided?.[field]);
    });
    byKey.set(row.key, merged);
    order[order.indexOf(existing)] = merged;
  });
  return order;
};

const normalizePermissionRows = (payload, modules = []) => {
  const rows = permissionList(payload).map((row) => {
    const module = row?.module?.name ?? row?.Module?.Name ?? row?.module ?? row?.Module
      ?? row?.moduleName ?? row?.ModuleName ?? row?.name ?? row?.Name;
    const key = moduleKey(module);
    const catalogRow = modules.find((item) => moduleKey(item?.module ?? item?.Module ?? item?.name ?? item?.Name) === key);
    const permissionId = row?.permissionId ?? row?.PermissionId ?? row?.moduleId ?? row?.ModuleId
      ?? catalogRow?.permissionId ?? catalogRow?.PermissionId ?? catalogRow?.moduleId ?? catalogRow?.ModuleId;
    const provided = (keys) => keys.some((k) => row?.[k] !== undefined && row?.[k] !== null);

    const flatAction = String(
      permissionValue(row, 'action', 'Action', 'actionKey', 'ActionKey', 'permission', 'Permission') ?? ''
    ).toLowerCase();
    const flatField = ACTION_FIELD_MAP[flatAction];
    const flatValue = permissionValue(row, 'allowed', 'Allowed', 'isAllowed', 'IsAllowed', 'value', 'Value');
    const hasFlatShape = Boolean(flatField) && flatValue !== undefined;

    const fieldValue = (canKey, altKeys) => hasFlatShape && flatField === canKey
      ? isPermissionEnabled(flatValue)
      : isPermissionEnabled(permissionValue(row, ...altKeys));
    const fieldProvided = (canKey, altKeys) => (hasFlatShape && flatField === canKey) || provided(altKeys);

    return {
      ...row,
      key,
      permissionId,
      module: row?.module?.name ?? row?.Module?.Name ?? row?.module ?? row?.Module ?? module,
      canView: fieldValue('canView', ['canView', 'CanView', 'view', 'View']),
      canAdd: fieldValue('canAdd', ['canAdd', 'CanAdd', 'add', 'Add']),
      canEdit: fieldValue('canEdit', ['canEdit', 'CanEdit', 'edit', 'Edit']),
      canDelete: fieldValue('canDelete', ['canDelete', 'CanDelete', 'delete', 'Delete']),
      canAccess: fieldValue('canAccess', ['canAccess', 'CanAccess', 'hasAccess', 'HasAccess', 'access', 'Access']),
      __provided: {
        canView: fieldProvided('canView', ['canView', 'CanView', 'view', 'View']),
        canAdd: fieldProvided('canAdd', ['canAdd', 'CanAdd', 'add', 'Add']),
        canEdit: fieldProvided('canEdit', ['canEdit', 'CanEdit', 'edit', 'Edit']),
        canDelete: fieldProvided('canDelete', ['canDelete', 'CanDelete', 'delete', 'Delete']),
        canAccess: fieldProvided('canAccess', ['canAccess', 'CanAccess', 'hasAccess', 'HasAccess', 'access', 'Access']),
      },
    };
  });
  return collapseDuplicateModuleKeys(groupPermissionRowsByModule(rows));
};

export const permissionRowsToMatrix = (payload, modules = []) => {
  const rows = normalizePermissionRows(payload, modules);
  return rows.reduce((matrix, row) => {
    const key = row.key || moduleKey(row.module);
    if (!key) return matrix;
    matrix[key] = {
      permissionId: row.permissionId,
      module: row.module,
      canView: Boolean(row.canView),
      canAdd: Boolean(row.canAdd),
      canEdit: Boolean(row.canEdit),
      canDelete: Boolean(row.canDelete),
      canAccess: Boolean(row.canAccess),
      // Carried through so a later save (permissionRowsToPayload) can still
      // see every duplicate permissionId this module collapsed from — the
      // editor only ever works with one merged row per module, so this is
      // the only place that information survives to save time. The Manage
      // Access checkboxes just spread this object on every edit
      // (EmployeeDetails.jsx), so it rides along unchanged until Save.
      ...(row.__duplicatePermissionIds?.length > 1 ? { __duplicatePermissionIds: row.__duplicatePermissionIds } : {}),
    };
    return matrix;
  }, {});
};

export const permissionRowsToPayload = (permissions, modules = []) => {
  return normalizePermissionRows(permissions, modules).flatMap((row) => {
    const base = permissionPayload(row);
    // A module the org's data has duplicated under two+ permissionIds (e.g.
    // Students: 10 and 16) must be saved to ALL of them with the same
    // values. Only ever writing the first id left the other row at its old
    // value, and the next read's deny-wins merge (correctly) folded that
    // stale row back in — which is what made a successful save look like it
    // had silently reverted.
    const ids = row.__duplicatePermissionIds?.length > 1 ? row.__duplicatePermissionIds : [base.permissionId];
    return ids
      .filter((permissionId) => permissionId !== undefined && permissionId !== null)
      .map((permissionId) => ({ ...base, permissionId }));
  });
};

export const assessmentQuestionApi = {
  listByAssessment: (assessmentId) => apiClient.get(API_ENDPOINTS.assessmentQuestions.byAssessment(assessmentId)).then(getListPayload),
  getById: (questionId) => apiClient.get(API_ENDPOINTS.assessmentQuestions.byId(questionId)).then(getPayload),
  create: (payload) => apiClient.post(API_ENDPOINTS.assessmentQuestions.base, body(payload)).then(getPayload),
  update: (questionId, payload) => apiClient.put(API_ENDPOINTS.assessmentQuestions.byId(questionId), body(payload)).then(getPayload),
  remove: (questionId) => apiClient.delete(API_ENDPOINTS.assessmentQuestions.byId(questionId)).then(getPayload),
};

export const calendarApi = {
  month: (params) => apiClient.get(API_ENDPOINTS.calendar.month, { params }).then(getListPayload),
  week: (params) => apiClient.get(API_ENDPOINTS.calendar.week, { params }).then(getListPayload),
  day: (params) => apiClient.get(API_ENDPOINTS.calendar.day, { params }).then(getListPayload),
  today: (params) => apiClient.get(API_ENDPOINTS.calendar.today, { params }).then(getListPayload),
  upcoming: (params) => apiClient.get(API_ENDPOINTS.calendar.upcoming, { params }).then(getListPayload),
  getEvent: (eventId) => apiClient.get(API_ENDPOINTS.calendar.event(eventId)).then(getPayload),
};

export const permissionApi = {
  modules: () => apiClient.get(API_ENDPOINTS.permission.modules).then(getListPayload),
  // Every real module (from the modules catalog) normalized to a default
  // all-false row, keyed the same way as normalizePermissionRows. A module
  // nobody has ever explicitly saved a value for (role or employee) never
  // appears in byRole/byEmployee responses at all — without this, an admin
  // editing screen built only from those responses can never show, let alone
  // grant, that module. Used to backfill the full catalog before rendering.
  moduleCatalogRows: async () => normalizePermissionRows(
    (await permissionApi.modules() || []).map((item) => ({
      permissionId: item?.permissionId ?? item?.moduleId ?? item?.id,
      module: item?.moduleName ?? item?.name ?? item?.module,
    })),
  ),
  byRole: async (role) => normalizePermissionRows(await apiClient.get(API_ENDPOINTS.permission.byRole(toBackendUserRole(role))).then(getPayload)),
  byEmployee: async (employeeId) => normalizePermissionRows(
    await apiClient.get(API_ENDPOINTS.permission.byEmployee(employeeId)).then(getPayload),
  ),
  effectiveByEmployee: async (employeeId, role) => {
    if (import.meta.env.DEV) console.count('Permission API effective fetch count');
    // The modules catalog is admin-facing and may be forbidden for normal
    // employees/mentors. Role and employee rows contain the data needed to
    // calculate effective access without that extra request.
    const [roleResult, employeeResult] = await Promise.all([
      permissionApi.byRole(role || 'employee').then((rows) => ({ rows })).catch((error) => ({ error })),
      employeeId
        ? permissionApi.byEmployee(employeeId).then((rows) => ({ rows })).catch((error) => ({ error }))
        : Promise.resolve({ rows: [] }),
    ]);
    // The role-level fetch is the foundation this function blends employee
    // overrides onto — if it failed, we don't have a confirmed baseline, so
    // this must propagate as a failure even when the employee-row fetch
    // happened to succeed (returning employee-only rows would silently pass
    // off a partial, unconfirmed result as "effective permissions").
    if (roleResult.error) throw roleResult.error;
    if (employeeResult.error) throw employeeResult.error;
    const roleRows = roleResult.rows || [];
    const employeeRows = employeeResult.rows || [];
    if (!roleRows.length) return employeeRows;
    if (!employeeRows.length) return roleRows;

    // Union both key sets — an employee-level override for a module the role
    // response doesn't happen to include (e.g. nobody has ever saved a role
    // default for it) is a real, explicit value the admin set and must not
    // be silently dropped just because it has no matching role row to merge
    // onto.
    const roleByKey = new Map(roleRows.map((row) => [row.key, row]));
    const employeeByKey = new Map(employeeRows.map((row) => [row.key, row]));
    const allKeys = new Set([...roleByKey.keys(), ...employeeByKey.keys()]);
    return [...allKeys].map((key) => {
      const roleRow = roleByKey.get(key);
      const employeeRow = employeeByKey.get(key);
      if (!employeeRow) return roleRow;
      if (!roleRow) return employeeRow;
      return {
        ...roleRow,
        ...employeeRow,
        canView: employeeRow.__provided?.canView ? employeeRow.canView : roleRow.canView,
        canAdd: employeeRow.__provided?.canAdd ? employeeRow.canAdd : roleRow.canAdd,
        canEdit: employeeRow.__provided?.canEdit ? employeeRow.canEdit : roleRow.canEdit,
        canDelete: employeeRow.__provided?.canDelete ? employeeRow.canDelete : roleRow.canDelete,
        canAccess: employeeRow.__provided?.canAccess ? employeeRow.canAccess : roleRow.canAccess,
      };
    });
  },
  updateRole: async (role, payload) => {
    const permissionModules = await permissionApi.modules().catch(() => []);
    const rows = permissionRowsToPayload(payload?.permissions ?? payload, permissionModules);
    return apiClient.put(
      API_ENDPOINTS.permission.updateRole(toBackendUserRole(role)),
      rows,
    ).then(getPayload);
  },
  updateEmployee: async (employeeId, payload) => {
    const permissionModules = await permissionApi.modules().catch(() => []);
    const rows = permissionRowsToPayload(payload?.permissions ?? payload, permissionModules);
    if (import.meta.env.DEV) console.debug(`[Permission] PUT /api/Permission/employees/${employeeId} body:`, rows);
    return apiClient.put(
      API_ENDPOINTS.permission.updateEmployee(employeeId),
      rows,
    ).then(getPayload);
  },
  // Swagger-confirmed: GET only — there is no DELETE variant of this route.
  getEmployeeModulePermission: async (employeeId, permissionId) => {
    if (employeeId == null || permissionId == null) return null;
    const payload = await apiClient.get(API_ENDPOINTS.permission.employeeModule(employeeId, permissionId)).then(getPayload);
    const [row] = normalizePermissionRows(Array.isArray(payload) ? payload : [payload]);
    return row || null;
  },
};

export const studentAssessmentApi = {
  start: (payload) => apiClient.post(API_ENDPOINTS.studentAssessment.start, body(payload)).then(getPayload),
  submit: (payload) => apiClient.post(API_ENDPOINTS.studentAssessment.submit, body(payload)).then(getPayload),
  getById: (id) => apiClient.get(API_ENDPOINTS.studentAssessment.byId(id)).then(getPayload),
  getResult: (id) => apiClient.get(API_ENDPOINTS.studentAssessment.result(id)).then(getPayload),
};

export const zoomWebhookApi = {
  receive: (payload, config) => apiClient.post(API_ENDPOINTS.zoom.webhook, payload, config).then(getPayload),
};

export default { assessmentQuestionApi, calendarApi, permissionApi, studentAssessmentApi, zoomWebhookApi };
