import { normalizeNotificationTimestamp } from "../services/localScheduleStore";

export const NOTIFICATION_CATEGORIES = ["All", "Unread", "Employees", "Courses", "Batches", "Attendance", "Live Classes", "System", "HR", "Payroll", "Leave", "Announcements"];
const text = value => typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
const words = value => text(value).replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z])([A-Z][a-z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\s+/g, " ").toLowerCase();
const key = value => words(value).replace(/\s/g, "");
const label = value => value && typeof value === "object" ? value.name ?? value.label ?? value.categoryName ?? value.typeName : value;
const aliases = {
  employee: "Employees", employees: "Employees", mentor: "Employees", mentors: "Employees", staff: "Employees",
  course: "Courses", courses: "Courses", enrollment: "Courses", enrollments: "Courses",
  batch: "Batches", batches: "Batches", attendance: "Attendance",
  liveclass: "Live Classes", liveclasses: "Live Classes", class: "Live Classes", classes: "Live Classes", recording: "Live Classes", schedule: "Live Classes",
  system: "System", hr: "HR", hruser: "HR", humanresources: "HR",
  payroll: "Payroll", salary: "Payroll", payslip: "Payroll", leave: "Leave", leaverequest: "Leave", leaves: "Leave",
  announcement: "Announcements", announcements: "Announcements",
};
// Event names from the backend's NotificationType contract. An event is not a category label.
const eventCategories = {
  LiveClassScheduled: "Live Classes", LiveClassUpdated: "Live Classes", LiveClassCancelled: "Live Classes", ClassReminder: "Live Classes", ClassStarted: "Live Classes", ClassEnded: "Live Classes", RecordingUploaded: "Live Classes",
  StudentEnrollmentApproved: "Courses", StudentEnrollmentRejected: "Courses", CourseCreated: "Courses", CourseUpdated: "Courses",
  StudentAssignedToBatch: "Batches", MentorAssignedToBatch: "Batches", BatchCreated: "Batches", BatchUpdated: "Batches",
  MentorCreated: "Employees", EmployeeCreated: "Employees", EmployeeProfileUpdated: "Employees", EmployeeDeactivated: "Employees", EmployeeDeleted: "Employees",
  HRUserCreated: "HR", LeaveRequestCreated: "Leave", LeaveApproved: "Leave", LeaveRejected: "Leave", AttendanceCorrectionRequested: "Attendance",
};
const eventByKey = Object.fromEntries(Object.entries(eventCategories).map(([name, category]) => [key(name), category]));
const categoryFor = value => aliases[key(label(value))] ?? eventByKey[key(label(value))];
export function notificationCategory(item) {
  for (const value of [item.categoryName, item.category, item.Category, item.notificationTypeName, item.notificationType, item.NotificationType, item.type, item.referenceTypeName, item.referenceType, item.ReferenceType, item.relatedModule, item.module]) {
    const category = categoryFor(value);
    if (category) return category;
  }
  // Unknown event variants can still carry a meaningful module noun. Never guess numeric enum ordinals.
  const kind = words([item.notificationTypeName, item.notificationType, item.type, item.referenceType, item.relatedModule, item.module, item.title].map(label).map(text).join(" "));
  const rules = [[/\b(hr|human resources)\b/, "HR"], [/\bleave(s| request)?\b/, "Leave"], [/\battendance\b/, "Attendance"], [/\b(payroll|salary|payslip)\b/, "Payroll"], [/\b(live class(es)?|class(es)?|recording)\b/, "Live Classes"], [/\bbatch(es)?\b/, "Batches"], [/\bcourse(s)?\b/, "Courses"], [/\b(employee(s)?|mentor(s)?)\b/, "Employees"], [/\bannouncement(s)?\b/, "Announcements"]];
  return rules.find(([pattern]) => pattern.test(kind))?.[1] ?? "System";
}
const boolean = value => {
  if (typeof value === "boolean") return value;
  if ([1, "1", "true", "read", "seen", "yes"].includes(typeof value === "string" ? value.trim().toLowerCase() : value)) return true;
  if ([0, "0", "false", "unread", "unseen", "no"].includes(typeof value === "string" ? value.trim().toLowerCase() : value)) return false;
  return undefined;
};
const personName = value => typeof value === "object" && value ? text(value.name ?? value.fullName) || [value.firstName, value.lastName].map(text).filter(Boolean).join(" ") : text(value);
export function normalizeOrganizationNotification(item = {}) {
  const raw = item.createdAt ?? item.createdDate ?? item.createdOn ?? item.timestamp ?? item.CreatedAt ?? item.CreatedDate;
  const parsed = normalizeNotificationTimestamp(raw);
  const timestamp = parsed && Number.isFinite(Date.parse(parsed)) ? parsed : null;
  const isRead = boolean(item.isRead ?? item.IsRead ?? item.read) ?? (boolean(item.unread ?? item.isUnread) == null ? boolean(item.readStatus ?? item.status) ?? false : !boolean(item.unread ?? item.isUnread));
  const priority = ({ critical: "Critical", urgent: "Critical", high: "High", medium: "Medium", normal: "Medium", low: "Low" })[key(label(item.priorityName ?? item.priority ?? item.Priority ?? item.severity))] ?? "Medium";
  return { ...item,
    id: item.notificationId ?? item.NotificationId ?? item.notificationID ?? item.id ?? item.Id,
    title: text(item.title ?? item.Title ?? item.subject) || "Notification",
    description: text(item.description ?? item.Description ?? item.message ?? item.Message ?? item.body),
    category: notificationCategory(item), priority, unread: !isRead, isRead,
    createdAt: timestamp, timestamp,
    createdBy: personName(item.createdBy ?? item.createdByEmployee ?? item.createdByMentor) || "System",
    relatedModule: text(label(item.relatedModule ?? item.module ?? item.referenceType)) || notificationCategory(item),
  };
}
const metadataOf = item => {
  const value = item.metadata ?? item.context ?? item.data ?? item.details;
  if (typeof value === "string") { try { return JSON.parse(value) ?? {}; } catch { return {}; } }
  return value && typeof value === "object" ? value : {};
};
export function notificationSearchText(item) {
  const meta = metadataOf(item);
  const values = [item.title, item.description, item.message, item.category, item.notificationType, item.referenceType, item.createdBy, item.relatedModule];
  for (const source of [item, meta]) {
    values.push(source.employeeName, source.courseName, source.batchName, source.employeeId, source.courseId, source.batchId, source.referenceId);
    for (const entity of [source.employee, source.course, source.batch]) {
      if (entity && typeof entity === "object") values.push(entity.name, entity.fullName, entity.firstName, entity.lastName, entity.title, entity.courseName, entity.batchName, entity.employeeName, entity.employeeCode, entity.id, entity.courseId, entity.batchId, entity.employeeId);
      else values.push(entity);
    }
  }
  return words(values.map(text).filter(Boolean).join(" "));
}
const inDateWindow = (item, quickFilter, now) => {
  const time = Date.parse(item.timestamp ?? item.createdAt);
  if (!Number.isFinite(time) || time > now.getTime()) return false;
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  if (quickFilter === "week") start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return time >= start.getTime();
};
export function filterNotifications(notifications, { search = "", category = "All", quickFilter = "All", priority = "All", status, now = new Date() } = {}) {
  const query = words(search);
  const wanted = categoryFor(category) ?? category;
  return notifications.filter(item => {
    if (query && !notificationSearchText(item).includes(query)) return false;
    if (wanted === "Unread" ? !item.unread : wanted !== "All" && item.category !== wanted) return false;
    if (priority !== "All" && item.priority.toLowerCase() !== text(priority).toLowerCase()) return false;
    if (status === "read" && item.unread || status === "unread" && !item.unread) return false;
    if (quickFilter === "unread-quick" && !item.unread || quickFilter === "Critical" && item.priority !== "Critical") return false;
    if (["today", "week"].includes(quickFilter) && !inDateWindow(item, quickFilter, now)) return false;
    return true;
  });
}
export const getCategoryCounts = notifications => Object.fromEntries(NOTIFICATION_CATEGORIES.map(category => [category, filterNotifications(notifications, { category }).length]));
export const getPriorityCounts = notifications => Object.fromEntries(["Critical", "High", "Medium", "Low"].map(priority => [priority, notifications.filter(item => item.priority === priority).length]));
export const getTodayCount = (notifications, now = new Date()) => notifications.filter(item => inDateWindow(item, "today", now)).length;
export const getWeekCount = (notifications, now = new Date()) => notifications.filter(item => inDateWindow(item, "week", now)).length;
