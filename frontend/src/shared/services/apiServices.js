import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/api/endpoints";

export const getPayload = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  return payload?.data ?? payload?.items ?? payload?.results ?? payload;
};

const LIST_KEYS = [
  "data",
  "items",
  "results",
  "content",
  "records",
  "rows",
  "departments",
  "employees",
  "branches",
  "teams",
  "goals",
  "assessments",
  "skills",
  "subscriptions",
  "organizations",
  "notifications",
];

export const getListPayload = (response) => {
  const payload = response?.data ?? response;

  const findList = (value, depth = 0) => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object" || depth > 4) return null;

    for (const key of LIST_KEYS) {
      const list = findList(value[key], depth + 1);
      if (list) return list;
    }

    for (const child of Object.values(value)) {
      const list = findList(child, depth + 1);
      if (list) return list;
    }

    return null;
  };

  return findList(payload) ?? [];
};

export const cleanPayload = (payload) => {
  if (!payload || typeof payload !== "object") return {};

  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (value === undefined) return acc;
    if (typeof value === "number" && Number.isNaN(value)) return acc;
    if (typeof value === "string" && value.trim() === "") return acc;
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) return acc;

    acc[key] = typeof value === "string" ? value.trim() : value;
    return acc;
  }, {});
};

const GENERIC_API_MESSAGE = /^(an )?(unexpected error|internal server error|error occurred|something went wrong)( occurred)?\.?$/i;

export const readableApiMessage = (value, depth = 0) => {
  if (value == null || depth > 4) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map((item) => readableApiMessage(item, depth + 1)).filter(Boolean).join(" ");
  }
  if (typeof value !== "object") return "";

  const validationErrors = value.errors ?? value.Errors;
  if (validationErrors && typeof validationErrors === "object") {
    const details = Object.entries(validationErrors)
      .flatMap(([field, messages]) => {
        const text = readableApiMessage(messages, depth + 1);
        return text ? [`${field}: ${text}`] : [];
      })
      .join(" ");
    if (details) return details;
  }

  for (const key of ["message", "Message", "detail", "Detail", "error", "Error", "title", "Title"]) {
    const message = readableApiMessage(value[key], depth + 1);
    if (message && !GENERIC_API_MESSAGE.test(message)) return message;
  }

  // Some APIs wrap the useful error inside another data/result object.
  for (const key of ["data", "Data", "result", "Result", "response"]) {
    const message = readableApiMessage(value[key], depth + 1);
    if (message && !GENERIC_API_MESSAGE.test(message)) return message;
  }
  return "";
};

export const getApiErrorMessage = (error, fallback = "Request failed") => {
  const status = error?.response?.status;
  const serverMessage = readableApiMessage(error?.response?.data);
  if (serverMessage) return serverMessage;

  if (status === 400 || status === 422)
    return `Please check the entered details. ${fallback}`;
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to perform this action.";
  if (status === 404) return "The requested record was not found.";
  if (status === 409) return "A record with the same email or phone number already exists.";
  if (status >= 500) return `${fallback}. The server could not complete the request. Please try again or contact support.`;

  if (!error?.response && (error?.code === "ERR_NETWORK" || error?.message === "Network Error")) {
    return `${fallback} The API server is unreachable. Please start the backend or refresh the API tunnel and try again.`;
  }

  const clientMessage = String(error?.message || "").trim();
  return clientMessage && !GENERIC_API_MESSAGE.test(clientMessage) ? clientMessage : fallback;
};

const postJson = (url, data, config) => {
  const payload = cleanPayload(data);
  return apiClient.post(url, payload, config).then(getPayload);
};

const putJson = (url, data, config) => apiClient.put(url, cleanPayload(data), config).then(getPayload);

const normalizeStatus = (status, fallback = "active") => {
  const value = String(status || fallback).trim().toLowerCase();
  if (["not_started", "not started", "pending"].includes(value)) return "active";
  if (["in-progress", "in progress"].includes(value)) return "active";
  return value;
};

const splitName = (name = "") => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
};

export const toGoalPayload = (data = {}) => ({
  title: data.title,
  ownerId: Number(data.ownerId ?? data.owner?.employeeId ?? data.employeeId),
  quarter: data.quarter,
  status: normalizeStatus(data.status, "active"),
});

