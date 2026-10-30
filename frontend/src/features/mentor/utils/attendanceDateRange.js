const localDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const startOfWeek = (date) => {
  const value = new Date(date);
  const day = value.getDay() || 7;
  value.setHours(0, 0, 0, 0);
  value.setDate(value.getDate() - day + 1);
  return value;
};

// Every local calendar date (YYYY-MM-DD) from start to end, inclusive — the
// same key format mentorWorkAttendance normalizes record dates to.
export const listAttendanceDateKeys = (start, end) => {
  const keys = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    keys.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};

// Saturday/Sunday, matching the organization calendar's weekend convention.
export const isWeekendDate = (date) => date.getDay() === 0 || date.getDay() === 6;

export const getAttendancePeriodRange =(period, referenceDate = new Date()) => {
  const reference = new Date(referenceDate);
  let start;
  let end;

  if (period === "Week" || period === "Last Week") {
    start = startOfWeek(reference);
    if (period === "Last Week") start.setDate(start.getDate() - 7);
    end = new Date(start);
    end.setDate(end.getDate() + 6);
  } else if (period === "Last Month") {
    start = new Date(reference.getFullYear(), reference.getMonth() - 1, 1);
    end = new Date(reference.getFullYear(), reference.getMonth(), 0);
  } else {
    start = new Date(reference.getFullYear(), reference.getMonth(), 1);
    end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return { start, end, fromDate: localDateKey(start), toDate: localDateKey(end) };
};
