// Mentor directory helpers (Organization → Mentors): names, filter options
// and the status groups. Pure functions over the records from useTrainers.

// Names only — never ids, "[object Object]" or empty strings. `courses` holds
// names from the mentor record plus the course of every assigned batch;
// `assignedBatches` comes from GET /api/v1/organization/employees/{id}/batches.
export const uniqueNames = (values) => [...new Set(values.filter((value) => typeof value === "string").map((value) => value.trim()).filter(Boolean))];
export const courseNames = (trainer) => uniqueNames(
  (trainer.courses || []).map((course) => (typeof course === "string" ? course : course?.courseName ?? course?.name)),
);
export const batchNames = (trainer) => uniqueNames(
  (trainer.assignedBatches || []).map((batch) => batch?.batchName ?? batch?.name),
);

// Section order and copy. `status` matches useTrainers' normalized status.
export const STATUS_GROUPS = [
  { status: "Active", title: "Active Mentors", tone: "green", empty: "No active mentors." },
  { status: "On Leave", title: "On Leave Mentors", tone: "orange", empty: "No mentors are on leave." },
  { status: "Inactive", title: "Inactive Mentors", tone: "pink", empty: "No inactive mentors." },
];

export const ALL = "all";
export const EMPTY_FILTERS = { query: "", status: ALL, course: ALL, batch: ALL, type: ALL };

export const filtersActive = (filters) => Object.entries(EMPTY_FILTERS).some(([key, value]) => filters[key] !== value);

/** Options for the course, batch and employment-type filters, from real records. */
export const filterOptions = (trainers) => ({
  courses: uniqueNames(trainers.flatMap(courseNames)).sort((a, b) => a.localeCompare(b)),
  batches: uniqueNames(trainers.flatMap(batchNames)).sort((a, b) => a.localeCompare(b)),
  types: uniqueNames(trainers.map((item) => item.employmentType)).sort((a, b) => a.localeCompare(b)),
});

/** Mentors matching every filter, sorted by name. */
export function filterMentors(trainers, filters) {
  const query = filters.query.trim().toLowerCase();
  return trainers
    .filter((item) => filters.status === ALL || item.status === filters.status)
    .filter((item) => filters.course === ALL || courseNames(item).includes(filters.course))
    .filter((item) => filters.batch === ALL || batchNames(item).includes(filters.batch))
    .filter((item) => filters.type === ALL || item.employmentType === filters.type)
    .filter((item) => !query || `${item.name} ${item.email} ${item.employeeId}`.toLowerCase().includes(query))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

const to12h = (value) => {
  const match = String(value ?? "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";
  const hours = Number(match[1]);
  return `${String(((hours + 11) % 12) + 1).padStart(2, "0")}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
};
// Batch schedule line ("Mon, Wed, Fri" + "10:00 AM - 11:30 AM") from whatever
// the batch payload carries; falls back to the free-text schedule field.
export const batchSchedule = (batch = {}) => {
  const days = batch.scheduleDays ?? batch.days ?? batch.classDays;
  const dayText = Array.isArray(days) ? days.map((day) => String(day).slice(0, 3)).join(", ") : (typeof days === "string" ? days : "");
  const start = to12h(batch.startTime ?? batch.classStartTime);
  const end = to12h(batch.endTime ?? batch.classEndTime);
  return { days: dayText || batch.schedule || batch.timing || "Not scheduled", time: start && end ? `${start} - ${end}` : "" };
};

export const statusKey = (status) => (status === "Active" ? "active" : status === "On Leave" ? "leave" : "inactive");

export const initialsOf = (name = "") => name
  .split(" ")
  .filter(Boolean)
  .map((part) => part[0])
  .slice(0, 2)
  .join("")
  .toUpperCase() || "?";