export const toAssessmentPayload = (data = {}) => ({
  title: data.title,
  description: data.description ?? "",
  courseId: Number(data.courseId),
  batchId: Number(data.batchId),
  totalMarks: Number(data.totalMarks),
  passingMarks: Number(data.passingMarks ?? data.passMarks ?? data.pass),
  durationMinutes: Number(data.durationMinutes ?? data.duration),
  assessmentType: data.assessmentType ?? data.type,
  startDate: data.startDate ?? data.start,
  endDate: data.endDate ?? data.end,
});

export const toEmployeePayload = (data = {}) => {
  const names = splitName(data.name);
  return {
    firstName: data.firstName ?? names.firstName,
    lastName: data.lastName ?? names.lastName,
    email: data.email,
    phone: data.phone,
    role: data.role ?? data.designation,
    status: data.status || "Active",
    employeeType: data.employeeType ?? data.employmentType,
  };
};

export const toEmployeeCreatePayload = (data = {}) => ({
  ...toEmployeePayload(data),
});

export const toOrganizationPayload = (data = {}) => ({
  organizationName: data.organizationName ?? data.name,
  email: data.email,
  phone: data.phone,
  industry: data.industry,
  country: data.country,
  website: data.website,
  password: data.password,
  confirmPassword: data.confirmPassword,
  status: data.status ?? data.organizationStatus,
  plan: data.plan ?? data.planName,
  maxUsers: data.maxUsers ?? data.userLimit,
  approvalStatus: data.approvalStatus,
  approvalReason: data.approvalReason ?? data.reason,
  responsibleUserId: data.responsibleUserId,
  approvedBy: data.approvedBy,
  approvedAt: data.approvedAt,
  suspendedBy: data.suspendedBy,
  suspendedAt: data.suspendedAt,
  updatedAt: data.updatedAt,
  auditAction: data.auditAction,
});

export const toOrganizationCreatePayload = (data = {}) => ({
  organizationName: data.organizationName ?? data.name,
  email: data.email,
  phone: data.phone,
  industry: data.industry,
  country: data.country,
  website: data.website,
  password: data.password,
  confirmPassword: data.confirmPassword,
});

export const normalizeOrganization = (organization = {}) => {
  const id = organization.organizationId ?? organization.OrganizationId ?? organization.organizationID ?? organization.id;
  return {
    ...organization,
    id,
    organizationId: id,
    name: organization.organizationName ?? organization.name ?? "",
    organizationName: organization.organizationName ?? organization.name ?? "",
    email: organization.email ?? "",
    phone: organization.phone ?? "",
    industry: organization.industry ?? "",
    country: organization.country ?? "",
    website: organization.website ?? "",
    createdDate: organization.createdDate ?? organization.createdAt ?? "",
  };
};

export const toSubscriptionPayload = (data = {}) => ({
  planName: data.planName ?? data.plan,
  price: Number(data.price ?? data.amount),
  durationInMonths: Number(data.durationInMonths ?? data.duration),
  maxUsers: Number(data.maxUsers ?? data.seats),
  isActive: Boolean(data.isActive ?? data.active ?? true),
});

