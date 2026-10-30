// Display helpers for employee cards. normalizeEmployee() (EmployeeManagement)
// fills missing labels with "-" or "Department #id"; those are not real values
// and are never shown as if they were.

export const realValue = (value) => {
  const text = value === undefined || value === null ? "" : String(value).trim();
  return text && text !== "-" && text !== "—" && !/^(department|branch) #\d+$/i.test(text) ? text : "";
};

export const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date)
    : "";
};

export const employeeDisplayName = (employee) =>
  realValue(employee?.name)
  || [employee?.firstName, employee?.lastName].map(realValue).filter(Boolean).join(" ")
  || "Unnamed employee";

/** Initials from the real name; "?" when the API returned no name. */
export const employeeInitials = (employee) => {
  const name = employeeDisplayName(employee);
  if (name === "Unnamed employee") return "?";
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0][0]}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`.toUpperCase();
};

// Each person keeps one pale tint of their own (identity, not data): six
// hues about 60 degrees apart, chosen by a stable hash of the name so a card
// keeps its colour when the list is sorted, filtered or paged.
const AVATAR_TONES = [
  { bg: "#e6eef8", fg: "#133b5d" },
  { bg: "#e7f6ee", fg: "#1f6b46" },
  { bg: "#fdf0dc", fg: "#8a4b0b" },
  { bg: "#fde9ef", fg: "#9d2449" },
  { bg: "#eeeafd", fg: "#4b3a9a" },
  { bg: "#e3f4f6", fg: "#11616b" },
];
export const avatarToneFor = (employee) => {
  let hash = 0;
  for (const char of employeeDisplayName(employee)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TONES[hash % AVATAR_TONES.length];
};
