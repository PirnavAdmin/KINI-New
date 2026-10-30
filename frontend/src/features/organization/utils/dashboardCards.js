const rowsOf = (value) => Array.isArray(value) ? value.filter(row => row && typeof row === "object" && !Array.isArray(row)) : [];
const progressOf = (row) => {
  for (const key of ["percentage", "progressPercentage", "courseProgress", "progress", "completionPercentage"]) {
    const value = row?.[key];
    if ((typeof value === "number" || typeof value === "string") && String(value).trim() && Number.isFinite(Number(value))) {
      return Math.max(0, Math.min(100, Number(value)));
    }
  }
  return null;
};
const labelOf = (row) => {
  const value = row?.courseName ?? row?.course?.courseName ?? row?.course?.title ?? row?.course?.name
    ?? (typeof row?.course === "string" && row.course !== "—" ? row.course : null);
  return typeof value === "string" || typeof value === "number" ? String(value) : null;
};
const courseIdOf = (row) => row?.courseId ?? row?.course?.courseId ?? row?.course?.id;
const belongsTo = (row, organizationId) => {
  const owner = row.organizationId ?? row.OrganizationId ?? row.orgId ?? row.organization?.id ?? row.organization?.organizationId;
  return owner == null || String(owner) === String(organizationId);
};
const eligible = (row) => !["pending", "pendingapproval", "pendingenrollmentapproval", "awaitingapproval", "rejected", "declined", "cancelled", "canceled", "inactive", "disabled", "archived"]
  .includes(String(row.enrollmentStatus ?? row.approvalStatus ?? row.status ?? "active").toLowerCase().replace(/[\s_-]/g, ""));

// Use the Classes workspace's normalized instants and lifecycle statuses.
// Rebuilding these from startDate + HH:mm loses explicit offsets and seconds.
export function buildDashboardSchedule(classes, now = new Date()) {
  const timestamp = value => {
    const parsed = value ? new Date(value).getTime() : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  };
  const nowMs = now.getTime();
  const upcoming = rowsOf(classes).filter(row => {
    if (row.status === "live") return true;
    if (!["scheduled", "upcoming"].includes(row.status)) return false;
    const start = timestamp(row.startAt);
    const end = timestamp(row.endAt);
    return start != null && (start >= nowMs || (end != null && end > nowMs));
  }).sort((a, b) => Number(b.status === "live") - Number(a.status === "live")
    || (timestamp(a.startAt) ?? Infinity) - (timestamp(b.startAt) ?? Infinity));
  const formatTime = value => timestamp(value) == null ? "Time not set"
    : new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date(value)).toUpperCase();
  const dayKey = value => new Date(value).toLocaleDateString("en-CA");
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateLabel = value => timestamp(value) == null ? "Date unavailable" : dayKey(value) === dayKey(now) ? "Today"
    : dayKey(value) === dayKey(tomorrow) ? "Tomorrow"
      : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value));
  const queryOf = row => [row.title, row.batchName].filter(Boolean).join(" ");
  const upcomingClasses = upcoming.slice(0, 4).map(row => ({
    id: row.id,
    title: row.title,
    course: row.courseName,
    batch: row.batchName,
    mentor: row.mentorName,
    date: row.startAt,
    dateLabel: dateLabel(row.startAt),
    time: formatTime(row.startAt),
    state: row.status,
    query: queryOf(row),
  }));
  // A class scheduled on a later day belongs in Upcoming Classes, rather
  // than taking over the Current Session card before that day's sessions.
  const session = upcoming.find(row => row.status === "live"
    || (timestamp(row.startAt) != null && dayKey(row.startAt) === dayKey(now)));
  const duration = session && timestamp(session.endAt) != null && timestamp(session.startAt) != null
    ? (timestamp(session.endAt) - timestamp(session.startAt)) / 60000 : null;
  return {
    upcomingClasses,
    liveSession: session ? {
      id: session.id,
      title: session.title,
      subtitle: session.courseName !== "-" ? session.courseName : session.batchName,
      mentor: session.mentorName,
      start: formatTime(session.startAt),
      duration: duration > 0 ? `${Math.floor(duration / 60)}h ${String(Math.round(duration % 60)).padStart(2, "0")}m` : null,
      participants: session.studentsCount ?? null,
      state: session.status,
      query: queryOf(session),
    } : null,
  };
}