export const toBranchPayload = (data = {}) => {
  const organizationId = Number(data.organizationId ?? data.orgId ?? readStoredOrganizationId());
  const name = data.name ?? data.branchName;
  const address = data.address ?? data.branchAddress ?? data.location;
  const phone = data.phone ?? data.contactNumber ?? data.contactNo ?? data.contactPhone ?? data.contactMobile ?? data.contact ?? data.mobile ?? data.mobileNumber ?? data.mobileNo ?? data.phoneNumber ?? data.phoneNo ?? data.primaryPhone ?? data.branchContactNumber ?? data.branchContactNo ?? data.branchContactPhone ?? data.branchContactMobile ?? data.branchContact ?? data.branchPhoneNumber ?? data.branchPhone ?? data.branchMobileNumber ?? data.branchMobileNo ?? data.branchMobile;
  const city = data.city ?? data.branchCity ?? data.cityName ?? data.branchCityName ?? data.locationCity;
  if (!/^[6-9]\d{9}$/.test(String(phone ?? '').trim())) {
    throw new Error('Enter a valid Indian mobile number starting with 6, 7, 8, or 9.');
  }
  const email = data.email ?? data.emailAddress ?? data.primaryEmail ?? data.contactEmail ?? data.contactMail ?? data.branchEmail ?? data.branchContactEmail;
  return {
    organizationId,
    orgId: organizationId,
    name,
    branchName: name,
    address,
    branchAddress: address,
    location: address,
    city,
    branchCity: city,
    BranchCity: city,
    cityName: city,
    CityName: city,
    branchCityName: city,
    BranchCityName: city,
    locationCity: city,
    LocationCity: city,
    country: data.country,
    phone,
    Phone: phone,
    contactNumber: phone,
    ContactNumber: phone,
    branchContactNumber: phone,
    BranchContactNumber: phone,
    branchContactNo: phone,
    BranchContactNo: phone,
    contactNo: phone,
    ContactNo: phone,
    contactPhone: phone,
    ContactPhone: phone,
    branchContactPhone: phone,
    BranchContactPhone: phone,
    contactMobile: phone,
    ContactMobile: phone,
    branchContactMobile: phone,
    BranchContactMobile: phone,
    phoneNumber: phone,
    PhoneNumber: phone,
    phoneNo: phone,
    PhoneNo: phone,
    contact: phone,
    Contact: phone,
    mobile: phone,
    Mobile: phone,
    mobileNumber: phone,
    MobileNumber: phone,
    mobileNo: phone,
    MobileNo: phone,
    primaryPhone: phone,
    PrimaryPhone: phone,
    branchContact: phone,
    BranchContact: phone,
    branchPhone: phone,
    BranchPhone: phone,
    branchPhoneNumber: phone,
    BranchPhoneNumber: phone,
    branchMobile: phone,
    BranchMobile: phone,
    branchMobileNo: phone,
    BranchMobileNo: phone,
    branchMobileNumber: phone,
    BranchMobileNumber: phone,
    email,
    Email: email,
    emailAddress: email,
    EmailAddress: email,
    primaryEmail: email,
    PrimaryEmail: email,
    contactEmail: email,
    ContactEmail: email,
    contactMail: email,
    ContactMail: email,
    branchEmail: email,
    BranchEmail: email,
    branchContactEmail: email,
    BranchContactEmail: email,
  };
};

const readStoredObjectOrganizationId = () => {
  for (const key of ["user", "organization"]) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      const id = value?.organizationId
        ?? value?.OrganizationId
        ?? value?.orgId
        ?? value?.OrgId
        ?? value?.organization?.organizationId
        ?? value?.organization?.id
        ?? value?.organisation?.organizationId
        ?? value?.organisation?.id;
      const numericId = Number(id);
      if (Number.isInteger(numericId) && numericId > 0) return numericId;
    } catch {
      // Ignore malformed local storage values.
    }
  }

  return undefined;
};

export const readStoredOrganizationId = () => {
  const objectId = readStoredObjectOrganizationId();
  if (objectId) return objectId;

  const direct = localStorage.getItem("organization_id")
    || localStorage.getItem("organizationId")
    || localStorage.getItem("orgId");
  const directId = Number(direct);
  if (Number.isInteger(directId) && directId > 0) return directId;

  return undefined;
};

export const toDepartmentPayload = (data = {}) => ({
  organizationId: Number(data.organizationId ?? data.orgId ?? readStoredOrganizationId()),
  name: data.name,
  description: data.description,
  managerId: data.managerId ? Number(data.managerId) : null,
});

export const toDepartmentUpdatePayload = (data = {}) => ({
  name: data.name,
  description: data.description,
  managerId: data.managerId ? Number(data.managerId) : null,
});

export const toBranchUpdatePayload = (data = {}) => {
  const payload = toBranchPayload(data);
  return {
    ...payload,
    // UpdateBranchDto is scoped to mutable branch fields. Sending the
    // create-only organizationId/orgId can cause the API mapper to ignore the
    // remaining updates on stricter deployments.
    organizationId: undefined,
    orgId: undefined,
  };
};

export const toTeamPayload = (data = {}) => ({
  name: data.name,
  departmentId: Number(data.departmentId),
  managerId: data.managerId ? Number(data.managerId) : null,
});

export const toCoursePayload = (data = {}, includeStatus = false) => ({
  courseName: data.courseName ?? data.title ?? data.name,
  duration: data.duration,
  level: data.level,
  price: Number(data.courseFee ?? data.fee ?? data.price ?? 0),
  ...(includeStatus && data.status !== undefined ? { status: Boolean(data.status) } : {}),
});

export const toStudentPayload = (data = {}) => ({
  firstName: data.firstName,
  lastName: data.lastName,
  email: data.email,
  phone: data.phone,
  courseId: Number(data.courseId),
  batchId: Number(data.batchId),
});

export const toRolePayload = (data = {}) => ({
  roleName: data.roleName ?? data.name,
  description: data.description,
});

export const toRoleCompetencyPayload = (data = {}) => ({
  roleId: Number(data.roleId),
  competencyId: Number(data.competencyId),
  requiredLevel: Number(data.requiredLevel),
});

export const toSkillPayload = (data = {}) => ({
  name: data.name,
  category: data.category,
  type: data.type,
});

export const toCompetencyPayload = (data = {}) => ({
  competencyName: data.competencyName ?? data.name,
  description: data.description,
});

const getCreatePayload = (options, data) => {
  const mapper = options.toCreatePayload || options.toPayload;
  return mapper ? mapper(data) : data;
};

const getUpdatePayload = (options, data) => {
  const mapper = options.toUpdatePayload || options.toPayload;
  return mapper ? mapper(data) : data;
};

const crud = (basePath, options = {}) => ({
  list: (params) => apiClient.get(basePath, { params }).then(getListPayload),
  getById: (id, params) => apiClient.get(`${basePath}/${id}`, { params }).then(getPayload),
  create: (data) => postJson(basePath, getCreatePayload(options, data)),
  update: (id, data) => putJson(`${basePath}/${id}`, getUpdatePayload(options, data)),
  remove: (id) => apiClient.delete(`${basePath}/${id}`).then(getPayload),
});

export const employeeApi = crud(API_ENDPOINTS.organization.employees, {
  toCreatePayload: toEmployeeCreatePayload,
  toUpdatePayload: toEmployeePayload,
});
export const assessmentsApi = crud(API_ENDPOINTS.assessments.base, { toPayload: toAssessmentPayload });
export const courseApi = crud(API_ENDPOINTS.courses.base, {
  toCreatePayload: (data) => toCoursePayload(data),
  toUpdatePayload: (data) => toCoursePayload(data, true),
});
export const branchApi = crud(API_ENDPOINTS.organization.branches, {
  toCreatePayload: toBranchPayload,
  toUpdatePayload: toBranchUpdatePayload,
});
export const competencyApi = {
  ...crud("/api/Competency", { toPayload: toCompetencyPayload }),
  dashboard: () => apiClient.get("/api/Competency/dashboard").then(getPayload),
  byRole: (roleId) => apiClient.get(`/api/Competency/role/${roleId}`).then(getListPayload),
};
const departmentCrud = crud("/api/v1/organization/departments", {
  toCreatePayload: toDepartmentPayload,
  toUpdatePayload: toDepartmentUpdatePayload,
});

export const departmentApi = {
  ...departmentCrud,
  list: (params = {}) => departmentCrud.list({
    organizationId: params.organizationId ?? readStoredOrganizationId(),
    ...params,
  }),
};
export const goalsApi = {
  ...crud("/api/v1/goals", { toPayload: toGoalPayload }),
};
export const teamsApi = crud("/api/v1/organization/teams", { toPayload: toTeamPayload });
export const skillsApi = crud("/api/v1/skills", { toPayload: toSkillPayload });
export const studentApi = crud("/api/Student", { toPayload: toStudentPayload });
export const subscriptionApi = crud("/api/v1/subscriptions", { toPayload: toSubscriptionPayload });
export const roleCompetencyApi = crud("/api/RoleCompetency", { toPayload: toRoleCompetencyPayload });
export const roleApi = crud("/api/Role", { toPayload: toRolePayload });
const organizationCrud = crud(API_ENDPOINTS.organization.base, {
  toCreatePayload: toOrganizationCreatePayload,
  toUpdatePayload: toOrganizationPayload,
});
export const organizationApi = {
  ...organizationCrud,
  list: (params) => apiClient.get(API_ENDPOINTS.organization.base, { params }).then(getListPayload),
  getById: (organizationId) => apiClient.get(API_ENDPOINTS.organization.byId(organizationId)).then(getPayload),
  login: (data) => postJson(API_ENDPOINTS.organization.login, {
    email: String(data.email || data.identifier || "").trim().toLowerCase(),
    password: data.password,
  }),
};