// Reuse the Student Profile's enrollment and progress APIs. Keep missing
// measurements unknown; an empty, successfully loaded organization is 0%.
export async function loadDashboardLearning(students, { available, organizationId, getEnrollments, getProgress }) {
  const empty = { completed: available ? 0 : null, inProgress: available ? 0 : null, notStarted: available ? 0 : null, overall: available ? 0 : null, current: null, unreported: 0 };
  if (!available) return empty;
  const results = [];
  const queue = rowsOf(students).filter(row => belongsTo(row, organizationId) && eligible(row));
  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const student = queue[next++];
      const id = student.studentId ?? student.id;
      let enrollmentLoaded = Array.isArray(student.enrollments) || Array.isArray(student.courses);
      let enrollments = rowsOf(student.enrollments ?? student.courses);
      if (!enrollments.length && id != null) {
        try {
          const response = await getEnrollments(id);
          enrollments = rowsOf(response?.data);
          enrollmentLoaded = Array.isArray(response?.data);
        } catch { /* The student's primary enrollment is still authoritative. */ }
      }
      const primaryId = courseIdOf(student);
      const primaryBatch = student.batchId ?? student.batch?.id ?? student.batch?.batchId;
      if ((primaryId != null || primaryBatch != null || labelOf(student)) && !enrollments.some(row =>
        (primaryId != null && String(courseIdOf(row)) === String(primaryId))
          || (primaryBatch != null && String(row.batchId ?? row.batch?.id) === String(primaryBatch)),
      )) enrollments.unshift(student);
      enrollments = enrollments.filter(row => belongsTo(row, organizationId) && eligible(row));
      enrollments = [...new Map(enrollments.map((row, index) => [String(courseIdOf(row) ?? row.enrollmentId ?? row.batchId ?? `row-${index}`), row])).values()];
      // An absent endpoint must not be mistaken for zero eligible enrollments.
      if (!enrollments.length && !enrollmentLoaded) { results.push({ value: null }); continue; }
      const inlineProgress = row => progressOf(row) ?? (primaryId != null
        && String(courseIdOf(row)) === String(primaryId) ? progressOf(student) : null);
      let progress = null;
      if (enrollments.some(row => inlineProgress(row) == null) && id != null) {
        try { progress = (await getProgress(id))?.data; } catch { /* Show unavailable, never invent 0%. */ }
      }
      const courseProgress = rowsOf(progress?.courses ?? progress?.courseProgress ?? progress?.enrollments)
        .filter(row => belongsTo(row, organizationId));
      for (const enrollment of enrollments) {
        const courseId = courseIdOf(enrollment);
        const measured = courseProgress.find(row => courseId != null && String(courseIdOf(row)) === String(courseId));
        // A student's aggregate percentage cannot be assigned to every course.
        const value = progressOf(measured) ?? inlineProgress(enrollment)
          ?? (enrollments.length === 1 ? progressOf(progress) : null);
        results.push({ value, name: labelOf(enrollment) ?? (courseId != null ? `Course #${courseId}` : null) });
      }
    }
  };
  // Bound concurrent requests for large organizations rather than issuing a
  // burst of two requests for every student at once.
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker));
  const measured = results.filter(row => row.value != null);
  const unreported = results.length - measured.length;
  const courses = new Map();
  measured.filter(row => row.name && row.value < 100).forEach(row => {
    const entry = courses.get(row.name) ?? { total: 0, count: 0 };
    courses.set(row.name, { total: entry.total + row.value, count: entry.count + 1 });
  });
  const [current] = [...courses.entries()].sort((a, b) => b[1].count - a[1].count);
  const count = predicate => measured.length || !unreported ? measured.filter(predicate).length : null;
  return {
    completed: count(row => row.value >= 100),
    inProgress: count(row => row.value > 0 && row.value < 100),
    notStarted: count(row => row.value === 0),
    overall: unreported ? null : measured.length ? Math.round(measured.reduce((sum, row) => sum + row.value, 0) / measured.length) : 0,
    current: current ? { name: current[0], value: Math.round(current[1].total / current[1].count) } : null,
    unreported,
  };
}