export const superAdminOrganizationApi = {
  summary: () => apiClient.get(API_ENDPOINTS.superAdmin.organizationSummary).then(getPayload),
  list: (params) => apiClient.get(API_ENDPOINTS.superAdmin.organizations, { params }).then(getListPayload),
  getById: (organizationId) => apiClient.get(API_ENDPOINTS.superAdmin.organizationById(organizationId)).then(getPayload),
  getSubscription: (organizationId) => apiClient.get(API_ENDPOINTS.superAdmin.organizationSubscription(organizationId)).then(getPayload),
  getEmployees: (organizationId, params = {}) => apiClient
    .get(API_ENDPOINTS.superAdmin.organizationEmployees(organizationId), { params })
    .then(getListPayload),
  getEmployee: (organizationId, employeeId) => apiClient
    .get(API_ENDPOINTS.superAdmin.organizationEmployee(organizationId, employeeId))
    .then(getPayload),
};

export const dashboardApi = {
  superAdminDashboard: () => apiClient.get("/api/v1/super-admin/dashboard").then(getPayload),
  superAdminStats: () => apiClient.get("/api/v1/super-admin/stats").then(getPayload),
  organizationDashboard: (params) => apiClient.get("/api/v1/organization/dashboard", { params }).then(getPayload),
  organizationStats: (params) => apiClient.get("/api/v1/organization/stats", { params }).then(getPayload),
  employeeDashboard: () => apiClient.get("/api/v1/employee/dashboard").then(getPayload),
  employeeStats: () => apiClient.get("/api/v1/employee/stats").then(getPayload),
  studentDashboard: () => apiClient.get("/api/v1/student/dashboard").then(getPayload),
  studentStats: () => apiClient.get("/api/v1/student/stats").then(getPayload),
};

export const revenueApi = {
  monthly: (year) => apiClient.get('/api/v1/super-admin/revenue/monthly', { params: { year } }).then(getPayload),
};

export const superAdminActivityApi = {
  list: (params) => apiClient.get('/api/v1/super-admin/activity', { params }).then(getListPayload),
};

export const reportsApi = {
  hrAnalytics: () => apiClient.get("/api/v1/reports/hr-analytics").then(getPayload),
  skillsAnalytics: () => apiClient.get("/api/v1/reports/skills-analytics").then(getPayload),
  performanceAnalytics: () => apiClient.get("/api/v1/reports/performance-analytics").then(getPayload),
  workforceAnalytics: () => apiClient.get("/api/v1/reports/workforce-analytics").then(getPayload),
};

export const paymentApi = {
  // Guest checkout has no account yet, so userId is sent only when known.
  createOrder: (data) => postJson(API_ENDPOINTS.payments.createOrder, {
    ...(data.userId != null && String(data.userId).trim() !== "" ? { userId: Number(data.userId) } : {}),
    amount: Number(data.amount),
    currency: data.currency,
    couponCode: data.couponCode,
  }),
  verifyPayment: (data) => postJson(API_ENDPOINTS.payments.verify, {
    orderId: Number(data.orderId),
    paymentId: data.paymentId,
    signature: data.signature,
  }),
  validateCoupon: (data) => postJson(API_ENDPOINTS.payments.validateCoupon, {
    couponCode: data.couponCode ?? data.code,
    amount: Number(data.amount),
  }),
  getOrder: (id) => apiClient.get(API_ENDPOINTS.payments.order(id)).then(getPayload),
  paymentHistory: (params = {}) => apiClient
    .get(API_ENDPOINTS.payments.history, { params })
    .then(getListPayload),
};

export const aiApi = {
  chat: (prompt) => postJson(API_ENDPOINTS.ai.chat, { prompt }),
  generateAssessment: (payload) => postJson(API_ENDPOINTS.ai.generateAssessment, payload),
};

export default {
  employeeApi,
  assessmentsApi,
  courseApi,
  branchApi,
  competencyApi,
  dashboardApi,
  departmentApi,
  goalsApi,
  teamsApi,
  skillsApi,
  subscriptionApi,
  roleCompetencyApi,
  roleApi,
  reportsApi,
  paymentApi,
  aiApi,
  studentApi,
  organizationApi,
};
